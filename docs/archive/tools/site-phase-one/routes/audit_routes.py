# Historical local review helper; not maintained CI. Review URLs and side effects before running.
import asyncio, json, pathlib, re, urllib.request, urllib.error
from playwright.async_api import async_playwright
ROOT=pathlib.Path('/home/raccoon/portf')
OUT=ROOT/'homepage-review/site-phase-one/routes'
main=(ROOT/'app/src/main.jsx').read_text(); app=(ROOT/'app/src/App.jsx').read_text()
routes=sorted(set(re.findall(r'<Route\s+path="([^"]+)"',main+app))-{'*','/prototype/*'})
routes += ['/prototype','/prototype/braided-signal','/prototype/control-plates','/prototype/routing-index','/definitely-not-a-page','/prototype/not-a-page']
def slug(route):return 'home' if route=='/' else route.strip('/').replace('/','-')
async def run():
  allresults=[]
  async with async_playwright() as p:
    browser=await p.chromium.launch()
    for kind,viewport in [('desktop',{'width':1440,'height':1000}),('mobile',{'width':390,'height':844})]:
      context=await browser.new_context(viewport=viewport,is_mobile=kind=='mobile',has_touch=kind=='mobile',device_scale_factor=1,reduced_motion='reduce')
      await context.route('**/api/contacts/**',lambda r:r.abort())
      for route in routes:
        page=await context.new_page(); errors=[]; failed=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('response',lambda r:failed.append({'url':r.url,'status':r.status}) if r.status>=400 else None)
        response=await page.goto('http://127.0.0.1:5173'+route,wait_until='networkidle')
        await page.evaluate('document.fonts.ready');await page.wait_for_timeout(150)
        # Traverse all sections once to resolve lazy evidence and inspect lower page content.
        await page.evaluate("async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=700){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,35));}window.scrollTo(0,0)}")
        await page.wait_for_timeout(100)
        info=await page.evaluate("""()=>({title:document.title,headings:[...document.querySelectorAll('h1,h2,h3')].map(x=>x.innerText),text:document.body.innerText,links:[...document.querySelectorAll('a')].map(x=>({text:x.innerText,href:x.getAttribute('href')})),buttons:[...document.querySelectorAll('button,[role=button]')].map(x=>({text:x.innerText||x.getAttribute('aria-label'),role:x.getAttribute('role')})),fields:[...document.querySelectorAll('input,textarea,select')].map(x=>({name:x.name,type:x.type,required:x.required})),overflow:document.documentElement.scrollWidth>innerWidth+1,width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,robots:document.querySelector('meta[name=robots]')?.content,brokenImages:[...document.images].filter(x=>x.complete&&!x.naturalWidth).map(x=>x.src)})""")
        info.update(route=route,viewport=kind,devStatus=response.status,errors=errors,failed=failed)
        name=slug(route)+'-'+kind
        await page.screenshot(path=str(OUT/(name+'-top.png')))
        await page.screenshot(path=str(OUT/(name+'-full.png')),full_page=True)
        allresults.append(info)
        print(kind,route,'overflow='+str(info['overflow']),'errors='+str(len(errors)),'failed='+str(len(failed)),flush=True)
        await page.close()
      await context.close()
    await browser.close()
  statuses=[]
  for route in routes+['/projects/','/api/projects/','/api/pricing/','/api/contacts/','/admin/','/health/','/sitemap.xml','/robots.txt','/assets/not-there.js']:
    try:
      r=urllib.request.urlopen('http://127.0.0.1:8001'+route)
      statuses.append({'route':route,'status':r.status,'url':r.url,'robots':r.headers.get('X-Robots-Tag'),'type':r.headers.get('Content-Type')})
    except urllib.error.HTTPError as e: statuses.append({'route':route,'status':e.code,'robots':e.headers.get('X-Robots-Tag'),'type':e.headers.get('Content-Type')})
  (OUT/'route-checks.json').write_text(json.dumps({'routes':routes,'browser':allresults,'server':statuses},indent=2))
asyncio.run(run())
