/* ---------- tools ---------- */
const I=d=>`<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const TOOLS=[
 {id:'select',k:'v',n:'Выбор и перемещение',i:I('<path d="M5 3l10 6.5-4.5 1.2L8.5 15z"/>'),h:'Нажмите на объект, чтобы изменить его. Перетащите, чтобы сдвинуть. ⌘D — копия, Delete — удалить.'},
 {id:'hand',k:'h',n:'Перемещение карты',i:I('<path d="M7 10V5a1.3 1.3 0 012.6 0v4M9.6 9V3.8a1.3 1.3 0 012.6 0V9M12.2 9V5a1.3 1.3 0 012.6 0v6c0 4-2.4 6-5.3 6-2.6 0-4.2-1.5-5-3.6L3.4 11a1.3 1.3 0 012.3-1.1L7 12"/>'),h:'Тяните карту. Колесо — масштаб. Пробел + перетаскивание работает в любом инструменте.'},
 '-',
 {id:'ground',k:'p',n:'Покрытие земли',i:I('<path d="M4 16c2-1 3-4 6-4s3 3 6 2"/><path d="M12 3l5 5-5 4-4-4z"/>'),h:'Рисуйте землёй, песком, брусчаткой или снегом. «Трава» стирает покрытие.'},
 {id:'hill',k:'b',n:'Холмы и плато',i:I('<path d="M2 16l5-8 3 4 3-6 5 10z"/>'),h:'Рисуйте холм кистью. Уровень 2 — плато поверх холма. Тени и склоны появятся сами.'},
 {id:'hillErase',k:'e',n:'Срезать холм',i:I('<path d="M2 16l5-8 3 4 3-6 5 10z"/><path d="M12 3l-6 15" stroke-dasharray="2 2"/>'),h:'Сотрите часть холма — он разделится на два.'},
 {id:'water',k:'l',n:'Озеро и море',i:I('<path d="M3 12c2-2 4 2 7 0s5-2 7 0"/><path d="M3 16c2-2 4 2 7 0s5-2 7 0"/><path d="M10 3c2 3 3 4.5 3 6a3 3 0 01-6 0c0-1.5 1-3 3-6z"/>'),h:'Рисуйте воду кистью: берег и глубина появятся сами.'},
 {id:'river',k:'r',n:'Река',i:I('<path d="M3 5c3-2 5 2 8 0s5-2 6 0M3 10c3-2 5 2 8 0s5-2 6 0M3 15c3-2 5 2 8 0s5-2 6 0"/>'),h:'Проведите реку. Через дороги построятся мосты, на склонах появятся водопады.'},
 {id:'road',k:'d',n:'Дорога',i:I('<path d="M6 18L8.5 2M14 2l2.5 16M11.2 4v2M11.2 9v2M11.2 14v2"/>'),h:'Проведите дорогу. Через реку — мост, на склоне — ступени.'},
 '-',
 {id:'house',k:'q',n:'Дом',i:I('<path d="M3 9.5L10 3l7 6.5V17H3z"/><path d="M8 17v-4h4v4"/>'),h:'Растяните прямоугольник — получится дом с крышей, трубой и тенью.'},
 {id:'tower',k:'o',n:'Башня',i:I('<circle cx="10" cy="10" r="7"/><path d="M10 3v14M3 10h14"/>'),h:'Растяните овал, чтобы поставить башню с конической крышей.'},
 {id:'free',k:'f',n:'Здание от руки',i:I('<path d="M4 15l2-9 6-3 5 5-3 9z"/>'),h:'Обведите контур здания от руки.'},
 {id:'wall',k:'w',n:'Крепостная стена',i:I('<path d="M2 9h16v8H2zM2 9V5h3v4M8.5 9V5h3v4M15 9V5h3v4"/>'),h:'Проведите стену с зубцами.'},
 '-',
 {id:'tree',k:'t',n:'Дерево',i:I('<path d="M10 18v-5"/><circle cx="10" cy="8" r="5"/>'),h:'Нажимайте, чтобы ставить деревья по одному.'},
 {id:'forest',k:'g',n:'Лес кистью',i:I('<circle cx="6.5" cy="8" r="3.5"/><circle cx="13.5" cy="7" r="4"/><path d="M6.5 11.5V17M13.5 11v6"/>'),h:'Ведите кистью — лес заполнит область и обойдёт воду, дороги и дома.'},
 {id:'stamp',k:'s',n:'Объекты',i:I('<path d="M10 2l2.4 5 5.4.6-4 3.7 1.1 5.4L10 14l-4.9 2.7 1.1-5.4-4-3.7L7.6 7z"/>'),h:'Выберите объект в панели и нажмите на карту. Костры и фонари светят ночью.'},
 {id:'label',k:'a',n:'Подпись',i:I('<path d="M4 5h12M10 5v11M7 16h6"/>'),h:'Нажмите на карту, чтобы подписать место.'},
 '-',
 {id:'erase',k:'x',n:'Ластик объектов',i:I('<path d="M4 13.5l7-7 5 5-5 5H7z"/><path d="M9 16.5h8"/>'),h:'Удаляет деревья и объекты под кистью и постройку под курсором.'}];
function renderTools(){$('tools').innerHTML=TOOLS.map(t=>t==='-'?'<div class="tgap"></div>':`<button class="tool${tool===t.id?' on':''}" data-t="${t.id}" title="${t.n} (${t.k.toUpperCase()})" aria-label="${t.n}" aria-pressed="${tool===t.id}">${t.i}</button>`).join('')}
$('tools').addEventListener('click',e=>{const b=e.target.closest('[data-t]');if(b)setTool(b.dataset.t)});
function setTool(t){tool=t;if(t!=='select')sel=null;renderTools();renderPanel();updHint()}
function updHint(){const t=TOOLS.find(x=>x.id===tool);$('hint').innerHTML=`<b>${t.n}.</b> ${t.h}`}

/* ---------- panel ---------- */
const field=(id,label,min,max,val,step=1,unit='')=>`<div class="field"><label for="${id}">${label}<output id="${id}-o">${val}${unit}</output></label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}" data-unit="${unit}"></div>`;
const swatches=(cur,act,label='Цвет крыши')=>`<div class="field"><label>${label}</label><div class="swatches">${COLORS.map(c=>`<button class="sw${c===cur?' on':''}" style="background:${c}" data-${act}="${c}" aria-label="Цвет ${c}"></button>`).join('')}</div></div>`;
const seg=(label,items,cur,act)=>`<div class="field"><label>${label}</label><div class="seg">${items.map(([k,v])=>`<button class="${k===cur?'on':''}" data-${act}="${k}">${v}</button>`).join('')}</div></div>`;
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
function findSel(){if(!sel)return null;return(state[sel.k]||[]).find(o=>o.id===sel.id)||null}
const KN={buildings:'Постройка',rivers:'Река',roads:'Дорога',walls:'Стена',trees:'Дерево',stamps:'Объект',labels:'Подпись'};
function renderPanel(){let h='';const o=findSel();
 if(o){h+=`<section><p class="ptitle">${sel.k==='stamps'?STAMPS[o.type].n:KN[sel.k]}</p><p class="pdesc">Изменения применяются сразу.</p>`;
  if(sel.k==='buildings')h+=field('sel-h','Высота',2,70,o.h)+field('sel-rot','Поворот',-180,180,o.rot||0,1,'°')+swatches(o.color,'scol')+(o.kind==='house'?`<label class="check"><input type="checkbox" id="sel-chim"${o.chimney!==false?' checked':''}> Печная труба</label>`:'')+`<label class="check"><input type="checkbox" id="sel-lit"${o.lit!==false?' checked':''}> Свет в окнах ночью</label><button class="pbtn" id="paintAll">Покрасить все постройки</button>`;
  if(sel.k==='rivers')h+=field('sel-w','Ширина',8,80,o.w)+seg('Берег',Object.entries(BANKS).map(([k,v])=>[k,v[1]]),o.bank,'sbank');
  if(sel.k==='roads')h+=field('sel-w','Ширина',6,36,o.w)+seg('Покрытие',[['dirt','Грунт'],['paved','Камень']],o.paved?'paved':'dirt','spave');
  if(sel.k==='walls')h+=field('sel-t','Толщина',5,24,o.t)+field('sel-h','Высота',4,40,o.h);
  if(sel.k==='trees')h+=field('sel-r','Размер',6,30,o.r)+`<label class="check"><input type="checkbox" id="sel-autumn"${o.autumn?' checked':''}> Осенняя листва</label>`;
  if(sel.k==='stamps')h+=field('sel-s','Размер',.5,3,o.s,.1,'×')+field('sel-srot','Поворот',-180,180,o.rot||0,1,'°');
  if(sel.k==='labels')h+=`<div class="field"><label for="sel-text">Текст</label><input type="text" id="sel-text" value="${esc(o.text)}" maxlength="60"></div>`+field('sel-size','Размер шрифта',12,90,o.size);
  h+=`<div class="row2"><button class="pbtn" id="dupSel">Копия</button><button class="pbtn danger" id="delSel">Удалить</button></div></section>`}
 else{const t=TOOLS.find(x=>x.id===tool);h+=`<section><p class="ptitle">${t.n}</p><p class="pdesc">${t.h}</p>`;
  if(tool==='ground')h+=`<div class="field"><label>Материал</label><div class="grid3">${Object.entries(MATS).map(([k,m])=>`<button class="chip${k===opts.mat?' on':''}" data-omat="${k}"><i style="background:${m.c}"></i>${m.n}</button>`).join('')}</div></div>`+field('o-groundR','Размер кисти',10,140,opts.groundR);
  if(tool==='hill'||tool==='hillErase')h+=(tool==='hill'?seg('Уровень',[[1,'1 · Холм'],[2,'2 · Плато']],opts.hillLvl,'olvl'):'')+field('o-hillR','Размер кисти',15,160,opts.hillR);
  if(tool==='water')h+=seg('Режим',[['add','Добавить'],['erase','Стереть']],opts.waterMode||'add','owm')+field('o-waterR','Размер кисти',15,160,opts.waterR);
  if(tool==='river')h+=field('o-riverW','Ширина',8,80,opts.riverW)+seg('Берег',Object.entries(BANKS).map(([k,v])=>[k,v[1]]),opts.bank,'obank');
  if(tool==='road')h+=field('o-roadW','Ширина',6,36,opts.roadW)+seg('Покрытие',[['dirt','Грунт'],['paved','Камень']],opts.paved?'paved':'dirt','opave');
  if(['house','tower','free'].includes(tool))h+=field('o-bH','Высота',2,70,opts.bH)+swatches(opts.bColor,'ocol');
  if(tool==='wall')h+=field('o-wallT','Толщина',5,24,opts.wallT)+field('o-wallH','Высота',4,40,opts.wallH);
  if(tool==='tree')h+=field('o-treeR','Размер',6,30,opts.treeR);
  if(tool==='forest')h+=field('o-forestR','Размер кисти',25,160,opts.forestR)+field('o-treeR','Размер деревьев',6,30,opts.treeR)+`<label class="check"><input type="checkbox" id="o-autumn"${opts.autumn?' checked':''}> Осенний лес</label>`;
  if(tool==='stamp')h+=`<div class="field"><label>Объект</label><div class="grid3">${Object.entries(STAMPS).map(([k,s])=>`<button class="chip${k===opts.stamp?' on':''}" data-ostamp="${k}">${s.n}</button>`).join('')}</div></div>`+field('o-stampS','Размер',.5,3,opts.stampS,.1,'×');
  if(tool==='erase')h+=field('o-eraseR','Размер кисти',8,80,opts.eraseR);
  h+='</section>'}
 h+=`<section><h3>Карта</h3>${field('g-light','Направление света',0,359,state.light,1,'°')}${field('g-night','Ночь',0,1,state.night,.05)}<label class="check"><input type="checkbox" id="g-grid"${state.grid?' checked':''}> Сетка для боя (клетка 5 футов)</label><div class="row2" style="margin-top:8px"><button class="pbtn" id="demo">Демо-карта</button><button class="pbtn danger" id="clear">Очистить</button></div></section>`;
 h+=`<section><h3>Экспорт</h3><button class="pbtn" id="exPng">PNG 4000×2600</button><button class="pbtn" id="exVid">Анимация, 6 секунд</button><button class="pbtn" id="exVtt">Universal VTT для Foundry</button><p class="kbd">VTT-файл содержит картинку, стены для обзора и источники света.</p></section>`;
 h+=`<section><h3>Что карта делает сама</h3><ul class="rules"><li>Дорога + река → мост (на широкой реке — каменный)</li><li>Река + склон → водопад</li><li>Дорога + склон → ступени</li><li>Высота здания → длина тени</li><li>Свет → все тени и склоны</li><li>Ночь → светятся окна, костры и фонари</li><li>Лес обходит воду, дороги и дома</li></ul></section>`;
 $('panel').innerHTML=h}
$('panel').addEventListener('input',e=>{const el=e.target,id=el.id,o=findSel();
 if(id==='sel-text'&&o){o.text=el.value;return}
 if(el.type!=='range')return;const v=+el.value;const out=$(id+'-o');if(out)out.textContent=v+(el.dataset.unit||'');
 if(id.startsWith('o-'))opts[id.slice(2)]=v;
 else if(id==='g-light'){state.light=v;invalidate(false,{A:1,S:1})}
 else if(id==='g-night'){state.night=v;updNight()}
 else if(o){if(id==='sel-h'){o.h=v;invalidate(false,{S:1})}if(id==='sel-w'){o.w=v;delete o._sm;invalidate(false,{der:1})}if(id==='sel-t'){o.t=v;invalidate(false,{S:1})}if(id==='sel-r'){o.r=v;invalidate(false,{S:1})}if(id==='sel-s'){o.s=v;invalidate(false,{S:1})}if(id==='sel-srot'){o.rot=v}if(id==='sel-size'){o.size=v}
  if(id==='sel-rot'){const[cx,cy]=centroid(o.pts);o.pts=rotPts(o.pts,(v-(o.rot||0))*Math.PI/180,cx,cy);o.rot=v;invalidate(false,{S:1})}}});
$('panel').addEventListener('change',e=>{const el=e.target,id=el.id,o=findSel();
 if(id==='g-grid'){state.grid=el.checked;commit();return}
 if(id==='o-autumn'){opts.autumn=el.checked;return}
 if(o&&id==='sel-chim'){o.chimney=el.checked;commit();return}
 if(o&&id==='sel-lit'){o.lit=el.checked;commit();return}
 if(o&&id==='sel-autumn'){o.autumn=el.checked;commit();return}
 if(id==='sel-text'){commit();return}
 if(el.type==='range'&&!id.startsWith('o-'))commit()});
$('panel').addEventListener('click',e=>{const el=e.target.closest('button');if(!el)return;const o=findSel(),d=el.dataset;
 if(d.ocol){opts.bColor=d.ocol;renderPanel()}
 if(d.obank){opts.bank=d.obank;renderPanel()}
 if(d.omat){opts.mat=d.omat;renderPanel()}
 if(d.olvl){opts.hillLvl=+d.olvl;renderPanel()}
 if(d.owm){opts.waterMode=d.owm;renderPanel()}
 if(d.opave){opts.paved=d.opave==='paved';renderPanel()}
 if(d.ostamp){opts.stamp=d.ostamp;renderPanel()}
 if(d.scol&&o){o.color=d.scol;commit();renderPanel()}
 if(d.sbank&&o){o.bank=d.sbank;commit();renderPanel()}
 if(d.spave&&o){o.paved=d.spave==='paved';commit();renderPanel()}
 if(el.id==='paintAll'&&o){state.buildings.forEach(b=>b.color=o.color);commit();toast('Все постройки перекрашены')}
 if(el.id==='delSel')deleteSel();
 if(el.id==='dupSel')dupSel();
 if(el.id==='demo'){loadDemo();commit();fit()}
 if(el.id==='clear'){if(!confirm('Очистить локацию? Можно отменить через ⌘Z.'))return;state={...blank(),light:state.light,grid:state.grid};sel=null;invalidate(true);commit();renderPanel();updNight()}
 if(el.id==='exPng')exportPng(2);
 if(el.id==='exVid')exportVideo();
 if(el.id==='exVtt')exportVtt()});
function deleteSel(){if(!sel)return;state[sel.k]=state[sel.k].filter(o=>o.id!==sel.id);invalidate(false,{S:1,der:1});sel=null;commit();renderPanel()}
function dupSel(){const o=findSel();if(!o)return;const c=JSON.parse(JSON.stringify(o,replacer));c.id=nid();if(c.pts)c.pts=c.pts.map(([x,y])=>[x+24,y+24]);else{c.x+=24;c.y+=24}if(c.v)c.v=nextSeed();state[sel.k].push(c);sel={k:sel.k,id:c.id};invalidate(false,{S:1,der:1});commit();renderPanel();toast('Копия создана')}
function updNight(){$('nightBtn').classList.toggle('on',state.night>0)}
$('nightBtn').onclick=()=>{state.night=state.night>0?0:1;updNight();commit();renderPanel()};

/* ---------- hit test & placement ---------- */
function hit(x,y){for(let i=state.labels.length-1;i>=0;i--){const l=state.labels[i];if(Math.abs(x-l.x)<l.text.length*l.size*.28+6&&Math.abs(y-l.y)<l.size*.6)return{k:'labels',id:l.id}}
 for(let i=state.trees.length-1;i>=0;i--){const t=state.trees[i];if(dist(x,y,t.x,t.y)<t.r)return{k:'trees',id:t.id}}
 for(let i=state.stamps.length-1;i>=0;i--){const s=state.stamps[i];if(dist(x,y,s.x,s.y)<STAMPS[s.type].r*s.s+2)return{k:'stamps',id:s.id}}
 for(let i=state.buildings.length-1;i>=0;i--)if(inPoly(x,y,state.buildings[i].pts))return{k:'buildings',id:state.buildings[i].id};
 for(const k of['walls','roads','rivers'])for(let i=state[k].length-1;i>=0;i--){const o=state[k][i];if(polyDist(x,y,sm(o))<(o.w||o.t)/2+5)return{k,id:o.id}}return null}
function freeSpot(x,y,r){if(x<r||y<r||x>W-r||y>H-r)return false;if(isWater(x,y))return false;for(const v of state.rivers)if(polyDist(x,y,sm(v))<v.w/2+10+r*.5)return false;for(const v of state.roads)if(polyDist(x,y,sm(v))<v.w/2+r*.7)return false;for(const v of state.walls)if(polyDist(x,y,sm(v))<v.t/2+r*.7)return false;for(const b of state.buildings)if(inPoly(x,y,b.pts)||polyDist(x,y,b.pts.concat([b.pts[0]]))<r*.8)return false;for(const s of state.stamps)if(dist(x,y,s.x,s.y)<STAMPS[s.type].r*s.s+r*.7)return false;for(const t of state.trees)if(dist(x,y,t.x,t.y)<(t.r+r)*.72)return false;return true}
let seedV=1;const nextSeed=()=>(seedV=(seedV*48271)%2147483647);
function addTree(x,y,r,autumn){state.trees.push({id:nid(),x,y,r,v:nextSeed(),...(autumn?{autumn:true}:{})})}
function scatter(x,y,R,tr,n,rand=Math.random,autumn){for(let i=0;i<n;i++){const a=rand()*Math.PI*2,d=Math.sqrt(rand())*R,r=tr*(.75+rand()*.5),px=x+Math.cos(a)*d,py=y+Math.sin(a)*d;if(freeSpot(px,py,r))addTree(px,py,r,autumn&&rand()<.8)}}
function addStamp(type,x,y,s=1,rot=0){state.stamps.push({id:nid(),type,x,y,s,rot,v:nextSeed()%1000})}

/* ---------- pointer ---------- */
let drag=null,mouse=null,spaceDown=false;
canvas.addEventListener('contextmenu',e=>e.preventDefault());
const touches=new Map();let pinch=null;
function pinchState(){const[a,b]=[...touches.values()];return{d:dist(a[0],a[1],b[0],b[1]),cx:(a[0]+b[0])/2,cy:(a[1]+b[1])/2}}
canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){touches.set(e.pointerId,[e.clientX,e.clientY]);if(touches.size===2){if(drag&&drag.path)drag=null;else if(drag&&!drag.pan){canvas.dispatchEvent(new PointerEvent('pointerup',{pointerId:e.pointerId}))}drag=null;pinch={...pinchState(),vs:view.s,vx:view.x,vy:view.y};return}}
 canvas.setPointerCapture(e.pointerId);const[x,y]=worldPoint(e);
 if(e.button===1||e.button===2||spaceDown||tool==='hand'){drag={pan:1,sx:e.clientX,sy:e.clientY,vx:view.x,vy:view.y};return}
 if(e.button!==0)return;
 if(tool==='select'){sel=hit(x,y);renderPanel();drag=sel?{move:1,lx:x,ly:y,moved:false}:null;return}
 if(tool==='hill'||tool==='hillErase'){const op={m:tool==='hill'?'add':'erase',l:tool==='hill'?opts.hillLvl:1,r:opts.hillR,pts:[[x,y]]};state.hillOps.push(op);applyHillOp(op);liveCopy();dirty.A=true;drag={hill:op};return}
 if(tool==='water'){const op={m:opts.waterMode==='erase'?'erase':'add',r:opts.waterR,pts:[[x,y]]};state.waterOps.push(op);applyWaterOp(op);liveCopy();dirty.A=true;drag={water:op};return}
 if(tool==='ground'){const op={mat:opts.mat,r:opts.groundR,pts:[[x,y]]};state.groundOps.push(op);applyGroundOp(op);dirty.A=true;drag={ground:op};return}
 if(['river','road','wall','free'].includes(tool)){drag={path:[[x,y]]};return}
 if(tool==='house'||tool==='tower'){drag={box:[x,y,x,y]};return}
 if(tool==='tree'){addTree(x,y,opts.treeR);invalidate(false,{S:1});commit();return}
 if(tool==='forest'){scatter(x,y,opts.forestR,opts.treeR,10,Math.random,opts.autumn);invalidate(false,{S:1});drag={forest:1};return}
 if(tool==='stamp'){addStamp(opts.stamp,x,y,opts.stampS,opts.stamp==='boat'||opts.stamp==='tent'||opts.stamp==='cart'?Math.round(Math.random()*60-30):0);invalidate(false,{S:1});commit();return}
 if(tool==='label'){const l={id:nid(),x,y,text:'Новое место',size:28};state.labels.push(l);commit();sel={k:'labels',id:l.id};setToolKeepSel();setTimeout(()=>{const i=$('sel-text');if(i){i.focus();i.select()}},30);return}
 if(tool==='erase'){const h=hit(x,y);if(h&&!['trees','stamps'].includes(h.k)){if(h.k==='buildings')reserveErasedBuilding(h.id);state[h.k]=state[h.k].filter(o=>o.id!==h.id);invalidate(false,{S:1,der:1})}eraseSmall(x,y);drag={erase:1};return}});
function setToolKeepSel(){tool='select';renderTools();renderPanel();updHint();if(window.innerWidth<=900)$('panel').classList.add('open')}
function eraseSmall(x,y){const n=state.trees.length+state.stamps.length;state.trees=state.trees.filter(t=>dist(x,y,t.x,t.y)>opts.eraseR+t.r*.3);state.stamps=state.stamps.filter(s=>dist(x,y,s.x,s.y)>opts.eraseR+STAMPS[s.type].r*s.s*.3);if(state.trees.length+state.stamps.length!==n)invalidate(false,{S:1})}
canvas.addEventListener('pointermove',e=>{if(touches.has(e.pointerId))touches.set(e.pointerId,[e.clientX,e.clientY]);if(pinch&&touches.size===2){const p=pinchState(),r=canvas.getBoundingClientRect(),ns=clamp(pinch.vs*p.d/pinch.d,.15,6),ox=pinch.cx-r.left,oy=pinch.cy-r.top,wx=(ox-pinch.vx)/pinch.vs,wy=(oy-pinch.vy)/pinch.vs;view.s=ns;view.x=p.cx-r.left-wx*ns;view.y=p.cy-r.top-wy*ns;return}
 const[x,y]=worldPoint(e);mouse=[x,y];if(!drag)return;
 if(drag.pan){view.x=drag.vx+e.clientX-drag.sx;view.y=drag.vy+e.clientY-drag.sy;return}
 if(drag.move){const o=findSel();if(!o)return;const dx=x-drag.lx,dy=y-drag.ly;drag.lx=x;drag.ly=y;drag.moved=true;markCustom(o);moveLinked(sel,dx,dy);if('x' in o&&!o.pts){o.x+=dx;o.y+=dy}else{o.pts=o.pts.map(([a,b])=>[a+dx,b+dy]);delete o._sm}invalidate(false,{S:1,der:!['trees','stamps','labels'].includes(sel.k)});return}
 const br=drag.hill||drag.water||drag.ground;
 if(br){const p=br.pts,l=p[p.length-1];if(dist(x,y,l[0],l[1])>br.r*.2){p.push([x,y]);(drag.hill?applyHillOp:drag.water?applyWaterOp:applyGroundOp)(br,p.length-2);if(!drag.ground)liveCopy();dirty.A=true}return}
 if(drag.path){const l=drag.path[drag.path.length-1];if(dist(x,y,l[0],l[1])>4/Math.max(view.s,.5))drag.path.push([x,y]);return}
 if(drag.box){drag.box[2]=x;drag.box[3]=y;return}
 if(drag.forest){scatter(x,y,opts.forestR,opts.treeR,4,Math.random,opts.autumn);invalidate(false,{S:1});return}
 if(drag.erase)eraseSmall(x,y)});
const endTouch=e=>{touches.delete(e.pointerId);if(touches.size<2)pinch=null};canvas.addEventListener('pointercancel',e=>{endTouch(e);drag=null});
canvas.addEventListener('pointerup',e=>{endTouch(e);if(!drag)return;const d=drag;drag=null;
 if(d.move){if(d.moved)commit();return}
 if(d.hill||d.water){organicAll();dirty.A=dirty.der=true;commit();return}
 if(d.ground){commit();return}
 if(d.path){const p=rdp(d.path,2.2);const len=p.reduce((s,q,i)=>i?s+dist(...q,...p[i-1]):0,0);if(len<20)return;
  if(tool==='river')state.rivers.push({id:nid(),pts:p,w:opts.riverW,bank:opts.bank});
  if(tool==='road')state.roads.push({id:nid(),pts:p,w:opts.roadW,...(opts.paved?{paved:true}:{})});
  if(tool==='wall')state.walls.push({id:nid(),pts:p,t:opts.wallT,h:opts.wallH});
  if(tool==='free'){if(p.length<3)return;state.buildings.push({id:nid(),kind:'free',pts:chaikin(rdp(d.path,3),1),h:opts.bH,color:opts.bColor,...buildingDefaults()})}
  invalidate(false,{S:1,der:1});commit();return}
 if(d.box){const[x0,y0,x1,y1]=d.box,w=Math.abs(x1-x0),h=Math.abs(y1-y0);if(w<8||h<8)return;const cx=(x0+x1)/2,cy=(y0+y1)/2;
  state.buildings.push({id:nid(),kind:tool,pts:tool==='house'?rectPts(cx,cy,w,h,0):ovalPts(cx,cy,w/2,h/2),h:opts.bH,color:opts.bColor,...buildingDefaults()});invalidate(false,{S:1});commit();return}
 if(d.forest||d.erase)commit()});
canvas.addEventListener('pointerleave',()=>{mouse=null});
canvas.addEventListener('wheel',e=>{e.preventDefault();const r=canvas.getBoundingClientRect();if(e.ctrlKey||Math.abs(e.deltaY)>=40||e.deltaMode)zoomAt(Math.exp(-e.deltaY*(e.ctrlKey?.01:.0015)),e.clientX-r.left,e.clientY-r.top);else{view.x-=e.deltaX;view.y-=e.deltaY}},{passive:false});
window.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA','BUTTON'].includes(e.target.tagName)||$('welcomeDialog')?.open)return;if(e.code==='Space'){spaceDown=true;e.preventDefault();return}
 const mod=e.metaKey||e.ctrlKey,k=e.key.toLowerCase();if(mod&&k==='z'){e.preventDefault();e.shiftKey?redo():undo();return}if(mod&&k==='y'){e.preventDefault();redo();return}if(mod&&k==='d'){e.preventDefault();dupSel();return}if(mod)return;
 if((e.key==='Delete'||e.key==='Backspace')&&sel){e.preventDefault();deleteSel();return}if(e.key==='Escape'){sel=null;renderPanel();return}
 if(k==='n'){$('nightBtn').click();return}
 const t=TOOLS.find(x=>x!=='-'&&x.k===k);if(t)setTool(t.id)});
window.addEventListener('keyup',e=>{if(e.code==='Space')spaceDown=false});

/* ---------- overlay ---------- */
function drawOverlay(c){const z=1/view.s;
 const o=findSel();if(o){c.save();c.strokeStyle='#2783DE';c.lineWidth=2*z;c.setLineDash([6*z,4*z]);if(sel.k==='trees'){c.beginPath();c.arc(o.x,o.y,o.r+4*z,0,7);c.stroke()}else if(sel.k==='stamps'){c.beginPath();c.arc(o.x,o.y,STAMPS[o.type].r*o.s+5*z,0,7);c.stroke()}else if(sel.k==='labels'){const w=o.text.length*o.size*.28+8;c.strokeRect(o.x-w,o.y-o.size*.65,w*2,o.size*1.3)}else if(sel.k==='buildings'){tracePath(c,o.pts,true);c.stroke()}else{tracePath(c,sm(o));c.lineWidth=((o.w||o.t)+10);c.globalAlpha=.25;c.setLineDash([]);c.lineCap='round';c.stroke()}c.restore()}
 if(drag&&drag.path){c.save();c.strokeStyle='#2783DE';c.lineWidth=2.5*z;c.lineCap=c.lineJoin='round';tracePath(c,drag.path);c.stroke();c.restore()}
 if(drag&&drag.box){const[x0,y0,x1,y1]=drag.box;c.save();c.strokeStyle='#2783DE';c.lineWidth=2*z;c.setLineDash([6*z,4*z]);c.beginPath();if(tool==='house')c.rect(Math.min(x0,x1),Math.min(y0,y1),Math.abs(x1-x0),Math.abs(y1-y0));else c.ellipse((x0+x1)/2,(y0+y1)/2,Math.abs(x1-x0)/2,Math.abs(y1-y0)/2,0,0,7);c.stroke();c.restore()}
 const br={hill:opts.hillR,hillErase:opts.hillR,water:opts.waterR,ground:opts.groundR,forest:opts.forestR,erase:opts.eraseR}[tool];if(br&&mouse&&!spaceDown){c.save();c.strokeStyle='rgba(255,255,255,.95)';c.lineWidth=2*z;c.beginPath();c.arc(mouse[0],mouse[1],br,0,7);c.stroke();c.strokeStyle='rgba(0,0,0,.45)';c.lineWidth=z;c.stroke();c.restore()}}
