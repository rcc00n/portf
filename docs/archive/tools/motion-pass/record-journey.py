# Historical local review helper; not maintained CI. Review URLs and side effects before running.
"""Record the complete rendered journey, including actual wheel scroll and interactions."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json, sys
OUT=Path(__file__).resolve().parent
URL=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8001/'
checks=[]
PROFILE=sys.argv[2] if len(sys.argv)>2 else None
with sync_playwright() as p:
 browser=p.chromium.launch()
 for label,w,h,touch in [('desktop',1440,1000,False),('mobile',390,844,True)]:
  if PROFILE and label!=PROFILE:continue
  ctx=browser.new_context(viewport={'width':w,'height':h},device_scale_factor=1,has_touch=touch,is_mobile=touch,record_video_dir=str(OUT/'journey-raw'),record_video_size={'width':w,'height':h})
  page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(URL,wait_until='networkidle');page.evaluate('document.fonts.ready');page.wait_for_timeout(2100)
  timings=[]
  def mark(name):
   timings.append({'name':name,'ms':round(page.evaluate('performance.now()')),'scroll':round(page.evaluate('scrollY'))})
  def move_to(target,speed=58):
   while page.evaluate('scrollY')<target-4:
    y=page.evaluate('scrollY');delta=min(speed,target-y)
    if touch: page.evaluate('(dy)=>scrollBy({top:dy,behavior:"instant"})',delta)
    else: page.mouse.wheel(0,delta)
    page.wait_for_timeout(80)
    if page.evaluate('scrollY')==y and delta<speed: break
  mark('ready');
  page.get_by_role('button',name='Activate Control Plane').click();mark('activate');page.wait_for_timeout(1300)
  page.mouse.move(5,90);
  page.locator('.hp-plane__core-group').click();page.wait_for_timeout(350)
  page.locator('.hp-plane__core-group').click();page.wait_for_timeout(1200)
  move_to(420,32);mark('hero-transfer');page.wait_for_timeout(300)
  work_y=page.locator('.hp-flagship__evidence').evaluate('(e)=>e.getBoundingClientRect().top+scrollY-innerHeight*.3')
  move_to(work_y);mark('work');page.wait_for_timeout(450)
  secondary_y=page.locator('.hp-secondary-work').evaluate('(e)=>e.getBoundingClientRect().top+scrollY-innerHeight*.2')
  move_to(secondary_y);mark('secondary-work');page.wait_for_timeout(400)
  systems_y=page.locator('.hp-system-machine').evaluate('(e)=>e.getBoundingClientRect().top+scrollY-innerHeight*.35')
  move_to(systems_y,45);mark('systems-arrival');page.wait_for_timeout(900)

  # Keep the graph and tabs within view for the authored transitions.
  if touch:
   page.locator('.hp-systems-modes').scroll_into_view_if_needed();page.wait_for_timeout(250)
  page.get_by_role('tab',name='Admin-first').click();mark('systems-control');page.wait_for_timeout(850)
  page.get_by_role('tab',name='Production').click();mark('systems-production');page.wait_for_timeout(850)
  page.locator('.hp-system-plane-control').nth(1).click();mark('systems-node');page.wait_for_timeout(700)
  approach_y=page.locator('#approach').evaluate('(e)=>e.getBoundingClientRect().top+scrollY-100')
  move_to(approach_y);mark('approach-heading');page.wait_for_timeout(350)
  decisions_y=page.locator('.hp-approach-list').evaluate('(e)=>e.getBoundingClientRect().bottom+scrollY-innerHeight*.62')
  move_to(decisions_y,32);mark('decisions-resolve');page.wait_for_timeout(350)
  start_y=page.locator('.hp-start-card').evaluate('(e)=>e.getBoundingClientRect().top+scrollY-130')
  move_to(start_y,45);mark('start');page.wait_for_timeout(300)

  card=page.locator('.hp-start-card');card.hover();mark('start-feedback');page.wait_for_timeout(450)
  if touch: card.tap(position={'x':12,'y':14})
  else: card.click(position={'x':12,'y':14})
  mark('inquiry');page.wait_for_timeout(1000)
  assert page.evaluate('location.hash')=='#project-inquiry'
  assert page.evaluate('document.activeElement.id')=='project-inquiry'
  page.keyboard.press('Tab');assert page.evaluate('document.activeElement.id')=='start-name'

  page.wait_for_timeout(500)
  video=page.video;ctx.close();video.save_as(str(OUT/f'homepage-{label}.webm'))
  checks.append({'profile':label,'errors':errors,'timings':timings});print(label,json.dumps(checks[-1]),flush=True)
 browser.close()
(OUT/(f'journey-recording-{PROFILE}.json' if PROFILE else 'journey-recording.json')).write_text(json.dumps(checks,indent=2))
