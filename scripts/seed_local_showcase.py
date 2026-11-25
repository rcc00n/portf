"""Load the two approved work examples into the local development CMS only."""
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, str(ROOT / 'backend'))

import django

django.setup()
from django.conf import settings
from django.core.files import File
from django.db import transaction
from projects.models import Project, ProjectImage

if settings.ENVIRONMENT != 'development' or settings.DATABASES['default']['ENGINE'] != 'django.db.backends.sqlite3':
    raise SystemExit('This preview loader requires DJANGO_ENV=development and local SQLite.')

PROJECTS = [
    dict(slug='rentino', title='Rentino', impact='Peer-to-peer marketplace',
         blurb='Own the project. Rent the tools. A neighbourhood marketplace connecting renters and tool owners across Edmonton and Calgary.',
         url='https://rentino.org/', alt='Rentino homepage with local tool discovery and rental categories'),
    dict(slug='bad-guy-motors', title='Bad Guy Motors', impact='Automotive / Commerce & booking',
         blurb='Built with attitude. Made for the road. Custom fabrication, performance parts and service booking for an Alberta automotive shop.',
         url='https://badguymotors.com/', alt='Bad Guy Motors website with performance services and custom vehicle builds'),
]

with transaction.atomic():
    for index, entry in enumerate(PROJECTS):
        values = entry.copy()
        slug, alt = values.pop('slug'), values.pop('alt')
        project, _ = Project.objects.update_or_create(slug=slug, defaults={
            **values, 'is_published': True, 'featured_placement': 'supporting',
            'featured_order': index, 'order': index, 'status': 'Live website',
        })
        picture = project.images.filter(order=0).first() or ProjectImage(project=project, order=0)
        if not picture.image or not picture.image.storage.exists(picture.image.name):
            with (ROOT / 'docs/local-preview/media' / f'{slug}.webp').open('rb') as source:
                picture.image.save(f'{slug}.webp', File(source), save=False)
        picture.alt = alt
        picture.full_clean()
        picture.save()
        print(f'Local CMS: {project.title}')
