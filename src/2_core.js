(()=>{
"use strict";
const W=2000,H=1300,GRID=10;
const $=id=>document.getElementById(id);
const canvas=$('map'),ctx=canvas.getContext('2d');
const mk=(w,h,o)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return[c,c.getContext('2d',o)]};
const RO={willReadFrequently:true};
const [mH1,mh1]=mk(W,H,RO),[mH2,mh2]=mk(W,H,RO),[mWt,mwt]=mk(W,H,RO);
const [tmpC,tctx]=mk(W,H),[ripC,rctx]=mk(W,H),[layG,gctx]=mk(W,H),[layA,actx]=mk(W,H),[layS,sctx]=mk(W,H);
const LS=.5,[layL,lctx]=mk(W*LS,H*LS);
const [oH1,oh1]=mk(W,H,RO),[oH2,oh2]=mk(W,H,RO),[oWt,owt]=mk(W,H,RO);
const [orgC,orgx]=mk(W,H,RO);
const PAIRS=[[mH1,oH1,oh1,'h1'],[mH2,oH2,oh2,'h2'],[mWt,oWt,owt,'w']];

/* ---------- utils ---------- */
function rng(seed){let a=seed>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(ax,ay,bx,by)=>Math.hypot(ax-bx,ay-by);
function hex2rgb(h){h=h.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
function shade(h,f){const c=hex2rgb(h).map(v=>f>=0?v+(255-v)*f:v*(1+f));return'rgb('+c.map(v=>Math.round(clamp(v,0,255))).join(',')+')'}
function chaikin(p,it=3){let a=p;for(let k=0;k<it;k++){if(a.length<3)return a;const b=[a[0]];for(let i=0;i<a.length-1;i++){const[x0,y0]=a[i],[x1,y1]=a[i+1];b.push([x0*.75+x1*.25,y0*.75+y1*.25],[x0*.25+x1*.75,y0*.25+y1*.75])}b.push(a[a.length-1]);a=b}return a}
function segDist(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy;let t=l?((px-ax)*dx+(py-ay)*dy)/l:0;t=clamp(t,0,1);return dist(px,py,ax+dx*t,ay+dy*t)}
function rdp(p,eps){if(p.length<3)return p;let md=0,mi=0;const a=p[0],b=p[p.length-1];for(let i=1;i<p.length-1;i++){const d=segDist(p[i][0],p[i][1],a[0],a[1],b[0],b[1]);if(d>md){md=d;mi=i}}if(md>eps){const l=rdp(p.slice(0,mi+1),eps),r=rdp(p.slice(mi),eps);return l.slice(0,-1).concat(r)}return[a,b]}
function polyDist(px,py,p){if(p.length===1)return dist(px,py,p[0][0],p[0][1]);let m=1e9;for(let i=0;i<p.length-1;i++)m=Math.min(m,segDist(px,py,p[i][0],p[i][1],p[i+1][0],p[i+1][1]));return m}
function inPoly(x,y,p){let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const[xi,yi]=p[i],[xj,yj]=p[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c}
function segInter(a,b,c,d){const r=[b[0]-a[0],b[1]-a[1]],s=[d[0]-c[0],d[1]-c[1]],den=r[0]*s[1]-r[1]*s[0];if(Math.abs(den)<1e-9)return null;const t=((c[0]-a[0])*s[1]-(c[1]-a[1])*s[0])/den,u=((c[0]-a[0])*r[1]-(c[1]-a[1])*r[0])/den;return t>=0&&t<=1&&u>=0&&u<=1?[a[0]+t*r[0],a[1]+t*r[1],Math.atan2(r[1],r[0])]:null}
function offsetLine(p,d){return p.map((pt,i)=>{const a=p[Math.max(0,i-1)],b=p[Math.min(p.length-1,i+1)];let nx=-(b[1]-a[1]),ny=b[0]-a[0];const l=Math.hypot(nx,ny)||1;return[pt[0]+nx/l*d,pt[1]+ny/l*d]})}
function tracePath(c,p,close){c.beginPath();c.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)c.lineTo(p[i][0],p[i][1]);if(close)c.closePath()}
const sm=o=>o._sm||(o._sm=chaikin(o.pts,3));
const centroid=p=>{let x=0,y=0;for(const q of p){x+=q[0];y+=q[1]}return[x/p.length,y/p.length]};
const rectPts=(cx,cy,w,h,a)=>{const c=Math.cos(a),s=Math.sin(a);return[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]].map(([x,y])=>[cx+x*c-y*s,cy+x*s+y*c])};
const ovalPts=(cx,cy,rx,ry)=>Array.from({length:36},(_,i)=>{const a=i/36*Math.PI*2;return[cx+Math.cos(a)*rx,cy+Math.sin(a)*ry]});
const rotPts=(p,a,cx,cy)=>{const c=Math.cos(a),s=Math.sin(a);return p.map(([x,y])=>[cx+(x-cx)*c-(y-cy)*s,cy+(x-cx)*s+(y-cy)*c])};

const NOISE=(()=>{const N=new Float32Array(W*H);for(const[cell,amp,seed]of[[46,.62,5],[14,.3,6],[5,.12,9]]){const r=rng(seed),gw=Math.ceil(W/cell)+2,gh=Math.ceil(H/cell)+2,g=new Float32Array(gw*gh);for(let i=0;i<g.length;i++)g[i]=r()-.5;for(let y=0;y<H;y++){const fy=y/cell,iy=fy|0,ty=fy-iy,sy=ty*ty*(3-2*ty);for(let x=0;x<W;x++){const fx=x/cell,ix=fx|0,tx=fx-ix,sx=tx*tx*(3-2*tx),i0=iy*gw+ix,a=g[i0]+(g[i0+1]-g[i0])*sx,b=g[i0+gw]+(g[i0+gw+1]-g[i0+gw])*sx;N[y*W+x]+=(a+(b-a)*sy)*amp}}}return N})();
function organic(raw,out,octx,key){orgx.clearRect(0,0,W,H);orgx.filter='blur(7px)';orgx.drawImage(raw,0,0);orgx.filter='none';const id=orgx.getImageData(0,0,W,H),d=id.data;for(let i=0,n=W*H;i<n;i++){const a=d[i*4+3];if(a===0){continue}const v=(a+NOISE[i]*150-128)*3+128;d[i*4]=d[i*4+1]=d[i*4+2]=0;d[i*4+3]=v<0?0:v>255?255:v}octx.putImageData(id,0,0);alpha[key]=d}
function organicAll(){for(const[r,o,c,k]of PAIRS)organic(r,o,c,k)}
function liveCopy(){for(const[r,o,c,k]of PAIRS){c.clearRect(0,0,W,H);c.drawImage(r,0,0);alpha[k]=null}}
/* ---------- textures ---------- */
function makePattern(size,base,specks,seed,extra){const[c,x]=mk(size,size);const r=rng(seed);x.fillStyle=base;x.fillRect(0,0,size,size);if(extra)extra(x,r,size);for(const[col,n,sz]of specks){x.fillStyle=col;x.strokeStyle=col;for(let i=0;i<n;i++){const px=r()*size,py=r()*size;if(sz<0){x.lineWidth=1;x.beginPath();x.moveTo(px,py);x.lineTo(px+(r()-.5)*3,py-3-r()*3);x.stroke()}else{x.globalAlpha=.6;x.beginPath();x.arc(px,py,sz*(.5+r()),0,7);x.fill();x.globalAlpha=1}}}return ctx.createPattern(c,'repeat')}
function cobbles(x,r,s){for(let yy=0;yy<s;yy+=11)for(let xx=(yy/11%2)*6;xx<s+11;xx+=12){const g=r()*30|0;x.fillStyle=`rgb(${148+g},${142+g},${132+g})`;x.beginPath();x.ellipse(xx,yy,5.4,4.6,r(),0,7);x.fill();x.strokeStyle='rgba(60,55,48,.45)';x.lineWidth=1;x.stroke()}}
function planks(x,r,s){for(let yy=0;yy<s;yy+=8){x.fillStyle=`rgb(${150+r()*20|0},${108+r()*16|0},${66+r()*12|0})`;x.fillRect(0,yy,s,7);x.fillStyle='rgba(70,45,22,.5)';x.fillRect(0,yy+7,s,1);x.fillRect((r()*s)|0,yy,1,7)}}
const MATS={
 grass:{n:'Трава',c:'#b6c47f',p:makePattern(256,'#b6c47f',[['#a8b872',260,2.2],['#c4d08f',200,1.8],['#9aad66',140,-1],['#cfd99d',60,1.2]],7)},
 meadow:{n:'Луг',c:'#9fb465',p:makePattern(256,'#9fb465',[['#8fa658',260,2.4],['#b2c675',160,1.6],['#7e9a4c',220,-1],['#e9e4a6',24,1],['#e8b6c8',14,1]],8)},
 dirt:{n:'Земля',c:'#ae8f61',p:makePattern(256,'#ae8f61',[['#9c7f53',260,2.2],['#c0a273',200,1.8],['#8c7048',90,1.2]],9)},
 sand:{n:'Песок',c:'#dcc993',p:makePattern(256,'#dcc993',[['#ccb880',260,1.6],['#e8d8a8',220,1.4],['#bfa970',60,1]],10)},
 stone:{n:'Брусчатка',c:'#9e978b',p:makePattern(128,'#8a847a',[],12,cobbles)},
 wood:{n:'Доски',c:'#9a6c42',p:makePattern(128,'#9a6c42',[],14,planks)},
 field:{n:'Поле',c:'#c9b45e',p:makePattern(128,'#c4b05a',[['#d8c66f',120,1.2]],16,(x,r,s)=>{for(let y=0;y<s;y+=8){x.fillStyle='#a8953f';x.fillRect(0,y,s,3);x.fillStyle='#d9c873';x.fillRect(0,y+4,s,2)}})},
 crops:{n:'Грядки',c:'#7f9a45',p:makePattern(128,'#8d6f47',[],17,(x,r,s)=>{for(let y=0;y<s;y+=10){x.fillStyle='#6f8f3a';for(let xx=2;xx<s;xx+=6){x.beginPath();x.arc(xx+r()*2,y+5,2.6+r(),0,7);x.fill()}}})},
 snow:{n:'Снег',c:'#eef1f1',p:makePattern(256,'#eef1f1',[['#dfe6ea',200,2.2],['#ffffff',160,1.6]],15)}};
const hillPat=makePattern(256,'#a2b96a',[['#94ac5e',220,2],['#b3c97c',180,1.6],['#86a055',120,-1]],11);
const plateauPat=makePattern(256,'#98ae63',[['#8aa257',220,2],['#a9bf74',160,1.6],['#7f9a52',140,-1],['#a39d8c',40,1.6]],13);
const ripPat=(()=>{const[c,x]=mk(160,160);const r=rng(3);x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=1.3;x.lineCap='round';for(let i=0;i<34;i++){const px=r()*160,py=r()*160,l=6+r()*12;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+l/2,py-2,px+l,py);x.stroke()}return ctx.createPattern(c,'repeat')})();

/* ---------- state ---------- */
const COLORS=['#b4553f','#8d5a3b','#c9a14a','#5f6f8a','#6d8a4a','#7a4a6e','#4f7d86','#d9d0bd'];
const BANKS={grass:['#5f7f3c','Трава'],sand:['#dcc68f','Песок'],stone:['#9b958b','Камень']};
const STAMPS={
 rock:{n:'Камень',r:10,h:4},bush:{n:'Куст',r:9,h:5},campfire:{n:'Костёр',r:12,h:0,light:[175,'255,150,60']},
 lantern:{n:'Фонарь',r:6,h:10,light:[115,'255,205,120']},well:{n:'Колодец',r:12,h:8},barrel:{n:'Бочка',r:7,h:7},
 crate:{n:'Ящик',r:8,h:6},tent:{n:'Палатка',r:13,h:9},hay:{n:'Стог',r:10,h:7},
 boat:{n:'Лодка',r:12,h:2},cart:{n:'Телега',r:13,h:6},stall:{n:'Лавка',r:13,h:8}};
function blank(){return{hillOps:[],waterOps:[],groundOps:[],rivers:[],roads:[],buildings:[],walls:[],trees:[],stamps:[],labels:[],districts:[],partitions:[],schemaVersion:4,layers:{roads:true,water:true,buildings:true,nature:true,props:true,labels:true,shadows:true},weather:'clear',weatherAmount:.45,motion:true,wind:.5,name:'Новая локация',roofMode:'roof',level:1,snap:false,gridSize:10,light:40,night:0,grid:false}}
let state=blank();
let uid=1;const nid=()=>uid++;
const opts={hillR:60,hillLvl:1,waterR:50,groundR:40,mat:'dirt',riverW:26,bank:'grass',roadW:14,bH:18,bColor:'#b4553f',wallT:10,wallH:14,treeR:13,forestR:70,eraseR:24,stamp:'campfire',stampS:1};
let tool='select',sel=null,derived={bridges:[],falls:[],stairs:[]};
let dirty={mask:true,ground:true,A:true,S:true,der:true},alpha={};
const replacer=(k,v)=>k[0]==='_'?undefined:v;
const snap=()=>JSON.stringify(state,replacer);
let hist=[],redoS=[],prev=null,booting=true;
function commit(){const cur=snap();if(cur===prev)return;hist.push(prev);if(hist.length>80)hist.shift();prev=cur;redoS=[];persist(cur);updUndo()}
const LISTS=['rivers','roads','buildings','walls','trees','stamps','labels','districts','partitions'];
function restore(js){const s=validateMap(JSON.parse(js));state={...blank(),...s};uid=1+Math.max(0,...LISTS.flatMap(k=>state[k].map(o=>o.id)));sel=null;invalidate(true);renderPanel();updNight()}
function undo(){if(!hist.length)return;redoS.push(prev);prev=hist.pop();restore(prev);persist(prev);updUndo()}
function redo(){if(!redoS.length)return;hist.push(prev);prev=redoS.pop();restore(prev);persist(prev);updUndo()}
function updUndo(){$('undo').disabled=!hist.length;$('redo').disabled=!redoS.length}
function invalidate(all,o={}){if(all)o={mask:1,ground:1,A:1,S:1,der:1};for(const k in o)if(o[k])dirty[k]=true}
const shadowVec=()=>{const a=state.light*Math.PI/180;return{x:Math.cos(a),y:Math.sin(a)}};

/* ---------- masks: hills (2 levels) & water ---------- */
function strokeOp(c,op,from,mode){c.globalCompositeOperation=mode;c.fillStyle=c.strokeStyle='#000';c.lineCap=c.lineJoin='round';c.lineWidth=op.r*2;const p=op.pts;if(p.length===1){c.beginPath();c.arc(p[0][0],p[0][1],op.r,0,7);c.fill()}else{c.beginPath();c.moveTo(p[from][0],p[from][1]);for(let i=from+1;i<p.length;i++)c.lineTo(p[i][0],p[i][1]);c.stroke()}c.globalCompositeOperation='source-over'}
function applyHillOp(op,from=0){if(op.m==='add')strokeOp(op.l===2?mh2:mh1,op,from,'source-over');else{strokeOp(mh2,op,from,'destination-out');if(op.l!==2)strokeOp(mh1,op,from,'destination-out')}alpha.h1=alpha.h2=null}
function applyWaterOp(op,from=0){strokeOp(mwt,op,from,op.m==='add'?'source-over':'destination-out');alpha.w=null}
function applyGroundOp(op,from=0){const p=op.pts.slice(from);if(!p.length)return;const pad=op.r+10,x=Math.max(0,Math.floor(Math.min(...p.map(q=>q[0]))-pad)),y=Math.max(0,Math.floor(Math.min(...p.map(q=>q[1]))-pad)),w=Math.min(W-x,Math.ceil(Math.max(...p.map(q=>q[0]))+pad-x)),h=Math.min(H-y,Math.ceil(Math.max(...p.map(q=>q[1]))+pad-y));if(w<=0||h<=0)return;
 // Blur only the brush mask, never the actual stone / wood / grass texture.
 tctx.clearRect(x,y,w,h);tctx.filter='blur(2.5px)';strokeOp(tctx,{...op,pts:p},0,'source-over');tctx.filter='none';tctx.globalCompositeOperation='source-in';tctx.fillStyle=(MATS[op.mat]||MATS.grass).p;tctx.fillRect(x,y,w,h);tctx.globalCompositeOperation='source-over';gctx.drawImage(tmpC,x,y,w,h,x,y,w,h)
}
function rebuildMasks(){for(const c of[mh1,mh2,mwt])c.clearRect(0,0,W,H);for(const op of state.hillOps)applyHillOp(op);for(const op of state.waterOps)applyWaterOp(op);alpha={};organicAll()}
function rebuildGround(){gctx.fillStyle=MATS.grass.p;gctx.fillRect(0,0,W,H);for(const op of state.groundOps)applyGroundOp(op)}
function sample(key,c,x,y){if(!alpha[key])alpha[key]=c.getImageData(0,0,W,H).data;x|=0;y|=0;if(x<0||y<0||x>=W||y>=H)return false;return alpha[key][(y*W+x)*4+3]>127}
const heightAt=(x,y)=>(sample('h1',oh1,x,y)?1:0)+(sample('h2',oh2,x,y)?1:0);
const isWater=(x,y)=>sample('w',owt,x,y);
function tintFrom(src,fill,blur){tctx.clearRect(0,0,W,H);tctx.filter=blur?`blur(${blur}px)`:'none';tctx.drawImage(src,0,0);tctx.filter='none';tctx.globalCompositeOperation='source-in';tctx.fillStyle=fill;tctx.fillRect(0,0,W,H);tctx.globalCompositeOperation='source-over'}
function dilateFrom(src,d,fill){tctx.clearRect(0,0,W,H);for(let a=0;a<8;a++)tctx.drawImage(src,Math.cos(a*Math.PI/4)*d,Math.sin(a*Math.PI/4)*d);tctx.drawImage(src,0,0);tctx.globalCompositeOperation='source-in';tctx.fillStyle=fill;tctx.fillRect(0,0,W,H);tctx.globalCompositeOperation='source-over'}
function drawLevel(src,top,s,k){tintFrom(src,'#26301a',6);actx.globalAlpha=.3;actx.drawImage(tmpC,s.x*22*k,s.y*22*k);actx.globalAlpha=1;tintFrom(src,'#6a5538');actx.drawImage(tmpC,s.x*10*k,s.y*10*k);tintFrom(src,'#866c48');actx.drawImage(tmpC,s.x*5*k,s.y*5*k);tintFrom(src,'#d2df9f');actx.drawImage(tmpC,-s.x*2.5,-s.y*2.5);tintFrom(src,top);actx.drawImage(tmpC,0,0)}
function renderA(){const s=shadowVec();actx.drawImage(layG,0,0);
 if(state.waterOps.length&&layerVisible('water')){dilateFrom(oWt,9,'#d6c48c');actx.drawImage(tmpC,0,0);dilateFrom(oWt,4,'#b9a874');actx.drawImage(tmpC,0,0);tintFrom(oWt,'#4a93b8');actx.drawImage(tmpC,0,0);tintFrom(oWt,'#2f6f93',16);actx.globalAlpha=.85;actx.drawImage(tmpC,0,0);tintFrom(oWt,'#1f5778',34);actx.drawImage(tmpC,0,0);actx.globalAlpha=1}
 if(state.hillOps.some(o=>o.l!==2))drawLevel(oH1,hillPat,s,1);if(state.hillOps.some(o=>o.l===2))drawLevel(oH2,plateauPat,s,1.15)}

/* ---------- derived: bridges, waterfalls, stairs ---------- */
function walk(p,step,fn){for(let i=0;i<p.length-1;i++){const[x0,y0]=p[i],[x1,y1]=p[i+1];const L=dist(x0,y0,x1,y1),n=Math.max(1,Math.ceil(L/step)),ang=Math.atan2(y1-y0,x1-x0);for(let k=0;k<n;k++)fn(x0+(x1-x0)*k/n,y0+(y1-y0)*k/n,ang)}}
function recomputeDerived(){const oB=derived.bridges.length,oF=derived.falls.length,oS=derived.stairs.length;const bridges=[],falls=[],stairs=[];
 for(const rd of state.roads){const a=sm(rd);for(const rv of state.rivers){const b=sm(rv);for(let i=0;i<a.length-1;i++)for(let j=0;j<b.length-1;j++){const h=segInter(a[i],a[i+1],b[j],b[j+1]);if(h&&!bridges.some(o=>dist(o.x,o.y,h[0],h[1])<rv.w*1.2)){const rang=Math.atan2(b[j+1][1]-b[j][1],b[j+1][0]-b[j][0]);const cross=Math.abs(Math.sin(h[2]-rang));bridges.push({x:h[0],y:h[1],ang:h[2],len:rv.w/Math.max(cross,.4)+26,wd:rd.w+8,stone:rv.w>40})}}}
  let ph=null;walk(a,3,(x,y,ang)=>{const h=heightAt(x,y);if(ph!==null&&h!==ph&&!stairs.some(o=>dist(o.x,o.y,x,y)<rd.w*1.5)&&!isWater(x,y))stairs.push({x,y,ang:h>ph?ang:ang+Math.PI,w:rd.w});ph=h})}
 for(const rv of state.rivers){let ph=null;walk(sm(rv),3,(x,y,ang)=>{const h=heightAt(x,y);if(ph!==null&&h!==ph&&!falls.some(f=>dist(f.x,f.y,x,y)<rv.w*1.2))falls.push({x,y,ang:h<ph?ang:ang+Math.PI,w:rv.w});ph=h})}
 derived={bridges,falls,stairs};
 if(!booting){if(bridges.length>oB)toast('Мост построен автоматически');else if(falls.length>oF)toast('Появился водопад');else if(stairs.length>oS)toast('На склоне появились ступени')}}

/* ---------- shadows layer ---------- */
function sweep(fn,L){for(let k=0;k<=L;k+=1.5){sctx.save();sctx.translate(SV.x*k,SV.y*k);fn();sctx.restore()}}
let SV={x:1,y:0};
function renderS(){SV=shadowVec();sctx.clearRect(0,0,W,H);sctx.fillStyle=sctx.strokeStyle='#1d2414';sctx.lineCap=sctx.lineJoin='round';
 for(const b of state.buildings)if(layerVisible('buildings')&&(state.roofMode!=='interior'||state.level<=(b.floors||1)))sweep(()=>{tracePath(sctx,b.pts,true);sctx.fill()},b.h*1.1);
 for(const w of state.walls){if(!layerVisible('buildings'))continue;sctx.lineWidth=w.t;sweep(()=>{tracePath(sctx,sm(w));sctx.stroke()},w.h*1.1)}
 for(const t of state.trees){if(!layerVisible('nature'))continue;sctx.beginPath();sctx.ellipse(t.x+SV.x*t.r*.9,t.y+SV.y*t.r*.9,t.r*1.05,t.r*.95,0,0,7);sctx.fill()}
 for(const st of state.stamps){const d=STAMPS[st.type];if(!layerVisible('props'))continue;if(st.floor&&!(state.roofMode==='interior'&&st.floor===state.level))continue;if(!d||!d.h)continue;const r=d.r*st.s;sctx.beginPath();sctx.ellipse(st.x+SV.x*d.h*st.s,st.y+SV.y*d.h*st.s,r,r*.9,0,0,7);sctx.fill()}
 if(layerVisible('roads')&&layerVisible('water'))for(const b of derived.bridges){sctx.save();sctx.translate(b.x+SV.x*6,b.y+SV.y*6);sctx.rotate(b.ang);sctx.fillRect(-b.len/2,-b.wd/2,b.len,b.wd);sctx.restore()}}
