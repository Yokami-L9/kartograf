import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
R=Path(__file__).resolve().parents[1]
async def main():
 checks=[];errs=[]
 async with async_playwright() as p:
  b=await p.chromium.launch(executable_path='/usr/local/bin/chromium',args=['--no-sandbox'])
  ctx=await b.new_context(viewport={'width':1600,'height':1000},accept_downloads=True)
  pg=await ctx.new_page();pg.on('pageerror',lambda e:errs.append(str(e)));await pg.goto((R/'index.html').as_uri());await pg.wait_for_timeout(300)
  async def check(name,expr):
   ok=await pg.evaluate(expr);checks.append({'test':name,'pass':bool(ok)});assert ok,name
  async def house_click():
   pt=await pg.evaluate('''(()=>{const b=__k.state.buildings.find(b=>b.districtId&&!b.custom),v=__k.view,r=document.querySelector('#map').getBoundingClientRect();window.activeId=b.id;return{x:r.left+v.x+b.pts.reduce((s,q)=>s+q[0],0)/4*v.s,y:r.top+v.y+b.pts.reduce((s,q)=>s+q[1],0)/4*v.s}})()''');await pg.keyboard.press('v');await pg.mouse.click(pt['x'],pt['y'])
  await house_click();await pg.click('[data-scol="#c9a14a"]');await check('Roof swatch protects manual change','__k.state.buildings.find(b=>b.id===activeId).custom===true')
  await pg.evaluate('__k.selectDistrict(__k.state.buildings.find(b=>b.id===activeId).districtId)');await pg.click('#shuffleDistrict');await check('Swatch survives regeneration','__k.state.buildings.find(b=>b.id===activeId).color==="#c9a14a"')
  await house_click();await pg.evaluate('window.deletedPts=__k.state.buildings.find(b=>b.id===activeId).pts;window.deletedDistrict=__k.state.buildings.find(b=>b.id===activeId).districtId');await pg.keyboard.press('Delete');await pg.evaluate('__k.selectDistrict(window.deletedDistrict)');await pg.click('#shuffleDistrict')
  await check('Deleted lot remains excluded','!__k.state.buildings.filter(b=>b.districtId===deletedDistrict).some(b=>__k.polysMeet(b.pts,deletedPts,0))')
  await check('Exclusions stored in project','__k.state.districts.find(d=>d.id===deletedDistrict).exclusions.length===1')
  await pg.evaluate('__k.loadSandboxDemo();__k.setTool("select");__k.fit()');await pg.wait_for_timeout(2100)
  # Style gallery with deterministic generated regions on an empty map.
  await pg.evaluate('''(()=>{const s=JSON.parse(__k.snap());for(const k of ['hillOps','waterOps','groundOps','rivers','roads','buildings','walls','trees','stamps','labels','districts','partitions'])s[k]=[];s.name='Архитектурные наборы';__k.restore(JSON.stringify(s));['medieval','village','nordic','desert','arcane'].forEach((style,i)=>{const x=120+i*380;__k.state.roads.push({id:9000+i,pts:[[x,350],[x+280,350]],w:14});const d=__k.makeDistrict([[x-10,200],[x+300,200],[x+300,580],[x-10,580]],{style,name:['Старый город','Деревня','Север','Южный город','Магический'][i],seed:100+i,plotSize:54,density:100});__k.generateDistrict(d)});__k.invalidate(true);__k.commit();__k.fit()})()''')
  await check('All five styles generate usable buildings',"['medieval','village','nordic','desert','arcane'].every(s=>__k.state.buildings.filter(b=>b.style===s).length>=4)")
  await pg.evaluate('__k.fit()');await pg.wait_for_timeout(200);await pg.screenshot(path=str(R/'qa/styles.png'))
  # Every kit through standalone placement in fresh space.
  await pg.evaluate('''(()=>{const s=JSON.parse(__k.snap());for(const k of ['hillOps','waterOps','groundOps','rivers','roads','buildings','walls','trees','stamps','labels','districts','partitions'])s[k]=[];__k.restore(JSON.stringify(s));__k.placeKit('tavern',330,500);__k.placeKit('shrine',750,500);__k.placeKit('farm',1150,500);__k.placeKit('camp',1630,500);__k.commit()})()''')
  await check('Four kits create editable objects','__k.state.buildings.length===4&&__k.state.stamps.length>25')
  await pg.evaluate('__k.state.roofMode="interior";__k.state.level=1;__k.invalidate(true);__k.renderPanel();__k.fit()');await pg.wait_for_timeout(200);await pg.screenshot(path=str(R/'qa/kits.png'))
  # Legacy project compatibility.
  legacy={'hillOps':[],'waterOps':[],'groundOps':[],'rivers':[],'roads':[],'buildings':[{'id':1,'kind':'house','pts':[[10,10],[50,10],[50,40],[10,40]],'h':18,'color':'#b4553f'}],'walls':[],'trees':[],'stamps':[],'labels':[],'light':40,'night':0,'grid':False}
  await pg.evaluate('s=>__k.restore(JSON.stringify(s))',legacy);await check('Version 1 project migrated','__k.state.schemaVersion===4&&__k.state.buildings[0].floors===1&&__k.state.districts.length===0')
  # Six-second animation download.
  await pg.evaluate('__k.loadSandboxDemo();__k.setTool("select");__k.fit();__k.renderPanel()');await pg.click('[data-inspector=scene]');await pg.locator('summary').click()
  async with pg.expect_download(timeout=25000) as dl:await pg.click('#exVid')
  await (await dl.value).save_as(str(R/'qa/animation.webm'));checks.append({'test':'Animation download produced','pass':(R/'qa/animation.webm').stat().st_size>1000})
  await pg.evaluate('__k.setTool("select");Object.assign(__k.view,{s:1.45,x:-1300,y:-350})');await pg.wait_for_timeout(2100);await pg.screenshot(path=str(R/'qa/delivery-exterior.png'))
  # Select tavern to show inspector, then interior.
  pt=await pg.evaluate('''(()=>{const b=__k.state.buildings.find(b=>!b.districtId&&b.kind==='house'),v=__k.view,r=document.querySelector('#map').getBoundingClientRect(),x=b.pts.reduce((s,q)=>s+q[0],0)/4,y=b.pts.reduce((s,q)=>s+q[1],0)/4;return{x:r.left+v.x+x*v.s,y:r.top+v.y+y*v.s}})()''');await pg.mouse.click(pt['x'],pt['y']);await pg.click('#roofBtn');await pg.wait_for_timeout(200);await pg.screenshot(path=str(R/'qa/delivery-interior.png'))
  checks.append({'test':'No browser exceptions','pass':not errs})
  (R/'qa/extended-results.json').write_text(json.dumps({'checks':checks,'errors':errs},ensure_ascii=False,indent=2));print(json.dumps({'passed':sum(c['pass'] for c in checks),'total':len(checks),'errors':errs}))
  await b.close()
asyncio.run(main())
