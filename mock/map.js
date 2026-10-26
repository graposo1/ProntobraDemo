/* ===== Visit routes — plan the days of site visits =====
   Goal: empty the list of jobs waiting for a site visit. Suggest (or pick on the map) a few jobs close to each other for one day,
   save it as a route, confirm each visit with the client, mark visits done, then clear finished routes.
   No HQ: a route goes from the first stop to the last. Maps: OpenStreetMap tiles via Leaflet (vendored); road lines from the public OSRM demo server when reachable. */
const CL_COLORS=['#E8590C','#175CD3','#079455','#6941C6','#C11574','#B54708','#0E9384','#475467'];
function hav(a,b){const t=x=>x*Math.PI/180;const dLa=t(b.lat-a.lat),dLo=t(b.lng-a.lng);const h=Math.sin(dLa/2)**2+Math.cos(t(a.lat))*Math.cos(t(b.lat))*Math.sin(dLo/2)**2;return 12742*Math.asin(Math.sqrt(h));}
const road=(a,b)=>hav(a,b)*1.3;
const VISIT_MIN=45,SPEED=40;
const hasLoc=q=>q.lat!=null&&q.lng!=null;
/* Which jobs can be chosen: jobs not closed — Open, Confirmada (locked) and In progress — with a location and not already on a route.
   Never finished, aborted or archived. Simple filter on the map to switch each kind off/on. */
const mapKind=q=>q.status==='open'?'open':['ongoing','overdue'].includes(stage(q))?'ongoing':'scheduled';
const MAP_KINDS_L={open:['Open','Abertas'],scheduled:['Locked','Confirmadas'],ongoing:['In progress','Em andamento']};
const visitPool=(all)=>visibleQuotes().filter(q=>visitable(q)&&!q.visit.date&&(all||state.map.kinds[mapKind(q)]));
/* while editing a saved route, its own jobs are also available */
const planPool=()=>{const e=state.map.edit;return e?[...visitPool(),...visibleQuotes().filter(q=>q.visit.route===e&&visitable(q))]:visitPool();};
const waitDays=q=>daysSince((q.log&&q.log[0]&&q.log[0][0])||q.since);
/* priority of a visit: urgent, alerts, how long it has been waiting */
const prio=q=>(q.urgent?5:0)+({red:4,amber:2}[level(alertsFor(q))]||0)+Math.min(6,waitDays(q)*.3);
/* best order for a list of jobs: try each one as the first stop, then always the nearest next */
function tour(qs){if(qs.length<2)return {order:qs.slice(),legs:qs.map(()=>0),km:0};let best=null;
 qs.forEach(s=>{let cur=s,left=qs.filter(x=>x!==s),order=[s],legs=[0],km=0;
  while(left.length){left.sort((a,b)=>road(cur,a)-road(cur,b));const n=left.shift(),k=road(cur,n);km+=k;order.push(n);legs.push(k);cur=n;}
  if(!best||km<best.km)best={order,legs,km};});return best;}
/* legs and totals for a list in the given order */
function legsOf(qs){const legs=qs.map((q,i)=>i?road(qs[i-1],q):0);return {order:qs,legs,km:sum(legs,x=>x)};}
const hm=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(Math.round(m%60)).padStart(2,'0');
const toMin=s=>{const [h,m]=(s||'09:30').split(':').map(Number);return h*60+(m||0);};
const dayHours=r=>(r.km/SPEED*60+r.order.length*VISIT_MIN)/60;
/* Suggestions: greedy — take the job with the best mix of priority and neighbours, add its nearest jobs up to "per", repeat on what is left.
   Together the suggestions cover the whole list, so planning them all empties it. */
function suggestRoutes(pool,per){let left=pool.filter(hasLoc);const out=[];
 while(left.length){let best=null;
  left.forEach(s=>{const g=[s,...left.filter(x=>x!==s).sort((a,b)=>road(s,a)-road(s,b)).slice(0,per-1)].filter(x=>x===s||road(s,x)<=40);
   const t=tour(g),sc=sum(g,prio)*3+g.length*8-t.km/3;if(!best||sc>best.sc)best={g,t,sc};});
  out.push(best.t);left=left.filter(x=>!best.g.includes(x));}
 return out;}
const routeWhy=r=>{const u=r.order.filter(q=>q.urgent).length,red=r.order.filter(q=>level(alertsFor(q))==='red').length,old=Math.max(...r.order.map(waitDays));
 return [u?`${u} urgent`:'',red?`${red} overdue`:'',old>=7?`oldest waiting ${old} days`:'',r.order.length>1?`${(r.km/(r.order.length-1)).toFixed(0)} km between stops`:''].filter(Boolean);};
const townsOf=qs=>[...new Set(qs.map(q=>qTown(q)).filter(Boolean))].join(', ')||'—';
/* saved routes: {id, date, stops:[{q, confirm:'pending'|'confirmed', slot:'am'|'pm'|null}], createdAt, by} — a stop counts only while the job still points to this route.
   A route belongs to a day; there are no clock times. The order of the stops is the order of the visits.
   When the client confirms, the time is optional: morning, afternoon or no set time (slot null).
   The route counts as confirmed when every visit still to do is confirmed — no separate button. */
const ROUTES_=()=>DB.routes||(DB.routes=[]);
const RT=id=>ROUTES_().find(r=>r.id===id);
const SLOT_L={am:'Morning',pm:'Afternoon'};
const kmL=k=>k<1?'< 1 km':k.toFixed(0)+' km';
const hrsL=h=>'~'+h.toLocaleString(LOC(),{maximumFractionDigits:1})+' h';
/* an afternoon visit placed before a morning one */
const slotOutOfOrder=st=>{let pm=false;return st.some(s=>{if(s.done)return false;if(s.slot==='pm')pm=true;return s.slot==='am'&&pm;});};
/* put mornings before afternoons; stops with no set time keep their place */
function sortBySlot(r){const st=liveStops(r),idx=[],sl=[];st.forEach((s,i)=>{if(s.slot&&!s.done){idx.push(i);sl.push(s);}});
 sl.sort((a,b)=>(a.slot==='pm')-(b.slot==='pm'));idx.forEach((i,k)=>st[i]=sl[k]);r.stops=[...st,...r.stops.filter(s=>!st.includes(s))];}
const routeConfirmed=r=>{const st=liveStops(r).filter(s=>!s.done);return st.length>0&&st.every(s=>s.confirm==='confirmed');};
const liveStops=r=>r.stops.filter(s=>{const q=QR(s.q);return q&&(s.done||q.visit.route===r.id&&q.visit.date===r.date);});
const routeDone=r=>{const st=liveStops(r);return !st.length||st.every(s=>s.done);};
const dayLabel=d=>d===TODAY_ISO?'Today':d===addDays(TODAY_ISO,1)?'Tomorrow':fmtDow(d);
const fmtDow=d=>{const x=D(d);return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][x.getDay()]+' '+fmtDate(d);};
let MAPDATA=null;
const PIN={pool:'#175CD3',need:'#E8590C',draft:'#1D2939',pending:'#667085',confirmed:'#079455',done:'#1D2939'};
function vMap(){const m=state.map;if(!m.mode)m.mode='plan';
 const pool=planPool(),poolL=pool.filter(hasLoc),noLoc=pool.length-poolL.length;
 const routes=ROUTES_().filter(r=>liveStops(r).length||r.date>=TODAY_ISO);
 const open=routes.filter(r=>!routeDone(r)).sort((a,b)=>a.date.localeCompare(b.date)),done=routes.filter(routeDone);
 const tabs=`<div class="seg rtabs">${[['plan',`Plan visits <span class="cnt">${pool.length}</span>`],['routes',`Routes <span class="cnt">${open.length}</span>`]].map(([k,l])=>`<button class="${m.mode===k?'on':''}" data-act="mapMode" data-v="${k}">${l}</button>`).join('')}</div>`;
 let side='',pins=[],line=null;
 if(m.mode==='routes'&&m.rid&&RT(m.rid)){const r=RT(m.rid),st=liveStops(r),qs=st.map(s=>QR(s.q)),lg=legsOf(qs);
  pins=st.map((s,i)=>({q:QR(s.q),n:i+1,c:s.done?PIN.done:s.confirm==='confirmed'?PIN.confirmed:PIN.pending}));line=qs;
  side=routeDetail(r,st,lg);}
 else if(m.mode==='routes'){m.rid=null;side=routesList(open,done);
  open.forEach((r,ri)=>liveStops(r).forEach((s,i)=>pins.push({q:QR(s.q),n:i+1,c:CL_COLORS[ri%CL_COLORS.length]})));}
 else{m.sel=m.sel.filter(id=>poolL.some(q=>q.id===id));const sel=m.sel.map(QR),lg=legsOf(sel),sch=lg.order.map((q,i)=>({q,leg:lg.legs[i]}));
  pins=poolL.map(q=>{const i=m.sel.indexOf(q.id);return {q,n:i>=0?i+1:'',c:i>=0?PIN.draft:PIN.pool,pick:true};});line=sel.length>1?sel:null;
  side=planPanel(pool,poolL,noLoc,sel,lg,sch);}
 MAPDATA={pins,line};
 const bar=m.mode==='plan'&&m.sel.length?(()=>{const lg=legsOf(m.sel.map(QR));return `<div class="qbar-space"></div><div class="qbar rbar"><div class="grow small"><b>${m.sel.length} visit${m.sel.length>1?'s':''} · ${dayLabel(m.date)}</b><div class="tiny faint">${kmL(lg.km)} · ${hrsL(dayHours(lg))}</div></div><button class="btn" data-act="clearSel" aria-label="Clear">${ic('x',16)}</button><button class="btn pri" data-act="savePlan">${ic('check',16)} Save route</button></div>`;})():'';
 return `<div class="page-head"><div class="grow"><h1>Routes</h1><div class="muted small" style="margin-top:4px">Group the site visits into days, save the route and confirm with each client.</div></div></div>
 ${tabs}
 <div class="map-grid"><div class="mapcol"><div class="mapwrap"><div id="osmslot" class="osmslot"></div></div>
  <div class="maplegend2">${m.mode==='routes'&&!m.rid?'<span>One colour per route · numbers = order of the stops</span>':m.mode==='plan'?`<span><i style="background:${PIN.pool}"></i>Jobs to choose</span><span><i style="background:${PIN.draft}"></i>In this plan</span><span><i class="lg-cl">3</i>Several jobs close together — tap to see them</span>`:`<span><i style="background:${PIN.pending}"></i>To confirm</span><span><i style="background:${PIN.confirmed}"></i>Confirmed</span><span><i style="background:${PIN.done}"></i>Visited</span>`}</div></div>
  <div class="map-side stack">${side}</div></div>${bar}`;}
function planPanel(pool,poolL,noLoc,sel,lg,sch){const m=state.map,days=[...Array(10)].map((_,i)=>addDays(TODAY_ISO,i+1));
 const sug=m.sug;
 return `<div class="card"><div class="row between wrap" style="gap:8px"><h3>Jobs on the map</h3><span class="pill p-blue nodot">${poolL.length} on the map</span></div>
   <div class="kchips">${Object.keys(MAP_KINDS_L).map(k=>{const n=visitPool(true).filter(q=>mapKind(q)===k&&hasLoc(q)).length;return `<button class="kchip ${m.kinds[k]?'on':''}" data-act="mapKind" data-v="${k}" aria-pressed="${!!m.kinds[k]}">${m.kinds[k]?ic('check',13):''}<span>${MAP_KINDS_L[k][isPT()?1:0]}</span><span class="faint">${n}</span></button>`;}).join('')}</div>
   ${noLoc?`<div class="tiny faint" style="margin-top:4px">${noLoc} without a location — add the address on the job to plan it.</div>`:''}
   <div class="flabel" style="margin-top:12px">Day</div><div class="daychips">${days.map(d=>`<button class="daychip ${m.date===d?'on':''}" data-act="mapDay" data-v="${d}"><span>${fmtDow(d).split(' ')[0]}</span><b>${D(d).getDate()}</b></button>`).join('')}<label class="daychip pickday" title="Other date">${ic('cal',16)}<input type="date" value="${m.date}" data-chg="mdate"></label></div>
   <div class="row wrap" style="gap:12px;margin-top:12px"><div><div class="flabel">Visits per day</div><div class="seg">${[2,3,4,5].map(n=>`<button class="${m.per===n?'on':''}" data-act="mapPer" data-v="${n}">${n}</button>`).join('')}</div></div></div>
   <button class="btn pri" style="width:100%;margin-top:14px;min-height:46px" data-act="suggest" ${poolL.length?'':'disabled'}>${ic('route',16)} Suggest routes</button>
   <div class="tiny faint" style="margin-top:6px">Or tap the pins on the map to choose the jobs yourself.</div></div>
  ${sug?`<div class="card sugcard"><div class="row between"><h3>Suggestions · ${sug.length}</h3><button class="btn sm ghost" data-act="sugClose">${ic('x',14)}</button></div>
    <div class="small muted" style="margin:2px 0 6px">${sug.length>1?`These ${sug.length} routes cover every job on the map. Use one for ${dayLabel(m.date)}; plan the next ones on other days.`:'One route covers every job on the map.'}</div>
    <div class="suglist">${sug.map((r,i)=>{const ids=r.order.map(q=>q.id).join(',');return `<div class="sug"><div class="row between" style="gap:8px"><b>${esc(townsOf(r.order))}</b><span class="small faint">${r.order.length} · ${kmL(r.km)} · ${hrsL(dayHours(r))}</span></div>
     <div class="small muted">${r.order.map(q=>esc(qCust(q))+(qTown(q)?' ('+esc(qTown(q))+')':'')).join(' → ')}</div>
     <div class="tagline">${routeWhy(r).map(t=>`<span class="pill p-grey nodot">${esc(t)}</span>`).join('')}</div>
     <button class="btn sm ${state.map.sel.join(',')===ids?'pri':''}" style="margin-top:8px" data-act="useSug" data-ids="${ids}">${state.map.sel.join(',')===ids?'✓ In the plan':'Use for '+dayLabel(m.date)}</button></div>`;}).join('')}</div></div>`:''}
  ${sel.length?`<div class="card" id="draft"><div class="row between"><h3>${dayLabel(m.date)} · ${sel.length} visit${sel.length>1?'s':''}</h3>${sel.length>2?`<button class="btn sm" data-act="optOrder">${ic('route',14)} Best order</button>`:''}</div>
    ${sch.map((x,i)=>`<div class="stop"><span class="no" style="background:${PIN.draft}">${i+1}</span><div class="grow"><b>${esc(qCust(x.q))}</b><div class="small muted">${esc(qPlace(x.q))} · ${x.q.id}</div>${i?`<div class="tiny faint">${kmL(x.leg)} from the previous stop</div>`:''}</div>
     <span class="stopbtns">${i?`<button class="iconbtn" data-act="mvStop" data-i="${i}" data-d="-1" aria-label="Move up"><span class="r180">${ic('chev',15)}</span></button>`:''}<button class="iconbtn" data-act="pick" data-id="${x.q.id}" aria-label="Remove">${ic('x',15)}</button></span></div>`).join('')}
    <div class="rstats"><div><span>Distance</span><b>${kmL(lg.km)}</b></div><div><span>Day</span><b class="${dayHours(lg)>8?'red':''}">${hrsL(dayHours(lg))}</b></div></div>
    ${dayHours(lg)>8?`<div class="banner amber" style="margin-top:10px;font-size:13px">${ic('alert',16)}<div>More than 8 hours — consider fewer visits for this day.</div></div>`:''}
    <div class="tiny faint" style="margin-top:8px">The order is the order of the visits. Estimate: ${VISIT_MIN} min per visit, ${SPEED} km/h.</div>
    <button class="btn pri only-d" style="width:100%;margin-top:12px" data-act="savePlan">${ic('check',16)} Save route · ${dayLabel(m.date)}</button></div>`:''}`;}
function routesList(open,done){const m=state.map;
 const card=r=>{const st=liveStops(r),cf=st.filter(s=>s.confirm==='confirmed').length,dn=st.filter(s=>s.done).length,lg=legsOf(st.map(s=>QR(s.q))),past=r.date<TODAY_ISO;
  return `<button class="rcard" data-act="openRoute" data-id="${r.id}"><div class="rdate ${r.date===TODAY_ISO?'today':past?'past':''}"><span>${fmtDow(r.date).split(' ')[0]}</span><b>${D(r.date).getDate()}</b></div>
   <div class="grow" style="min-width:0"><b>${esc(townsOf(st.map(s=>QR(s.q))))}</b><div class="small muted">${st.length} visit${st.length>1?'s':''} · ${kmL(lg.km)}</div>
   <div class="tagline">${routeConfirmed(r)?'<span class="pill p-green nodot">Route confirmed</span>':`<span class="pill p-amber nodot">${st.filter(s=>!s.done&&s.confirm!=='confirmed').length} to confirm</span>`}${dn?`<span class="pill p-grey nodot">${dn}/${st.length} visited</span>`:''}${past?'<span class="pill p-red nodot">Visits not marked done</span>':''}</div></div><span class="r270">${ic('chev',16)}</span></button>`;};
 return `<div class="card"><h3>Planned routes</h3>${open.length?open.map(card).join(''):`<div class="small muted" style="margin-top:8px">No routes planned.</div><button class="btn pri sm" style="margin-top:10px" data-act="mapMode" data-v="plan">Plan visits</button>`}</div>
  ${done.length?`<div class="card"><div class="row between"><h3>Finished · ${done.length}</h3><button class="btn sm" data-act="clearDone">${ic('trash',14)} Clear finished</button></div><div class="small muted" style="margin:4px 0 6px">Every visit done. Clearing removes the routes; the visits stay recorded on each job.</div>${done.map(r=>`<div class="sum-row"><span>${fmtDow(r.date)}</span><span class="small muted">${liveStops(r).length} visits</span></div>`).join('')}</div>`:''}`;}
function routeDetail(r,st,lg){
 const gm='https://www.google.com/maps/dir/?api=1&travelmode=driving&destination='+(()=>{const l=lg.order[lg.order.length-1];return l?l.lat.toFixed(5)+','+l.lng.toFixed(5):'';})()+(lg.order.length>1?'&waypoints='+encodeURIComponent(lg.order.slice(0,-1).map(q=>q.lat.toFixed(5)+','+q.lng.toFixed(5)).join('|')):'');
 const todo=st.filter(s=>!s.done),cf=todo.filter(s=>s.confirm==='confirmed').length,ask=state.map.ask;
 /* "Client confirmed" asks when: morning, afternoon or no set time */
 const when=s=>`<div class="slotask"><span class="small muted">When?</span>${[['am','Morning'],['pm','Afternoon'],['','No set time']].map(([v,l])=>`<button class="btn sm ${s.confirm==='confirmed'&&(s.slot||'')===v?'pri':''}" data-act="stopSlot" data-r="${r.id}" data-q="${s.q}" data-v="${v}">${l}</button>`).join('')}${s.confirm==='confirmed'?`<button class="btn sm ghost" data-act="stopSlot" data-r="${r.id}" data-q="${s.q}" data-v="__no">Not confirmed</button>`:''}<button class="iconbtn" data-act="stopAsk" data-q="" aria-label="Cancel">${ic('x',15)}</button></div>`;
 return `<div class="card">${backBtn('openRoute','data-id=""','Routes')}
  <div class="row between wrap" style="gap:8px;margin-top:10px"><div><h2 style="margin:0">${dayLabel(r.date)}${r.date===TODAY_ISO||r.date===addDays(TODAY_ISO,1)?' · '+fmtDate(r.date):''}</h2><div class="small muted">${st.length} visit${st.length>1?'s':''} · ${kmL(lg.km)} · ${hrsL(dayHours(lg))}</div></div>
   ${todo.length?(routeConfirmed(r)?`<span class="pill p-green nodot">${ic('check',12)} Route confirmed</span>`:`<span class="pill p-amber nodot">${cf}/${todo.length} confirmed</span>`):''}</div>
  <div class="ractions"><a class="btn pri" href="${gm}" target="_blank" rel="noopener">${ic('route',16)} Navigate</a><button class="btn" data-act="routeICS" data-id="${r.id}">${ic('cal',16)} Calendar</button><button class="btn" data-act="editRoute" data-id="${r.id}">${ic('edit',16)} Edit</button><button class="btn ghost danger" data-act="delRoute" data-id="${r.id}">${ic('trash',16)}</button></div>
  ${slotOutOfOrder(st)?`<div class="banner amber" style="margin:8px 0 4px;font-size:13px">${ic('alert',16)}<div class="grow">An afternoon visit comes before a morning one.</div><button class="btn sm" data-act="sortSlots" data-r="${r.id}">Morning first</button></div>`:''}
  ${st.map((s,i)=>{const q=QR(s.q),ct=contactOf(q),dn=!!s.done,ok=s.confirm==='confirmed';
   return `<div class="rstop ${dn?'done':''}"><span class="no" style="background:${dn?PIN.done:ok?PIN.confirmed:PIN.pending}">${dn?ic('check',13):i+1}</span><div class="grow" style="min-width:0">
    <div class="row between" style="gap:6px"><b>${esc(qCust(q))}</b>${!dn&&ok?`<button class="slotpill ${s.slot?'':'none'}" data-act="stopAsk" data-q="${q.id}" title="Change">${s.slot?SLOT_L[s.slot]:'No set time'}</button>`:''}${!dn&&i&&!st[i-1].done?`<button class="iconbtn" data-act="rMv" data-r="${r.id}" data-q="${q.id}" aria-label="Move up"><span class="r180">${ic('chev',15)}</span></button>`:''}</div>${qtOf(q.qtype)?`<div class="small qtype">${esc(qtOf(q.qtype).name)}</div>`:''}<div class="small muted">${esc(qAddr(q)||qTown(q))}</div>
    <button class="link small" data-act="open" data-id="${q.id}">${esc(q.id)}</button>
    ${!dn&&ask===q.id?when(s):`<div class="stopacts">${ct&&ct.phone?`<a class="btn sm" href="tel:${esc(ct.phone)}">${ic('phone',14)} ${esc(ct.name.split(' ')[0])}</a>`:''}
     ${dn?`<span class="pill p-green nodot">Visited</span>`:ok?`<span class="pill p-green nodot">${ic('check',12)} Client confirmed</span><button class="btn sm pri" data-act="stopDone" data-r="${r.id}" data-q="${q.id}">${ic('check',14)} Visit done</button>`
      :`<button class="btn sm" data-act="stopAsk" data-q="${q.id}">${ic('check',14)} Client confirmed</button><button class="btn sm" data-act="stopNo" data-r="${r.id}" data-q="${q.id}">Can’t that day</button>`}</div>`}</div></div>`;}).join('')}
  <div class="tiny faint" style="margin-top:10px">The order is the order of the visits. The time is optional: morning, afternoon or none.</div>
  <div class="tiny faint" style="margin-top:4px">“Can’t that day” takes the job off this route and puts it back in the visits to plan.</div></div>`;}

/* ---- OpenStreetMap layer: one persistent Leaflet map, re-attached after each render() ---- */
const OSM={map:null,el:null,layer:null,tiles:null,key:null,route:null,cache:{}};
function mapMount(){
 const slot=document.getElementById('osmslot');if(!slot||!MAPDATA)return;
 if(typeof L==='undefined'){slot.innerHTML='<div class="empty" style="padding:60px 20px">The map library could not be loaded.</div>';return;}
 if(!OSM.el){OSM.el=document.createElement('div');OSM.el.className='osm';
  OSM.map=L.map(OSM.el,{zoomControl:true,scrollWheelZoom:false,attributionControl:true,tap:true}).setView([38.72,-9.14],10);
  /* openstreetmap.org's own tile server needs a Referer, which pages opened straight from disk (file://) don't send — so from disk we use OSM France's server (same OpenStreetMap data); over http(s) we use the official one. */
  const OSMATTR='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors';
  const fromFile=location.protocol==='file:';
  /* Tiles with LOCAL names (Lisboa, not Lisbonne). The OSM France "osmfr" style labels places in French, so it is not used.
     From disk (file://) the official OSM server refuses requests (no Referer): use the Humanitarian style (OSM data, local names)
     and CARTO Voyager as fallback. Over http(s): official OSM first. In production pick a tile provider with a proper licence. */
  const HOT=['https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',{subdomains:'abc',maxZoom:19,attribution:OSMATTR+' · style Humanitarian (HOT)'}];
  const CARTO=['https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',{subdomains:'abcd',maxZoom:19,attribution:OSMATTR+' · &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>'}];
  const prov=fromFile?[HOT,CARTO]:[['https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:OSMATTR}],HOT,CARTO];
  let pi=0,bad=0;const useTiles=()=>{if(OSM.tiles)OSM.map.removeLayer(OSM.tiles);bad=0;OSM.tiles=L.tileLayer(prov[pi][0],prov[pi][1]).addTo(OSM.map);
   OSM.tiles.on('tileload',()=>{bad=0;});OSM.tiles.on('tileerror',()=>{if(++bad>=4&&pi<prov.length-1){pi++;useTiles();}});};useTiles();
  OSM.layer=L.layerGroup().addTo(OSM.map);OSM.pinLayer=L.layerGroup().addTo(OSM.map);OSM.fresh=true;
  OSM.map.on('zoomstart',()=>{OSM.spider=null;});OSM.map.on('zoomend',drawPins);
  OSM.map.on('click',()=>{if(OSM.spider){OSM.spider=null;drawPins();}});}
 slot.appendChild(OSM.el);OSM.map.invalidateSize();
 const {pins,line}=MAPDATA,lay=OSM.layer;lay.clearLayers();
 const ll=d=>[d.lat,d.lng];
 const pts=line?line.map(ll):[];const key=pts.length>1?pts.map(p=>p.join(',')).join(';'):'';
 if(key){const geo=OSM.cache[key];
  OSM.route=L.polyline(geo||pts,{color:'#1D2939',weight:geo?4:3,opacity:.8,dashArray:geo?null:'2 8',lineCap:'round'}).addTo(lay);
  if(!geo&&!OSM.cache['_pending'+key]){OSM.cache['_pending'+key]=1;
   fetch('https://router.project-osrm.org/route/v1/driving/'+pts.map(p=>p[1]+','+p[0]).join(';')+'?overview=full&geometries=geojson').then(r=>r.json()).then(j=>{
    const c=j.routes&&j.routes[0]&&j.routes[0].geometry.coordinates;if(!c)return;OSM.cache[key]=c.map(x=>[x[1],x[0]]);
    if(OSM.key===key&&OSM.route){OSM.route.setLatLngs(OSM.cache[key]);OSM.route.setStyle({weight:4,dashArray:null});}}).catch(()=>{});}}
 OSM.pins=pins;drawPins();
 OSM.key=key;
 /* fit the map when the screen or the route changes — not when picking pins, so the view doesn't jump */
 const fk=state.map.mode+'|'+(state.map.rid||'')+'|'+JSON.stringify(state.map.kinds);
 if(OSM.fresh||OSM.selKey!==fk){const b=(state.map.mode==='routes'&&state.map.rid&&line?line:pins.map(p=>p.q)).map(ll);
  if(b.length>1)OSM.map.fitBounds(L.latLngBounds(b),{padding:[40,40],maxZoom:13});else if(b.length)OSM.map.setView(b[0],12);
  OSM.fresh=false;OSM.selKey=fk;}
}

/* ---- Pins that overlap ----
   At the current zoom, pins closer than CL_PX pixels are drawn as one bubble with the number of jobs
   (petrol ring + small badge when some of them are already in the plan). Tapping a bubble zooms in until they separate;
   if they are at (almost) the same address and zooming won't separate them, they fan out around the spot, with a thin
   line to where each one really is. Tapping the map or zooming closes the fan. */
const CL_PX=44;
function addPin(p,pos){const d=p.q,on=p.n!=='';
 const m=L.marker(pos,{icon:L.divIcon({className:'',html:`<div class="pin${on?' on':''}${p.pick&&!on?' add':''}" style="background:${p.c}">${p.n}</div>`,iconSize:[34,34],iconAnchor:[17,17]}),zIndexOffset:on?300:0});
 m.bindTooltip(`<b>${esc(qCust(d))}</b><br>${esc(qPlace(d))} · ${d.id}${p.pick?`<br><i>${on?'Tap to remove':'Tap to add'}</i>`:''}`,{direction:'top',offset:[0,-16]});
 if(p.pick)m.on('click',()=>A.pick({dataset:{id:d.id}}));else m.on('click',()=>A.open({dataset:{id:d.id}}));m.addTo(OSM.pinLayer);}
function pinGroups(pins,z){const map=OSM.map,groups=[];
 pins.forEach(p=>{const xy=map.project([p.q.lat,p.q.lng],z);const g=groups.find(g=>g.xy.distanceTo(xy)<CL_PX);
  if(g){g.ps.push(p);const n=g.ps.length;g.xy=L.point((g.xy.x*(n-1)+xy.x)/n,(g.xy.y*(n-1)+xy.y)/n);}else groups.push({xy,ps:[p]});});
 /* a group's centre moves as pins join it, so merge groups that ended up too close */
 for(let k=0;k<groups.length;k++)for(let j=k+1;j<groups.length;j++)if(groups[k].xy.distanceTo(groups[j].xy)<CL_PX){const A_=groups[k],B=groups[j],n=A_.ps.length,m=B.ps.length;
  A_.xy=L.point((A_.xy.x*n+B.xy.x*m)/(n+m),(A_.xy.y*n+B.xy.y*m)/(n+m));A_.ps.push(...B.ps);groups.splice(j,1);j=k;}
 return groups;}
function drawPins(){if(!OSM.map||!OSM.pins||!OSM.pinLayer)return;const map=OSM.map,z=map.getZoom(),lay=OSM.pinLayer;lay.clearLayers();
 pinGroups(OSM.pins,z).forEach(g=>{const ps=g.ps,c=map.unproject(g.xy,z);
  if(ps.length===1)return addPin(ps[0],[ps[0].q.lat,ps[0].q.lng]);
  const key=ps.map(p=>p.q.id).sort().join(',');
  if(OSM.spider===key){const n=ps.length,r=Math.max(40,n*11);
   L.marker(c,{icon:L.divIcon({className:'',html:'<div class="pin-hub"></div>',iconSize:[12,12],iconAnchor:[6,6]}),interactive:false}).addTo(lay);
   ps.forEach((p,i)=>{const a=-Math.PI/2+i*2*Math.PI/n,dir=L.point(Math.cos(a),Math.sin(a)),pos=map.unproject(g.xy.add(dir.multiplyBy(r)),z);
    /* thin line from the real spot to the edge of the fanned-out pin (not through it) */
    const real=map.project([p.q.lat,p.q.lng],z),edge=map.unproject(g.xy.add(dir.multiplyBy(r-17)),z);
    L.polyline([map.unproject(real,z),edge],{color:'#1D2939',weight:1.5,opacity:.55,interactive:false}).addTo(lay);addPin(p,pos);});
   return;}
  const cols=[...new Set(ps.map(p=>p.c))],sel=ps.filter(p=>p.n!=='').length;
  const m=L.marker(c,{icon:L.divIcon({className:'',html:`<div class="pin cl${sel?' on':''}" style="background:${cols.length===1?cols[0]:'#475467'}">${ps.length}${sel?`<span class="cl-sel">${sel}</span>`:''}</div>`,iconSize:[42,42],iconAnchor:[21,21]}),zIndexOffset:sel?400:200});
  m.bindTooltip(`<b>${ps.length} jobs here</b><br>${ps.slice(0,5).map(p=>esc(qCust(p.q))).join('<br>')}${ps.length>5?'<br>…':''}<br><i>Tap to see them</i>`,{direction:'top',offset:[0,-22]});
  m.on('click',e=>{L.DomEvent.stop(e);const b=L.latLngBounds(ps.map(p=>[p.q.lat,p.q.lng]));
   const nz=Math.min(map.getBoundsZoom(b,false,L.point(80,80)),17);
   if(nz>z&&pinGroups(ps,nz).length>1)map.flyToBounds(b,{padding:[80,80],maxZoom:nz,duration:.5});
   else{OSM.spider=key;drawPins();}});
  m.addTo(lay);});}

/* ---- Calendar files (.ics): open on a phone and the event is added to its calendar ---- */
const icsEsc=t=>String(t||'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\;');
const icsDT=(iso,min)=>iso.replace(/-/g,'')+'T'+String(Math.floor(min/60)).padStart(2,'0')+String(min%60).padStart(2,'0')+'00';
function icsEvent(o){const st=new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z';
 return ['BEGIN:VEVENT','UID:'+o.uid+'@foxbillions','DTSTAMP:'+st,...o.when,'SUMMARY:'+icsEsc(o.title),o.where?'LOCATION:'+icsEsc(o.where):'','DESCRIPTION:'+icsEsc(o.desc),'BEGIN:VALARM','TRIGGER:-PT30M','ACTION:DISPLAY','DESCRIPTION:'+icsEsc(o.title),'END:VALARM','END:VEVENT'].filter(Boolean);}
function downloadICS(file,events){const txt=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Raposo Solutions//PT','CALSCALE:GREGORIAN','METHOD:PUBLISH',...events.flat(),'END:VCALENDAR'].join('\r\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'text/calendar;charset=utf-8'}));a.download=file;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);}
const jobWhere=q=>qAddr(q)||qTown(q);
const jobDesc=q=>{const ct=contactOf(q);return [q.id+' · '+qCust(q),qPlace(q),ct?`Contacto: ${ct.name}${ct.phone?' '+ct.phone:''}`:'',q.workStart?'Obra: '+fmtRange(q.workStart,q.workEnd):''].filter(Boolean).join('\n');};
/* a saved route as calendar events: one all-day event per visit (no clock times), with the order and morning/afternoon in the text */
function routeICS(r){const st=liveStops(r).filter(s=>!s.done);if(!st.length)return;const nx=addDays(r.date,1).replace(/-/g,''),d0=r.date.replace(/-/g,'');
 downloadICS(`rota-${r.date}.ics`,st.map((s,i)=>{const q=QR(s.q),sl=s.slot==='am'?'manhã':s.slot==='pm'?'tarde':'';
  return icsEvent({uid:q.id+'-visit-'+r.date,title:`${i+1}. Visita${sl?' ('+sl+')':''}: ${qCust(q)} — ${qPlace(q)}`,where:jobWhere(q),desc:[`Visita ${i+1} de ${st.length}`+(sl?` · ${sl}`:s.confirm==='confirmed'?' · sem hora definida':' · por confirmar'),jobDesc(q)].join('\n'),when:['DTSTART;VALUE=DATE:'+d0,'DTEND;VALUE=DATE:'+nx]});}));
 toast('Calendar file ready — open it on your phone to add the visits');}
/* a job's dates as an all-day event */
function jobICS(q){if(!q.workStart)return;const end=addDays(q.workEnd||q.workStart,1).replace(/-/g,'');
 downloadICS(`${q.id}.ics`,[icsEvent({uid:q.id+'-job',title:`Obra: ${qCust(q)} — ${qPlace(q)}`,where:jobWhere(q),desc:jobDesc(q),when:['DTSTART;VALUE=DATE:'+q.workStart.replace(/-/g,''),'DTEND;VALUE=DATE:'+end]})]);toast('Calendar file ready — open it on your phone to add the job');}
