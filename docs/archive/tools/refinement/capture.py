# Historical local review helper; not maintained CI. Review URLs and side effects before running.
"""Capture the actual local production build. Requires Python Playwright/Chromium."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parent
URL = 'http://127.0.0.1:8001/'
with sync_playwright() as p:
    browser = p.chromium.launch()
    checks = []
    for label, width, height in [('desktop',1440,1000),('laptop',1024,900),('tablet',820,1180),('mobile',390,844)]:
        context = browser.new_context(viewport={'width':width,'height':height}, device_scale_factor=1, is_mobile=label=='mobile', has_touch=label=='mobile')
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(URL, wait_until='networkidle')
        page.wait_for_timeout(1800)
        for y in range(0,int(page.evaluate('document.body.scrollHeight')),550):
            page.evaluate('(y)=>window.scrollTo({top:y,behavior:"instant"})',y)
            page.wait_for_timeout(70)
        page.wait_for_timeout(300)
        for act in ['top','work','systems','approach','start']:
            page.evaluate('(id)=>{const e=document.getElementById(id); window.scrollTo({top:e.offsetTop-(innerWidth>820?92:116),behavior:"instant"})}',act)
            page.wait_for_timeout(250)
            page.screenshot(path=str(OUT/f'{label}-{act}.png'))
        page.evaluate('window.scrollTo({top:0,behavior:"instant"})')
        page.wait_for_timeout(500)
        page.screenshot(path=str(OUT/f'{label}-full.png'),full_page=True)
        checks.append({'viewport':label,'width':width,'pageHeight':page.evaluate('document.body.scrollHeight'),'overflow':page.evaluate('document.documentElement.scrollWidth>innerWidth'),'errors':errors})
        context.close()

    context=browser.new_context(viewport={'width':1440,'height':1000},record_video_dir=str(OUT/'video-raw'),record_video_size={'width':1440,'height':1000})
    page=context.new_page()
    page.goto(URL,wait_until='networkidle')
    page.wait_for_timeout(2200)
    control=page.get_by_role('button',name='Activate Control Plane')
    control.click();page.wait_for_timeout(1100)
    control.click();page.wait_for_timeout(700)
    states=[]
    for target in [100,230,370,510,660,830,1060,1320]:
        delta=target-page.evaluate('window.scrollY')
        for _ in range(10):
            page.mouse.wheel(0,delta/10);page.wait_for_timeout(55)
        page.wait_for_timeout(480)
        if target<900:
            states.append({'scroll':page.evaluate('window.scrollY'),'state':page.locator('.raccn-home').get_attribute('data-hero-state')})
            page.screenshot(path=str(OUT/f'motion-{target}.png'))
    page.locator('.hp-nav a[href="#systems"]').click();page.wait_for_timeout(1300)
    page.get_by_role('tab',name='Admin-first').click();page.wait_for_timeout(650)
    page.get_by_role('tab',name='Production').click();page.wait_for_timeout(650)
    page.locator('.hp-systems-nodes button').nth(2).click();page.wait_for_timeout(1000)
    page.locator('.hp-nav a[href="#approach"]').click();page.wait_for_timeout(1500)
    page.locator('.hp-nav a[href="#start"]').click();page.wait_for_timeout(1400)
    page.locator('#start-name').focus();page.wait_for_timeout(1000)
    page.mouse.wheel(0,500);page.wait_for_timeout(900)
    video=page.video
    context.close()
    video.save_as(str(OUT/'control-plane-motion.webm'))
    (OUT/'capture-checks.json').write_text(json.dumps({'viewports':checks,'motion':states},indent=2))
    browser.close()
print(json.dumps(checks))
