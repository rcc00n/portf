"""Built Django/Vite raw/client parity and crawler regression; temporary CMS/media only."""
from concurrent.futures import ThreadPoolExecutor
import json
import os
from pathlib import Path
import secrets
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request
from xml.etree import ElementTree

REPO = Path(__file__).resolve().parents[1]


def db(action):
    def perform():
        from django.db import connections
        try: return action()
        finally: connections.close_all()
    with ThreadPoolExecutor(max_workers=1) as executor:
        return executor.submit(perform).result()


def run(root):
    with socket.socket() as listener:
        listener.bind(('127.0.0.1', 0))
        port=listener.getsockname()[1]
    base=f'http://127.0.0.1:{port}'
    origin='https://canonical.example'
    os.environ.update({
        'DJANGO_ENV':'test', 'DJANGO_SETTINGS_MODULE':'config.settings','DJANGO_DEBUG':'false','DJANGO_DB_SSL':'false',
        'DJANGO_SECURE_SSL_REDIRECT':'false','DJANGO_ALLOWED_HOSTS':'127.0.0.1,localhost,testserver',
        'DJANGO_FRONTEND_DIST_DIR':str(REPO/'app/dist'),'DJANGO_MEDIA_ROOT':str(root/'media'),
        'DJANGO_SERVE_MEDIA':'true','DJANGO_CANONICAL_ORIGIN':origin,
        'DATABASE_URL':f'sqlite:///{root / "db.sqlite3"}','TELEGRAM_BOT_TOKEN':'','DJANGO_SECRET_KEY':secrets.token_urlsafe(48),
    })
    sys.path.insert(0,str(REPO/'backend'))
    import django
    django.setup()
    from django.core.management import call_command
    from django.core.files.base import ContentFile
    from config.metadata import ROUTES, route_metadata
    from config.test_metadata import Head
    from projects.models import Project, ProjectImage
    from playwright.sync_api import sync_playwright, expect
    call_command('migrate',verbosity=0,interactive=False)
    project=Project.objects.create(slug='renter',title='Reviewed Renter',blurb='Owner-provided case copy.',is_published=True,featured_placement='lead')
    for i, name in enumerate(('customer','operator')):
        ProjectImage.objects.create(project=project,image=ContentFile((REPO/f'app/public/evidence/renter/{name}.webp').read_bytes(),name=f'{name}.webp'),alt=f'Reviewed {name} evidence',order=i)
    project_data={'slug':'renter','title':project.title,'blurb':project.blurb,'is_published':True}
    # Executable parity check: the two renderers consume the exact same JSON contract.
    node="import {getMetaForPath} from './app/src/utils/seo.js'; const inputs=JSON.parse(process.argv[1]); console.log(JSON.stringify(inputs.map(([p,project,status])=>getMetaForPath(p,project,status))));"
    inputs=[[path,project_data,'ready'] for path in ROUTES]+[['/unknown',None,'ready'],['/work/renter',None,'ready'],['/work/renter',None,'error'],['/start/define/?product=unknown#summary',None,'ready']]
    client=json.loads(subprocess.check_output(['node','--input-type=module','-e',node,json.dumps(inputs)],cwd=REPO,text=True))
    assert client==[route_metadata(*entry) for entry in inputs], 'Client/server metadata resolution drift'
    assert not (REPO/'app/dist/prototype').exists()
    for asset in (REPO/'app/dist').rglob('*'):
        if asset.is_file() and asset.suffix in ('.html','.js','.css','.json','.xml','.txt'):
            assert '/prototype/' not in asset.read_text(), asset
    logs=open(root/'server.log','w')
    process=subprocess.Popen([sys.executable,'-m','gunicorn','--config',str(REPO/'backend/gunicorn.conf.py'),'config.wsgi:application','--chdir',str(REPO/'backend'),'--bind',f'127.0.0.1:{port}'],stdout=logs,stderr=logs)
    try:
        for _ in range(100):
            try:
                urllib.request.urlopen(base+'/health/',timeout=1).close();break
            except OSError:
                if process.poll() is not None: raise RuntimeError('Local server failed')
                time.sleep(.1)
        else: raise RuntimeError('Local server timeout')
        with sync_playwright() as p:
            browser=p.chromium.launch(headless=True)
            page=browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce')
            errors=[];requests=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            page.on('request',lambda request:requests.append(request.url))
            page.route('**/api/contacts/',lambda route:route.abort())
            def compare(path, status=200):
                response=page.goto(base+path,wait_until='networkidle')
                assert response.status==status,(path,response.status)
                raw=Head(response.text())
                expect(page).to_have_title(raw.title)
                rendered=Head(page.content())
                assert rendered.canonical==raw.canonical,(path,rendered.canonical,raw.canonical)
                assert rendered.tags==raw.tags,(path,rendered.tags,raw.tags)
                return raw,response
            for path in ROUTES:
                head,_=compare(path)
                assert head.canonical==origin+path
                page.evaluate('document.fonts.ready')
                assert page.evaluate('document.fonts.status')=='loaded'
                for step in range(4):
                    page.evaluate('(n)=>window.scrollTo(0,document.body.scrollHeight*n/3)',step)
                    page.wait_for_timeout(50)
                assert page.locator('img').evaluate_all('(els)=>els.filter(e=>e.currentSrc&&e.complete&&e.naturalWidth===0).length')==0,path
            assert not any('/prototype/' in url for url in requests)
            for variant in ('/start/define/?product=unknown&complexity=medium#summary','/work/'):
                compare(variant)
            assert 'product=unknown' in page.request.get(base+'/estimate?product=unknown',max_redirects=0).headers['location']
            # In-app navigation must also adopt the runtime origin and exact same metadata.
            page.goto(base+'/start')
            page.get_by_role('navigation',name='Main navigation').get_by_role('link',name='Work',exact=True).click()
            expect(page).to_have_title(ROUTES['/work']['title'])
            page.get_by_role('link',name='Explore Reviewed Renter',exact=True).first.click()
            expect(page).to_have_title('Reviewed Renter — RACCN Code')
            assert Head(page.content()).canonical==origin+'/work/renter'
            assert Head(page.content()).tags['description']==project.blurb
            for path in ('/prototype','/prototype/braided-signal','/prototype/control-plates','/prototype/routing-index','/work/unknown','/systems/unknown','/unknown'):
                head,response=compare(path,404)
                assert head.canonical is None and 'noindex' in head.tags['robots']
                assert 'noindex' in response.headers['x-robots-tag']
            for path in ('/prototype/index.html','/prototype/fonts/instrument-sans-latin.woff2','/prototype/media/renter-market.webp','/assets/missing.js','/static/missing.css','/media/projects/missing.png'):
                response=page.request.get(base+path)
                assert response.status==404,path
                assert 'noindex' in response.headers.get('x-robots-tag',''),path
                if response.headers.get('content-type','').startswith('text/html'):
                    assert 'noindex' in Head(response.text()).tags['robots']
            for asset,mime in (('/fonts/instrument-sans-latin.woff2','font/woff2'),('/fonts/ibm-plex-mono-400-latin.woff2','font/woff2'),('/fonts/ibm-plex-mono-500-latin.woff2','font/woff2'),('/evidence/renter/customer.webp','image/webp'),('/evidence/renter/operator.webp','image/webp'),('/social/raccn-code.png','image/png')):
                response=page.request.get(base+asset)
                assert response.status==200 and response.headers['content-type']==mime,asset
                assert response.body()==(REPO/'app/public'/asset.lstrip('/')).read_bytes()
            robots=page.request.get(base+'/robots.txt').text()
            assert f'Sitemap: {origin}/sitemap.xml' in robots
            assert 'Disallow: /prototype' not in robots and 'Disallow: /systems/demo' not in robots
            def sitemap():
                response=page.request.get(base+'/sitemap.xml')
                assert response.status==200
                return {node.text for node in ElementTree.fromstring(response.text()).iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')}
            assert sitemap()=={origin+path for path,meta in ROUTES.items() if not meta.get('noindex')}
            project.is_published=False;db(project.save)
            head,_=compare('/work/renter',404)
            assert project.title not in head.title
            assert origin+'/work/renter' not in sitemap()
            assert not errors,errors
            browser.close()
        print('PASS: 12 raw/client heads; in-app CMS metadata; runtime origin; sitemap publication; demo/404 noindex; prototype 404; exact asset bytes; no prototype requests; contract parity.')
    finally:
        process.terminate();process.wait(timeout=10);logs.close()
        from django.db import connections
        connections.close_all()


if __name__=='__main__':
    with tempfile.TemporaryDirectory(prefix='raccn-metadata-') as directory:run(Path(directory))
