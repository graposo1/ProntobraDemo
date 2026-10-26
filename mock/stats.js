/* ===== Statistics (D-56) =====
   One screen for how the business is going: jobs, proposals, money (planned vs actual cost), times, expenses — for a period,
   compared with the previous period of the same size. Values in € and margins only for people who see costs (quotes.costs).
   Which date counts: finished jobs → workDone; proposals → the day each version was sent; new jobs → created;
   confirmed → approved.date; aborted → cancel.date (older data: the status date).
   Planned vs actual: when a job is confirmed the numbers are frozen (lockedCost / lockedPrice / lockedAt, see doLock).
   Actual = the cost of every line at the end (changes and expenses on site). Older jobs without the snapshot use the
   cost of the lines without the on-site expenses.
   In production these sums are SQL on the server; here they run in the browser over the quotes this user can see. */

const ST_PERIODS=[['month','This month'],['quarter','This quarter'],['year','This year'],['last12','Last 12 months'],['lastYear','Last year'],['custom','Custom']];
const ABORT_REASONS=['Client rejected proposal — price','Client rejected proposal — other','Client no longer needs it','Duplicate request','No vendors available','Other'];
const ST_BY=[['customer','Customer'],['vendor','Vendor'],['owner','Owner'],['town','Town']];
function stState(){if(!state.stats)state.stats={per:'year',from:null,to:null,by:''};return state.stats;}

/* --- dates --- */
const ymd=(y,m,d)=>isoOf(new Date(y,m,d,12));
const dim_=(y,m)=>new Date(y,m+1,0).getDate();
/* the same day n months earlier (clamped to the end of the month) */
const backMonths=(s,n)=>{const d=D(s),y=d.getFullYear(),m=d.getMonth()-n;const yy=y+Math.floor(m/12),mm=((m%12)+12)%12;return ymd(yy,mm,Math.min(d.getDate(),dim_(yy,mm)));};
const dayCount=(a,b)=>Math.round((D(b)-D(a))/864e5)+1;
function stRange(){const s=stState(),t=D(TODAY_ISO),y=t.getFullYear(),m=t.getMonth();let from,to=TODAY_ISO,back=null;
 switch(s.per){
  case 'month':from=ymd(y,m,1);back=1;break;
  case 'lastMonth':from=ymd(y,m-1,1);to=ymd(y,m,0);return {from,to,prev:{from:ymd(y,m-2,1),to:ymd(y,m-1,0)}};
  case 'quarter':from=ymd(y,m-m%3,1);back=3;break;
  case 'year':from=ymd(y,0,1);back=12;break;
  case 'lastYear':from=ymd(y-1,0,1);to=ymd(y-1,11,31);return {from,to,prev:{from:ymd(y-2,0,1),to:ymd(y-2,11,31)}};
  case 'last12':from=addDays(backMonths(TODAY_ISO,12),1);back=12;break;
  default:{from=s.from||ymd(y,0,1);to=s.to||TODAY_ISO;if(to<from)[from,to]=[to,from];const n=dayCount(from,to);return {from,to,prev:{from:addDays(from,-n),to:addDays(from,-1)}};}}
 return {from,to,prev:{from:backMonths(from,back),to:backMonths(to,back)}};}
const inR=(d,r)=>!!d&&d>=r.from&&d<=r.to;

/* --- per job numbers --- */
const abortDate=q=>q.cancel?.date||q.since;
const actualCost=q=>calc(q).cost;
const plannedCost=q=>q.lockedCost!=null?q.lockedCost:sum(q.lines.filter(l=>!l.onSite),l=>l.qty*lineCost(l));
const plannedPrice=q=>q.lockedPrice!=null?q.lockedPrice:calc(q).prop;
const mPct=(price,cost)=>price?(price-cost)/price:0;
function jobNums(q){const c=calc(q),pc=plannedCost(q),pp=plannedPrice(q);
 return {value:c.prop,cost:c.cost,planned:pc,dev:c.cost-pc,mPlan:mPct(pp,pc),mReal:mPct(c.prop,c.cost),margin:c.prop-c.cost};}
const jobTown=q=>q.site?.address?.city||'No location';

/* --- the data the screen works on: the quotes this user can see --- */
const stQuotes=()=>visibleQuotes();

function stMetrics(qs,r){
 const created=qs.filter(q=>inR(q.created,r)),confirmed=qs.filter(q=>inR(q.approved?.date,r)&&q.status!=='open'),
  finished=qs.filter(q=>q.status==='finished'&&inR(q.workDone,r)),aborted=qs.filter(q=>q.status==='aborted'&&inR(abortDate(q),r));
 const ongoing=qs.filter(q=>q.approved?.date&&q.approved.date<=r.to&&q.status!=='open'&&!(q.status==='finished'&&q.workDone<=r.to)&&!(q.status==='aborted'&&abortDate(q)<=r.to));
 const sent=qs.flatMap(q=>q.versions.filter(v=>inR(v.date,r)));
 const rejected=qs.flatMap(q=>q.versions.filter(v=>v.rejected&&inR(v.rejected.date||v.date,r)));
 const wonP=confirmed.filter(q=>q.versions.length),lostP=aborted.filter(q=>q.versions.length);
 const toConfirm=wonP.map(q=>daysBetween(q.versions[0].date,q.approved.date)).filter(n=>n>=0);
 const nums=finished.map(jobNums);const value=sum(nums,n=>n.value),cost=sum(nums,n=>n.cost),planned=sum(nums,n=>n.planned),pPrice=sum(finished,plannedPrice);
 const dur=finished.filter(q=>q.workStart).map(q=>daysBetween(q.workStart,q.workDone)+1);
 const late=finished.filter(q=>q.workEnd&&q.workDone>q.workEnd);
 const exps=qs.flatMap(q=>q.lines.filter(l=>l.onSite&&inR(l.addedAt,r)).map(l=>({q,l})));
 return {created:created.length,confirmed:confirmed.length,finished:finished.length,aborted:aborted.length,ongoing:ongoing.length,
  finishedList:finished,abortedList:aborted,
  sent:sent.length,rejected:rejected.length,won:wonP.length,lost:lostP.length,rate:wonP.length+lostP.length?wonP.length/(wonP.length+lostP.length):null,
  versions:wonP.length?sum(wonP,q=>q.versions.length)/wonP.length:null,toConfirm:toConfirm.length?sum(toConfirm,x=>x)/toConfirm.length:null,
  value,cost,planned,dev:cost-planned,devPct:planned?(cost-planned)/planned:null,margin:value-cost,mReal:value?(value-cost)/value:null,mPlan:pPrice?(pPrice-planned)/pPrice:null,
  dur:dur.length?sum(dur,x=>x)/dur.length:null,late:late.length,lateDays:late.length?sum(late,q=>daysBetween(q.workEnd,q.workDone))/late.length:null,
  exps,expTotal:sum(exps,x=>x.l.qty*lineCost(x.l))};}
const daysBetween=(a,b)=>Math.round((D(b)-D(a))/864e5);

/* --- formatting --- */
const num1=n=>n==null?'—':n.toLocaleString(LOC(),{maximumFractionDigits:1});
function delta(cur,prev,o={}){if(cur==null||prev==null)return '';
 if(o.points){const d=(cur-prev)*100;if(Math.abs(d)<0.05)return `<span class="sdelta">= ${o.vs}</span>`;return `<span class="sdelta">${d>0?'↑':'↓'} ${Math.abs(d).toLocaleString(LOC(),{maximumFractionDigits:1})} pp ${o.vs}</span>`;}
 if(!prev)return cur?`<span class="sdelta">↑ ${o.vs}</span>`:`<span class="sdelta">= ${o.vs}</span>`;
 const d=(cur-prev)/Math.abs(prev);if(Math.abs(d)<0.005)return `<span class="sdelta">= ${o.vs}</span>`;
 return `<span class="sdelta">${d>0?'↑':'↓'} ${Math.abs(d*100).toLocaleString(LOC(),{maximumFractionDigits:0})}% ${o.vs}</span>`;}
const tile=(label,val,sub,dl)=>`<div class="stile"><span class="kl">${label}</span><b class="sv">${val}</b>${sub?`<span class="tiny faint">${sub}</span>`:''}${dl||''}</div>`;

/* --- breakdown (finished jobs of the period) --- */
function stBreakdown(list,by){const g=new Map();const add=(k,f)=>{if(!g.has(k))g.set(k,{k,jobs:new Set(),value:0,cost:0,planned:0});f(g.get(k));};
 list.forEach(q=>{const n=jobNums(q);
  const whole=k=>add(k,o=>{o.jobs.add(q.id);o.value+=n.value;o.cost+=n.cost;o.planned+=n.planned;});
  if(by==='customer')whole(qCust(q));
  else if(by==='owner')whole(U(q.owner)?.name||'—');
  else if(by==='town')whole(jobTown(q));
  else if(by==='vendor')q.lines.filter(l=>l.kind==='labor').forEach(l=>add(vName(l.doneBy||l.ref,l.doneByName||l.refName),o=>{o.jobs.add(q.id);o.cost+=l.qty*lineCost(l);o.value=null;}));
  else if(by.startsWith('dim:')){const d=by.slice(4),vs=dvals(q.dims,d);(vs.length?vs.map(v=>dimValName(d,v)):['—']).forEach(whole);}});
 return [...g.values()].map(o=>({...o,jobs:o.jobs.size,margin:o.value==null?null:o.value-o.cost,mReal:o.value?(o.value-o.cost)/o.value:null,dev:o.value==null?null:o.cost-o.planned}));}
function topN(rows,key,dir,n=10){const v=r=>r[key]==null?-Infinity:typeof r[key]==='string'?r[key]:r[key];
 const s=rows.slice().sort((a,b)=>{const x=v(a),y=v(b);return (typeof x==='string'?x.localeCompare(y):x-y)*dir||b.jobs-a.jobs;});
 if(s.length<=n)return s;const rest=s.slice(n);
 const o={k:'Others',other:true,jobs:sum(rest,r=>r.jobs),value:rest.some(r=>r.value==null)?null:sum(rest,r=>r.value),cost:sum(rest,r=>r.cost),planned:sum(rest,r=>r.planned||0)};
 o.margin=o.value==null?null:o.value-o.cost;o.mReal=o.value?(o.value-o.cost)/o.value:null;o.dev=o.value==null?null:o.cost-o.planned;
 return [...s.slice(0,n),o];}


/* --- the screen (streamlined 25-10-2026, D-66) ---
   Open value and done value → one breakdown → the finished jobs. Everything else sits in "More numbers" (closed). */
function vStats(){const s=stState(),r=stRange(),costs=can('quotes.costs'),qs=stQuotes();
 const cur=stMetrics(qs,r),prev=stMetrics(qs,r.prev),vs=isPT()?'vs. anterior':'vs. previous';
 const dl=(k,o={})=>prev[k]?delta(cur[k],prev[k],{vs,...o}):''; /* no comparison when the previous period had nothing */
 const empty=!qs.length;
 /* the two questions first: what is still open (today) and what has been done (in the period) */
 const opQ=qs.filter(q=>q.status==='open'),lkQ=qs.filter(q=>q.status==='locked'),val=a=>sum(a,q=>calc(q).prop);
 const vOp=val(opQ),vLk=val(lkQ);
 const openTiles=(costs?tile('Value open',eur(vOp+vLk),`${eur(vOp)} ${isPT()?'em abertas':'in open'} · ${eur(vLk)} ${isPT()?'em confirmadas':'in confirmed'}`,''):'')
  +tile('Jobs open',opQ.length+lkQ.length,`${opQ.length} ${isPT()?(opQ.length===1?'aberta':'abertas'):'open'} · ${lkQ.length} ${isPT()?(lkQ.length===1?'confirmada':'confirmadas'):'confirmed'}`,'');
 const doneTiles=(costs?tile('Value done',eur(cur.value),isPT()?'obras concluídas · sem IVA':'finished jobs · excl. VAT',dl('value')):'')
  +tile(isPT()?'Obras concluídas':'Jobs finished',cur.finished,'',dl('finished'));
 return `<div class="page-head"><div class="grow"><h1>Statistics</h1></div>
  ${costs&&cur.finished?`<button class="btn sm" data-act="statsCsv">${ic('doc',15)} Export CSV</button>`:''}</div>
 ${empty?'':`<h3 class="shead" style="margin-top:4px">Open · today</h3><div class="sgrid shero">${openTiles}</div>
 <h3 class="shead">${isPT()?'Feito no período':'Done in the period'}</h3>`}
 <div style="margin-bottom:12px;max-width:420px">${rangePick('st-per',{from:r.from,to:r.to,presets:rpPresets().filter(p=>ST_PERIODS.some(x=>x[0]===p.k)),active:s.per==='custom'?'':s.per,clearable:false,onPreset:k=>{s.per=k;},onApply:(a,b)=>{if(!a)return;s.per='custom';s.from=a;s.to=b;}})}</div>
 ${empty?`<div class="card"><div class="empty">No jobs yet — the numbers show up as jobs are created, confirmed and finished.</div></div>`:`
 <div class="sgrid shero">${doneTiles}</div>
 ${stBreakdownCard(cur.finishedList,costs)}
 ${stMoreCard(cur,costs)}
 ${stJobsCard(cur.finishedList,costs)}`}
 ${can('data.manage')?`<div class="card" style="margin-top:14px"><div class="row between wrap" style="gap:10px"><div class="grow"><b>Example jobs</b> <span class="pill p-grey nodot">Mock only</span><div class="small muted">${QUOTES.some(q=>q.demo)?`${QUOTES.filter(q=>q.demo).length} example jobs are loaded — they can be removed at any time.`:'Adds about 90 jobs from the last 14 months (finished, aborted, in progress) to try the statistics. Your own jobs are kept.'}</div></div>
  ${QUOTES.some(q=>q.demo)?`<button class="btn sm" data-act="statsDemoOff">Remove example jobs</button>`:`<button class="btn sm" data-act="statsDemo">Load example jobs</button>`}</div></div>`:''}`;}

/* one breakdown, sorted by value (or by number of jobs without costs); top 8 + Others */
function stBreakdownCard(list,costs){const s=stState();const opts=ST_BY.concat(DB.settings.dimensions.filter(d=>d.values.length).map(d=>['dim:'+d.code,dimLabel(d)]));if(!opts.some(o=>o[0]===s.by))s.by=opts[0][0];
 const vend=s.by==='vendor';const rows=topN(stBreakdown(list,s.by),costs?(vend?'cost':'value'):'jobs',-1,8);
 const money=r=>vend?r.cost:r.value;
 return `<div class="card" style="margin-top:14px"><h3>Finished jobs by</h3>
  <div class="chips" style="margin:10px 0" role="tablist" aria-label="Breakdown by">${opts.map(([k,l])=>`<button class="chip ${s.by===k?'on':''}" data-act="statsBy" data-k="${k}">${l}</button>`).join('')}</div>
  ${!rows.length?'<div class="small muted">No finished jobs in this period.</div>':rows.map(r=>`<div class="sum-row${r.other?' faint':''}" style="align-items:flex-start"><span style="min-width:0"><b>${esc(r.k)}</b><div class="tiny faint">${r.jobs} ${isPT()?(r.jobs===1?'obra':'obras'):(r.jobs===1?'job':'jobs')}${costs&&!vend&&r.mReal!=null?' · '+(isPT()?'margem ':'margin ')+pct(r.mReal):''}</div></span>${costs?`<b style="white-space:nowrap">${eur(money(r)||0)}</b>`:''}</div>`).join('')}
  ${vend&&costs?`<div class="tiny faint" style="margin-top:8px">Vendors: cost of their labour lines (who did the work).</div>`:s.by.startsWith('dim:')?`<div class="tiny faint" style="margin-top:8px">A job with several values counts in each of them.</div>`:''}</div>`;}

/* everything else, closed by default */
function stMoreCard(cur,costs){const row=(l,v)=>`<div class="sum-row"><span class="muted">${l}</span><b>${v}</b></div>`;const d=n=>n==null?'—':num1(n)+(isPT()?' dias':' days');
 const reasons=(()=>{const m=new Map();cur.abortedList.forEach(q=>{const rs=q.cancel?.reason||'—',k=ABORT_REASONS.find(o=>rs===o||rs.startsWith(o+' — '))||rs.split(' — ')[0];m.set(k,(m.get(k)||0)+1);});return [...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5);})();
 const col=(h,body)=>`<div><div class="flabel" style="margin-bottom:4px">${h}</div>${body}</div>`;
 return `<details class="card smore" style="margin-top:14px"><summary><b>More numbers</b> <span class="small muted">— jobs, proposals, times${costs?', costs':''}</span></summary>
  <div class="smgrid">
   ${col('Jobs',row('New jobs',cur.created)+row('Jobs confirmed',cur.confirmed)+row('Jobs aborted',cur.aborted)+row('Jobs in progress',cur.ongoing))}
   ${col('Proposals',row('Proposals sent',cur.sent)+row('Proposals rejected',cur.rejected)+row('Versions per job',num1(cur.versions))+row('Days to confirm',num1(cur.toConfirm)))}
   ${col('Times',row('Average duration',d(cur.dur))+row('Finished late',cur.finished?`${cur.late} ${isPT()?'de':'of'} ${cur.finished}`:'—'))}
   ${col('Proposals · acceptance',row('Acceptance rate',cur.rate==null?'—':pct(cur.rate))+row(isPT()?'Confirmadas · perdidas':'Confirmed · lost',`${cur.won} · ${cur.lost}`))}
   ${costs?col('Costs · finished jobs',row('Actual margin',cur.mReal==null?'—':pct(cur.mReal))+row('Planned margin',cur.mPlan==null?'—':pct(cur.mPlan))+row('Actual cost',eur(cur.cost))+row('Planned cost',eur(cur.planned))+row('Cost deviation',cur.finished?(cur.dev>=0?'+':'−')+eur(Math.abs(cur.dev)):'—')+row('Expenses on site',eur(cur.expTotal))):''}
   ${reasons.length?col('Why jobs were aborted',reasons.map(([k,n])=>row(esc(k),n)).join('')):''}
  </div></details>`;}

function stJobsCard(list,costs){const ls=list.slice().sort((a,b)=>b.workDone.localeCompare(a.workDone));if(!ls.length)return '';const P_=pg('stats',ls);
 return `<div class="card" style="margin-top:14px"><div class="row between wrap"><h3>Finished jobs in the period</h3><span class="tiny faint">${ls.length}</span></div>
  <div class="only-d" style="margin-top:8px"><table class="tbl"><thead><tr><th>Finished</th><th>Customer</th><th>Description</th><th>Town</th>${costs?'<th class="r">Value</th><th class="r">Margin</th>':''}</tr></thead><tbody>
   ${P_.items.map(q=>{const n=jobNums(q);return `<tr class="click" data-act="open" data-id="${q.id}" style="cursor:pointer"><td style="white-space:nowrap">${fmtDate(q.workDone)}</td><td class="t">${esc(qCust(q))}<div class="tiny faint">${q.id}</div></td><td>${esc(qLabel(q)||'—')}</td><td>${esc(jobTown(q))}</td>
    ${costs?`<td class="r">${eur(n.value)}</td><td class="r">${pct(n.mReal)}</td>`:''}</tr>`;}).join('')}</tbody></table></div>
  <div class="only-m mlist" style="margin-top:8px">${P_.items.map(q=>{const n=jobNums(q);return `<button class="mcard" data-act="open" data-id="${q.id}"><div class="row between"><b class="ell">${esc(qCust(q))}</b>${costs?`<b>${eur(n.value)}</b>`:''}</div>
   <div class="small muted">${esc([qLabel(q),jobTown(q)].filter(Boolean).join(' · '))} · ${fmtDate(q.workDone)}${costs?' · '+(isPT()?'margem ':'margin ')+pct(n.mReal):''}</div></button>`;}).join('')}</div>${P_.foot}
  ${costs?`<div class="tiny faint" style="margin-top:8px">Planned cost and deviation per job are in the CSV.</div>`:''}</div>`;}

/* CSV of the finished jobs of the period (semicolon, decimal comma — opens straight in Excel in Portugal) */
function statsCsv(){const r=stRange(),list=stMetrics(stQuotes(),r).finishedList.slice().sort((a,b)=>a.workDone.localeCompare(b.workDone));
 const n2=v=>v.toFixed(2).replace('.',','),cell=v=>{const s=String(v??'');return /[;"\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
 const head=isPT()?['Número','Cliente','Descrição','Localidade','Responsável','Início','Fim previsto','Concluída','Valor (sem IVA)','Custo previsto','Custo real','Desvio','Margem prevista %','Margem real %']
  :['Number','Customer','Description','Town','Owner','Start','Planned end','Finished','Value (excl. VAT)','Planned cost','Actual cost','Deviation','Planned margin %','Actual margin %'];
 const rows=list.map(q=>{const n=jobNums(q);return [q.id,qCust(q),q.title||'',jobTown(q),U(q.owner)?.name||'',fmtDate(q.workStart),fmtDate(q.workEnd),fmtDate(q.workDone),n2(n.value),n2(n.planned),n2(n.cost),n2(n.dev),n2(n.mPlan*100),n2(n.mReal*100)];});
 const csv='﻿'+[head,...rows].map(r=>r.map(cell).join(';')).join('\r\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=`estatisticas_${r.from}_${r.to}.csv`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);
 if(typeof audit==='function')audit('export','stats');toast(`${list.length} jobs exported`);}

/* ===== Example jobs for the statistics (mock only) — flagged demo:true so they can be removed ===== */
function demoJobs(){const rnd=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(rnd(a,b+1)),pick=a=>a[Math.floor(Math.random()*a.length)];
 const custs=CUSTOMERS.filter(c=>!c.blocked),types=DB.settings.quoteTypes||[],vends=VENDORS.filter(v=>!v.blocked),priced=RESOURCES.filter(r=>price(r)!=null),unpriced=RESOURCES.filter(r=>price(r)==null);
 if(!custs.length||!vends.length)return toast('Add customers and vendors first');
 const collabs=USERS.filter(u=>u.active&&u.vendor),owner=me().id;
 const reasons=['Client rejected proposal — price','Client rejected proposal — other','Client no longer needs it','No vendors available','Duplicate request'];
 const plan=[];for(let i=0;i<92;i++)plan.push(addDays(TODAY_ISO,-ri(8,430)));plan.sort();
 plan.forEach(created=>{const cu=pick(custs),t=types.length&&Math.random()<.9?pick(types):null;const loc=cu.locations.length?pick(cu.locations):null;
  const site=loc?siteSnap(loc):{loc:null,name:'',address:addrOf(cu.billing)};const ct=cu.contacts.find(x=>x.primary)||cu.contacts[0];const ll=townXY(site.address.city||cu.billing.city);
  const dims=dimMerge(dimCopy(cu.dims||{}),t?t.dims:{});
  const q=Q({id:nextQuoteId(),demo:true,dims,cust:cu.id,customer:custSnap(cu),billTo:billSnap(cu),contact:ct?.id||null,contactInfo:contactSnap(ct),site,title:t?t.name:'Obra',
   description:(t?t.name:'Pequena reparação')+' — exemplo para as estatísticas.',lat:ll.lat,lng:ll.lng,status:'open',since:created,created,owner,cm:owner,margin:pick([.2,.25,.25,.3,.35,.4]),log:[[created,owner,'Example job (mock)']]});
  /* vendors: the ones that share a value with the type of work, else any */
  const want=Object.values(dims).flat();let fit=vends.filter(v=>Object.values(v.dims||{}).flat().some(x=>want.includes(x)));if(!fit.length)fit=vends;
  const nl=ri(1,Math.min(3,fit.length));const used=new Set();
  for(let k=0;k<nl;k++){const pool=fit.filter(x=>!used.has(x.id));if(!pool.length)break;const v=pick(pool);used.add(v.id);
   q.lines.push(Math.random()<.5?lab(uid('L'),v.id,lineDescFor(q,v)||'Mão de obra',ri(1,6),'day',Math.round(rnd(110,220))):lab(uid('L'),v.id,lineDescFor(q,v)||'Empreitada',1,'job',Math.round(rnd(350,2600))));}
  for(let k=ri(0,4);k>0&&priced.length;k--){const r=pick(priced);if(q.lines.some(l=>l.ref===r.id))continue;q.lines.push(res(uid('L'),r.id,r.name,ri(1,12),{priceDate:created}));}
  if(Math.random()<.3&&unpriced.length){const r=pick(unpriced);q.lines.push(res(uid('L'),r.id,r.name,1,{cost:Math.round(rnd(15,60)),priceDate:created}));}
  q.lines.forEach(l=>{l.pmode='pct';l.markup=q.margin;l.sell=null;});
  /* proposals */
  const age=daysBetween(created,TODAY_ISO),nv=Math.random()<.25?2:1;let d=addDays(created,ri(1,7));
  for(let v=1;v<=nv&&d<TODAY_ISO;v++){q.versions.push({v,date:d,by:owner,total:calc(q).prop,sig:proposalSig(q),snap:archiveOf(q),sentTo:{contact:ct?.id,name:ct?.name,email:ct?.email||''}});
   if(v<nv){q.versions[v-1].rejected={date:addDays(d,ri(2,6)),by:owner,reason:'Price',note:''};d=addDays(d,ri(4,9));}}
  const last=q.versions[q.versions.length-1];const after=last?last.date:created;
  const roll=Math.random();
  if(age<40&&roll<.35){q.since=after;}                                                   /* still open */
  else if(roll<.26+(age<40?.35:0)){const ad=addDays(after,ri(3,25));if(ad>=TODAY_ISO){q.since=after;}else{q.cancel={reason:pick(reasons),date:ad};q.status='aborted';q.since=ad;q.log.push([ad,owner,'Aborted: '+q.cancel.reason]);}}
  else{const ap=addDays(after,ri(1,12));if(ap>=TODAY_ISO){q.since=after;}else{
   q.approved={date:ap,by:owner,v:last?last.v:null};const c0=calc(q);q.lockedCost=c0.cost;q.lockedPrice=c0.prop;q.lockedAt=ap;
   q.workStart=addDays(ap,ri(3,25));const len=Math.max(...q.lines.filter(l=>l.kind==='labor').map(l=>l.unit==='day'?l.qty:ri(1,4)),1);q.workEnd=addDays(q.workStart,len-1);
   q.lines.forEach(l=>{if(l.kind==='labor')l.confirmed=true;});q.status='locked';q.since=ap;q.log.push([ap,owner,'Locked — approved']);
   /* expenses on site (the reason the actual cost moves away from the plan) */
   const crew=collabs.filter(u=>q.lines.some(l=>l.ref===u.vendor));const ne=Math.random()<.35?0:ri(1,3);
   for(let k=0;k<ne;k++){const dt=addDays(q.workStart,ri(0,Math.max(0,len-1)));if(dt>TODAY_ISO)continue;const who=(crew.length?pick(crew):collabs.length?pick(collabs):me()).id;
    const r=Math.random()<.7&&RESOURCES.length?pick(RESOURCES):null;const qty=r?ri(1,3):1;const paid=r&&price(r)!=null&&Math.random()<.5?null:Math.max(8,Math.round(rnd(.02,.09)*c0.cost*100)/100);
    const line={id:uid('L'),kind:'resource',ref:r?r.id:null,refName:r?r.name:'',desc:r?r.name:'Others',detail:r?'':pick(['Material extra','Peça de substituição','Estacionamento','Aluguer de andaime']),qty,unit:r?r.unit:'unit',cost:paid!=null?paid/qty:(price(r)??0),priceDate:dt,onSite:true,addedBy:who,addedAt:dt,paid,paidBy:U(who)?.vendor||null,paidByName:V(U(who)?.vendor)?.name||''};if(dt<addDays(TODAY_ISO,-20)&&Math.random()<.85){const pd=addDays(dt,ri(3,15));line.reimb={date:pd<TODAY_ISO?pd:TODAY_ISO,by:owner};}q.lines.push(line);}
   /* finished? */
   const doneOn=addDays(q.workEnd,Math.random()<.3?ri(1,6):0);
   if(doneOn<addDays(TODAY_ISO,-1)){q.workDone=doneOn;q.status='finished';q.since=doneOn;q.lines.filter(l=>l.kind==='labor').forEach(l=>{l.done=doneOn;l.doneBy=l.ref;l.doneByName=l.refName;});q.log.push([doneOn,owner,'Work done']);
    if(daysBetween(doneOn,TODAY_ISO)>60&&Math.random()<.7)q.archived={date:addDays(doneOn,ri(10,40)),by:owner};}}}
  QUOTES.push(q);});
 toast(`${plan.length} example jobs added`);}
function demoJobsOff(){const n=QUOTES.filter(q=>q.demo).length;for(let i=QUOTES.length-1;i>=0;i--)if(QUOTES[i].demo)QUOTES.splice(i,1);toast(`${n} example jobs removed`);}

/* --- actions --- */
Object.assign(A,{
 statsPer:t=>{const s=stState();if(t.dataset.p==='custom'&&s.per!=='custom'){const r=stRange();s.from=r.from;s.to=r.to;}s.per=t.dataset.p;render();},
 statsBy:t=>{const s=stState();s.by=t.dataset.k;render();},
 statsCsv:()=>statsCsv(),
 statsDemo:()=>{demoJobs();render();},
 statsDemoOff:()=>{demoJobsOff();render();},
});
Object.assign(PERM_OF,{statsPer:'stats.view',statsBy:'stats.view',statsCsv:'quotes.costs',statsDemo:'data.manage',statsDemoOff:'data.manage'});
document.addEventListener('change',e=>{const t=e.target;if(!t.dataset||!t.dataset.st||state.view!=='stats')return;const s=stState();if(t.value)s[t.dataset.st]=t.value;render();});

