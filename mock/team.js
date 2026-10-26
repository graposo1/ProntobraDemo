/* ===== Team — week view (D-58) =====
   Who is where each day: one row per vendor (collaborators with a login first), the 7 days of the week in columns.
   Confirmed / finished jobs = solid block, open jobs (proposal) = dashed outline, time off = grey. Two confirmed jobs on the
   same day = a mustard heads-up, like everywhere else (a vendor can do several jobs a day). Read only — nothing is planned here.
   On a phone: pick the day, see the people and their jobs; the free ones at the end. */

const weekOf=s=>{const d=D(s);return addDays(s,-((d.getDay()+6)%7));};
function teamSt(){return state.team||(state.team={week:weekOf(TODAY_ISO),day:TODAY_ISO,dim:'',collab:false});}
const DOW_EN=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],DOW_PT=['seg','ter','qua','qui','sex','sáb','dom'];
const dowL=i=>(isPT()?DOW_PT:DOW_EN)[i];
/* jobs and time off of a vendor that touch [from, to] */
function teamItems(vid,from,to){const out=[];const vq=new Set(visibleQuotes().map(q=>q.id));
 QUOTES.forEach(q=>{if(!vq.has(q.id)||!q.workStart||!['open','locked','finished'].includes(q.status))return;
  if(!q.lines.some(l=>l.kind==='labor'&&(l.ref===vid||l.doneBy===vid)))return;
  const end=[q.workEnd||q.workStart,q.status==='finished'&&q.workDone?q.workDone:''].sort().pop();
  if(overlap(from,to,q.workStart,end))out.push({q,start:q.workStart,end,kind:q.status==='open'?'open':'firm'});});
 (V(vid)?.off||[]).forEach(o=>{if(overlap(from,to,o.start,o.end))out.push({start:o.start,end:o.end,kind:'off',reason:o.reason||'Time off'});});
 return out;}
const teamPeople=()=>{const s=teamSt();const isUser=v=>USERS.some(u=>u.vendor===v.id&&u.active);
 return VENDORS.filter(v=>!v.blocked&&(!s.collab||isUser(v))&&(!s.dim||(()=>{const [d,x]=s.dim.split(':');return dvals(v.dims,d).includes(x);})()))
  .sort((a,b)=>(isUser(b)-isUser(a))||((a.type==='person'?0:1)-(b.type==='person'?0:1))||a.name.localeCompare(b.name));};
function teamChip(it,day){if(it.kind==='off')return `<span class="tjob off">${esc(it.reason)}</span>`;const q=it.q;
 return `<button class="tjob ${it.kind}" data-act="open" data-id="${q.id}" title="${esc(qCust(q)+' · '+qPlace(q)+' · '+fmtRange(q.workStart,q.workEnd)+(it.kind==='open'?' · open (proposal)':''))}"><b class="ell">${esc(qCust(q))}</b><span class="ell">${esc(q.site?.address?.city||qPlace(q))}${q.status==='finished'?' · ✓':''}</span></button>`;}
function vTeam(){const s=teamSt(),days=[0,1,2,3,4,5,6].map(i=>addDays(s.week,i)),ppl=teamPeople(),to=days[6];if(!days.includes(s.day))s.day=days.includes(TODAY_ISO)?TODAY_ISO:days[0];
 const dims=DB.settings.dimensions.filter(d=>d.values.length&&VENDORS.some(v=>dvals(v.dims,d.code).length));
 const dimOpts=[{v:'',l:'All'},...dims.flatMap(d=>d.values.map(v=>({v:d.code+':'+v.code,l:v.name||v.code,group:dimLabel(d)})))];
 const rows=ppl.map(v=>({v,items:teamItems(v.id,s.week,to)}));
 const on=(it,d)=>it.start<=d&&d<=it.end;
 const cell=(r,d)=>{const its=r.items.filter(it=>on(it,d)),firm=its.filter(i=>i.kind==='firm').length;return {its,warn:firm>1};};
 const isUser=v=>USERS.some(u=>u.vendor===v.id&&u.active);
 const busyDays=rows.reduce((n,r)=>n+days.filter(d=>r.items.some(it=>it.kind!=='off'&&on(it,d))).length,0);
 return `<div class="page-head"><div class="grow"><h1>Team</h1><div class="muted small" style="margin-top:4px">Who is on which job, day by day · ${fmtRange(days[0],days[6])}</div></div>
  <div class="row" style="gap:6px"><button class="btn sm" data-act="teamWeek" data-d="-7" aria-label="Previous week">${ic('left',16)}</button><button class="btn sm ${days.includes(TODAY_ISO)?'pri':''}" data-act="teamToday">This week</button><button class="btn sm" data-act="teamWeek" data-d="7" aria-label="Next week">${ic('right',16)}</button></div></div>
 <div class="row wrap" style="gap:10px;margin-bottom:12px;align-items:flex-end">${dims.length?`<div style="flex:1 1 220px;max-width:320px"><span class="flabel">Dimension</span>${combo('tm-dim',{opts:dimOpts,value:s.dim,title:'Dimension value',onPick:v=>{s.dim=v;}})}</div>`:''}
  <label class="check" style="margin-bottom:8px"><input type="checkbox" data-tm="collab" ${s.collab?'checked':''}> <span>Only collaborators (app users)</span></label></div>
 ${!rows.length?'<div class="card"><div class="empty">No vendors match.</div></div>':`
 <div class="tcard only-d"><div class="tgrid" style="grid-template-columns:200px repeat(7,minmax(0,1fr))">
  <div class="th"></div>${days.map((d,i)=>`<div class="th ${d===TODAY_ISO?'today':''} ${i>4?'we':''}"><b>${dowL(i)}</b> ${d.slice(8,10)}-${d.slice(5,7)}</div>`).join('')}
  ${rows.map(r=>`<div class="tp"><b class="ell">${esc(r.v.name)}</b><div class="tagline">${vTypePill(r.v)}${isUser(r.v)?vUserPill(r.v):''}</div></div>
   ${days.map((d,i)=>{const c=cell(r,d);return `<div class="tc ${i>4?'we':''} ${d===TODAY_ISO?'today':''} ${c.warn?'warn':''}" ${c.warn?`title="${isPT()?'Duas obras confirmadas no mesmo dia':'Two confirmed jobs on the same day'}"`:''}>${c.its.map(it=>teamChip(it,d)).join('')}</div>`;}).join('')}`).join('')}
 </div></div>
 <div class="only-m">
  <div class="tdays">${days.map((d,i)=>{const n=rows.filter(r=>r.items.some(it=>it.kind!=='off'&&on(it,d))).length;return `<button class="tday ${s.day===d?'on':''} ${d===TODAY_ISO?'today':''}" data-act="teamDay" data-d="${d}"><span>${dowL(i)}</span><b>${d.slice(8,10)}</b><span class="tiny">${n||''}</span></button>`;}).join('')}</div>
  ${(()=>{const busy=rows.map(r=>({...r,c:cell(r,s.day)})).filter(r=>r.c.its.length),free=rows.filter(r=>!r.items.some(it=>on(it,s.day)));
   return `<div class="mlist" style="margin-top:12px">${busy.map(r=>`<div class="mcard ${r.c.warn?'lv-amber':''}"><div class="row between"><b class="ell">${esc(r.v.name)}</b>${isUser(r.v)?vUserPill(r.v):''}</div>
     <div class="stack" style="margin-top:8px;gap:6px">${r.c.its.map(it=>teamChip(it,s.day)).join('')}</div>${r.c.warn?`<div class="tiny" style="color:var(--amber-box-ink);margin-top:6px">${isPT()?'Duas obras confirmadas no mesmo dia':'Two confirmed jobs on the same day'}</div>`:''}</div>`).join('')||`<div class="card"><div class="empty">${isPT()?'Ninguém em obra neste dia.':'Nobody on a job this day.'}</div></div>`}</div>
    ${free.length?`<div class="card" style="margin-top:12px"><h3>${isPT()?'Livres':'Free'} · ${free.length}</h3><div class="small" style="margin-top:6px">${free.map(r=>esc(r.v.name)).join(' · ')}</div></div>`:''}`;})()}
 </div>`}
 <div class="tlegend"><span><i class="tjob firm"></i> Confirmed job</span><span><i class="tjob open"></i> Open (proposal)</span><span><i class="tjob off"></i> Time off</span><span class="faint">${busyDays} ${isPT()?'dias-pessoa ocupados nesta semana':'busy person-days this week'}</span></div>`;}

Object.assign(A,{
 teamWeek:t=>{const s=teamSt();s.week=addDays(s.week,+t.dataset.d);s.day=addDays(s.day,+t.dataset.d);render();},
 teamToday:()=>{const s=teamSt();s.week=weekOf(TODAY_ISO);s.day=TODAY_ISO;render();},
 teamDay:t=>{teamSt().day=t.dataset.d;render();},
});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset&&t.dataset.tm&&state.view==='team'){teamSt()[t.dataset.tm]=t.checked;render();}});
