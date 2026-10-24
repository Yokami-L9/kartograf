"""Studio 03 browser QA. Requires Python Playwright + system Chromium; no npm dependencies."""
import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright
R=Path(__file__).resolve().parents[1]
async def main():
 checks=[];errors=[];network=[]
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path=os.environ.get('CHROMIUM','/usr/local/bin/chromium'),args=['--no-sandbox'])
  ctx=await b.new_context(viewport={'width':1600,'height':1000},accept_downloads=True)
  pg=await ctx.new_page();pg.on('pageerror',lambda e:errors.append(str(e)));pg.on('request',lambda r:network.append(r.url) if r.url.startswith('http') else None)
  await pg.goto((R/'index.html').as_uri());await pg.wait_for_function('window.__k');await pg.wait_for_timeout(500)
  async def check(name,expr):
   ok=await pg.evaluate(expr);checks.append({'test':name,'pass':bool(ok)});assert ok,name
  async def capture(name):await pg.screenshot(path=str(R/'qa'/('studio-'+name+'.png')))
  async def point(x,y):return await pg.evaluate('([x,y])=>{const r=map.getBoundingClientRect(),v=__k.view;return [r.left+v.x+x*v.s,r.top+v.y+y*v.s]}',[x,y])
  async def click(x,y):await pg.mouse.click(*(await point(x,y)))
  async def drag(a,z):
   await pg.mouse.move(*(await point(*a)));await pg.mouse.down();await pg.mouse.move(*(await point(*z)),steps=14);await pg.mouse.up()
  await check('Catalog unique and complete','__k.catalog.length>=90&&new Set(__k.catalog.map(a=>a.id)).size===__k.catalog.length')
  count=await pg.evaluate('__k.catalog.length')
  await capture('overview')
  for cat in ['terrain','roads','buildings','nature','props','interior','effects']:
   await pg.select_option('#libCategory',cat)
   await check('Category '+cat,f'document.querySelectorAll("[data-asset]").length===__k.catalog.filter(a=>a.cat==="{cat}").length')
   await check('Thumbnails '+cat,'[...document.querySelectorAll(".assetPreview")].every(i=>i.complete&&i.naturalWidth===192)')
  await pg.fill('#librarySearch','фонтан');await check('Global search outside active category','document.querySelectorAll("[data-asset]").length===1&&document.querySelector("[data-asset]").dataset.asset==="object-fountain"')
  await pg.click('[data-favorite="object-fountain"]');await pg.select_option('#libCategory','favorites');await check('Favorite filter','document.querySelectorAll("[data-asset]").length===1')
  await pg.reload();await pg.wait_for_function('window.__k');await pg.select_option('#libCategory','favorites');await check('Favorites persist','document.querySelector("[data-asset]").dataset.asset==="object-fountain"')
  await pg.fill('#librarySearch','ничегоненайдено');await check('Search empty state','!!document.querySelector(".libEmpty")');await capture('empty')
  await pg.click('#clearSearch');await pg.select_option('#libCategory','effects');await capture('effects-library')
  await pg.evaluate('''(()=>{const s=JSON.parse(__k.snap());for(const k of ['hillOps','waterOps','groundOps','rivers','roads','buildings','walls','trees','stamps','labels','districts','partitions'])s[k]=[];__k.restore(JSON.stringify(s));__k.commit();__k.fit()})()''')
  await pg.evaluate('__k.useAsset("road-boardwalk")');await drag((220,300),(650,300));await check('Road material through pointer','__k.state.roads.length===1&&__k.state.roads[0].mat==="boardwalk"')
  await pg.evaluate('__k.useAsset("tree-pine")');await click(450,550);await check('Tree species through pointer','__k.state.trees.at(-1).type==="pine"')
  await pg.keyboard.press('v');await click(450,550);await pg.select_option('#studio-tree-selected','willow');await check('Tree species inspector','__k.state.trees.at(-1).type==="willow"')
  await pg.evaluate('__k.useAsset("object-fountain")');await pg.locator('#o-placeRot').evaluate('(e)=>{e.value=45;e.dispatchEvent(new Event("input",{bubbles:true}))}');await click(900,650)
  await check('Object placement and rotation','__k.state.stamps.at(-1).type==="fountain"&&__k.state.stamps.at(-1).rot===45')
  await pg.evaluate('__k.useAsset("object-mushrooms")');await pg.check('#scatter-enabled');await pg.check('#scatter-random');before=await pg.evaluate('__k.state.stamps.length');await drag((1100,800),(1500,800))
  await check('Scatter places multiple objects',f'__k.state.stamps.length>{before+2}')
  await pg.click('#undo');await check('Scatter undone in one operation',f'__k.state.stamps.length==={before}');await pg.click('#redo');await check('Scatter redo',f'__k.state.stamps.length>{before+2}')
  await pg.click('[data-inspector="scene"]');await pg.select_option('#scene-weather','rain');await pg.click('#motionBtn');await check('Weather and pause controls','__k.state.weather==="rain"&&__k.state.motion===false')
  await check('Paused rendering deterministic','__k.renderTo(.2).toDataURL()===__k.renderTo(.2).toDataURL()')
  await check('Animated object changes frames','(()=>{const c=document.createElement("canvas");c.width=c.height=100;const x=c.getContext("2d"),s={type:"windmill",x:50,y:50,s:1,rot:0,v:1};__k.state.motion=true;__k.drawStamp(x,s,1);const a=c.toDataURL();x.clearRect(0,0,100,100);__k.drawStamp(x,s,2);__k.state.motion=false;return a!==c.toDataURL()})()')
  await check('Settings roundtrip','(()=>{const j=__k.snap();__k.restore(j);return __k.state.weather==="rain"&&__k.state.motion===false&&__k.state.trees[0].type==="willow"&&__k.state.roads[0].mat==="boardwalk"})()')
  await pg.click('[data-inspector="layers"]');await pg.uncheck('[data-layer="props"]');await check('Hidden objects excluded from hit test','__k.hit(900,650)===null')
  await check('Hidden props renderer empty','(()=>{const c=document.createElement("canvas");c.width=100;c.height=100;const x=c.getContext("2d");__k.drawStamp(x,{type:"fountain",x:50,y:50,s:1,v:1},0);return !x.getImageData(0,0,100,100).data.some(v=>v)})()')
  await check('Layer state roundtrip','(()=>{const j=__k.snap();__k.restore(j);return __k.state.layers.props===false})()');await pg.click('#layers-all');await capture('layers')
  await pg.evaluate('__k.studio.inspector="properties";__k.setTool("measure")');before=await pg.evaluate('__k.snap()');await drag((400,450),(800,450))
  await check('Ruler measures without map mutation','__k.measurement&&Math.abs(__k.measurement.b[0]-__k.measurement.a[0]-400)<2')
  assert before==await pg.evaluate('__k.snap()');checks.append({'test':'Measurement does not dirty map','pass':True});await capture('ruler');await pg.keyboard.press('Escape');await check('Escape clears ruler','__k.measurement===null')
  # All catalog items must survive JSON validation; old map defaults remain sensible.
  await check('Every object validates and renders','(()=>{for(const a of __k.catalog.filter(a=>a.kind==="stamp"))__k.addStamp(a.stamp,500,500,1,0);const s=__k.validateMap(JSON.parse(__k.snap()));return s.stamps.length===__k.state.stamps.length})()')
  await check('Legacy settings migrated','(()=>{const s=JSON.parse(__k.snap());delete s.layers;delete s.weather;delete s.motion;const r=__k.validateMap(s);return r.schemaVersion===4&&r.weather==="clear"&&r.motion&&r.layers.props})()')
  # Rich close-up, real controls and animated renderers, no paint-only mockups.
  await pg.evaluate('''__k.loadSandboxDemo();__k.studio.inspector='properties';__k.useAsset('object-portal');Object.assign(__k.view,{s:1.1,x:-1050,y:-300})''');await pg.wait_for_timeout(350);await capture('detail')
  await pg.click('[data-inspector="scene"]');await pg.select_option('#scene-weather','fog');await pg.click('#nightBtn');await capture('night-fog')
  await pg.emulate_media(color_scheme='dark');await capture('dark');await pg.emulate_media(color_scheme='light')
  await pg.click('#nightBtn');await pg.select_option('#scene-weather','snow');await capture('snow');await pg.click('#roofBtn');await capture('interior')
  await pg.evaluate('__k.state.weather="clear";__k.state.night=0;__k.setTool("select");__k.fit()');await pg.click('#helpBtn');await capture('help');await pg.click('.closeHelp')
  mobile=await ctx.new_page();await mobile.set_viewport_size({'width':390,'height':844});mobile.on('pageerror',lambda e:errors.append('Mobile '+str(e)))
  await mobile.goto((R/'index.html').as_uri());await mobile.wait_for_function('window.__k');await mobile.screenshot(path=str(R/'qa/studio-mobile.png'))
  assert await mobile.evaluate('document.documentElement.scrollWidth<=innerWidth');checks.append({'test':'Mobile no horizontal overflow','pass':True})
  await mobile.click('#libraryToggle');await mobile.select_option('#libCategory','nature');await mobile.screenshot(path=str(R/'qa/studio-mobile-library.png'));await mobile.click('[data-asset="tree-pine"]')
  assert not await mobile.locator('#library').is_visible();checks.append({'test':'Mobile library closes on choice','pass':True})
  await mobile.click('#panelToggle');await mobile.click('[data-inspector="scene"]');await mobile.screenshot(path=str(R/'qa/studio-mobile-scene.png'))
  assert await mobile.locator('#scene-weather').is_visible();checks.append({'test':'Mobile scene controls reachable','pass':True})
  await mobile.click('#libraryToggle');assert not await mobile.locator('#panel').is_visible();await mobile.click('#panelToggle');assert not await mobile.locator('#library').is_visible();checks.append({'test':'Drawers mutually exclusive','pass':True})
  await pg.emulate_media(reduced_motion='reduce');await pg.reload();await pg.wait_for_function('window.__k');await check('Reduced motion renderer valid','__k.renderTo(1,2).width===2000')
  checks.append({'test':'No external requests','pass':not network});checks.append({'test':'No JavaScript errors','pass':not errors})
  result={'catalog':count,'checks':checks,'errors':errors,'network':network};(R/'qa/studio-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps({'passed':sum(q['pass'] for q in checks),'total':len(checks),'catalog':count,'errors':errors}));assert not errors
  await b.close()
asyncio.run(main())
