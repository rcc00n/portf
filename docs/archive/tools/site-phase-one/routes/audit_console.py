# Historical local review helper; not maintained CI. Review URLs and side effects before running.
import asyncio,json,pathlib
from playwright.async_api import async_playwright
OUT=pathlib.Path('/home/raccoon/portf/homepage-review/site-phase-one/routes')
async def main():
 data=json.loads((OUT/'route-checks.json').read_text());rows=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch()
  for kind,vp in [('desktop',{'width':1440,'height':1000}),('mobile',{'width':390,'height':844})]:
   ctx=await browser.new_context(viewport=vp,is_mobile=kind=='mobile',has_touch=kind=='mobile',reduced_motion='reduce')
   for route in data['routes']:
    page=await ctx.new_page();messages=[]
    page.on('console',lambda msg:messages.append({'type':msg.type,'text':msg.text}) if msg.type in ('error','warning') else None)
    await page.goto('http://127.0.0.1:5173'+route,wait_until='networkidle')
    await page.evaluate('window.scrollTo(0,document.documentElement.scrollHeight)')
    await page.wait_for_timeout(60)
    rows.append({'route':route,'viewport':kind,'messages':messages});await page.close()
   await ctx.close()
  await browser.close()
 (OUT/'console-checks.json').write_text(json.dumps(rows,indent=2))
 print('Visits:', len(rows), 'Console errors:', sum(m['type']=='error' for r in rows for m in r['messages']), 'Warnings:', sum(m['type']=='warning' for r in rows for m in r['messages']))
asyncio.run(main())
