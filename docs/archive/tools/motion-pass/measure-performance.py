# Historical local review helper; not maintained CI. Review URLs and side effects before running.
#!/usr/bin/env python3
"""Measure the production homepage with local Chromium. Requires Python Playwright."""
from pathlib import Path
from datetime import datetime, timezone
from playwright.sync_api import sync_playwright
import json
import sys

URL=sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8001/'
OUT=Path(__file__).resolve().parent
INIT='''(() => {
 const data=window.__homepagePerf={paints:[],lcp:[],shifts:[],longTasks:[],raf:{requested:0,executed:0}};
 const nativeRAF=window.requestAnimationFrame.bind(window);
 window.requestAnimationFrame=(callback)=>{data.raf.requested++;return nativeRAF(time=>{data.raf.executed++;callback(time)})};
 for(const [type,key] of [['paint','paints'],['largest-contentful-paint','lcp'],['layout-shift','shifts'],['longtask','longTasks']]) {
  try {new PerformanceObserver(list=>{for(const e of list.getEntries()) {
   if(type==='paint')data[key].push({name:e.name,startTime:e.startTime});
   if(type==='largest-contentful-paint')data[key].push({startTime:e.startTime,size:e.size,tag:e.element?.tagName,id:e.element?.id||null,url:e.url||null});
   if(type==='layout-shift')data[key].push({startTime:e.startTime,value:e.value,hadRecentInput:e.hadRecentInput});
   if(type==='longtask')data[key].push({startTime:e.startTime,duration:e.duration});
  }}).observe({type,buffered:true});}catch(e){data[type+'Unsupported']=String(e)}
 }
})();'''
RESOURCE_JS='''() => {
 const entries=[...performance.getEntriesByType('navigation'),...performance.getEntriesByType('resource')];
 return {entries:entries.map(e=>({url:e.name,type:e.initiatorType||e.entryType,transferBytes:e.transferSize||0,encodedBodyBytes:e.encodedBodySize||0,decodedBodyBytes:e.decodedBodySize||0,durationMs:e.duration})),memory:performance.memory?{usedJSHeapSize:performance.memory.usedJSHeapSize,totalJSHeapSize:performance.memory.totalJSHeapSize,jsHeapSizeLimit:performance.memory.jsHeapSizeLimit}:null};
}'''
METRIC_NAMES=['TaskDuration','ScriptDuration','LayoutDuration','RecalcStyleDuration','LayoutCount','RecalcStyleCount','JSHeapUsedSize','JSHeapTotalSize','Nodes','JSEventListeners']

def metrics(cdp):
 return {m['name']:m['value'] for m in cdp.send('Performance.getMetrics')['metrics'] if m['name'] in METRIC_NAMES}

def summed_resources(page,network_bytes):
 data=page.evaluate(RESOURCE_JS)
 data['totals']={name:sum(e[name] for e in data['entries']) for name in ['transferBytes','encodedBodyBytes','decodedBodyBytes']}
 data['totals']['requests']=len(data['entries'])
 data['totals']['cdpObservedBytesAfterNavigation']=network_bytes[0]
 images=[e for e in data['entries'] if e['type']=='img']
 data['images']={'requests':len(images),**{name:sum(e[name] for e in images) for name in ['transferBytes','encodedBodyBytes','decodedBodyBytes']}}
 return data

def cls(shifts):
 maximum=0;session=0;first=0;previous=0
 for entry in shifts:
  if entry['hadRecentInput']:continue
  at=entry['startTime']
  if at-previous>1000 or at-first>5000: session=0;first=at
  session+=entry['value'];previous=at;maximum=max(maximum,session)
 return round(maximum,6)

def vitals(page):
 data=page.evaluate('window.__homepagePerf')
 data['FCP_ms']=next((e['startTime'] for e in data['paints'] if e['name']=='first-contentful-paint'),None)
 data['LCP_ms']=data['lcp'][-1]['startTime'] if data['lcp'] else None
 data['CLS']=cls(data['shifts'])
 data['longTaskCount']=len(data['longTasks'])
 data['longTaskTotal_ms']=sum(e['duration'] for e in data['longTasks'])
 data['longTaskMax_ms']=max((e['duration'] for e in data['longTasks']),default=0)
 return data

def idle(page,cdp,seconds=6):
 page.evaluate('''() => {window.__rootMutations={style:0,class:0};window.__rootMutationObserver?.disconnect();window.__rootMutationObserver=new MutationObserver(list=>{for(const e of list)window.__rootMutations[e.attributeName]++});window.__rootMutationObserver.observe(document.querySelector('.raccn-home'),{attributes:true,attributeFilter:['style','class']})}''')
 before=metrics(cdp)
 rafBefore=page.evaluate("({...window.__homepagePerf.raf})")
 page.wait_for_timeout(seconds*1000)
 after=metrics(cdp)
 observation=page.evaluate('''()=>({rootMutations:window.__rootMutations,ambientSignal:document.querySelector('.raccn-home').classList.contains('is-signal-passing'),heroVisible:document.querySelector('.raccn-home').classList.contains('is-hero-visible'),currentAct:document.querySelector('.raccn-home').dataset.currentAct,visibleActs:[...document.querySelectorAll('[data-home-act][data-in-view="true"]')].map(n=>n.dataset.homeAct),rafTotals:window.__homepagePerf.raf,visibility:document.visibilityState,mode:document.querySelector('.raccn-home').dataset.motion,animationPlayStates:[...new Set([...document.querySelectorAll('.hp-control-plane *')].map(n=>getComputedStyle(n).animationPlayState))]})''')
 observation['rafDuringIdle']={name:observation['rafTotals'][name]-rafBefore[name] for name in rafBefore}
 return {'seconds':seconds,'delta':{name:after[name]-before.get(name,0) for name in after if name not in ['JSHeapUsedSize','JSHeapTotalSize','Nodes','JSEventListeners']},'after':after,**observation}

report={'url':URL,'measuredAtUTC':datetime.now(timezone.utc).isoformat(),'method':{'browser':'Chromium / Playwright','build':'Production Vite output served by Django','networkThrottle':'none; localhost','cpuThrottle':'none','cache':'Disabled through Playwright routing; fresh browser context per profile','mobileProfile':'Touch/mobile is emulated on the same local Chromium host, not measured on physical mobile hardware.','runsPerProfile':1,'idleWindowSeconds':6,'idleLocations':'Hero initially; Start section after full scroll with the hero offscreen. Desktop may run one finite current-section ambient event in either six-second window.','rafMethod':'requestAnimationFrame calls and callbacks instrumented before navigation; idle-window differences reported.','note':'Single local lab samples, not field Core Web Vitals or a comparable before/after benchmark. CDP TaskDuration is renderer main-thread CPU time; GPU/compositor costs are not included. Other local review/browser activity was not isolated, so timing and CPU samples are indicative.'},'profiles':[]}
report["tabHiddenSourceReview"]={'verifiedBy': 'Source inspection only', 'files': ['app/src/home/useHomeMotion.js', 'app/src/home/home-refinement.css', 'app/src/home/home-journey.css'], 'behavior': 'visibilitychange clears ambient timers and pending scroll RAF, toggles is-document-hidden, and CSS pauses descendant animations. Runtime hidden-tab state could not be produced by this headless browser.'}
with sync_playwright() as p:
 browser=p.chromium.launch()
 report['browserVersion']=browser.version
 for name,width,height,dpr,touch,reduced in [('desktop',1440,1000,1,False,False),('mobile_touch',390,844,3,True,False),('desktop_reduced_motion',1440,1000,1,False,True)]:
  context=browser.new_context(viewport={'width':width,'height':height},device_scale_factor=dpr,is_mobile=touch,has_touch=touch,reduced_motion='reduce' if reduced else 'no-preference')
  context.add_init_script(INIT)
  # Routing disables the HTTP cache before navigation without a pre-navigation
  # CDP session, which can interfere with touch emulation across a COOP swap.
  context.route('**/*',lambda route:route.continue_())
  page=context.new_page()
  network_bytes=[0]
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('response',lambda r:errors.append('HTTP '+str(r.status)+' '+r.url) if r.status>=400 else None)
  page.goto(URL,wait_until='networkidle');page.evaluate('document.fonts.ready');page.wait_for_timeout(1400)
  cdp=context.new_cdp_session(page)
  cdp.send('Performance.enable');cdp.send('Network.enable')
  cdp.on('Network.loadingFinished',lambda e:network_bytes.__setitem__(0,network_bytes[0]+e.get('encodedDataLength',0)))
  emulation=page.evaluate('()=>({coarsePointer:matchMedia("(pointer: coarse)").matches,touchPoints:navigator.maxTouchPoints,devicePixelRatio,mode:document.querySelector(".raccn-home").dataset.motion})')
  assert emulation['coarsePointer']==touch,emulation
  assert emulation['devicePixelRatio']==dpr,emulation
  profile={'name':name,'viewport':{'width':width,'height':height},'deviceScaleFactor':dpr,'touch':touch,'reducedMotion':reduced,'assets':page.locator('script[src],link[rel="stylesheet"]').evaluate_all('(ns)=>ns.map(n=>n.src||n.href)')}
  profile['verifiedEmulation']=emulation
  profile['initial']={'vitals':vitals(page),'resources':summed_resources(page,network_bytes)}
  profile['idleVisible']=idle(page,cdp)
  total=page.evaluate('document.documentElement.scrollHeight')
  for y in range(0,total,height//2):
   page.evaluate('y=>window.scrollTo({top:y,behavior:"instant"})',y);page.wait_for_timeout(65)
  page.evaluate('window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})')
  page.wait_for_timeout(500)
  profile['fullScroll']={'vitals':vitals(page),'resources':summed_resources(page,network_bytes),'images':page.locator('img').evaluate_all('(ns)=>ns.map(n=>({url:n.currentSrc,complete:n.complete,naturalWidth:n.naturalWidth,naturalHeight:n.naturalHeight}))')}
  profile['idleOffscreen']=idle(page,cdp)
  # A genuine background page is attempted; headless Chromium often keeps pages visible.
  if name=='desktop':
   foreground=context.new_page();foreground.goto('about:blank');foreground.bring_to_front();page.wait_for_timeout(200)
   actual=page.evaluate('document.visibilityState')
   profile['tabHiddenCheck']={'observedVisibility':actual,'verified':actual=='hidden','note':'A second tab was brought to front. Headless Chromium did not expose hidden visibility.' if actual!='hidden' else 'Verified using a genuine foreground second tab.','documentHiddenClass':page.locator('.raccn-home').evaluate('(n)=>n.classList.contains("is-document-hidden")')}
   foreground.close()
  profile['errors']=errors
  report['profiles'].append(profile)
  (OUT/'performance.json').write_text(json.dumps(report,indent=2))
  print(name,json.dumps({'FCP_ms':profile['initial']['vitals']['FCP_ms'],'LCP_ms':profile['initial']['vitals']['LCP_ms'],'CLS':profile['fullScroll']['vitals']['CLS'],'initialEncodedBytes':profile['initial']['resources']['totals']['encodedBodyBytes'],'fullEncodedBytes':profile['fullScroll']['resources']['totals']['encodedBodyBytes'],'visibleScriptSeconds':profile['idleVisible']['delta'].get('ScriptDuration'),'offscreenScriptSeconds':profile['idleOffscreen']['delta'].get('ScriptDuration'),'visibleMutations':profile['idleVisible']['rootMutations'],'offscreenMutations':profile['idleOffscreen']['rootMutations'],'visibleRaf':profile['idleVisible']['rafDuringIdle'],'offscreenRaf':profile['idleOffscreen']['rafDuringIdle'],'errors':errors}),flush=True)
  context.close()
 browser.close()

lines=['# Homepage performance measurement','',f"Measured {report['measuredAtUTC']} against `{URL}` using production assets.",'','One fresh Chromium context per profile, HTTP cache disabled through Playwright request routing. Localhost, no CPU or network throttling. Touch/mobile is emulated on the same local Chromium host, not measured on physical mobile hardware. These are single lab samples; they are not field Core Web Vitals and do not establish an improvement against earlier measurements. Other local review/browser activity was not isolated, so timing and CPU samples are indicative.','','| Profile | FCP | LCP | CLS after scroll | Initial encoded body | Full-scroll encoded body | Long tasks after scroll |','| --- | ---: | ---: | ---: | ---: | ---: | ---: |']
for row in report['profiles']:
 v=row['initial']['vitals'];full=row['fullScroll']['vitals'];initial=row['initial']['resources']['totals'];resources=row['fullScroll']['resources']['totals']
 lines.append(f"| {row['name']} ({row['viewport']['width']}×{row['viewport']['height']}, DPR {row['deviceScaleFactor']}) | {v['FCP_ms']:.0f} ms | {v['LCP_ms']:.0f} ms | {full['CLS']:.6f} | {initial['encodedBodyBytes']/1024:.1f} KiB | {resources['encodedBodyBytes']/1024:.1f} KiB | {full['longTaskCount']} / {full['longTaskTotal_ms']:.0f} ms |")
lines+=['','Six-second idle observations (CPU figures are CDP renderer main-thread time, excluding GPU/compositor work):','','| Profile | Hero task / script CPU | Start task / script CPU | Root style/class mutations: Hero → Start | RAF requests/executions: Hero → Start |','| --- | ---: | ---: | --- | --- |']
for row in report['profiles']:
 a=row['idleVisible'];b=row['idleOffscreen'];lines.append(f"| {row['name']} | {a['delta'].get('TaskDuration',0)*1000:.1f} / {a['delta'].get('ScriptDuration',0)*1000:.1f} ms | {b['delta'].get('TaskDuration',0)*1000:.1f} / {b['delta'].get('ScriptDuration',0)*1000:.1f} ms | {a['rootMutations']} → {b['rootMutations']} | {a['rafDuringIdle']} → {b['rafDuringIdle']} |")
lines+=['','Resource Timing measures initial and full-scroll transfer sizes; CDP is attached after navigation to preserve touch emulation across Django’s COOP origin change. The separate CDP byte count therefore covers only subsequent requests. Initial LCP is sampled before synthetic scrolling; later raw LCP entries are retained for inspection but are not reported as the initial-load metric. Full-scroll image requests, transfer bytes (including HTTP overhead), encoded and decoded body bytes, heap measurements, paint entries, layout shifts, long tasks, production asset names, errors, and raw CPU metrics are retained in `performance.json`. FCP/LCP are browser performance entries; CLS uses the maximum session window, excludes recent-input shifts, and includes the full scroll. Images are intentionally deferred until their section nears the viewport.','', 'Each visible desktop section schedules a finite ambient event with a single timer. The first idle window observes Hero; the second observes Start with Hero offscreen. Up to one finite ambient event can occur in either six-second window, so a class toggle at Start does not imply offscreen Hero work or a continuous animation loop. Touch and reduced-motion profiles disable ambient events. RAF calls and executed callbacks are instrumented before navigation and reported as differences during each idle window. Root style/class mutations and RAF counts detect continuous JavaScript-driven updates; they do not measure compositor animation cost.','','The tab-hidden check uses a real second tab brought to the front. If headless Chromium continues reporting `visible`, the JSON marks this check unverified; no synthetic visibility result is claimed. Source inspection confirms the visibilitychange listener clears ambient timers and pending scroll RAF, and the document-hidden class pauses descendant animations; that is not runtime verification.','','Reproduce from the repository root with the production Django server running:','','```bash','python3 homepage-review/motion-pass/measure-performance.py http://127.0.0.1:8001/','```','',f"Browser version: {report['browserVersion']}. Python Playwright and its Chromium browser must be installed. The script writes `performance.json` and this report alongside itself."]
(OUT/'PERFORMANCE.md').write_text('\n'.join(lines)+'\n')
