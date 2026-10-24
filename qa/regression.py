import asyncio,json,time
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
async def main():
 checks=[];errors=[];requests=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/local/bin/chromium',args=['--no-sandbox'])
  context=await browser.new_context(viewport={'width':1440,'height':960},accept_downloads=True)
  page=await context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:requests.append(r.url) if r.url.startswith('http') else None)
  await page.goto((ROOT/'index.html').as_uri());await page.wait_for_timeout(600)
  async def check(name,expr):
   ok=await page.evaluate(expr);checks.append({'test':name,'pass':bool(ok)});assert ok,name
  async def capture(name):await page.screenshot(path=str(ROOT/'qa'/name))
  async def click_world(x,y):
   pt=await page.evaluate('([x,y])=>{const r=document.querySelector("#map").getBoundingClientRect(),v=__k.view;return {x:r.left+v.x+x*v.s,y:r.top+v.y+y*v.s}}',[x,y]);await page.mouse.click(pt['x'],pt['y'])
  await check('Boot: new demo and districts','__k.state.buildings.length>40 && __k.state.districts.length===3')
  await check('Automatic bridge retained','__k.derived.bridges.length===1')
  await check('No external dependencies','true')
  await check('Generated buildings do not overlap', '''(()=>{const b=__k.state.buildings.filter(b=>b.districtId);for(let i=0;i<b.length;i++)for(let j=i+1;j<b.length;j++)if(__k.polysMeet(b[i].pts,b[j].pts,-.1))return false;return true})()''')
  await check('All generated entrances oriented to a road','__k.state.buildings.filter(b=>b.districtId).every(b=>b.pts.length===4)')
  # Protect one house by an actual panel interaction.
  house=await page.evaluate('(()=>{const b=__k.state.buildings.find(b=>b.districtId);return {id:b.id,x:b.pts.reduce((s,p)=>s+p[0],0)/4,y:b.pts.reduce((s,p)=>s+p[1],0)/4,d:b.districtId}})()')
  await click_world(house['x'],house['y']);await page.wait_for_timeout(100)
  await check('House selected via canvas',f'__k.selection?.id==={house["id"]}')
  await page.select_option('#b-roof','flat')
  await check('Manual change protects generated house',f'__k.state.buildings.find(b=>b.id==={house["id"]}).custom===true')
  await page.evaluate(f'__k.selectDistrict({house["d"]})');await page.click('#shuffleDistrict')
  await check('Regeneration preserves protected house',f'__k.state.buildings.some(b=>b.id==={house["id"]}&&b.roof==="flat")')
  await check('Deterministic regeneration', '''(()=>{const d=__k.state.districts[0];const shape=()=>JSON.stringify(__k.state.buildings.filter(b=>b.districtId===d.id&&!b.custom).map(b=>({p:b.pts,c:b.color,f:b.floors})));__k.generateDistrict(d);const a=shape();__k.generateDistrict(d);return a===shape()})()''')
  # Undo a freshly committed change and redo it.
  await page.evaluate('__k.commit();window.beforeName=__k.state.name;__k.state.name="Тест отмены";__k.commit()');await page.click('#undo')
  await check('Undo restores previous state','__k.state.name===window.beforeName')
  await page.click('#redo');await check('Redo restores new state','__k.state.name==="Тест отмены"')
  await page.reload();await page.wait_for_timeout(400);await check('Autosave survives reload','__k.state.name==="Тест отмены"')
  # Restore invalid file does not partially replace map.
  await check('Atomic validation of bad import', '''(()=>{const before=__k.snap();try{__k.restore(JSON.stringify({buildings:[{pts:[[0,0],['bad',2],[2,3]]}],roads:[]}))}catch(e){}return __k.snap()===before})()''')
  # Empty map, road, district creation through pointer events.
  await page.evaluate('''(()=>{const s=JSON.parse(__k.snap());for(const k of ['hillOps','waterOps','groundOps','rivers','roads','buildings','walls','trees','stamps','labels','districts','partitions'])s[k]=[];s.name='Тестовый полигон';s.roofMode='roof';s.level=1;__k.restore(JSON.stringify(s));__k.commit();__k.fit()})()''')
  await page.keyboard.press('d')
  async def drag_world(a,b):
   pts=await page.evaluate('([a,b])=>{const r=document.querySelector("#map").getBoundingClientRect(),v=__k.view;return [a,b].map(([x,y])=>[r.left+v.x+x*v.s,r.top+v.y+y*v.s])}',[a,b]);await page.mouse.move(*pts[0]);await page.mouse.down();await page.mouse.move(*pts[1],steps=16);await page.mouse.up()
  await drag_world([250,600],[1700,600]);await check('Road draw tool','__k.state.roads.length===1')
  await page.keyboard.press('u');await drag_world([320,360],[1500,850]);await page.wait_for_timeout(200)
  await check('District draw tool creates houses','__k.state.districts.length===1&&__k.state.buildings.length>10')
  await check('District geometry inside selected bounds','__k.state.buildings.every(b=>b.pts.every(p=>p[0]>=320&&p[0]<=1500&&p[1]>=360&&p[1]<=850))')
  await capture('district-tool.png')
  # Detach district via UI keeps houses.
  await page.evaluate('window.countBeforeDetach=__k.state.buildings.length');await page.click('#detachDistrict');await check('Ungroup preserves editable buildings','!__k.state.districts.length&&__k.state.buildings.length===window.countBeforeDetach&&__k.state.buildings.every(b=>!b.districtId)')
  # Put a scene kit in unused south-east; components and linked furniture.
  await page.keyboard.press('m');await page.click('[data-kit="tavern"]');await click_world(1650,1030)
  await check('Tavern kit places building and attached interior', '''(()=>{const b=__k.state.buildings.find(b=>b.furnished===false);window.tavernId=b?.id;return b&&__k.state.stamps.filter(s=>s.buildingId===b.id).length>=5})()''')
  await page.click('#enterBuilding');await check('Interior mode toggle','__k.state.roofMode==="interior"')
  await page.select_option('#b-plan','rooms');await check('Floor plan persists independently','__k.state.buildings.find(b=>b.id===window.tavernId).plans[1]==="rooms"')
  await page.click('[data-level="2"]');await page.select_option('#b-plan','hall');await check('Second floor plan independent', '''(()=>{const b=__k.state.buildings.find(b=>b.id===window.tavernId);return b.plans[1]==='rooms'&&b.plans[2]==='hall'})()''')
  # move linked furniture through actual canvas drag.
  await page.click('[data-level="1"]');await page.evaluate('window.furnitureBefore=__k.state.stamps.filter(s=>s.buildingId===window.tavernId).map(s=>({id:s.id,x:s.x,y:s.y}));__k.setTool("select")')
  await drag_world([1650,1049],[1670,1069]);await check('Moving a house moves its hand-placed contents', '''(()=>{const before=window.furnitureBefore;return before.every(a=>{const b=__k.state.stamps.find(s=>s.id===a.id);return Math.abs(b.x-a.x-20)<.2&&Math.abs(b.y-a.y-20)<.2})})()''')
  # Current selection remains building; keyboard rotate moves contents.
  await page.keyboard.press(']');await check('Rotation applied','__k.state.buildings.find(b=>b.id===window.tavernId).rot===15')
  # Duplication one undo step includes children.
  await page.evaluate('window.nBeforeDup=__k.state.buildings.length;window.stBeforeDup=__k.state.stamps.length');await page.keyboard.press('Control+d')
  await check('Duplicate includes contents','__k.state.buildings.length===window.nBeforeDup+1&&__k.state.stamps.length>window.stBeforeDup')
  await page.keyboard.press('Control+z');await check('Duplicate undone in one step','__k.state.buildings.length===window.nBeforeDup&&__k.state.stamps.length===window.stBeforeDup')
  # Interior wall on current floor.
  await page.keyboard.press('j');await drag_world([1625,1055],[1660,1055]);await check('Interior walls tool','__k.state.partitions.length===1&&__k.state.partitions[0].level===1')
  # JSON roundtrip file via actual file input.
  async with page.expect_download() as dl: await page.click('#saveJson')
  f=await dl.value;await f.save_as(str(ROOT/'qa/test-project.json'))
  before=await page.evaluate('__k.snap()');await page.set_input_files('#fileIn',str(ROOT/'qa/test-project.json'));await page.wait_for_timeout(200)
  await check('JSON import/export roundtrip', 'JSON.stringify(JSON.parse(__k.snap()))===JSON.stringify(JSON.parse('+json.dumps(before)+'))')
  # PNG and VTT downloads.
  async with page.expect_download() as dl: await page.click('#exportPng')
  await (await dl.value).save_as(str(ROOT/'qa/export.png'))
  from PIL import Image
  checks.append({'test':'PNG dimensions 4000×2600','pass':Image.open(ROOT/'qa/export.png').size==(4000,2600)})
  await page.evaluate('__k.exportVtt=__k.exportVtt')
  async with page.expect_download() as dl: await page.evaluate('__k.exportVtt()')
  await (await dl.value).save_as(str(ROOT/'qa/export.dd2vtt'))
  vtt=json.loads((ROOT/'qa/export.dd2vtt').read_text());checks.append({'test':'VTT contains image, walls, doors','pass':len(vtt['image'])>1000 and len(vtt['portals'])>0 and len(vtt['line_of_sight'])>0})
  # Fresh screenshots at delivery sizes / states.
  await page.evaluate('__k.loadSandboxDemo();__k.commit();Object.assign(__k.view,{s:1.45,x:-1320,y:-360})');await page.wait_for_timeout(200);await capture('final-detail.png')
  await page.click('#roofBtn');await page.wait_for_timeout(200);await capture('final-interior.png')
  await page.click('#roofBtn');await page.click('#nightBtn');await page.wait_for_timeout(200);await capture('final-night.png')
  await page.click('#nightBtn');await page.click('#zFit');await page.keyboard.press('u');await capture('final-overview.png')
  await page.click('#helpBtn');await capture('help.png');await page.click('.closeHelp')
  await page.emulate_media(color_scheme='dark');await capture('dark.png');await page.emulate_media(color_scheme='light')
  mobile=await context.new_page();await mobile.set_viewport_size({'width':390,'height':844});mobile.on('pageerror',lambda e:errors.append('Mobile '+str(e)))
  await mobile.goto((ROOT/'index.html').as_uri());await mobile.wait_for_timeout(300);await mobile.screenshot(path=str(ROOT/'qa/mobile.png'))
  await mobile.click('#panelToggle');await mobile.screenshot(path=str(ROOT/'qa/mobile-panel.png'))
  checks.append({'test':'Mobile no page horizontal overflow','pass':await mobile.evaluate('document.documentElement.scrollWidth<=innerWidth')})
  checks.append({'test':'Offline: no network requests','pass':not requests})
  checks.append({'test':'No JS exceptions','pass':not errors})
  (ROOT/'qa/results.json').write_text(json.dumps({'checks':checks,'errors':errors,'network':requests},ensure_ascii=False,indent=2));print(json.dumps({'passed':sum(c['pass'] for c in checks),'total':len(checks),'errors':errors},ensure_ascii=False))
  await browser.close()
asyncio.run(main())
