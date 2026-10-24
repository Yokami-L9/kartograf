/* SANDBOX 02 — original district and architectural tools; no external assets. */
const STYLES={
 medieval:{name:'Старый город',note:'Камень, фахверк, черепица',roof:'hip',wall:'#d8c5a1',floor:'#b58a5c',colors:['#ae5740','#97634a','#a87140','#64747a'],floors:2},
 village:{name:'Деревня',note:'Солома, дерево, низкие дома',roof:'gable',wall:'#ad9470',floor:'#b39768',colors:['#b7994b','#b4a064','#9a7445','#87744b'],floors:1},
 nordic:{name:'Север',note:'Тёмная черепица, холодный камень',roof:'gable',wall:'#9ba69c',floor:'#8c826b',colors:['#53646a','#69766d','#49626a','#7a6555'],floors:2},
 desert:{name:'Южный город',note:'Плоские крыши, песчаник',roof:'flat',wall:'#e1c69a',floor:'#d1b98b',colors:['#d7ba85','#e2c99c','#c6a576','#cdbc9e'],floors:2},
 arcane:{name:'Магический',note:'Медь, патина, светящиеся детали',roof:'hip',wall:'#c1c9b4',floor:'#a0aa9b',colors:['#4f827c','#5b6f8e','#7b6187','#7f9b87'],floors:3}
};
Object.assign(opts,{style:'medieval',roof:'hip',floors:2,density:70,plotSize:44,setback:10,rooms:'split',districtShape:'rect'});
Object.assign(STAMPS,{
 table:{n:'Стол',r:12,h:4},bed:{n:'Кровать',r:13,h:4},shelf:{n:'Шкаф',r:12,h:7},stairs:{n:'Лестница',r:14,h:0},rug:{n:'Ковёр',r:15,h:0},chest:{n:'Сундук',r:9,h:5},altar:{n:'Алтарь',r:12,h:5},pillar:{n:'Колонна',r:7,h:12}
});
const FURNITURE=['table','bed','shelf','stairs','rug','chest','altar','pillar'];
const sx=STYLES;
const districtTool={id:'district',k:'u',n:'Квартал',i:I('<rect x="3" y="3" width="14" height="14" rx="2"/><path d="M3 10h14M10 3v14M5 6h2M13 14h2"/>'),h:'Растяните область рядом с дорогами. Дома появятся вдоль улиц, сохраняя проходы. Без дорог появится свободная застройка.'};
TOOLS.splice(TOOLS.findIndex(t=>t.id==='house'),0,districtTool);
TOOLS.splice(TOOLS.findIndex(t=>t.id==='wall')+1,0,{id:'partition',k:'j',n:'Стена интерьера',i:I('<path d="M3 16V4h14M3 10h5M12 10h5v6"/>'),h:'Проведите внутреннюю стену. Она видна на выбранном этаже в режиме интерьера. Мебель находится в «Объектах».'});
KN.districts='Квартал';KN.partitions='Внутренняя стена';

/* UI skin, scene controls, accessible help. */
const styleSheet=document.createElement('style');styleSheet.textContent=`
:root{--danger:#b63f37;--muted:#68665f;--accent:#266e66;--accent-soft:#e5f1ec;--bg:#f5f4ef;--border:#dfdfd7}
@media(prefers-color-scheme:dark){:root{--danger:#ff9d90;--muted:#b7bab5;--accent:#8ac5b5;--accent-soft:#263e36;--bg:#171d1a;--panel:#202823;--surface:#303c34;--border:#48534b;--text:#f0f2ec}.hbtn.primary,.pbtn.accent{color:#18231d}}
#app{grid-template-columns:64px minmax(0,1fr) 304px;grid-template-rows:60px minmax(0,1fr)}
header{padding:0 16px;gap:8px}.brand{gap:10px}.brand b{font-size:18px;letter-spacing:-.6px}.brand span{font-size:14px}.version{font-size:14px!important;letter-spacing:.5px;color:var(--accent)!important;border:1px solid var(--border);padding:3px 6px;border-radius:4px}
#panel{padding:20px}#panel h3{font-size:14px;letter-spacing:.04em;margin-bottom:12px}.pdesc,.field>label,.check,.rules,.kbd,.seg button,.chip{font-size:14px}.ptitle{font-size:18px;letter-spacing:-.3px}.pdesc{line-height:1.55}.pbtn,.seg button{min-height:44px}.hbtn{height:44px;min-width:44px}.sw{width:36px;height:36px}.field{margin-bottom:16px}.grid3{grid-template-columns:repeat(2,minmax(0,1fr))}.chip{min-height:48px}.field input[type=range]{min-height:24px}.row2 .pbtn{font-size:14px}
.stylecards{display:grid;grid-template-columns:1fr 1fr;gap:8px}.stylecard{position:relative;display:flex;align-items:center;gap:8px;text-align:left;border:1px solid var(--border);border-radius:8px;background:var(--panel);padding:9px 8px;min-height:48px;cursor:pointer;font-size:14px}.stylecard.on{border-color:var(--accent);background:var(--accent-soft)}.stylecard i{width:14px;height:24px;border-radius:3px;flex:none;border:1px solid #0003}.stylecard:last-child{grid-column:1/-1}.stylecard span{font-weight:550}.muted{color:var(--muted)}.smallnote{font-size:14px;color:var(--muted);line-height:1.5;margin:10px 0 0}.callout{background:var(--accent-soft);border:1px solid var(--border);padding:12px;border-radius:8px;font-size:14px;margin-bottom:16px}.pbtn.accent{background:var(--accent);color:#fff;border-color:var(--accent)}
#sceneBar{position:absolute;top:16px;left:16px;display:flex;align-items:center;gap:10px;background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:10px 12px;max-width:calc(100% - 32px);box-shadow:0 3px 12px #17271912}#sceneName{border:0;background:transparent;font-weight:600;font-size:16px;width:170px;min-width:0;padding:0;height:26px}#saveState{font-size:14px;color:var(--muted);display:block}#sceneBar .sceneDot{height:8px;width:8px;border-radius:50%;background:#57947b;flex:none}#sceneBar button{height:44px;min-width:44px}.scenediv{width:1px;height:28px;background:var(--border)}#roofBtn{font-size:14px}#roofBtn.on{border-color:var(--accent)}
#hint{font-size:14px;max-width:min(640px,calc(100% - 156px));background:rgba(27,42,33,.92);padding:10px 14px;line-height:1.45}#zoom button{height:44px;width:44px}#toast{font-size:14px;top:92px;max-width:calc(100% - 32px);white-space:normal;text-align:center;z-index:6}.districtrow{display:flex;align-items:center;gap:8px;min-height:44px;width:100%;border:0;background:transparent;border-radius:6px;padding:8px;text-align:left;cursor:pointer;font-size:14px}.districtrow:hover{background:var(--surface)}.districtrow i{height:10px;width:10px;border-radius:2px}.districtrow span{flex:1}.districtrow small{font-size:14px;color:var(--muted)}select{width:100%;min-height:44px;border:1px solid var(--border);background:var(--panel);border-radius:8px;padding:8px}#levelBar{display:flex;gap:4px}#levelBar button{min-width:44px}
#helpDialog{max-width:650px;width:calc(100vw - 32px);max-height:85vh;overflow:auto;border:1px solid var(--border);border-radius:12px;background:var(--panel);color:var(--text);padding:28px}#helpDialog::backdrop{background:#17271acc;backdrop-filter:blur(5px)}#helpDialog h2{font-size:28px;letter-spacing:-1px;margin:0 0 12px}#helpDialog p,#helpDialog li{font-size:16px;line-height:1.6}#helpDialog h3{font-size:18px;margin:24px 0 8px}#helpDialog .closeHelp{float:right;border:1px solid var(--border);border-radius:8px;min-height:44px;background:var(--panel);padding:0 14px;cursor:pointer}#helpDialog code{background:var(--surface);padding:2px 6px;border-radius:4px;font-size:14px}.helpgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.helpgrid p{padding:12px;background:var(--surface);border-radius:8px;margin:0}.kbd{line-height:1.6}.hidden{display:none!important}
@media(max-width:1100px){.brand span:not(.version){display:none}#app{grid-template-columns:60px minmax(0,1fr) 288px}#panel{padding:16px}header{padding:0 12px}.hbtn .lbl{display:none}}
@media(max-width:900px){#app{grid-template-columns:56px minmax(0,1fr)}#panel{top:60px;width:min(320px,86vw)}#sceneName{width:150px}#tools{width:56px}#sceneBar{gap:8px}#saveState{font-size:14px}#hint{max-width:calc(100% - 24px);bottom:68px}}
@media(max-width:540px){.version{display:none}header{gap:4px;padding:0 8px}.brand b{font-size:14px}.hbtn{min-width:44px;width:44px;padding:0}.sep{display:none}#sceneBar{left:8px;top:8px;padding:8px;gap:6px;max-width:calc(100% - 16px)}#sceneName{width:100%;font-size:14px}#sceneBar>div:first-of-type{flex:1;min-width:0}#roofBtn{width:auto;padding:0 8px}#sceneBar .sceneDot,.scenediv{display:none}#levelBar{position:absolute;top:72px;left:0;background:var(--panel);padding:4px;border-radius:8px}#hint{font-size:14px;left:8px;max-width:calc(100% - 16px);bottom:64px}#zoom{right:8px;bottom:8px}#helpDialog{padding:20px}.helpgrid{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}
`;
document.head.append(styleSheet);document.title='Картограф / Sandbox 02 — локации для НРИ';
document.querySelector('.brand').innerHTML='<b>Картограф</b><span class="version">SANDBOX 02</span><span>локации для НРИ</span>';
const helpButton=document.createElement('button');helpButton.className='hbtn';helpButton.id='helpBtn';helpButton.textContent='?';helpButton.title='Как пользоваться';helpButton.setAttribute('aria-label','Как пользоваться');document.querySelector('header').insertBefore(helpButton,$('panelToggle'));
const sceneBar=document.createElement('div');sceneBar.id='sceneBar';sceneBar.innerHTML='<i class="sceneDot" aria-hidden="true"></i><div><input id="sceneName" aria-label="Название локации" maxlength="60"><span id="saveState">Локальный проект</span></div><span class="scenediv"></span><button id="roofBtn" class="hbtn" title="Показать интерьеры (K)">Интерьер</button><div id="levelBar" class="hidden"></div>';$('stage').append(sceneBar);
const help=document.createElement('dialog');help.id='helpDialog';help.innerHTML=`<button class="closeHelp" autofocus>Закрыть</button><h2>Твоё место приключения.</h2><p>Свободная песочница: строй деревню, город или отдельный дом. Никакой экономики, ресурсов и обязательных задач.</p><div class="helpgrid"><p><b>01 · Нарисуй улицы</b><br>Дорога: <code>D</code>. Проведи несколько улиц и переулков.</p><p><b>02 · Построй квартал</b><br>Квартал: <code>U</code>. Выбери стиль и растяни область рядом с улицами.</p><p><b>03 · Сделай своим</b><br>Выбор: <code>V</code>. Меняй размер, крышу, этажность. Изменённые дома защищены от перегенерации.</p><p><b>04 · Зайди внутрь</b><br>Интерьер: <code>K</code>. Этажи, планировки, мебель и внутренние стены <code>J</code>.</p></div><h3>Управление</h3><p>Пробел + перетаскивание — камера. Колесо — масштаб.<br><code>⌘Z</code> — отмена · <code>⇧⌘Z</code> — повтор · <code>⌘D</code> — копия.<br><code>N</code> — ночь · <code>[</code> / <code>]</code> — поворот объекта на 15°.<br>Привязка к сетке включается в настройках карты.</p><h3>Твои данные</h3><p>Автосохранение работает в этом браузере, если он разрешает локальное хранилище. Для надёжной копии нажми «Сохранить» и скачай JSON. Файл открывается через «Открыть». Облака и аккаунтов нет.</p><p class="muted">Это 2D/2.5D-редактор сверху, не полноценный 3D-движок. PNG и файл проекта работают автономно, без внешних библиотек.</p>`;document.body.append(help);help.querySelector('button').onclick=()=>help.close();help.addEventListener('click',e=>{if(e.target===help&&e.offsetX<0)help.close()});helpButton.onclick=()=>help.showModal();
$('sceneName').addEventListener('change',e=>{state.name=e.target.value.trim()||'Новая локация';commit();syncChrome()});
$('roofBtn').onclick=()=>{state.roofMode=state.roofMode==='interior'?'roof':'interior';invalidate(false,{S:1});commit();renderPanel();syncChrome()};
function syncChrome(){if($('sceneName')!==document.activeElement)$('sceneName').value=state.name||'Новая локация';$('roofBtn').textContent=state.roofMode==='interior'?'Крыши':'Интерьер';$('roofBtn').classList.toggle('on',state.roofMode==='interior');$('levelBar').classList.toggle('hidden',state.roofMode!=='interior');$('levelBar').innerHTML=[1,2,3].map(n=>`<button class="hbtn${state.level===n?' on':''}" data-level="${n}" title="Этаж ${n}" aria-label="Этаж ${n}">${n}</button>`).join('')}
$('levelBar').onclick=e=>{const n=+e.target.dataset.level;if(n){state.level=n;invalidate(false,{S:1});commit();syncChrome();renderPanel()}};
function persist(js){try{localStorage.setItem('kartograf-map-v3',js);$('saveState').textContent='Сохранено в этом браузере';$('saveState').title='Для резервной копии скачай JSON через «Сохранить»'}catch(e){$('saveState').textContent='Скачай JSON: автосохранение недоступно'}}
function worldPoint(e){const p=toWorld(e);if(!state.snap||tool==='hand'||spaceDown)return p;return p.map(v=>Math.round(v/10)*10)}
function markCustom(o){if(o?.districtId)o.custom=true}
function buildingDefaults(){return{style:opts.style,roof:opts.roof,floors:opts.floors,rooms:opts.rooms,doorOpen:false,seed:nextSeed(),plans:{},lit:true}}
function moveLinked(s,dx,dy){if(s?.k==='buildings'){for(const st of state.stamps)if(st.buildingId===s.id){st.x+=dx;st.y+=dy}for(const w of state.partitions)if(w.buildingId===s.id){w.pts=w.pts.map(([x,y])=>[x+dx,y+dy]);delete w._sm}}}

/* Safe, backwards-compatible, atomic JSON import. */
function validateMap(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Ожидается файл проекта Картографа');
 if(!Array.isArray(input.buildings)||!Array.isArray(input.roads))throw Error('Это не карта Картографа');
 const s={...blank(),...input};let total=0;const used=new Set();let newId=1;
 const num=(v,a,b,def)=>Number.isFinite(v)?clamp(v,a,b):def;
 function points(p,min=1){if(!Array.isArray(p)||p.length<min||p.length>15000)throw Error('Некорректная геометрия');return p.map(q=>{if(!Array.isArray(q)||q.length!==2||!q.every(Number.isFinite)||q.some(v=>Math.abs(v)>10000))throw Error('Некорректные координаты');return[q[0],q[1]]})}
 for(const k of [...LISTS,'hillOps','waterOps','groundOps']){
  if(!Array.isArray(s[k])||s[k].length>8000)throw Error('Слишком много объектов');total+=s[k].length;if(total>16000)throw Error('Слишком большая карта');
  s[k]=s[k].map(v=>{if(!v||typeof v!=='object')throw Error('Некорректный объект');const o={...v};for(const key of Object.keys(o))if(key[0]==='_')delete o[key];
   if(LISTS.includes(k)){if(!Number.isSafeInteger(o.id)||o.id<1||used.has(o.id)){while(used.has(newId))newId++;o.id=newId++}used.add(o.id)}
   if(['buildings','roads','rivers','walls','partitions','districts','hillOps','waterOps','groundOps'].includes(k))o.pts=points(o.pts,k==='buildings'||k==='districts'?3:1);
   if(['trees','stamps','labels'].includes(k)){if(!Number.isFinite(o.x)||!Number.isFinite(o.y))throw Error('Некорректные координаты');o.x=clamp(o.x,-1000,W+1000);o.y=clamp(o.y,-1000,H+1000)}
   if(k==='buildings'){o.color=/^#[0-9a-f]{6}$/i.test(o.color)?o.color:'#ae5740';o.h=num(o.h,2,90,18);o.floors=Math.round(num(o.floors,1,3,1));o.style=sx[o.style]?o.style:'medieval';o.roof=['hip','gable','flat'].includes(o.roof)?o.roof:'hip';o.kind=['house','tower','free'].includes(o.kind)?o.kind:'house';o.plans=o.plans&&typeof o.plans==='object'?o.plans:{};o.seed=num(o.seed,1,2147483647,o.id*71);o.rot=num(o.rot,-360,360,0)}
   if(k==='districts'){o.style=sx[o.style]?o.style:'medieval';o.seed=num(o.seed,1,2147483647,123);o.density=num(o.density,20,100,70);o.plotSize=num(o.plotSize,28,80,44);o.setback=num(o.setback,4,28,10);o.name=String(o.name||'Квартал').slice(0,60);o.exclusions=(Array.isArray(o.exclusions)?o.exclusions:[]).slice(0,1000).map(p=>points(p,3))}
   if(k==='stamps'){if(!STAMPS[o.type])throw Error('Неизвестный объект');o.s=num(o.s,.3,4,1);o.rot=num(o.rot,-360,360,0);o.v=num(o.v,1,2147483647,1);o.floor=Math.round(num(o.floor,0,3,0))}
   if(k==='trees'){o.r=num(o.r,4,40,13);o.v=num(o.v,1,2147483647,o.id)}
   if(k==='labels'){o.text=String(o.text||'Место').slice(0,100);o.size=num(o.size,10,100,28)}
   if(k==='roads'||k==='rivers')o.w=num(o.w,6,100,16);
   if(k==='rivers')o.bank=BANKS[o.bank]?o.bank:'grass';
   if(k==='walls'||k==='partitions'){o.t=num(o.t,2,30,k==='partitions'?4:10);o.h=num(o.h,0,70,12);o.level=Math.round(num(o.level,1,3,1))}
   if(k==='hillOps'||k==='waterOps'){o.r=num(o.r,5,200,50);o.m=o.m==='erase'?'erase':'add';o.l=o.l===2?2:1}
   if(k==='groundOps'){o.r=num(o.r,5,200,40);o.mat=MATS[o.mat]?o.mat:'grass'}
   return o
  })
 }
 s.light=num(s.light,0,359,40);s.night=num(s.night,0,1,0);s.level=Math.round(num(s.level,1,3,1));s.name=String(s.name||'Новая локация').slice(0,60);s.roofMode=s.roofMode==='interior'?'interior':'roof';s.gridSize=num(input.gridSize,5,100,input.schemaVersion>=3?10:50);s.schemaVersion=3;s.grid=!!s.grid;s.snap=!!s.snap;return s
}

/* Parcels: deterministic road-aware placement, collision tests, protected edits. */
function bounds(p){return{l:Math.min(...p.map(q=>q[0])),r:Math.max(...p.map(q=>q[0])),t:Math.min(...p.map(q=>q[1])),b:Math.max(...p.map(q=>q[1]))}}
function boxesMeet(a,b,pad=0){return a.l<b.r+pad&&a.r>b.l-pad&&a.t<b.b+pad&&a.b>b.t-pad}
function polysMeet(a,b,pad=0){for(const p of[a,b])for(let i=0;i<p.length;i++){const q=p[i],r=p[(i+1)%p.length],dx=-(r[1]-q[1]),dy=r[0]-q[0],len=Math.hypot(dx,dy)||1,nx=dx/len,ny=dy/len;let al=Infinity,ar=-Infinity,bl=Infinity,br=-Infinity;for(const[x,y]of a){const v=x*nx+y*ny;al=Math.min(al,v);ar=Math.max(ar,v)}for(const[x,y]of b){const v=x*nx+y*ny;bl=Math.min(bl,v);br=Math.max(br,v)}if(ar+pad<bl||br+pad<al)return false}return true}
function roadSamples(road,step,phase=0){const p=sm(road),out=[];let walked=0,next=phase;for(let i=0;i<p.length-1;i++){const a=p[i],b=p[i+1],len=dist(...a,...b);while(next<=walked+len){const u=(next-walked)/len;if(u>=0&&len>0)out.push({x:a[0]+(b[0]-a[0])*u,y:a[1]+(b[1]-a[1])*u,angle:Math.atan2(b[1]-a[1],b[0]-a[0])});next+=step}walked+=len}return out}
function makeDistrict(pts,overrides={}){const d={id:nid(),name:'Новый квартал',pts,exclusions:[],style:opts.style,seed:nextSeed(),density:opts.density,plotSize:opts.plotSize,setback:opts.setback,...overrides};state.districts.push(d);return d}
function generateDistrict(d,newSeed=false){
 if(dirty.mask){rebuildMasks();dirty.mask=false;dirty.A=dirty.der=true}
 if(newSeed)d.seed=nextSeed();const ids=new Set(state.buildings.filter(b=>b.districtId===d.id&&!b.custom).map(b=>b.id));state.buildings=state.buildings.filter(b=>!ids.has(b.id));state.stamps=state.stamps.filter(o=>!ids.has(o.buildingId));state.partitions=state.partitions.filter(o=>!ids.has(o.buildingId));
 const r=rng(d.seed),S=sx[d.style]||sx.medieval,B=bounds(d.pts),size=d.plotSize,spacing=size*(1.18+(100-d.density)/125),accepted=[],obstacles=state.buildings.map(b=>({b:bounds(b.pts),p:b.pts}));let attempts=0;
 function place(cx,cy,a,w,depth){
  attempts++;if(accepted.length>=180)return false;const p=rectPts(cx,cy,w,depth,a),bb=bounds(p);if((d.exclusions||[]).some(q=>polysMeet(p,q,2)))return false;if(!p.every(q=>q[0]>8&&q[1]>8&&q[0]<W-8&&q[1]<H-8&&inPoly(...q,d.pts)))return false;
  const samples=p.concat([[cx,cy]],p.map((q,i)=>[(q[0]+p[(i+1)%4][0])/2,(q[1]+p[(i+1)%4][1])/2]));
  for(const q of samples){if(isWater(...q))return false;for(const st of state.stamps)if(!st.floor&&dist(q[0],q[1],st.x,st.y)<STAMPS[st.type].r*st.s+4)return false;for(const river of state.rivers)if(polyDist(...q,sm(river))<river.w/2+9)return false;for(const road of state.roads)if(polyDist(...q,sm(road))<road.w/2+Math.max(4,d.setback*.6))return false;for(const wall of state.walls)if(polyDist(...q,sm(wall))<wall.t/2+3)return false}
  const level=heightAt(cx,cy);if(!p.every(q=>heightAt(...q)===level))return false;
  for(const o of obstacles)if(boxesMeet(bb,o.b,5)&&polysMeet(p,o.p,5))return false;
  const color=S.colors[(r()*S.colors.length)|0],floors=d.style==='village'?1:Math.min(3,1+Math.floor(r()*S.floors));
  const b={id:nid(),kind:'house',pts:p,h:12+floors*9,color,rot:Math.round(a*180/Math.PI),style:d.style,roof:S.roof,floors,seed:Math.floor(r()*1e8)+1,rooms:r()>.3?'split':'hall',plans:{},districtId:d.id,custom:false,doorOpen:false,lit:true,chimney:d.style!=='desert'};state.buildings.push(b);accepted.push(b);obstacles.push({b:bb,p});return true
 }
 const nearRoads=state.roads.filter(rd=>roadSamples(rd,25).some(q=>inPoly(q.x,q.y,d.pts)));
 for(const road of nearRoads){for(const q of roadSamples(road,spacing,r()*spacing*.45))for(const side of[-1,1]){if(r()*100>d.density+12)continue;const w=size*(.68+r()*.4),depth=size*(.48+r()*.35),off=road.w/2+d.setback+depth/2;place(q.x-Math.sin(q.angle)*off*side,q.y+Math.cos(q.angle)*off*side,q.angle+(side<0?0:Math.PI),w,depth)}}
 if(!nearRoads.length){for(let y=B.t+size*.65;y<B.b-size*.45;y+=spacing)for(let x=B.l+size*.65;x<B.r-size*.45;x+=spacing){if(r()*100>d.density)continue;const a=(r()-.5)*.32;place(x+(r()-.5)*size*.22,y+(r()-.5)*size*.22,a,size*(.7+r()*.25),size*(.5+r()*.3))}}
 // Trees do not grow through new houses; deliberately preserve user-placed props.
 state.trees=state.trees.filter(t=>!accepted.some(b=>inPoly(t.x,t.y,b.pts)||polyDist(t.x,t.y,b.pts.concat([b.pts[0]]))<t.r*.7));invalidate(false,{S:1});return{created:accepted.length,protected:state.buildings.filter(b=>b.districtId===d.id&&b.custom).length,attempts}
}
function selectDistrict(id){sel={k:'districts',id};setToolKeepSel()}

/* Architecture rendering. */
const oldBuilding=drawBuilding;
function localBox(b){const p=b.pts,c=centroid(p),a=Math.atan2(p[1][1]-p[0][1],p[1][0]-p[0][0]);return{cx:c[0],cy:c[1],a,w:dist(...p[0],...p[1]),d:dist(...p[1],...p[2])}}
function floorPlan(b){return b.plans?.[state.level]||b.rooms||'split'}
function buildingDoor(b){const p=b.pts,a=p[2],z=p[3],len=dist(...a,...z),w=Math.min(12,len*.28),cx=(a[0]+z[0])/2,cy=(a[1]+z[1])/2,ux=(z[0]-a[0])/len,uy=(z[1]-a[1])/len;return{a:[cx-ux*w/2,cy-uy*w/2],b:[cx+ux*w/2,cy+uy*w/2],cx,cy,w}}
function furniture(c,type,x,y,s=1,rot=0,seed=1){drawStamp(c,{type,x,y,s,rot,v:seed},0)}
drawBuilding=function(c,b){
 const S=sx[b.style]||sx.medieval,p=b.pts,indoor=state.roofMode==='interior';
 if(indoor){drawInterior(c,b,S);return}
 c.save();c.lineJoin='round';tracePath(c,p,true);c.fillStyle=S.wall;c.fill();c.lineWidth=6;c.strokeStyle=shade(S.wall,-.4);c.stroke();c.lineWidth=3;c.strokeStyle=S.wall;c.stroke();
 if(b.kind==='house'&&p.length===4&&(b.roof==='gable'||b.roof==='flat')){
  const {cx,cy,a,w,d}=localBox(b);c.save();c.translate(cx,cy);c.rotate(a);const col=b.color;
  if(b.roof==='flat'){
   c.fillStyle=col;c.fillRect(-w/2,-d/2,w,d);c.strokeStyle=shade(col,.28);c.lineWidth=3;c.strokeRect(-w/2+2,-d/2+2,w-4,d-4);c.strokeStyle=shade(col,-.3);c.lineWidth=1;c.strokeRect(-w/2+5,-d/2+5,w-10,d-10);c.fillStyle='rgba(70,62,43,.22)';c.fillRect(w*.15,-d*.18,Math.min(10,w*.2),Math.min(10,d*.26));if(w>32&&d>25){c.strokeStyle=shade(col,-.2);c.lineWidth=1;for(let x=-w/2+9;x<w/2-4;x+=9){c.beginPath();c.moveTo(x,-d/2+5);c.lineTo(x,d/2-5);c.stroke()}}
  }else{
   const light=Math.sin(a)*SV.x-Math.cos(a)*SV.y;c.fillStyle=shade(col,light*.2);c.fillRect(-w/2,-d/2,w,d/2);c.fillStyle=shade(col,-light*.2-.06);c.fillRect(-w/2,0,w,d/2);c.strokeStyle=shade(col,-.43);c.lineWidth=1.5;c.beginPath();c.moveTo(-w/2,0);c.lineTo(w/2,0);c.stroke();
   c.save();c.beginPath();c.rect(-w/2,-d/2,w,d);c.clip();c.strokeStyle='rgba(30,27,20,.16)';c.lineWidth=.7;for(let y=-d/2+4;y<d/2;y+=4){c.beginPath();c.moveTo(-w/2,y);c.lineTo(w/2,y);c.stroke();for(let x=-w/2+((y|0)%8);x<w/2;x+=8){c.beginPath();c.moveTo(x,y);c.lineTo(x,y+3);c.stroke()}}c.restore();
   if(b.chimney!==false){c.fillStyle='#5c5852';c.fillRect(w*.22,-d*.29,5,6);c.fillStyle='#292e2b';c.fillRect(w*.22+1,-d*.29+1,3,3)}
  }
  c.strokeStyle='rgba(45,32,22,.85)';c.lineWidth=1.2;c.strokeRect(-w/2,-d/2,w,d);c.restore();
 }else oldBuilding(c,b);
 // Doors, warm edge windows and style-specific details.
 if(b.kind==='house'&&p.length===4){const {cx,cy,a,w,d}=localBox(b);c.save();c.translate(cx,cy);c.rotate(a);c.strokeStyle='#302b22';c.lineWidth=4;c.beginPath();c.moveTo(-4,d/2+1);c.lineTo(4,d/2+1);c.stroke();c.strokeStyle='#c5b18b';c.lineWidth=2;c.beginPath();c.moveTo(-3,d/2+2);c.lineTo(3,d/2+2);c.stroke();
  for(let x=-w/2+7;x<w/2-4;x+=13){c.fillStyle='#353f3b';c.fillRect(x-2,-d/2-.8,4,2);if(state.night>0&&b.lit!==false){c.fillStyle='#ffdb8b';c.fillRect(x-1.6,-d/2-.9,3.2,1.8)}}
  if(b.style==='arcane'){c.strokeStyle='#c4a65c';c.lineWidth=1;c.beginPath();c.moveTo(-w/2+3,-d/2+3);c.lineTo(w/2-3,-d/2+3);c.stroke();circ(c,0,0,2.2,'#b9e6ce','#57796f',.8)}
  if(b.style==='nordic'){c.strokeStyle='#d3d4bb';c.lineWidth=1.2;c.beginPath();c.moveTo(-w/2,-d/2);c.lineTo(-w/2,d/2);c.moveTo(w/2,-d/2);c.lineTo(w/2,d/2);c.stroke()}
  c.restore()
 }
 c.restore()
};
function drawInterior(c,b,S){
 const p=b.pts,maxFloor=b.floors||1;c.save();tracePath(c,p,true);c.fillStyle=state.level>maxFloor?'rgba(81,87,66,.16)':S.floor;c.fill();
 if(state.level>maxFloor){c.strokeStyle='rgba(54,63,48,.45)';c.lineWidth=2;c.setLineDash([3,4]);c.stroke();c.restore();return}
 c.save();tracePath(c,p,true);c.clip();const B=bounds(p);c.strokeStyle='rgba(40,33,25,.18)';c.lineWidth=.6;for(let y=B.t-10;y<B.b+10;y+=7){c.beginPath();c.moveTo(B.l-10,y);c.lineTo(B.r+10,y);c.stroke()}
 if(b.kind==='house'&&p.length===4){const {cx,cy,a,w,d}=localBox(b);c.translate(cx,cy);c.rotate(a);const plan=floorPlan(b);c.lineWidth=2.8;c.strokeStyle=shade(S.wall,-.55);c.beginPath();if(plan==='split'){c.moveTo(w*.12,-d/2);c.lineTo(w*.12,-2);c.moveTo(w*.12,6);c.lineTo(w*.12,d/2)}if(plan==='rooms'){c.moveTo(-w*.12,-d/2);c.lineTo(-w*.12,-2);c.moveTo(-w*.12,6);c.lineTo(-w*.12,d/2);c.moveTo(-w*.12,0);c.lineTo(w*.15,0);c.moveTo(w*.33,0);c.lineTo(w/2,0)}c.stroke();
  if(b.furnished!==false&&w>27&&d>22){const sc=clamp(Math.min(w/65,d/48),.38,1.3);if(plan==='hall'){furniture(c,'rug',0,0,sc*1.3,0);furniture(c,'table',0,0,sc,0);if(w>40)furniture(c,'shelf',-w*.33,-d*.28,sc*.7,90)}else{furniture(c,'bed',w*.29,-d*.18,sc,0);furniture(c,'table',-w*.25,-d*.15,sc*.75,0);furniture(c,'rug',-w*.24,d*.14,sc*.7,0);furniture(c,'chest',w*.31,d*.28,sc*.65,0)}if(maxFloor>1)furniture(c,'stairs',-w*.32,d*.26,sc*.6,0)}
 }
 c.restore();tracePath(c,p,true);c.strokeStyle=shade(S.wall,-.52);c.lineWidth=4;c.stroke();tracePath(c,p,true);c.strokeStyle=S.wall;c.lineWidth=2;c.stroke();
 const door=buildingDoor(b);c.strokeStyle=S.floor;c.lineWidth=5;c.beginPath();c.moveTo(...door.a);c.lineTo(...door.b);c.stroke();c.strokeStyle='#5a3c24';c.lineWidth=2.3;c.beginPath();c.moveTo(...door.a);if(b.doorOpen){const ux=(door.b[0]-door.a[0]),uy=(door.b[1]-door.a[1]);c.lineTo(door.a[0]-uy,door.a[1]+ux)}else c.lineTo(...door.b);c.stroke();
 c.restore()
}
const oldDrawStamp=drawStamp;
drawStamp=function(c,st,t){
 if(st.floor&&!(state.roofMode==='interior'&&st.floor===state.level))return;
 if(!FURNITURE.includes(st.type)){oldDrawStamp(c,st,t);return}
 c.save();c.translate(st.x,st.y);c.rotate((st.rot||0)*Math.PI/180);c.scale(st.s,st.s);c.lineJoin='round';
 function box(x,y,w,h,col,edge='#4e3b29'){c.fillStyle=col;c.fillRect(x,y,w,h);if(edge){c.strokeStyle=edge;c.lineWidth=1;c.strokeRect(x,y,w,h)}}
 switch(st.type){
 case 'table':box(-10,-6,20,12,'#9b7049');for(const[x,y]of[[-6,-10],[6,-10],[-6,10],[6,10]])box(x-3,y-2.5,6,5,'#8b6241');c.strokeStyle='#bc9262';c.beginPath();c.moveTo(-8,-2);c.lineTo(8,-2);c.stroke();circ(c,0,1,2,'#e8d7af');break;
 case 'bed':box(-8,-12,16,24,'#624c35');box(-6,-10,12,20,'#eee4c6',null);box(-6,-3,12,13,'#7e9290',null);box(-5,-9,10,5,'#fff3d6',null);c.strokeStyle='#a9b7a9';c.beginPath();c.moveTo(-5,1);c.lineTo(5,1);c.stroke();break;
 case 'shelf':box(-12,-4,24,8,'#855e3c');for(let x=-10;x<10;x+=3){c.fillStyle=['#805e45','#64796b','#b39d64','#8f6961'][(x+10)/3%4|0];c.fillRect(x,-3,2,5)}break;
 case 'stairs':box(-9,-13,18,26,'#b2a58a');c.strokeStyle='#6d604e';c.lineWidth=1;for(let y=-10;y<13;y+=4){c.beginPath();c.moveTo(-8,y);c.lineTo(8,y);c.stroke()}c.strokeStyle='#eee3c3';c.beginPath();c.moveTo(0,9);c.lineTo(0,-9);c.lineTo(-2,-6);c.moveTo(0,-9);c.lineTo(2,-6);c.stroke();break;
 case 'rug':box(-15,-10,30,20,'#965b50','#644a3e');c.strokeStyle='#cfaf78';c.lineWidth=1;c.strokeRect(-12,-7,24,14);poly(c,[[0,-5],[6,0],[0,5],[-6,0]],'#caa97b');break;
 case 'chest':box(-8,-5,16,10,'#916943');box(-6,-5,2,10,'#bba675');box(4,-5,2,10,'#bba675');box(-1,-1,2,3,'#c6ad70');break;
 case 'altar':box(-10,-6,20,12,'#b2b3a4','#63685d');box(-8,-4,16,8,'#d6d8c5',null);circ(c,-5,0,1.4,'#f0cf7c');circ(c,5,0,1.4,'#f0cf7c');box(-2,-3,4,6,'#8d7163',null);break;
 case 'pillar':circ(c,0,0,7,'#747d76','#414a42');circ(c,0,0,5,'#bcc0ad','#737c70');circ(c,-1,-1,2.5,'#d6d9c9');break;
 }
 c.restore()
};

const oldWorld=drawWorld;
drawWorld=function(c,t,overlay){
 oldWorld(c,t,false);
 if(state.roofMode==='interior')for(const w of state.partitions)if((w.level||1)===state.level){tracePath(c,w.pts);c.strokeStyle='#4b493e';c.lineWidth=w.t||4;c.lineCap='square';c.stroke();c.strokeStyle='#cec6ae';c.lineWidth=Math.max(1,(w.t||4)-2);c.stroke()}
 if(overlay)drawOverlay(c)
};
const oldOverlay=drawOverlay;
drawOverlay=function(c){
 if(sel?.k==='districts'){const o=findSel();if(o){c.save();tracePath(c,o.pts,true);c.fillStyle='rgba(38,110,102,.07)';c.fill();c.strokeStyle='#266e66';c.lineWidth=2/view.s;c.setLineDash([8/view.s,6/view.s]);c.stroke();c.restore()}}
 const saved=sel;if(sel?.k==='districts')sel=null;oldOverlay(c);sel=saved;
 if(sandboxDrag){const p=sandboxDrag;if(p.type==='district'){const pts=rectPts((p.a[0]+p.b[0])/2,(p.a[1]+p.b[1])/2,Math.abs(p.a[0]-p.b[0]),Math.abs(p.a[1]-p.b[1]),0);c.save();tracePath(c,pts,true);c.fillStyle='rgba(38,110,102,.14)';c.fill();c.strokeStyle='#266e66';c.lineWidth=2/view.s;c.setLineDash([7/view.s,5/view.s]);c.stroke();c.restore()}else{c.save();tracePath(c,[p.a,p.b]);c.strokeStyle='#e8ddc1';c.lineWidth=4;c.stroke();c.restore()}}
};

/* Panels: progressive detail instead of an endless catalogue. */
const origPanel=renderPanel;
const styleCards=(cur,act)=>`<div class="field"><label>Архитектура</label><div class="stylecards">${Object.entries(sx).map(([id,s])=>`<button class="stylecard${cur===id?' on':''}" data-${act}="${id}" title="${s.note}"><i style="background:${s.colors[0]}"></i><span>${s.name}</span></button>`).join('')}</div></div>`;
const roofSelect=(v,id)=>`<div class="field"><label for="${id}">Форма крыши</label><select id="${id}"><option value="hip"${v==='hip'?' selected':''}>Вальмовая</option><option value="gable"${v==='gable'?' selected':''}>Двускатная</option><option value="flat"${v==='flat'?' selected':''}>Плоская</option></select></div>`;
function districtPanel(d){const count=state.buildings.filter(b=>b.districtId===d.id),protectedN=count.filter(b=>b.custom).length;return `<section><p class="ptitle">${esc(d.name)}</p><p class="pdesc">${count.length} домов · ${protectedN} защищено ручной правкой</p><div class="field"><label for="d-name">Название</label><input type="text" id="d-name" maxlength="60" value="${esc(d.name)}"></div>${styleCards(d.style,'dstyle')}${field('d-density','Плотность',20,100,d.density,1,'%')}${field('d-plotSize','Размер домов',28,80,d.plotSize)}${field('d-setback','Отступ от улицы',4,28,d.setback)}<button class="pbtn accent" id="regenDistrict">Применить параметры</button><button class="pbtn" id="shuffleDistrict">Другой вариант застройки</button>${d.exclusions?.length?`<button class="pbtn" id="resetExclusions">Застроить удалённые участки (${d.exclusions.length})</button>`:''}<p class="smallnote">Ручные изменения сохраняются. Если места нет, уменьшите размер домов или отступ.</p><div class="row2" style="margin-top:12px"><button class="pbtn" id="detachDistrict">Разгруппировать</button><button class="pbtn danger" id="deleteDistrict">Удалить квартал</button></div></section>`}
renderPanel=function(){
 origPanel();const panel=$('panel'),o=findSel(),first=panel.querySelector('section');
 // Remove old verbose automation list; keep functionality and exports in compact sections.
 const secs=[...panel.querySelectorAll('section')];const last=secs[secs.length-1];if(last?.textContent.includes('Что карта делает сама'))last.remove();
 const ex=panel.querySelector('#exPng')?.closest('section');if(ex){const details=document.createElement('details');details.innerHTML='<summary style="cursor:pointer;min-height:44px;font-weight:600">Экспорт и резервная копия</summary>';while(ex.firstChild){const child=ex.firstChild;if(child.tagName==='H3')child.remove();else details.append(child)}details.insertAdjacentHTML('beforeend','<div class="row2" style="margin-top:8px"><button class="pbtn" id="saveProject">JSON ↓</button><button class="pbtn" id="openProject">Открыть JSON</button></div>');ex.append(details)}
 const mapSec=panel.querySelector('#g-light')?.closest('section');if(mapSec){mapSec.insertAdjacentHTML('afterbegin','<label class="check"><input type="checkbox" id="g-snap"'+(state.snap?' checked':'')+'> Привязка объектов: шаг 10 px</label>')}
 if(o&&sel.k==='districts'){first.outerHTML=districtPanel(o)}
 else if(o&&sel.k==='buildings'){
  const section=panel.querySelector('section');const b=o;section.querySelector('.pdesc').textContent=b.districtId?(b.custom?'Ручная правка · защищено от перегенерации':'Дом квартала · изменения защитят его от перегенерации'):'Отдельная постройка';
  const extra=document.createElement('div');extra.innerHTML=styleCards(b.style||'medieval','bstyle')+(b.kind==='house'&&b.pts.length===4?(()=>{const L=localBox(b);return field('b-width','Ширина',12,240,Math.round(L.w))+field('b-depth','Глубина',12,180,Math.round(L.d))+roofSelect(b.roof||'hip','b-roof')})():'')+field('b-floors','Этажей',1,3,b.floors||1)+`<div class="field"><label for="b-plan">Планировка · этаж ${state.level||1}</label><select id="b-plan"><option value="hall"${floorPlan(b)==='hall'?' selected':''}>Открытый зал</option><option value="split"${floorPlan(b)==='split'?' selected':''}>Две комнаты</option><option value="rooms"${floorPlan(b)==='rooms'?' selected':''}>Три комнаты</option></select></div><label class="check"><input id="b-door" type="checkbox"${b.doorOpen?' checked':''}> Входная дверь открыта</label><label class="check"><input id="b-furnished" type="checkbox"${b.furnished!==false?' checked':''}> Автоматическая обстановка</label><button class="pbtn" id="enterBuilding">${state.roofMode==='interior'?'Показать крышу':'Посмотреть интерьер'}</button>`;
  const desc=section.querySelector('.pdesc');desc.after(extra);section.querySelector('#paintAll')?.remove();
  if(b.custom&&b.districtId)section.insertAdjacentHTML('beforeend','<button class="pbtn" id="unprotect">Разрешить перегенерацию этого дома</button>');
 }
 else if(tool==='district'){
  first.innerHTML=`<p class="ptitle">Квартал за один жест</p><p class="pdesc">Выбери стиль и растяни прямоугольник рядом с дорогами. Дома повернутся входом к улице.</p>${styleCards(opts.style,'ostyle')}${field('o-density','Плотность',20,100,opts.density,1,'%')}${field('o-plotSize','Размер домов',28,80,opts.plotSize)}${field('o-setback','Отступ от улицы',4,28,opts.setback)}<div class="callout">Сначала улицы <b>D</b>, затем квартал <b>U</b>. Любой дом можно изменить отдельно.</div>`
 }
 else if(['house','tower','free'].includes(tool)&&!o){first.insertAdjacentHTML('beforeend',styleCards(opts.style,'ostyle')+roofSelect(opts.roof,'o-roof')+field('o-floors','Этажей',1,3,opts.floors))}
 else if(tool==='select'&&!o){first.innerHTML='<p class="ptitle">Место для твоей истории</p><p class="pdesc">Выбери дом, чтобы изменить архитектуру и интерьер. Или создай целый квартал одним жестом.</p><button id="startDistrict" class="pbtn accent">＋ Построить квартал · U</button><button id="startHouse" class="pbtn">Нарисовать дом · Q</button><p class="smallnote">Без экономики. Без ресурсов. Только строительство.</p>'}
 else if(tool==='partition'){first.insertAdjacentHTML('beforeend','<button class="pbtn" id="forceInterior">Включить интерьер</button><p class="smallnote">Мебель и стены принадлежат текущему этажу. Стена внутри дома перемещается вместе с ним.</p>')}
 if(state.districts.length){const list=document.createElement('section');list.innerHTML='<h3>Кварталы локации</h3>'+state.districts.map(d=>`<button class="districtrow" data-dselect="${d.id}"><i style="background:${(sx[d.style]||sx.medieval).colors[0]}"></i><span>${esc(d.name)}</span><small>${state.buildings.filter(b=>b.districtId===d.id).length}</small></button>`).join('');const second=panel.querySelectorAll('section')[1];panel.insertBefore(list,second||null)}
 syncChrome()
};

$('panel').addEventListener('input',e=>{const el=e.target,o=findSel();if(!o)return;if(sel.k==='buildings'){markCustom(o);if(el.id==='sel-rot'){rotateLinked(o,(+el.value-(o.rot||0))*Math.PI/180)}if(el.id==='b-width'||el.id==='b-depth'){const b=localBox(o);resizeLinked(o,el.id==='b-width'?+el.value/b.w:1,el.id==='b-depth'?+el.value/b.d:1);o.pts=rectPts(b.cx,b.cy,el.id==='b-width'?+el.value:b.w,el.id==='b-depth'?+el.value:b.d,b.a);invalidate(false,{S:1})}if(el.id==='b-floors'){o.floors=+el.value;o.h=12+o.floors*9;invalidate(false,{S:1})}}
 if(sel.k==='districts'&&el.id.startsWith('d-')){const key=el.id.slice(2);o[key]=el.type==='range'?+el.value:el.value}if(el.type==='range'&&$(el.id+'-o'))$(el.id+'-o').textContent=el.value+(el.dataset.unit||'')
},true);
$('panel').addEventListener('change',e=>{const el=e.target,o=findSel();if(el.id==='g-snap'){state.snap=el.checked;commit()}
 if(el.id==='o-roof')opts.roof=el.value;
 if(o&&sel.k==='buildings'){if(el.id==='b-roof')o.roof=el.value;if(el.id==='b-plan'){o.plans={...(o.plans||{}),[state.level]:el.value};if(state.roofMode!=='interior')state.roofMode='interior'}if(el.id==='b-door')o.doorOpen=el.checked;if(el.id==='b-furnished')o.furnished=el.checked;if(el.id.startsWith('b-')){markCustom(o);commit();renderPanel()}}
 if(o&&sel.k==='districts'&&el.id==='d-name'){o.name=el.value||'Квартал';commit();renderPanel()}
});
$('panel').addEventListener('click',e=>{const el=e.target.closest('button');if(!el)return;const d=el.dataset,o=findSel();
 if(d.ostyle&&sx[d.ostyle]){opts.style=d.ostyle;opts.roof=sx[d.ostyle].roof;opts.bColor=sx[d.ostyle].colors[0];opts.floors=sx[d.ostyle].floors;renderPanel()}
 if(d.bstyle&&o&&sx[d.bstyle]){o.style=d.bstyle;o.color=sx[d.bstyle].colors[0];o.roof=sx[d.bstyle].roof;markCustom(o);commit();renderPanel()}
 if(d.dstyle&&o&&sel.k==='districts'){o.style=d.dstyle;commit();renderPanel()}
 if(d.dselect)selectDistrict(+d.dselect);
 if(el.id==='resetExclusions'&&o&&sel.k==='districts'){o.exclusions=[];generateDistrict(o);commit();renderPanel()}
 if(el.id==='startDistrict')setTool('district');if(el.id==='startHouse')setTool('house');
 if(el.id==='regenDistrict'||el.id==='shuffleDistrict'){if(o&&sel.k==='districts'){const result=generateDistrict(o,el.id==='shuffleDistrict');commit();renderPanel();toast(`${result.created} домов построено · ${result.protected} сохранено`)}}
 if(el.id==='detachDistrict'&&o&&sel.k==='districts'){state.buildings.filter(b=>b.districtId===o.id).forEach(b=>{delete b.districtId;delete b.custom});state.districts=state.districts.filter(q=>q.id!==o.id);sel=null;commit();renderPanel();toast('Дома теперь редактируются независимо')}
 if(el.id==='deleteDistrict'&&o&&sel.k==='districts'){const id=o.id;const removed=new Set(state.buildings.filter(b=>b.districtId===id&&!b.custom).map(b=>b.id));state.buildings=state.buildings.filter(b=>!removed.has(b.id));state.buildings.forEach(b=>{if(b.districtId===id){delete b.districtId;delete b.custom}});state.stamps=state.stamps.filter(st=>!removed.has(st.buildingId));state.partitions=state.partitions.filter(st=>!removed.has(st.buildingId));state.districts=state.districts.filter(q=>q.id!==id);sel=null;invalidate(false,{S:1});commit();renderPanel();toast('Квартал удалён. Ручные дома сохранены')}
 if(el.id==='unprotect'&&o){o.custom=false;commit();renderPanel()}
 if(el.id==='enterBuilding')$('roofBtn').click();
 if(el.id==='forceInterior'){state.roofMode='interior';commit();renderPanel()}
 if(el.id==='saveProject')$('saveJson').click();if(el.id==='openProject')$('loadJson').click();
},false);

/* Binding furnishings and walls to their building / floor. */
const origAddStamp=addStamp;
addStamp=function(type,x,y,s=1,rot=0){origAddStamp(type,x,y,s,rot);const st=state.stamps[state.stamps.length-1];if(FURNITURE.includes(type)&&state.roofMode==='interior'){const b=[...state.buildings].reverse().find(q=>inPoly(x,y,q.pts));st.floor=state.level;if(b){st.buildingId=b.id;markCustom(b)}}};
const originalHit=hit;
hit=function(x,y){
 // Respect visibility of floor-bound objects during selection, without mutating the model.
 for(let i=state.partitions.length-1;i>=0;i--){const w=state.partitions[i];if(state.roofMode==='interior'&&w.level===state.level&&polyDist(x,y,w.pts)<5)return{k:'partitions',id:w.id}}
 const hidden=state.stamps.filter(st=>st.floor&&!(state.roofMode==='interior'&&st.floor===state.level));
 if(!hidden.length)return originalHit(x,y);
 const all=state.stamps;state.stamps=all.filter(st=>!hidden.includes(st));const h=originalHit(x,y);state.stamps=all;return h
};
dupSel=function(){const o=findSel(),s=sel?{...sel}:null;if(!o||s.k==='districts')return;
 const n=JSON.parse(JSON.stringify(o,replacer));n.id=nid();delete n.districtId;delete n.custom;
 if(n.pts)n.pts=n.pts.map(([x,y])=>[x+24,y+24]);else{n.x+=24;n.y+=24}if(n.v)n.v=nextSeed();state[s.k].push(n);
 if(s.k==='buildings'){for(const st of [...state.stamps].filter(st=>st.buildingId===s.id))state.stamps.push({...st,id:nid(),buildingId:n.id,x:st.x+24,y:st.y+24});for(const w of [...state.partitions].filter(w=>w.buildingId===s.id))state.partitions.push({...w,id:nid(),buildingId:n.id,pts:w.pts.map(([x,y])=>[x+24,y+24]),_sm:null})}
 sel={k:s.k,id:n.id};invalidate(false,{S:1,der:1});commit();renderPanel();toast('Копия создана')};
const originalDelete=deleteSel;
deleteSel=function(){if(sel?.k==='districts'){$('deleteDistrict')?.click();return}const s=sel?{...sel}:null;if(s?.k==='buildings'){const b=findSel();if(b?.districtId){const d=state.districts.find(d=>d.id===b.districtId);if(d)(d.exclusions||(d.exclusions=[])).push(b.pts.map(q=>[...q]))}state.stamps=state.stamps.filter(st=>st.buildingId!==s.id);state.partitions=state.partitions.filter(st=>st.buildingId!==s.id)}originalDelete()};
let sandboxDrag=null;
canvas.addEventListener('pointerdown',e=>{if(!['district','partition'].includes(tool)||e.button!==0||spaceDown)return;e.stopImmediatePropagation();canvas.setPointerCapture(e.pointerId);const p=worldPoint(e);sandboxDrag={type:tool,a:p,b:p};if(tool==='partition'&&state.roofMode!=='interior'){state.roofMode='interior';syncChrome()}},true);
canvas.addEventListener('pointermove',e=>{if(!sandboxDrag)return;e.stopImmediatePropagation();sandboxDrag.b=worldPoint(e)},true);
canvas.addEventListener('pointerup',e=>{if(!sandboxDrag)return;e.stopImmediatePropagation();const d=sandboxDrag;sandboxDrag=null;const w=Math.abs(d.b[0]-d.a[0]),h=Math.abs(d.b[1]-d.a[1]);
 if(d.type==='district'){if(w<70||h<70){toast('Выделите область не меньше 70 × 70');return}const pts=rectPts((d.a[0]+d.b[0])/2,(d.a[1]+d.b[1])/2,w,h,0);const n=state.districts.length+1,area=makeDistrict(pts,{name:`Квартал ${n}`}),result=generateDistrict(area);sel={k:'districts',id:area.id};setToolKeepSel();commit();toast(result.created?`Квартал готов: ${result.created} домов`:'Нет свободного места. Измените область или параметры.')}
 else if(Math.hypot(w,h)>6){const mid=[(d.a[0]+d.b[0])/2,(d.a[1]+d.b[1])/2],b=state.buildings.find(q=>inPoly(...mid,q.pts));const wall={id:nid(),pts:[d.a,d.b],t:4,h:3,level:state.level,...(b?{buildingId:b.id}:{})};if(b)markCustom(b);state.partitions.push(wall);commit()}
},true);
canvas.addEventListener('pointercancel',()=>{sandboxDrag=null},true);
window.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)||help.open)return;if(e.key.toLowerCase()==='k'&&!e.metaKey&&!e.ctrlKey){$('roofBtn').click();return}if(e.key==='Escape'){sandboxDrag=null;help.close()}
 if(['[',']'].includes(e.key)&&sel){const o=findSel(),a=e.key==='['?-15:15;if(sel.k==='buildings'){const[cx,cy]=centroid(o.pts);o.pts=rotPts(o.pts,a*Math.PI/180,cx,cy);o.rot=(o.rot||0)+a;markCustom(o);for(const st of state.stamps)if(st.buildingId===o.id){const p=rotPts([[st.x,st.y]],a*Math.PI/180,cx,cy)[0];st.x=p[0];st.y=p[1];st.rot=(st.rot||0)+a}for(const w of state.partitions)if(w.buildingId===o.id){w.pts=rotPts(w.pts,a*Math.PI/180,cx,cy);delete w._sm}}else if(sel.k==='stamps')o.rot=(o.rot||0)+a;invalidate(false,{S:1});commit();renderPanel()}
});

/* An authored demo showcasing the new original tools. */
function loadSandboxDemo(){
 booting=true;state={...blank(),name:'Перекрёсток Ветров',light:48};uid=1;seedV=73;
 const S=state;
 S.waterOps=[{m:'add',r:102,pts:[[160,990],[260,1100],[365,1150],[320,1260]]},{m:'add',r:70,pts:[[95,1190],[130,1290]]}];
 S.hillOps=[{m:'add',l:1,r:92,pts:[[110,230],[300,220],[460,240],[610,210]]},{m:'add',l:2,r:40,pts:[[300,180],[440,190]]},{m:'add',l:1,r:68,pts:[[1700,1060],[1890,1120]]},{m:'add',l:1,r:70,pts:[[1750,150],[1920,190]]}];
 S.groundOps=[{mat:'meadow',r:110,pts:[[100,580],[280,650]]},{mat:'field',r:38,pts:[[450,1010],[590,1070]]},{mat:'crops',r:27,pts:[[560,1160],[690,1190]]},{mat:'stone',r:52,pts:[[1280,745],[1400,745]]},{mat:'dirt',r:40,pts:[[460,810],[550,850]]}];
 S.rivers=[{id:nid(),pts:[[650,-20],[690,180],[790,320],[830,510],[880,660],[810,850],[900,1040],[1000,1170],[1100,1330]],w:36,bank:'sand'},{id:nid(),pts:[[810,850],[640,960],[420,1080],[300,1150]],w:16,bank:'grass'}];
 S.roads=[{id:nid(),pts:[[0,690],[300,680],[570,650],[870,650],[1130,630],[1380,630],[1630,650],[2010,670]],w:20,paved:true},{id:nid(),pts:[[1110,250],[1130,440],[1130,630],[1130,800],[1180,980],[1230,1310]],w:14,paved:true},{id:nid(),pts:[[1530,285],[1530,450],[1530,640],[1580,830],[1670,970]],w:12},{id:nid(),pts:[[1130,430],[1330,400],[1530,440]],w:12},{id:nid(),pts:[[1130,830],[1340,840],[1580,830]],w:12},{id:nid(),pts:[[570,650],[530,510],[500,380]],w:12},{id:nid(),pts:[[1130,1030],[1370,1050],[1580,1010]],w:12}];
 rebuildMasks();rebuildGround();
 const districts=[makeDistrict(rectPts(1320,524,520,500,0),{name:'Старый город',style:'medieval',seed:99214,density:88,plotSize:52,setback:11}),makeDistrict(rectPts(1390,1000,570,340,0),{name:'Северное подворье',style:'nordic',seed:815,density:78,plotSize:52,setback:12}),makeDistrict(rectPts(510,500,300,270,0),{name:'Соломенные дворы',style:'village',seed:4221,density:75,plotSize:49,setback:12})];
 districts.forEach(d=>generateDistrict(d));
 for(const[x,y,radius]of[[1070,295,25],[1620,300,25],[1630,365,20]])S.buildings.push({id:nid(),kind:'tower',pts:ovalPts(x,y,radius,radius),h:48,color:'#5d7c76',style:'arcane',floors:3,seed:71,rooms:'hall',lit:true});
 S.walls=[{id:nid(),pts:[[1070,295],[1160,230],[1330,210],[1500,235],[1620,300],[1630,365]],t:11,h:19}];
 S.buildings.push({id:nid(),kind:'house',pts:rectPts(1380,540,92,62,-.05),h:34,color:'#af5940',rot:-3,style:'medieval',roof:'gable',floors:2,rooms:'rooms',seed:729,plans:{},lit:true});
 addStamp('well',1290,750,1.25);addStamp('stall',1370,725,1.3);addStamp('stall',1420,725,1.25);addStamp('cart',1210,740,1.2,-7);
 for(const[x,y]of[[1080,655],[1240,645],[1440,655],[1540,635],[1140,810],[1140,440],[1340,825]])addStamp('lantern',x,y,1);
 addStamp('campfire',480,830,1.2);addStamp('tent',435,797,1.4,-15);addStamp('tent',520,795,1.3,20);addStamp('crate',440,840,1.2);addStamp('barrel',540,840,1.3);addStamp('boat',270,1110,1.3,-20);addStamp('hay',520,1060,1.25);addStamp('hay',580,1080,1.1);
 const r=rng(71);for(const[x,y,R,n,au]of[[1830,430,160,135],[160,460,130,90],[700,1120,100,55],[1870,860,140,90],[1740,1210,120,70,1],[1050,95,120,70],[200,820,85,40],[80,80,60,20],[1000,950,60,15]])scatter(x,y,R,15,n,r,!!au);
 for(const[x,y,z]of[[90,320,1.5],[640,340,1],[1810,1000,1.4],[1880,1030,1],[430,190,1.2]])addStamp('rock',x,y,z);
 S.labels=[{id:nid(),x:1330,y:130,text:'Перекрёсток Ветров',size:39},{id:nid(),x:340,y:105,text:'Туманные холмы',size:28},{id:nid(),x:480,y:910,text:'Лагерь следопытов',size:22},{id:nid(),x:230,y:1210,text:'Тихая заводь',size:23},{id:nid(),x:1460,y:1200,text:'Северное подворье',size:25}];
 sel=null;invalidate(true);booting=false;renderPanel();updNight();syncChrome()
}
loadDemo=loadSandboxDemo;

/* Accurate transforms for linked hand-placed contents. */
function rotateLinked(b,a){if(!a)return;const[cx,cy]=centroid(b.pts);for(const st of state.stamps)if(st.buildingId===b.id){const p=rotPts([[st.x,st.y]],a,cx,cy)[0];st.x=p[0];st.y=p[1];st.rot=(st.rot||0)+a*180/Math.PI}for(const w of state.partitions)if(w.buildingId===b.id){w.pts=rotPts(w.pts,a,cx,cy);delete w._sm}}
const roadV1=drawRoad;
drawRoad=function(c,r){if(!r.paved){roadV1(c,r);return}c.save();c.lineCap=c.lineJoin='round';tracePath(c,sm(r));c.strokeStyle='#716958';c.lineWidth=r.w+5;c.stroke();c.strokeStyle='#c7bfa9';c.lineWidth=r.w+2;c.stroke();c.strokeStyle=MATS.stone.p;c.lineWidth=r.w;c.stroke();c.strokeStyle='rgba(238,222,190,.15)';c.lineWidth=r.w*.55;c.stroke();c.restore()};

/* Original small scene kits. Each component is an editable map object. */
const KITS={tavern:{name:'Таверна',desc:'Двухэтажный зал, мебель, фонари',w:110,d:78},shrine:{name:'Святилище',desc:'Зал с алтарём и колоннами',w:86,d:104},farm:{name:'Подворье',desc:'Дом, сарай, грядки и телега',w:155,d:120},camp:{name:'Лагерь',desc:'Палатки, костёр и припасы',w:140,d:110}};
opts.prefab='tavern';
TOOLS.splice(TOOLS.findIndex(t=>t.id==='house'),0,{id:'prefab',k:'m',n:'Готовые локации',i:I('<path d="M3 9l5-5 5 5v7H3zM12 7l3-3 3 3v9h-3"/><path d="M7 16v-4h3v4"/>'),h:'Выбери заготовку и нажми на карту. Все здания и предметы можно редактировать отдельно.'});
function placeKit(type,x,y){const k=KITS[type];if(!k)return;const S=sx[opts.style]||sx.medieval;let main=null;
 const house=(dx,dy,w,d,extra={})=>{const b={id:nid(),kind:'house',pts:rectPts(x+dx,y+dy,w,d,0),h:26,color:S.colors[0],...buildingDefaults(),...extra};state.buildings.push(b);return b};
 const prop=(type,dx,dy,s=1,rot=0,inside=false)=>{addStamp(type,x+dx,y+dy,s,rot);const st=state.stamps[state.stamps.length-1];if(inside&&main){st.floor=1;st.buildingId=main.id}};
 if(type==='tavern'){main=house(0,0,100,70,{floors:2,rooms:'hall',furnished:false,h:32});for(const[dx,dy]of[[-25,-15],[23,-15],[-25,18],[23,18]])prop('table',dx,dy,.8,0,true);prop('stairs',-39,0,.65,0,true);prop('shelf',0,-28,1.5,0,true);prop('barrel',40,48,1.2);prop('lantern',-53,36);prop('lantern',53,36)}
 if(type==='shrine'){main=house(0,0,72,96,{floors:1,rooms:'hall',furnished:false,h:40,color:'#637d78'});prop('altar',0,-30,1.5,0,true);for(const dx of[-24,24])for(const dy of[-14,17])prop('pillar',dx,dy,.75,0,true);prop('rug',0,20,1.3,90,true);prop('lantern',-30,53);prop('lantern',30,53)}
 if(type==='farm'){main=house(-30,-20,59,44,{floors:1,h:20,roof:'gable'});house(45,-16,42,57,{floors:1,h:17,roof:'gable',rooms:'hall'});state.groundOps.push({mat:'crops',r:19,pts:[[x-50,y+45],[x+10,y+45]]});prop('hay',50,44,1.4);prop('cart',22,26,1.1);prop('well',-72,10);invalidate(false,{ground:1,A:1})}
 if(type==='camp'){state.groundOps.push({mat:'dirt',r:44,pts:[[x-20,y],[x+20,y]]});prop('campfire',0,0,1.3);prop('tent',-43,-30,1.5,-20);prop('tent',40,-25,1.4,20);prop('tent',0,43,1.3,0);prop('crate',48,22);prop('barrel',55,34);prop('cart',-55,20,1.1,90);invalidate(false,{ground:1,A:1})}
 state.trees=state.trees.filter(t=>dist(t.x,t.y,x,y)>Math.max(k.w,k.d)*.6);invalidate(false,{S:1});commit();if(main){sel={k:'buildings',id:main.id};setToolKeepSel()}toast('Локация добавлена. Каждый компонент редактируется.')
}
const panelWithKits=renderPanel;
renderPanel=function(){panelWithKits();if(tool==='prefab'&&!sel){$('panel').querySelector('section').innerHTML=`<p class="ptitle">Начни с места</p><p class="pdesc">Нажми на карту, чтобы поставить заготовку. Дальше меняй её как угодно.</p><div class="field">${Object.entries(KITS).map(([id,k])=>`<button class="districtrow${opts.prefab===id?' on':''}" data-kit="${id}" style="border:1px solid ${opts.prefab===id?'var(--accent)':'var(--border)'};margin:8px 0;min-height:70px;background:${opts.prefab===id?'var(--accent-soft)':'var(--panel)'}"><span><b>${k.name}</b><br><span class="muted">${k.desc}</span></span></button>`).join('')}</div>${styleCards(opts.style,'ostyle')}<p class="smallnote">Таверна и святилище содержат мебель на первом этаже. Нажми «Интерьер», чтобы её увидеть.</p>`}};
$('panel').addEventListener('click',e=>{const b=e.target.closest('[data-kit]');if(b){opts.prefab=b.dataset.kit;renderPanel()}});
canvas.addEventListener('pointerdown',e=>{if(tool!=='prefab'||spaceDown||e.button!==0)return;e.stopImmediatePropagation();const[x,y]=worldPoint(e);const k=KITS[opts.prefab];if(x-k.w/2<0||y-k.d/2<0||x+k.w/2>W||y+k.d/2>H){toast('Выбери место внутри карты');return}const pts=rectPts(x,y,k.w,k.d,0);if(state.buildings.some(b=>boxesMeet(bounds(pts),bounds(b.pts))&&polysMeet(pts,b.pts,4))||pts.some(p=>isWater(...p))){toast('Недостаточно свободного места для заготовки');return}placeKit(opts.prefab,x,y)},true);

/* VTT export: current floor, exterior doors and manually drawn partitions. */
function innerSegments(b){if(state.roofMode!=='interior'||state.level>(b.floors||1)||b.kind!=='house'||b.pts.length!==4)return[];const{cx,cy,a,w,d}=localBox(b),plan=floorPlan(b);let lines=[];if(plan==='split')lines=[[[w*.12,-d/2],[w*.12,-2]],[[w*.12,6],[w*.12,d/2]]];if(plan==='rooms')lines=[[[-w*.12,-d/2],[-w*.12,-2]],[[-w*.12,6],[-w*.12,d/2]],[[-w*.12,0],[w*.15,0]],[[w*.33,0],[w/2,0]]];return lines.map(p=>p.map(([x,y])=>[cx+x*Math.cos(a)-y*Math.sin(a),cy+x*Math.sin(a)+y*Math.cos(a)]))}
function vttData(){const g=gridPixels(),pt=([x,y])=>({x:+(x/g).toFixed(3),y:+(y/g).toFixed(3)}),los=[],portals=[];
 for(const b of state.buildings){if(state.roofMode==='interior'&&state.level>(b.floors||1))continue;const p=b.pts;if(b.kind==='house'&&p.length===4){const d=buildingDoor(b);los.push([p[3],p[0],p[1],p[2],d.a].map(pt),[d.b,p[3]].map(pt));portals.push({position:pt([d.cx,d.cy]),bounds:[pt(d.a),pt(d.b)],rotation:Math.atan2(d.b[1]-d.a[1],d.b[0]-d.a[0]),closed:!b.doorOpen,freestanding:false})}else los.push(p.concat([p[0]]).map(pt));for(const line of innerSegments(b))los.push(line.map(pt))}
 for(const w of state.walls)los.push(rdp(sm(w),1.5).map(pt));if(state.roofMode==='interior')for(const w of state.partitions)if(w.level===state.level)los.push(w.pts.map(pt));
 const lights=[];for(const st of state.stamps){const d=STAMPS[st.type];if(d?.light&&(!st.floor||(state.roofMode==='interior'&&st.floor===state.level)))lights.push({position:pt([st.x,st.y]),range:+(d.light[0]*st.s/g).toFixed(2),intensity:1,color:'ff'+d.light[1].split(',').map(v=>(+v).toString(16).padStart(2,'0')).join(''),shadows:true})}
 return{format:.3,resolution:{map_origin:{x:0,y:0},map_size:{x:W/g,y:H/g},pixels_per_grid:g},line_of_sight:los,objects_line_of_sight:[],portals,environment:{baked_lighting:state.night>0,ambient_light:state.night>0?'ff1a2550':'ffffffff'},lights,image:renderTo(1).toDataURL('image/png').split(',')[1]}
}
exportVtt=function(){const data=vttData();download('karta.dd2vtt',new Blob([JSON.stringify(data)],{type:'application/json'}));toast(`VTT: ${data.line_of_sight.length} стен · ${data.portals.length} дверей`)};
function resizeLinked(b,sx,sy){const{cx,cy,a}=localBox(b),co=Math.cos(a),si=Math.sin(a);const convert=([x,y])=>{const dx=x-cx,dy=y-cy,lx=(dx*co+dy*si)*sx,ly=(-dx*si+dy*co)*sy;return[cx+lx*co-ly*si,cy+lx*si+ly*co]};for(const st of state.stamps)if(st.buildingId===b.id){const q=convert([st.x,st.y]);st.x=q[0];st.y=q[1]}for(const w of state.partitions)if(w.buildingId===b.id){w.pts=w.pts.map(convert);delete w._sm}}
$('panel').addEventListener('click',e=>{const b=e.target.closest('button');if(b?.dataset.scol&&sel?.k==='buildings')markCustom(findSel())},true);
$('panel').addEventListener('change',e=>{if(sel?.k==='buildings'&&['sel-chim','sel-lit'].includes(e.target.id))markCustom(findSel())},true);

function reserveErasedBuilding(id){const b=state.buildings.find(b=>b.id===id);if(!b)return;const d=state.districts.find(d=>d.id===b.districtId);if(d)(d.exclusions||(d.exclusions=[])).push(b.pts.map(q=>[...q]));state.stamps=state.stamps.filter(st=>st.buildingId!==id);state.partitions=state.partitions.filter(w=>w.buildingId!==id)}

function gridPixels(){return state.gridSize||GRID}
const panelWithScale=renderPanel;renderPanel=function(){panelWithScale();const label=$('g-grid')?.closest('label');if(label)label.insertAdjacentHTML('afterend',`<div class="field" style="margin-top:8px"><label for="g-gridSize">Размер клетки · 5 футов</label><select id="g-gridSize">${[10,20,25,50].map(n=>`<option value="${n}"${gridPixels()===n?' selected':''}>${n} px · ширина карты ${W/n*5} футов</option>`).join('')}</select></div>`)};
$('panel').addEventListener('change',e=>{if(e.target.id==='g-gridSize'){state.gridSize=+e.target.value;commit();renderPanel()}});
