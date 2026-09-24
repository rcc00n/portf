# Historical local review helper; not maintained CI. Review URLs and side effects before running.
from pathlib import Path
from playwright.sync_api import sync_playwright
import json
OUT=Path(__file__).resolve().parent; checks=[]
URL='http://127.0.0.1:8001/'
with sync_playwright() as p:
 b=p.chromium.launch()
 for w,h in [(1440,1000),(1280,900),(820,1180),(390,844),(360,800)]:
  ctx=b.new_context(viewport={'width':w,'height':h},has_touch=w<500,is_mobile=w<500);page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(URL,wait_until='networkidle');page.evaluate('document.fonts.ready');page.wait_for_timeout(1600)
  for id in ['work','systems','approach','start']:
   page.locator('#'+id).evaluate('(e)=>scrollTo({top:e.getBoundingClientRect().top+scrollY-(innerWidth>820?95:115),behavior:"instant"})');page.wait_for_timeout(150)
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),(w,id)
   if id in ['approach','start']:page.screenshot(path=str(OUT/f'final-{id}-{w}.png'))
  card=page.locator('.hp-start-card');card.scroll_into_view_if_needed();page.wait_for_timeout(100)
  hit=card.evaluate('''e=>{const r=e.getBoundingClientRect();return [.02,.5,.98].flatMap(x=>[.03,.5,.97].map(y=>{const t=document.elementFromPoint(r.x+r.width*x,r.y+r.height*y);return t===e||e.contains(t)}))}''')
  assert all(hit),(w,hit)
  assert card.locator('a,button,input,textarea,[role=button]').count()==0
  assert card.evaluate('(e)=>getComputedStyle(e).cursor')=='pointer'
  card.focus();page.keyboard.press('Tab');page.keyboard.press('Shift+Tab')
  assert card.evaluate('(e)=>e.matches(":focus-visible")')
  assert card.evaluate('(e)=>getComputedStyle(e).outlineStyle')=='solid'
  page.keyboard.press('Enter');page.wait_for_timeout(800)
  assert page.evaluate('location.hash')=='#project-inquiry'
  assert page.evaluate('document.activeElement.id')=='project-inquiry'
  page.keyboard.press('Tab');assert page.evaluate('document.activeElement.id')=='start-name'
  # Arrow-key selection and node keyboard feedback preserve a single mode.
  tab=page.get_by_role('tab',name='Architecture');tab.focus();page.keyboard.press('ArrowRight');page.wait_for_timeout(650)
  assert page.get_by_role('tab',name='Admin-first').get_attribute('aria-selected')=='true'
  page.keyboard.press('End');page.wait_for_timeout(650)
  assert page.get_by_role('tab',name='Production').get_attribute('aria-selected')=='true'
  plane=page.locator('.hp-system-plane-control').first;plane.focus();page.keyboard.press('Space')
  assert plane.get_attribute('aria-pressed')=='true'
  # Desktop layers may be staggered but must never obscure either caption.
  if w>820:
   gap=page.evaluate('document.querySelector(".hp-evidence--control").getBoundingClientRect().top-document.querySelector(".hp-evidence--market figcaption").getBoundingClientRect().bottom')
   assert gap>=30,(w,gap)
  checks.append({'width':w,'noOverflow':True,'wholeCardHitTests':len(hit),'nativeLinkKeyboard':True,'inquiryFocus':True,'systemsKeyboard':True,'errors':errors})
  assert not errors,errors;ctx.close()
 ctx=b.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce');page=ctx.new_page();page.goto(URL,wait_until='networkidle');page.wait_for_timeout(1000)
 page.get_by_role('button',name='Activate Control Plane').click();assert page.locator('.hp-plane__core-group').get_attribute('aria-pressed')=='true'
 assert page.locator('.hp-control-plane').evaluate('(e)=>e.getAnimations({subtree:true}).length')==0
 page.locator('#systems').scroll_into_view_if_needed();page.get_by_role('tab',name='Production').click()
 assert page.locator('.hp-system-machine').evaluate('(e)=>e.getAnimations({subtree:true}).length')==0
 assert page.locator('[data-home-evidence]').first.evaluate('(e)=>getComputedStyle(e).getPropertyValue("--evidence-progress").trim()')=='1.000'
 checks.append({'reducedMotion':True,'heroImmediate':True,'systemsImmediate':True,'evidenceFullyVisible':True});ctx.close();b.close()
(OUT/'journey-checks.json').write_text(json.dumps(checks,indent=2));print(json.dumps(checks,indent=2))
