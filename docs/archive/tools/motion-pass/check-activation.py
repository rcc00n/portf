# Historical local review helper; not maintained CI. Review URLs and side effects before running.
from playwright.sync_api import sync_playwright
from pathlib import Path
import json
out=Path(__file__).resolve().parent; checks=[]
with sync_playwright() as p:
 b=p.chromium.launch()
 for label,w,h in [('desktop',1440,1000),('laptop',1280,900),('tablet',820,1180),('mobile',390,844)]:
  ctx=b.new_context(viewport={'width':w,'height':h},has_touch=label=='mobile',is_mobile=label=='mobile');page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto('http://127.0.0.1:5173',wait_until='networkidle');page.wait_for_timeout(1800)
  page.screenshot(path=str(out/f'activation-{label}-ready.png'))
  button=page.get_by_role('button',name='Activate Control Plane');button.tap() if label=='mobile' else button.click();page.wait_for_timeout(260);page.screenshot(path=str(out/f'activation-{label}-propagation.png'));page.mouse.move(20,100);page.wait_for_timeout(1200);page.screenshot(path=str(out/f'activation-{label}-connected.png'))
  control=page.locator('.hp-plane__core-group');assert control.get_attribute('aria-pressed')=='true'
  core_fill=page.locator('.hp-plane__core').evaluate('(el)=>getComputedStyle(el).fill');assert core_fill=='rgb(52, 75, 234)',core_fill
  control.focus();page.keyboard.press('Space');assert control.get_attribute('aria-pressed')=='false';page.wait_for_timeout(300);assert page.locator('.hp-control-focus').evaluate('(el)=>getComputedStyle(el).opacity')=='1'
  page.keyboard.press('Enter');assert control.get_attribute('aria-pressed')=='true';page.wait_for_timeout(1100)
  for _ in range(7):
   control.click();page.wait_for_timeout(40)
  page.wait_for_timeout(1200);assert control.get_attribute('aria-pressed')=='false'
  transient=page.locator('.hp-core-route__signal').evaluate_all('(els)=>els.map(el=>getComputedStyle(el).opacity)');assert all(x=='0' for x in transient),transient
  page.locator('.hp-plane__core-group').focus();page.keyboard.press('Tab');page.keyboard.press('Shift+Tab');page.screenshot(path=str(out/f'activation-{label}-focus.png'))
  checks.append({'viewport':label,'width':w,'touch':label=='mobile','keyboard':True,'rapidToggle':True,'coreActiveFill':core_fill,'errors':errors,'horizontalOverflow':page.evaluate('document.documentElement.scrollWidth>innerWidth')});print(label, 'passed',flush=True);ctx.close()
 ctx=b.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce');page=ctx.new_page();page.goto('http://127.0.0.1:5173',wait_until='networkidle');page.wait_for_timeout(400);page.get_by_role('button',name='Activate Control Plane').click();page.screenshot(path=str(out/'activation-reduced-motion.png'));animations=page.locator('.hp-control-plane').evaluate('(el)=>el.getAnimations({subtree:true}).map(a=>a.playState)');assert not animations,animations
 checks.append({'reducedMotion':True,'animations':animations,'state':page.locator('.hp-plane__core-group').get_attribute('aria-pressed')});ctx.close();b.close()
(out/'activation-checks.json').write_text(json.dumps(checks,indent=2));print(json.dumps(checks,indent=2))
