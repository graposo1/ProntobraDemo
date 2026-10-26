/* ===== RGPD — access log and anonymising a customer (D-59) =====
   Access log (DB.accessLog, append only): {id, at (ISO date-time), user, as (when "view as" is on), action, kind, ref, detail}.
   ref is a number (quote id, customer number…) — never a name — so the log itself holds as little personal data as possible.
   Kept 2 years (older rows are dropped). In production: its own table, written by the API on every request, with IP and device.
   Anonymising a customer (only when every job of the customer is Finished or Aborted — it can't be undone):
   the customer becomes "Anónimo" with no personal data; on its jobs only the town of the location stays; free texts, proposal
   PDFs and emails are cleared; numbers, dates, lines, costs and prices stay, so the Statistics stay right. */

const ALOG=()=>DB.accessLog||(DB.accessLog=[]);
const ALOG_DAYS=730;
function audit(action,kind,ref,detail){if(!DB)return;if(!state.user&&action!=='loginFail')return;
 ALOG().push({id:uid('al'),at:new Date().toISOString(),user:state.user||null,as:state.viewAs||null,action,kind:kind||'',ref:ref||'',detail:String(detail||'').slice(0,240)});}
function alogPrune(){const lim=addDays(TODAY_ISO,-ALOG_DAYS);if(DB&&DB.accessLog)DB.accessLog=DB.accessLog.filter(x=>x.at.slice(0,10)>=lim);}
const AL_ACTIONS={login:['Signed in','green'],loginFail:['Sign-in failed','red'],logout:['Signed out','grey'],view:['Opened','blue'],change:['Changed','accent'],
 block:['Blocked / unblocked','amber'],delete:['Deleted','red'],download:['Downloaded','violet'],export:['Exported','violet'],viewAs:['Viewed as another user','amber'],anonymize:['Anonymised','red']};
const AL_KINDS={quote:'Quote',customer:'Customer',vendor:'Vendor',user:'User',data:'Data file',stats:'Statistics',file:'File',audit:'Access log'};

/* --- hooks: sign in / out, opening records, downloads, changes --- */
{const _ss=startSession;startSession=function(u){_ss(u);audit('login','user',u.email);alogPrune();};
 const _si=signIn;signIn=function(){const email=(document.getElementById('li-email')?.value||'').trim().toLowerCase();_si();if(!state.user&&state.loginErr&&email)audit('loginFail','user',email,state.loginErr);};
 const _so=signOut;signOut=function(silent){if(state.user)audit('logout','user',U(state.user)?.email||'');return _so(silent);};
 const _lq=logQ;logQ=function(q,t){_lq(q,t);audit('change','quote',q.id,t);};
 const wrap=(act,f)=>{const o=A[act];if(!o)return;A[act]=function(t,e){const r=o(t,e);try{f(t);}catch(x){}return r;};};
 wrap('open',t=>audit('view','quote',t.dataset.id));
 wrap('openCust',t=>audit('view','customer',C(t.dataset.id)?.no||t.dataset.id));
 wrap('pdfOpen',t=>audit('download','quote',state.qid,'Proposal PDF v'+t.dataset.v));
 wrap('pdfDown',t=>audit('download','quote',state.qid,'Proposal PDF v'+t.dataset.v));
 wrap('rcpt',t=>{const f=fileOf(t.dataset.id);audit('download','quote',f?.quote||'','Receipt');});
 wrap('rcptDl',t=>{const f=fileOf(t.dataset.id);audit('download','quote',f?.quote||'','Receipt');});
 wrap('exportDB',()=>audit('export','data','db.json'));
 wrap('custSave',()=>{const c=C(state.custId);if(c&&!state.custEdit)audit('change','customer',c.no);});
 wrap('blockCust',()=>audit('block','customer',C(state.custId)?.no||''));
 wrap('delCust',()=>{});
 wrap('blockVend',t=>audit('block','vendor',V(t.dataset.id)?.no||''));
 wrap('delUser',t=>audit('delete','user',U(t.dataset.id)?.email||t.dataset.id));
 const _md=mDelete;mDelete=function(kind,id){const x=kind==='cust'?C(id):V(id),no=x?.no;_md(kind,id);const ok=state.modal.ok;state.modal.ok=function(){const r=ok();audit('delete',kind==='cust'?'customer':'vendor',no);return r;};};}

/* --- the access log screen --- */
function alSt(){return state.alog||(state.alog={user:'',action:'',from:addDays(TODAY_ISO,-30),to:TODAY_ISO,q:''});}
function alRows(){const s=alSt(),nq=norm(s.q);return ALOG().filter(x=>(!s.user||x.user===s.user||x.as===s.user)&&(!s.action||x.action===s.action)&&x.at.slice(0,10)>=s.from&&x.at.slice(0,10)<=s.to&&(!nq||norm([x.ref,x.detail,AL_KINDS[x.kind]||x.kind].join(' ')).includes(nq))).slice().reverse();}
const alTime=x=>`${fmtDate(x.at.slice(0,10))} ${new Date(x.at).toLocaleTimeString('pt-PT',{hour:'2-digit',minute:'2-digit',hour12:false})}`;
const alWho=x=>`${esc(U(x.user)?.name||(x.action==='loginFail'?'—':'?'))}${x.as?` <span class="tiny faint">${isPT()?'a ver como':'as'} ${esc(U(x.as)?.name||'?')}</span>`:''}`;
function alRec(x){const k=AL_KINDS[x.kind]||x.kind;if(x.kind==='quote'&&QR(x.ref))return `<button class="link" data-act="open" data-id="${esc(x.ref)}">${esc(x.ref)}</button>`;
 if(x.kind==='customer'){const c=CUSTOMERS.find(c=>c.no===x.ref);if(c)return `<button class="link" data-act="openCust" data-id="${c.id}">${esc(x.ref)}</button>`;}
 return `${esc(k)}${x.ref?' · '+esc(x.ref):''}`;}
function alogList(){const rows=alRows(),P_=pg('alog',rows);if(!rows.length)return '<div class="empty">Nothing in this period.</div>';
 const pill=x=>{const a=AL_ACTIONS[x.action]||[x.action,'grey'];return `<span class="pill p-${a[1]} nodot">${a[0]}</span>`;};
 return `<div class="tcard only-d"><table class="ltable"><thead><tr><th>When</th><th>Who</th><th>Action</th><th>Record</th><th>Detail</th></tr></thead><tbody>
  ${P_.items.map(x=>`<tr><td class="small" style="white-space:nowrap">${alTime(x)}</td><td>${alWho(x)}</td><td>${pill(x)}</td><td class="small">${x.kind&&x.kind!=='user'?`<span class="faint">${esc(AL_KINDS[x.kind]||x.kind)}</span> `:''}${alRec(x)}</td><td class="small muted">${esc(x.detail)}</td></tr>`).join('')}</tbody></table></div>
 <div class="mlist only-m">${P_.items.map(x=>`<div class="mcard"><div class="row between"><span class="small">${alTime(x)}</span>${pill(x)}</div><div style="margin-top:4px">${alWho(x)}</div><div class="small" style="margin-top:2px">${alRec(x)}</div>${x.detail?`<div class="tiny faint" style="margin-top:2px">${esc(x.detail)}</div>`:''}</div>`).join('')}</div>`+P_.foot;}
function vAudit(){alogPrune();const s=alSt();
 const users=[{v:'',l:'Everyone'},...USERS.map(u=>({v:u.id,l:u.name,sub:u.email}))],acts=[{v:'',l:'All actions'},...Object.entries(AL_ACTIONS).map(([k,v])=>({v:k,l:v[0]}))];
 return `${backBtn('go','data-v="settings"','Settings')}<div class="page-head"><div class="grow"><h1>Access log</h1><div class="muted small" style="margin-top:4px">${LT(`Who signed in, opened, changed, downloaded or exported what · kept ${ALOG_DAYS/365} years · ${ALOG().length} entries`,`Quem entrou, abriu, alterou, descarregou ou exportou o quê · guardado ${ALOG_DAYS/365} anos · ${ALOG().length} registos`)}</div></div>
  <button class="btn sm" data-act="alogCsv">${ic('doc',15)} Export CSV</button></div>
 <div class="sfilters"><div><span class="flabel">User</span>${combo('al-u',{opts:users,value:s.user,title:'User',onPick:v=>{s.user=v;delete state.pg?.alog;}})}</div>
  <div><span class="flabel">Action</span>${combo('al-a',{opts:acts,value:s.action,title:'Action',onPick:v=>{s.action=v;delete state.pg?.alog;}})}</div>
  <label class="f">From<input type="date" data-al="from" value="${s.from}"></label><label class="f">To<input type="date" data-al="to" value="${s.to}" max="${TODAY_ISO}"></label></div>
 <input type="search" placeholder="Search record or detail…" value="${esc(s.q)}" data-alq="1" style="margin:6px 0 12px">
 <div id="alist">${alogList()}</div>`;}
function alogCsv(){const rows=alRows();const cell=v=>{const s=String(v??'');return /[;"\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
 const head=isPT()?['Data e hora','Utilizador','A ver como','Ação','Registo','Referência','Detalhe']:['Date and time','User','Viewing as','Action','Record','Reference','Detail'];
 const csv='﻿'+[head,...rows.map(x=>[alTime(x),U(x.user)?.name||'',U(x.as)?.name||'',tr((AL_ACTIONS[x.action]||[x.action])[0]),tr(AL_KINDS[x.kind]||x.kind),x.ref,x.detail])].map(r=>r.map(cell).join(';')).join('\r\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=`registo-acessos_${alSt().from}_${alSt().to}.csv`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);
 audit('export','audit','',rows.length+' rows');toast(LT(`${rows.length} entries exported`,`${rows.length} registos exportados`));}
function auditCard(){if(!can('audit.view'))return '';const n=ALOG().filter(x=>x.at.slice(0,10)>=addDays(TODAY_ISO,-7)).length,fails=ALOG().filter(x=>x.action==='loginFail'&&x.at.slice(0,10)>=addDays(TODAY_ISO,-7)).length;
 return `<div class="card"><h3>Access log</h3><div class="small muted" style="margin:6px 0 10px">${LT(`${n} entries in the last 7 days`,`${n} registos nos últimos 7 dias`)}${fails?` · <b style="color:var(--red)">${LT(`${fails} failed sign-in${fails>1?'s':''}`,`${fails} entrada${fails>1?'s':''} falhada${fails>1?'s':''}`)}</b>`:''}. Who signed in, opened, changed, downloaded or exported what (RGPD).</div><button class="btn sm" data-act="go" data-v="audit">${ic('shield',15)} Open access log</button></div>`;}

/* --- anonymise a customer --- */
const ANON_NAME='Anónimo';
const anonWord=()=>isPT()?'ANONIMIZAR':'ANONYMISE';
function anonBtn(c){if(!can('customers.anonymize')||c.anonymized)return '';return `<button class="btn ghost danger" data-act="anonCust">${ic('eye',16)} Anonymise</button>`;}
function anonScope(c){const own=QUOTES.filter(q=>q.cust===c.id);const ids=new Set(own.map(q=>q.id));
 return {own,ids,active:own.filter(q=>['open','locked'].includes(q.status)),billOthers:QUOTES.filter(q=>!ids.has(q.id)&&q.billTo&&q.billTo.cust===c.id),
  pdfs:(DB.files||[]).filter(f=>f.kind==='proposal-pdf'&&ids.has(f.quote)),atts:(DB.files||[]).filter(f=>f.kind==='attachment'&&ids.has(f.quote)),mails:OUTBOX.filter(o=>ids.has(o.quote))};}
function mAnon(c){const sc=anonScope(c);
 if(sc.active.length){openModal('Anonymise customer',()=>`<div class="banner amber" style="font-size:13px">${ic('alert',16)}<div>Only possible when every job of this customer is <b>Finished</b> or <b>Aborted</b> — anonymising can’t be undone.</div></div>
   <div class="small" style="margin-top:12px">Still open or confirmed:</div><div style="margin-top:6px">${sc.active.map(q=>`<div class="sum-row"><button class="link" data-act="open" data-id="${q.id}">${esc(q.id)}</button><span>${statusPill(q,true)}</span></div>`).join('')}</div>`,null);return;}
 state.form={word:''};
 openModal('Anonymise customer',()=>`<div class="stack"><div class="banner red" style="font-size:13px">${ic('alert',16)}<div><b>This can’t be undone.</b> ${LT(`The personal data of <b>${esc(c.name)}</b> (${esc(c.no)}) is deleted for good.`,`Os dados pessoais de <b>${esc(c.name)}</b> (${esc(c.no)}) são apagados de vez.`)}</div></div>
  <div><div class="k">What is deleted</div><div class="small">${LT(`Name (becomes “${ANON_NAME}”), NIF, phone, email, address, notes, ${c.contacts.length} contact${c.contacts.length===1?'':'s'} and ${c.locations.length} location${c.locations.length===1?'':'s'}.`,`Nome (passa a “${ANON_NAME}”), NIF, telefone, email, morada, notas, ${c.contacts.length} contacto${c.contacts.length===1?'':'s'} e ${c.locations.length} loca${c.locations.length===1?'l':'is'}.`)}<br>
   ${LT(`On ${sc.own.length} job${sc.own.length===1?'':'s'}: customer, contact and location (only the town stays), description, notes and history texts · ${sc.pdfs.length} proposal PDF${sc.pdfs.length===1?'':'s'} · ${sc.atts.length} attachment${sc.atts.length===1?'':'s'} · ${sc.mails.length} email${sc.mails.length===1?'':'s'} in the outbox · stops on routes.`,`Em ${sc.own.length} obra${sc.own.length===1?'':'s'}: cliente, contacto e local (fica só a localidade), descrição, notas e textos do histórico · ${sc.pdfs.length} PDF${sc.pdfs.length===1?'':'s'} de propostas · ${sc.atts.length} anexo${sc.atts.length===1?'':'s'} · ${sc.mails.length} email${sc.mails.length===1?'':'s'} na caixa de saída · paragens nas rotas.`)}${sc.billOthers.length?`<br>${LT(`Billing details on ${sc.billOthers.length} other job${sc.billOthers.length===1?'':'s'} billed to this customer.`,`Dados de faturação em ${sc.billOthers.length} outra${sc.billOthers.length===1?'':'s'} obra${sc.billOthers.length===1?'':'s'} faturada${sc.billOthers.length===1?'':'s'} a este cliente.`)}`:''}</div></div>
  <div><div class="k">What stays (no personal data)</div><div class="small muted">Numbers, dates, statuses, type of work, dimensions, lines, costs, prices, vendors and expenses with receipts — so the statistics stay right.</div></div>
  <label class="f">${LT('Type','Escreva')} <b>${anonWord()}</b> ${LT('to confirm','para confirmar')}<input type="text" data-f="word" value="${esc(F().word)}" autocomplete="off"></label></div>`,
 ()=>{if((F().word||'').trim().toUpperCase()!==anonWord())return err(LT(`Type ${anonWord()} to confirm`,`Escreva ${anonWord()} para confirmar`));const n=doAnon(c);state.modal=null;toast(LT(`Customer anonymised · ${n} job${n===1?'':'s'} cleaned`,`Cliente anonimizado · ${n} obra${n===1?'':'s'} limpa${n===1?'':'s'}`));},'Anonymise');
 state.modal.danger=true;render();}
function doAnon(c){const sc=anonScope(c),by=me().id;const city=a=>({...EMPTY_ADDR(),country:'',city:(a&&a.city)||''});
 const cust={id:c.id,no:c.no,name:ANON_NAME,nif:''},bill={cust:c.id,no:c.no,name:ANON_NAME,nif:'',address:EMPTY_ADDR()};
 sc.billOthers.forEach(q=>{q.billTo={...bill};});
 sc.own.forEach(q=>{q.customer={...cust};if(q.billTo&&q.billTo.cust===c.id)q.billTo={...bill};q.contact=null;q.contactInfo=null;
  q.site={loc:null,name:'',address:city(q.site?.address)};const t=TOWNS.find(x=>x[0]===q.site.address.city);q.lat=t?t[1]:null;q.lng=t?t[2]:null;
  q.title='';q.description='';if(q.notes)q.notes='';q.log=(q.log||[]).map(([d,u])=>[d,u,'—']);
  if(q.cancel){const k=(typeof ABORT_REASONS!=='undefined'?ABORT_REASONS:[]).find(o=>q.cancel.reason===o||q.cancel.reason.startsWith(o+' — '));q.cancel.reason=k||'Other';}
  q.versions.forEach(v=>{v.sentTo=null;if(v.rejected)v.rejected.note='';if(v.snap){v.snap.customer={...cust};v.snap.billTo={...bill};v.snap.contact=null;v.snap.site={...q.site};v.snap.title='';v.snap.description='';}delete v.pdf;});
  if(q.visit){q.visit.route=null;q.visit.date=null;}q.anonymized={date:TODAY_ISO,by};});
 DB.files=(DB.files||[]).filter(f=>!((f.kind==='proposal-pdf'||f.kind==='attachment')&&sc.ids.has(f.quote)));
 sc.mails.forEach(o=>{o.to={contact:null,name:'',email:''};o.subject='';o.body='';});
 (DB.routes||[]).forEach(r=>{r.stops=(r.stops||[]).filter(s=>!sc.ids.has(s.q));});
 Object.assign(c,{name:ANON_NAME,nif:'',phone:'',email:'',billing:EMPTY_ADDR(),notes:'',contacts:[],locations:[],blocked:true,anonymized:{date:TODAY_ISO,by}});
 /* the log keeps who anonymised what and when, without the deleted data */
 ALOG().forEach(x=>{if((x.kind==='quote'&&sc.ids.has(x.ref))||(x.kind==='customer'&&x.ref===c.no))x.detail='';});
 audit('anonymize','customer',c.no,`${sc.own.length} job${sc.own.length===1?'':'s'}`);return sc.own.length;}

Object.assign(A,{
 anonCust:()=>{const c=C(state.custId);if(c)mAnon(c);},
 alogCsv:()=>alogCsv(),
});
Object.assign(PERM_OF,{anonCust:'customers.anonymize',alogCsv:'audit.view'});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset&&t.dataset.al&&state.view==='audit'){if(t.value)alSt()[t.dataset.al]=t.value;delete state.pg?.alog;render();}});
document.addEventListener('input',e=>{const t=e.target;if(t.dataset&&t.dataset.alq&&state.view==='audit'){alSt().q=t.value;delete state.pg?.alog;const el=document.getElementById('alist');if(el){el.innerHTML=alogList();watchMore();}}});
