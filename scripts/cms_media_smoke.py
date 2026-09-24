"""Production-like integration regression: built Vite + Gunicorn + isolated SQLite/media.
Run after npm --prefix app run build. Requires backend and app/tests requirements.
No production data, external notifications or deployment are touched.
"""
from concurrent.futures import ThreadPoolExecutor
import json
import os
from pathlib import Path
import socket
import secrets
import subprocess
import sys
import tempfile
import time
import urllib.request

REPO = Path(__file__).resolve().parents[1]


def db(action):
    # Playwright runs an event loop; keep Django ORM writes in a separate thread.
    def perform():
        from django.db import connections
        try:
            return action()
        finally:
            connections.close_all()
    with ThreadPoolExecutor(max_workers=1) as executor:
        return executor.submit(perform).result()


def run(root):
    with socket.socket() as listener:
        listener.bind(('127.0.0.1', 0))
        port = listener.getsockname()[1]
    base = f'http://127.0.0.1:{port}'
    os.environ.update({
        'DJANGO_ENV':'test', 'DJANGO_SETTINGS_MODULE':'config.settings', 'DJANGO_DEBUG':'false',
        'DJANGO_SERVE_MEDIA':'true', 'DJANGO_DB_SSL':'false',
        'DJANGO_SECURE_SSL_REDIRECT':'false', 'DJANGO_ALLOWED_HOSTS':'127.0.0.1,localhost,testserver',
        'DJANGO_SESSION_COOKIE_SECURE':'false', 'DJANGO_CSRF_COOKIE_SECURE':'false',
        'DJANGO_FRONTEND_DIST_DIR':str(REPO / 'app/dist'), 'DJANGO_MEDIA_ROOT':str(root / 'media'),
        'DATABASE_URL':f'sqlite:///{root / "db.sqlite3"}', 'TELEGRAM_BOT_TOKEN':'',
        'DJANGO_SECRET_KEY':secrets.token_urlsafe(48),
    })
    sys.path.insert(0, str(REPO / 'backend'))
    import django
    django.setup()
    from django.core.management import call_command
    from django.core.files.base import ContentFile
    from projects.models import Project, ProjectImage, ProjectLink
    from playwright.sync_api import sync_playwright, expect
    call_command('migrate', verbosity=0, interactive=False)
    renter=Project.objects.create(slug='renter', title='Renter', headline='One market.\nTwo control\nsurfaces.', impact='Rental marketplace', blurb='Local verification fixture using the approved evidence media.', status='Local verification only', is_published=True, featured_placement='lead')
    def attach(project, path, alt, order=0):
        return ProjectImage.objects.create(project=project, image=ContentFile((REPO / path).read_bytes(), name=Path(path).name), alt=alt, order=order)
    market=attach(renter, 'app/public/evidence/renter/customer.webp', 'CMS customer evidence')
    control=attach(renter, 'app/public/evidence/renter/operator.webp', 'CMS operator evidence', 1)
    first=Project.objects.create(slug='cms-first', title='CMS first', impact='Verified fixture type', blurb='First fixture description', is_published=True, featured_placement='supporting', featured_order=1, order=1)
    second=Project.objects.create(slug='cms-second', title='CMS second', is_published=True, featured_placement='supporting', featured_order=2, order=2)
    other=Project.objects.create(slug='cms-archive', title='Renter WorldDoc motorcycle doctor finder', is_published=True, order=3)
    pic=attach(first, 'app/public/home/media/worlddoc.webp', 'Owner-provided catalog alt')
    attach(second, 'app/public/home/media/bad-guy-motors.webp', 'Second fixture evidence')
    ProjectLink.objects.create(project=first, label='CMS link', href='https://example.org/cms', order=1)
    logs=(root/'gunicorn.log').open('w+')
    process=subprocess.Popen([sys.executable,'-m','gunicorn','--config',str(REPO/'backend/gunicorn.conf.py'),'config.wsgi:application','--chdir',str(REPO/'backend'),'--bind',f'127.0.0.1:{port}','--workers','1'], env=os.environ.copy(), stdout=logs, stderr=logs)
    try:
        for _ in range(100):
            try:
                urllib.request.urlopen(base+'/health/',timeout=1).close()
                break
            except OSError:
                if process.poll() is not None: raise RuntimeError('Gunicorn failed to start')
                time.sleep(.1)
        else: raise RuntimeError('Gunicorn readiness timeout')
        with sync_playwright() as p:
            browser=p.chromium.launch(headless=True)
            if os.getenv('RACCN_MEASURE_LABEL'):
                from measure_site_resources import measure
                measure(browser,base,os.environ['RACCN_MEASURE_LABEL'])
            page=browser.new_page(viewport={'width':1440,'height':1000}, reduced_motion='reduce')
            errors=[]
            policy_errors=[]
            page.on('console', lambda message: policy_errors.append(message.text) if 'Content Security Policy' in message.text or 'violates the following' in message.text else None)
            page.on('pageerror',lambda error:errors.append(str(error)))
            api=page.request.get(base+'/api/projects/').json()
            assert [item['slug'] for item in api]==['renter','cms-first','cms-second','cms-archive']
            # Gunicorn must not independently turn an untrusted protocol header into HTTPS.
            spoofed=page.request.get(base+'/api/projects/',headers={'X-Forwarded-Proto':'https','X-Forwarded-For':'203.0.113.250'}).json()
            assert spoofed[0]['media'][0]['url'].startswith(base+'/media/')
            url=api[0]['media'][0]['url']
            media=page.request.get(url)
            assert media.status==200 and media.headers['content-type']=='image/webp'
            assert media.headers['cache-control']=='public, max-age=0, must-revalidate'
            assert page.request.get(url,headers={'If-None-Match':media.headers['etag']}).status==304
            assert page.request.get(base+'/media/projects/not-found.webp').status==404
            assert page.request.get(base+'/assets/missing.js').status==404
            routes=['/','/work','/work/renter','/systems','/systems/architecture','/systems/decisions','/systems/demo','/approach','/start','/start/define','/privacy','/terms']
            for route in routes:
                response=page.goto(base+route)
                assert response.status==200,(route,response.status)
                try:
                    page.locator('h1').wait_for(state='attached')
                except Exception as exc:
                    raise AssertionError({'route':route, 'page_errors':errors, 'csp_errors':policy_errors, 'title':page.title()}) from exc
            assert page.request.get(base+'/ready/').json()=={'ok':True}
            page.goto(base+'/')
            expect(page.locator('.hp-wordmark')).to_be_visible()
            core=page.locator('.hp-control-plane [role="button"]')
            core.focus();core.press('Enter')
            expect(page.locator('.hp-control-plane')).to_have_attribute('data-control','active')
            core.press('Space')
            expect(page.locator('.hp-control-plane')).to_have_attribute('data-control','ready')
            page.emulate_media(reduced_motion='no-preference')
            core.press('Enter')
            expect(page.locator('.hp-topology-sheet').first).to_be_visible()
            assert page.locator('.hp-topology-sheet').first.evaluate('(img)=>img.complete && img.naturalWidth>0')
            page.wait_for_timeout(1600)
            expect(page.locator('.hp-topology-sheet')).to_have_count(0)
            page.emulate_media(reduced_motion='reduce')
            expect(page.locator('[data-project-slug="renter"]')).to_have_count(1)
            page.locator('#work').scroll_into_view_if_needed()
            expect(page.locator('.hp-secondary-work img').first).to_have_attribute('alt','Owner-provided catalog alt')
            page.locator('.hp-secondary-work img').first.scroll_into_view_if_needed()
            expect(page.locator('.hp-secondary-work img').first).to_have_attribute('src', base+pic.image.url)
            page.screenshot(path='/tmp/raccn-cms-home-desktop.png')
            page.goto(base+'/work')
            expect(page.locator('[data-project-slug]')).to_have_count(4)
            assert page.locator('[data-project-slug]').evaluate_all('(els)=>els.map(e=>e.dataset.projectSlug)')==['renter','cms-first','cms-second','cms-archive']
            expect(page.get_by_role('link',name='CMS link')).to_have_attribute('href','https://example.org/cms')
            assert page.locator('[data-project-slug="cms-first"] img').get_attribute('src').endswith(pic.image.url)
            second.featured_order=0;second.order=0;db(second.save)
            replacement=db(lambda:attach(first,'app/public/evidence/renter/operator.webp','Changed CMS image',0))
            pic.order=10;db(pic.save)
            page.reload()
            expect(page.locator('[data-project-slug]')).to_have_count(4)
            assert page.locator('[data-project-slug]').evaluate_all('(els)=>els.map(e=>e.dataset.projectSlug)')==['renter','cms-second','cms-first','cms-archive']
            expect(page.locator('[data-project-slug="cms-first"] img')).to_have_attribute('alt','Changed CMS image')
            assert page.locator('[data-project-slug="cms-first"] img').get_attribute('src').endswith(replacement.image.url)
            page.goto(base+'/')
            page.locator('#work').scroll_into_view_if_needed()
            expect(page.locator('[data-project-slug="cms-first"] img')).to_have_attribute('alt','Changed CMS image')
            assert page.locator('.hp-secondary-work [data-project-slug]').evaluate_all('(els)=>els.map(e=>e.dataset.projectSlug)')==['cms-second','cms-first']
            page.set_viewport_size({'width':390,'height':844})
            for route in ['/','/work','/work/renter']:
                page.goto(base+route)
                page.locator('h1').wait_for(state='attached')
                expect(page.locator('[data-project-slug="renter"]') if route!='/work/renter' else page.locator('.site-case-lead')).to_have_count(1)
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'),route
            for image in page.locator('.site-evidence img').all():
                image.scroll_into_view_if_needed()
                page.wait_for_function('(image)=>image.complete && image.naturalWidth>0', arg=image.element_handle())
            page.screenshot(path='/tmp/raccn-cms-case-mobile.png', full_page=True)
            first.is_published=False;db(first.save)
            renter.is_published=False;db(renter.save)
            for route in ['/','/work']:
                page.goto(base+route)
                expect(page.locator('[data-project-slug="cms-second"]')).to_have_count(1)
                expect(page.locator('[data-project-slug="renter"]')).to_have_count(0)
                expect(page.locator('[data-project-slug="cms-first"]')).to_have_count(0)
            assert page.goto(base+'/work/renter').status==404
            expect(page.get_by_text('This route',exact=False).first).to_be_visible()
            assert page.request.get(base+'/work/not-a-real-case').status==404
            page.goto(base+'/systems')
            expect(page.get_by_text('Project comparison is not currently published.')).to_be_visible()
            expect(page.locator('#control img')).to_have_count(0)
            assert page.request.get(base+market.image.url).status==404
            assert page.request.get(base+control.image.url).status==404
            assert page.request.get(base+db(lambda:second.images.first().image.url)).status==200
            db(lambda:Project.objects.update(is_published=False))
            page.goto(base+'/work')
            expect(page.locator('[data-catalog-state="empty"]')).to_be_visible()
            expect(page.locator('[data-project-slug]')).to_have_count(0)
            page.route('**/api/projects/',lambda route:route.fulfill(status=503,json={'error':'Temporary fixture failure'}))
            page.reload()
            expect(page.locator('[data-catalog-state="error"]')).to_be_visible()
            expect(page.locator('[data-project-slug]')).to_have_count(0)
            page.unroute('**/api/projects/')
            page.get_by_role('button',name='Try again').click()
            expect(page.locator('[data-catalog-state="empty"]')).to_be_visible()
            assert not errors,errors
            assert not policy_errors,policy_errors
            browser.close()
            print(json.dumps({'result':'PASS','server':'Gunicorn','DEBUG':False,'SERVE_MEDIA':True,'canonical_routes':len(routes),'media_mime':media.headers['content-type'],'media_cache':media.headers['cache-control'],'checks':['publish','API metadata','desktop/mobile rendering','ordering update','media update','unpublish','case 404','missing media 404','empty vs failure','retry','Control Plane keyboard/reduced motion'],'database':'isolated temporary SQLite','production_records_modified':False},indent=2))
    finally:
        process.terminate()
        process.wait(timeout=10)
        logs.close()


if __name__=='__main__':
    with tempfile.TemporaryDirectory(prefix='raccn-cms-smoke-') as directory:
        run(Path(directory))
