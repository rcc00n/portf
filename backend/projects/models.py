from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


def project_image_upload_to(instance, filename):
    return f"projects/{instance.project_id}/{filename}"


class Project(models.Model):
    title = models.CharField(max_length=200)
    impact = models.CharField(max_length=120, blank=True)
    blurb = models.TextField(blank=True)
    url = models.URLField(blank=True)
    tags = models.JSONField(default=list, blank=True, help_text='JSON list, e.g. ["React", "Django"]')
    is_published = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0, help_text="Lower numbers appear first")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "-created_at"]

    def __str__(self):
        return self.title


class ProjectLink(models.Model):
    project = models.ForeignKey(Project, related_name="links", on_delete=models.CASCADE)
    label = models.CharField(max_length=80)
    href = models.URLField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.label} -> {self.href}"


class ProjectImage(models.Model):
    project = models.ForeignKey(Project, related_name="images", on_delete=models.CASCADE)
    image = models.ImageField(upload_to=project_image_upload_to)
    alt = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.image.name


class PricingTier(models.Model):
    tier = models.CharField(max_length=120)
    price = models.CharField(max_length=40)
    info = models.CharField(max_length=200, blank=True)
    featured = models.BooleanField(default=False)
    order = models.PositiveSmallIntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        unique=True,
        help_text="Slot number from 1 to 5 (unique).",
    )

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.order}. {self.tier}"


class PricingPoint(models.Model):
    tier = models.ForeignKey(PricingTier, related_name="points", on_delete=models.CASCADE)
    text = models.CharField(max_length=160)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.text
