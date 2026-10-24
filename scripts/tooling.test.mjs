import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {join} from 'node:path';
import {assemble,root} from './build.mjs';
test('build is reproducible and generated HTML is current',async()=>{assert.equal(await assemble(),await readFile(join(root,'index.html'),'utf8'))});
test('localhost serves the editor but not repository files',async t=>{
 const child=spawn(process.execPath,[join(root,'scripts/dev.mjs'),'--port','0','--no-watch'],{cwd:root});let output='';
 t.after(()=>child.kill('SIGTERM'));
 const url=await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error('Server did not start')),8000);
  child.stdout.on('data',chunk=>{output+=chunk;const m=output.match(/http:\/\/localhost:\d+/);if(m){clearTimeout(timer);resolve(m[0])}});
  child.on('error',e=>{clearTimeout(timer);reject(e)});child.on('exit',code=>{clearTimeout(timer);reject(Error('Server exited '+code))});
 });
 const r=await fetch(url);assert.equal(r.status,200);assert.match(await r.text(),/Картограф/);
 assert.match(r.headers.get('content-type'),/text\/html/);
 assert.equal((await fetch(url+'/.git/config')).status,404);
 assert.equal((await fetch(url+'/package.json')).status,404);
 assert.equal((await fetch(url,{method:'POST'})).status,405);
 assert.equal((await fetch(url,{method:'HEAD'})).status,200);
});
