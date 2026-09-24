# Historical local review helper; not maintained CI. Review URLs and side effects before running.
import asyncio,json,pathlib,re
from playwright.async_api import async_playwright
OUT=pathlib.Path('/home/raccoon/portf/homepage-review/site-phase-one/routes')
async def run():
 results=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch()
  for kind,vp in [('desktop',{'width':1440,'height':1000}),('mobile',{'width':390,'height':844})]:
   context=await browser.new_context(viewport=vp,is_mobile=kind=='mobile',has_touch=kind=='mobile',reduced_motion='reduce')
   await context.route('**/api/contacts/**',lambda r:r.abort())
   page=await context.new_page()
   async def go(route):await page.goto('http://127.0.0.1:5173'+route,wait_until='networkidle')
   async def check(name,fn):
    try: results.append({'viewport':kind,'check':name,'result':await fn(),'error':None})
    except Exception as e:results.append({'viewport':kind,'check':name,'error':str(e)})
   async def architecture():
    await go('/architecture-preview'); radios=page.get_by_role('radio');await radios.nth(1).click();await radios.nth(5).click()
    return {'checked':await page.locator('[role=radio][aria-checked=true]').all_text_contents(),'selected':await page.locator('[aria-live=polite]').inner_text()}
   await check('Architecture product and scale changes',architecture)
   async def adminfirst():
    await go('/admin-first');await page.get_by_role('radio').nth(1).click()
    return {'checked':await page.locator('[role=radio][aria-checked=true]').all_text_contents(),'content':await page.locator('body').inner_text()}
   await check('Customer/admin comparison mode',adminfirst)
   async def production():
    await go('/production-ready');buttons=page.locator('button[aria-expanded]');await buttons.nth(1).click()
    return {'expanded':await page.locator('button[aria-expanded=true]').all_text_contents()}
   await check('Production disclosure',production)
   async def project():
    await go('/projects');await page.locator('[aria-haspopup=dialog]').first.click();await page.get_by_role('dialog').wait_for()
    info={'dialog':await page.get_by_role('dialog').inner_text(),'focusedTag':await page.evaluate('document.activeElement.tagName')}
    await page.keyboard.press('Escape');await page.get_by_role('dialog').wait_for(state='hidden');return info
   await check('Project details open and Escape close',project)
   async def estimate():
    await go('/estimate');groups=page.get_by_role('radiogroup');await groups.nth(0).get_by_role('radio').nth(1).click();await groups.nth(1).get_by_role('radio').nth(2).click()
    snap=await page.evaluate('JSON.parse(localStorage.getItem("estimateSnapshot"))');await go('/summary');return {'saved':snap,'summary':await page.locator('body').inner_text()}
   await check('Estimator persists and supplies summary',estimate)
   async def qualifier():
    await go('/start');groups=page.get_by_role('radiogroup');await groups.nth(1).get_by_role('radio').nth(2).click();await groups.nth(2).get_by_role('radio').nth(0).click();await groups.nth(3).get_by_role('radio').nth(0).click()
    return {'saved':await page.evaluate('JSON.parse(localStorage.getItem("qualificationGate"))'),'bypass':await page.get_by_role('link',name='Continue anyway').get_attribute('href')}
   await check('Qualification recommendations preserve contact bypass',qualifier)
   async def precall():
    await go('/pre-call?product=marketplace&complexity=complex&maturity=growth');return {'snapshot':await page.locator('body').inner_text()}
   await check('Pre-call query routing context',precall)
   async def demo():
    await go('/admin-demo');await page.get_by_role('radio',name='Customer View').click();customer=await page.get_by_role('radio',name='Customer View').get_attribute('aria-checked');await page.get_by_role('radio',name='Admin View').click()
    await page.get_by_role('button',name=re.compile('^Users & Roles')).click();permission=page.get_by_role('button',name=re.compile('^Manage users'));before=await permission.get_attribute('aria-pressed');await permission.click();after=await permission.get_attribute('aria-pressed')
    await page.get_by_role('button',name=re.compile('^Transactions')).click();await page.get_by_role('button',name='View details').first.click();dialog=await page.get_by_role('dialog').inner_text();await page.get_by_role('dialog').get_by_role('button').click()
    await page.get_by_role('button',name=re.compile('^Disputes')).click();disabled=await page.get_by_role('button',name='Approve refund').is_disabled()
    return {'customerChecked':customer,'permissionBefore':before,'permissionAfter':after,'transactionDetail':dialog,'refundIsDisabled':disabled}
   await check('Demo views, permission state, transaction details, safe disabled refund',demo)
   await context.close()
  await browser.close()
 (OUT/'interaction-checks.json').write_text(json.dumps(results,indent=2))
 for r in results: print(r['viewport'],r['check'],'PASS' if not r['error'] else r['error'],flush=True)
asyncio.run(run())
