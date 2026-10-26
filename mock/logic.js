/* ===== State, money, availability, alerts, combobox, shell ===== */
const state={dimPend:{},setupTab:'series',seriesCode:null,dimCode:null,user:null,viewAs:null,menu:false,loginErr:'',view:'home',qid:null,tab:'summary',dirTab:'customers',filter:'active',q:'',modal:null,form:{},combo:null,toast:null,custId:null,custEdit:false,
 map:{mode:'plan',kinds:{open:true,scheduled:true,ongoing:true},per:3,sel:[],ask:null,date:addDays(TODAY_ISO,1),sug:null,rid:null,edit:null},notif:{digest:true,instant:true,weekly:false},rec:false};
/* Who is using the app. ("View as" was removed on 25-10-2026; state.viewAs is only set for a moment by scopeNoteFor.) */
const realMe=()=>U(state.user);
const me=()=>U(state.viewAs||state.user)||{id:null,name:'',roles:[]};
const userPerms=u=>{const set=new Set();(u?.roles||[]).forEach(r=>(RL(r)?.perms||[]).forEach(p=>set.add(p)));return set;};
const can=p=>userPerms(me()).has(p);
const canReal=p=>userPerms(realMe()).has(p);
const roleNames=u=>(u?.roles||[]).map(r=>RL(r)?.name).filter(Boolean).join(' · ')||'No role';
const rolesWith=p=>ROLES.filter(r=>r.perms.includes(p)).map(r=>r.name).join(', ')||'nobody';

/* Money */
/* Lines keep their own unit and unit cost — changing a resource or vendor later never changes a quote already built */
const lineCost=l=>l.cost??0;
const lineUnit=l=>l.unit||(l.kind==='labor'?V(l.ref)?.unit:R(l.ref)?.unit)||'';
const lineName=l=>l.refName||(l.kind==='labor'?V(l.ref)?.name:R(l.ref)?.name)||'—';
const vName=(id,snap)=>snap||V(id)?.name||'—';
/* Lines added on site by a collaborator (onSite) are internal costs of the job: they count in cost and margin, not in the client price */
/* Client price (all linked — change a line or the job and every total follows):
   - Job: markup % on cost (priceMode 'markup', q.margin) or a fixed price for the whole job (priceMode 'total', q.priceTotal, excl. VAT).
   - Line (optional): its own price — l.pmode 'pct' (own markup l.markup) or 'flat' (fixed value l.sell for the line).
   - Lines without their own price follow the job: markup → cost × (1 + markup); fixed total → what is left of the total after the
     lines with their own price, split in proportion to cost. */
/* Sub-lines (D-68, 26-10-2026): resource lines grouped under a labor line (l.parentLine = the parent's id). They only have a cost —
   the client price is the parent's, for the whole group: parent with own markup → each sub-line's cost × (1 + the parent's markup);
   parent with a fixed value → the value is for the group, so sub-lines add 0 (what changes is the margin). */
function linePrices(q){const ls=q.lines||[],out=ls.map(()=>0),auto=[];let fixed=0;const lc=l=>l.qty*lineCost(l);
 const byId={};ls.forEach(l=>{if(l.id)byId[l.id]=l;});
 ls.forEach((l,i)=>{if(l.onSite)return;
  const p=l.parentLine?byId[l.parentLine]:null;
  if(p){if(p.pmode==='pct'){out[i]=lc(l)*(1+(+p.markup||0));fixed+=out[i];}else if(p.pmode!=='flat')auto.push(i);return;}
  if(l.pmode==='flat'){out[i]=+l.sell||0;fixed+=out[i];}else if(l.pmode==='pct'){out[i]=lc(l)*(1+(+l.markup||0));fixed+=out[i];}else auto.push(i);});
 if(q.priceMode==='total'){const rest=(+q.priceTotal||0)-fixed,base=sum(auto,i=>lc(ls[i]));auto.forEach(i=>out[i]=base>0?rest*lc(ls[i])/base:rest/auto.length);}
 else auto.forEach(i=>out[i]=lc(ls[i])*(1+(+q.margin||0)));
 return out;}
const linePrice=(q,l)=>linePrices(q)[q.lines.indexOf(l)]||0;
/* Sub-lines of a labor line, and the group's cost / client price (line + sub-lines) — always calculated, never stored */
const subLines=(q,l)=>(q.lines||[]).filter(x=>x.parentLine&&x.parentLine===l.id);
const groupCost=(q,l)=>l.qty*lineCost(l)+sum(subLines(q,l),x=>x.qty*lineCost(x));
const groupPrice=(q,l)=>{const pr=linePrices(q);return (pr[q.lines.indexOf(l)]||0)+sum(subLines(q,l),x=>pr[q.lines.indexOf(x)]||0);};
/* Fixed value set when the group cost was lower: the margin went down since (warn, never block) */
const groupCostUp=(q,l)=>l.pmode==='flat'&&l.sell!=null&&l.sell!==''&&l.sellCost!=null?Math.max(0,groupCost(q,l)-l.sellCost):0;
/* lines with "Fixed value" chosen but no client value yet (allowed — filled in later; counts 0 until then) */
const noValue=l=>!l.onSite&&l.pmode==='flat'&&(l.sell==null||l.sell==='');
const noValueLines=q=>(q.lines||[]).filter(noValue);
const ownPrice=l=>l.pmode==='pct'||l.pmode==='flat';
function calc(q){const cost=sum(q.lines,l=>l.qty*lineCost(l));const prop=sum(linePrices(q),x=>x);const cc=sum(q.lines.filter(l=>!l.onSite),l=>l.qty*lineCost(l));
 return {cost,prop,margin:prop-cost,pct:prop?(prop-cost)/prop:0,markup:cc?prop/cc-1:0};}
/* Pricing warnings (warn, never block) */
function priceAlerts(q){const out=[];if(q.status!=='open'||!q.lines.length)return out;const c=calc(q),ls=q.lines.filter(l=>!l.onSite);
 if(q.priceMode==='total'){const own=ls.filter(ownPrice),fixed=sum(own,l=>linePrice(q,l));
  if(own.length===ls.length&&Math.abs(fixed-(+q.priceTotal||0))>0.005)out.push({lvl:'amber',msg:`Fixed price ${eur2(+q.priceTotal||0)} is not used — every line has its own price, so the total is the sum of the lines (${eur2(fixed)})`});
  else if(fixed>(+q.priceTotal||0)+0.005)out.push({lvl:'red',msg:`Fixed price ${eur2(+q.priceTotal||0)} is lower than the lines with their own price (${eur2(fixed)}) — the other lines end up negative`});}
 if(c.prop<c.cost-0.005)out.push({lvl:'red',msg:`Client price ${eur2(c.prop)} is below the internal cost ${eur2(c.cost)}`});
 return out;}
/* Values (quantities, costs, markup, lines) can change until the quote is locked. After that only vendors can be confirmed and the job dates changed. */
/* Site visits. q.visit = the next visit: needed (someone asked for one) and, once planned in Routes, date + route.
   Done visits move to q.visits (history) and q.visit is cleared, so a job can be visited many times (before, during, at the end).
   Visits can be planned for Open and Locked jobs (incl. in progress), never for finished, aborted or archived ones. */
const visitable=q=>['open','locked'].includes(q.status)&&!q.archived;
function completeVisit(q){const v=q.visit,r=v.route&&typeof RT==='function'?RT(v.route):null;
 (q.visits=q.visits||[]).push({date:v.date||TODAY_ISO,route:v.route||null,by:me().id});
 if(r){const s=r.stops.find(x=>x.q===q.id);if(s)s.done=true;}
 q.visit={needed:false,date:null,done:false,route:null};logQ(q,'Site visit done');}
const isLocked=q=>q.status==='locked'||q.status==='finished';
const proposalSig=q=>JSON.stringify([q.lines.filter(l=>!l.onSite).map(l=>[...(l.parentLine?['sub:'+l.parentLine]:[]),l.kind,l.ref,l.desc,l.qty,l.unit,l.cost,l.pmode||'',l.markup??null,l.sell??null]),q.margin,q.priceMode||'markup',q.priceTotal??null,q.workStart,q.workEnd,q.billTo?.name]);
const lastSent=q=>q.versions[q.versions.length-1];
const changedSinceSent=q=>{const v=lastSent(q);return q.status==='open'&&!!v&&!!v.sig&&v.sig!==proposalSig(q);};
/* Proposal state of an open quote: none / waiting (sent, no answer yet) / rejected */
const pstate=q=>{const v=lastSent(q);if(!v)return 'none';if(q.status!=='open')return 'done';return v.rejected?'rejected':'waiting';};
/* Locking = the client approved. Records which proposal was approved (if any) and turns the values read-only. */
function doLock(q){const v=lastSent(q);const ok=v&&!v.rejected;q.approved={date:TODAY_ISO,by:me().id,v:ok?v.v:null};
 /* planned numbers, frozen when the job is confirmed — the Statistics compare them with the actual cost at the end (D-56) */
 {const c=calc(q);q.lockedCost=c.cost;q.lockedPrice=c.prop;q.lockedAt=TODAY_ISO;}
 setStatus(q,'locked',ok?(changedSinceSent(q)?`Locked — approved with lines changed since proposal v${v.v}`:`Locked — approved proposal v${v.v}`):'Locked — approved');toast('Locked — confirm the vendors next');}
/* The archive: what the proposal looked like the moment it was sent */
const archiveOf=q=>({dims:normDims(q.dims),title:q.title,description:q.description,customer:{...q.customer},billTo:JSON.parse(JSON.stringify(q.billTo)),contact:q.contactInfo?{...q.contactInfo}:null,site:JSON.parse(JSON.stringify(q.site)),workStart:q.workStart,workEnd:q.workEnd,margin:q.margin,priceMode:q.priceMode||'markup',priceTotal:q.priceTotal??null,lines:q.lines.map(l=>({id:l.id,parentLine:l.parentLine||null,onSite:!!l.onSite,kind:l.kind,desc:l.desc,qty:l.qty,unit:lineUnit(l),cost:l.cost,refName:lineName(l),pmode:l.pmode||null,markup:l.markup??null,sell:l.sell??null}))});
function stage(q){if(q.status==='finished')return 'done';if(q.status!=='locked')return null;if(!q.workStart)return 'unscheduled';if(TODAY_ISO<q.workStart)return 'scheduled';if(TODAY_ISO<=q.workEnd)return 'ongoing';return 'overdue';}
/* Status pill + tags: how many proposals went out / rejected, Approved, and where the job is in its dates */
function statusPill(q,compact){const s=ST[q.status],n=q.versions.length,ps=pstate(q),st=stage(q);let h=`<span class="pill p-${s.c}">${s.label}</span>`;
 if(q.archived)return `<span class="pills">${h}<span class="pill p-grey nodot">${ic('lock',11)} Archived</span></span>`;
 /* lists (compact): status + at most one tag; the quote page shows them all */
 if(compact){const t=q.status==='open'&&n?[ps==='rejected'?'amber':'accent',(ps==='rejected'?'Proposal rejected':'Proposal sent')+(n>1?' ×'+n:'')]:q.status==='locked'&&st?[st==='overdue'?'amber':'grey',STAGE[st][0]]:null;return `<span class="pills">${h}${t?`<span class="pill p-${t[0]} nodot">${t[1]}</span>`:''}</span>`;}
 if(q.status==='open'&&n)h+=`<span class="pill p-${ps==='rejected'?'amber':'accent'} nodot">${ps==='rejected'?'Proposal rejected':'Proposal sent'}${n>1?' ×'+n:''}</span>`;
 if(q.status==='locked'&&st)h+=`<span class="pill p-${st==='overdue'?'amber':'grey'} nodot">${STAGE[st][0]}</span>`;
 return `<span class="pills">${h}</span>`;}

/* Vendor availability: locked work (firm), open quotes with a proposal out (tentative), time off (firm) */
function bookings(vid){const out=[];
 QUOTES.forEach(q=>{if(!q.workStart||q.workDone||!(q.status==='locked'||(q.status==='open'&&pstate(q)==='waiting')))return;
  q.lines.forEach(l=>{if(l.kind==='labor'&&l.ref===vid&&!l.done)out.push({q,start:q.workStart,end:q.workEnd,firm:q.status==='locked',kind:'job'});});});
 (V(vid).off||[]).forEach(o=>out.push({start:o.start,end:o.end,firm:true,kind:'off',reason:o.reason}));
 return out.sort((a,b)=>a.start.localeCompare(b.start));}
function avail(vid,start,end,exclude){if(!start)return {lvl:'unknown',items:[]};
 const it=bookings(vid).filter(b=>(!b.q||b.q.id!==exclude)&&overlap(start,end,b.start,b.end));
 return {lvl:it.some(b=>b.firm)?'busy':it.length?'tentative':'ok',items:it};}
const bText=b=>b.kind==='off'?`${b.reason} ${fmtRange(b.start,b.end)}`:`${b.firm?'Booked on':'Proposal'} ${b.q.id} · ${fmtRange(b.start,b.end)}`;
function availInfo(a){
 if(a.lvl==='ok')return {t:'Free on these dates',c:'green',short:'Available'};
 if(a.lvl==='unknown')return {t:'Set work dates to check',c:'grey',short:'No dates'};
 if(a.lvl==='tentative')return {t:'Maybe — '+bText(a.items[0]),c:'amber',short:'Maybe busy'};
 return {t:'Also booked — '+bText(a.items.find(b=>b.firm)),c:'amber',short:'Also booked'};}
/* Directory › Vendors "Availability": today only — Free / Busy until <date> (on which job, by customer) / away; sub-line = next confirmed job */
function nowStatus(vid){const bs=bookings(vid).filter(b=>b.firm);const cur=bs.find(b=>b.start<=TODAY_ISO&&b.end>=TODAY_ISO);
 const nx=bs.find(b=>b.start>TODAY_ISO&&(!cur||b.start>cur.end));const sub=nx?`Next job ${fmtDate(nx.start)}`:'';
 if(cur)return cur.kind==='off'?{t:`Away until ${fmtDate(cur.end)}`,c:'amber',sub:cur.reason||''}:{t:`Busy until ${fmtDate(cur.end)}`,c:'amber',sub:qCust(cur.q)};
 return {t:'Free',c:'green',sub};}
const jobsDone=vid=>QUOTES.filter(q=>q.lines.some(l=>l.doneBy===vid)).length;

const statusAge=q=>{const n=daysSince(q.since);return `for ${n} day${n>1?'s':''}`;};
/* Alerts. The job dates are what drive them: "is this job finished? what happened?" */
/* inside=true: on the job's own screen. The "no vendor has this specialty" heads-up is normal while a job is being put together,
   so it only shows there, never in the alert box, the bell or the lists. */
function alertsFor(q,inside){const out=[];if(q.status==='finished'||q.status==='aborted')return out;
 if(q.visit.date&&q.visit.date<TODAY_ISO)out.push({lvl:'red',msg:`Visit on ${fmtDate(q.visit.date)} not marked as done`});
 out.push(...priceAlerts(q));
 const n=daysSince(q.since),sla=DB.settings.sla,ps=pstate(q),wa=DB.settings.workAlert||{amber:14,red:5},st=stage(q);
 if(q.status==='open'){
  if(q.workStart&&q.workEnd&&q.workEnd<TODAY_ISO)out.push({lvl:'red',msg:`The job date (${fmtRange(q.workStart,q.workEnd)}) has passed and this order is still open — was it done? Lock it, change the dates or abort it`});
  else if(q.workStart){const left=daysUntil(q.workStart);
   if(left<=wa.amber){const what=ps==='waiting'?'the client has not answered yet — record the client’s answer':ps==='rejected'?'the last proposal was rejected':'the order is not locked yet';
    const when=left<0?`Planned start ${fmtDate(q.workStart)} has passed and ${what}`:left===0?`Work is planned to start today and ${what}`:`Work starts in ${left} day${left>1?'s':''} (${fmtDate(q.workStart)}) and ${what}`;
    out.push({lvl:left<=wa.red?'red':'amber',msg:when});}}
  const v=q.visit;
  if(!v.date){const s=ps==='waiting'?sla.waiting:sla.open,days=ps==='waiting'?daysSince(lastSent(q).date):n,w=ps==='waiting'?'without client answer':'open';
   if(days>=s[1])out.push({lvl:'red',msg:`${days} days ${w} — limit ${s[1]}`});else if(days>=s[0])out.push({lvl:'amber',msg:`${days} days ${w}`});}
 }
 if(q.workStart&&st!=='done')
  q.lines.filter(l=>l.kind==='labor'&&!l.done).forEach(l=>{const a=avail(l.ref,q.workStart,q.workEnd,q.id);
   if(a.lvl==='busy')out.push({lvl:'amber',msg:`${lineName(l)}: also booked — ${bText(a.items.find(b=>b.firm))}. A vendor can do several jobs a day; change the dates only if needed`});});
 if(st==='scheduled'){const left=daysUntil(q.workStart);const un=q.lines.filter(l=>l.kind==='labor'&&!l.confirmed).length;
  if(un&&left<=7)out.push({lvl:left<=2?'red':'amber',msg:`${un} vendor${un>1?'s':''} not confirmed — work starts in ${left} days`});}
 if(st==='ongoing'&&q.workEnd===TODAY_ISO)out.push({lvl:'amber',msg:'Work is planned to end today — mark it finished when it is done'});
 if(st==='overdue')out.push({lvl:'red',msg:`Work was due to end ${fmtDate(q.workEnd)} — was the job finished? Mark it finished or change the dates`});
 if(st==='unscheduled')out.push({lvl:'amber',msg:'Locked but no job dates'});
 if(inside)out.push(...fitAlerts(q));
 return out;}
const level=a=>a.some(x=>x.lvl==='red')?'red':a.some(x=>x.lvl==='amber')?'amber':'ok';
function nextStep(q){const st=stage(q),ps=pstate(q);
 switch(q.status){
  case 'open':{const lb=q.lines.filter(l=>l.kind==='labor');
   if(!q.description)return 'Describe what needs to be done';
   if(DB.settings.dimensions.length&&!Object.keys(normDims(q.dims)).length)return 'Choose the quote type or dimensions';
   if(q.visit.date)return `Site visit ${fmtDate(q.visit.date)}`;
   if(!q.lines.length)return 'Add vendors and lines';if(!q.workStart)return 'Set job dates';
   if(ps==='rejected')return 'Adjust and send a new proposal';
   if(changedSinceSent(q))return 'Send a new version';
   if(ps==='waiting')return `Follow up · proposal v${lastSent(q).v} sent ${fmtDate(lastSent(q).date)}`;
   return 'Send a proposal, or lock when approved';}
  case 'locked':
   if(st==='unscheduled')return 'Set job dates';if(st==='overdue')return 'Past end date';
   if(st==='scheduled'){const un=q.lines.filter(l=>l.kind==='labor'&&!l.confirmed).length;return un?`Confirm ${un} vendor${un>1?'s':''}`:`Starts ${fmtDate(q.workStart)}`;}
   return `Ongoing · ends ${fmtDate(q.workEnd)}`;
  case 'finished':return q.archived?'Archived':q.invoice?`Finished · ${q.invoice}`:'Finished · to invoice';
  case 'aborted':return (q.archived?'Archived · ':'')+(q.cancel?.reason||'Aborted');
 }}
/* Collaborator (permission work.addResources without office permissions): sees only jobs in progress — from the start date until one day
   after the end — that are locked or finished and not archived; adds resource lines there, sees only the lines they added, and no values. */
/* Expenses (on-site resource lines) can be added to approved jobs — Locked (confirmada), Finished or Aborted — until the job is archived */
const collabWindow=q=>!q.archived&&['locked','finished','aborted'].includes(q.status);
/* a collaborator linked to a vendor only sees the jobs that vendor works on */
const collabFor=(u,q)=>!u?.vendor||q.lines.some(l=>l.kind==='labor'&&(l.ref===u.vendor||l.doneBy===u.vendor));
const collabCan=q=>collabWindow(q)&&collabFor(me(),q);
/* Expenses: "Paid by" (D-70) = the vendor who gets the money back (l.paidBy + copy l.paidByName); null = paid by the company, nothing to pay back.
   Collaborators add their own (paid by their vendor). With "expenses.onBehalf" anyone can add an expense on any job not archived — also Open jobs
   (fuel for a site visit) — and choose who paid it. */
const expByCo=l=>!l.paidBy;
/* Expense approval (D-72): with expenses.approve an expense goes straight to the job; without it, it is a request in DB.expClaims
   (status pending → approved / rejected). Only approved ones become job lines (and then "to pay"). */
const expDirect=()=>can('expenses.approve');
const CLAIMS=()=>DB.expClaims||(DB.expClaims=[]);
const expPayer=l=>l.paidBy?vName(l.paidBy,l.paidByName):'';
const expOnBehalf=()=>can('expenses.onBehalf');
const expCanJob=q=>!!q&&(collabCan(q)||(expOnBehalf()&&!q.archived));
const collabOnly=()=>can('work.addResources')&&!can('quotes.edit')&&!can('work.manage')&&!can('quotes.costs');
/* Which quotes a user sees: by permission, plus anything they own */
function visibleQuotes(){const u=me(),P=userPerms(u);
 return QUOTES.filter(q=>q.owner===u.id||q.cm===u.id||(P.has('work.addResources')&&collabWindow(q)&&collabFor(u,q))||
  (P.has('quotes.viewPipeline')&&PIPELINE.includes(q.status))||(P.has('quotes.viewWork')&&q.status==='locked')||(P.has('quotes.viewClosed')&&['finished','aborted'].includes(q.status)));}
function scopeNote(){const P=userPerms(me());const parts=[P.has('quotes.viewPipeline')&&'open quotes',P.has('quotes.viewWork')&&'locked work',P.has('quotes.viewClosed')&&'finished & aborted'].filter(Boolean);
 if(parts.length===3)return 'You see every quote.';if(!parts.length)return 'You see only quotes you own.';return 'You see '+parts.join(', ')+' — plus your own.';}

/* Searchable combobox (used for every dropdown) */
let COMBO={};
function combo(id,cfg){COMBO[id]=cfg;
 const vals=cfg.multi?(cfg.value||[]):[cfg.value];const sel=cfg.opts.filter(o=>vals.includes(o.v));
 const label=sel.length?esc(cfg.multi?sel.map(o=>o.l).join(', '):(cfg.show?cfg.show(sel[0]):sel[0].l)):`<span class="ph">${esc(cfg.placeholder||'Select…')}</span>`;
 return `<button type="button" class="combo ${cfg.cls||''}" data-act="comboOpen" data-id="${id}" ${cfg.disabled?'disabled':''} aria-haspopup="listbox"><span class="cv">${label}</span>${ic('chev',16)}</button>`;}
/* Lists to pick from show at most COMBO_MAX results (26-10-2026): with thousands of customers, vendors or resources the
   production API searches on the server and returns the first 20 — the mock does the same so the screens are designed for it.
   The chosen value always stays visible. */
const COMBO_MAX=20;
function comboOptsHtml(cfg,q){const vals=cfg.multi?(cfg.value||[]):[cfg.value];const nq=norm(q);
 const all=cfg.opts.filter(o=>!nq||norm(o.l+' '+(o.sub||'')+' '+(o.group||'')).includes(nq));
 if(!all.length)return `<div class="small faint" style="padding:14px">No match for “${esc(q)}”.</div>`;
 const max=cfg.max||COMBO_MAX;let f=all;
 if(all.length>max){f=all.slice(0,max);all.filter(o=>vals.includes(o.v)&&!f.includes(o)).forEach(o=>f.unshift(o));}
 let g=null,h='';
 f.forEach(o=>{if(o.group&&o.group!==g){g=o.group;h+=`<div class="cgroup">${esc(g)}</div>`;}
  h+=`<button type="button" class="copt" data-act="comboPick" data-v="${esc(o.v)}" role="option"><span class="ck">${vals.includes(o.v)?ic('check',16):''}</span><span class="grow"><div class="cl">${esc(o.l)}</div>${o.sub?`<div class="csub">${esc(o.sub)}</div>`:''}</span>${o.badge?`<span class="pill p-${o.badge.c} nodot">${esc(o.badge.t)}</span>`:''}</button>`;});
 if(all.length>f.length)h+=`<div class="small faint cmore">${esc(LT(`Showing ${f.length} of ${all.length} — type to narrow it down`,`A mostrar ${f.length} de ${all.length} — escreva para encontrar`))}</div>`;
 return h;}
function comboPop(){const c=state.combo;const cfg=COMBO[c.id];if(!cfg){state.combo=null;return '';}
 const W=Math.max(c.r.w,320),vw=window.innerWidth,vh=window.innerHeight;
 const left=Math.max(8,Math.min(c.r.l,vw-W-8));const below=vh-c.r.b>380||c.r.t<380;
 const pos=below?`top:${c.r.b+4}px`:`bottom:${vh-c.r.t+4}px`;
 return `<div class="cscrim" data-act="comboClose"></div><div class="cpop" style="left:${left}px;width:${W}px;${pos}" role="dialog">
  <div class="chead"><b>${esc(cfg.title||cfg.placeholder||'Select')}</b><button class="btn sm" data-act="comboClose">${cfg.multi?'Done':'Close'}</button></div>
  <div class="cs"><input type="search" id="combo-q" placeholder="Search…" autocomplete="off" value="${esc(c.q)}"></div>
  <div class="clist" id="combo-list" role="listbox">${comboOptsHtml(cfg,c.q)}</div>
  ${cfg.multi?'<div class="cfoot only-d" style="display:flex"><button class="btn sm pri" data-act="comboClose">Done</button></div>':''}</div>`;}
const userOpts=(filter=()=>true)=>USERS.filter(filter).map(u=>({v:u.id,l:u.name,sub:roleNames(u)+(u.active?'':' · inactive')}));
const custOpts=keep=>CUSTOMERS.filter(c=>!c.blocked||c.id===keep).map(c=>({v:c.id,l:c.name,sub:`${c.no} · ${c.billing.city||'—'} · NIF ${c.nif||'—'}`}));
const locOpts=c=>c.locations.map(l=>({v:l.id,l:l.name||l.address.line1||'Location',sub:addrStr(l.address)}));
const contactOpts=c=>c.contacts.map(x=>({v:x.id,l:x.name,sub:`${x.role||''}${x.phone?' · '+x.phone:''}`,badge:x.primary?{t:'Main',c:'grey'}:null}));
const townOpts=()=>TOWNS.map(t=>({v:t[0],l:t[0]}));
/* Matching vendors to a quote — no rules: the quote's dimensions are compared with the vendors' dimensions.
   Only dimensions that some vendor uses take part (a customer tag like SEGMENTO is ignored). Never blocks — it ranks and warns.
   Per vendor and dimension: ✓ shares a value · ✗ has the dimension but none of the quote's values · ? hasn't filled it in. */
const reqsOf=q=>DB.settings.dimensions.filter(d=>dvals(q.dims,d.code).length&&VENDORS.some(v=>dvals(v.dims,d.code).length)).map(d=>({d,vals:dvals(q.dims,d.code)}));
function vendorFit(q,v){const chips=[];let hit=0,bad=0,unk=0;const rs=reqsOf(q);
 rs.forEach(({d,vals})=>{const has=dvals(v.dims,d.code),sh=vals.filter(x=>has.includes(x));
  if(sh.length)sh.forEach(x=>{hit++;chips.push({t:'✓ '+dimValName(d.code,x),c:'green'});});
  else if(has.length){bad++;chips.push({t:'✗ '+dimLabel(d)+': '+vals.map(x=>dimValName(d.code,x)).join(', '),c:'amber'});}
  else{unk++;chips.push({t:'? '+dimLabel(d),c:'grey'});}});
 return {chips,hit,bad,unk,reqs:rs.length,match:rs.length?hit>0&&!bad:true,score:hit*10-bad*20-unk*2};}
/* Warnings on the quote: a value of the quote's dimensions that no vendor on the quote has */
function fitAlerts(q){const out=[];const lb=q.lines.filter(l=>l.kind==='labor'&&!l.done);if(!lb.length)return out;
 const vs=[...new Set(lb.map(l=>l.ref))].map(V).filter(Boolean);
 reqsOf(q).forEach(({d,vals})=>vals.forEach(x=>{if(!vs.some(v=>dvals(v.dims,d.code).includes(x)))out.push({lvl:'amber',msg:`${dimLabel(d)}: ${dimValName(d.code,x)} — no vendor on this quote has it`});}));
 return out;}
/* Description for a new labor line: the first value the vendor shares with the quote, else its first value */
const lineDescFor=(q,v)=>{for(const r of reqsOf(q))for(const x of r.vals)if(dvals(v.dims,r.d.code).includes(x))return dimValName(r.d.code,x);return dimNames(v)[0]||'';};
function vendorOpts(q){const rk={ok:0,unknown:1,tentative:2,busy:3};const hasReq=q&&reqsOf(q).length;
 return VENDORS.filter(v=>!v.blocked).map(v=>{const a=avail(v.id,q?.workStart,q?.workEnd,q?.id);const i=availInfo(a);const fit=q?vendorFit(q,v):null;
  return {v:v.id,l:v.name,sub:`${v.type==='person'?'Person':'Company'} · ${vSpecs(v).join(', ')||'—'}${q?.workStart?' · '+i.t:''}`,badge:q?{t:i.short,c:i.c}:null,group:hasReq?(fit.match?'Matches the requirements':'Other vendors'):'Vendors',_r:rk[a.lvl],_m:hasReq?(fit.match?0:1)*1000-fit.score:0};})
  .sort((a,b)=>a._m-b._m||a._r-b._r||a.l.localeCompare(b.l));}
/* Quote template: adds its dimensions to the quote (and gives an empty Description the template's name). The quote doesn't keep the template. */
function applyTemplate(q,code){const t=qtOf(code);if(!t)return;const before=JSON.stringify(q.dims)+(q.title||'');dimMerge(q.dims,t.dims);if(!q.title)q.title=String(t.name||'').slice(0,TITLE_MAX);
 logQ(q,`Template applied: ${t.name}`);toast(before===JSON.stringify(q.dims)+(q.title||'')?'The template’s dimensions were already there':`Template “${t.name}” applied`);}

/* Shell */
const LT=(en,pt)=>isPT()?pt:en; /* text with numbers or names: written in both languages in the code */
/* Menu in blocks (25-10-2026): [key, label, icon, block, short label for the phone bar].
   Users is not in the menu — it opens from Settings (rare, admins only). */
const NAV=[['home','Home','home',''],
 ['quotes','Quotes','quotes','work'],['map','Routes','map','work'],['team','Team','week','work'],
 ['expenses','My expenses','receipt','exp','Expenses'],['expapprove','Approvals','check','exp'],['payexp','Payments','receipt','exp'],
 ['dir','Directory','dir','mgmt'],['stats','Statistics','chart','mgmt'],
 ['settings','Settings','settings','end']];
const NAV_GROUPS=()=>({work:LT('Work','Trabalho'),exp:LT('Expenses','Despesas'),mgmt:LT('Management','Gestão')});
const navGrouped=items=>{const out=[];items.forEach(x=>{const g=x[3];let b=out.find(o=>o.g===g);if(!b){b={g,items:[]};out.push(b);}b.items.push(x);});return out;};
const redCount=()=>collabOnly()?0:visibleQuotes().filter(q=>level(alertsFor(q))==='red').length;
/* the pages this person can open (same on computer and phone) */
const navOk=k=>(!collabOnly()||['home','quotes','expenses','settings'].includes(k))&&(k!=='expenses'||can('work.addResources'))&&(k!=='map'||can('map.planner'))&&(k!=='users'||can('users.manage'))&&(k!=='stats'||(can('stats.view')&&!collabOnly()))&&(k!=='team'||(can('quotes.viewWork')&&!collabOnly()))&&(k!=='payexp'||(can('expenses.pay')&&!collabOnly()))&&(k!=='expapprove'||(can('expenses.approve')&&!collabOnly()));
const navItems=()=>NAV.filter(([k])=>navOk(k));
const navOn=k=>state.view===k||(k==='settings'&&['series','setup','dim','audit','profile','users'].includes(state.view))||(k==='quotes'&&state.view==='quote')||(k==='dir'&&state.view==='customer');
/* phone: the shortcuts of the person's roles (in order, no repeats, max 4); everything else is under "More" */
function mobileKeys(){const out=[],inNav=k=>NAV.some(x=>x[0]===k);(me().roles||[]).map(RL).filter(Boolean).forEach(r=>(r.mobile||[]).forEach(k=>{if(!out.includes(k)&&inNav(k)&&navOk(k))out.push(k);}));
 if(!out.length)(collabOnly()?DEFAULT_MOBILE.collab:DEFAULT_MOBILE._).forEach(k=>{if(navOk(k)&&!out.includes(k))out.push(k);});
 return out.slice(0,MOBILE_MAX);}
const navBtn=([k,l,i,g,sh],reds,short)=>`<button class="nav ${navOn(k)?'on':''}" data-act="go" data-v="${k}">${ic(i,22)}<span>${short&&sh||l}</span>${k==='quotes'&&reds?`<span class="dot">${reds}</span>`:''}</button>`;
function navHtml(mobile){const reds=redCount(),items=navItems();
 if(!mobile)return navGrouped(items.filter(x=>x[3]!=='end')).map(b=>`${b.g?`<div class="navg">${NAV_GROUPS()[b.g]}</div>`:''}${b.items.map(x=>navBtn(x,reds)).join('')}`).join('');
 const keys=mobileKeys(),rest=items.filter(([k])=>!keys.includes(k));
 return keys.map(k=>navBtn(items.find(x=>x[0]===k),reds,true)).join('')+(rest.length?`<button class="nav ${state.navMore||rest.some(([k])=>navOn(k))?'on':''}" data-act="navMore">${ic('more',22)}<span>More</span>${rest.some(([k])=>k==='quotes')&&reds?`<span class="dot">${reds}</span>`:''}</button>`:'');}
function moreSheet(){if(!state.navMore)return '';const keys=mobileKeys(),rest=navItems().filter(([k])=>!keys.includes(k));
 return `<div class="cscrim msheet-scrim" data-act="navMore"></div><div class="msheet" role="menu"><div class="msheet-h">${LT('More','Mais')}</div>${navGrouped(rest).map(b=>`${b.g&&b.g!=='end'?`<div class="msheet-gh">${NAV_GROUPS()[b.g]}</div>`:''}<div class="msheet-g${b.g==='end'?' msheet-end':''}">${b.items.map(([k,l,i])=>`<button class="msheet-i ${navOn(k)?'on':''}" data-act="go" data-v="${k}">${ic(i,24)}<span>${l}</span></button>`).join('')}</div>`).join('')}
  ${can('users.manage')?`<div class="tiny faint" style="padding:8px 4px 0">${LT('The buttons in the bar are chosen for each role in Users & roles.','Os botões da barra escolhem-se para cada função em Utilizadores e funções.')}</div>`:''}</div>`;}
/* Theme: follows the device until the user picks light or dark */
const isDark=()=>{const t=document.documentElement.dataset.theme;return t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches;};
function setTheme(t){if(t)document.documentElement.dataset.theme=t;else delete document.documentElement.dataset.theme;lsSet('fb-theme',t);}
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(!document.documentElement.dataset.theme)render();});}catch(e){}
/* ===== Navigation history (transversal): every screen remembers where you came from =====
   Each time the screen changes, the previous one (with its tab, filters, open route and scroll position) is pushed on a stack.
   "Back" buttons return to it with its name ("← Routes", "← Quotes", "← Hotel Sol"); the phone/browser back button does the same.
   Choosing a section in the main menu starts a fresh history. */
const NAV_MAX=30;let _navOK=false;
const here=()=>({view:state.view,qid:state.qid,tab:state.tab,custId:state.custId,dirTab:state.dirTab,filter:state.filter,setupTab:state.setupTab,dimCode:state.dimCode,seriesCode:state.seriesCode,mapMode:state.map.mode,rid:state.map.rid,y:window.scrollY});
const locId=s=>[s.view,s.view==='quote'?s.qid:'',s.view==='customer'?s.custId:'',s.view==='map'?(s.rid||''):'',s.view==='dim'?s.dimCode:'',s.view==='series'?s.seriesCode:''].join('/');
function locLabel(s){switch(s.view){case 'quote':return s.qid;case 'customer':return C(s.custId)?.name||'Customer';case 'map':return s.mapMode==='routes'&&s.rid?'Route':'Routes';
 case 'quotes':return 'Quotes';case 'stats':return 'Statistics';case 'payexp':return 'Payments';case 'expapprove':return LT('Expense approvals','Aprovação de despesas');case 'team':return 'Team';case 'audit':return 'Access log';case 'expenses':return 'Expenses';case 'home':return 'Home';case 'dir':return 'Directory';case 'settings':return 'Settings';case 'setup':return 'Setup';case 'dim':return 'Dimension';case 'series':return 'Number series';case 'users':return 'Users';case 'profile':return 'My profile';default:return 'Back';}}
function navTrack(){const cur=here(),id=locId(cur);if(!state.nav)state.nav={stack:[],id:null,snap:null};const n=state.nav;
 if(n.id&&n.id!==id&&!n.restoring){n.snap.y=window.scrollY;n.stack.push(n.snap);if(n.stack.length>NAV_MAX)n.stack.shift();try{history.pushState({fb:n.stack.length},'');_navOK=true;}catch(e){_navOK=false;}}
 n.restoring=false;n.id=id;n.snap=cur;}
function navReset(){if(state.nav){state.nav.stack=[];state.nav.restoring=true;}}
function navBack(){const n=state.nav;if(!n||!n.stack.length)return false;const s=n.stack.pop();
 Object.assign(state,{view:s.view,qid:s.qid,tab:s.tab,custId:s.custId,dirTab:s.dirTab,filter:s.filter,setupTab:s.setupTab,dimCode:s.dimCode,seriesCode:s.seriesCode,modal:null,combo:null,qmore:false,custEdit:false});
 state.map.mode=s.mapMode;state.map.rid=s.rid;n.restoring=true;render();requestAnimationFrame(()=>window.scrollTo(0,s.y||0));return true;}
/* back button for a screen: goes to where you came from; without history, to the given default */
function backBtn(defAct,defAttrs,defLabel){const n=state.nav,top=n&&n.stack.length?n.stack[n.stack.length-1]:null;
 return top?`<button class="btn sm backbtn" data-act="back" style="margin-bottom:12px">${ic('back',16)} <span>${esc(locLabel(top))}</span></button>`
  :`<button class="btn sm backbtn" data-act="${defAct}" ${defAttrs} style="margin-bottom:12px">${ic('back',16)} <span>${defLabel}</span></button>`;}
window.addEventListener('popstate',()=>{if(state.user&&state.nav&&state.nav.stack.length)navBack();});
/* Date and time fields always show dd-mm-aaaa / HH:mm (24 h), whatever the device language: the native field keeps the value
   (ISO yyyy-mm-dd) and the calendar, and a text on top shows it the Portuguese way. Tapping opens the calendar. */
function enhanceDates(){document.querySelectorAll('input[type=date]:not([data-dx]):not(.pickday input),input[type=time]:not([data-dx])').forEach(inp=>{
 inp.dataset.dx=1;const w=document.createElement('span');w.className='dwrap';inp.parentNode.insertBefore(w,inp);w.appendChild(inp);
 const t=document.createElement('span');t.className='dtxt';w.appendChild(t);
 const upd=()=>{const v=inp.value;t.textContent=inp.type==='date'?(v?fmtDate(v):(isPT()?'dd-mm-aaaa':'dd-mm-yyyy')):(v||'--:--');t.classList.toggle('ph',!v);};upd();
 inp.addEventListener('input',upd);inp.addEventListener('change',upd);
 inp.addEventListener('click',()=>{try{inp.showPicker&&inp.showPicker();}catch(e){}});});}
/* ===== Long lists: pages of 20 on desktop, endless scroll on phones =====
   pg(key, list) → {items, foot}. Desktop: page numbers under the list. Phone: first 20, and 20 more each time the end of the
   list scrolls into view. Changing the search, filter or tab starts again at the top. */
const PAGE=20,isDesk=()=>window.innerWidth>=900;
function pg(key,arr){const P=state.pg||(state.pg={});const sig=[state.view,state.q,state.filter,state.dirTab,state.dirBlocked].join('|');
 let o=P[key];if(!o||o.sig!==sig)o=P[key]={sig,page:1,n:PAGE};const total=arr.length;
 if(total<=PAGE)return {items:arr,foot:''};
 if(isDesk()){const pages=Math.ceil(total/PAGE);o.page=Math.min(Math.max(1,o.page),pages);const st=(o.page-1)*PAGE;
  return {items:arr.slice(st,st+PAGE),foot:pagerHtml(key,o.page,pages,st,Math.min(st+PAGE,total),total)};}
 return {items:arr.slice(0,o.n),foot:o.n<total?`<div class="more" data-more="${key}"><span class="spin"></span> Loading more… <span class="faint">${o.n} of ${total}</span></div>`:`<div class="more done">${total} of ${total}</div>`};}
function pagerHtml(key,p,pages,a,b,total){const nums=[];for(let i=1;i<=pages;i++)if(i===1||i===pages||Math.abs(i-p)<=1)nums.push(i);else if(nums[nums.length-1]!=='…')nums.push('…');
 return `<div class="pager"><span class="small muted">${a+1}–${b} of ${total}</span><div class="pbtns"><button class="btn sm" data-act="pgGo" data-k="${key}" data-p="${p-1}" ${p<=1?'disabled':''} aria-label="Previous page">${ic('left',15)}</button>${nums.map(n=>n==='…'?'<span class="faint">…</span>':`<button class="btn sm ${n===p?'pri':''}" data-act="pgGo" data-k="${key}" data-p="${n}">${n}</button>`).join('')}<button class="btn sm" data-act="pgGo" data-k="${key}" data-p="${p+1}" ${p>=pages?'disabled':''} aria-label="Next page">${ic('right',15)}</button></div></div>`;}
let _moreObs=null;
function watchMore(){if(_moreObs)_moreObs.disconnect();const els=document.querySelectorAll('[data-more]');if(!els.length||!('IntersectionObserver' in window))return;
 _moreObs=new IntersectionObserver(es=>{es.forEach(e=>{if(!e.isIntersecting)return;const k=e.target.dataset.more,o=state.pg&&state.pg[k];if(!o)return;_moreObs.disconnect();o.n+=PAGE;
  const ql=document.getElementById('qlist'),dl=document.getElementById('dlist');if(k==='quotes'&&ql){ql.innerHTML=listHtml();watchMore();}else if(dl&&['cust','vend','res'].includes(k)){dl.innerHTML=dirList();watchMore();}else render();});},{rootMargin:'300px'});
 els.forEach(el=>_moreObs.observe(el));}
let _wasDesk=null;window.addEventListener('resize',()=>{const d=isDesk();if(_wasDesk!==null&&d!==_wasDesk&&state.user)render();_wasDesk=d;});
function render(){
 if(!DB){document.getElementById('app').innerHTML='<div class="empty" style="margin-top:20vh">Loading…</div>';return;}
 if(state.user&&!realMe()?.active)signOut(true);
 if(!state.user){document.getElementById('app').innerHTML=vLogin();return;}
 saveDB();navTrack();
 const keep={chips:document.getElementById('chips')?.scrollLeft,m:document.querySelector('.mbody')?.scrollTop,f:document.querySelector('.fullpage')?.scrollTop,c:document.getElementById('combo-list')?.scrollTop};
 COMBO={};const reds=redCount();const u=me(),ru=realMe();
 const header=`<header class="top"><div class="brand"><div class="logo">R</div><span class="hide-sm">Raposo Solutions</span></div><div style="flex:1"></div>
  ${can('quotes.edit')?`<button class="btn pri sm d-only" data-act="quickAdd">${ic('plus',16)} New quote</button>`:''}
  <button class="iconbtn" data-act="theme" aria-label="${isDark()?'Switch to light mode':'Switch to dark mode'}" title="${isDark()?'Light mode':'Dark mode'}">${ic(isDark()?'sun':'moon',19)}</button>
  <button class="iconbtn" data-act="abarToggle" aria-label="Alerts">${ic('bell',19)}${reds?`<span class="dot">${reds}</span>`:''}</button>
  <button class="ubtn" data-act="menu" aria-haspopup="menu" aria-expanded="${state.menu}"><span class="avatar">${initials(u.name)}</span><span class="hide-sm ell" style="max-width:140px">${esc(u.name.split(' ')[0])}</span>${ic('chev',14)}</button></header>
`;
 const menu=state.menu?`<div class="cscrim" data-act="menuClose"></div><div class="umenu" role="menu">
   <div class="uhead"><span class="avatar" style="width:38px;height:38px">${initials(ru.name)}</span><div style="min-width:0"><b class="ell" style="display:block">${esc(ru.name)}</b><div class="tiny faint ell">${esc(ru.email)}</div><div class="tiny muted">${esc(roleNames(ru))}</div></div></div>
   <button class="mi" data-act="go" data-v="profile">${ic('user',17)} My profile</button>
   <a class="mi" href="design-doc.html">${ic('doc',17)} Design doc</a>
   <button class="mi" data-act="lang">${ic('settings',17)} Language · ${isPT()?'English':'Português'}</button>
   <button class="mi" data-act="signOut">${ic('logout',17)} Sign out</button></div>`:'';
 const main=view();
 const modal=state.modal?`<div class="scrim" data-act="scrim"><div class="modal" role="dialog" aria-label="${esc(state.modal.title)}">
   <div class="mhead"><h2>${esc(state.modal.title)}</h2><button class="iconbtn" style="width:34px;height:34px" data-act="closeModal" aria-label="Close">${ic('x',18)}</button></div>
   <div class="mbody">${formErrHtml()}${state.modal.body()}</div>
   ${state.modal.ok?`<div class="mfoot">${state.modal.extra||''}<button class="btn" data-act="closeModal">Cancel</button><button class="btn ${state.modal.danger?'danger-solid':'pri'}" data-act="modalOk">${esc(state.modal.okLabel||'Save')}</button></div>`:''}</div></div>`:'';
 const pop=state.combo?comboPop():'';
 document.getElementById('app').innerHTML=`${header}
 <div class="layout"><nav class="side">${navHtml()}<div class="foot">${navItems().filter(x=>x[3]==='end').map(x=>navBtn(x,0)).join('')}<a href="design-doc.html">Design doc (mock only) →</a></div></nav><main>${state.user&&!collabOnly()&&['home','quotes'].includes(state.view)?alertBar():''}${main}</main></div>
 <nav class="bottom">${navHtml(true)}</nav>${moreSheet()}
 ${can('quotes.edit')&&!state.modal&&state.view!=='quote'&&state.view!=='map'&&!(state.view==='customer'&&state.custEdit)?`<button class="fab" data-act="quickAdd">${ic('plus',22)} New</button>`:''}
 ${menu}${modal}${pop}
 <datalist id="city-list">${TOWNS.map(t=>`<option value="${esc(t[0])}">`).join('')}</datalist>
 ${state.toast?`<div class="toast" role="status">${esc(state.toast.msg)}${state.toast.open?`<button data-act="open" data-id="${state.toast.open}">View</button>`:''}</div>`:''}`;
 {const ch=document.getElementById('chips');if(ch){if(keep.chips!=null)ch.scrollLeft=keep.chips;const on=ch.querySelector('.chip.on');if(on&&keep.chips==null)ch.scrollLeft=Math.max(0,on.offsetLeft-ch.clientWidth/2+on.offsetWidth/2);}}
 if(keep.m&&document.querySelector('.mbody'))document.querySelector('.mbody').scrollTop=keep.m;
 if(keep.f&&document.querySelector('.fullpage'))document.querySelector('.fullpage').scrollTop=keep.f;
 if(typeof mapMount==='function'&&state.view==='map')mapMount();
 if(typeof alertWatch==='function')alertWatch();
 enhanceDates();watchMore();
 const cs=document.getElementById('combo-q');if(cs){cs.focus();if(keep.c)document.getElementById('combo-list').scrollTop=keep.c;}
}
function view(){switch(state.view){
 case 'home':return vHome();case 'quotes':return vQuotes();case 'quote':return collabOnly()?vQuoteCollab(QR(state.qid)):vQuote(QR(state.qid));
 case 'map':return can('map.planner')?vMap():locked('The route planner is for the commercial and operations teams.');
 case 'payexp':return can('expenses.pay')?vPayExp():locked('Expense payments are for '+rolesWith('expenses.pay')+'.');
 case 'expapprove':return can('expenses.approve')?vExpApprove():locked(LT('Expense approvals are for ','A aprovação de despesas é para ')+rolesWith('expenses.approve')+'.');
 case 'expenses':return can('work.addResources')?vExpenses():locked('Expenses are for people who work on site.');case 'dir':return vDir();case 'customer':return vCustomer();case 'settings':return vSettings();case 'series':case 'setup':case 'dim':if(!can('setup.edit'))return locked('Setup (number series, dimensions, quote types, units) is managed by '+rolesWith('setup.edit')+'.');return state.view==='series'?vSeriesDetail():state.view==='setup'?vSetup():vDimDetail();
 case 'team':return can('quotes.viewWork')&&!collabOnly()?vTeam():locked('The team view is for the office team.');
 case 'audit':return can('audit.view')?vAudit():locked('The access log is for administrators.');
 case 'stats':return can('stats.view')&&!collabOnly()?vStats():locked('Statistics are for the office team.');
 case 'users':return can('users.manage')?vUsers():locked('Only administrators manage users and roles.');case 'profile':return vProfile();
 default:return vHome();}}
const locked=msg=>`<div class="empty">${ic('lock',22)}<div style="margin-top:8px">${msg}</div></div>`;
function toast(msg,open){state.toast={msg,open};render();clearTimeout(toast.t);toast.t=setTimeout(()=>{state.toast=null;render()},3500);}
function logQ(q,t){q.log.push([TODAY_ISO,me().id,t]);}
function setStatus(q,s,t){q.status=s;q.since=TODAY_ISO;if(t)logQ(q,t);}
