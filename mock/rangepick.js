/* ===== Date range picker — a calendar card (25-10-2026) =====
   One button showing the range ("📅 01-01-2026 a 25-10-2026"); clicking opens a card with shortcuts on the left and the calendar
   (two months on a computer, one on a phone, where it opens as a sheet from the bottom). Click the first day, then the last;
   the days in between are painted. Shortcuts apply straight away; "Apply" applies a picked range.
   Used by Expense payments and Statistics.
   rangePick(id,{from,to,label,presets:[{k,l,from,to}],active,max,onApply(from,to),onPreset(k)}) — callbacks live in RPK[id]. */
const RPK={};
const RP_MON=()=>isPT()?['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']:['January','February','March','April','May','June','July','August','September','October','November','December'];
const RP_WD=()=>isPT()?['S','T','Q','Q','S','S','D']:['M','T','W','T','F','S','S'];
const rpMonthAdd=(ym,n)=>{let y=+ym.slice(0,4),m=+ym.slice(5,7)-1+n;y+=Math.floor(m/12);m=((m%12)+12)%12;return `${y}-${pad2(m+1)}`;};
/* common shortcuts */
function rpPresets(){const t=D(TODAY_ISO),y=t.getFullYear(),m=t.getMonth(),iso=(Y,M,d)=>isoOf(new Date(Y,M,d,12));
 return [{k:'month',l:LT('This month','Este mês'),from:iso(y,m,1),to:TODAY_ISO},{k:'lastMonth',l:LT('Last month','Mês passado'),from:iso(y,m-1,1),to:iso(y,m,0)},
  {k:'quarter',l:LT('This quarter','Este trimestre'),from:iso(y,m-m%3,1),to:TODAY_ISO},{k:'year',l:LT('This year','Este ano'),from:iso(y,0,1),to:TODAY_ISO},
  {k:'last12',l:LT('Last 12 months','Últimos 12 meses'),from:addDays(iso(y-1,m,t.getDate()),1),to:TODAY_ISO},{k:'lastYear',l:LT('Last year','Ano passado'),from:iso(y-1,0,1),to:iso(y-1,11,31)}];}

function rangePick(id,o){RPK[id]=o;const st=state.rp&&state.rp.id===id?state.rp:null;
 const txt=o.from||o.to?(o.from&&o.to?fmtRange(o.from,o.to):o.from?LT('From ','Desde ')+fmtDate(o.from):LT('Until ','Até ')+fmtDate(o.to)):(o.empty||LT('Any date','Qualquer data'));
 const act=(o.presets||[]).find(p=>p.k===o.active);
 return `<div class="rp"><button class="rpbtn${st?' on':''}" data-act="rpOpen" data-id="${id}" type="button">${ic('week',16)}<span class="ell">${act?`<b>${esc(act.l)}</b> · `:''}${esc(txt)}</span>${ic('chev',14)}</button>${st?rpCard(id,o,st):''}</div>`;}

function rpCard(id,o,st){const max=o.max||TODAY_ISO,a=st.a,b=st.b,hov=st.h;
 const lo=a&&(b||hov)?(a<(b||hov)?a:(b||hov)):a,hi=a&&(b||hov)?(a<(b||hov)?(b||hov):a):a;
 const month=ym=>{const y=+ym.slice(0,4),m=+ym.slice(5,7)-1,first=new Date(y,m,1,12),off=(first.getDay()+6)%7,n=new Date(y,m+1,0).getDate();
  let cells='';for(let i=0;i<off;i++)cells+='<span></span>';
  for(let d=1;d<=n;d++){const iso=`${ym}-${pad2(d)}`,dis=iso>max,inr=lo&&hi&&iso>=lo&&iso<=hi;
   cells+=`<button type="button" class="rpd${inr?' in':''}${iso===lo?' s':''}${iso===hi?' e':''}${iso===TODAY_ISO?' t':''}" data-act="rpDay" data-id="${id}" data-d="${iso}" ${dis?'disabled':''}>${d}</button>`;}
  return `<div class="rpm"><div class="rpmh">${RP_MON()[m]} ${y}</div><div class="rpg">${RP_WD().map(w=>`<span class="rpw">${w}</span>`).join('')}${cells}</div></div>`;};
 return `<div class="rpscrim" data-act="rpClose"></div><div class="rppop${st.right?' r':''}" role="dialog" aria-label="${LT('Choose dates','Escolher datas')}">
  ${(o.presets||[]).length?`<div class="rpp">${o.presets.map(p=>`<button type="button" class="${o.active===p.k?'on':''}" data-act="rpPreset" data-id="${id}" data-k="${p.k}">${esc(p.l)}</button>`).join('')}</div>`:''}
  <div class="rpc"><div class="rpnav"><button type="button" class="iconbtn" data-act="rpMove" data-id="${id}" data-n="-1" aria-label="${LT('Previous month','Mês anterior')}">${ic('back',16)}</button>
   <span class="small muted">${a&&!b?LT('Now click the last day','Agora clique no último dia'):LT('Click the first day, then the last','Clique no primeiro dia e depois no último')}</span>
   <button type="button" class="iconbtn" data-act="rpMove" data-id="${id}" data-n="1" aria-label="${LT('Next month','Mês seguinte')}" style="transform:scaleX(-1)">${ic('back',16)}</button></div>
   <div class="rpms">${month(rpMonthAdd(st.m,-1))}${month(st.m)}</div>
   <div class="rpf"><span class="small">${lo?`<b>${fmtDate(lo)}</b>${hi&&hi!==lo?' '+LT('to','a')+' <b>'+fmtDate(hi)+'</b>':''}`:'<span class="faint">—</span>'}</span>
    <span class="grow"></span>${o.clearable!==false?`<button type="button" class="btn sm ghost" data-act="rpClear" data-id="${id}">${LT('Clear','Limpar')}</button>`:''}
    <button type="button" class="btn sm pri" data-act="rpApply" data-id="${id}" ${a?'':'disabled'}>${LT('Apply','Aplicar')}</button></div></div></div>`;}

Object.assign(A,{
 rpOpen:t=>{const id=t.dataset.id,o=RPK[id];if(state.rp&&state.rp.id===id){state.rp=null;return render();}
  const end=o.to||o.from||TODAY_ISO,rc=t.getBoundingClientRect();state.rp={id,a:o.from||null,b:o.to||null,h:null,m:end.slice(0,7),right:rc.left+rc.width/2>window.innerWidth/2};render();},
 rpClose:()=>{state.rp=null;render();},
 rpMove:t=>{const r=state.rp;if(!r)return;r.m=rpMonthAdd(r.m,+t.dataset.n);render();},
 rpDay:t=>{const r=state.rp;if(!r)return;const d=t.dataset.d;if(!r.a||r.b){r.a=d;r.b=null;}else if(d<r.a){r.b=r.a;r.a=d;}else r.b=d;render();},
 rpPreset:t=>{const id=t.dataset.id,o=RPK[id],p=(o.presets||[]).find(x=>x.k===t.dataset.k);state.rp=null;if(!p)return render();
  if(o.onPreset)o.onPreset(p.k,p.from,p.to);else o.onApply(p.from,p.to);render();},
 rpApply:t=>{const r=state.rp,o=RPK[t.dataset.id];if(!r||!r.a)return;state.rp=null;o.onApply(r.a,r.b||r.a);render();},
 rpClear:t=>{const o=RPK[t.dataset.id];state.rp=null;o.onApply('','');render();},
});
/* hovering a day after the first click paints the range under the pointer (computer only) */
document.addEventListener('mouseover',e=>{const r=state.rp;if(!r||!r.a||r.b)return;const b=e.target.closest&&e.target.closest('.rpd');if(!b||b.disabled)return;
 const d=b.dataset.d;if(r.h===d)return;r.h=d;const lo=r.a<d?r.a:d,hi=r.a<d?d:r.a;
 document.querySelectorAll('.rppop .rpd').forEach(x=>{const v=x.dataset.d;x.classList.toggle('in',v>=lo&&v<=hi);x.classList.toggle('s',v===lo);x.classList.toggle('e',v===hi);});});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.rp){state.rp=null;render();}});
