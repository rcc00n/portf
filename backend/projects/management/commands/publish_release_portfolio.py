"""Explicit, repeatable owner-selected catalog import. Never runs on web startup."""
import json
from pathlib import Path

from django.core.files import File
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from projects.models import Project, ProjectImage, ProjectLink

SOURCE = Path(__file__).resolve().parents[2] / "release_portfolio"


class Command(BaseCommand):
    help = "Preview or apply the reviewed six-project release catalog; retain previous records and media."

    def add_arguments(self, parser):
        parser.add_argument("--apply", action="store_true")
        parser.add_argument("--replace-selection", action="store_true", help="Unpublish other projects; never delete their records or media.")
        parser.add_argument("--map", action="append", default=[], metavar="SLUG:ID", help="Explicitly adopt a verified existing legacy record.")

    def handle(self, *args, **options):
        manifest = json.loads((SOURCE / "manifest.json").read_text())
        rows = manifest["projects"]
        slugs = [row["slug"] for row in rows]
        if manifest["version"] != 1 or len(slugs) != len(set(slugs)):
            raise CommandError("Invalid release manifest.")
        mapping = {}
        for value in options["map"]:
            slug, separator, pk = value.partition(":")
            if not separator or slug not in slugs or not pk.isascii() or not pk.isdecimal() or int(pk) < 1 or slug in mapping:
                raise CommandError("Each mapping must be a unique manifest slug and positive record ID.")
            mapping[slug] = int(pk)
        if len(set(mapping.values())) != len(mapping):
            raise CommandError("One existing record cannot become two projects.")
        # Validate the complete plan before any database or media mutation.
        for row in rows:
            if row["slug"] in mapping:
                existing = Project.objects.filter(pk=mapping[row["slug"]]).first()
                if not existing or existing.title != row["expected_title"] or existing.slug not in {row["slug"], f"project-{existing.pk}"}:
                    raise CommandError("Mapped record does not match its reviewed identity; no changes applied.")
                if Project.objects.filter(slug=row["slug"]).exclude(pk=existing.pk).exists():
                    raise CommandError("Slug is already owned by another record; no changes applied.")
            for image in row["images"]:
                source = SOURCE / "media" / image["file"]
                if source.parent != SOURCE / "media" or not source.is_file():
                    raise CommandError("Release media missing or outside the reviewed directory.")
        mode = "APPLY" if options["apply"] else "PREVIEW"
        self.stdout.write(f"{mode}: {', '.join(slugs)}; unpublish other records: {options['replace_selection']}")
        if not options["apply"]:
            self.stdout.write("No data or files changed. Pass --apply only after backup and identity review.")
            return
        with transaction.atomic():
            selected = []
            for order, row in enumerate(rows):
                project = (Project.objects.select_for_update().get(pk=mapping[row["slug"]]) if row["slug"] in mapping
                           else Project.objects.select_for_update().filter(slug=row["slug"]).first()) or Project()
                for field in ["slug", "title", "impact", "blurb", "status", "featured_placement"]:
                    setattr(project, field, row[field])
                project.url = ""
                project.headline = ""
                project.order = project.featured_order = order
                project.is_published = True
                project.full_clean()
                project.save()
                selected.append(project.pk)
                # Dedicated release prefix makes retries stable without replacing originals.
                prefix = f"projects/{project.pk}/release-20261125-"
                if not project.images.filter(image__startswith=prefix).exists():
                    for index, image in enumerate(project.images.all()):
                        image.order = len(row["images"]) + index
                        image.save(update_fields=["order"])
                for index, image in enumerate(row["images"]):
                    filename = f"release-20261125-{image['file']}"
                    record = project.images.filter(image=f"projects/{project.pk}/{filename}").first()
                    if not record:
                        record = ProjectImage(project=project)
                        # A previous interrupted transaction may have left this exact file.
                        name = f"projects/{project.pk}/{filename}"
                        if record.image.storage.exists(name):
                            record.image.name = name
                        else:
                            with (SOURCE / "media" / image["file"]).open("rb") as contents:
                                record.image.save(filename, File(contents), save=False)
                    record.alt, record.order = image["alt"], index
                    record.full_clean()
                    record.save()
                for index, link in enumerate(row["links"]):
                    record, _ = ProjectLink.objects.get_or_create(project=project, href=link["href"], defaults={"label": link["label"], "order": index})
                    record.label, record.order = link["label"], index
                    record.full_clean()
                    record.save()
                # Only URLs explicitly retired by the owner; other CMS links survive.
                project.links.filter(href__in=row.get("retired_links", [])).delete()
                self.stdout.write(f"Published {project.slug} (record {project.pk}, {project.images.count()} images)")
            if options["replace_selection"]:
                count = Project.objects.exclude(pk__in=selected).filter(is_published=True).update(is_published=False)
                self.stdout.write(f"Unpublished {count} other records; retained all records, links and files.")
