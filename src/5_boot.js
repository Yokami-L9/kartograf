/* ---------- loop ---------- */
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let t0=performance.now();
function frame(now){const t=reduce?0:Math.max(0,(now-t0)/1000);ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#6f7c4c';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.setTransform(dpr*view.s,0,0,dpr*view.s,dpr*view.x,dpr*view.y);ctx.save();ctx.beginPath();ctx.rect(0,0,W,H);ctx.clip();drawWorld(ctx,t,true);ctx.restore();ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1/view.s;ctx.strokeRect(0,0,W,H);requestAnimationFrame(frame)}
let toastT;function toast(m){const el=$('toast');el.textContent=m;el.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('show'),2000)}

/* ---------- demo ---------- */
function loadDemo(){booting=true;const r=rng(42);seedV=7;state={...blank(),light:state.light,grid:false,night:state.night||0};
 const S=state;
 S.groundOps.push({mat:'meadow',r:80,pts:[[160,600],[330,640],[420,600]]},{mat:'meadow',r:60,pts:[[1700,820],[1850,860]]});
 S.groundOps.push({mat:'field',r:42,pts:[[790,960],[900,1000],[950,1050]]},{mat:'crops',r:24,pts:[[1650,790],[1720,775]]},{mat:'dirt',r:36,pts:[[540,880],[600,900]]});
 S.groundOps.push({mat:'stone',r:44,pts:[[1250,585],[1350,580],[1440,590]]});
 S.waterOps.push({m:'add',r:105,pts:[[200,1010],[330,1080],[430,1050]]},{m:'add',r:80,pts:[[290,1170],[150,1150]]});
 S.hillOps.push({m:'add',l:1,r:95,pts:[[170,250],[380,300],[600,240],[820,300],[960,230]]});
 S.hillOps.push({m:'add',l:1,r:70,pts:[[520,170],[720,150]]});
 S.hillOps.push({m:'erase',l:1,r:34,pts:[[430,60],[470,440]]});
 S.hillOps.push({m:'add',l:2,r:46,pts:[[600,215],[720,215]]});
 S.hillOps.push({m:'add',l:1,r:85,pts:[[1600,1070],[1780,1130],[1950,1030]]});
 S.hillOps.push({m:'add',l:1,r:60,pts:[[1700,170],[1900,240]]});
 S.rivers.push({id:nid(),pts:[[690,215],[760,290],[810,420],[930,560],[1010,700],[980,860],[1080,1020],[1250,1130],[1330,1310]],w:30,bank:'sand'});
 S.rivers.push({id:nid(),pts:[[980,860],[760,930],[560,1010],[440,1050]],w:16,bank:'grass'});
 S.roads.push({id:nid(),pts:[[-10,760],[300,740],[620,700],[900,690],[1150,640],[1400,610],[1700,650],[2010,600]],w:16});
 S.roads.push({id:nid(),pts:[[620,700],[590,560],[560,420],[540,300]],w:10});
 S.roads.push({id:nid(),pts:[[1290,620],[1300,800],[1420,980],[1460,1310]],w:12});
 const V=[[1180,540,46,30,-.18,'#b4553f',20],[1250,520,40,28,-.12,'#c9a14a',16],[1340,515,52,32,-.05,'#b4553f',22],[1440,525,44,30,.05,'#8d5a3b',18],[1530,545,40,26,.12,'#c9a14a',14],[1185,710,44,28,-.15,'#c9a14a',16],[1380,690,46,30,0,'#b4553f',18],[1480,700,38,26,.08,'#8d5a3b',14],[1590,720,48,30,.15,'#c9a14a',20],[1250,440,36,24,-.3,'#8d5a3b',14],[1400,430,44,28,.1,'#c9a14a',16],[1365,790,40,26,.5,'#b4553f',16],[1215,800,34,24,.2,'#8d5a3b',14],[1530,800,44,28,-.1,'#b4553f',18]];
 for(const[x,y,w,h,a,c,hh]of V)S.buildings.push({id:nid(),kind:'house',pts:rectPts(x,y,w,h,a),h:hh,color:c,rot:Math.round(a*57.3)});
 S.buildings.push({id:nid(),kind:'tower',pts:ovalPts(1640,470,24,24),h:46,color:'#5f6f8a'});
 S.buildings.push({id:nid(),kind:'tower',pts:ovalPts(1120,450,18,18),h:36,color:'#5f6f8a'});
 S.walls.push({id:nid(),pts:[[1640,470],[1610,400],[1500,370],[1350,365],[1210,390],[1120,450]],t:10,h:16});
 addStamp('well',1300,575);addStamp('stall',1365,572,1,0);addStamp('stall',1415,578,1,8);addStamp('cart',1250,672,1,-15);
 for(const[x,y]of[[1205,620],[1460,632],[1620,672],[1060,690],[1320,700]])addStamp('lantern',x,y);
 addStamp('campfire',570,900);addStamp('tent',525,870,1,-20);addStamp('tent',615,860,1,25);addStamp('tent',580,945,1,5);addStamp('crate',540,920);addStamp('barrel',548,932);
 addStamp('boat',340,1040,1.2,20);addStamp('boat',250,1120,1,-35);
 addStamp('hay',840,1000);addStamp('hay',875,1030,.9);addStamp('hay',915,985,1.1);
 for(const[x,y,s]of[[900,390,1.4],[1010,300,1],[1810,960,1.6],[1860,1000,1],[150,380,1.3],[1150,1180,1.2],[980,420,.8]])addStamp('rock',x,y,s,Math.round(r()*180));
 for(const[x,y]of[[1120,760],[1560,600],[1660,760],[1290,470],[700,640],[460,760]])addStamp('bush',x,y,1,Math.round(r()*180));
 S.trees=[];
 for(const[x,y,R,n,au]of[[1820,420,170,120],[150,520,120,70],[1900,820,110,60],[1050,320,120,60],[700,1160,170,140],[90,880,90,40],[1700,1200,140,80,1],[880,820,70,20],[1180,1050,100,40],[1000,1250,120,50],[1950,1250,60,20]])scatter(x,y,R,13,n,r,!!au);
 S.labels.push({id:nid(),x:1420,y:880,text:'Тихая Гавань',size:34},{id:nid(),x:330,y:1075,text:'Зеркальное озеро',size:24},{id:nid(),x:640,y:95,text:'Ветряные холмы',size:30},{id:nid(),x:585,y:822,text:'Лагерь следопытов',size:18});
 sel=null;invalidate(true);rebuildMasks();rebuildGround();recomputeDerived();booting=false;renderPanel();updNight()}

/* ---------- export ---------- */
function download(name,blob){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}
const nowT=()=>(performance.now()-t0)/1000;
function renderTo(scale){const[c,x]=mk(W*scale,H*scale);x.scale(scale,scale);drawWorld(x,nowT(),false);return c}
function exportPng(scale=2){const c=renderTo(scale);c.toBlob(b=>{download('karta.png',b);toast(`PNG выгружен: ${W*scale}×${H*scale}`)})}
function exportVideo(){if(!window.MediaRecorder){toast('Браузер не поддерживает запись видео');return}const sc=.64,[c,x]=mk(W*sc,H*sc);const types=['video/webm;codecs=vp9','video/webm','video/mp4'];const type=types.find(t=>MediaRecorder.isTypeSupported(t));if(!type){toast('Браузер не поддерживает запись видео');return}
 const stream=c.captureStream(30),rec=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:8e6}),chunks=[];rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);rec.onstop=()=>{stream.getTracks().forEach(track=>track.stop());download('karta.'+(type.includes('mp4')?'mp4':'webm'),new Blob(chunks,{type}));toast('Анимация готова')};
 const start=performance.now();rec.start();toast('Записываю анимацию: 6 секунд…');(function step(){const el=(performance.now()-start)/1000;x.setTransform(sc,0,0,sc,0,0);drawWorld(x,el,false);if(el<6)requestAnimationFrame(step);else rec.stop()})()}
function exportVtt(){const g=GRID,pt=([x,y])=>({x:+(x/g).toFixed(3),y:+(y/g).toFixed(3)});const los=[];for(const b of state.buildings)los.push(b.pts.concat([b.pts[0]]).map(pt));for(const w of state.walls)los.push(rdp(sm(w),1.5).map(pt));
 const lights=[];for(const st of state.stamps){const d=STAMPS[st.type];if(d&&d.light)lights.push({position:pt([st.x,st.y]),range:+(d.light[0]*st.s/g).toFixed(2),intensity:1,color:'ff'+d.light[1].split(',').map(v=>(+v).toString(16).padStart(2,'0')).join(''),shadows:true})}
 const img=renderTo(1).toDataURL('image/png').split(',')[1];
 const data={format:0.3,resolution:{map_origin:{x:0,y:0},map_size:{x:W/g,y:H/g},pixels_per_grid:g},line_of_sight:los,objects_line_of_sight:[],portals:[],environment:{baked_lighting:false,ambient_light:state.night>0?'ff1a2550':'ffffffff'},lights,image:img};
 download('karta.dd2vtt',new Blob([JSON.stringify(data)],{type:'application/json'}));toast(`VTT: ${los.length} стен, ${lights.length} источников света`)}

/* ---------- io ---------- */
$('saveJson').onclick=()=>{download((state.name||'karta')+'.json',new Blob([snap()],{type:'application/json'}));toast('Карта сохранена в файл')};
$('loadJson').onclick=()=>$('fileIn').click();
$('fileIn').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const js=await f.text();JSON.parse(js);restore(js);commit();fit();syncChrome();toast('Карта открыта')}catch(err){toast('Не удалось открыть файл')}e.target.value=''};
$('exportPng').onclick=()=>exportPng(2);
$('undo').onclick=undo;$('redo').onclick=redo;
$('zIn').onclick=()=>zoomAt(1.25,cw/2,ch/2);$('zOut').onclick=()=>zoomAt(.8,cw/2,ch/2);$('zFit').onclick=fit;
$('panelToggle').onclick=()=>$('panel').classList.toggle('open');
window.addEventListener('resize',()=>{resize();fit()});

/* ---------- boot ---------- */
resize();fit();renderTools();
let saved=null;try{saved=localStorage.getItem('kartograf-map-v3')||localStorage.getItem('kartograf-map-v2')}catch(e){}
if(saved){try{restore(saved)}catch(e){loadDemo()}}else loadDemo();
booting=false;prev=snap();updUndo();renderPanel();updHint();updNight();requestAnimationFrame(frame);
window.__k={get state(){return state},get opts(){return opts},get selection(){return sel},restore,snap,undo,redo,fit,placeKit,selectDistrict,vttData,polysMeet,localBox,buildingDoor,freeSpot,renderPanel,generateDistrict,makeDistrict,validateMap,loadSandboxDemo,renderTo,hit,exportPng,get derived(){return derived},setTool,get view(){return view},loadDemo,commit,invalidate,exportVtt};
})();
