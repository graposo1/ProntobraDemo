/* ===== Forms & modals (full-screen on mobile) ===== */
function openModal(title,body,ok,okLabel){state.dimPend={};state.formErr=null;state.modal={title,body,ok,okLabel};render();}
function closeModal(){state.modal=null;state.formErr=null;stopVoice();render();}
const F=()=>state.form;
/* Form problems (missing contact, no customer…) show as an alert banner at the top of the form, like the app's other alerts — not as a passing toast */
const err=m=>{state.formErr=m;render();setTimeout(()=>document.querySelector('.formerr')?.scrollIntoView({block:'nearest',behavior:'smooth'}),0);return false;};
const formErrHtml=()=>state.formErr?`<div class="banner red formerr" role="alert" style="margin-bottom:14px">${ic('alert',18)}<div>${esc(state.formErr)}</div></div>`:'';

/* Quick add: a new quote — phone / email / voice */
/* Specialty suggestions from the description: keywords per ESPECIALIDADE value, plus any value whose name appears in the text */
const KEYWORDS={ELETRICIDADE:['eletric','electric','luz','ilumina','led','tomada','quadro'],CANALIZACAO:['canaliz','agua','torneira','esgoto','cano','autoclismo','sanita'],PINTURA:['pint','tinta'],ALVENARIA:['parede','muro','alvenaria','reboco','fissura'],LADRILHOS:['azulejo','mosaico','ladrilh'],CARPINTARIA:['madeira','porta','carpint','armario','balcao','soalho'],AVAC:['ar condicionado','climatiz','aquecimento'],TELHADOS:['telhado','telha','cobertura'],IMPERMEABILIZACAO:['infiltra','humidade','imperme']};
const suggestSpecs=(t,dims)=>{const n=norm(t);if(!n)return [];return DB.settings.dimensions.flatMap(d=>d.values.filter(v=>!dvals(dims,d.code).includes(v.code)&&((KEYWORDS[v.code]||[]).some(w=>n.includes(w))||(v.name&&n.includes(norm(v.name))))).map(v=>({d:d.code,v:v.code,l:v.name||v.code})));};
const sugHtml=sug=>sug.length?`<div class="row wrap" style="margin-top:8px"><span class="tiny faint">Suggested from description:</span>${sug.map(s=>`<button class="chip" data-act="addSpec" data-d="${esc(s.d)}" data-v="${esc(s.v)}">+ ${esc(s.l)}</button>`).join('')}</div>`:'';
/* A site typed on a quote is a one-off: it stays on the quote only. If it matches one of the customer's locations it is linked to it;
   it is added to the customer's locations only when the user ticks "Save as a location of this customer" (save=true). */
function ensureLocation(cu,site,save){if(!cu||site.loc||addrEmpty(site.address))return false;
 const key=norm(addrStr(site.address));const hit=cu.locations.find(l=>norm(addrStr(l.address))===key);
 if(hit){site.loc=hit.id;if(!site.name)site.name=hit.name||'';return false;}
 if(!save)return false;
 const l={id:uid('loc'),name:site.name||site.address.line1||site.address.city||'Location',address:addrOf(site.address),notes:''};cu.locations.push(l);site.loc=l.id;if(!site.name)site.name=l.name;return true;}
function mQuickAdd(){
 state.form={cust:'',ncType:'person',ncName:'',ncPhone:'',ncEmail:'',ncAddr:EMPTY_ADDR(),contact:'',title:'',desc:'',tpl:'',dims:{},site:'billing',siteName:'',siteAddr:EMPTY_ADDR(),saveLoc:false,visit:true,urgent:false};
 openModal('New quote',()=>{const f=F();const cu=f.cust&&f.cust!=='__new'?C(f.cust):null;const sug=suggestSpecs(f.desc,f.dims);const qt=qtOf(f.tpl);
  const siteOpts=[{v:'none',l:'Not set yet',group:'Location of the work'},{v:'billing',l:cu?'Customer billing address':'Same as the new customer’s address',sub:cu?addrStr(cu.billing):'',group:'Location of the work'},...(cu?locOpts(cu).map(o=>({...o,group:'Customer locations'})):[]),{v:'custom',l:'Other address…',sub:'Type it — it is saved as a location for this customer',group:'Location of the work'}];
  const isNew=f.cust==='__new',sec=(n,t,sub)=>`<div class="qa-sec"><span class="qa-n">${n}</span><div><b>${t}</b>${sub?`<div class="tiny faint">${sub}</div>`:''}</div></div>`;
  return `<div class="stack">
   ${sec(1,'Customer','Who is the job for')}
   <div>${combo('qa-cust',{opts:[{v:'__new',l:'+ New customer',sub:'Create the customer now — name, phone, email and address',group:'New'},...custOpts().map(o=>({...o,group:'Customers'}))],value:f.cust,placeholder:'Search by name, number, town or NIF…',title:'Customer',onPick:v=>{f.cust=v;f.site='billing';f.contact=v!=='__new'?(C(v).contacts.find(x=>x.primary)||C(v).contacts[0]).id:'';}})}</div>
   ${isNew?`<div class="qa-new"><div class="row between" style="gap:8px"><div><b>${ic('user',15)} New customer</b><div class="tiny faint">Saved in the Directory — the rest of the details can be added later.</div></div><button class="btn sm ghost" data-act="fset" data-k="cust" data-v="">Pick an existing one</button></div>
    <div class="seg">${[['person','Private'],['company','Company']].map(([k,l])=>`<button class="${f.ncType===k?'on':''}" data-act="fset" data-k="ncType" data-v="${k}">${l}</button>`).join('')}</div>
    <div class="grid2"><label class="f">Customer name<input type="text" data-f="ncName" value="${esc(f.ncName)}" placeholder="Company or person"></label><label class="f">Customer phone<input type="tel" data-f="ncPhone" value="${esc(f.ncPhone)}" placeholder="+351…"></label></div>
    <label class="f">Customer email <span class="faint" style="font-weight:400">(optional)</span><input type="email" data-f="ncEmail" value="${esc(f.ncEmail||'')}" placeholder="name@company.pt"></label>
    <div><span class="flabel">Customer billing address <span class="faint" style="font-weight:400">(optional)</span></span>${addrForm('ncAddr',f.ncAddr)}</div></div>`
   :cu?`<div class="qa-cu small"><b>${esc(cu.name)}</b> <span class="mono tiny faint">${esc(cu.no||'')}</span><div class="muted">${esc([cu.phone,cu.email,cu.billing.city].filter(Boolean).join(' · '))||'—'}</div></div>`:''}
   ${sec(2,'Job','What needs to be done and where')}
   ${cu?`<div><span class="flabel">Contact for this job</span>${combo('qa-contact',{opts:contactOpts(cu),value:f.contact,title:'Contact',onPick:v=>{f.contact=v;}})}</div>`:isNew?`<div class="tiny faint">Contact for this job: the new customer (more contacts can be added later).</div>`:''}
   <div><span class="flabel">Template <span class="faint" style="font-weight:400">(optional — fills in the dimensions)</span></span>${combo('qa-qtype',{opts:qtypeOpts(),value:f.tpl,placeholder:'Choose a quote template…',title:'Quote template',onPick:v=>{const o=qtOf(f.tpl);if(!f.title.trim()||(o&&f.title===o.name))f.title=String(qtOf(v)?.name||'').slice(0,TITLE_MAX);f.tpl=v;}})}
    ${Object.keys(f.dims).length||qt?`<div class="tagline" style="margin-top:8px">${dimPills(dimMerge(normDims(qt?qt.dims:{}),f.dims),'')}</div>`:''}</div>
   <label class="f">Description <span class="faint" style="font-weight:400">(up to ${TITLE_MAX} characters — the template’s name by default)</span><input type="text" maxlength="${TITLE_MAX}" data-f="title" value="${esc(f.title)}" placeholder="e.g. Bathroom remodelling — 1st floor"></label>
   <div><span class="flabel">Description 2 — what needs to be done? <span class="faint" style="font-weight:400">(up to ${DESC_MAX} characters)</span></span>
    <div class="row" style="align-items:flex-start"><textarea id="qa-desc" maxlength="${DESC_MAX}" data-f="desc" placeholder="Type, paste an email, or tap the mic and speak…">${esc(f.desc)}</textarea>
    <button class="mic ${state.rec?'rec':''}" data-act="voice" aria-label="Dictate">${ic('mic',20)}</button></div>
    <div class="tiny faint" style="margin-top:4px">${state.rec?'<b style="color:var(--red)">Listening…</b> tap the mic to stop.':'Paste the client’s email or message, or dictate it.'}</div><div id="qa-sug">${sugHtml(sug)}</div></div>

   <div><span class="flabel">Location of the work</span>${combo('qa-site',{opts:siteOpts,value:f.site,title:'Location of the work',disabled:!f.cust,placeholder:'Pick a customer first',onPick:v=>{f.site=v;}})}</div>
   ${f.site==='custom'?`<label class="f">Location name (optional)<input type="text" data-f="siteName" value="${esc(f.siteName)}" placeholder="e.g. Warehouse"></label><div><span class="flabel">Address of the work</span>${addrForm('siteAddr',f.siteAddr)}</div><label class="check"><input type="checkbox" data-f="saveLoc" ${f.saveLoc?'checked':''}> Save as a location of this customer <span class="faint">(otherwise it is a one-off address, kept only on this job)</span></label>`:''}
   <label class="check"><input type="checkbox" data-f="urgent" ${f.urgent?'checked':''}> Urgent</label></div>`;},
 ()=>{const f=F();if(!f.cust)return err('Pick a customer');if(f.cust==='__new'&&!f.ncName)return err('Add the customer name');
  f.ncEmail=(f.ncEmail||'').trim();if(f.cust==='__new'&&f.ncEmail&&!validEmail(f.ncEmail))return err('The customer email doesn’t look valid');
  if(f.cust==='__new'&&noOpen('customer'))return err(noSeriesMsg('customer'));if(noOpen('quote'))return err(noSeriesMsg('quote'));
  let cu=f.cust==='__new'?null:C(f.cust);
  if(!cu){cu={id:uid('c'),no:nextNo('customer'),type:f.ncType||'person',name:f.ncName,nif:'',phone:f.ncPhone||'',email:f.ncEmail||'',billing:addrOf(f.ncAddr),locations:[],notes:'Created from quick add — complete the details.',contacts:[{id:uid('ct'),self:true,name:f.ncName,role:'',phone:f.ncPhone||'',email:f.ncEmail||'',primary:true}]};CUSTOMERS.push(cu);}
  let site=siteSnap(null);
  if(f.site==='billing')site={loc:null,name:'',address:addrOf(cu.billing)};
  else if(f.site==='custom'){site={loc:null,name:f.siteName,address:addrOf(f.siteAddr)};ensureLocation(cu,site,f.saveLoc);}
  else if(f.site!=='none'){const l=cu.locations.find(x=>x.id===f.site);if(l)site=siteSnap(l);}
  const ct=cu.contacts.find(x=>x.id===f.contact)||cu.contacts.find(x=>x.primary)||cu.contacts[0];
  const id=nextQuoteId();const ll=townXY(site.address.city||cu.billing.city);
  const qt=qtOf(f.tpl);const dims=dimMerge(dimMerge(dimCopy(cu.dims),qt?qt.dims:{}),f.dims);
  QUOTES.push(Q({id,dims,cust:cu.id,customer:custSnap(cu),billTo:billSnap(cu),contact:ct.id,contactInfo:contactSnap(ct),site,title:(f.title.trim()||(qt?qt.name:'')).slice(0,TITLE_MAX),description:String(f.desc||'').slice(0,DESC_MAX),lat:ll.lat,lng:ll.lng,status:'open',since:TODAY_ISO,created:TODAY_ISO,owner:me().id,cm:me().id,urgent:f.urgent,visit:{needed:false,date:null,done:false,route:null},log:[[TODAY_ISO,me().id,`Quote created from ${f.src}${state.usedVoice?' (voice)':''}`],...(qt?[[TODAY_ISO,me().id,`Template applied: ${qt.name}`]]:[])]}));
  state.usedVoice=false;state.modal=null;stopVoice();
  /* open the new job straight away */
  state.abar=null;state.view='quote';state.qid=id;state.tab='summary';state.qmore=false;state.combo=null;window.scrollTo(0,0);toast(`${id} created`);},'Create quote');}

/* Voice: real speech recognition when served over http(s), otherwise a demo transcript */
let REC=null,SIM=null;
const DEMO_SPEECH='Ligou o Sr. Manuel Ferreira, da padaria de Queluz. Tem uma infiltração no teto do armazém e quer trocar a iluminação para LED. Prefere visita de manhã, antes das 11h.';
function stopVoice(){try{REC&&REC.stop();}catch(e){}REC=null;clearInterval(SIM);SIM=null;state.rec=false;}
function startVoice(){const f=F();state.rec=true;state.usedVoice=true;render();
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;const base=f.desc?f.desc+' ':'';
 const put=t=>{f.desc=(base+t).slice(0,DESC_MAX);const ta=document.getElementById('qa-desc');if(ta)ta.value=f.desc;const s=document.getElementById('qa-sug');if(s)s.innerHTML=sugHtml(suggestSpecs(f.desc,f.dims));};
 const simulate=()=>{let i=0;clearInterval(SIM);SIM=setInterval(()=>{i+=3;put(DEMO_SPEECH.slice(0,i));if(i>=DEMO_SPEECH.length){clearInterval(SIM);SIM=null;state.rec=false;render();}},40);};
 if(SR&&location.protocol.startsWith('http')){try{REC=new SR();REC.lang='pt-PT';REC.interimResults=true;REC.continuous=true;
  REC.onresult=e=>{let t='';for(let k=0;k<e.results.length;k++)t+=e.results[k][0].transcript;put(t);};
  REC.onerror=()=>{REC=null;simulate();};REC.onend=()=>{if(REC){REC=null;state.rec=false;render();}};REC.start();return;}catch(e){}}
 simulate();}

/* "Replace vendor" was removed on 26-10-2026 (D-69): to change the vendor, remove the line and add the new one. */

/* The same fields in "Add line" and "Edit line" (25-10-2026): Unit · Quantity · Cost, then the client price.
   Client price: "Fixed value" (default for new lines) or "Own markup". */
const linePriceBlock=(f,extra='')=>{const grp=f.kidsN>0,cost=(+f.qty||0)*(+f.cost||0)+(grp?+f.kidsCost||0:0),sell=+f.sell||0,m=(+f.markup||0)/100;
 return `<div><span class="flabel">${grp?LT(`Client price for the group (this line + ${f.kidsN} resource${f.kidsN>1?'s':''})`,`Preço ao cliente do grupo (esta linha + ${f.kidsN} recurso${f.kidsN>1?'s':''})`):'Client price for this line'}</span><div class="seg">${[['flat','Fixed value'],['pct','Own markup']].map(([k,t])=>`<button class="${f.pmode===k?'on':''}" data-act="fset" data-k="pmode" data-v="${k}">${t}</button>`).join('')}</div>
  ${f.pmode==='flat'?`<label class="f" style="margin-top:8px">Client value for this line, excl. VAT (€)<input type="number" step="0.01" min="0" data-f="sell" data-rerender="1" value="${esc(f.sell)}" placeholder="can be set later"></label>
   <div class="tiny faint" style="margin-top:6px"><span>Cost ${eur2(cost)}</span>${f.sell!==''&&f.sell!=null?` · <span>${sell?'margin '+pct((sell-cost)/sell):'no margin'}</span>`:` · <span>optional — without it the line counts 0 € until it is filled in</span>`}</div>`
  :`<label class="f" style="margin-top:8px">${grp?LT('Markup on the group’s cost (%)','Acréscimo sobre o custo do grupo (%)'):'Markup on this line’s cost (%)'}<input type="number" step="any" min="0" data-f="markup" data-rerender="1" value="${esc(f.markup)}"></label>
   <div class="tiny faint" style="margin-top:6px"><span>Cost ${eur2(cost)}</span> · <span>client price ${eur2(cost*(1+m))}</span></div>`}${extra}</div>`;};
const lineQtyCost=(f,isL,r)=>isL
 ?`<div class="grid3"><div><span class="flabel">Unit</span>${combo('ln-unit',{opts:unitOpts(),value:f.unit,title:'Unit',onPick:v=>{f.unit=v;}})}</div><label class="f">Quantity (${esc(f.unit)})<input type="number" step="any" data-f="qty" data-rerender="1" value="${esc(f.qty)}"></label>
   <label class="f">Cost per ${esc(f.unit)} (€)<input type="number" step="0.01" min="0" data-f="cost" data-rerender="1" value="${esc(f.cost)}" placeholder="0.00"></label></div>`
 :`<div class="grid2"><label class="f">Quantity${r?' ('+esc(r.unit)+')':''}<input type="number" step="any" data-f="qty" data-rerender="1" value="${esc(f.qty)}"></label>
   <label class="f">Unit cost (€)${r?' per '+esc(r.unit):''}<input type="number" step="0.01" min="0" data-f="cost" data-rerender="1" value="${esc(f.cost)}" placeholder="${r&&price(r)==null?'no price set — enter it':'0.00'}"></label></div>`;
/* reads the client-price fields into the line; returns an error text or '' */
function setLinePrice(l,f){if(f.pmode==='flat'){const e=f.sell===''||f.sell==null;if(!e&&!(+f.sell>=0))return 'The client value must be 0 or more';l.pmode='flat';l.sell=e?null:Math.round(+f.sell*100)/100;l.markup=null;}
 else{if(f.markup===''||f.markup==null||!(+f.markup>=0))return 'Enter the markup for this line';l.pmode='pct';l.markup=Math.round(+f.markup*10)/1000;l.sell=null;}return '';}
const DEF_LABOR_UNIT=()=>DB.settings.units.some(u=>u.code==='day')?'day':(DB.settings.units[0]?.code||'job');
function mAddLine(q,pre={}){const par=pre.parent?q.lines.find(x=>x.id===pre.parent):null;
 /* vendor's unit and cost per unit (D-71) fill in a new labour line */
 const pv=(pre.kind||'labor')==='labor'&&pre.ref?V(pre.ref):null;
 state.form={kind:par?'resource':pre.kind||'labor',ref:pre.ref||'',desc:pre.desc||'',qty:pre.qty||1,cost:pre.cost||(pv&&pv.cost!=null&&can('quotes.costs')?pv.cost:''),unit:pre.unit||(pv&&pv.unit)||DEF_LABOR_UNIT(),pmode:'flat',sell:'',markup:'',parent:par?par.id:null};
 openModal(par?LT(`Add resource to ${lineName(par)}`,`Adicionar recurso a ${lineName(par)}`):'Add line',()=>{const f=F();const isL=f.kind==='labor';
  const opts=isL?vendorOpts(q):RESOURCES.map(r=>({v:r.id,l:r.name,sub:price(r)!=null?`${eur2(price(r))} per ${r.unit} · updated ${fmtDate(priceOn(r))}`:`${r.unit} · no price — enter the cost on the line`}));
  const a=isL&&f.ref?avail(f.ref,q.workStart,q.workEnd,q.id):null;const ai=a&&availInfo(a);
  return `<div class="stack">${par?`<div class="small muted">${LT(`Sub-line of <b>${esc(par.desc)}</b> · ${esc(lineName(par))}. It only has a cost — the client price is set on the vendor line, for the whole group. Extra labour (e.g. a helper) is added as a resource.`,`Sub-linha de <b>${esc(par.desc)}</b> · ${esc(lineName(par))}. Só tem custo — o preço ao cliente define-se na linha do fornecedor, para o grupo inteiro. Mão de obra extra (ex.: um ajudante) entra como recurso.`)}</div>`:`<div class="seg">${[['labor','Vendor / labor'],['resource','Resource']].map(([k,l])=>`<button class="${f.kind===k?'on':''}" data-act="fset" data-k="kind" data-v="${k}" data-reset="ref">${l}</button>`).join('')}</div>`}
   <div><span class="flabel">${isL?'Vendor':'Resource'}</span>${combo('al-ref',{opts,value:f.ref,placeholder:isL?'Search vendors…':'Search resources…',title:isL?'Vendor':'Resource',onPick:v=>{f.ref=v;if(isL){const vv=V(v);if(!f.desc)f.desc=lineDescFor(q,vv);if(vv.unit)f.unit=vv.unit;if(vv.cost!=null&&can('quotes.costs'))f.cost=vv.cost;}else{if(!f.desc)f.desc=R(v).name;f.cost=price(R(v))??'';}}})}${!isL&&can('resources.price')?`<div style="margin-top:6px"><button class="link" data-act="newResLine">+ New resource</button> <span class="tiny faint">not in the list? add it with its unit and price</span></div>`:''}</div>
   ${a?`<div class="banner ${ai.c==='green'?'info':ai.c}" style="font-size:13px">${ic(a.lvl==='ok'?'check':'alert',16)}<div>${esc(V(f.ref).name)}: ${esc(ai.t)}${a.items.length>1?` (+${a.items.length-1} more)`:''}</div></div>`:''}
   <label class="f">Description${isL?' (type of work)':''}<input type="text" data-f="desc" value="${esc(f.desc)}" placeholder="${isL?'e.g. Tiling — 2 bathrooms':'e.g. Fuel'}"></label>
   ${lineQtyCost(f,isL,!isL&&f.ref?R(f.ref):null)}
   ${isL?`<div class="tiny faint">The vendor’s price is agreed for each job and entered here, on the line.</div>`:''}
   ${!isL?`<div class="tiny faint">${f.ref&&price(R(f.ref))!=null?'The resource price is filled in and can be changed for this line. ':''}The cost stays fixed on this line, even if the resource price changes later.</div>`:''}
   ${can('quotes.costs')&&!par?linePriceBlock(f):''}</div>`;},
 ()=>{const f=F();if(!f.ref)return err('Pick a '+(f.kind==='labor'?'vendor':'resource'));
  const id=uid('L');const l=f.kind==='labor'?lab(id,f.ref,f.desc||lineDescFor(q,V(f.ref))||V(f.ref).name,+f.qty||1,f.unit||DEF_LABOR_UNIT(),+f.cost||0):res(id,f.ref,f.desc||R(f.ref).name,+f.qty||1,f.cost!==''&&f.cost!=null?{cost:+f.cost}:{});
  if(par){/* sub-line (D-68): only a cost; goes right after the group's last line */
   l.parentLine=par.id;l.pmode=null;l.sell=null;l.markup=null;
   const grp=[par,...subLines(q,par)],at=q.lines.indexOf(grp[grp.length-1])+1;q.lines.splice(at,0,l);
   logQ(q,`Resource added to ${par.desc} (${lineName(par)}): ${l.desc}`);state.modal=null;toast(LT('Resource added to the vendor line','Recurso adicionado à linha do fornecedor'));return;}
  if(can('quotes.costs')){const e=setLinePrice(l,f);if(e)return err(e);}
  if(l.pmode==='flat'&&l.sell!=null)l.sellCost=l.qty*lineCost(l);
  q.lines.push(l);logQ(q,`Line added: ${l.desc} (${l.refName})`);state.modal=null;toast('Line added');},par?LT('Add resource','Adicionar recurso'):'Add line');}

/* Company information — the company using the app; its name and address head the proposals */
function mCompany(){const c=COMPANY();state.form={name:c.name||'',address:addrOf(c.address)};
 openModal('Company information',()=>{const f=F();return `<div class="stack"><div class="small muted">The company using Raposo Solutions. The name and address are printed at the top of every proposal.</div>
  <label class="f">Name<input type="text" data-f="name" value="${esc(f.name)}" placeholder="e.g. Construções Silva, Lda"></label>
  <div><span class="flabel">Address</span>${addrForm('address',f.address)}</div></div>`;},
 ()=>{const f=F();if(!f.name.trim())return err('Add the company name');const c=COMPANY();c.name=f.name.trim();c.address=addrOf(f.address);state.modal=null;toast('Company information saved');},'Save');}
function mDates(q,thenAccept){state.form={s:q.workStart||addDays(TODAY_ISO,14),e:q.workEnd||addDays(TODAY_ISO,18),reason:''};
 openModal(thenAccept?'Lock — set job dates':'Job dates',()=>{const f=F();const conf=q.lines.filter(l=>l.kind==='labor'&&!l.done).map(l=>({l,a:avail(l.ref,f.s,f.e,q.id)})).filter(x=>x.a.lvl!=='ok');
  return `<div class="grid2"><label class="f">Start<input type="date" data-f="s" data-rerender="1" value="${f.s}"></label><label class="f">End<input type="date" data-f="e" data-rerender="1" value="${f.e}"></label></div>
  ${q.workStart&&!thenAccept?`<label class="f" style="margin-top:12px">Reason for the change<input type="text" data-f="reason" value="${esc(f.reason)}" placeholder="e.g. Client asked to start a week later"></label>`:''}
  <div style="margin-top:14px">${conf.length?conf.map(x=>`<div class="banner ${availInfo(x.a).c}" style="font-size:13px;margin-top:6px">${ic('alert',16)}<div>${esc(V(x.l.ref).name)}: ${esc(availInfo(x.a).t)}</div></div>`).join(''):q.lines.some(l=>l.kind==='labor')?`<div class="banner info" style="font-size:13px">${ic('check',16)}<div>All vendors on this quote are free on these dates.</div></div>`:''}</div>`;},
 ()=>{const f=F();if(!f.s||!f.e||f.e<f.s)return err('Check the dates');const old=fmtRange(q.workStart,q.workEnd);q.workStart=f.s;q.workEnd=f.e;
  logQ(q,`Work dates ${old} → ${fmtRange(f.s,f.e)}${f.reason?' ('+f.reason+')':''}`);
  state.modal=null;if(thenAccept)doLock(q);else toast('Job dates updated');},thenAccept?'Lock':'Save dates');}
function mCancel(q,preset){state.form={reason:preset||'Client no longer needs it',note:''};
 openModal('Abort',()=>{const f=F();return `<span class="flabel">Reason</span>${combo('cx-reason',{opts:['Client rejected proposal — price','Client rejected proposal — other','Client no longer needs it','Duplicate request','No vendors available','Other'].map(x=>({v:x,l:x})),value:f.reason,title:'Reason',onPick:v=>{f.reason=v;}})}
  <label class="f" style="margin-top:12px">Note (optional)<input type="text" data-f="note" value="${esc(f.note)}"></label>`;},
 ()=>{const f=F();q.cancel={reason:f.reason+(f.note?' — '+f.note:''),date:TODAY_ISO};setStatus(q,'aborted','Aborted: '+q.cancel.reason);state.modal=null;toast('Aborted');},'Abort quote');}
/* the site visit date is set in Routes (planning), not on the job */
/* Mark done — records who in fact did each part */
function mDone(q){const lb=q.lines.filter(l=>l.kind==='labor');state.form={date:TODAY_ISO,by:Object.fromEntries(lb.map(l=>[l.id,l.doneBy||l.ref]))};
 openModal('Finish job',()=>{const f=F();return `<div class="small muted">Record who in fact did each part of the job.</div>
  ${lb.map(l=>`<div style="margin-top:14px"><span class="flabel">${esc(l.desc)}</span>${combo('dn-'+l.id,{opts:vendorOpts(q),value:f.by[l.id],title:'Done by',onPick:v=>{f.by[l.id]=v;}})}
   ${f.by[l.id]!==l.ref?`<div class="tiny" style="color:var(--amber);margin-top:4px">${esc(LT(`Planned: ${lineName(l)} — the line keeps its vendor; “done by” records who did it.`,`Previsto: ${lineName(l)} — a linha fica com o seu fornecedor; o “feito por” regista quem fez.`))}</div>`:''}</div>`).join('')}
  <label class="f" style="margin-top:14px">Finished on<input type="date" data-f="date" value="${f.date}"></label>`;},
 ()=>{const f=F();lb.forEach(l=>{const by=f.by[l.id];l.done=l.done||f.date;l.doneBy=by;l.doneByName=V(by).name;});
  q.workDone=f.date;setStatus(q,'finished',`Work done · ${lb.map(l=>l.doneByName).join(', ')}`);state.modal=null;toast('Job finished');},'Finish job');}
function mVendor(id){const v=id?V(id):{type:'person',off:[],dims:DB.settings.dimensions.length?{[DB.settings.dimensions[0].code]:[]}:{}};const ed=can('vendors.edit');
 state.form={name:v.name||'',type:v.type,phone:v.phone||'',nif:v.nif||'',address:addrOf(v.address),dims:JSON.parse(JSON.stringify(v.dims||{})),unit:v.unit||'',cost:v.cost??''};
 openModal(id?`${v.name}${v.blocked?' · blocked':''}`:'New vendor',()=>{const f=F();const bs=id?bookings(id):[];const done=id?QUOTES.filter(q=>q.lines.some(l=>l.doneBy===id)):[];
  return `${id?`<div class="k">Bookings</div>${bs.length?bs.map(b=>`<div class="sum-row"><span>${b.kind==='off'?esc(b.reason):`<button class="link" data-act="open" data-id="${b.q.id}">${b.q.id}</button> ${esc(qCust(b.q))} · ${esc(qPlace(b.q))}`}</span><span class="small ${b.firm?'':'faint'}">${fmtRange(b.start,b.end)}${b.firm?'':' (proposal)'}</span></div>`).join(''):'<div class="small faint">No bookings.</div>'}
   <div class="k" style="margin-top:14px">Jobs done</div>${done.length?done.map(q=>`<div class="sum-row"><span>${q.id} ${esc(qCust(q))} · ${esc(qPlace(q))}</span><span class="small">${fmtDate(q.lines.find(l=>l.doneBy===id).done)}</span></div>`).join(''):'<div class="small faint">None yet.</div>'}<div style="height:16px"></div>`:''}
   ${ed?`<div class="stack">${id?`<div class="mono faint small">${esc(v.no)}</div>`:`<div class="tiny faint">Number <span class="mono">${peekNo('vendor')}</span> is assigned when saved.</div>`}<div class="seg">${[['person','Person'],['company','Company']].map(([k,l])=>`<button class="${f.type===k?'on':''}" data-act="fset" data-k="type" data-v="${k}">${l}</button>`).join('')}</div>
   <label class="f">Name<input type="text" data-f="name" value="${esc(f.name)}"></label>
   <div><span class="flabel">Address</span>${addrForm('address',f.address)}</div>
   <div class="grid2"><label class="f">Phone<input type="tel" data-f="phone" value="${esc(f.phone)}"></label><label class="f">NIF<input type="text" data-f="nif" value="${esc(f.nif)}"></label></div>
   <div><div class="grid2"><div><span class="flabel">${LT('Unit','Unidade')} <span class="faint" style="font-weight:400">(${LT('optional','opcional')})</span></span>${combo('vd-unit',{opts:[{v:'',l:LT('No unit','Sem unidade')},...unitOpts()],value:f.unit,title:LT('Unit of measure','Unidade de medida'),placeholder:LT('Pick a unit…','Escolher unidade…'),onPick:x=>{f.unit=x;}})}</div>
    ${can('quotes.costs')?`<label class="f">${LT('Cost per unit (€)','Custo por unidade (€)')} <span class="faint" style="font-weight:400">(${LT('optional','opcional')})</span><input type="number" step="0.01" min="0" inputmode="decimal" data-f="cost" value="${esc(f.cost)}" placeholder="${esc(LT('no value','sem valor'))}"></label>`:''}</div>
    <div class="tiny faint" style="margin-top:4px">${LT('Filled in when this vendor is added to a job. The price is still agreed for each job and can be changed on the line.','Vêm já preenchidos quando se junta este fornecedor a uma obra. O preço continua a ser acordado em cada obra e muda-se na linha.')}</div></div>
   ${dimsFor().length?`<div><span class="flabel">Dimensions</span>${dimEditor('vend',f.dims)}</div>`:''}</div>`:`<div class="lock">${ic('lock',14)} Editing vendors is limited to ${esc(rolesWith('vendors.edit'))}</div>`}`;},
 ed?()=>{const f=F();if(!f.name.trim())return err('Add a name');if(!id&&noOpen('vendor'))return err(noSeriesMsg('vendor'));const o=id?v:{id:uid('v'),no:nextNo('vendor'),off:[]};if(can('quotes.costs')&&f.cost!==''&&f.cost!=null&&!(+f.cost>=0))return err(LT('The cost must be 0 or more','O custo tem de ser 0 ou mais'));
  Object.assign(o,{name:f.name,dims:normDims(f.dims),address:addrOf(f.address),type:f.type,phone:f.phone,nif:f.nif,unit:f.unit||''});if(can('quotes.costs'))o.cost=f.cost===''||f.cost==null?null:Math.round(+f.cost*100)/100;delete o.rate;if(!id)VENDORS.push(o);state.modal=null;toast('Vendor saved');}:null,'Save');
 if(id&&ed){const used=vendInUse(v);state.modal.extra=`<span class="row" style="margin-right:auto;gap:6px"><button class="btn ghost" data-act="blockVend" data-id="${v.id}">${ic(v.blocked?'unlock':'lock',14)} ${v.blocked?'Unblock':'Block'}</button>${used?'':`<button class="btn ghost danger" data-act="delVend" data-id="${v.id}">${ic('trash',14)} Delete</button>`}</span>`;render();}}
/* Resource — name, unit and unit price (dated history) */
function mResource(id,after){const r=id?R(id):null;
 state.form={name:r?r.name:'',unit:r?r.unit:(DB.settings.units[0]?.code||'unit'),price:r?(price(r)??''):''};
 openModal(r?r.name:'New resource',()=>{const f=F();const used=r?QUOTES.filter(q=>q.status!=='aborted'&&q.lines.some(l=>l.ref===r.id)).length:0;
  return `<div class="stack">${r?`<div class="mono faint small">${esc(r.no)}</div>`:`<div class="tiny faint">Number <span class="mono">${peekNo('resource')}</span> is assigned when saved.</div>`}<label class="f">Name<input type="text" data-f="name" value="${esc(f.name)}" placeholder="e.g. Plasterboard 12.5 mm"></label>
   <div class="grid2"><div><span class="flabel">Unit</span>${combo('rs-unit',{opts:unitOpts(),value:f.unit,title:'Unit of measure',placeholder:'Pick a unit…',onPick:v=>{f.unit=v;}})}<div class="tiny faint" style="margin-top:4px">Missing one? Add it in Settings → Units of measure.</div></div>
   <label class="f">Unit price (€) <span class="faint" style="font-weight:400">(optional)</span><input type="number" step="0.01" min="0" data-f="price" value="${esc(f.price)}" placeholder="no price"></label></div>
   <div class="tiny faint">${r?'A new price is saved from today; the old one stays in the history. Quotes that already have this resource keep the price they were built with — you can pull in the new price line by line.':'Optional. Leave it empty for things whose cost changes every time (fuel, tolls…) — the cost is then entered on each line. If you enter it, it is the first row of the price history, dated today.'}</div>
   ${r&&r.hist.length?`<div><div class="k">Price history</div>${r.hist.slice().reverse().map(([d,p])=>`<div class="sum-row"><span class="muted">${fmtDate(d)}</span><b>${eur2(p)} / ${esc(r.unit)}</b></div>`).join('')}</div>
   ${used?`<div class="tiny faint">Used on ${used} quote${used>1?'s':''}.</div>`:''}`:''}</div>`;},
 ()=>{const f=F();const name=f.name.trim(),unit=(f.unit||'').trim(),hasP=f.price!==''&&f.price!=null,p=+f.price;
  if(!name)return err('Add a name');if(!unit)return err('Add a unit');if(hasP&&!(p>=0))return err('The unit price must be 0 or more');if(!r&&noOpen('resource'))return err(noSeriesMsg('resource'));if(!DB.settings.units.some(u=>u.code===unit))return err('Pick a unit from the list');
  if(RESOURCES.some(x=>x!==r&&norm(x.name)===norm(name)))return err('A resource with this name already exists');
  let msg;
  if(r){const old=price(r);r.name=name;r.unit=unit;
   if(hasP&&(old==null||Math.abs(p-old)>0.0001)){const last=r.hist[r.hist.length-1];if(last&&last[0]===TODAY_ISO)last[1]=p;else r.hist.push([TODAY_ISO,p]);
    msg=`${name} → ${eur2(p)} per ${unit} · existing quotes keep their price`;}
   else msg='Resource saved';}
  else{const n={id:uid('r'),no:nextNo('resource'),name,unit,hist:hasP?[[TODAY_ISO,p]]:[]};RESOURCES.push(n);msg=hasP?`${name} added · ${eur2(p)} per ${unit}`:`${name} added · no price (entered on each line)`;if(after){after(n);toast(msg);return;}}
  state.modal=null;toast(msg);},r?'Save':'Add resource');}

/* Quote: customer, bill-to and billing details. Everything is copied onto the quote; the bill-to copy is locked until you unlock it. */
function mParties(q){const bt=q.billTo;
 state.form={cust:q.customer.id,billCust:bt.cust,bill:{name:bt.name,nif:bt.nif,address:addrOf(bt.address)},unlocked:!!q.billUnlocked};
 openModal('Customer & billing',()=>{const f=F();const bc=C(f.billCust);const same=f.billCust===f.cust;const dis=!f.unlocked;
  return `<div class="stack"><div><span class="flabel">Customer of the quote</span>${combo('pt-cust',{opts:custOpts(q.cust),value:f.cust,title:'Customer',onPick:v=>{const was=f.cust;f.cust=v;if(f.billCust===was){f.billCust=v;pullBill(f);}}})}
   ${f.cust!==q.customer.id?`<div class="tiny" style="color:var(--amber);margin-top:4px">Changing the customer resets the contact. The location of the work and all lines stay as they are.</div>`:''}</div>
  <div><span class="flabel">Bill to</span>${combo('pt-bill',{opts:custOpts(q.billTo?.cust),value:f.billCust,title:'Bill to',onPick:v=>{f.billCust=v;pullBill(f);}})}
   <div class="tiny faint" style="margin-top:4px">${same?'Same as the customer (default).':'Billed to a different customer than the one the work is for.'}</div></div>
  <div class="card" style="background:var(--surface-2);box-shadow:none"><div class="row between"><b class="small">${ic(f.unlocked?'unlock':'lock',14)} Billing details on this quote</b>
    <span class="row" style="gap:8px">${f.unlocked?`<button class="btn sm" data-act="billReset">Reset from customer</button>`:`<button class="btn sm" data-act="billUnlock">${ic('unlock',14)} Unlock editing</button>`}</span></div>
   <div class="tiny faint" style="margin:4px 0 10px">${f.unlocked?'Editing this quote’s copy only — the customer record is not changed.':'A copy of the customer’s details. Unlock it to change them for this quote only.'}</div>
   <div class="stack" style="gap:10px"><div class="grid2"><label class="f">Name<input type="text" data-af="bill:name" value="${esc(f.bill.name)}" ${dis?'disabled':''}></label><label class="f">NIF<input type="text" data-af="bill:nif" value="${esc(f.bill.nif)}" ${dis?'disabled':''}></label></div>
   ${addrForm('bill.address',f.bill.address,{disabled:dis})}</div></div></div>`;},
 ()=>{const f=F();if(!f.bill.name.trim())return err('Billing name is required');const c=C(f.cust),b=C(f.billCust);const ch=[];
  if(f.cust!==q.customer.id){q.cust=f.cust;q.customer=custSnap(c);const ct=c.contacts.find(x=>x.primary)||c.contacts[0];q.contact=ct?.id||null;q.contactInfo=contactSnap(ct);q.site.loc=null;dimMerge(q.dims,dimCopy(c.dims));ch.push(`Customer → ${c.name}${Object.keys(c.dims||{}).length?' (dimensions updated from the customer)':''}`);}
  const nb={cust:f.billCust,no:b.no,name:f.bill.name.trim(),nif:f.bill.nif.trim(),address:addrOf(f.bill.address)};
  if(JSON.stringify(nb)!==JSON.stringify({...q.billTo,address:addrOf(q.billTo.address)}))ch.push(`Bill to → ${nb.name}${f.billCust!==f.cust?' (different from customer)':''}`);
  q.billTo=nb;q.billUnlocked=f.unlocked;if(ch.length)logQ(q,ch.join(' · '));state.modal=null;toast(ch.length?'Quote updated':'No changes');},'Save');}
function pullBill(f){const b=C(f.billCust);f.bill={name:b.name,nif:b.nif||'',address:addrOf(b.billing)};f.unlocked=false;}

/* Quote: location of the work — pick one of the customer's, or just type it */
function mSite(q){const cu=C(q.cust)||{locations:[]};const st=q.site;
 state.form={loc:st.loc||'',name:st.name||'',address:addrOf(st.address),saveLoc:false};
 openModal('Location of the work',()=>{const f=F();
  const opts=[{v:'__bill',l:'Same as bill-to address',sub:addrStr(q.billTo.address),group:'Quick'},{v:'__none',l:'No location',sub:'Clear the fields',group:'Quick'},...locOpts(cu).map(o=>({...o,group:'Customer locations'}))];
  return `<div class="stack"><div><span class="flabel">Choose a location</span>${combo('st-loc',{opts,value:f.loc,placeholder:cu.locations.length?'Pick one of the customer’s locations…':'This customer has no saved locations',title:'Location',onPick:v=>{
     if(v==='__none'){f.loc='';f.name='';f.address=EMPTY_ADDR();}
     else if(v==='__bill'){f.loc='';f.name='';f.address=addrOf(q.billTo.address);}
     else{const l=cu.locations.find(x=>x.id===v);f.loc=v;f.name=l.name||'';f.address=addrOf(l.address);}}})}</div>
   <div class="small muted">…or just type the address. A typed address is a one-off: it stays only on this job and is not added to the customer.</div>
   <label class="f">Name (optional)<input type="text" data-af=":name" value="${esc(f.name)}" placeholder="e.g. Warehouse, Hotel Cascais"></label>
   ${addrForm('address',f.address)}
   ${cu.id?`<label class="check"><input type="checkbox" data-f="saveLoc" ${f.saveLoc?'checked':''}> Also save as a location of this customer</label>`:''}</div>`;},
 ()=>{const f=F();const cu2=C(q.cust);const site={loc:null,name:f.name.trim(),address:addrOf(f.address)};
  const added=ensureLocation(cu2,site,f.saveLoc);const cityChanged=norm(site.address.city)!==norm(q.site.address.city);
  q.site=site;if(cityChanged){const ll=townXY(site.address.city);q.lat=ll.lat;q.lng=ll.lng;}
  logQ(q,addrEmpty(site.address)?'Location of the work cleared':`Location of the work → ${site.name?site.name+' · ':''}${addrStr(site.address)}`);
  state.modal=null;toast(added?'Location saved and added to the customer':'Location updated');},'Save');}

/* Units of measure */
function mUnit(code){const u=code?DB.settings.units.find(x=>x.code===code):null;const n=u?unitUse(u.code):0;
 state.form={code:u?u.code:'',name:u?u.name:''};
 openModal(u?`Unit ${u.code}`:'New unit',()=>{const f=F();return `<div class="stack"><div class="grid2"><label class="f">Code (as shown on lines)<input type="text" data-f="code" value="${esc(f.code)}" placeholder="e.g. L, bag, m²" maxlength="14"></label><label class="f">Name<input type="text" data-f="name" value="${esc(f.name)}" placeholder="e.g. Litre"></label></div>
   ${u&&n?`<div class="tiny faint">In use — renaming the code updates resources and quote lines. It can’t be deleted.</div>`:''}</div>`;},
 ()=>{const f=F();const c=f.code.trim();if(!c)return err('Add a code');
  if(DB.settings.units.some(x=>x!==u&&norm(x.code)===norm(c)))return err('That unit already exists');
  if(u){if(c!==u.code){RESOURCES.forEach(r=>{if(r.unit===u.code)r.unit=c;});QUOTES.forEach(q=>q.lines.forEach(l=>{if(l.unit===u.code)l.unit=c;}));u.code=c;}u.name=f.name.trim();}
  else DB.settings.units.push({code:c,name:f.name.trim()});
  state.modal=null;toast(u?'Unit saved':`Unit ${c} added`);},u?'Save':'Add unit');
 if(u&&!n)state.modal.extra=`<button class="btn ghost danger" style="margin-right:auto" data-act="delUnit" data-code="${esc(u.code)}">${ic('trash',14)} Remove</button>`;
 render();}

/* Change a quote after the proposal went out (or after acceptance) */
function mReopen(q){const s=q.status;state.form={reason:''};
 openModal(s==='locked'?'Unlock to edit':'Reopen',()=>`<div class="banner info" style="font-size:13px">${ic('lock',16)}<div>${s==='locked'?'Unlocking takes the order back to <b>Open</b> so lines and prices can change. The approval is removed; proposals already sent stay in the archive. Lock it again when the client agrees.':s==='finished'?'The job goes back to <b>Locked</b>, as not finished yet.':'The quote goes back to <b>Open</b>.'}</div></div>
  <label class="f" style="margin-top:12px">Why? (optional)<input type="text" data-f="reason" value="${esc(F().reason)}" placeholder="e.g. Client asked to add the second floor"></label>`,
 ()=>{const f=F(),r=f.reason?' — '+f.reason:'';
  if(s==='locked'){q.approved=null;setStatus(q,'open','Unlocked — back to Open'+r);toast('Open — edit the lines and lock it again when approved');}
  else if(s==='finished'){q.workDone=null;setStatus(q,'locked','Reopened — job not finished'+r);toast('Reopened');}
  else{delete q.cancel;setStatus(q,'open','Reopened'+r);toast('Reopened');}
  state.modal=null;},s==='locked'?'Unlock':'Reopen');}

/* Number series: a series header + lines with a start date and number range */
function checkLine(ser,f,except){const fp=parseNo(f.from),tp=parseNo(f.to);
 if(!f.start)return 'Add a starting date';if(!fp||!tp)return 'Numbers must end in digits, e.g. QUOTE26000001';
 if(fp.p!==tp.p||fp.w!==tp.w)return 'Starting and ending number must have the same prefix and length';if(fp.n>tp.n)return 'Ending number must be after the starting number';
 for(const l of ser.lines){if(l===except)continue;const a=parseNo(l.from),b=parseNo(l.to);if(a&&a.p===fp.p&&a.w===fp.w&&fp.n<=b.n&&a.n<=tp.n)return `The range overlaps the line starting ${fmtDate(l.start)} (${l.from} – ${l.to})`;}
 return '';}
function mSeriesLine(code){const ser=DB.settings.numberSeries.find(x=>x.code===code);
 const last=ser.lines.slice().sort((a,b)=>b.start.localeCompare(a.start))[0];const y=last?+last.start.slice(0,4)+1:+TODAY_ISO.slice(0,4);const start=y+'-01-01';
 const mk=d=>({from:ser.code+yy(d)+'000001',to:ser.code+yy(d)+'999999'});
 state.form={start,...mk(start),_af:'',_at:''};state.form._af=F().from;state.form._at=F().to;
 openModal('Add line to '+ser.code,()=>{const f=F();
  return `<div class="stack"><div class="small muted">From the starting date, new records are numbered from this line. ${last?`The current line (${esc(last.from)} – ${esc(last.to)}) will be closed on that date.`:''}</div>
   <label class="f">Starting date<input type="date" data-f="start" data-sync="1" value="${esc(f.start)}"></label>
   <div class="grid2"><label class="f">Starting no.<input type="text" data-f="from" value="${esc(f.from)}" placeholder="${esc(ser.code)}26000001"></label><label class="f">Ending no.<input type="text" data-f="to" value="${esc(f.to)}" placeholder="${esc(ser.code)}26999999"></label></div></div>`;},
 ()=>{const f=F();const e=checkLine(ser,f);if(e)return err(e);
  if(last&&f.start<=last.start)return err('The starting date must be after '+fmtDate(last.start));
  ser.lines.forEach(l=>{if(lineOpen(l,f.start)){l.closed=f.start;}});
  ser.lines.push({id:uid('sl'),start:f.start,from:f.from.trim(),to:f.to.trim(),last:'',closed:''});
  state.modal=null;toast(`Line added — ${f.from} – ${f.to} from ${fmtDate(f.start)}`);},'Add line');
 /* when the date changes, keep the suggested numbers in step unless they were edited */
 state.form._sync=true;}
function mSeries(code){const ser=code?DB.settings.numberSeries.find(x=>x.code===code):null;const y=TODAY_ISO.slice(0,4);
 state.form={code:ser?ser.code:'',description:ser?ser.description:'',start:y+'-01-01',from:'',to:''};
 openModal(ser?'Series '+ser.code:'New series',()=>{const f=F();
  return ser?`<div class="stack"><label class="f">Description<input type="text" data-f="description" value="${esc(f.description)}"></label>
   ${seriesUse(ser.code).length?'':`<div style="margin-top:6px"><button class="btn sm ghost danger" data-act="delSeries" data-code="${esc(ser.code)}">${ic('trash',14)} Remove series</button></div>`}</div>`
  :`<div class="stack"><div class="grid2"><label class="f">Series code<input type="text" data-f="code" data-sync="1" value="${esc(f.code)}" placeholder="e.g. QUOTE" maxlength="12"></label><label class="f">Description<input type="text" data-f="description" value="${esc(f.description)}" placeholder="e.g. Quotes"></label></div>
   <div class="small muted">First line of the series — more lines (e.g. next year) are added later.</div>
   <label class="f">Starting date<input type="date" data-f="start" data-sync="1" value="${esc(f.start)}"></label>
   <div class="grid2"><label class="f">Starting no.<input type="text" data-f="from" value="${esc(f.from||(f.code?f.code.toUpperCase()+yy(f.start)+'000001':''))}" placeholder="QUOTE26000001"></label><label class="f">Ending no.<input type="text" data-f="to" value="${esc(f.to||(f.code?f.code.toUpperCase()+yy(f.start)+'999999':''))}" placeholder="QUOTE26999999"></label></div></div>`;},
 ()=>{const f=F();if(ser){ser.description=f.description.trim();state.modal=null;toast('Series saved');return;}
  const c=f.code.trim().toUpperCase();if(!c)return err('Add a series code');if(DB.settings.numberSeries.some(x=>x.code===c))return err('A series with this code already exists');
  const line={start:f.start,from:(f.from||c+yy(f.start)+'000001').trim(),to:(f.to||c+yy(f.start)+'999999').trim()};const tmp={lines:[]};const e=checkLine(tmp,line);if(e)return err(e);
  DB.settings.numberSeries.push({code:c,description:f.description.trim(),lines:[{id:uid('sl'),...line,last:'',closed:''}]});state.modal=null;toast(`Series ${c} added`);},ser?'Save':'Add series');}

function mCloseLine(code,id){const ser=DB.settings.numberSeries.find(x=>x.code===code),l=ser.lines.find(x=>x.id===id);
 state.form={d:TODAY_ISO>l.start?TODAY_ISO:l.start};
 openModal('Close line',()=>`<div class="small muted"><b class="mono">${esc(l.from)} – ${esc(l.to)}</b>${l.last?` · last used ${esc(l.last)}`:' · not used yet'}.<br>From the closing date this line is no longer used. Add a new line to keep numbering${l.closed&&l.closed>TODAY_ISO?` (it is already set to close on ${fmtDate(l.closed)})`:''}.</div>
  <label class="f" style="margin-top:12px">Closed from<input type="date" data-f="d" min="${l.start}" value="${esc(F().d)}"></label>`,
 ()=>{const d=F().d;if(!d||d<l.start)return err('Pick a date on or after '+fmtDate(l.start));l.closed=d;state.modal=null;toast(d<=TODAY_ISO?'Line closed — add a new line to continue numbering':`Line will close on ${fmtDate(d)}`);},'Close line');}

/* Edit a line's description, quantity and cost — until the quote is locked */
function mEditLine(q,l){const isL=l.kind==='labor',kids=isL?subLines(q,l):[],par=l.parentLine?q.lines.find(x=>x.id===l.parentLine):null;
 state.form={unit:l.unit||DEF_LABOR_UNIT(),desc:l.desc,qty:l.qty,cost:l.cost,pmode:l.pmode==='flat'?'flat':'pct',markup:l.pmode==='pct'&&l.markup!=null?Math.round(l.markup*1000)/10:(l.pmode?'':Math.round((q.margin||0)*1000)/10),sell:l.pmode==='flat'?(l.sell??''):Math.round(groupPrice(q,l)*100)/100,
  kidsN:kids.length,kidsCost:sum(kids,x=>x.qty*lineCost(x))};
 openModal('Edit line',()=>{const f=F();const r=!isL?R(l.ref):null;
  return `<div class="stack"><div class="small muted">${esc(lineName(l))}${isL?'':' · resource'}${q.status==='open'&&pstate(q)==='waiting'?' · the proposal is with the client — send a new version after changing':''}</div>
   <label class="f">Description<input type="text" data-f="desc" value="${esc(f.desc)}"></label>
   ${lineQtyCost(f,isL,r?{unit:lineUnit(l),hist:r.hist}:{unit:lineUnit(l),hist:[]})}
   ${r&&price(r)!=null&&Math.abs(price(r)-l.cost)>0.001?`<div class="tiny faint">Price today: <b>${eur2(price(r))}</b> per ${esc(r.unit)}</div>`:''}
   ${par?`<div class="tiny faint">${LT(`Sub-line of ${esc(par.desc)} · ${esc(lineName(par))} — the client price is the group’s, set on the vendor line.`,`Sub-linha de ${esc(par.desc)} · ${esc(lineName(par))} — o preço ao cliente é o do grupo, definido na linha do fornecedor.`)}</div>`:''}
   ${can('quotes.costs')&&!l.onSite&&!par?linePriceBlock(f,`<div class="tiny faint" style="margin-top:2px"><span>The job total is the sum of the lines.</span> <span>Now: ${eur2(groupPrice(q,l))}.</span></div>`):''}</div>`;},
 ()=>{const f=F();const qty=+f.qty,cost=+f.cost;if(!(qty>0))return err('Quantity must be more than 0');if(!(cost>=0)||f.cost==='')return err('Enter a cost');
  if(f.pmode==='pct'&&!(+f.markup>=0&&f.markup!==''))return err('Enter the markup for this line');if(f.pmode==='flat'&&f.sell!==''&&f.sell!=null&&!(+f.sell>=0))return err('The client value must be 0 or more');
  const ch=[];if(f.desc.trim()&&f.desc.trim()!==l.desc)ch.push(`description “${l.desc}” → “${f.desc.trim()}”`);if(isL&&f.unit&&f.unit!==l.unit){ch.push(`unit ${l.unit||'—'} → ${f.unit}`);l.unit=f.unit;}if(qty!==l.qty)ch.push(`qty ${l.qty} → ${qty}`);if(cost!==l.cost)ch.push(`cost ${eur2(l.cost)} → ${eur2(cost)}`);
  if(can('quotes.costs')&&!l.onSite&&!l.parentLine){const np=f.pmode==='flat'?'flat':'pct',nm=np==='pct'?(+f.markup)/100:null,ns=np==='flat'&&f.sell!==''&&f.sell!=null?Math.round(+f.sell*100)/100:null;
   if(np!==(l.pmode||null)||nm!==(l.markup??null)||ns!==(l.sell??null)){ch.push(np==='pct'?`own markup ${+f.markup}%`:np==='flat'?(ns==null?'fixed value, client value not set yet':`fixed client value ${eur2(ns)}`):'client price follows the job');l.pmode=np;l.markup=nm;l.sell=ns;}}
  const d=l.desc;if(f.desc.trim())l.desc=f.desc.trim();l.qty=qty;l.cost=cost;
  if(isL&&l.pmode==='flat'&&l.sell!=null)l.sellCost=groupCost(q,l); /* saving the fixed value = it was checked against today's group cost */
  if(ch.length)logQ(q,`Line “${d}” changed: ${ch.join(', ')}`);state.modal=null;toast(ch.length?'Line updated':'No changes');},'Save');}
/* View an archived proposal (exactly as it was when sent) */
function mProposalView(q,n){const x=q.versions.find(y=>y.v===+n);const s=x.snap;const c=calc(s);
 openModal(`Proposal v${x.v} · sent ${fmtDate(x.date)}`,()=>`<div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:10px"><span class="small muted">Archived copy — what the client received.</span><span class="row" style="gap:6px"><button class="btn sm" data-act="pdfOpen" data-v="${x.v}">${ic('doc',14)} Open PDF</button><button class="btn sm" data-act="pdfDown" data-v="${x.v}">${ic('download',14)} Download PDF</button></span></div>
  ${propDoc(s,`Proposal ${q.id}-v${x.v}`,x.date,s.billTo,s.contact,s.site,fmtRange(s.workStart,s.workEnd))}
  ${can('quotes.costs')?`<div class="card" style="margin-top:12px;box-shadow:none;background:var(--surface-2)"><div class="k">Internal view</div><div class="sum-row"><span class="muted">Cost then</span><b>${eur(c.cost)}</b></div><div class="sum-row"><span class="muted">Margin then</span><b>${eur(c.margin)} · ${pct(c.pct)}</b></div>
   ${s.lines.map(l=>`<div class="sum-row" style="border:0;padding:2px 0"><span class="small muted">${esc(l.desc)} · ${esc(l.refName)}</span><span class="small">${l.qty} ${esc(l.unit)} × ${eur2(l.cost)}</span></div>`).join('')}</div>`:''}`,null);}

/* Client said no — not a cancellation and not a status change: the quote stays Open, the proposal is marked rejected, and you can adjust and send a new one */
const REJECT_REASONS=['Price too high','Scope not what they wanted','Dates don’t suit','Wants a different vendor / trade','Needs to think / waiting on budget','Other'];
function mRejected(q){const v=lastSent(q);state.form={reason:REJECT_REASONS[0],note:''};
 openModal('Client rejected the proposal',()=>{const f=F();return `<div class="small muted">Proposal v${v.v} stays in the archive, marked as rejected. The quote stays <b>Open</b> so you can adjust the lines and send a new version — or abort it if the job is off.</div>
  <div style="margin-top:12px"><span class="flabel">Reason</span>${combo('rj-reason',{opts:REJECT_REASONS.map(x=>({v:x,l:x})),value:f.reason,title:'Reason',onPick:x=>{f.reason=x;}})}</div>
  <label class="f" style="margin-top:12px">What should change? (optional)<input type="text" data-f="note" value="${esc(f.note)}" placeholder="e.g. Remove the second floor, discount 10%"></label>`;},
 ()=>{const f=F();v.rejected={date:TODAY_ISO,by:me().id,reason:f.reason,note:f.note};q.since=TODAY_ISO;
  logQ(q,`Client rejected proposal v${v.v} — ${f.reason}${f.note?' ('+f.note+')':''}`);state.modal=null;toast('Marked as rejected — adjust the lines and send a new version');},'Mark as rejected');
 state.modal.extra=`<button class="btn ghost danger" style="margin-right:auto" data-act="cancelInstead">Abort quote instead</button>`;render();}

/* Dimensions & values */
function mDim(code){const d=code?dimOf(code):null;const n=d?dimUseN(d.code):0,nt=d?dimUse(d.code).types:0;state.form={code:d?d.code:'',name:d?d.name:''};
 openModal(d?'Dimension '+d.code:'New dimension',()=>{const f=F();return `<div class="stack"><div class="grid2"><label class="f">Code<input type="text" data-f="code" value="${esc(f.code)}" placeholder="e.g. AREA" maxlength="14"></label><label class="f">Name<input type="text" data-f="name" value="${esc(f.name)}" placeholder="e.g. Business area"></label></div>
  ${d&&(n||nt)?`<div class="tiny faint">In use — renaming the code keeps it everywhere. It can’t be deleted.</div>`:''}</div>`;},
 ()=>{const f=F();const c=f.code.trim().toUpperCase().replace(/\s+/g,'');if(!c)return err('Add a code');
  if(DB.settings.dimensions.some(x=>x!==d&&x.code===c))return err('That dimension already exists');
  if(d){if(c!==d.code){renameDimKey(d.code,c);if(state.dimCode===d.code)state.dimCode=c;d.code=c;}d.name=f.name.trim();}
  else{DB.settings.dimensions.push({code:c,name:f.name.trim(),values:[]});}
  state.modal=null;toast(d?'Dimension saved':`Dimension ${c} added — now add its values`);if(!d){state.view='dim';state.dimCode=c;}},d?'Save':'Add dimension');
 if(d&&!n&&!nt)state.modal.extra=`<button class="btn ghost danger" style="margin-right:auto" data-act="delDim" data-code="${esc(d.code)}">${ic('trash',14)} Delete</button>`;render();}
function mDimValue(dc,vc){const d=dimOf(dc);const v=vc?d.values.find(x=>x.code===vc):null;const n=v?dimUseN(dc,v.code):0,nt=v?dimUse(dc,v.code).types:0;state.form={code:v?v.code:'',name:v?v.name:''};
 openModal(v?`${dc} · ${v.code}`:`New value for ${dc}`,()=>{const f=F();return `<div class="stack"><div class="grid2"><label class="f">Value code<input type="text" data-f="code" value="${esc(f.code)}" placeholder="e.g. RESIDENTIAL" maxlength="20"></label><label class="f">Name<input type="text" data-f="name" value="${esc(f.name)}" placeholder="e.g. Residential"></label></div>
  ${v&&(n||nt)?`<div class="tiny faint">In use — renaming the code keeps it everywhere. It can’t be deleted.</div>`:''}</div>`;},
 ()=>{const f=F();const c=f.code.trim().toUpperCase().replace(/\s+/g,'');if(!c)return err('Add a code');
  if(d.values.some(x=>x!==v&&x.code===c))return err('That value already exists in this dimension');
  if(v){if(c!==v.code){renameDimValue(dc,v.code,c);v.code=c;}v.name=f.name.trim();}else d.values.push({code:c,name:f.name.trim()});
  state.modal=null;toast(v?'Value saved':`${c} added`);},v?'Save':'Add value');
 if(v&&!n&&!nt)state.modal.extra=`<button class="btn ghost danger" style="margin-right:auto" data-act="delDimValue" data-code="${esc(dc)}" data-v="${esc(v.code)}">${ic('trash',14)} Delete</button>`;render();}

/* Quote types: a name + the dimensions it fills in on a quote */
function mQType(code){const t=code?qtOf(code):null;
 state.form={code:t?.code||'',name:t?.name||'',dims:JSON.parse(JSON.stringify(t?.dims||{}))};
 openModal(t?'Quote template '+t.code:'New quote template',()=>{const f=F();return `<div class="stack"><div class="grid2"><label class="f">Code<input type="text" data-f="code" value="${esc(f.code)}" placeholder="e.g. WC" maxlength="14"></label><label class="f">Name<input type="text" data-f="name" value="${esc(f.name)}" placeholder="e.g. Bathroom remodelling"></label></div>
  <div><span class="flabel">Dimensions it fills in</span>${dimEditor('qt',f.dims)}</div>
  <div class="tiny faint">Changing a template doesn’t change quotes it was used on — quotes don’t keep the template.</div></div>`;},
 ()=>{const f=F();const c=f.code.trim().toUpperCase().replace(/\s+/g,'');if(!c)return err('Add a code');if(!f.name.trim())return err('Add a name');
  if((DB.settings.quoteTypes||[]).some(x=>x!==t&&x.code===c))return err('That quote template already exists');
  if(t){t.code=c;t.name=f.name.trim();t.dims=normDims(f.dims);}
  else DB.settings.quoteTypes.push({code:c,name:f.name.trim(),dims:normDims(f.dims)});
  state.modal=null;toast(t?'Quote template saved':`Quote template ${c} added`);},t?'Save':'Add quote template');
 if(t)state.modal.extra=`<button class="btn ghost danger" style="margin-right:auto" data-act="delQType" data-code="${esc(t.code)}">${ic('trash',14)} Delete</button>`;render();}

/* Delete a customer/vendor that nothing refers to */
function mDelete(kind,id){const x=kind==='cust'?C(id):V(id);
 openModal(kind==='cust'?'Delete customer':'Delete vendor',()=>`<div><b>${esc(x.name)}</b> <span class="mono faint small">${esc(x.no||'')}</span></div><div class="small muted" style="margin-top:6px">${kind==='cust'?'Nothing refers to this customer yet, so it can be removed. This can’t be undone.':'Nothing refers to this vendor yet, so it can be removed. This can’t be undone.'}</div>`,
 ()=>{const arr=kind==='cust'?CUSTOMERS:VENDORS;const i=arr.indexOf(x);if(i>=0)arr.splice(i,1);state.modal=null;if(kind==='cust'){state.view='dir';state.dirTab='customers';}toast(`${x.name} deleted`);},'Delete');}

/* Removing a line always asks first */
function mRemoveLine(q,l,done){const sent=q.status==='open'&&pstate(q)==='waiting',kids=subLines(q,l);
 openModal('Remove line',()=>`<div class="stack"><div><b>${esc(l.desc)}</b><div class="small muted">${esc(lineName(l))} · ${l.qty} ${esc(lineUnit(l))}${can('quotes.costs')?' · cost '+eur2(l.qty*lineCost(l)):''}${l.onSite||l.parentLine?'':' · client '+eur2(groupPrice(q,l))}</div></div>
  ${kids.length?`<div class="banner amber" style="font-size:13px">${ic('alert',16)}<div>${LT(`Its ${kids.length} resource${kids.length>1?'s are':' is'} removed too:`,`${kids.length>1?`Os seus ${kids.length} recursos também são removidos`:'O seu recurso também é removido'}:`)}<ul style="margin:4px 0 0;padding-left:18px">${kids.map(x=>`<li>${esc(x.desc)} · ${x.qty} ${esc(lineUnit(x))}${can('quotes.costs')?' · '+eur2(x.qty*lineCost(x)):''}</li>`).join('')}</ul></div></div>`:''}
  <div class="small muted">The line is removed from this job and the totals are recalculated. The removal is recorded in the job history.</div>
  ${sent?`<div class="banner amber" style="font-size:13px">${ic('alert',16)}<div>Proposal v${lastSent(q).v} is with the client — after removing, send a new version.</div></div>`:''}</div>`,
 ()=>{state.modal=null;done();},'Remove line');
 state.modal.danger=true;render();}

/* Delete a saved route: its visits not done go back to the visits to plan */
function mDelRoute(r){if(!r)return;const st=liveStops(r).filter(s=>!s.done);
 openModal('Delete route',()=>`<div class="stack"><div><b>${fmtDow(r.date)}</b> · ${liveStops(r).length} visits</div>
  ${st.length?`<div class="small muted">These go back to the visits to plan:</div><div>${st.map(s=>`<div class="small">· ${esc(qCust(QR(s.q)))} — ${esc(qTown(QR(s.q)))}</div>`).join('')}</div>`:'<div class="small muted">Every visit on this route is done.</div>'}</div>`,
 ()=>{st.forEach(s=>{const q=QR(s.q);q.visit.date=null;q.visit.route=null;logQ(q,`Visit route of ${fmtDate(r.date)} deleted — back to visits to plan`);});DB.routes=ROUTES_().filter(x=>x!==r);state.map.rid=null;state.modal=null;toast('Route deleted');},'Delete route');
 state.modal.danger=true;render();}

/* Archive: the hard lock. Only for finished or aborted quotes. An archived quote can't be reopened or changed (an administrator can undo it). */
function mArchive(q){if(!['finished','aborted'].includes(q.status)||q.archived)return;
 openModal('Archive quote',()=>`<div class="banner grey" style="font-size:13px">${ic('lock',16)}<div><b>${esc(q.id)}</b> · ${esc(qCust(q))} · ${esc(qPlace(q))}</div></div>
  <div class="small" style="margin-top:12px">Archiving closes the quote for good: it can’t be reopened or changed. It stays in the lists (Finished / All quotes), with its proposals and history.</div>
  <div class="small muted" style="margin-top:8px">Use it once the job is really done — for example after it has been invoiced. Until then, Finished quotes can still be reopened.</div>`,
 ()=>{q.archived={date:TODAY_ISO,by:me().id};logQ(q,'Archived — final, can no longer be reopened');state.modal=null;toast('Quote archived');},'Archive');}

/* Collaborator: add or change a resource line on site — no prices shown */
/* Expense = a resource line added on site (onSite) by the person, on a job they work on. Internal cost only — not in the client price.
   The job can be chosen here (from the Expenses screen) or comes fixed (from the job page). Can be changed until the job is archived. */
const expJobs=()=>(expOnBehalf()?visibleQuotes():QUOTES).filter(q=>expCanJob(q)).sort((a,b)=>(a.status==='locked'?0:1)-(b.status==='locked'?0:1)||(b.workStart||'').localeCompare(a.workStart||''));
const OTHER='__other';
/* Expense form. What: a resource from the list, or "Other" (not in the list — then the description is required).
   Value paid is optional: if empty, the resource's price counts (Other without value = 0, flagged "no value").
   Receipt photo is optional: resized in the browser and kept as base64 in DB.files (kind 'receipt'); in production it goes to file storage. */
function mExpense(q,l){const fixed=!!q; /* opened from a job (or editing): the job comes fixed */
 const myV=me().vendor&&V(me().vendor)?me().vendor:'';
 state.form={paidBy:l?(l.paidBy||'__co'):(myV||''),job:q?.id||state.expLast||'',ref:l?(l.ref||OTHER):'',qty:l?.qty||1,detail:l?.detail||'',paid:l?.paid??'',date:l?.addedAt||TODAY_ISO,rcpt:l?.receipt?{id:l.receipt}:null};
 if(state.form.job&&!expJobs().some(x=>x.id===state.form.job))state.form.job='';
 openModal(l?'Edit expense':'New expense',()=>{const f=F();const jobs=expJobs(),oth=f.ref===OTHER,r=!oth&&f.ref?R(f.ref):null;
  const rimg=f.rcpt?(f.rcpt.data||(fileOf(f.rcpt.id)&&'data:'+fileOf(f.rcpt.id).mime+';base64,'+fileOf(f.rcpt.id).base64)):null;
  return `<div class="stack">${fixed?`<div class="small muted">${esc(q.id)} · ${esc(qCust(q))} · ${esc(qPlace(q))}</div>`:`<div><span class="flabel">Job</span>${jobs.length?combo('ex-job',{opts:jobs.map(x=>({v:x.id,l:qCust(x)+' · '+qPlace(x),sub:`${x.id}${x.workStart?' · '+fmtRange(x.workStart,x.workEnd):''}`,group:x.status==='locked'?'In progress / approved':x.status==='open'?LT('Open','Abertas'):'Finished or aborted (until archived)'})),value:f.job,placeholder:'Choose the job…',title:'Job',onPick:v=>{f.job=v;}}):'<div class="small muted">No jobs open for expenses right now.</div>'}</div>`}
   ${!l&&!expDirect()?`<div class="banner info" style="font-size:13px">${ic('clock',16)}<div>${esc(LT('Goes for approval — it only enters the job once approved.','Vai para aprovação — só entra na obra depois de aprovada.'))}</div></div>`:''}
   ${expPaidByField(f,fixed?q:QR(f.job))}
   <div><span class="flabel">What was it?</span><div class="seg seg-full">
     <button class="${oth?'':'on'}" data-act="fset" data-k="ref" data-v="${oth?'':esc(f.ref)}">${ic('doc',15)} From the resource list</button>
     <button class="${oth?'on':''}" data-act="fset" data-k="ref" data-v="${OTHER}">${ic('edit',15)} Something else</button></div></div>
   ${oth?`<label class="f">What was bought or paid <span class="faint" style="font-weight:400">(required)</span><input type="text" data-f="detail" value="${esc(f.detail)}" placeholder="e.g. Silicone and screws from the hardware store"></label>
   <label class="f">Amount (€)<input type="number" step="0.01" min="0" inputmode="decimal" data-f="paid" value="${esc(f.paid)}" placeholder="0,00"></label>`
   :`<div>${combo('ex-ref',{opts:RESOURCES.map(r=>({v:r.id,l:r.name,sub:r.unit})),value:f.ref,placeholder:'Search resources…',title:'Resource',onPick:v=>{f.ref=v;}})}</div>
   <div class="grid2"><label class="f">Quantity${r?' ('+esc(r.unit)+')':''}<input type="number" step="any" min="0" inputmode="decimal" data-f="qty" value="${esc(f.qty)}"></label>
    <label class="f">Amount (€) <span class="faint" style="font-weight:400">(optional — what the receipt says)</span><input type="number" step="0.01" min="0" inputmode="decimal" data-f="paid" value="${esc(f.paid)}" placeholder="resource price"></label></div>
   <label class="f">Note <span class="faint" style="font-weight:400">(optional)</span><input type="text" data-f="detail" value="${esc(f.detail)}" placeholder="e.g. for the second floor"></label>`}
   <label class="f">Date<input type="date" data-f="date" value="${esc(f.date)}" max="${TODAY_ISO}"></label>
   <div><span class="flabel">Receipt photo <span class="faint" style="font-weight:400">(optional)</span></span>
    ${rimg?`<div class="rcpt"><img src="${rimg}" alt="Receipt"><div class="stack" style="gap:6px"><label class="btn sm" style="cursor:pointer">${ic('upload',14)} Replace<input type="file" accept="image/*" capture="environment" data-chg="rcpt" hidden></label><button class="btn sm ghost danger" data-act="rcptRm">${ic('trash',14)} Remove</button></div></div>`
     :`<label class="btn rcptadd" style="cursor:pointer">${ic('upload',16)} Take or choose a photo<input type="file" accept="image/*" capture="environment" data-chg="rcpt" hidden></label>`}</div></div>`;},
 ()=>{const f=F();const job=fixed?q:QR(f.job);if(!job)return err('Choose the job');if(!expCanJob(job))return err('This job no longer accepts expenses (archived)');
  if(l&&l.reimb)return err(LT('Already paid back — it can no longer change','Já foi paga — já não se altera'));
  if(!f.paidBy)return err(expOnBehalf()?LT('Choose who paid it','Escolha quem pagou'):LT('Your user is not linked to a vendor — ask the administrator to link it, so the company knows whom to pay back.','O seu utilizador não está ligado a um fornecedor — peça ao administrador para o ligar, para a empresa saber a quem devolver o dinheiro.'));
  const pv=f.paidBy==='__co'?null:V(f.paidBy);
  const oth=f.ref===OTHER,detail=(f.detail||'').trim();if(!f.ref)return err('Choose the resource, or pick “Something else”');if(oth&&!detail)return err('Say what was bought or paid');
  const qty=oth?(+f.qty||1):+f.qty;if(!(qty>0))return err('Quantity must be more than 0');const paid=f.paid===''||f.paid==null?null:Math.round(+f.paid*100)/100;if(paid!=null&&!(paid>=0))return err('The amount must be 0 or more');
  const date=f.date||TODAY_ISO;const base=oth?{ref:null,refName:'Others',unit:'unit',cost:0}:(()=>{const n=res('x',f.ref,'',qty);return {ref:n.ref,refName:n.refName,unit:n.unit,cost:n.cost};})();
  const vals={...base,desc:oth?'Others':base.refName,detail,qty,paid,addedAt:date,priceDate:TODAY_ISO,paidBy:pv?pv.id:null,paidByName:pv?pv.name:''};if(paid!=null)vals.cost=paid/qty;
  const isClaim=!!(l&&l.status);
  let line=l;if(isClaim){Object.assign(l,vals);l.q=job.id;}
  else if(!l&&!expDirect()){/* expense approval (D-72): a request, not a job line yet */line={id:uid('X'),status:'pending',q:job.id,kind:'resource',onSite:true,addedBy:me().id,createdAt:new Date().toISOString(),...vals};DB.expClaims.push(line);state.expLast=job.id;}
  else if(l){Object.assign(l,vals);logQ(job,`Expense changed by ${me().name}: ${l.desc}${detail?' — '+detail:''} (${qty} ${lineUnit(l)})`);}
  else{line={id:uid('L'),kind:'resource',onSite:true,addedBy:me().id,...vals};job.lines.push(line);logQ(job,`Expense added by ${me().name}: ${line.desc}${detail?' — '+detail:''} (${qty} ${line.unit})`);state.expLast=job.id;}
  /* receipt photo */
  if(f.rcpt&&f.rcpt.data){if(line.receipt)DB.files=DB.files.filter(x=>x.id!==line.receipt);const b64=f.rcpt.data.split(',')[1];
   const fl={id:uid('f'),kind:'receipt',quote:job.id,line:line.id,name:`Recibo-${job.id}-${date}.jpg`,mime:'image/jpeg',size:Math.round(b64.length*.75),base64:b64,createdAt:new Date().toISOString(),createdBy:me().id};DB.files.push(fl);line.receipt=fl.id;}
  else if(!f.rcpt&&line.receipt){DB.files=DB.files.filter(x=>x.id!==line.receipt);delete line.receipt;}
  state.modal=null;toast(line.status==='pending'?(l?LT('Request updated','Pedido atualizado'):LT('Sent for approval','Enviada para aprovação')):(l?'Expense updated':'Expense added'));},l?'Save':expDirect()?'Add expense':LT('Send for approval','Enviar para aprovação'));
 /* own expense that can still change: remove it from here (My expenses has no separate trash button) */
 if(l&&l.addedBy===me().id&&typeof myExpEditable==='function'&&myExpEditable(l)){state.modal.extra=`<button class="btn ghost danger" style="margin-right:auto" data-act="expRm" data-q="${(q||QR(l.q))?.id}" data-l="${l.id}">${ic('trash',14)} ${LT('Remove','Remover')}</button>`;render();}}
/* "Paid by" (D-70): with expenses.onBehalf, choose the vendor (this job's first) or the company; otherwise it is the person's own vendor */
function expPaidByField(f,job){
 if(!expOnBehalf()){const v=me().vendor&&V(me().vendor);
  return v?`<div class="small muted">${esc(LT(`Paid by you (${v.name}) — the company pays you back.`,`Pago por si (${v.name}) — a empresa devolve-lhe o dinheiro.`))}</div>`
   :`<div class="banner amber" style="font-size:13px">${ic('alert',16)}<div>${esc(LT('Your user is not linked to a vendor, so the company can’t know whom to pay back. Ask the administrator to link it in Users & roles.','O seu utilizador não está ligado a um fornecedor, por isso a empresa não sabe a quem devolver o dinheiro. Peça ao administrador para o ligar em Utilizadores e funções.'))}</div></div>`;}
 const onJob=new Set(job?job.lines.filter(x=>x.kind==='labor').map(x=>x.ref):[]);
 const opts=[...VENDORS.filter(v=>!v.blocked||v.id===f.paidBy).map(v=>({v:v.id,l:v.name,sub:v.user||USERS.some(u=>u.vendor===v.id)?LT('App user','Utilizador da app'):'',group:onJob.has(v.id)?LT('On this job','Nesta obra'):LT('Other vendors','Outros fornecedores')})).sort((a,b)=>(a.group===b.group?0:onJob.has(a.v)?-1:1)||a.l.localeCompare(b.l)),
  {v:'__co',l:LT('The company — nothing to pay back','A empresa — nada a devolver'),group:LT('Company','Empresa')}];
 return `<div><span class="flabel">${LT('Paid by','Pago por')}</span>${combo('ex-paid',{opts,value:f.paidBy,placeholder:LT('Who paid?','Quem pagou?'),title:LT('Paid by','Pago por'),onPick:v=>{f.paidBy=v;}})}
  <div class="tiny faint" style="margin-top:4px">${LT('Whoever paid gets the money back in Expense payments. “The company” = paid with company money.','Quem pagou recebe o dinheiro de volta em Pagamentos. “A empresa” = pago com dinheiro da empresa.')}</div></div>`;}
/* resize a photo in the browser (max 1280 px, JPEG) before keeping it */
function readReceipt(file,done){const rd=new FileReader();rd.onload=()=>{const img=new Image();img.onload=()=>{const k=Math.min(1,1280/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);done(c.toDataURL('image/jpeg',.72));};img.onerror=()=>toast('That file is not an image');img.src=rd.result;};rd.readAsDataURL(file);}
function mReceipt(fid){const f=fileOf(fid);if(!f)return;const src='data:'+f.mime+';base64,'+f.base64;
 openModal('Receipt',()=>`<div class="rcptview"><img src="${src}" alt="Receipt"></div><div class="row" style="margin-top:10px;gap:8px"><button class="btn sm" data-act="rcptDl" data-id="${f.id}">${ic('download',14)} Download</button><span class="tiny faint">${esc(f.name)} · ${Math.round(f.size/1024)} KB</span></div>`,null);}



/* Send proposal: choose the contact, check the email, then the proposal is archived and an email row is written to the outbox.
   Sending is not blocking — a routine picks the row up (here: Settings → Outbox → "Run the sending routine"). */
function mSendProposal(q){const cu=C(q.cust)||{contacts:[]};const v=(q.versions.length?q.versions[q.versions.length-1].v:0)+1;
 const start=q.contact||cu.contacts.find(x=>x.primary)?.id||cu.contacts[0]?.id||'';const ct0=cu.contacts.find(x=>x.id===start)||q.contactInfo;
 state.form={contact:start,email:ct0?.email||'',subject:`Proposta ${q.id}-v${v} — ${qPlace(q)}`,body:`Bom dia ${(ct0?.name||'').split(' ')[0]},\n\nSegue em anexo a nossa proposta ${q.id}-v${v} para ${qPlace(q)}.\nQualquer dúvida, estamos ao dispor.\n\nCumprimentos,\n${me().name}`};
 openModal(`Send proposal v${v}`,()=>{const f=F();const ct=cu.contacts.find(x=>x.id===f.contact);
  return `<div class="stack"><div><span class="flabel">Send to</span>${combo('sp-ct',{opts:contactOpts(cu).map(o=>({...o,sub:(cu.contacts.find(x=>x.id===o.v)?.email||'no email')+(o.sub?' · '+o.sub:'')})),value:f.contact,title:'Contact',onPick:x=>{f.contact=x;const c=cu.contacts.find(y=>y.id===x);f.email=c?.email||'';f.body=f.body.replace(/^Bom dia [^,]*,/,'Bom dia '+((c?.name||'').split(' ')[0])+',');}})}</div>
   <label class="f">Email${ct&&!ct.email?' <span class="faint" style="font-weight:400">(this contact has no email — type it; it is saved on the contact)</span>':''}<input type="email" data-f="email" value="${esc(f.email)}" placeholder="name@company.pt"></label>
   <label class="f">Subject<input type="text" data-f="subject" value="${esc(f.subject)}"></label>
   <label class="f">Message<textarea data-f="body" rows="6">${esc(f.body)}</textarea></label>
   <div class="tiny faint">${ic('doc',12)} The proposal ${esc(q.id)}-v${v} goes as an attachment. It is archived now and the email is queued — it is sent in the background.</div></div>`;},
 ()=>{const f=F();const ct=cu.contacts.find(x=>x.id===f.contact);const email=(f.email||'').trim();
  if(!ct)return err('Pick the contact to send to');if(!email)return err('Add an email address');if(!validEmail(email))return err('That email address doesn’t look right');
  if(!q.lines.length)return err('Add lines to generate the proposal.');
  {const nv=noValueLines(q).length;if(nv)return err(`${nv} line${nv>1?'s have':' has'} no client value yet — fill ${nv>1?'them':'it'} in before sending`);}
  if(!ct.email){ct.email=email;if(ct.self&&!cu.email)cu.email=email;}
  const total=calc(q).prop;const o={id:uid('ob'),kind:'proposal',quote:q.id,version:v,to:{contact:ct.id,name:ct.name,email},subject:f.subject,body:f.body,attachment:{type:'proposal-pdf',ref:`${q.id}-v${v}`},status:'pending',attempts:0,error:null,createdAt:new Date().toISOString(),createdBy:me().id,sentAt:null};
  OUTBOX.push(o);
  q.versions.push({v,date:TODAY_ISO,by:me().id,total,sig:proposalSig(q),snap:archiveOf(q),sentTo:{...o.to},outbox:o.id});q.since=TODAY_ISO;
  {const f=storeProposalPdf(q,q.versions[q.versions.length-1]);if(f)o.attachment.file=f.id;}
  logQ(q,`Proposal v${v} queued for ${ct.name} <${email}> (${eur(total)}) — copy archived`);state.modal=null;toast(`Proposal v${v} archived · email to ${email} queued`);},'Send');}
/* The sending routine (in production: a background job calling the email API, with retries). Here it runs when asked. */
function processOutbox(){let ok=0,ko=0;OUTBOX.filter(o=>o.status==='pending').forEach(o=>{o.attempts++;
  if(validEmail(o.to.email)){o.status='sent';o.sentAt=new Date().toISOString();ok++;}else{o.status='failed';o.error='Invalid address';ko++;}});
 toast(ok+ko?`${ok} sent${ko?` · ${ko} failed`:''}`:'Nothing waiting in the outbox');}
