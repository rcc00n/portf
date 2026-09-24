# Historical local review helper; not maintained CI. Review URLs and side effects before running.
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path('homepage-review/site-phase-one/form')
checks=[]
def check(name,value):
 assert value,name
 checks.append(name)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 for width in [1024,768,390]:
  page=browser.new_page(viewport={'width':width,'height':1000},has_touch=width<800,is_mobile=width==390)
  page.route('**/api/contacts/',lambda r:r.abort())
  page.goto('http://127.0.0.1:5173/',wait_until='networkidle')
  form=page.locator('.hp-start-form')
  form.scroll_into_view_if_needed()
  page.locator('#start-name').fill('RACCN QA')
  page.locator('#start-email').focus()
  page.wait_for_timeout(300)
  form.screenshot(path=str(OUT/f'form-{width}-focus.png'),style='.hp-header { visibility: hidden !important; }')
  check(f'{width}px form remains inside viewport',page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
  check(f'{width}px all native controls remain usable',all(page.locator(f'#start-{field}').bounding_box()['width']>100 for field in ['name','email','message']))
  check(f'{width}px accessible names exclude helper copy',all(page.get_by_role('textbox',name=name,exact=True).count()==1 for name in ['Name','Email','Tell us about your project']))
  page.close()
 page=browser.new_page(viewport={'width':1440,'height':1000})
 response={'body':'{"ok":false}', 'hold':False}
 def handler(route):
  if response['hold']: response['route']=route
  else: route.fulfill(status=200,content_type='application/json',body=response['body'])
 page.route('**/api/contacts/',handler)
 page.goto('http://127.0.0.1:5173/',wait_until='networkidle')
 for field,value in {'name':'QA','email':'qa@example.test','message':'Local test only.'}.items():page.locator(f'#start-{field}').fill(value)
 page.locator('button[type=submit]').click()
 page.wait_for_function('document.querySelector(".hp-start-form").dataset.state === "error"')
 check('Unconfirmed HTTP 200 does not imply success',page.locator('#start-message').input_value()=='Local test only.' and 'couldn’t confirm' in page.locator('.hp-start-form__status').inner_text())
 response['hold']=True
 page.clock.install()
 page.locator('button[type=submit]').click()
 page.wait_for_timeout(100)
 page.clock.fast_forward(20100)
 page.wait_for_function('document.querySelector(".hp-start-form").dataset.state === "error"')
 check('Request timeout restores retry while retaining input',page.locator('#start-message').input_value()=='Local test only.' and page.locator('button[type=submit]').is_enabled())
 try:response['route'].abort()
 except Exception:pass
 page.close()
 browser.close()
result=json.loads((OUT/'checks.json').read_text())
result['checks'].extend(checks);result['count']=len(result['checks']);result['additional_mocked_requests']=2
(OUT/'checks.json').write_text(json.dumps(result,indent=2))
print(json.dumps({'additional_checks':checks,'total_passed':result['count']}))
