/* ===== Stock of resources (D-57) =====
   Where things are and how many. No delivery notes, orders or stock valuation — kept simple on purpose.
   - Stock locations (DB.settings.stockLocations): {id, name, notes, blocked} — e.g. Armazém, Carrinha 1.
   - A resource can track stock (r.stock) and have an optional minimum (r.min, empty = no warning).
   - Movements (DB.stockMoves): {id, date, at, by, res, loc, qty (+ in / − out), kind, note, quote?, line?, group?, cost?}
     kind: 'in' (bought / received) · 'out' (used outside a job, lost, broken) · 'move' (transfer — two rows with the same group)
           · 'count' (difference after a count) · 'job' (from a job line). Stock = the sum of the movements.
   - A resource line on a job can say where it comes from (l.from = a location) or nothing = "Bought for the job" (default).
     Open job → only planned. Confirmed (locked) or finished → the material goes out. Reopening, aborting or removing the line
     brings it back; a different quantity or location sets the difference. stockSync() keeps the 'job' movements in step with
     the lines, so it works whatever screen changed the job.
   - Warn, never block: not enough stock is a heads-up and stock can go negative (red in the list).
   In production: a table StockMoves and the same rules on the server, inside the transaction that confirms the job. */

const LT=(en,pt)=>isPT()?pt:en; /* text with numbers or names: written in both languages here */
const STOCK_LOCS=()=>DB.settings.stockLocations||(DB.settings.stockLocations=[]);
const SL=id=>STOCK_LOCS().find(x=>x.id===id);
const MOVES=()=>DB.stockMoves||(DB.stockMoves=[]);
const trackedRes=()=>RESOURCES.filter(r=>r.stock);
const r3=n=>Math.round(n*1000)/1000;
const qtyF=n=>r3(n).toLocaleString(LOC(),{maximumFractionDigits:3});
const stockQty=(rid,loc)=>r3(sum(MOVES().filter(m=>m.res===rid&&(!loc||m.loc===loc)),m=>m.qty));
/* what a job line has taken out of a location (positive number) */
const lineOut=(q,l,loc)=>r3(-sum(MOVES().filter(m=>m.kind==='job'&&m.quote===q.id&&m.line===l.id&&m.res===l.ref&&(!loc||m.loc===loc)),m=>m.qty));
/* planned on open jobs (not out yet) */
const plannedOpen=(rid,loc)=>r3(sum(QUOTES.filter(q=>q.status==='open').flatMap(q=>q.lines.filter(l=>l.kind!=='labor'&&l.ref===rid&&l.from&&(!loc||l.from===loc))),l=>l.qty));
const belowMin=r=>r.stock&&r.min!=null&&r.min!==''&&stockQty(r.id)<+r.min;
function addMove(o){const m={id:uid('sm'),date:TODAY_ISO,at:new Date().toISOString(),by:me().id,note:'',...o};m.qty=r3(m.qty);MOVES().push(m);return m;}

/* keep the job movements in step with the job lines */
const stockWant=(q,l)=>l.kind!=='labor'&&l.from&&R(l.ref)?.stock&&SL(l.from)&&(q.status==='locked'||q.status==='finished')?{loc:l.from,qty:+l.qty||0}:null;
function stockSync(){if(!DB||!state.user)return;const want=new Map(),have=new Map(),info=new Map();const K=(q,l,res,loc)=>[q,l,res,loc].join('|');
 QUOTES.forEach(q=>q.lines.forEach(l=>{const w=stockWant(q,l);if(w){const k=K(q.id,l.id,l.ref,w.loc);want.set(k,(want.get(k)||0)-w.qty);info.set(k,{q:q.id,line:l.id,res:l.ref,loc:w.loc});}}));
 MOVES().forEach(m=>{if(m.kind!=='job')return;const k=K(m.quote,m.line,m.res,m.loc);have.set(k,(have.get(k)||0)+m.qty);if(!info.has(k))info.set(k,{q:m.quote,line:m.line,res:m.res,loc:m.loc});});
 const keys=new Set([...want.keys(),...have.keys()]);
 keys.forEach(k=>{const d=r3((want.get(k)||0)-(have.get(k)||0));if(Math.abs(d)<1e-9)return;const o=info.get(k),q=QR(o.q),r=R(o.res),loc=SL(o.loc);
  addMove({kind:'job',res:o.res,loc:o.loc,qty:d,quote:o.q,line:o.line,note:d<0?LT('Out for the job','Saída para a obra'):LT('Back from the job','Devolvido da obra')});
  if(q)logQ(q,LT(`Stock: ${qtyF(Math.abs(d))} ${r?.unit||''} ${r?.name||''} ${d<0?'out of':'back to'} ${loc?.name||'—'}`,`Stock: ${qtyF(Math.abs(d))} ${r?.unit||''} ${r?.name||''} ${d<0?'saiu de':'voltou a'} ${loc?.name||'—'}`));});}
const _renderNoStock=render;
render=function(){try{stockSync();}catch(e){console.error(e);}return _renderNoStock.apply(this,arguments);};

/* "From" field on a resource line (job lines and expenses) */
function fromField(f,rid,qty,q,l){const r=R(rid);const locs=STOCK_LOCS().filter(x=>!x.blocked||x.id===f.from);if(!r||!r.stock||!locs.length)return '';
 const avail=loc=>r3(stockQty(rid,loc)+(q&&l?lineOut(q,l,loc):0));
 const opts=[{v:'',l:'Bought for the job',sub:'Not from stock'},...locs.map(x=>({v:x.id,l:x.name,sub:LT(`${qtyF(avail(x.id))} ${r.unit} available`,`${qtyF(avail(x.id))} ${r.unit} disponíveis`),badge:avail(x.id)<(+qty||0)?{t:'Not enough',c:'amber'}:null}))];
 const a=f.from?avail(f.from):null,short=f.from&&a<(+qty||0);
 return `<div><span class="flabel">Comes from <span class="faint" style="font-weight:400">(optional)</span></span>${combo('fr-'+rid,{opts,value:f.from||'',title:'Where it comes from',onPick:v=>{f.from=v;}})}
  ${short?`<div class="banner amber" style="font-size:13px;margin-top:6px">${ic('alert',16)}<div>${LT(`Only ${qtyF(a)} ${esc(r.unit)} in ${esc(SL(f.from).name)} — the stock goes below zero. You can still save.`,`Só há ${qtyF(a)} ${esc(r.unit)} em ${esc(SL(f.from).name)} — o stock fica abaixo de zero. Pode guardar na mesma.`)}</div></div>`
   :f.from?`<div class="tiny faint" style="margin-top:4px">Leaves the stock when the job is confirmed; comes back if the job is reopened or aborted or the line is removed.</div>`:''}</div>`;}
const fromPill=(q,l)=>l.from&&SL(l.from)?`<span class="pill p-grey nodot">${ic('box',11)} ${q.status==='open'?LT('Planned from','Planeado de'):LT('From','De')} ${esc(SL(l.from).name)}</span>`:'';

/* ---- the Stock screen ---- */
const MOVE_KIND={in:['Stock in','green'],out:['Stock out','amber'],move:['Transfer','blue'],count:['Count','violet'],job:['Job','accent']};
function stockSt(){return state.stock||(state.stock={loc:'',q:''});}
function vStock(){const s=stockSt(),locs=STOCK_LOCS().filter(l=>!l.blocked),ed=can('stock.manage'),tr=trackedRes();if(s.loc&&!SL(s.loc))s.loc='';
 const low=tr.filter(belowMin),neg=tr.filter(r=>STOCK_LOCS().some(l=>stockQty(r.id,l.id)<0));
 return `<div class="page-head"><div class="grow"><h1>Stock</h1><div class="muted small" style="margin-top:4px">${LT(`${tr.length} resource${tr.length===1?'':'s'} with stock · ${locs.length} location${locs.length===1?'':'s'}`,`${tr.length} recurso${tr.length===1?'':'s'} com stock · ${locs.length} localizaç${locs.length===1?'ão':'ões'}`)}</div></div>
  ${ed?`<button class="btn sm" data-act="stockLocs">${ic('pin',15)} Locations</button>`:''}</div>
 ${ed&&locs.length&&tr.length?`<div class="sacts">${[['in','plus','Stock in'],['out','minus','Stock out'],['move','swap','Transfer'],['count','check','Count']].map(([k,i,l])=>`<button class="btn ${k==='in'?'pri':''}" data-act="stockMove" data-k="${k}">${ic(i,16)} ${l}</button>`).join('')}</div>`:''}
 ${!locs.length?`<div class="card"><b>No stock locations yet</b><div class="small muted" style="margin:4px 0 10px">Start with the places where material is kept — for example the warehouse and each van.</div>${ed?`<button class="btn sm pri" data-act="stockLoc">${ic('plus',15)} New location</button>`:''}</div>`:''}
 ${!tr.length?`<div class="card" style="margin-top:12px"><b>No resource tracks stock yet</b><div class="small muted" style="margin:4px 0 10px">In Directory › Resources & prices, edit a resource and tick “Track stock”. Fuel, tolls and rentals usually don’t.</div>${can('resources.price')?`<button class="btn sm" data-act="goDir" data-t="resources">${ic('dir',15)} Open resources</button>`:''}</div>`:''}
 ${low.length||neg.length?`<div class="banner amber" style="margin-bottom:12px">${ic('alert',18)}<div>${low.length?`<b>${LT(`${low.length} below the minimum`,`${low.length} abaixo do mínimo`)}</b> · ${low.slice(0,4).map(r=>esc(r.name)).join(', ')}${low.length>4?'…':''}`:''}${low.length&&neg.length?'<br>':''}${neg.length?`<b>${LT(`${neg.length} below zero`,`${neg.length} abaixo de zero`)}</b> ${LT('in a location — count it or record what came in','numa localização — conte ou registe o que entrou')}`:''}</div></div>`:''}
 ${tr.length?`<input type="search" placeholder="Search resources…" value="${esc(s.q)}" data-sq="1" style="margin-bottom:10px">
 ${locs.length>1?`<div class="chips" style="margin-bottom:12px">${[{id:'',name:'All locations'},...locs].map(l=>`<button class="chip ${s.loc===l.id?'on':''}" data-act="stockLocF" data-id="${l.id}">${esc(l.name)}</button>`).join('')}</div>`:''}
 <div id="slist">${stockList()}</div>`:''}
 ${MOVES().length?`<div class="card" style="margin-top:14px"><div class="row between"><h3>Latest movements</h3><span class="tiny faint">${MOVES().length}</span></div>${movesHtml(MOVES().slice().reverse().slice(0,25))}</div>`:''}`;}
function stockList(){const s=stockSt(),locs=STOCK_LOCS().filter(l=>!l.blocked),nq=norm(s.q);
 const rs=trackedRes().filter(r=>!nq||norm(r.no+' '+r.name).includes(nq)).sort((a,b)=>a.name.localeCompare(b.name));const P_=pg('stock',rs);
 if(!rs.length)return '<div class="empty">No resources match.</div>';
 const cols=s.loc?[SL(s.loc)]:locs.length<=4?locs:[];
 const st=r=>{const t=s.loc?stockQty(r.id,s.loc):stockQty(r.id);return t<0?'<span class="pill p-red nodot">Below zero</span>':belowMin(r)?`<span class="pill p-amber nodot">${LT('Below minimum','Abaixo do mínimo')} ${qtyF(+r.min)}</span>`:'';};
 const qn=(n,u)=>`<span style="${n<0?'color:var(--red);font-weight:700':''}">${qtyF(n)}</span>`;
 return `<div class="mlist only-m">${P_.items.map(r=>{const t=s.loc?stockQty(r.id,s.loc):stockQty(r.id),pl=plannedOpen(r.id,s.loc);return `<button class="mcard" data-act="stockRes" data-id="${r.id}"><div class="row between"><b class="ell">${esc(r.name)}</b><b style="white-space:nowrap">${qn(t)} ${esc(r.unit)}</b></div>
   <div class="small muted" style="margin-top:4px">${s.loc?'':locs.map(l=>`${esc(l.name)} ${qtyF(stockQty(r.id,l.id))}`).join(' · ')}${pl?`${s.loc?'':' · '}${LT(`planned ${qtyF(pl)} on open jobs`,`${qtyF(pl)} planeado em obras abertas`)}`:''}</div>${st(r)?`<div style="margin-top:6px">${st(r)}</div>`:''}</button>`;}).join('')}</div>
 <div class="tcard only-d"><table class="ltable"><thead><tr><th>Resource</th><th>Unit</th>${cols.map(l=>`<th class="r">${esc(l.name)}</th>`).join('')}${s.loc?'':'<th class="r">Total</th>'}<th class="r">Minimum</th><th class="r">Planned on open jobs</th><th></th></tr></thead><tbody>
  ${P_.items.map(r=>`<tr class="click" data-act="stockRes" data-id="${r.id}"><td class="t">${esc(r.name)}<div class="tiny faint mono">${esc(r.no)}</div></td><td><span class="pill p-grey nodot">${esc(r.unit)}</span></td>${cols.map(l=>`<td class="r">${qn(stockQty(r.id,l.id))}</td>`).join('')}${s.loc?'':`<td class="r"><b>${qn(stockQty(r.id))}</b></td>`}<td class="r">${r.min!=null&&r.min!==''?qtyF(+r.min):'<span class="faint">—</span>'}</td><td class="r">${plannedOpen(r.id,s.loc)?qtyF(plannedOpen(r.id,s.loc)):'<span class="faint">—</span>'}</td><td>${st(r)}</td></tr>`).join('')}</tbody></table></div>`+P_.foot;}
function movesHtml(ms){if(!ms.length)return '<div class="small faint" style="margin-top:8px">No movements yet.</div>';
 return `<div style="margin-top:6px">${ms.map(m=>{const r=R(m.res),k=MOVE_KIND[m.kind]||['—','grey'],q=m.quote&&QR(m.quote);
  return `<div class="smove"><span class="tiny faint" style="width:76px;flex:none">${fmtDate(m.date)}</span><span class="pill p-${k[1]} nodot" style="flex:none">${k[0]}</span>
   <span class="grow" style="min-width:0"><b>${esc(r?.name||'—')}</b> <span class="small muted">· ${esc(SL(m.loc)?.name||'—')}</span>${m.note?`<div class="tiny faint">${esc(m.note)}</div>`:''}${q?`<div class="tiny"><button class="link" data-act="open" data-id="${q.id}">${esc(qCust(q))} · ${esc(q.id)}</button></div>`:''}<div class="tiny faint">${esc(U(m.by)?.name||'—')}</div></span>
   <b style="white-space:nowrap;${m.qty<0?'color:var(--ink-2)':''}">${m.qty>0?'+':'−'}${qtyF(Math.abs(m.qty))} ${esc(r?.unit||'')}</b></div>`;}).join('')}</div>`;}

/* resource detail: per location, minimum, last movements */
function mStockRes(id){const r=R(id);if(!r)return;const ed=can('stock.manage');
 openModal(r.name,()=>{const locs=STOCK_LOCS().filter(l=>!l.blocked||stockQty(r.id,l.id));const ms=MOVES().filter(m=>m.res===r.id).slice().reverse().slice(0,15);
  return `<div class="stack"><div class="row wrap" style="gap:8px"><span class="mono faint small">${esc(r.no)}</span><span class="pill p-grey nodot">${esc(r.unit)}</span>${belowMin(r)?`<span class="pill p-amber nodot">${LT('Below minimum','Abaixo do mínimo')} ${qtyF(+r.min)}</span>`:''}</div>
   <div>${locs.map(l=>`<div class="sum-row"><span>${esc(l.name)}</span><b>${qtyF(stockQty(r.id,l.id))} ${esc(r.unit)}</b></div>`).join('')}<div class="sum-row"><span><b>Total</b></span><b>${qtyF(stockQty(r.id))} ${esc(r.unit)}</b></div>
   ${plannedOpen(r.id)?`<div class="sum-row"><span class="muted">Planned on open jobs</span><span>${qtyF(plannedOpen(r.id))} ${esc(r.unit)}</span></div>`:''}
   <div class="sum-row"><span class="muted">Minimum</span><span>${r.min!=null&&r.min!==''?qtyF(+r.min)+' '+esc(r.unit):'—'}</span></div></div>
   ${ed?`<div class="row wrap" style="gap:6px">${[['in','Stock in'],['out','Stock out'],['move','Transfer'],['count','Count']].map(([k,l])=>`<button class="btn sm" data-act="stockMove" data-k="${k}" data-r="${r.id}">${l}</button>`).join('')}</div>`:''}
   <div><div class="k">Latest movements</div>${movesHtml(ms)}</div></div>`;},null);}

/* stock in / out / transfer / count */
function mStockMove(kind,rid,loc){const locs=STOCK_LOCS().filter(l=>!l.blocked);
 state.form={kind,res:rid||'',loc:loc||(locs.length===1?locs[0].id:''),to:'',qty:'',cost:'',upd:false,date:TODAY_ISO,note:''};
 openModal('Stock movement',()=>{const f=F(),r=f.res?R(f.res):null,u=r?r.unit:'';const cur=r&&f.loc?stockQty(r.id,f.loc):null;
  const lopts=locs.map(l=>({v:l.id,l:l.name,sub:r?`${qtyF(stockQty(r.id,l.id))} ${u}`:''}));
  const after=cur==null||f.qty===''?null:f.kind==='in'?cur+(+f.qty):f.kind==='count'?+f.qty:cur-(+f.qty);
  return `<div class="stack"><div class="seg seg-full">${[['in','Stock in'],['out','Stock out'],['move','Transfer'],['count','Count']].map(([k,l])=>`<button class="${f.kind===k?'on':''}" data-act="fset" data-k="kind" data-v="${k}">${l}</button>`).join('')}</div>
   <div class="tiny faint">${{in:'Material bought or received — it goes into a location.',out:'Used outside a job, lost or broken. Material for a job is taken out on the job’s line (“From”).',move:'From one location to another — e.g. from the warehouse to a van.',count:'Write what you counted — the app records the difference.'}[f.kind]}</div>
   <div><span class="flabel">Resource</span>${combo('sm-res',{opts:trackedRes().map(x=>({v:x.id,l:x.name,sub:LT(`${qtyF(stockQty(x.id))} ${x.unit} in stock`,`${qtyF(stockQty(x.id))} ${x.unit} em stock`)})),value:f.res,title:'Resource',placeholder:'Search resources…',onPick:v=>{f.res=v;}})}</div>
   <div class="grid2"><div><span class="flabel">${f.kind==='move'?LT('From','De'):'Location'}</span>${combo('sm-loc',{opts:lopts,value:f.loc,title:'Location',placeholder:'Choose…',onPick:v=>{f.loc=v;}})}</div>
    ${f.kind==='move'?`<div><span class="flabel">${LT('To','Para')}</span>${combo('sm-to',{opts:lopts.filter(o=>o.v!==f.loc),value:f.to,title:'To',placeholder:'Choose…',onPick:v=>{f.to=v;}})}</div>`:''}</div>
   <div class="grid2"><label class="f">${f.kind==='count'?'Quantity counted':'Quantity'}${u?' ('+esc(u)+')':''}<input type="number" step="any" min="0" inputmode="decimal" data-f="qty" data-rerender="1" value="${esc(f.qty)}"></label>
    ${f.kind==='in'?`<label class="f">Unit cost (€) <span class="faint" style="font-weight:400">(optional)</span><input type="number" step="0.01" min="0" inputmode="decimal" data-f="cost" value="${esc(f.cost)}"></label>`:''}</div>
   ${f.kind==='in'&&can('resources.price')?`<label class="check"><input type="checkbox" data-f="upd" ${f.upd?'checked':''}> <span>Update the resource price with this cost <span class="tiny faint">(price history, from today)</span></span></label>`:''}
   ${cur!=null?`<div class="small muted">${LT('Now in','Agora em')} ${esc(SL(f.loc).name)}: <b>${qtyF(cur)} ${esc(u)}</b>${after!=null&&f.kind!=='move'?` → ${LT('after','depois')}: <b>${qtyF(after)} ${esc(u)}</b>`:''}${f.kind==='count'&&after!=null?` (${after-cur>=0?'+':'−'}${qtyF(Math.abs(after-cur))})`:''}</div>`:''}
   ${after!=null&&after<0&&f.kind!=='count'||f.kind==='move'&&cur!=null&&f.qty!==''&&cur-(+f.qty)<0?`<div class="banner amber" style="font-size:13px">${ic('alert',16)}<div>${LT(`There isn’t that much in ${esc(SL(f.loc).name)} — the stock goes below zero. You can still save.`,`Não há tanto em ${esc(SL(f.loc).name)} — o stock fica abaixo de zero. Pode guardar na mesma.`)}</div></div>`:''}
   <div class="grid2"><label class="f">Date<input type="date" data-f="date" value="${esc(f.date)}" max="${TODAY_ISO}"></label><label class="f">Note <span class="faint" style="font-weight:400">(optional)</span><input type="text" data-f="note" value="${esc(f.note)}" placeholder="${f.kind==='in'?'e.g. Leroy Merlin, invoice 123':f.kind==='out'?'e.g. broken':''}"></label></div></div>`;},
 ()=>{const f=F(),r=R(f.res);if(!r)return err('Choose the resource');if(!f.loc)return err('Choose the location');const qty=+f.qty;
  if(f.qty===''||!(qty>=0)||(f.kind!=='count'&&!(qty>0)))return err('Enter the quantity');if(f.kind==='move'&&!f.to)return err('Choose where it goes');
  const base={res:r.id,date:f.date||TODAY_ISO,note:(f.note||'').trim()};const Ln=SL(f.loc).name;let msg;
  if(f.kind==='in'){const cost=f.cost===''||f.cost==null?null:Math.round(+f.cost*100)/100;addMove({...base,kind:'in',loc:f.loc,qty,cost});
   if(f.upd&&cost!=null&&can('resources.price')){const last=r.hist[r.hist.length-1];if(last&&last[0]===TODAY_ISO)last[1]=cost;else r.hist.push([TODAY_ISO,cost]);}
   msg=`+${qtyF(qty)} ${r.unit} ${r.name} → ${Ln}`;}
  else if(f.kind==='out'){addMove({...base,kind:'out',loc:f.loc,qty:-qty});msg=`−${qtyF(qty)} ${r.unit} ${r.name} ← ${Ln}`;}
  else if(f.kind==='move'){const g=uid('g');addMove({...base,kind:'move',loc:f.loc,qty:-qty,group:g,note:base.note||LT('To ','Para ')+SL(f.to).name});addMove({...base,kind:'move',loc:f.to,qty,group:g,note:base.note||LT('From ','De ')+Ln});msg=`${qtyF(qty)} ${r.unit} ${r.name}: ${Ln} → ${SL(f.to).name}`;}
  else{const d=r3(qty-stockQty(r.id,f.loc));if(Math.abs(d)<1e-9){state.modal=null;toast('Count matches — nothing to change');return;}addMove({...base,kind:'count',loc:f.loc,qty:d,note:(base.note?base.note+' · ':'')+LT('Counted ','Contado ')+qtyF(qty)});msg=`${LT('Count saved','Contagem guardada')} · ${d>0?'+':'−'}${qtyF(Math.abs(d))} ${r.unit}`;}
  state.modal=null;toast(msg);},'Save');}

/* locations */
function mStockLocs(){openModal('Stock locations',()=>`<div class="stack"><div class="small muted">Places where material is kept. A location with movements can be blocked (it leaves the lists) but not deleted.</div>
  ${STOCK_LOCS().map(l=>`<div class="sum-row" style="align-items:center"><span><b>${esc(l.name)}</b>${l.blocked?' <span class="pill p-grey nodot">Blocked</span>':''}${l.notes?`<div class="tiny faint">${esc(l.notes)}</div>`:''}<div class="tiny faint">${MOVES().filter(m=>m.loc===l.id).length} ${LT('movements','movimentos')}</div></span><button class="btn sm" data-act="stockLoc" data-id="${l.id}">${ic('edit',14)} Edit</button></div>`).join('')||'<div class="small faint">None yet.</div>'}
  <button class="btn sm pri" data-act="stockLoc" style="align-self:flex-start">${ic('plus',15)} New location</button></div>`,null);}
function mStockLoc(id){const l=id?SL(id):null;const used=l?MOVES().some(m=>m.loc===l.id):false;state.form={name:l?.name||'',notes:l?.notes||'',blocked:!!l?.blocked};
 openModal(l?l.name:'New stock location',()=>{const f=F();return `<div class="stack"><label class="f">Name<input type="text" data-f="name" value="${esc(f.name)}" placeholder="e.g. Armazém, Carrinha 1"></label>
   <label class="f">Notes <span class="faint" style="font-weight:400">(optional)</span><input type="text" data-f="notes" value="${esc(f.notes)}" placeholder="e.g. Rua das Flores 12, Amadora"></label>
   ${l?`<label class="check"><input type="checkbox" data-f="blocked" ${f.blocked?'checked':''}> <span>Blocked — leaves the lists, keeps its movements</span></label>`:''}
   ${l&&!used?`<button class="btn sm ghost danger" data-act="stockLocDel" data-id="${l.id}" style="align-self:flex-start">${ic('trash',14)} Delete</button>`:''}</div>`;},
 ()=>{const f=F(),name=(f.name||'').trim();if(!name)return err('Add a name');if(STOCK_LOCS().some(x=>x!==l&&norm(x.name)===norm(name)))return err('There is already a location with this name');
  if(l)Object.assign(l,{name,notes:(f.notes||'').trim(),blocked:!!f.blocked});else STOCK_LOCS().push({id:uid('sl'),name,notes:(f.notes||'').trim(),blocked:false});
  mStockLocs();toast(l?'Location saved':'Location added');},l?'Save':'Add');}

/* Home: a heads-up for whoever manages stock */
function stockHomeBanner(){if(!can('stock.manage'))return '';const low=trackedRes().filter(belowMin);if(!low.length)return '';
 return `<button class="banner amber" data-act="go" data-v="stock" style="width:100%;text-align:left;margin-bottom:14px;border:0;cursor:pointer">${ic('box',18)}<div><b>${LT(`${low.length} resource${low.length>1?'s':''} below the minimum stock`,`${low.length} recurso${low.length>1?'s':''} abaixo do stock mínimo`)}</b> · ${low.slice(0,3).map(r=>esc(r.name)).join(', ')}${low.length>3?'…':''}</div></button>`;}

Object.assign(A,{
 stockMove:t=>mStockMove(t.dataset.k,t.dataset.r||'',stockSt().loc||''),
 stockRes:t=>mStockRes(t.dataset.id),
 stockLocs:()=>mStockLocs(),
 stockLoc:t=>mStockLoc(t.dataset.id||null),
 stockLocDel:t=>{const a=STOCK_LOCS(),i=a.findIndex(x=>x.id===t.dataset.id);if(i>=0&&!MOVES().some(m=>m.loc===a[i].id)){a.splice(i,1);mStockLocs();toast('Location deleted');}},
 stockLocF:t=>{stockSt().loc=t.dataset.id||'';render();},
});
Object.assign(PERM_OF,{stockMove:'stock.manage',stockLocs:'stock.manage',stockLoc:'stock.manage',stockLocDel:'stock.manage'});
document.addEventListener('input',e=>{const t=e.target;if(t.dataset&&t.dataset.sq&&state.view==='stock'){stockSt().q=t.value;const el=document.getElementById('slist');if(el){el.innerHTML=stockList();watchMore();}}});
