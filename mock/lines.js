/* ===== Quote lines — every line of every quote the user can see, in one list =====
   Filters by status and kind; totals and a quick breakdown ("Group by") for fast metrics; CSV export.
   Values (cost, client value, margin) only for people with quotes.costs. Clicking a line opens its quote on the Lines tab. */
const LN_KINDS=[['','All'],['labor','Labor'],['resource','Resources'],['expense','Expenses']];
const LN_STATUS=[['','All'],['open','Open'],['locked','Locked'],['finished','Finished'],['aborted','Aborted']];
const lnKind=l=>l.onSite?'expense':l.kind==='labor'?'labor':'resource';
const LN_KIND_L={labor:'Labor',resource:'Resource',expense:'Expense'};
function lnState(){if(!state.ln)state.ln={status:'',kind:'',by:''};return state.ln;}
function lnAll(){return visibleQuotes().flatMap(q=>{const ps=linePrices(q);return q.lines.map((l,i)=>({q,l,cost:l.qty*lineCost(l),price:l.onSite?0:(ps[i]||0)}));});}
function lnRows(){const s=lnState(),nq=norm(state.q);
 return lnAll().filter(r=>(!s.status||r.q.status===s.status)&&(!s.kind||lnKind(r.l)===s.kind)
  &&(!nq||norm([r.q.id,qCust(r.q),qPlace(r.q),r.l.desc,lineName(r.l),r.l.detail||'',r.q.title||''].join(' ')).includes(nq)))
  .sort((a,b)=>(b.q.created||'').localeCompare(a.q.created||'')||b.q.id.localeCompare(a.q.id)||a.q.lines.indexOf(a.l)-b.q.lines.indexOf(b.l));}
const lnBys=()=>[['','No grouping'],['ref','Vendor / resource'],['kind','Kind'],['status','Quote status'],['cust','Customer']];
function lnKey(r,by){if(by==='ref')return lineName(r.l);if(by==='kind')return LN_KIND_L[lnKind(r.l)];if(by==='status')return ST[r.q.status]?.label||r.q.status;if(by==='cust')return qCust(r.q);return '';}
const lnSub=l=>[lineName(l)!==l.desc&&lineName(l)!=='—'?lineName(l):'',l.detail||''].filter(Boolean).join(' · ');

function vLines(){const s=lnState();
 const fcombo=(id,label,opts,val,set)=>`<div><span class="flabel">${label}</span>${combo(id,{opts,value:val,title:label,onPick:v=>{set(v);}})}</div>`;
 const nF=[s.status,s.kind].filter(Boolean).length;
 return `<div class="page-head"><div class="grow"><h1>Quote lines</h1><div class="muted small" style="margin-top:4px">${can('quotes.costs')?'Every line of the quotes you can see, with its cost and client value.':'Every line of the quotes you can see.'}</div></div>
  <button class="btn sm" data-act="linesCsv">${ic('doc',15)} Export CSV</button></div>
 <input type="search" placeholder="Search quote, customer, description, vendor…" value="${esc(state.q)}" data-inp="lq" style="margin-bottom:10px">
 <div class="lnfilters">
  ${fcombo('ln-st','Quote status',LN_STATUS.map(([v,l])=>({v,l})),s.status,v=>{s.status=v;})}
  ${fcombo('ln-k','Kind',LN_KINDS.map(([v,l])=>({v,l})),s.kind,v=>{s.kind=v;})}
  ${fcombo('ln-by','Group by',lnBys().map(([v,l])=>({v,l})),s.by,v=>{s.by=v;})}
  ${nF?`<div style="align-self:flex-end"><button class="btn sm ghost" data-act="linesClear">${ic('x',14)} Clear filters</button></div>`:''}</div>
 <div id="lnlist">${lnListHtml()}</div>`;}

function lnListHtml(){const s=lnState(),costs=can('quotes.costs'),rows=lnRows();
 if(!rows.length)return `<div class="card"><div class="empty">No lines match.</div></div>`;
 const tc=sum(rows,r=>r.cost),tp=sum(rows,r=>r.price),qn=new Set(rows.map(r=>r.q.id)).size;
 const tiles=`<div class="lnsum">${tile('Lines',rows.length.toLocaleString(LOC()),`${qn} quote${qn===1?'':'s'}`)}${costs?tile('Cost',eur(tc),'')+tile('Client value',eur(tp),'excl. VAT · expenses not included')+tile('Margin',tp?pct((tp-tc)/tp):'—',eur(tp-tc)):''}</div>`;
 /* breakdown */
 let grp='';if(s.by&&lnBys().some(b=>b[0]===s.by)){const g=new Map();rows.forEach(r=>{const k=lnKey(r,s.by);if(!g.has(k))g.set(k,{k,n:0,q:new Set(),cost:0,price:0});const o=g.get(k);o.n++;o.q.add(r.q.id);o.cost+=r.cost;o.price+=r.price;});
  const gs=[...g.values()].sort((a,b)=>costs?b.cost-a.cost:b.n-a.n);const lbl=lnBys().find(b=>b[0]===s.by)[1];
  grp=`<div class="card" style="margin-bottom:12px"><h3>By ${esc(lbl.toLowerCase())}</h3><div class="scroll-x" style="margin:8px 0 0;padding:0"><table class="ltable"><thead><tr><th>${esc(lbl)}</th><th class="num">Lines</th><th class="num">Quotes</th>${costs?'<th class="num">Cost</th><th class="num">Client value</th><th class="num">Margin</th><th class="num">Share of cost</th>':''}</tr></thead><tbody>
   ${gs.map(o=>`<tr><td class="t">${esc(o.k)}</td><td class="num">${o.n}</td><td class="num">${o.q.size}</td>${costs?`<td class="num">${eur(o.cost)}</td><td class="num">${eur(o.price)}</td><td class="num">${o.price?pct((o.price-o.cost)/o.price):'—'}</td><td class="num">${tc?pct(o.cost/tc):'—'}</td>`:''}</tr>`).join('')}</tbody>
   <tfoot><tr><td>Total</td><td class="num">${rows.length}</td><td class="num">${qn}</td>${costs?`<td class="num">${eur(tc)}</td><td class="num">${eur(tp)}</td><td class="num">${tp?pct((tp-tc)/tp):'—'}</td><td class="num">100%</td>`:''}</tr></tfoot></table></div></div>`;}
 const P_=pg('lines',rows),it=P_.items;
 const desk=`<div class="tcard only-d"><div class="scroll-x" style="margin:0;padding:0"><table class="ltable"><thead><tr><th>Quote</th><th>Status</th><th>Line</th><th class="num">Qty</th>${costs?'<th class="num">Unit cost</th><th class="num">Cost</th><th class="num">Client value</th>':''}</tr></thead><tbody>
  ${it.map(r=>`<tr class="click" data-act="openLines" data-id="${r.q.id}"><td><div class="t">${esc(qCust(r.q))}</div>${r.q.title?`<div class="small muted ell" style="max-width:220px">${esc(r.q.title)}</div>`:''}<div class="tiny faint mono">${r.q.id}</div></td><td><span class="pill p-${ST[r.q.status]?.c||'grey'}">${esc(ST[r.q.status]?.label||r.q.status)}</span></td>
   <td style="min-width:200px"><div>${esc(r.l.desc)}</div><div class="small muted">${esc([LN_KIND_L[lnKind(r.l)],lnSub(r.l)].filter(Boolean).join(' · '))}</div></td>
   <td class="num">${r.l.qty} ${esc(lineUnit(r.l))}</td>${costs?`<td class="num">${eur2(lineCost(r.l))}</td><td class="num">${eur(r.cost)}</td><td class="num">${r.l.onSite?'<span class="faint">—</span>':eur(r.price)}</td>`:''}</tr>`).join('')}</tbody></table></div></div>`;
 const mob=`<div class="card only-m">${it.map(r=>`<button class="lncard" data-act="openLines" data-id="${r.q.id}" style="all:unset;display:block;width:100%;cursor:pointer;box-sizing:border-box;padding:12px 0;border-top:1px solid var(--line)">
   <div class="row between" style="gap:8px"><b class="ell">${esc(r.l.desc)}</b>${costs?`<b>${eur(r.cost)}</b>`:''}</div>
   <div class="small muted">${lnSub(r.l)?esc(lnSub(r.l))+' · ':''}${r.l.qty} ${esc(lineUnit(r.l))} · ${LN_KIND_L[lnKind(r.l)]}</div>
   <div class="small" style="margin-top:2px">${esc(qCust(r.q))} <span class="tiny faint mono">${r.q.id}</span></div></button>`).join('')}</div>`;
 return tiles+grp+desk+mob+P_.foot;}

function linesCsv(){const rows=lnRows(),costs=can('quotes.costs');
 const n2=v=>(+v||0).toFixed(2).replace('.',','),cell=v=>{const s=String(v??'');return /[;"\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
 const head=(isPT()?['Obra','Cliente','Descrição da obra','Estado','Linha','Fornecedor / recurso','Tipo']:['Quote','Customer','Job description','Status','Line','Vendor / resource','Kind']).concat(isPT()?['Quantidade','Unidade']:['Quantity','Unit'],costs?(isPT()?['Custo unitário','Custo','Valor ao cliente']:['Unit cost','Cost','Client value']):[]);
 const body=rows.map(r=>[r.q.id,qCust(r.q),r.q.title||'',tr(ST[r.q.status]?.label||r.q.status),r.l.desc,lineName(r.l),tr(LN_KIND_L[lnKind(r.l)])].concat([String(r.l.qty).replace('.',','),lineUnit(r.l)],costs?[n2(lineCost(r.l)),n2(r.cost),n2(r.price)]:[]));
 const csv='﻿'+[head,...body].map(r=>r.map(cell).join(';')).join('\r\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=`linhas_${TODAY_ISO}.csv`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);
 if(typeof audit==='function')audit('export','lines');toast(`${rows.length} lines exported`);}

Object.assign(A,{
 linesCsv:()=>linesCsv(),
 linesClear:()=>{const s=lnState();s.status='';s.kind='';render();},
 openLines:t=>{A.open(t);state.tab='lines';render();}});
