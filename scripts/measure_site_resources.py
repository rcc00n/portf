"""Cold-context local route measurements; called optionally by cms_media_smoke.py."""
import json
from pathlib import Path

def measure(browser,base,label):
    if label not in ("before", "after", "review"):
        raise ValueError("Measurement label must be before, after or review")
    results=[]
    for width,height,name in [(1440,1000,'desktop'),(390,844,'mobile')]:
        for route in ['/','/work','/work/renter','/systems','/start']:
            context=browser.new_context(viewport={'width':width,'height':height}, reduced_motion='reduce')
            page=context.new_page()
            page.add_init_script("new PerformanceObserver(l=>window.__lcp=l.getEntries().at(-1).startTime).observe({type:'largest-contentful-paint',buffered:true})")
            page.goto(base+route,wait_until='networkidle')
            page.evaluate('document.fonts.ready')
            page.wait_for_timeout(300)
            row=page.evaluate('''() => {const r=performance.getEntriesByType('resource');return {
            fonts:r.filter(x=>x.name.includes('.woff2')).map(x=>({path:new URL(x.name).pathname,bytes:x.encodedBodySize})),
            preloads:document.querySelectorAll('link[rel=preload][as=font]').length,
            resources:r.reduce((n,x)=>n+x.encodedBodySize,0),
            js:r.filter(x=>new URL(x.name).pathname.endsWith('.js')).reduce((n,x)=>n+x.encodedBodySize,0),
            css:r.filter(x=>new URL(x.name).pathname.endsWith('.css')).reduce((n,x)=>n+x.encodedBodySize,0),
            lcp:window.__lcp, fontStatus:document.fonts.status,
            heading: getComputedStyle(document.querySelector('h1')).fontFamily,
            preloadUnused:[...document.querySelectorAll('link[as=font]')].map(x=>new URL(x.href).pathname)
            }}''')
            row.update(route=route,viewport=name)
            results.append(row)
            slug=route.strip('/').replace('/','-') or 'home'
            page.screenshot(path=f'/tmp/raccn-{label}-{slug}-{name}.png',full_page=False)
            context.close()
    Path(f'/tmp/raccn-performance-{label}.json').write_text(json.dumps(results,indent=2))
    print(json.dumps(results,indent=2))
