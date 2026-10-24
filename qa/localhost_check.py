import asyncio,subprocess,re,json
from pathlib import Path
from playwright.async_api import async_playwright
R=Path(__file__).resolve().parents[1]
async def main():
 server=subprocess.Popen(['node','scripts/dev.mjs','--port','0'],cwd=R,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
 original=(R/'src/5_boot.js').read_text()
 try:
  url=None
  for _ in range(8):
   line=server.stdout.readline();m=re.search(r'http://localhost:\d+',line)
   if m:url=m.group();break
  assert url,'Server did not start'
  async with async_playwright() as p:
   b=await p.chromium.launch(executable_path='/usr/local/bin/chromium',args=['--no-sandbox']);pg=await b.new_page(viewport={'width':1440,'height':960});errs=[]
   pg.on('pageerror',lambda e:errs.append(str(e)))
   await pg.goto(url);await pg.wait_for_function('window.__k && __k.state.buildings.length>40')
   assert await pg.evaluate('__k.state.districts.length===3')
   await pg.fill('#sceneName','Проверка localhost');await pg.locator('#sceneName').press('Tab')
   await pg.reload();await pg.wait_for_function('window.__k && __k.state.name==="Проверка localhost"')
   (R/'src/5_boot.js').write_text(original+'\nwindow.__devReloadProof=1;\n')
   await pg.wait_for_function('window.__devReloadProof===1',timeout=10000)
   assert await pg.evaluate('__k.state.name==="Проверка localhost"')
   (R/'src/5_boot.js').write_text(original)
   await pg.wait_for_function('window.__k && !window.__devReloadProof',timeout=10000)
   async with pg.expect_download() as d:await pg.click('#exportPng')
   file=await d.value;assert file.suggested_filename=='karta.png'
   assert not errs,errs
   print(json.dumps({'editor_on_localhost':'passed','autosave_after_reload':'passed','source_live_reload':'passed','data_retained_after_live_reload':'passed','png_download':'passed','browser_errors':errs}))
   await b.close()
 finally:
  (R/'src/5_boot.js').write_text(original);server.terminate();server.wait(timeout=5)
  subprocess.run(['node','scripts/build.mjs'],cwd=R,check=True,stdout=subprocess.DEVNULL)
asyncio.run(main())
