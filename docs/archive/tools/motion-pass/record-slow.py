# Historical local review helper; not maintained CI. Review URLs and side effects before running.
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path(__file__).resolve().parent
with sync_playwright() as p:
 b=p.chromium.launch();ctx=b.new_context(viewport={'width':1440,'height':1000},record_video_dir=str(OUT/'slow-raw'),record_video_size={'width':1440,'height':1000});page=ctx.new_page();page.goto('http://127.0.0.1:8001/',wait_until='networkidle');page.wait_for_timeout(1600)
 page.get_by_role('button',name='Activate Control Plane').click();page.wait_for_timeout(1300)
 total=page.evaluate('document.documentElement.scrollHeight-innerHeight')
 while page.evaluate('scrollY')<total-2:
  page.mouse.wheel(0,24);page.wait_for_timeout(80)
 page.wait_for_timeout(500);video=page.video;ctx.close();video.save_as(str(OUT/'homepage-slow-desktop.webm'));b.close()
 print('Complete slow journey recorded.')
