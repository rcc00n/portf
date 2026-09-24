"""Shared route contract; only the HTML head is rendered, never the React page."""
import html
import json
import re
from pathlib import Path
from urllib.parse import urlsplit

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

CONTRACT = json.loads(Path(__file__).with_name('route_metadata.json').read_text())
ROUTES = CONTRACT['routes']
HEAD_PATTERN = re.compile(r'<!--raccn-head:start-->[\s\S]*?<!--raccn-head:end-->')


def canonical_origin():
    origin = settings.CANONICAL_ORIGIN.rstrip('/')
    parsed = urlsplit(origin)
    if parsed.scheme not in ('http', 'https') or not parsed.netloc or parsed.path or parsed.query or parsed.fragment or parsed.username or parsed.password:
        raise ImproperlyConfigured('DJANGO_CANONICAL_ORIGIN must be an HTTP(S) origin without path, credentials, query or fragment.')
    return origin


def case_project(slug):
    from projects.models import Project
    from projects.publication import CASE_ROUTES
    if slug not in CASE_ROUTES:
        return None
    return Project.objects.filter(slug=slug, is_published=True).values('slug', 'title', 'blurb', 'is_published').first()


def route_metadata(path, project=None, status='ready'):
    path = path.split('?')[0].split('#')[0].rstrip('/') or '/'
    meta = ROUTES.get(path)
    if meta and meta.get('caseSlug'):
        meta = CONTRACT['unavailable'] if status == 'error' else (
            {'title': f"{project['title']} — {CONTRACT['siteName']}", 'description': project.get('blurb') or ''}
            if project and project.get('slug') == meta['caseSlug'] and project.get('is_published') is True
            else CONTRACT['notFound']
        )
    found = meta is not None and meta is not CONTRACT['notFound'] and meta is not CONTRACT['unavailable']
    return {'image': CONTRACT['image'], **(meta or CONTRACT['notFound']), 'path': path, 'canonical': path if found else None}


def render_head(meta):
    origin = canonical_origin()
    esc = lambda value: html.escape(str(value), quote=True)
    tags = {
        'description': meta['description'], 'robots': 'noindex, follow' if meta.get('noindex') else 'index, follow',
        'raccn:canonical-origin': origin, 'raccn:route': meta['path'],
        'og:type': 'website', 'og:site_name': CONTRACT['siteName'], 'og:title': meta['title'],
        'og:description': meta['description'], 'og:url': origin + meta['canonical'] if meta['canonical'] else None,
        'og:image': origin + meta['image'], 'og:image:width': '1200', 'og:image:height': '630', 'og:image:alt': CONTRACT['imageAlt'],
        'twitter:card': 'summary_large_image', 'twitter:title': meta['title'], 'twitter:description': meta['description'],
        'twitter:image': origin + meta['image'], 'twitter:image:alt': CONTRACT['imageAlt'],
    }
    lines = [f"<title>{esc(meta['title'])}</title>"]
    for key, value in tags.items():
        if value is not None:
            attribute = 'property' if key.startswith('og:') else 'name'
            lines.append(f'<meta {attribute}="{key}" content="{esc(value)}" />')
    if meta['canonical']:
        lines.append(f'<link rel="canonical" href="{esc(origin + meta["canonical"])}" />')
    fonts = ['instrument-sans-latin.woff2', 'ibm-plex-mono-400-latin.woff2']
    if meta['path'] in ('/', '/start', '/start/define'):
        fonts.append('ibm-plex-mono-500-latin.woff2')
    lines.extend(f'<link rel="preload" href="/fonts/{font}" as="font" type="font/woff2" crossorigin />' for font in fonts)
    return '\n'.join(lines)


def render_document(document, meta):
    if len(HEAD_PATTERN.findall(document)) != 1:
        raise ValueError('Frontend build must contain one RACCN metadata head region.')
    return HEAD_PATTERN.sub(lambda _: '<!--raccn-head:start-->\n' + render_head(meta) + '\n<!--raccn-head:end-->', document)
