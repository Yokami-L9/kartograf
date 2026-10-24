import {createServer} from 'node:http';
import {watch} from 'node:fs';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {build,root} from './build.mjs';
const args=process.argv.slice(2),at=args.indexOf('--port');
const port=Number(at>=0?args[at+1]:(process.env.PORT||5173));
if(!Number.isInteger(port)||port<0||port>65535){console.error('Invalid port. Example: npm run dev -- --port 5174');process.exit(1)}
let html;
try{html=await build()}catch(e){console.error('Build failed: '+e.message);process.exit(1)}
const live=!args.includes('--no-watch'),clients=new Set();let rebuilding=false,pending=false,timer;
const liveScript=`<script type="module">const events=new EventSource('/__kartograf_events');events.addEventListener('reload',()=>location.reload());window.addEventListener('pagehide',()=>events.close());</script>`;
const server=createServer((req,res)=>{
 let url;try{url=new URL(req.url,'http://localhost')}catch{res.writeHead(400).end();return}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'}).end();return}
 if(url.pathname==='/__kartograf_events'&&live&&req.method==='GET'){
  res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive','X-Content-Type-Options':'nosniff'});res.write('retry: 1000\n\n');clients.add(res);req.on('close',()=>clients.delete(res));return;
 }
 if(url.pathname!=='/'&&url.pathname!=='/index.html'){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'}).end('Not found');return}
 const body=live?html.replace('</body>',liveScript+'\n</body>'):html;
 res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Length':Buffer.byteLength(body)});res.end(req.method==='HEAD'?undefined:body);
});
async function rebuild(){
 if(rebuilding){pending=true;return}rebuilding=true;
 try{html=await build();for(const c of clients)c.write('event: reload\ndata: changed\n\n');console.log('Rebuilt · '+new Date().toLocaleTimeString())}catch(e){console.error('Build failed (previous working version kept): '+e.message)}
 finally{rebuilding=false;if(pending){pending=false;rebuild()}}
}
let watcher;
if(live)watcher=watch(join(root,'src'),{recursive:true},()=>{clearTimeout(timer);timer=setTimeout(rebuild,100)});
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`Port ${port} is busy. Stop the other server or use: npm run dev -- --port 5174`:e.message);watcher?.close();process.exitCode=1});
server.listen(port,'127.0.0.1',()=>{
 const url=`http://localhost:${server.address().port}`;
 console.log(`\nКартограф · Studio 03\n${url}\n${live?'Live reload is on. Edit files in src/.':'Static local mode.'}\nStop: Control+C\n`);
 if(args.includes('--open')){
  const bin=process.platform==='darwin'?'open':process.platform==='win32'?'cmd':'xdg-open';
  const params=process.platform==='win32'?['/c','start','',url]:[url];
  const child=spawn(bin,params,{stdio:'ignore'});child.on('error',()=>console.log('Open the URL above in your browser.'));child.unref();
 }
});
function stop(){clearTimeout(timer);watcher?.close();for(const c of clients)c.end();server.close(()=>process.exit(0));setTimeout(()=>process.exit(0),1000).unref()}
process.on('SIGINT',stop);process.on('SIGTERM',stop);
