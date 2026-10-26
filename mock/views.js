/* ===== Screens: home, quotes, quote, directory, customer, settings ===== */
/* Site visit on the job: it only flags whether a visit is needed; the date is set in Routes (planning) */
const visitRoute=q=>q.visit.route&&typeof RT==='function'?RT(q.visit.route):null;
const visitConfirmed=q=>{const r=visitRoute(q);return !!(r&&(r.stops.find(x=>x.q===q.id)||{}).confirm==='confirmed');};
const visitSlot=q=>{const r=visitRoute(q),s=r&&r.stops.find(x=>x.q===q.id);return s&&s.confirm==='confirmed'&&s.slot?' · '+(s.slot==='am'?'Morning':'Afternoon'):'';};
function visitTag(q){const v=q.visit;if(!visitable(q)||!v.date)return '';
 return `<span class="pill p-${visitConfirmed(q)?'green':'grey'} nodot">${ic('pin',11)} Visit ${fmtDate(v.date)}</span>`;}
/* Site visit on the job: the date is set in Routes. Open, Confirmada and In-progress jobs can get visits. */
function visitBlock(q,edit){const v=q.visit,r=visitRoute(q),hist=(q.visits||[]).filter(x=>x.date);
 const histHtml=hist.length?`<div class="tiny faint" style="margin-top:4px">Done: ${hist.map(x=>fmtDate(x.date)).join(' · ')}</div>`:'';
 if(v.date)return `<div style="font-weight:600">${fmtDate(v.date)} · ${visitConfirmed(q)?'confirmed':'to confirm'}${visitSlot(q)}</div>${r?`<button class="link small" data-act="openRoute" data-id="${r.id}">${ic('route',13)} Open route</button>`:''}${histHtml}`;
 if(!visitable(q))return `<div class="muted">${hist.length?'':'—'}</div>${histHtml}`;
 return `<div class="muted">None planned</div>${edit&&can('map.planner')?`<button class="btn sm" style="margin-top:4px" data-act="planVisit" data-id="${q.id}">${ic('route',14)} Plan in Routes</button>`:''}${histHtml}`;}
function hrow(q,extra=''){const a=alertsFor(q),lv=level(a);
 return `<button class="hrow" data-act="open" data-id="${q.id}"><span class="lvdot ${lv}"></span>
  <span style="min-width:0"><div class="row" style="gap:6px"><span class="mono faint">${q.id}</span><span class="t ell">${esc(qCust(q))}</span></div>
   ${qLabel(q)?`<div class="s ell qtype">${esc(qLabel(q))}</div>`:''}<div class="s ell">${esc(qPlace(q))}</div>
   <div class="next one ${lv}" style="margin-top:3px" title="${esc(lv!=='ok'?a[0].msg:nextStep(q))}">${lv!=='ok'?ic('alert',13)+' ':''}<span class="ell">${esc(lv!=='ok'?a[0].msg:nextStep(q))}</span></div>${extra}</span>
  <span style="text-align:right">${statusPill(q,true)}${visitTag(q)?`<div style="margin-top:4px">${visitTag(q)}</div>`:''}<div class="tiny faint rmeta" style="margin-top:6px">${q.workStart?ic('cal',12)+' '+fmtRange(q.workStart,q.workEnd):'No job dates'}${q.owner!==me().id?' · '+esc((U(q.owner)?.name||'—').split(' ')[0]):''}</div></span></button>`;}
const greet=()=>{const h=new Date().getHours();return h<12?'Good morning':h<19?'Good afternoon':'Good evening';};
function gettingStarted(){if(QUOTES.length)return '';
 const steps=[['customers.edit','Add your customers',CUSTOMERS.length,'dir','customers'],['vendors.edit','Add vendors and their specialties',VENDORS.length,'dir','vendors'],['resources.price','Add resources with unit and unit price',RESOURCES.length,'dir','resources'],['quotes.edit','Add the first quote',QUOTES.length,null,null]].filter(x=>can(x[0]));
 if(!steps.length)return '';
 return `<div class="card" style="margin-bottom:16px"><h3>Getting started</h3><div class="small muted" style="margin:4px 0 6px">${CUSTOMERS.length||VENDORS.length||RESOURCES.length?'Almost there — the basics are set up. Add the first quote.':'The database is empty. Set up the basics, then add the first quote.'}</div>
  ${steps.map(([p,l,n,v,t],i)=>`<div class="gs"><span class="gsn ${n?'ok':''}">${n?ic('check',14):i+1}</span><span class="grow">${l}${n?` <span class="tiny faint">· ${n} added</span>`:''}</span>${v?`<button class="btn sm" data-act="goDir" data-t="${t}">Manage</button>`:`<button class="btn sm pri" data-act="quickAdd">${ic('plus',14)} Add quote</button>`}</div>`).join('')}</div>`;}
/* Job-date agenda: the job dates drive everything, so lists are grouped by when the job is */
function agendaKey(q){if(!isActive(q))return 'closed';if(!q.workStart)return 'nodate';const d=daysUntil(q.workStart);return d<=0?'now':d<=7?'week':'later';}
function vHome(){const qs=visibleQuotes().filter(isActive).sort((a,b)=>jobKey(a).localeCompare(jobKey(b))||a.created.localeCompare(b.created));
 const prog=q=>{if(!['ongoing','overdue'].includes(stage(q)))return '';const lb=q.lines.filter(l=>l.kind==='labor');const d=lb.filter(l=>l.done).length;const days=Math.round((D(q.workEnd)-D(q.workStart))/864e5)+1;const t=Math.min(1,Math.max(0,daysSince(q.workStart)/days));
  return `<div class="row" style="margin-top:6px;gap:10px"><div class="bar ${stage(q)==='overdue'?'red':''}" style="max-width:150px"><i style="width:${Math.round(t*100)}%"></i></div><span class="tiny faint">${d}/${lb.length} done</span></div>`;};
 const now=qs.filter(q=>agendaKey(q)==='now'),rest=qs.filter(q=>agendaKey(q)!=='now');
 return `<div class="page-head"><div class="grow"><div class="muted small">${TODAY.toLocaleDateString(LOC(),{weekday:'long',day:'numeric',month:'long'})}</div><h1>${greet()}, ${esc(me().name.split(' ')[0])}</h1><div class="muted small" style="margin-top:4px">${esc(roleNames(me()))} · ${scopeNote()}</div></div></div>
 ${gettingStarted()}
 <section class="panel"><div class="panel-h"><h2>Active quotes <span class="count">${qs.length}</span></h2><button class="link" data-act="goFilter" data-f="active">See all</button></div>
  ${now.length?`<div class="nowblk"><div class="nowh">Today & ongoing <span class="count">${now.length}</span></div>${now.map(q=>hrow(q,prog(q))).join('')}</div>`:''}
  ${rest.map(q=>hrow(q,prog(q))).join('')}${qs.length?'':'<div class="empty" style="margin:14px 16px">Nothing here.</div>'}</section>`;}

/* Quotes list: cards on mobile, list table on desktop */
/* Simple filters: what's still going (default), what needs attention, what's finished. The steps in between don't matter here. */
const FILTERS=[['active','Active quotes'],['attn','Needs attention'],['visit','Site visits'],['finished','Finished quotes'],['all','All quotes']];
const isActive=q=>['open','locked'].includes(q.status);
const matchFilter=(q,f)=>f==='all'?true:f==='visit'?visitable(q)&&!!q.visit.date:f==='attn'?isActive(q)&&level(alertsFor(q))!=='ok':f==='finished'?q.status==='finished':isActive(q);
/* Sorted by job date: next job first; quotes without dates at the end. Finished: most recent first. */
const jobKey=q=>q.workStart||'9999';
function filtered(){if(!FILTERS.some(f=>f[0]===state.filter))state.filter='active';
 let qs=visibleQuotes().filter(q=>matchFilter(q,state.filter));
 const nq=norm(state.q);if(nq)qs=qs.filter(q=>norm([q.id,q.title,qTown(q),qAddr(q),qCust(q),q.billTo?.name,dimsText(q.dims),q.description].join(' ')).includes(nq));
 if(state.filter==='finished')return qs.sort((a,b)=>(b.workDone||b.workEnd||'').localeCompare(a.workDone||a.workEnd||''));
 return qs.sort((a,b)=>jobKey(a).localeCompare(jobKey(b))||(a.workEnd||'').localeCompare(b.workEnd||'')||a.created.localeCompare(b.created));}
const typesHtml=q=>{const s=qSpecs(q);return s.length?s.map(x=>`<span class="pill p-grey nodot">${esc(x)}</span>`).join(' '):'<span class="pill p-amber nodot">No dimensions yet</span>';};
function listHtml(){const all=filtered();if(!all.length)return '<div class="empty">No quotes match.</div>';const P_=pg('quotes',all),qs=P_.items;
 const grouped=state.filter!=='finished';
 const groups=state.filter==='visit'?[['Visit planned',qs.slice().sort((a,b)=>a.visit.date.localeCompare(b.visit.date))]]:grouped?[['Today & ongoing',qs.filter(q=>agendaKey(q)==='now'),'now'],[null,qs.filter(q=>agendaKey(q)!=='now')]].filter(g=>g[1].length):[[null,qs]];
 const nx=(q,a,lv)=>`<span class="next one ${lv}" title="${esc(lv!=='ok'?a[0].msg:nextStep(q))}">${lv!=='ok'?ic('alert',13)+' ':''}<span class="ell">${esc(lv!=='ok'?a[0].msg:nextStep(q))}</span></span>`;
 const dates=q=>q.workStart?fmtRange(q.workStart,q.workEnd):'—';
 return `<div class="mlist only-m">${groups.map(([l,list,g])=>`${l?`<div class="lgrp${g?' '+g:''}">${l} <span class="count">${list.length}</span></div>`:''}${list.map(q=>{const a=alertsFor(q),lv=level(a),c=calc(q);
  return `<button class="mcard lv-${lv}${g?' '+g:''}" data-act="open" data-id="${q.id}"><div class="row between wrap" style="gap:6px"><span class="small" style="font-weight:700">${ic('cal',13)} ${dates(q)}</span>${statusPill(q,true)}</div>
   <div class="t">${esc(qCust(q))}</div>${qLabel(q)?`<div class="small ell qtype">${esc(qLabel(q))}</div>`:''}<div class="small muted ell">${ic('pin',12)} ${esc(qPlace(q))}</div>
   <div style="margin-top:6px">${nx(q,a,lv)}</div>${visitTag(q)?`<div style="margin-top:6px">${visitTag(q)}</div>`:''}
   <div class="row between foot"><span class="mono tiny faint">${q.id}</span><span class="row">${collabOnly()?'':q.lines.length?`<span class="val">${eur(c.prop)}</span>`:'<span class="faint small">not costed</span>'}${q.owner!==me().id?av(q.owner):''}</span></div></button>`;}).join('')}`).join('')}</div>
 <div class="tcard only-d"><table class="ltable"><thead><tr><th>Job dates</th><th>Customer · job</th><th>Status</th><th>Next step</th><th class="r">Value</th><th>Quote</th><th>Owner</th></tr></thead><tbody>
  ${groups.map(([l,list,g])=>`${l?`<tr class="grp${g?' '+g:''}"><td colspan="7">${l} <span class="count">${list.length}</span></td></tr>`:''}${list.map(q=>{const a=alertsFor(q),lv=level(a),c=calc(q);
  return `<tr class="click lv-${lv}${g?' '+g:''}" data-act="open" data-id="${q.id}"><td style="white-space:nowrap;font-weight:600">${dates(q)}</td>
   <td><div class="t">${esc(qCust(q))}</div>${qLabel(q)?`<div class="small ell qtype" style="max-width:300px">${esc(qLabel(q))}</div>`:''}<div class="small muted ell" style="max-width:300px">${esc(qPlace(q))}</div></td>
   <td>${statusPill(q,true)}${visitTag(q)?`<div style="margin-top:4px">${visitTag(q)}</div>`:''}</td><td style="max-width:280px">${nx(q,a,lv)}</td>
   <td class="r val">${collabOnly()?'':q.lines.length?eur(c.prop):'—'}</td><td class="mono small faint">${q.id}</td><td class="small muted" style="white-space:nowrap">${esc((U(q.owner)?.name||'—').split(' ')[0])}</td></tr>`;}).join('')}`).join('')}
 </tbody></table></div>`+P_.foot;}
function vQuotes(){const qs=visibleQuotes();
 const cnt=f=>qs.filter(q=>matchFilter(q,f)).length;
 return `<div class="page-head"><div class="grow"><h1>Quotes</h1><div class="muted small" style="margin-top:4px">${scopeNote()}</div></div>
</div>
 <input type="search" placeholder="Search customer, town, type of work, number…" value="${esc(state.q)}" data-inp="q" style="margin-bottom:10px">
 <div class="chipwrap" style="margin-bottom:14px"><button class="chipnav" data-act="chipsGo" data-d="-1" aria-label="Scroll filters left">${ic('left',16)}</button>
  <div class="chips" id="chips" role="tablist" aria-label="Filter quotes">${FILTERS.map(([k,l])=>`<button class="chip ${state.filter===k?'on':''}" data-act="filter" data-f="${k}" role="tab" aria-selected="${state.filter===k}">${l}<span class="n">${cnt(k)}</span></button>`).join('')}</div>
  <button class="chipnav" data-act="chipsGo" data-d="1" aria-label="Scroll filters right">${ic('right',16)}</button></div>
 <div id="qlist">${listHtml()}</div>`;}

/* Quote detail */
function vQuote(q){if(!q)return '';
 const cu=C(q.cust)||{contacts:[]},ct=contactOf(q),a=alertsFor(q,true),st=stage(q),edit=can('quotes.edit')&&!q.archived;
 const bt=q.billTo||billSnap(cu),diff=!!q.customer&&bt.cust!==q.customer.id,site=q.site,canInfo=edit&&['open','locked'].includes(q.status);
 const idx=FLOW.indexOf(q.status),ps=pstate(q);
 /* actions: the first one is the main action (bottom bar on the phone), the rest go in "More" */
 const A_=[];const add=(act,label,icon,cls,extra='')=>A_.push({act,label,icon,cls,extra});
 const unc=q.lines.filter(l=>l.kind==='labor'&&!l.confirmed&&!l.done).length;
 if(q.status==='open'){
  if(edit)add('lock','Lock — approved','lock','ok');
  if(can('quotes.send'))add('send',q.versions.length?'Send new version':'Send proposal','send','',q.lines.length?'':'disabled');
  if(ps==='waiting'&&edit)add('reject','Client rejected','x','danger');}
 if(q.status==='locked'){
  if(unc&&can('work.manage'))add('confirmAll',`Confirm all vendors (${unc})`,'check','pri');
  if(can('work.manage'))add('markDone','Finish job','check',unc?'':(['ongoing','overdue'].includes(st)?'ok':'pri'));
  if(edit)add('reopen','Unlock to edit','unlock','');}
 if(['finished','aborted'].includes(q.status)&&edit){add('archive','Archive','lock','pri');add('reopen','Reopen','back','');}
 if(q.archived&&me().roles.includes(ADMIN_ROLE))add('unarchive','Unarchive (administrator)','unlock','ghost');
 if(['open','locked'].includes(q.status)&&edit)add('cancelQ','Abort','x','ghost danger');
 const btn=(x,c)=>`<button class="btn ${c??x.cls}" data-act="${x.act}" ${x.extra}>${ic(x.icon,16)} ${x.label}</button>`;
 const pen=(act,label)=>`<button class="pen" data-act="${act}" title="${label}" aria-label="${label}">${ic('edit',14)}</button>`;
 const tabs=[['summary','Summary'],['lines',`Lines${q.lines.length?' · '+q.lines.length:''}`],['vendors','Vendors'],['proposal',`Proposal${q.versions.length?' · '+q.versions.length:''}`],['files',`Attachments${qFiles(q).length?' · '+qFiles(q).length:''}`],['log','History']];
 if(!tabs.some(t=>t[0]===state.tab))state.tab='summary';
 const summary=`<div class="hdr-grid tiles">
    <div><div class="k kpen">Customer ${canInfo?pen('editParties','Change customer / billing'):''}</div><div style="font-weight:600">${esc(qCust(q))}</div><div class="small muted">${q.customer?.no?esc(q.customer.no)+' · ':''}NIF ${q.customer?.nif||'—'}</div>${diff?`<div class="tiny faint" style="margin-top:4px">Billed to ${esc(bt.name)}</div>`:''}</div>
    <div><div class="k">Contact for this job</div>${combo('qcontact',{opts:contactOpts(cu),value:ct?.id,title:'Contact for this job',disabled:!canInfo,onPick:v=>{const x=cu.contacts.find(y=>y.id===v);q.contact=v;q.contactInfo=contactSnap(x);logQ(q,`Contact → ${x.name}`);}})}
     ${ct?`<div class="small muted" style="margin-top:6px">${esc(ct.role||'')}${ct.role?'<br>':''}${[ct.phone?`<a href="tel:${esc(ct.phone)}">${esc(ct.phone)}</a>`:'',ct.email?`<a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a>`:''].filter(Boolean).join(' · ')}</div>`:''}</div>
    <div><div class="k kpen">Location of the work ${canInfo?pen('editSite',addrEmpty(site.address)&&!site.name?'Set location':'Change location'):''}</div>${site.name?`<div style="font-weight:600">${ic('pin',14)} ${esc(site.name)}</div>`:''}<div class="small muted">${addrHtml(site.address,'No location set')}</div></div>
    <div><div class="k kpen">Job dates ${edit&&['open','locked'].includes(q.status)?pen('dates',q.workStart?'Change dates':'Set dates'):''}${q.workStart?`<button class="pen" data-act="jobICS" title="Add to phone calendar" aria-label="Add to phone calendar">${ic('cal',14)}</button>`:''}</div><div style="font-weight:600">${ic('cal',14)} ${fmtRange(q.workStart,q.workEnd)}</div>${q.workDone?`<div class="small" style="color:var(--green)">Finished ${fmtDate(q.workDone)}</div>`:''}</div>
    <div><div class="k kpen">Site visit ${q.visit.date&&edit?`<button class="pen" data-act="visitDone" title="Mark done" aria-label="Mark done">${ic('check',14)}</button>`:''}</div>${visitBlock(q,edit)}</div>
    <div><div class="k">Owner</div><div class="small"><div class="row">${av(q.owner)} ${esc(U(q.owner)?.name||'No owner')}</div><div class="muted" style="margin-top:4px">Added ${fmtDate(q.created)}</div></div></div>
   </div>
   <div class="card" style="margin-top:14px">${(()=>{const de=edit&&q.status==='open',on=de&&state.descEdit===q.id;
    return `<div class="k kpen" style="margin:0">Job description ${de&&!on?pen('descEdit','Edit description'):''}</div>
    ${on?`<label class="f" style="margin-top:10px">Description <span class="faint" style="font-weight:400">(up to ${TITLE_MAX} characters — identifies the job)</span><input type="text" maxlength="${TITLE_MAX}" data-qf="title" value="${esc(q.title||'')}" placeholder="e.g. Bathroom remodelling — 1st floor"></label>
     <label class="f" style="margin-top:10px">Description 2 <span class="faint" style="font-weight:400">(up to ${DESC_MAX} characters — what needs to be done)</span><textarea maxlength="${DESC_MAX}" data-qf="description" placeholder="Describe the work…">${esc(q.description)}</textarea></label>
     <div style="margin-top:12px"><button class="btn sm pri" data-act="descEdit">${ic('check',14)} Done</button></div>`
    :`<div style="margin:6px 0 0;font-weight:600">${esc(q.title||'')||'<span class="faint" style="font-weight:400">No description.</span>'}</div>
     <div class="k" style="margin:12px 0 0">Description 2</div><p style="margin:6px 0 0;white-space:pre-line">${esc(q.description)||'<span class="faint">Nothing yet.</span>'}</p>`}`;})()}
    ${dimsFor().length?`<div class="row between wrap" style="margin-top:14px;gap:8px"><span class="flabel" style="margin:0">Dimensions</span>${can('quotes.edit')&&['open','locked'].includes(q.status)&&(DB.settings.quoteTypes||[]).length?`<span style="min-width:220px">${combo('qtpl',{opts:qtypeOpts().filter(o=>o.v),value:'',placeholder:'Fill in from a template…',title:'Quote template',onPick:x=>applyTemplate(q,x)})}</span>`:''}</div>${dimEditor('q',q.dims,{disabled:!(can('quotes.edit')&&['open','locked'].includes(q.status)),onSet:(d,o,n)=>logQ(q,`Dimension ${d.code}: ${o.length?o.map(x=>dimValName(d.code,x)).join(', '):'none'} → ${n.length?n.map(x=>dimValName(d.code,x)).join(', '):'none'}`)})}
     ${reqsOf(q).length?'':`<div class="tiny faint" style="margin-top:6px">Dimensions are compared with the vendors’ dimensions to suggest vendors.</div>`}`:''}</div>`;
 return `${backBtn('go','data-v="quotes"','Quotes')}
 <div class="card qhead"><div class="qh-top"><div class="grow" style="min-width:0">
   <div class="row wrap" style="gap:6px"><span class="mono faint">${q.id}</span>${statusPill(q)}${q.urgent?'<span class="pill p-red nodot">Urgent</span>':''}${daysSince(q.since)?`<span class="tiny faint">${statusAge(q)}</span>`:''}</div>
   <h1 class="qh-title"><button class="link" style="font:inherit;color:inherit;text-decoration:none" data-act="openCust" data-id="${q.customer?.id||q.cust}">${esc(qCust(q))}</button></h1>
   ${qLabel(q)?`<div class="qtype" style="font-weight:600;margin:-2px 0 2px">${esc(qLabel(q))}</div>`:''}<div class="small"><span class="muted">${ic('pin',13)} ${esc(qPlace(q))}</span>${q.workStart?` <span class="muted">· ${ic('cal',13)} ${fmtRange(q.workStart,q.workEnd)}</span>`:''}</div></div>
  ${(()=>{const c=calc(q),costs=can('quotes.costs');return `<div class="qkpis"><div class="kpi"><span class="kl">${isLocked(q)?ic('lock',11)+' ':''}Value</span><b class="kv">${eur(c.prop)}</b><span class="tiny faint">+ VAT</span></div>
   ${costs?`<div class="kpi"><span class="kl">Margin</span><b class="kv sm">${eur(c.margin)} <span class="tiny faint">${pct(c.pct)}</span></b><span class="tiny faint">cost ${eur(c.cost)}</span>${q.status==='finished'&&typeof jobNums==='function'&&Math.abs(jobNums(q).mPlan-c.pct)>=0.0005?`<span class="tiny faint">planned ${pct(jobNums(q).mPlan)} · cost ${eur(plannedCost(q))}</span>`:''}</div>
   ${priceKpi(q,c)}`:''}</div>`;})()}</div>
  <div class="qh-bot"><div class="msteps">${FLOW.map((k,i)=>`${i?'<span class="sl"></span>':''}<span class="s ${i<idx?'done':i===idx?'cur':''}"><span class="d"></span>${STEP[k]}</span>`).join('')}</div>
   <div class="small muted grow" style="min-width:200px"><b style="color:var(--ink)">Next:</b> ${esc(nextStep(q))}</div>
   <div class="row wrap qh-acts">${A_.map(x=>btn(x)).join('')}</div></div></div>
 ${a.length?`<div class="stack" style="margin-bottom:14px">${a.map(x=>`<div class="banner ${x.lvl}">${ic('alert',18)}<div>${esc(x.msg)}</div></div>`).join('')}</div>`:''}
 ${q.status==='open'&&lastSent(q)?.rejected?`<div class="banner amber" style="margin-bottom:14px">${ic('alert',18)}<div><b>Proposal v${lastSent(q).v} was rejected</b> on ${fmtDate(lastSent(q).rejected.date)} — ${esc(lastSent(q).rejected.reason)}${lastSent(q).rejected.note?` (${esc(lastSent(q).rejected.note)})`:''}. Adjust the lines and send a new version, or abort the quote.</div></div>`:''}
 ${q.status==='aborted'?`<div class="banner grey" style="margin-bottom:14px">${ic('x',18)}<div><b>Aborted</b> · ${esc(q.cancel?.reason||'')}</div></div>`:''}
 ${q.archived?`<div class="banner grey" style="margin-bottom:14px">${ic('lock',18)}<div><b>Archived</b> on ${fmtDate(q.archived.date)} by ${esc(U(q.archived.by)?.name||'—')}. This quote is final — it can’t be reopened or changed.</div></div>`:''}
 <div class="qtabs" role="tablist">${tabs.map(([k,l])=>`<button class="${state.tab===k?'on':''}" data-act="tab" data-t="${k}" role="tab" aria-selected="${state.tab===k}">${l}</button>`).join('')}</div>
 ${state.tab==='summary'?summary:`<div class="card">${state.tab==='lines'?tabLines(q):state.tab==='vendors'?tabVendors(q):state.tab==='proposal'?tabProposal(q):state.tab==='files'?tabFiles(q):tabLog(q)}</div>`}
 ${A_.length?`<div class="qbar-space"></div><div class="qbar">${btn(A_[0],A_[0].cls&&!/ghost|danger/.test(A_[0].cls)?A_[0].cls:'pri')}${A_.length>1?`<button class="btn" data-act="qmore" aria-expanded="${!!state.qmore}">${ic('chev',16)} More</button>`:''}</div>
  ${state.qmore?`<div class="cscrim" data-act="qmore"></div><div class="qsheet" role="menu">${A_.slice(1).map(x=>`<button class="mi ${/danger/.test(x.cls)?'danger':''}" data-act="${x.act}" ${x.extra}>${ic(x.icon,17)} ${x.label}</button>`).join('')}</div>`:''}`:''}`;}
/* Client price editor: markup % on cost, or a fixed price for the whole job. Lines can also have their own price (edit the line). */
const priceEditable=q=>can('quotes.edit')&&can('quotes.costs')&&q.status==='open'&&!q.archived;
/* Price summary at the top of the job — information only. The client price is set line by line (own markup, default from Setup, or a fixed value). */
function priceKpi(q,c){const fx=q.lines.filter(l=>!l.onSite&&l.pmode==='flat').length;
 return `<div class="kpi kprice" title="${esc('The client price is set on each line (markup or fixed value). This is the result for the whole job.')}"><span class="kl">Price rule</span>
  <b class="kv sm">${pct(c.markup)}</b><span class="tiny faint">markup on cost · +${eur(c.prop-c.cost+sum(q.lines.filter(l=>l.onSite),l=>l.qty*lineCost(l)))}${fx?` · ${fx} fixed`:''}</span></div>`;}
function pricingBlock(q,c){const v=calc(q),cc=sum(q.lines.filter(l=>!l.onSite),l=>l.qty*lineCost(l)),fx=q.lines.filter(l=>!l.onSite&&l.pmode==='flat').length;
 return `<div class="row between wrap" style="gap:8px"><div class="k">Client price</div><span class="small"><b>${eur(v.prop)}</b> <span class="faint">+ VAT · cost ${eur(v.cost)} · margin ${pct(v.pct)}</span></span></div>
  <div class="sum-row"><span class="muted">Markup on cost</span><b>${pct(c.markup)}</b></div>
  <div class="sum-row"><span class="muted">Markup value</span><b>${eur(v.prop-cc)}</b></div>
  <div class="tiny faint" style="margin-top:6px"><span>The client price is set on each line: a fixed value or its own markup.</span>${fx?` <span>${fx} line${fx>1?'s have':' has'} a fixed value.</span>`:''}</div>`;}
function summaryCard(q){const c=calc(q),costs=can('quotes.costs'),lockd=isLocked(q),v=q.versions[q.versions.length-1];
 return `<div class="card"><h3>${lockd?`Locked${q.approved?.v?` · approved proposal v${q.approved.v}`:''}`:v&&pstate(q)==='waiting'?`Proposal v${v.v} sent`:v&&pstate(q)==='rejected'?`Proposal v${v.v} rejected`:'Estimate'}</h3><div class="sum-big" style="margin-top:6px">${eur(c.prop)}</div>
  <div class="small muted">${lockd?`Locked — values are locked (or abort the quote).`:q.status==='open'&&v?`Sent ${fmtDate(v.date)}. Lines can still change until the order is locked.${changedSinceSent(q)?' <b style="color:var(--amber)">Changed since it was sent.</b>':''}`:'Resource prices are copied onto each line when it is added.'} + VAT 23%</div>
  ${costs?`<div style="margin-top:12px"><div class="sum-row"><span class="muted">Internal cost</span><b>${eur(c.cost)}</b></div><div class="sum-row"><span class="muted">Margin</span><b>${eur(c.margin)} · ${pct(c.pct)}</b></div>
   ${pricingBlock(q,c)}</div>`
  :`<div class="lock" style="margin-top:12px">${ic('lock',14)} Internal costs hidden for your role</div>`}
  ${q.versions.length?`<div class="k" style="margin-top:14px">Versions</div>${q.versions.slice().reverse().map(x=>`<div class="sum-row" style="border:0;padding:3px 0"><span class="muted">v${x.v} · ${fmtDate(x.date)}</span><b>${eur(x.total||c.prop)}</b></div>`).join('')}`:''}</div>`;}
/* Lines tab: mock/lines2.js (one block per vendor with its resources — D-68, 26-10-2026) */
/* vendor's default unit and cost per unit (D-71) — what a new line will start with; the cost only to who sees costs */
/* short unit word for "€ / dia": the PT rules translate "1 day" → "1 dia", so the "1 " is taken off again */
const unitWord=u=>{if(!u)return '';const t=typeof tr==='function'?tr('1 '+u):'1 '+u;return t.replace(/^1\s+/,'');};
const vRateLine=v=>{const u=v.unit,c=can('quotes.costs')&&v.cost!=null?v.cost:null;if(!u&&c==null)return '';
 const un=esc(unitWord(u));
 return `<div class="small vrate">${c!=null?`<b>${eur2(c)}</b>${u?` <span class="muted">/ ${un}</span>`:''}`:`<span class="muted">${LT('Unit','Unidade')}: ${un}</span>`}</div>`;};
/* Vendors tab of a job: mock/vendfind.js ("On this job" + search with pages — 26-10-2026) */
/* The client document. The real template is still to be defined with the client (open questions below) — for now it shows the job,
   the client, the place and dates, and the total; the lines (and vendors) are NOT listed. */
const PROP_TEMPLATE_Q=['Are the lines listed on the proposal (labour, materials / resource lines), or only a description of the work and the total?','What does the template look like — logo, layout, conditions, validity, payment terms?'];
function propDoc(src,label,date,bt,ct,site,planned){const c=calc(src);
 return `<div class="prop-doc"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><div>${COMPANY().name?`<b style="font-size:18px">${esc(COMPANY().name)}</b><div style="font-size:12px;color:#55524c">${addrHtml(COMPANY().address,'')}</div>`:`<b style="font-size:18px;color:#b7791f">Company name not set</b><div style="font-size:12px;color:#b7791f">Settings › Company information</div>`}<div style="font-size:12px;color:#8a867f;margin-top:4px">${esc(label)} · ${fmtDate(date)}</div></div>
   <div style="text-align:right;font-size:13px"><b>${esc(bt.name)}</b>${bt.nif?'<br>NIF '+esc(bt.nif):''}<br>${addrHtml(bt.address,'')}${ct?'<br><span>Attn.</span> '+esc(ct.name):''}</div></div>
   <div style="margin:16px 0 10px;font-size:14px">${src.title?`<div style="font-weight:700;margin-bottom:4px">${esc(src.title)}</div>`:''}${src.description?`<div style="white-space:pre-line">${esc(src.description)}</div>`:''}<div style="color:#55524c;margin-top:4px"><span>Site: ${esc(addrStr(site.address)||'to be confirmed')}</span> · <span>Planned ${planned}</span></div></div>
   <div class="tpl-q"><b>Template to be defined</b><ul>${PROP_TEMPLATE_Q.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
   <table><tr><td style="padding-top:14px">Subtotal</td><td class="r" style="padding-top:14px">${eur2(c.prop)}</td></tr><tr><td>VAT 23%</td><td class="r">${eur2(c.prop*.23)}</td></tr><tr><td><b>Total</b></td><td class="r"><b>${eur2(c.prop*1.23)}</b></td></tr></table></div>`;}
function tabProposal(q){const v=lastSent(q),ct=contactOf(q);
 const arch=q.versions.length?`<h3 style="margin-bottom:6px">Archive · proposals sent</h3><div class="small muted" style="margin-bottom:8px">A copy of the proposal as it was the moment “Send” was clicked. These never change.</div>
  ${q.versions.slice().reverse().map(x=>`<div class="sum-row" style="align-items:center"><span><b>v${x.v}</b> <span class="muted">· sent ${fmtDate(x.date)} by ${esc((U(x.by)?.name||'').split(' ')[0]||'—')}</span>${x.sentTo?`<div class="tiny faint">${ic('mail',12)} ${esc(x.sentTo.name)} &lt;${esc(x.sentTo.email)}&gt; ${outPill(x.outbox)}</div>`:''}${x.rejected?` <span class="pill p-red nodot">Rejected ${fmtDate(x.rejected.date)} · ${esc(x.rejected.reason)}</span>`:''}</span><span class="row" style="gap:10px"><b>${eur(x.total)}</b>${x.snap?`<button class="btn sm" data-act="viewProposal" data-v="${x.v}">${ic('eye',14)} View</button><button class="btn sm" data-act="pdfDown" data-v="${x.v}" title="Download PDF">${ic('download',14)} PDF</button>`:'<span class="tiny faint">no copy</span>'}</span></div>`).join('')}
  <div style="height:18px"></div>`:'';
 if(!q.lines.length)return arch+'<div class="empty">Add lines to generate the proposal.</div>';
 const nv=noValueLines(q).length;
 return `${arch}${nv&&!isLocked(q)?`<div class="banner amber" style="font-size:13px;margin-bottom:12px">${ic('alert',16)}<div>${LT(`${nv} line${nv>1?'s have':' has'} no client value yet — the total below counts ${nv>1?'them':'it'} as 0 €. Fill ${nv>1?'them':'it'} in on the Lines tab before sending.`,`${nv} linha${nv>1?'s':''} ainda sem valor ao cliente — o total abaixo conta-${nv>1?'as':'a'} como 0 €. Preencha no separador Linhas antes de enviar.`)}</div></div>`:''}<h3 style="margin-bottom:6px">${isLocked(q)?'Approved version':q.status==='open'&&v&&!v.rejected&&!changedSinceSent(q)?`Current version · same as v${v.v}`:q.versions.length?'Current version (not archived until sent)':'Draft proposal'}</h3>
  <div class="small muted" style="margin-bottom:12px">What the client receives. Vendor names and costs are never shown.</div>
  ${propDoc(q,`Proposal ${q.id}${v?'-v'+(changedSinceSent(q)||v.rejected?v.v+1:v.v):' (draft)'}`,v&&!changedSinceSent(q)&&!v.rejected?v.date:TODAY_ISO,q.billTo,ct,q.site,fmtRange(q.workStart,q.workEnd))}`;}
function tabLog(q){
 const li=([dt,u,t])=>`<li><span class="small faint" style="width:52px;flex:none">${fmtDate(dt)}</span>${av(u)}<span>${esc(t)}</span></li>`;
 return `<h3>All changes</h3><ul class="log">${q.log.slice().reverse().map(li).join('')}</ul>`;}

/* Directory */
function vDir(){if(state.dirTab==='resources'&&!can('quotes.costs'))state.dirTab='customers';
 const tabs=[['customers','Customers'],['vendors','Vendors'],...(can('quotes.costs')?[['resources','Resources & prices']]:[])];
 const editP={customers:'customers.edit',vendors:'vendors.edit',resources:'resources.price'}[state.dirTab];
 return `<div class="page-head"><div class="grow"><h1>Directory</h1></div>
  ${state.dirTab==='customers'&&can(editP)?`<button class="btn pri" data-act="newCust">${ic('plus',18)} New customer</button>`:''}${state.dirTab==='vendors'&&can(editP)?`<button class="btn pri" data-act="vendor">${ic('plus',18)} New vendor</button>`:''}${state.dirTab==='resources'&&can(editP)?`<button class="btn pri" data-act="resource">${ic('plus',18)} New resource</button>`:''}</div>
  <div class="seg" style="margin-bottom:10px">${tabs.map(([k,l])=>`<button class="${state.dirTab===k?'on':''}" data-act="dirTab" data-t="${k}">${l}</button>`).join('')}</div>
  <div class="row wrap" style="margin-bottom:10px;gap:12px"><input type="search" placeholder="Search…" value="${esc(state.q)}" data-inp="dq" style="flex:1;min-width:200px">
   ${state.dirTab!=='resources'?`<label class="check small" style="white-space:nowrap"><input type="checkbox" data-chg="dirBlocked" ${state.dirBlocked?'checked':''}> Show blocked (${(state.dirTab==='customers'?CUSTOMERS:VENDORS).filter(x=>x.blocked).length})</label>`:''}</div>
  ${can(editP)?'':`<div class="lock" style="margin-bottom:12px">${ic('lock',14)} Read-only · editing is limited to ${esc(rolesWith(editP))}</div>`}
  <div id="dlist">${dirList()}</div>`;}
const dirList=()=>state.dirTab==='customers'?dirCustomers():state.dirTab==='vendors'?dirVendors():dirResources();
function dirCustomers(){const nq=norm(state.q);let cs=CUSTOMERS.filter(c=>(state.dirBlocked||!c.blocked)).filter(c=>!nq||norm([c.no,c.name,c.nif,c.phone||'',c.email||'',addrStr(c.billing),dimsText(c.dims),...c.locations.map(l=>l.name+' '+addrStr(l.address)),...c.contacts.map(x=>x.name)].join(' ')).includes(nq));
 const P_=pg('cust',cs);cs=P_.items;
 const main=c=>c.contacts.find(x=>x.primary)||c.contacts[0]||{name:'—',phone:''};
 if(!cs.length)return '<div class="empty">No customers yet.</div>';
 return `<div class="mlist only-m">${cs.map(c=>`<button class="mcard" data-act="openCust" data-id="${c.id}"><div class="row between"><span><span class="mono faint">${esc(c.no)}</span> <b>${esc(c.name)}</b>${c.blocked?' <span class="pill p-grey nodot">Blocked</span>':''}</span></div>
   <div class="tagline" style="margin-top:6px">${cTypePill(c)}</div>
   <div class="small muted" style="margin-top:4px">${esc(main(c).name)} · ${esc(main(c).phone)}${c.contacts.length>1?` · +${c.contacts.length-1} more`:''}<br>${esc(c.billing.city||'—')} · NIF ${c.nif||'—'}</div></button>`).join('')}</div>
 <div class="tcard only-d"><table class="ltable"><thead><tr><th>No.</th><th>Customer</th><th>Type</th><th>NIF</th><th>Main contact</th><th>Phone</th><th>City</th></tr></thead><tbody>
  ${cs.map(c=>`<tr class="click" data-act="openCust" data-id="${c.id}"><td class="mono">${esc(c.no)}</td><td class="t">${esc(c.name)}${c.blocked?' <span class="pill p-grey nodot">Blocked</span>':''}</td><td>${cTypePill(c)}</td><td class="mono">${c.nif||'—'}</td><td>${esc(main(c).name)}<div class="tiny faint">${esc(main(c).role||'')}</div></td><td class="small" style="white-space:nowrap">${esc(main(c).phone)}</td><td>${esc(c.billing.city||'—')}</td></tr>`).join('')}</tbody></table></div>`+P_.foot;}
/* Customer type: Particular (orange) / Empresa (violet) — same colours as the vendor type */
const cTypePill=c=>`<span class="pill ${c.type==='company'?'p-violet':'p-accent'} nodot">${c.type==='company'?'Company':'Private'}</span>`;
/* Vendor pills — the same everywhere (phone, desktop, quote): type (person orange / company violet), app user (blue), dimension values (grey) */
const vTypePill=v=>`<span class="pill ${v.type==='person'?'p-accent':'p-violet'} nodot">${v.type==='person'?'Person':'Company'}</span>`;
const vUserPill=v=>USERS.some(u=>u.vendor===v.id&&u.active)?`<span class="pill p-blue nodot">${ic('user',11)} App user</span>`:'';
const vDimPills=v=>vSpecs(v).map(t=>`<span class="pill p-grey nodot">${esc(t)}</span>`).join('');
function dirVendors(){const nq=norm(state.q);let vs=VENDORS.filter(v=>(state.dirBlocked||!v.blocked)).filter(v=>!nq||norm([v.no,v.name,v.nif,v.phone,dimsText(v.dims),addrStr(v.address),vSpecs(v).join(' '),v.type].join(' ')).includes(nq));
 const P_=pg('vend',vs);vs=P_.items;
 if(!vs.length)return '<div class="empty">No vendors yet.</div>';
 return `<div class="mlist only-m">${vs.map(v=>{const n=nowStatus(v.id);return `<button class="mcard" data-act="vendor" data-id="${v.id}"><div class="row between"><span><span class="mono faint">${esc(v.no)}</span> <b>${esc(v.name)}</b>${v.blocked?' <span class="pill p-grey nodot">Blocked</span>':''}</span><span class="pill p-${n.c}">${esc(n.t)}</span></div>
   <div class="tagline" style="margin-top:8px">${vTypePill(v)}${vUserPill(v)}${vDimPills(v)}</div>
</button>`}).join('')}</div>
 <div class="tcard only-d"><table class="ltable"><thead><tr><th>No.</th><th>Vendor</th><th>Type</th><th>Dimensions</th><th>Availability</th></tr></thead><tbody>
  ${vs.map(v=>{const n=nowStatus(v.id);return `<tr class="click" data-act="vendor" data-id="${v.id}"><td class="mono">${esc(v.no)}</td><td class="t">${esc(v.name)}${v.blocked?' <span class="pill p-grey nodot">Blocked</span>':''}<div class="tiny faint">${esc(v.phone||'')}${v.address.city?' · '+esc(v.address.city):''}</div></td><td><div class="tagline" style="margin:0">${vTypePill(v)}${vUserPill(v)}</div></td><td><div class="tagline" style="margin:0">${vDimPills(v)||'<span class="faint">—</span>'}</div></td>
   <td><span class="pill p-${n.c}">${esc(n.t)}</span>${n.sub?`<div class="tiny faint" style="margin-top:4px">${esc(n.sub)}</div>`:''}</td></tr>`}).join('')}</tbody></table></div>`+P_.foot;}
function spark(h){const vs=h.map(x=>x[1]);const mn=Math.min(...vs),mx=Math.max(...vs);
 if(vs.length<2)return `<svg width="100" height="28"><line x1="0" y1="14" x2="100" y2="14" stroke="var(--ink-3)" stroke-width="2"/></svg>`;
 return `<svg width="100" height="28" aria-hidden="true"><polyline points="${vs.map((v,i)=>`${(i/(vs.length-1)*100).toFixed(1)},${(mx===mn?14:25-(v-mn)/(mx-mn)*22).toFixed(1)}`).join(' ')}" fill="none" stroke="var(--accent)" stroke-width="2"/></svg>`;}
function dirResources(){const ed=can('resources.price'),nq=norm(state.q);
 let rs=RESOURCES.filter(r=>!nq||norm(r.no+' '+r.name+' '+r.unit).includes(nq)).slice().sort((x,y)=>x.name.localeCompare(y.name));
 const P_=pg('res',rs);rs=P_.items;
 const used=r=>QUOTES.filter(q=>q.status!=='aborted'&&q.lines.some(l=>l.ref===r.id)).length;
 return `<div class="card"><div class="small muted">Anything we buy or spend that isn’t a vendor’s labor — fuel, materials, rentals. Each has a unit (from the Units list in Settings) and, optionally, a unit price with dated history (leave it empty for things like fuel, whose cost is entered on each line). A quote line copies the unit and price when it is added — changing a resource later never changes a quote that already exists.</div>
 ${rs.length?`<div class="res-row res-head"><div>Resource</div><div>Unit</div><div class="r">Unit price</div><div></div></div>`:''}
 ${rs.map(r=>{const h=r.hist||[],p=price(r),ch=p!=null?p/h[0][1]-1:0,n=used(r);
  return `<div class="res-row"><div><b>${esc(r.name)}</b><div class="small muted"><span class="mono faint">${esc(r.no)} · </span><span class="only-sm">${p!=null?eur2(p)+' per '+esc(r.unit):'No price'} · </span><span>${p!=null?'updated '+fmtDate(priceOn(r)):'price entered on each line'}</span>${n?` · <span>on ${n} quote${n>1?'s':''}</span>`:''}</div></div>
   <div class="hide-sm"><span class="pill p-grey nodot">${esc(r.unit)}</span></div>
   <div class="val hide-sm" style="text-align:right">${p!=null?eur2(p):'<span class="faint" style="font-weight:400">No price</span>'}</div>
   <div style="text-align:right">${ed?`<button class="btn sm" data-act="resource" data-id="${r.id}">${ic('edit',15)} Edit</button>`:''}</div></div>`}).join('')||'<div class="empty">No resources match.</div>'}</div>`+P_.foot;}

/* Customer page — edit opens full view on mobile */
function vCustomer(){if(state.custEdit)return custEdit();
 const c=C(state.custId),ed=can('customers.edit'),qs=QUOTES.filter(q=>q.cust===c.id);
 return `${backBtn('go','data-v="dir"','Directory')}
 <div class="page-head"><div class="grow"><div class="mono faint small">${esc(c.no)}</div><h1>${esc(c.name)}${c.anonymized?' <span class="pill p-grey nodot" style="vertical-align:middle">Anonymised</span>':''}${c.blocked?' <span class="pill p-grey" style="vertical-align:middle">Blocked</span>':''}</h1><div class="tagline" style="margin:4px 0 0">${cTypePill(c)}</div><div class="muted small" style="margin-top:4px">NIF ${c.nif||'—'}${c.billing.city?' · '+esc(c.billing.city):''}</div>${c.phone||c.email?`<div class="small" style="margin-top:4px">${c.phone?`<a href="tel:${esc(c.phone)}">${ic('phone',13)} ${esc(c.phone)}</a>`:''}${c.phone&&c.email?' · ':''}${c.email?`<a href="mailto:${esc(c.email)}">${ic('mail',13)} ${esc(c.email)}</a>`:''}</div>`:''}</div>
  ${c.anonymized?`<span class="small muted">${ic('lock',14)} ${isPT()?'Anonimizado a':'Anonymised'} ${fmtDate(c.anonymized.date)} ${isPT()?'por':'by'} ${esc(U(c.anonymized.by)?.name||'—')}</span>`:`<span class="row wrap" style="gap:8px">${typeof anonBtn==='function'?anonBtn(c):''}${ed?`<span class="row wrap" style="gap:8px">${custInUse(c)?'':`<button class="btn ghost danger" data-act="delCust">${ic('trash',16)} Delete</button>`}<button class="btn" data-act="blockCust">${ic(c.blocked?'unlock':'lock',16)} ${c.blocked?'Unblock':'Block'}</button><button class="btn" data-act="editCust">${ic('edit',16)} Edit</button></span>`:`<span class="lock">${ic('lock',14)} Only ${esc(rolesWith('customers.edit'))} can edit</span>`}</span>`}</div>
 <div class="cust-grid"><div class="stack">
   <div class="card"><h3>Billing address</h3><div style="margin-top:8px">${addrHtml(c.billing,'<span class="faint">No billing address</span>')}</div>${c.notes?`<div class="small muted" style="margin-top:8px">${esc(c.notes)}</div>`:''}</div>
   ${DB.settings.dimensions.length?`<div class="card"><h3>Dimensions</h3><div style="margin-top:8px">${dimPills(c.dims)}</div><div class="tiny faint" style="margin-top:6px">Copied onto every new quote for this customer.</div></div>`:''}
   <div class="card"><h3>Locations · ${c.locations.length}</h3><div class="small muted" style="margin:4px 0 6px">Places where work is done. Optional — a quote can use one, type another address, or leave it empty.</div>
    ${c.locations.length?c.locations.map(l=>`<div class="contact"><span class="avatar" style="width:36px;height:36px">${ic('pin',16)}</span><div class="grow"><b>${esc(l.name||'Location')}</b><div class="small muted">${addrHtml(l.address)}</div>${l.notes?`<div class="small" style="margin-top:3px">${esc(l.notes)}</div>`:''}</div></div>`).join(''):'<div class="small faint" style="margin-top:6px">No locations yet.</div>'}</div>
   <div class="card"><h3>Contacts · ${c.contacts.length}</h3>
    ${c.contacts.map(x=>`<div class="contact"><span class="avatar" style="width:36px;height:36px;font-size:13px">${initials(x.name)}</span><div class="grow"><div class="row"><b>${esc(x.name)}</b>${x.primary?'<span class="pill p-accent nodot">Main</span>':''}${x.self?'<span class="pill p-grey nodot">The customer</span>':''}</div><div class="small muted">${esc(x.role||'')}</div>
     <div class="small" style="margin-top:4px">${[x.phone?`<a href="tel:${esc(x.phone)}">${esc(x.phone)}</a>`:'',x.email?`<a href="mailto:${esc(x.email)}">${esc(x.email)}</a>`:''].filter(Boolean).join(' · ')||'<span class="faint">No phone or email</span>'}</div></div></div>`).join('')}</div></div>
  <div class="panel"><div class="panel-h"><h2>Quotes <span class="count">${qs.length}</span></h2></div>${qs.length?qs.map(q=>hrow(q)).join(''):'<div class="empty" style="margin:16px">No quotes yet.</div>'}</div></div>`;}
/* Address block used everywhere: Address, Address 2, Postal code, City, Country. path = where the address lives inside state.form */
function addrForm(path,a,o={}){a=addrOf(a);const d=o.disabled?'disabled':'';
 return `<div class="addr stack" style="gap:10px"><label class="f">Address<input type="text" data-af="${path}:line1" value="${esc(a.line1)}" ${d} autocomplete="off"></label>
  <label class="f">Address 2<input type="text" data-af="${path}:line2" value="${esc(a.line2)}" ${d} autocomplete="off"></label>
  <div class="grid2"><label class="f">Postal code<input type="text" data-af="${path}:postal" value="${esc(a.postal)}" ${d} placeholder="0000-000" autocomplete="off"></label><label class="f">City<input type="text" list="city-list" data-af="${path}:city" value="${esc(a.city)}" ${d} autocomplete="off"></label></div>
  <label class="f">Country<input type="text" data-af="${path}:country" value="${esc(a.country)}" ${d} autocomplete="off"></label></div>`;}
function custEdit(){const f=state.form,isNew=state.custId==='__new';
 return `<div class="fullpage"><div class="fp-bar"><button class="btn" data-act="custCancel">Cancel</button><h1 class="grow ell" style="text-align:center">${isNew?'New customer':'Edit customer'}</h1><button class="btn pri" data-act="custSave">Save</button></div>
 ${formErrHtml()}<div class="cust-grid"><div class="card stack"><h3>Company / person${isNew?` <span class="tiny faint mono">· ${peekNo('customer')}</span>`:''}</h3>
   <div class="seg">${[['person','Private'],['company','Company']].map(([k,l])=>`<button class="${(f.type||'person')===k?'on':''}" data-act="fset" data-k="type" data-v="${k}">${l}</button>`).join('')}</div>
   <label class="f">Name<input type="text" data-f="name" value="${esc(f.name)}"></label>
   <label class="f">NIF<input type="text" data-f="nif" value="${esc(f.nif)}" placeholder="9 digits"></label>
   <div class="grid2"><label class="f">Phone<input type="tel" data-f="phone" value="${esc(f.phone||'')}"></label><label class="f">Email<input type="email" data-f="email" value="${esc(f.email||'')}"></label></div>
   <div><span class="flabel">Billing address <span class="faint" style="font-weight:400">(optional)</span></span>${addrForm('billing',f.billing)}</div>
   <label class="f">Notes<textarea data-f="notes">${esc(f.notes)}</textarea></label></div>
  <div class="stack"><div class="card"><div class="row between"><h3>Contacts · ${f.contacts.length}</h3><span class="row wrap" style="gap:6px">${f.contacts.some(x=>x.self)?'':`<button class="btn sm" data-act="selfContact">${ic('user',15)} Use customer details</button>`}<button class="btn sm" data-act="addContact">${ic('plus',15)} Add contact</button></span></div>
   <div style="margin-top:12px">${f.contacts.map((x,i)=>`<div class="cedit"><div class="row between"><label class="check"><input type="radio" name="primary" data-act="primary" data-i="${i}" ${x.primary?'checked':''}> Main contact</label>
     ${f.contacts.length>1?`<button class="btn sm ghost danger" data-act="rmContact" data-i="${i}">${ic('trash',14)} Remove</button>`:''}</div>
    ${x.self?`<div class="selfct"><div class="row wrap" style="gap:6px"><span class="pill p-accent nodot">The customer</span><span class="small muted">Name, phone and email come from the customer record — change them there.</span></div>
     <div class="small" style="margin-top:6px"><b data-mirror="name">${esc(f.name||'—')}</b> · <span data-mirror="phone">${esc(f.phone||'—')}</span> · <span data-mirror="email">${esc(f.email||'—')}</span></div>
     <div class="grid2" style="margin-top:8px"><label class="f">Role<input type="text" data-cf="${i}:role" value="${esc(x.role||'')}" placeholder="e.g. Owner, Manager"></label><div style="align-self:end"><button class="btn sm ghost" data-act="unlinkSelf" data-i="${i}">${ic('edit',14)} Use different details</button></div></div></div>`:`<div class="grid2" style="margin-top:10px"><label class="f">Name<input type="text" data-cf="${i}:name" value="${esc(x.name)}"></label><label class="f">Role<input type="text" data-cf="${i}:role" value="${esc(x.role||'')}" placeholder="e.g. Facilities, Accounts"></label>
     <label class="f">Phone<input type="tel" data-cf="${i}:phone" value="${esc(x.phone||'')}"></label><label class="f">Email<input type="email" data-cf="${i}:email" value="${esc(x.email||'')}"></label></div>`}</div>`).join('')}</div>
   <div class="tiny faint" style="margin-top:10px">The first contact is the customer itself (its own phone and email); add more people as needed. Each quote picks which contact it’s for.</div></div>
   ${DB.settings.dimensions.length?`<div class="card"><h3>Dimensions</h3><div class="small muted" style="margin:4px 0 8px">New quotes for this customer start with these values.</div>${dimEditor('cust',f.dims)}</div>`:''}
   <div class="card"><div class="row between"><h3>Locations · ${f.locations.length}</h3><button class="btn sm" data-act="addLocation">${ic('plus',15)} Add location</button></div>
    <div class="small muted" style="margin:4px 0 8px">Where work is done for this customer. Optional — a job can also use a one-off address, which stays only on that job.</div>
    ${f.locations.map((l,i)=>`<div class="cedit"><div class="row between"><b class="small">Location ${i+1}</b><button class="btn sm ghost danger" data-act="rmLocation" data-i="${i}">${ic('trash',14)} Remove</button></div>
     <label class="f" style="margin-top:8px">Name<input type="text" data-af="locations.${i}:name" value="${esc(l.name)}" placeholder="e.g. Warehouse, Hotel Cascais"></label>
     <div style="margin-top:10px">${addrForm('locations.'+i+'.address',l.address)}</div>
     <label class="f" style="margin-top:10px">Notes (access, parking…)<input type="text" data-af="locations.${i}:notes" value="${esc(l.notes||'')}"></label></div>`).join('')||'<div class="small faint">No locations.</div>'}</div></div></div></div>`;}

/* Settings */
function vSettings(){const mine=visibleQuotes().filter(q=>q.owner===me().id||can('quotes.viewWork')&&can('quotes.viewPipeline')&&can('alerts.rules'));const reds=mine.filter(q=>level(alertsFor(q))==='red');const n=state.notif;const sla=DB.settings.sla;
 /* grouped into tabs (25-10-2026): My account · Company & people · Alerts & lists · Data & system — a tab shows only if the person can see something in it */
 const T={
  me:{l:'My account',ic:'user',a:[`
  <div class="card"><h3>My notifications</h3>
   <label class="toggle"><span>In-app alerts &amp; red block<div class="tiny faint">Always on</div></span><input type="checkbox" checked disabled></label>
   <label class="toggle"><span>Daily email digest · 08:00</span><input type="checkbox" data-chg="notif" data-k="digest" ${n.digest?'checked':''}></label>
   <label class="toggle"><span>Instant email when something turns red</span><input type="checkbox" data-chg="notif" data-k="instant" ${n.instant?'checked':''}></label>
   <label class="toggle"><span>Weekly summary · Monday</span><input type="checkbox" data-chg="notif" data-k="weekly" ${n.weekly?'checked':''}></label></div>`],b:[`<div class="email"><div class="eh">${ic('mail',15)} <b>Raposo Solutions</b> · tomorrow 08:00<br><span class="muted">Subject: ${reds.length} item${reds.length===1?'':'s'} need${reds.length===1?'s':''} you today</span></div>
   <div class="eb">Bom dia ${esc(me().name.split(' ')[0])},<br><br>${reds.length?reds.map(q=>`<div style="padding:8px 0;border-top:1px solid var(--line)"><b style="color:var(--red)">● ${q.id}</b> ${esc(qCust(q))} · ${esc(qPlace(q))}<div class="small muted">${esc(alertsFor(q).find(a=>a.lvl==='red').msg)}</div></div>`).join(''):'Nothing overdue.'}</div></div>`]},
  company:{l:'Company & people',ic:'dir',a:[companyCard()],b:[`${can('users.manage')?`<div class="card"><h3>Users & roles</h3><div class="small muted" style="margin:6px 0 10px">${USERS.length} user${USERS.length===1?'':'s'} · ${ROLES.length} roles. Add people, create roles and choose what each role can do.</div><button class="btn sm" data-act="go" data-v="users">${ic('shield',15)} Open users & roles</button></div>`:''}`]},
  work:{l:'Alerts & lists',ic:'bell',a:[`${can('alerts.rules')?`<div class="card"><h3>Alert rules · days in status</h3><div class="small muted" style="margin:4px 0 8px">Amber = heads-up in the app. Red = red block, email to the owner, escalated after 2 days red.</div>
   <div class="scroll-x"><table class="tbl"><thead><tr><th>Status</th><th class="c">Amber</th><th class="c">Red</th></tr></thead><tbody>
    ${[['open','Open','blue'],['waiting','Waiting on client','accent']].map(([k,l,c])=>`<tr><td><span class="pill p-${c}">${l}</span></td>${[0,1].map(i=>`<td class="c"><input type="number" min="1" value="${sla[k][i]}" data-chg="sla" data-s="${k}" data-i="${i}" ${can('alerts.rules')?'':'disabled'}></td>`).join('')}</tr>`).join('')}
   </tbody></table></div>
   <div style="margin-top:14px;font-weight:600;font-size:14px">Job date close, order not locked yet</div><div class="small muted" style="margin:2px 0 8px">For open quotes with job dates set but not locked yet — so nobody forgets to record the client’s answer.</div>
   <div class="row wrap" style="gap:14px"><label class="small">Amber, days before start <input type="number" min="1" value="${DB.settings.workAlert.amber}" data-chg="workAlert" data-i="amber" ${can('alerts.rules')?'':'disabled'} style="width:72px;margin-left:6px"></label>
    <label class="small">Red, days before start <input type="number" min="0" value="${DB.settings.workAlert.red}" data-chg="workAlert" data-i="red" ${can('alerts.rules')?'':'disabled'} style="width:72px;margin-left:6px"></label></div>
   <div class="small muted" style="margin-top:12px">Always on: visit date passed without report · vendor already booked on the work dates (a heads-up only — a vendor can do several jobs a day) · vendor not confirmed ≤7 days before start · work past end date · postponed date reached.</div></div>`:''}`],b:[can('setup.edit')?setupCard():'']},
  system:{l:'Data & system',ic:'shield',a:[can('data.manage')?dataCard():''],b:[can('data.manage')||can('quotes.send')?outboxCard():'',typeof auditCard==='function'?auditCard():'']}};
 const keys=Object.keys(T).filter(k=>[...T[k].a,...T[k].b].some(x=>x&&x.trim()));
 if(!keys.includes(state.setTab))state.setTab=keys[0];const t=T[state.setTab];
 return `<div class="page-head"><div class="grow"><h1>Settings</h1><div class="muted small" style="margin-top:4px">Signed in as ${esc(me().name)} · ${esc(roleNames(me()))}</div></div></div>
 ${keys.length>1?`<div class="seg settabs">${keys.map(k=>`<button class="${state.setTab===k?'on':''}" data-act="setTab" data-t="${k}">${ic(T[k].ic,15)} ${T[k].l}</button>`).join('')}</div>`:''}
 <div class="home-grid" style="margin-top:0"><div class="stack">${t.a.join('')}</div><div class="stack">${t.b.join('')}</div></div>`;}
function companyCard(){const c=COMPANY(),ed=can('setup.edit');
 return `<div class="card"><div class="row between" style="gap:8px"><h3>Company information</h3>${ed?`<button class="btn sm" data-act="company">${ic('edit',15)} Edit</button>`:''}</div>
  <div class="small muted" style="margin:4px 0 8px">Printed at the top of every proposal.</div>
  ${c.name?`<b>${esc(c.name)}</b><div class="small">${addrHtml(c.address)}</div>`:`<div class="banner amber" style="font-size:13px">${ic('alert',16)}<div>No company name yet — proposals go out without it.${ed?'':' Ask '+esc(rolesWith('setup.edit'))+'.'}</div></div>`}</div>`;}
function setupCard(){
 return `<div class="card"><h3>Setup</h3><div class="small muted" style="margin:4px 0 10px">Lists that other screens use to fill things in automatically.</div>
  <div class="sum-row"><span><b>Number series</b><div class="tiny faint">Numbers for customers, vendors, resources and quotes</div></span><button class="btn sm" data-act="goSetup" data-t="series">Manage</button></div>
  <div class="sum-row"><span><b>Dimensions</b><div class="tiny faint">Tags for quotes, customers and vendors</div></span><button class="btn sm" data-act="goSetup" data-t="dims">Manage</button></div>
  <div class="sum-row"><span><b>Quote templates</b><div class="tiny faint">Ready-made sets of dimensions for new quotes</div></span><button class="btn sm" data-act="goSetup" data-t="types">Manage</button></div>
  <div class="sum-row"><span><b>Units of measure</b><div class="tiny faint">Used by resources and quote lines</div></span><button class="btn sm" data-act="goSetup" data-t="units">Manage</button></div></div>`;}
function lineState(ser,l){if(l.closed&&l.closed<=TODAY_ISO)return ['Closed '+fmtDate(l.closed),'grey'];
 const act=ser.lines.filter(x=>x.start<=TODAY_ISO&&lineOpen(x)).sort((a,b)=>b.start.localeCompare(a.start))[0];
 if(l.start>TODAY_ISO)return ['Starts '+fmtDate(l.start),'blue'];return act===l?['In use','green']:['Open','grey'];}
/* Setup screen: tabs Number series | Units of measure */
function vSetup(){const ed=can('setup.edit');if(state.setupTab==='price')state.setupTab='series';const t=state.setupTab;
 return `${backBtn('go','data-v="settings"','Settings')}
 <div class="page-head"><div class="grow"><h1>Setup</h1>${ed?'':`<div class="muted small" style="margin-top:4px">Read-only · editing is limited to ${esc(rolesWith('setup.edit'))}</div>`}</div>
  ${ed?(t==='series'?`<button class="btn pri" data-act="newSeries">${ic('plus',18)} New series</button>`:t==='dims'?`<button class="btn pri" data-act="newDim">${ic('plus',18)} New dimension</button>`:t==='types'?`<button class="btn pri" data-act="newQType">${ic('plus',18)} New quote template</button>`:t==='units'?`<button class="btn pri" data-act="unit">${ic('plus',18)} New unit</button>`:''):''}</div>
 <div class="seg" style="margin-bottom:14px">${[['series','Number series'],['dims','Dimensions'],['types','Quote templates'],['units','Units of measure']].map(([k,l])=>`<button class="${t===k?'on':''}" data-act="setupTab" data-t="${k}">${l}</button>`).join('')}</div>
 ${t==='series'?seriesTable(ed):t==='dims'?dimsList(ed):t==='types'?qtypesList(ed):unitsList(ed)}`;}
function seriesTable(ed){const all=DB.settings.numberSeries;const sopts=all.map(x=>({v:x.code,l:x.code,sub:x.description}));
 return `<div class="card" style="margin-bottom:16px"><h3>Series used by each record type</h3><div class="small muted" style="margin:4px 0 6px">Every new customer, vendor, resource and quote gets its number automatically from the series chosen here.</div>
  ${SERIES_KINDS.map(([k,l])=>`<div class="sum-row" style="align-items:center;gap:12px;flex-wrap:wrap"><span style="min-width:96px">${l}</span><span class="grow" style="max-width:260px">${combo('sf-'+k,{opts:sopts,value:DB.settings.seriesFor[k],title:l+' series',disabled:!ed,placeholder:'Pick a series…',onPick:v=>{DB.settings.seriesFor[k]=v;}})}</span><span class="small muted">Next: <b class="mono" style="color:var(--ink)">${esc(peekNo(k))}</b></span></div>`).join('')}</div>
 <div class="tcard"><div class="scroll-x" style="margin:0;padding:0"><table class="ltable"><thead><tr><th>Series</th><th>Description</th><th>Used by</th><th>Line in use</th><th class="r">Lines</th></tr></thead><tbody>
  ${all.map(x=>{const act=x.lines.filter(l=>l.start<=TODAY_ISO&&lineOpen(l)).sort((a,b)=>b.start.localeCompare(a.start))[0];
   return `<tr class="click" data-act="openSeries" data-code="${esc(x.code)}"><td class="mono t">${esc(x.code)}</td><td>${esc(x.description||'')}</td><td class="small">${seriesUse(x.code).join(', ')||'<span class="faint">—</span>'}</td><td class="mono small">${act?esc(act.from)+' – '+esc(act.to):'<span class="faint">none</span>'}</td><td class="r">${x.lines.length}</td></tr>`;}).join('')||'<tr><td colspan="5"><div class="empty">No series yet.</div></td></tr>'}</tbody></table></div></div>
 <div class="tiny faint" style="margin-top:8px">Open a series to see and add its lines (start date + number range).</div>`;}
function vSeriesDetail(){const ser=DB.settings.numberSeries.find(x=>x.code===state.seriesCode);if(!ser){state.view='setup';return vSetup();}const ed=can('setup.edit');
 return `${backBtn('goSetup','data-t="series"','Number series')}
 <div class="page-head"><div class="grow"><h1 class="mono">${esc(ser.code)}</h1><div class="muted small" style="margin-top:4px">${esc(ser.description||'')}${ser.description?' · ':''}${seriesUse(ser.code).length?'used by '+seriesUse(ser.code).join(', '):'not used by any record type'}</div></div>
  ${ed?`<span class="row" style="gap:8px">${!seriesUse(ser.code).length&&!ser.lines.some(l=>l.last)?`<button class="btn ghost danger" data-act="delSeries" data-code="${esc(ser.code)}">${ic('trash',16)} Delete series</button>`:''}<button class="btn" data-act="editSeries" data-code="${esc(ser.code)}">${ic('edit',16)} Edit</button><button class="btn pri" data-act="addSeriesLine" data-code="${esc(ser.code)}">${ic('plus',18)} Add line</button></span>`:''}</div>
 <div class="small muted" style="margin-bottom:10px">Each line has a starting date and a number range. The line with the latest starting date that has arrived is used. Adding a line closes the previous one on its starting date. A line in use can be closed by hand; a line that has never been used can be deleted. A series can be deleted when no record type uses it and none of its numbers were used.</div>
 <div class="tcard"><div class="scroll-x" style="margin:0;padding:0"><table class="ltable"><thead><tr><th>Starting date</th><th>Starting no.</th><th>Ending no.</th><th>Last no. used</th><th class="r">Left</th><th>Status</th>${ed?'<th></th>':''}</tr></thead><tbody>
  ${ser.lines.slice().sort((a,b)=>b.start.localeCompare(a.start)).map(l=>{const f=parseNo(l.from),t=parseNo(l.to),lu=l.last?parseNo(l.last):null;const left=f&&t?t.n-(lu?lu.n:f.n-1):'';const [stx,c]=lineState(ser,l);
   return `<tr><td>${fmtDate(l.start)}</td><td class="mono">${esc(l.from)}</td><td class="mono">${esc(l.to)}</td><td class="mono">${esc(l.last||'—')}</td><td class="r">${left!==''?left.toLocaleString(LOC()):''}</td><td><span class="pill p-${c}">${esc(stx)}</span></td>${ed?`<td style="text-align:right;white-space:nowrap">${lineActions(ser,l)}</td>`:''}</tr>`;}).join('')}</tbody></table></div></div>`;}
function lineActions(ser,l){const b=[];const closedNow=l.closed&&l.closed<=TODAY_ISO;const newest=ser.lines.every(x=>x===l||x.start<l.start);
 if(!closedNow)b.push(`<button class="btn sm" data-act="closeLine" data-code="${esc(ser.code)}" data-id="${l.id}">${ic('lock',13)} Close</button>`);
 else if(newest)b.push(`<button class="btn sm" data-act="reopenLine" data-code="${esc(ser.code)}" data-id="${l.id}">Reopen</button>`);
 if(!l.last)b.push(`<button class="btn sm ghost danger" data-act="delLine" data-code="${esc(ser.code)}" data-id="${l.id}" aria-label="Delete line">${ic('trash',13)} Delete</button>`);
 return `<span class="row" style="gap:6px;justify-content:flex-end">${b.join('')}</span>`;}
function dimsList(ed){const ds=DB.settings.dimensions;
 return `<div class="small muted" style="margin-bottom:10px">Dimensions are free tags: customers, vendors, quotes and quote templates can have any of them, with one or more values each. On a quote they are compared with the vendors’ dimensions to suggest vendors and warn when something isn’t covered.</div>
 <div class="tcard"><div class="scroll-x" style="margin:0;padding:0"><table class="ltable"><thead><tr><th>Dimension</th><th>Name</th><th>Values</th></tr></thead><tbody>
  ${ds.map(d=>`<tr class="click" data-act="openDim" data-code="${esc(d.code)}"><td class="mono t">${esc(d.code)}</td><td>${esc(d.name||'')}</td><td class="small">${d.values.map(v=>esc(v.name||v.code)).join(', ')||'<span class="faint">no values yet</span>'}</td></tr>`).join('')||'<tr><td colspan="3"><div class="empty">No dimensions yet.</div></td></tr>'}</tbody></table></div></div>
 <div class="tiny faint" style="margin-top:8px">Open a dimension to see and manage its values.</div>`;}
function qtypesList(ed){const ts=DB.settings.quoteTypes||[];
 return `<div class="small muted" style="margin-bottom:10px">A quote template is a ready-made set of dimensions. Picking it when creating a quote (or “Fill in from a template” on the quote) adds those dimensions to the quote and gives an empty Description the template’s name. The quote doesn’t keep the template — only the dimensions, which can still be changed.</div>
 <div class="tcard"><div class="scroll-x" style="margin:0;padding:0"><table class="ltable"><thead><tr><th>Code</th><th>Name</th><th>Fills in</th></tr></thead><tbody>
  ${ts.map(t=>`<tr class="${ed?'click':''}" ${ed?`data-act="editQType" data-code="${esc(t.code)}"`:''}><td class="mono t">${esc(t.code)}</td><td>${esc(t.name||'')}</td><td>${dimPills(t.dims,'<span class="faint small">nothing yet</span>')}</td></tr>`).join('')||'<tr><td colspan="3"><div class="empty">No quote templates yet.</div></td></tr>'}</tbody></table></div></div>
 ${ed&&ts.length?'<div class="tiny faint" style="margin-top:8px">Click a quote template to change or remove it.</div>':''}`;}
function vDimDetail(){const d=dimOf(state.dimCode);if(!d){state.view='setup';state.setupTab='dims';return vSetup();}const ed=can('setup.edit');
 return `${backBtn('goSetup','data-t="dims"','Dimensions')}
 <div class="page-head"><div class="grow"><h1 class="mono">${esc(d.code)}</h1><div class="muted small" style="margin-top:4px">${esc(d.name||'')}${d.name?' · ':''}${d.values.length} value${d.values.length===1?'':'s'}</div></div>
  ${ed?`<span class="row" style="gap:8px"><button class="btn" data-act="editDim" data-code="${esc(d.code)}">${ic('edit',16)} Edit</button><button class="btn pri" data-act="newDimValue" data-code="${esc(d.code)}">${ic('plus',18)} Add value</button></span>`:''}</div>
 <div class="tcard"><div class="scroll-x" style="margin:0;padding:0"><table class="ltable"><thead><tr><th>Value</th><th>Name</th></tr></thead><tbody>
  ${d.values.map(v=>{return `<tr class="${ed?'click':''}" ${ed?`data-act="editDimValue" data-code="${esc(d.code)}" data-v="${esc(v.code)}"`:''}><td class="mono t">${esc(v.code)}</td><td>${esc(v.name||'')}</td></tr>`;}).join('')||'<tr><td colspan="2"><div class="empty">No values yet — add the first one.</div></td></tr>'}</tbody></table></div></div>${ed&&d.values.length?'<div class="tiny faint" style="margin-top:8px">Click a value to rename or remove it.</div>':''}`;}
/* Dimensions on a record: a list of rows — choose the dimension, then one or more values. A dimension appears once. dims is edited in place. */
const DIMREG={};
/* Dimensions editor: one row per dimension — its name, the chosen values as chips (× removes one), "+ value" opens the picker.
   "+ Dimension" opens the list of dimensions not used yet; picking one adds it and opens its values straight away. */
function dimEditor(prefix,dims,o={}){const ds=DB.settings.dimensions;DIMREG[prefix]={dims,onSet:o.onSet};
 if(!ds.length)return `<div class="small faint">No dimensions defined yet — add them in Settings → Setup → Dimensions.</div>`;
 const rows=Object.keys(dims).filter(k=>ds.some(d=>d.code===k));const free=ds.filter(d=>!(d.code in dims));const ed=!o.disabled;
 const setVals=(d,k,v)=>{const old=[...dvals(dims,k)];dims[k]=[...v];if(o.onSet&&old.join()!==v.join())o.onSet(d,old,[...v]);};
 const vname=(d,c)=>{const x=d.values.find(v=>v.code===c);return x?(x.name||x.code):c;};
 const html=rows.map(k=>{const d=dimOf(k),vs=dvals(dims,k),id='dmv-'+prefix+'-'+k;
  COMBO[id]={opts:d.values.map(v=>({v:v.code,l:v.name||v.code,sub:v.name?v.code:''})),value:vs,multi:true,title:(d.name||d.code)+' · values',onPick:v=>setVals(d,k,v)};
  return `<div class="dimrow2"><div class="dname">${esc(d.name||d.code)}</div>
   <div class="dvals">${vs.map(v=>`<span class="vchip">${ed?`<button type="button" class="vtxt" data-act="comboOpen" data-id="${id}">${esc(vname(d,v))}</button>`:esc(vname(d,v))}${ed?`<button type="button" data-act="dimValRm" data-p="${prefix}" data-k="${esc(k)}" data-v="${esc(v)}" aria-label="Remove ${esc(vname(d,v))}">${ic('x',12)}</button>`:''}</span>`).join('')}
    ${ed?`<button type="button" class="vadd" data-act="comboOpen" data-id="${id}">${ic('plus',13)} ${vs.length?'Value':'Choose values'}</button>`:vs.length?'':'<span class="faint small">—</span>'}</div>
   ${ed?`<button type="button" class="iconbtn drm" data-act="dimRm" data-p="${prefix}" data-k="${esc(k)}" aria-label="Remove dimension" title="Remove dimension">${ic('trash',14)}</button>`:''}</div>`;}).join('');
 let add='';if(ed&&free.length){const id='dmn-'+prefix;
  COMBO[id]={opts:free.map(d=>({v:d.code,l:d.name||d.code,sub:d.code})),value:'',title:'Add dimension',onPick:v=>{dims[v]=[];setTimeout(()=>{const el=document.querySelector(`[data-id="dmv-${prefix}-${v}"]`);if(el)A.comboOpen(el);},0);}};
  add=`<button type="button" class="btn sm" data-act="comboOpen" data-id="${id}">${ic('plus',14)} Add dimension</button>`;}
 return `<div class="dimlist">${rows.length?html:'<div class="small faint">No dimensions yet.</div>'}${add?`<div>${add}</div>`:''}</div>`;}
function unitsList(ed){const us=DB.settings.units;
 return `<div class="small muted" style="margin-bottom:10px">The list resources choose their unit from. A quote line keeps a copy of the unit it was added with.</div>
 <div class="tcard"><div class="scroll-x" style="margin:0;padding:0"><table class="ltable"><thead><tr><th>Code</th><th>Name</th></tr></thead><tbody>
  ${us.map(u=>`<tr class="${ed?'click':''}" ${ed?`data-act="unit" data-code="${esc(u.code)}"`:''}><td><span class="pill p-grey nodot">${esc(u.code)}</span></td><td>${esc(u.name||'')}</td></tr>`).join('')||'<tr><td colspan="2"><div class="empty">No units yet.</div></td></tr>'}</tbody></table></div></div>${ed?'<div class="tiny faint" style="margin-top:8px">Click a unit to rename or remove it.</div>':''}`;}
function dataCard(){const src={browser:'the copy saved in this browser',file:'data/db.json',builtin:'the built-in empty database (data/db.json could not be read)'}[DB_SOURCE];
 const cnt=[['customers',CUSTOMERS],['vendors',VENDORS],['resources',RESOURCES],['quotes',QUOTES],['users',USERS],['roles',ROLES]].map(([k,a])=>`${a.length} ${k}`).join(' · ');
 return `<div class="card"><h3>Data file (JSON)</h3>
  <div class="small muted" style="margin:6px 0 4px">For now all data lives in one JSON file — easy to open, edit and show. Changes are saved in this browser as you work; download the file to keep or share them.</div>
  <div class="small" style="margin:8px 0">Using <b>${src}</b>${DB.meta.updated?` · last change ${fmtWhen(DB.meta.updated)}`:''}</div>
  <div class="tiny faint">${cnt}</div>
  <div class="row wrap" style="margin-top:12px"><button class="btn sm" data-act="exportDB">${ic('download',15)} Download db.json</button>
   <label class="btn sm" style="cursor:pointer">${ic('upload',15)} Load a JSON file<input type="file" accept=".json,application/json" data-chg="importDB" hidden></label>
   <button class="btn sm ghost" data-act="reloadFile">Reload from data/db.json</button></div>
  <div class="tiny faint" style="margin-top:8px">To make a change permanent for everyone, replace <b>data/db.json</b> in the app folder with the downloaded file.</div></div>`;}

/* Alerts box: always visible. Collapsed it sticks under the header on every screen; open (default on Home) it sits at the top
   of the page, and a compact copy sticks under the header once it has scrolled out of view. */
function alertBar(){const qs=visibleQuotes().filter(q=>['open','locked'].includes(q.status));
 const items=qs.map(q=>({q,a:alertsFor(q)})).filter(x=>x.a.length).map(x=>({...x,lv:level(x.a)})).sort((a,b)=>(a.lv==='red'?0:1)-(b.lv==='red'?0:1)||(a.q.workStart||'9').localeCompare(b.q.workStart||'9'));
 if(!items.length)return '';
 const reds=items.filter(x=>x.lv==='red'),amb=items.length-reds.length,open=!!state.abar,top=items[0],cl=reds.length?'red':'amber';
 const head=reds.length?`${reds.length} job${reds.length>1?'s':''} need${reds.length>1?'':'s'} attention`:`${amb} heads-up${amb>1?'s':''}`;
 const hd=(o,act)=>`<button class="abar-h" data-act="${act}" aria-expanded="${o}">${ic('alert',20)}<b>${head}</b>${reds.length&&amb?`<span class="abar-n">+${amb} heads-up${amb>1?'s':''}</span>`:''}
   ${o?'':`<span class="abar-first ell">${esc(top.q.id)} · ${esc(qCust(top.q))} — ${esc(top.a.find(x=>x.lvl===top.lv).msg)}</span>`}<span class="abar-c">${ic(o?'x':'chev',16)}</span></button>`;
 return `<div class="amini-wrap"><div class="abox ${cl} amini" id="amini">${hd(false,'abarOpenTop')}</div></div>
 <div class="abox ${cl} ${open?'open':''}" id="abox" role="alert">${hd(open,'abarToggle')}
  ${open?`<div class="abar-list">${items.map(x=>`<button class="abar-item ${x.lv}" data-act="open" data-id="${x.q.id}"><span class="grow" style="min-width:0"><span class="row" style="gap:6px"><b class="ell">${esc(qCust(x.q))}</b><span class="tiny faint ell">${esc(qPlace(x.q))} · ${esc(x.q.id)}</span></span><span class="abar-msg">${x.a.filter(m=>m.lvl===x.lv).map(m=>`<span>${esc(m.msg)}</span>`).join('<br>')}</span></span>${ic('right',16)}</button>`).join('')}
</div>`:''}</div>`;}
function alertWatch(){const b=document.getElementById('abox'),m=document.getElementById('amini');if(!b||!m)return;
 if(!b.classList.contains('open')){m.classList.remove('show');return;}
 if(window._aio)window._aio.disconnect();
 window._aio=new IntersectionObserver(([e])=>m.classList.toggle('show',!e.isIntersecting),{rootMargin:'-60px 0px 0px 0px'});window._aio.observe(b);}

/* Collaborator view of a job: where, when, who to call — and the resources they used. No values, no other lines. */
/* Expenses screen: the person adds what they spent on a job (resource lines on site) and sees what they already added.
   Editable until the job is archived; archived jobs stay visible, read-only. */
/* the person's own requests still waiting or rejected (D-72) — approved ones are job lines */
const myClaims=qid=>CLAIMS().filter(c=>c.q===qid&&c.addedBy===me().id&&c.status!=='approved');
const claimPill=c=>c.status==='pending'?`<span class="pill p-blue nodot">${ic('clock',11)} ${LT('Awaiting approval','Por aprovar')}</span>`:`<span class="pill p-red nodot">${LT('Rejected','Rejeitada')} ${fmtDate(c.review?.date)}</span>${c.review?.reason?`<div class="small" style="color:var(--red);margin-top:3px">${esc(c.review.reason)}</div>`:''}`;
/* can the person still change it? a request while pending; a job line only if they approve expenses (not after it is paid) */
const myExpEditable=l=>l.status?l.status==='pending':(!l.reimb&&expDirect());
/* My expenses (revised 26-10-2026): a summary on top (awaiting approval · to receive · rejected), one compact card per job
   (customer + description · place, a "+" to add on that job) and one line per expense: what (the "something else" text, not "Others"),
   date · quantity · receipt, the amount and ONE status. Tap an expense to change it while it can still change; remove is inside. */
const myExpTitle=l=>l.ref?l.desc:(l.detail||l.desc);
function myExpState(l){if(l.status==='pending')return ['blue',LT('Awaiting approval','Por aprovar')];
 if(l.status==='rejected')return ['red',LT('Rejected','Rejeitada')];
 if(expByCo(l))return ['grey',LT('Paid by the company','Paga pela empresa')];
 if(l.reimb)return ['green',(l.paidBy===me().vendor?LT('Paid to you','Paga a si'):LT('Paid back','Devolvida'))+' '+fmtDate(l.reimb.date)];
 return ['amber',l.paidBy===me().vendor?LT('To receive','Por receber'):LT('To pay','Por pagar')];}
function vExpenses(){const jobs=expJobs();
 const mine=QUOTES.filter(q=>!q.archived).map(q=>({q,ls:[...q.lines.filter(l=>l.onSite&&l.addedBy===me().id),...myClaims(q.id)]})).filter(x=>x.ls.length)
  .sort((a,b)=>Math.max(...b.ls.map(l=>+D(l.addedAt)))-Math.max(...a.ls.map(l=>+D(l.addedAt))));
 const all=mine.flatMap(x=>x.ls),amt=l=>l.paid!=null?l.paid:l.qty*lineCost(l);
 const pend=all.filter(l=>l.status==='pending'),rec=all.filter(l=>!l.status&&!l.reimb&&l.paidBy&&l.paidBy===me().vendor),rej=all.filter(l=>l.status==='rejected');
 const stat=(c,label,val)=>`<div class="exstat"><span class="exdot p-${c}"></span><span class="small muted">${label}</span><b>${val}</b></div>`;
 return `<div class="page-head"><div class="grow"><h1>${LT('My expenses','As minhas despesas')}</h1><div class="muted small" style="margin-top:4px">${LT('What you paid on the jobs. The company pays you back once approved.','O que pagou nas obras. Depois de aprovado, a empresa devolve-lhe o dinheiro.')}</div></div>
</div>
 ${jobs.length?`<button class="btn pri expnew" data-act="expAdd">${ic('plus',18)} ${LT('New expense','Nova despesa')}</button>`:''}
 ${all.length?`<div class="exstats">${stat('blue',LT('Awaiting approval','Por aprovar'),pend.length?`${pend.length} · ${eur2(sum(pend,amt))}`:'0')}${me().vendor?stat('amber',LT('To receive','Por receber'),eur2(sum(rec,amt))):''}${rej.length?stat('red',LT('Rejected','Rejeitadas'),rej.length):''}</div>`:''}
 ${!jobs.length&&!mine.length?`<div class="card"><div class="empty">${LT('No jobs open for expenses yet. They appear here once they are confirmed and you work on them.','Ainda não há obras abertas a despesas. Aparecem aqui quando estiverem confirmadas e trabalhar nelas.')}</div></div>`:''}
 ${jobs.length&&!mine.length?`<div class="card"><div class="empty">${LT('You haven’t added any expenses yet.','Ainda não lançou despesas.')}</div></div>`:''}
 ${mine.map(({q,ls})=>{const open=expCanJob(q),sub=[qLabel(q),qPlace(q)].filter(Boolean).join(' · ');
  return `<div class="card expcard"><div class="exhead"><div style="min-width:0"><b class="ell" style="display:block">${esc(qCust(q))}</b>${sub?`<div class="small muted ell">${esc(sub)}</div>`:''}</div>
    ${open?`<button class="iconbtn" data-act="expAddJob" data-id="${q.id}" title="${esc(LT('Add an expense to this job','Adicionar despesa a esta obra'))}" aria-label="${esc(LT('Add an expense to this job','Adicionar despesa a esta obra'))}">${ic('plus',18)}</button>`:''}</div>
   ${ls.slice().sort((a,b)=>(b.addedAt||'').localeCompare(a.addedAt||'')).map(l=>{const ed=open&&myExpEditable(l),[c,t]=myExpState(l),note=l.ref&&l.detail?l.detail:'';
    const meta=[fmtDate(l.addedAt),`${l.qty} ${lineUnit(l)}`,l.paidBy&&l.paidBy!==me().vendor?LT(`paid by ${expPayer(l)}`,`pago por ${expPayer(l)}`):''].filter(Boolean).join(' · ');
    return `<div class="exrow2${ed?' ed':''}"${ed?` data-act="expEdit" data-q="${q.id}" data-l="${l.id}" role="button" tabindex="0" aria-label="${esc(LT('Change expense','Alterar despesa'))}"`:''}>
     <div class="grow" style="min-width:0"><div class="ext">${esc(myExpTitle(l))}</div>${note?`<div class="small">${esc(note)}</div>`:''}
      <div class="small muted">${esc(meta)}${l.receipt&&fileOf(l.receipt)?` · <button class="link small" data-act="rcpt" data-id="${l.receipt}">${ic('receipt',12)} ${LT('Receipt','Recibo')}</button>`:''}</div>
      ${l.status==='rejected'&&l.review?.reason?`<div class="small" style="color:var(--red);margin-top:2px">${esc(l.review.reason)}</div>`:''}</div>
     <div class="exr"><b>${eur2(amt(l))}</b><span class="pill p-${c} nodot">${esc(t)}</span></div>${ed?`<span class="exchev">${ic('right',16)}</span>`:''}</div>`;}).join('')}</div>`;}).join('')}`;}
function vQuoteCollab(q){if(!q||!collabCan(q))return `${backBtn('go','data-v="quotes"','Quotes')}<div class="empty">This job is not open for expenses (only approved jobs you work on, until the job is archived).</div>`;
 const ct=contactOf(q),mine=[...q.lines.filter(l=>l.kind==='resource'&&l.addedBy===me().id),...myClaims(q.id)];
 return `${backBtn('go','data-v="quotes"','Quotes')}
 <div class="card qhead"><div class="row wrap" style="gap:6px"><span class="mono faint">${q.id}</span>${statusPill(q,true)}</div>
  <h1 class="qh-title">${esc(qCust(q))}</h1><div class="small"><span class="muted">${ic('pin',13)} ${esc(qPlace(q))} · ${ic('cal',13)} ${fmtRange(q.workStart,q.workEnd)}</span></div>
  <div class="hdr-grid" style="margin-top:12px"><div><div class="k">Location of the work</div><div class="small">${addrHtml(q.site.address,'No location set')}</div></div>
   <div><div class="k">Contact for this job</div><div class="small">${ct?`${esc(ct.name)}<br><a href="tel:${esc(ct.phone)}">${esc(ct.phone)}</a>`:'—'}</div></div>
   <div><div class="k">What needs to be done</div><div class="small">${q.title?`<b>${esc(q.title)}</b><br>`:''}<span style="white-space:pre-line">${esc(q.description)||'—'}</span></div></div></div></div>
 ${typeof collabFiles==='function'?collabFiles(q):''}
 <div class="card"><div class="row between"><h3>My expenses on this job</h3><button class="btn pri sm" data-act="collabAdd">${ic('plus',15)} Add expense</button></div>
  <div class="tiny faint" style="margin-top:4px">Only the resources you added are shown here.</div>
  ${mine.length?mine.map(l=>`<div class="sum-row" style="align-items:center"><span><b>${esc(l.desc)}</b><div class="tiny faint">${esc(lineName(l))} · ${fmtDate(l.addedAt)}</div>${l.status?`<div style="margin-top:4px">${claimPill(l)}</div>`:''}</span><span class="row" style="gap:8px"><b>${l.qty} ${esc(lineUnit(l))}</b>${myExpEditable(l)?`<button class="iconbtn" style="width:32px;height:32px" data-act="collabEdit" data-l="${l.id}" aria-label="Edit line">${ic('edit',15)}</button><button class="iconbtn" style="width:32px;height:32px" data-act="collabRm" data-l="${l.id}" aria-label="Remove line">${ic('trash',15)}</button>`:''}</span></div>`).join(''):'<div class="empty" style="margin-top:10px">Nothing added yet.</div>'}</div>`;}

/* Outbox (buffer table of emails to send) */
const OUT_ST={pending:['Waiting','amber'],sent:['Sent','green'],failed:['Failed','red']};
const outPill=id=>{const o=OUTBOX.find(x=>x.id===id);if(!o)return '';const s=OUT_ST[o.status];return `<span class="pill p-${s[1]} nodot">${s[0]}</span>`;};
function outboxCard(){const rows=OUTBOX.slice().reverse().slice(0,12);const pend=OUTBOX.filter(o=>o.status==='pending').length;
 return `<div class="card"><div class="row between"><h3>Outbox · emails to send</h3>${pend?`<span class="pill p-amber nodot">${pend} waiting</span>`:''}</div>
  <div class="small muted" style="margin:6px 0 10px">Sending a proposal writes the email here; a background routine sends it and records the result, so nobody waits for the email service. In this mock the routine runs when you press the button.</div>
  ${rows.length?rows.map(o=>`<div class="sum-row" style="align-items:center"><span style="min-width:0"><b class="mono small">${esc(o.attachment.ref)}</b> <span class="small muted">→ ${esc(o.to.email)}</span><div class="tiny faint">${new Date(o.createdAt).toLocaleString(LOC(),{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'})} · ${esc(U(o.createdBy)?.name||'—')}${o.attempts?` · attempts ${o.attempts}`:''}${o.error?` · ${esc(o.error)}`:''}</div></span>
   <span class="row" style="gap:6px">${outPill(o.id)}${o.status==='failed'?`<button class="btn sm" data-act="retryOut" data-id="${o.id}">Retry</button>`:''}</span></div>`).join(''):'<div class="small faint">Nothing sent yet.</div>'}
  ${can('data.manage')?`<button class="btn sm" style="margin-top:10px" data-act="processOutbox">${ic('send',14)} Run the sending routine</button>`:''}</div>`;}
