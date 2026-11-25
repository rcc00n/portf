# Historical local review helper; not maintained CI. Review URLs and side effects before running.
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path('homepage-review/site-phase-one/form')
checks=[]
console_errors=[]
requests=[]

def check(name, assertion):
 assert assertion, name
 checks.append(name)

def state(page, name):
 return page.locator(f'.hp-form-field[data-field="{name}"]')

def focus_id(page):
 return page.evaluate('document.activeElement.id')

def open_form(page):
 page.goto('http://127.0.0.1:5173/',wait_until='networkidle')
 page.locator('.hp-start-form').scroll_into_view_if_needed()
 page.wait_for_timeout(180)

def install_mock(page):
 response={'kind':'hold','body':{},'code':500}
 def handler(route):
  requests.append(route.request.post_data_json)
  if response['kind']=='abort': route.abort('failed')
  elif response['kind']=='hold': response['route']=route
  else: route.fulfill(status=response['code'],content_type='application/json',body=json.dumps(response['body']))
 page.route('**/api/contacts/', handler)
 return response

def fill(page):
 for key,value in {'name':'RACCN QA','email':'qa@example.test','message':'Testing the inquiry surface locally; no real inquiry will be sent.'}.items():
  page.locator(f'#start-{key}').fill(value)

with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 context=browser.new_context(viewport={'width':1440,'height':1050},record_video_dir=str(OUT/'recordings'),record_video_size={'width':1440,'height':1050})
 page=context.new_page()
 page.on('pageerror',lambda err:console_errors.append(str(err)))
 response=install_mock(page)
 open_form(page)
 form=page.locator('.hp-start-form')
 check('Exactly three native required fields',page.locator('.hp-start-form input[required], .hp-start-form textarea[required]').count()==3)
 check('No artificial field tab stops',page.locator('.hp-form-field[tabindex], .hp-form-field[role], .hp-form-field label').count()==0)
 check('Native labels explicitly associate each field',page.locator('label.hp-form-field[for]').count()==3)
 check('Initial form is empty',form.get_attribute('data-completion')=='empty')
 for num,field in [('01','name'),('02','email'),('03','message')]:
  box=state(page,num)
  box.scroll_into_view_if_needed()
  for target in ['.hp-form-field__label b','.hp-form-field__label > span','.hp-field-note']:
   page.locator('.hp-start-form__intro').click()
   box.locator(target).click()
   check(f'Desktop {field}: {target} focuses input',focus_id(page)==f'start-{field}')
  for point in ['top','side','bottom']:
   page.locator('.hp-start-form__intro').click()
   bounds=box.bounding_box()
   positions={'top':(bounds['width']*.5,8),'side':(max(bounds['width']-6,1),bounds['height']*.5),'bottom':(bounds['width']*.5,bounds['height']-8)}
   box.click(position={'x':positions[point][0],'y':positions[point][1]})
   check(f'Desktop {field}: {point} padding focuses input',focus_id(page)==f'start-{field}')
  box.locator('input,textarea').fill('Caret location sample')
  control=box.locator('input,textarea')
  control.click(position={'x':3,'y':20})
  if field == 'email':
   page.keyboard.type('X')
   check(f'Desktop {field}: actual text click retains caret position',control.input_value().startswith('X'))
  else:
   check(f'Desktop {field}: actual text click retains caret position',control.evaluate('e=>e.selectionStart')<4)
  control.fill('')
 page.locator('#start-name').focus()
 page.keyboard.press('Tab')
 check('Tab moves name to email',focus_id(page)=='start-email')
 page.keyboard.press('Tab')
 check('Tab moves email to message',focus_id(page)=='start-message')
 page.keyboard.press('Tab')
 check('Tab moves message to privacy link',page.evaluate('document.activeElement.getAttribute("href")')=='/privacy')
 page.locator('#start-name').fill('RACCN QA')
 page.locator('#start-name').blur()
 check('Partial form state',form.get_attribute('data-completion')=='partial')
 check('Name has subtle completed state',state(page,'01').get_attribute('data-state')=='complete')
 page.locator('#start-email').hover()
 page.screenshot(path=str(OUT/'desktop-hover-completed.png'))
 page.locator('#start-email').focus()
 page.screenshot(path=str(OUT/'desktop-focus.png'))
 page.locator('button[type=submit]').click()
 check('Invalid submit makes no request',len(requests)==0)
 check('First invalid field receives focus',focus_id(page)=='start-email')
 check('Validation explains both missing fields',page.locator('.hp-start-form [aria-invalid=true]').count()==2)
 fill(page)
 check('All three fields valid',form.get_attribute('data-completion')=='valid')
 check('Completed markers on all fields',page.locator('.hp-form-field[data-state=complete]').count()==3)
 page.locator('#start-message').blur()
 page.screenshot(path=str(OUT/'desktop-valid.png'))
 page.locator('button[type=submit]').click()
 page.wait_for_timeout(500)
 check('Submitting state visible',form.get_attribute('data-state')=='loading')
 check('Submitting button prevents repeated clicks',page.locator('button[type=submit]').is_disabled())
 check('Inputs read-only during request',page.locator('.hp-start-form [readonly]').count()==3)
 check('Submitting signal is indeterminate motion',page.locator('.hp-start-form__delivery i').evaluate('e=>getComputedStyle(e).animationName')=='hp-inquiry-travel')
 page.screenshot(path=str(OUT/'desktop-submitting.png'))
 page.locator('.hp-start-form').evaluate('e=>e.requestSubmit()')
 check('Repeated submit guarded',len(requests)==1)
 check('Backend contract preserved',requests[0]=={'name':'RACCN QA','email':'qa@example.test','company':'','message':'Testing the inquiry surface locally; no real inquiry will be sent.','source':'homepage-start'})
 response['route'].fulfill(status=503,content_type='application/json',body=json.dumps({'ok':False}))
 page.wait_for_function('document.querySelector(".hp-start-form").dataset.state === "error"')
 check('Server failure retains entered values',page.locator('#start-name').input_value()=='RACCN QA' and page.locator('#start-message').input_value().startswith('Testing'))
 check('Server failure announces retained data','Your details are still here' in page.locator('.hp-start-form__status').inner_text())
 check('General error receives programmatic focus',page.evaluate('document.activeElement.classList.contains("hp-start-form__status")'))
 page.screenshot(path=str(OUT/'desktop-error.png'))
 response.update(kind='respond',code=422,body={'ok':False,'fields':{'email':'Use a different email address.'}})
 page.locator('button[type=submit]').click()
 page.wait_for_function('document.querySelector("#start-email").getAttribute("aria-invalid") === "true"')
 check('Server field errors shown and focused',focus_id(page)=='start-email' and 'different email' in page.locator('#start-email-error').inner_text())
 page.locator('#start-email').fill('qa2@example.test')
 response.update(kind='abort')
 page.locator('button[type=submit]').click()
 page.wait_for_function('document.querySelector(".hp-start-form").dataset.state === "error"')
 check('Network error retains all values',page.locator('#start-email').input_value()=='qa2@example.test' and page.locator('#start-message').input_value().startswith('Testing'))
 response.update(kind='respond',code=200,body={'ok':True})
 page.locator('button[type=submit]').click()
 page.wait_for_function('document.querySelector(".hp-start-form").dataset.state === "success"')
 page.wait_for_timeout(800)
 check('Confirmed success shown',page.locator('.hp-start-form__success').is_visible())
 check('Success describes email next step','reply by email' in page.locator('.hp-start-form__success').inner_text())
 check('Success receives focus',page.evaluate('document.activeElement.classList.contains("hp-start-form__success")'))
 check('Success route resolves completely',page.locator('.hp-start-form__delivery i').evaluate('e=>getComputedStyle(e).transform')=='matrix(1, 0, 0, 1, 0, 0)')
 page.screenshot(path=str(OUT/'desktop-success.png'))
 desktop_video=page.video.path()
 context.close()
 Path(desktop_video).rename(OUT/'form-states-desktop.webm')

 # Genuine touch context verifies label default action; no JS focus shim.
 mobile=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
 page=mobile.new_page(); page.on('pageerror',lambda err:console_errors.append(str(err)))
 response=install_mock(page)
 open_form(page)
 for num,field in [('01','name'),('02','email'),('03','message')]:
  box=state(page,num)
  for target in ['.hp-form-field__label b','.hp-form-field__label > span','.hp-field-note']:
   box.locator(target).tap()
   check(f'Mobile {field}: {target} tap focuses native input',focus_id(page)==f'start-{field}')
  box.tap(position={'x':box.bounding_box()['width']-8,'y':10})
  check(f'Mobile {field}: padding tap focuses native input',focus_id(page)==f'start-{field}')
 page.locator('#start-name').fill('RACCN QA')
 page.locator('#start-email').tap()
 page.locator('.hp-start-form__intro').scroll_into_view_if_needed()
 page.screenshot(path=str(OUT/'mobile-focus-completed.png'))
 check('Mobile no horizontal overflow',page.evaluate('document.documentElement.scrollWidth <= innerWidth'))
 fill(page)
 response.update(kind='respond',code=200,body={'ok':True})
 page.locator('button[type=submit]').tap()
 page.wait_for_function('document.querySelector(".hp-start-form").dataset.state === "success"')
 page.screenshot(path=str(OUT/'mobile-success.png'))
 mobile.close()

 reduced=browser.new_context(viewport={'width':1280,'height':900},reduced_motion='reduce')
 page=reduced.new_page(); page.on('pageerror',lambda err:console_errors.append(str(err)))
 response=install_mock(page); open_form(page); fill(page)
 page.locator('button[type=submit]').click(); page.wait_for_timeout(200)
 check('Reduced motion has no continuous submission travel',page.locator('.hp-start-form__delivery i').evaluate('e=>getComputedStyle(e).animationName')=='none')
 response['route'].fulfill(status=200,content_type='application/json',body='{"ok":true}')
 page.wait_for_function('document.querySelector(".hp-start-form").dataset.state === "success"')
 check('Reduced-motion confirmation has a clear endpoint',page.locator('.hp-start-form__delivery b').evaluate('e=>getComputedStyle(e).opacity')=='1')
 reduced.close()
 check('No JavaScript console errors',not console_errors)
 browser.close()

(OUT/'checks.json').write_text(json.dumps({'checks':checks,'count':len(checks),'console_errors':console_errors,'mocked_requests':len(requests),'actual_inquiries_sent':0},indent=2))
print(json.dumps({'passed':len(checks),'console_errors':console_errors,'mocked_requests':len(requests),'actual_inquiries_sent':0}))
