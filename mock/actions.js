/* ===== Actions & events ===== */
const A={
 jobICS:()=>jobICS(QR(state.qid)),
 lang:()=>setLang(isPT()?'en':'pt'),
 abarOpenTop:()=>{state.abar=true;render();window.scrollTo({top:0,behavior:'smooth'});},
 abarToggle:()=>{if(!['home','quotes'].includes(state.view)){state.view='home';state.abar=true;render();window.scrollTo(0,0);return;}const open=!!state.abar;state.abar=!open;render();if(state.abar)window.scrollTo({top:0});},
 pgGo:t=>{const o=state.pg&&state.pg[t.dataset.k];if(!o)return;o.page=+t.dataset.p;const ql=document.getElementById('qlist'),dl=document.getElementById('dlist'),k=t.dataset.k;
  if(k==='quotes'&&ql)ql.innerHTML=listHtml();else if(dl)dl.innerHTML=dirList();else render();const top=(ql||dl);if(top)window.scrollTo({top:top.getBoundingClientRect().top+window.scrollY-90,behavior:'smooth'});},
 back:()=>{if(_navOK&&state.nav&&state.nav.stack.length)history.back();else navBack();},
 go:t=>{if(t.classList.contains('nav'))navReset();state.abar=null;state.view=t.dataset.v;state.modal=null;state.prof=null;state.custEdit=false;state.q='';render();window.scrollTo(0,0);},
 goFilter:t=>{state.view='quotes';state.filter=t.dataset.f;render();window.scrollTo(0,0);},
 open:t=>{state.abar=null;state.view='quote';state.qid=t.dataset.id;state.tab='summary';state.qmore=false;state.modal=null;state.toast=null;render();window.scrollTo(0,0);},
 openCust:t=>{state.view='customer';state.custId=t.dataset.id;state.custEdit=false;render();window.scrollTo(0,0);},
 filter:t=>{state.filter=t.dataset.f;render();},
 chipsGo:t=>{document.getElementById('chips')?.scrollBy({left:+t.dataset.d*220,behavior:'smooth'});},
 tab:t=>{state.tab=t.dataset.t;render();},
 descEdit:()=>{state.descEdit=state.descEdit===state.qid?null:state.qid;render();},
 archive:()=>mArchive(QR(state.qid)),
 unarchive:()=>{const q=QR(state.qid);if(!q.archived||!me().roles.includes(ADMIN_ROLE))return;delete q.archived;logQ(q,'Unarchived by an administrator');toast('Unarchived');},
 collabAdd:()=>{const q=QR(state.qid);if(collabCan(q))mExpense(q);},
 expAdd:()=>mExpense(null),
 expAddHere:()=>{const q=QR(state.qid);if(expCanJob(q))mExpense(q);},
 expEditAny:t=>{const q=QR(state.qid),l=q&&q.lines.find(x=>x.id===t.dataset.l&&x.onSite);if(!l)return;if(l.reimb)return toast(LT('Already paid back — it can no longer change','Já foi paga — já não se altera'));if(expCanJob(q))mExpense(q,l);},
 expRmAny:t=>{const q=QR(state.qid),l=q&&q.lines.find(x=>x.id===t.dataset.l&&x.onSite);if(!l||!expCanJob(q))return;if(l.reimb)return toast(LT('Already paid back — it can no longer be removed','Já foi paga — já não se remove'));mRemoveLine(q,l,()=>{q.lines.splice(q.lines.indexOf(l),1);logQ(q,`Expense removed by ${me().name}: ${l.desc}`);toast('Line removed');});},
 rcptRm:()=>{F().rcpt=null;render();},
 rcpt:t=>mReceipt(t.dataset.id),
 rcptDl:t=>{const f=fileOf(t.dataset.id);if(f)openPdf(f,true);},
 expAddJob:t=>{const q=QR(t.dataset.id);if(q&&expCanJob(q))mExpense(q);},
 expJob:t=>{state.expJob=t.dataset.id||null;render();},
 collabEdit:t=>{const q=QR(state.qid);const l=q.lines.find(x=>x.id===t.dataset.l&&x.addedBy===me().id);if(l&&collabCan(q))mExpense(q,l);},
 expEdit:t=>{const q=QR(t.dataset.q),l=q&&q.lines.find(x=>x.id===t.dataset.l&&x.addedBy===me().id);if(l&&!l.reimb&&expCanJob(q))mExpense(q,l);},
 expRm:t=>{const q=QR(t.dataset.q),l=q&&q.lines.find(x=>x.id===t.dataset.l&&x.addedBy===me().id);if(!l||l.reimb||!expCanJob(q))return;mRemoveLine(q,l,()=>{q.lines.splice(q.lines.indexOf(l),1);logQ(q,`Expense removed by ${me().name}: ${l.desc}`);toast('Expense removed');});},
 collabRm:t=>{const q=QR(state.qid);const l=q.lines.find(x=>x.id===t.dataset.l&&x.addedBy===me().id);if(!l||!collabCan(q))return;mRemoveLine(q,l,()=>{const i=q.lines.indexOf(l);if(i>=0)q.lines.splice(i,1);logQ(q,`On site: ${me().name} removed ${l.desc}`);toast('Resource removed');});},
 qmore:()=>{state.qmore=!state.qmore;render();},
 dirTab:t=>{state.dirTab=t.dataset.t;state.q='';render();},
 scrim:(t,e)=>{if(e.target===t)closeModal();},
 closeModal:()=>closeModal(),
 modalOk:()=>{if(state.modal.ok()===false)return;render();},
 comboOpen:t=>{const r=t.getBoundingClientRect();state.combo={id:t.dataset.id,q:'',r:{l:r.left,t:r.top,b:r.bottom,w:r.width}};render();},
 comboClose:()=>{state.combo=null;render();},
 comboPick:t=>{const cfg=COMBO[state.combo.id];const v=t.dataset.v;
  if(cfg.multi){const arr=[...(cfg.value||[])];const i=arr.indexOf(v);i>=0?arr.splice(i,1):arr.push(v);cfg.onPick(arr);render();}
  else{state.combo=null;cfg.onPick(v);render();}},
 fset:t=>{F()[t.dataset.k]=t.dataset.v;if(t.dataset.reset)F()[t.dataset.reset]='';render();},
 addSpec:t=>{const f=F(),d=t.dataset.d;f.dims[d]=[...new Set([...dvals(f.dims,d),t.dataset.v])];render();},
 newQType:()=>mQType(null),
 editQType:t=>mQType(t.dataset.code),
 delQType:t=>{const a=DB.settings.quoteTypes,i=a.findIndex(x=>x.code===t.dataset.code);if(i>=0){a.splice(i,1);state.modal=null;toast('Quote template deleted');}},
 voice:()=>{if(state.rec){stopVoice();render();}else startVoice();},
 quickAdd:()=>mQuickAdd(),
 addLine:()=>mAddLine(QR(state.qid)),
 addVendor:t=>{const v=V(t.dataset.v);mAddLine(QR(state.qid),{kind:'labor',ref:v.id,desc:t.dataset.t});},
 rmLine:t=>{const q=QR(state.qid);const l=q.lines.find(x=>x.id===t.dataset.l);if(l)mRemoveLine(q,l,()=>{const kids=subLines(q,l);q.lines=q.lines.filter(x=>x!==l&&!kids.includes(x));logQ(q,`Line removed: ${l.desc}${kids.length?` (+${kids.length} resource${kids.length>1?'s':''})`:''}`);toast('Line removed');});},
 confirmAll:()=>{const q=QR(state.qid);const ls=q.lines.filter(l=>l.kind==='labor'&&!l.confirmed&&!l.done);if(!ls.length)return;ls.forEach(l=>l.confirmed=true);logQ(q,`All vendors confirmed for ${fmtRange(q.workStart,q.workEnd)}: ${[...new Set(ls.map(l=>lineName(l)))].join(', ')}`);toast(`${ls.length} vendor${ls.length>1?'s':''} confirmed`);},
 confirmV:t=>{const q=QR(state.qid);const l=q.lines.find(x=>x.id===t.dataset.l);l.confirmed=true;logQ(q,`${V(l.ref).name} confirmed for ${fmtRange(q.workStart,q.workEnd)}`);toast(`${V(l.ref).name} confirmed`);},
  send:()=>mSendProposal(QR(state.qid)),
 processOutbox:()=>processOutbox(),
 retryOut:t=>{const o=OUTBOX.find(x=>x.id===t.dataset.id);if(o){o.status='pending';o.error=null;toast('Back in the queue');}},
 editLine:t=>{const q=QR(state.qid);mEditLine(q,q.lines.find(l=>l.id===t.dataset.l));},
 viewProposal:t=>mProposalView(QR(state.qid),t.dataset.v),
 pdfOpen:t=>{const q=QR(state.qid),x=q.versions.find(y=>y.v===+t.dataset.v),f=x&&pdfFor(q,x);if(f)openPdf(f,false);else toast('No archived copy for this version');},
 pdfDown:t=>{const q=QR(state.qid),x=q.versions.find(y=>y.v===+t.dataset.v),f=x&&pdfFor(q,x);if(f)openPdf(f,true);else toast('No archived copy for this version');},
 lock:()=>{const q=QR(state.qid);if(q.status!=='open')return;if(!q.workStart)return mDates(q,true);doLock(q);},
 company:()=>mCompany(),
 goSetup:t=>{state.view='setup';state.setupTab=t.dataset.t;state.modal=null;render();window.scrollTo(0,0);},
 setupTab:t=>{state.setupTab=t.dataset.t;render();},
 setTab:t=>{state.setTab=t.dataset.t;render();window.scrollTo(0,0);},
 openSeries:t=>{state.view='series';state.seriesCode=t.dataset.code;render();window.scrollTo(0,0);},
 closeLine:t=>mCloseLine(t.dataset.code,t.dataset.id),
 reopenLine:t=>{const ser=DB.settings.numberSeries.find(x=>x.code===t.dataset.code),l=ser.lines.find(x=>x.id===t.dataset.id);l.closed='';toast('Line reopened');},
 delLine:t=>{const ser=DB.settings.numberSeries.find(x=>x.code===t.dataset.code),l=ser.lines.find(x=>x.id===t.dataset.id);if(!l||l.last)return toast('This line has been used — close it instead');
  ser.lines.splice(ser.lines.indexOf(l),1);ser.lines.forEach(x=>{if(x.closed===l.start)x.closed='';});toast('Line deleted');},
 openDim:t=>{state.view='dim';state.dimCode=t.dataset.code;render();window.scrollTo(0,0);},
 newDim:()=>mDim(null),
 editDim:t=>mDim(t.dataset.code),
 newDimValue:t=>mDimValue(t.dataset.code,null),
 editDimValue:t=>mDimValue(t.dataset.code,t.dataset.v),
 delDim:t=>{const i=DB.settings.dimensions.findIndex(x=>x.code===t.dataset.code);if(i>=0&&!dimInUse(t.dataset.code)){DB.settings.dimensions.splice(i,1);state.modal=null;state.view='setup';state.setupTab='dims';toast('Dimension deleted');}},
 delDimValue:t=>{const d=dimOf(t.dataset.code);const i=d?d.values.findIndex(x=>x.code===t.dataset.v):-1;if(i>=0&&!dimInUse(d.code,t.dataset.v)){d.values.splice(i,1);state.modal=null;toast('Value deleted');}},
 dimAdd:t=>{state.dimPend[t.dataset.p]=true;render();},
 dimCancel:t=>{state.dimPend[t.dataset.p]=false;render();},
 dimValRm:t=>{const r=DIMREG[t.dataset.p],k=t.dataset.k,v=t.dataset.v;if(!r)return;const old=[...dvals(r.dims,k)],nv=old.filter(x=>x!==v);r.dims[k]=nv;if(r.onSet)r.onSet(dimOf(k),old,nv);render();},
 dimRm:t=>{const r=DIMREG[t.dataset.p],k=t.dataset.k;if(!r)return;const old=dvals(r.dims,k);delete r.dims[k];if(old.length&&r.onSet)r.onSet(dimOf(k),old,[]);render();},
 newSeries:()=>mSeries(null),
 editSeries:t=>mSeries(t.dataset.code),
 addSeriesLine:t=>mSeriesLine(t.dataset.code),
 delSeries:t=>{const i=DB.settings.numberSeries.findIndex(x=>x.code===t.dataset.code);const ser=DB.settings.numberSeries[i];if(ser&&!seriesUse(ser.code).length&&!ser.lines.some(l=>l.last)){DB.settings.numberSeries.splice(i,1);state.modal=null;state.view='setup';state.setupTab='series';toast('Series removed');}},
 editParties:()=>mParties(QR(state.qid)),
 editSite:()=>mSite(QR(state.qid)),
 billUnlock:()=>{F().unlocked=true;render();},
 billReset:()=>{pullBill(F());render();},
 refreshPrice:t=>{const q=QR(state.qid);const l=q.lines.find(x=>x.id===t.dataset.l);const r=R(l.ref),old=l.cost;if(price(r)==null)return;l.cost=price(r);l.unit=r.unit;l.refName=r.name;l.priceDate=TODAY_ISO;logQ(q,`“${l.desc}”: price ${eur2(old)} → ${eur2(l.cost)} per ${l.unit} (today’s price)`);toast('Line now uses today’s price');},
 unit:t=>mUnit(t.dataset.code||null),
 delUnit:t=>{const i=DB.settings.units.findIndex(u=>u.code===t.dataset.code);if(i>=0&&!unitUse(t.dataset.code)){DB.settings.units.splice(i,1);state.modal=null;toast('Unit removed');}},
 addLocation:()=>{F().locations.push({id:uid('loc'),name:'',address:EMPTY_ADDR(),notes:''});render();},
 rmLocation:t=>{F().locations.splice(+t.dataset.i,1);render();},
 reject:()=>mRejected(QR(state.qid)),
 cancelInstead:()=>mCancel(QR(state.qid)),
  cancelQ:()=>mCancel(QR(state.qid)),
  reopen:()=>{const q=QR(state.qid);if(q.archived)return;mReopen(q);},
 dates:()=>mDates(QR(state.qid)),
 visitNeed:t=>{const q=QR(state.qid);q.visit.needed=t.dataset.v==='1';logQ(q,q.visit.needed?'Site visit needed — to plan in Routes':'Site visit not needed');toast(q.visit.needed?'Marked as needing a visit':'Visit not needed');},
 planVisit:t=>{const q=QR(t.dataset.id),m=state.map;state.view='map';m.mode='plan';m.rid=null;m.edit=null;m.sug=null;m.kinds[mapKind(q)]=true;
  if(q.lat!=null&&q.lng!=null){if(!m.sel.includes(q.id))m.sel.push(q.id);toast(`${qCust(q)} added to the plan — choose the day and add nearby visits`);}else toast('This job has no location — add the address first');render();window.scrollTo(0,0);},
 visitDone:()=>{const q=QR(state.qid);completeVisit(q);toast('Visit marked as done');},
 markDone:()=>mDone(QR(state.qid)),
 vendor:t=>mVendor(t.dataset.id),
 price:t=>mResource(t.dataset.id),
 resource:t=>mResource(t.dataset.id||null),
 newResLine:()=>{const q=QR(state.qid),keep={...F()};mResource(null,n=>{mAddLine(q,{...keep,kind:'resource',ref:n.id,desc:keep.desc||n.name});});},
 theme:()=>{setTheme(isDark()?'light':'dark');render();},
 themeSet:t=>{setTheme(t.dataset.v==='system'?null:t.dataset.v);render();},
 goDir:t=>{state.view='dir';state.dirTab=t.dataset.t;state.q='';render();window.scrollTo(0,0);},
 /* account & admin */
 menu:()=>{state.menu=!state.menu;render();},
 menuClose:()=>{state.menu=false;render();},
 signIn:()=>signIn(),
 signInAdmin:()=>signInAdmin(),
 signInCollab:()=>signInCollab(),
 signOut:()=>signOut(),
 userTab:t=>{state.userTab=t.dataset.t;render();},
 editUser:t=>mUser(t.dataset.id||null),
 delUser:t=>delUser(t.dataset.id),
 editRole:t=>mRole(t.dataset.id||null),
 navMore:()=>{state.navMore=!state.navMore;render();},
 delRole:t=>delRole(t.dataset.id),
 saveProfile:()=>saveProfile(),
 savePassword:()=>savePassword(),
 exportDB:()=>{exportDB();toast('db.json downloaded');},
 reloadFile:async()=>{const keep=state.user;lsSet(STORE_KEY,null);saveDB.last=null;await loadDB(true);
  if(!U(keep)?.active){signOut();return toast('Reloaded — please sign in again');}state.viewAs=null;render();toast(DB_SOURCE==='file'?'Reloaded from data/db.json':'Could not read data/db.json — using the built-in empty database');},
 invite:()=>toast('Invite sent (mock)'),
 newCust:()=>{state.dimPend={};state.view='customer';state.custId='__new';state.custEdit=true;state.form={dims:{},type:'person',name:'',nif:'',phone:'',email:'',billing:EMPTY_ADDR(),locations:[],notes:'',contacts:[{id:uid('ct'),self:true,name:'',role:'',phone:'',email:'',primary:true}]};render();window.scrollTo(0,0);},
 blockCust:()=>{const c=C(state.custId);c.blocked=!c.blocked;toast(c.blocked?`${c.name} blocked — hidden from lists, existing quotes keep it`:`${c.name} unblocked`);},
 delCust:()=>{const c=C(state.custId);if(c&&!custInUse(c))mDelete('cust',c.id);},
 blockVend:t=>{const v=V(t.dataset.id);v.blocked=!v.blocked;state.modal=null;toast(v.blocked?`${v.name} blocked — hidden from lists, existing quotes keep it`:`${v.name} unblocked`);},
 delVend:t=>{const v=V(t.dataset.id);if(v&&!vendInUse(v))mDelete('vend',v.id);},
 editCust:()=>{const c=C(state.custId);state.custEdit=true;state.dimPend={};state.form=JSON.parse(JSON.stringify({dims:c.dims||{},type:c.type||'person',name:c.name,nif:c.nif,phone:c.phone||'',email:c.email||'',billing:addrOf(c.billing),locations:c.locations,notes:c.notes,contacts:c.contacts}));render();window.scrollTo(0,0);},
 custCancel:()=>{state.custEdit=false;if(state.custId==='__new')state.view='dir';render();},
 custSave:()=>{const f=F();f.name=(f.name||'').trim();f.email=(f.email||'').trim();if(!f.name)return err('Name is required');
  if(f.email&&!validEmail(f.email))return err('The customer email doesn’t look valid');
  f.contacts.forEach(x=>{if(x.self){x.name=f.name;x.phone=f.phone||'';x.email=f.email||'';}});
  const cts=f.contacts.filter(x=>x.self||x.name);if(!cts.length)return err('Add at least one contact');
  f.locations=f.locations.filter(l=>l.name||!addrEmpty(l.address));f.contacts=cts;if(!f.contacts.some(x=>x.primary))f.contacts[0].primary=true;
  let c=state.custId==='__new'?null:C(state.custId);if(!c){if(noOpen('customer'))return err(noSeriesMsg('customer'));c={id:uid('c'),no:nextNo('customer')};CUSTOMERS.push(c);state.custId=c.id;}
  f.dims=cleanDims(f.dims);Object.assign(c,f);state.custEdit=false;state.formErr=null;toast('Customer saved');},
 selfContact:()=>{const f=F();if(f.contacts.some(x=>x.self))return;f.contacts.unshift({id:uid('ct'),self:true,name:f.name,role:'',phone:f.phone||'',email:f.email||'',primary:!f.contacts.some(x=>x.primary&&(x.self||x.name))});if(f.contacts[0].primary)f.contacts.slice(1).forEach(x=>x.primary=false);render();},
 unlinkSelf:t=>{const f=F(),x=f.contacts[+t.dataset.i];if(!x)return;x.self=false;x.name=f.name||'';x.phone=f.phone||'';x.email=f.email||'';render();},
 addContact:()=>{F().contacts.push({id:uid('ct'),name:'',role:'',phone:'',email:'',primary:false});render();},
 rmContact:t=>{const f=F();const [x]=f.contacts.splice(+t.dataset.i,1);if(x.primary&&f.contacts[0])f.contacts[0].primary=true;render();},
 primary:t=>{F().contacts.forEach((x,i)=>x.primary=i===+t.dataset.i);},
 pick:t=>{const id=t.dataset.id,s=state.map.sel;const i=s.indexOf(id);i>=0?s.splice(i,1):s.push(id);render();},
 mapMode:t=>{state.map.mode=t.dataset.v;state.map.rid=null;state.map.ask=null;render();},
 mapDay:t=>{state.map.date=t.dataset.v;render();},
 mapKind:t=>{const m=state.map,k=t.dataset.v;m.kinds[k]=!m.kinds[k];if(!Object.values(m.kinds).some(Boolean))m.kinds[k]=true;if(m.sug)m.sug=suggestRoutes(planPool(),m.per);render();},
 mapPer:t=>{state.map.per=+t.dataset.v;if(state.map.sug)state.map.sug=suggestRoutes(planPool(),state.map.per);render();},
 suggest:()=>{const m=state.map;m.sug=suggestRoutes(planPool(),m.per);if(!m.sel.length&&m.sug.length)m.sel=m.sug[0].order.map(q=>q.id);render();
  toast(m.sug.length?`${m.sug.length} route${m.sug.length>1?'s':''} suggested — the first one is loaded for ${dayLabel(m.date)}`:'Nothing to suggest');},
 sugClose:()=>{state.map.sug=null;render();},
 useSug:t=>{state.map.sel=t.dataset.ids.split(',');render();if(window.innerWidth<1000)setTimeout(()=>document.getElementById('draft')?.scrollIntoView({behavior:'smooth',block:'start'}),50);},
 optOrder:()=>{const m=state.map;m.sel=tour(m.sel.map(QR)).order.map(q=>q.id);render();toast('Stops put in the shortest order');},
 mvStop:t=>{const s=state.map.sel,i=+t.dataset.i,j=i+(+t.dataset.d);if(j<0||j>=s.length)return;[s[i],s[j]]=[s[j],s[i]];render();},
 clearSel:()=>{state.map.sel=[];state.map.edit=null;render();},
 savePlan:()=>{const m=state.map,ids=m.sel.slice();if(!ids.length)return;
  let r=m.edit&&RT(m.edit);
  if(r){const keep=r.stops.filter(s=>ids.includes(s.q)&&r.date===m.date);
   liveStops(r).filter(s=>!ids.includes(s.q)).forEach(s=>{const q=QR(s.q);if(s.done)return;q.visit.date=null;q.visit.route=null;logQ(q,`Removed from the visit route of ${fmtDate(r.date)} — back to visits to plan`);});
   r.date=m.date;r.stops=[...r.stops.filter(s=>s.done),...ids.map(id=>keep.find(s=>s.q===id)||{q:id,confirm:'pending',slot:null})];}
  else{r={id:uid('rt'),date:m.date,stops:ids.map(id=>({q:id,confirm:'pending',slot:null})),createdAt:new Date().toISOString(),by:me().id};ROUTES_().push(r);}
  ids.forEach(id=>{const q=QR(id);if(q.visit.date!==r.date||q.visit.route!==r.id)logQ(q,`Site visit planned ${fmtDate(r.date)} (route, ${ids.length} visits) — to confirm with the client`);q.visit.date=r.date;q.visit.route=r.id;});
  const wasEdit=!!m.edit;m.sel=[];m.edit=null;
  if(wasEdit){m.mode='routes';m.rid=r.id;toast('Route updated');render();return;}
  let nd=addDays(m.date,1);if(D(nd).getDay()===0)nd=addDays(nd,1);m.date=nd;
  if(m.sug){m.sug=suggestRoutes(planPool(),m.per);if(!m.sug.length)m.sug=null;}
  toast(`Route for ${fmtDate(r.date)} saved in Routes · ${visitPool().filter(hasLoc).length} jobs left on the map`);render();},
 openRoute:t=>{state.view='map';state.map.mode='routes';state.map.rid=t.dataset.id||null;state.map.ask=null;render();window.scrollTo(0,0);},
 routeICS:t=>routeICS(RT(t.dataset.id)),
 editRoute:t=>{const r=RT(t.dataset.id),m=state.map;m.edit=r.id;m.sel=liveStops(r).filter(s=>!s.done).map(s=>s.q);m.date=r.date;m.mode='plan';m.sug=null;render();window.scrollTo(0,0);},
 delRoute:t=>mDelRoute(RT(t.dataset.id)),
 stopAsk:t=>{const m=state.map;m.ask=t.dataset.q&&m.ask!==t.dataset.q?t.dataset.q:null;render();},
 /* the client confirmed the day; the time is optional: morning (am), afternoon (pm) or none */
 stopSlot:t=>{const r=RT(t.dataset.r),s=r.stops.find(x=>x.q===t.dataset.q),v=t.dataset.v,q=QR(s.q);state.map.ask=null;
  if(v==='__no'){s.confirm='pending';s.slot=null;logQ(q,`Site visit ${fmtDate(r.date)} back to to confirm`);toast('Back to to confirm');render();return;}
  const was=s.confirm==='confirmed';s.confirm='confirmed';s.slot=v||null;const w=v?SLOT_L[v].toLowerCase():'no set time';
  logQ(q,`Site visit ${fmtDate(r.date)} confirmed with the client — ${w}`);
  toast(routeConfirmed(r)&&!was?'Route confirmed — every client confirmed':slotOutOfOrder(liveStops(r))?'Confirmed — check the order: an afternoon visit comes before a morning one':'Confirmed with the client');render();},
 sortSlots:t=>{sortBySlot(RT(t.dataset.r));toast('Morning visits first');render();},
 rMv:t=>{const r=RT(t.dataset.r),st=liveStops(r),i=st.findIndex(s=>s.q===t.dataset.q);if(i<1)return;[st[i-1],st[i]]=[st[i],st[i-1]];r.stops=[...st,...r.stops.filter(s=>!st.includes(s))];render();},
 stopNo:t=>{const r=RT(t.dataset.r),q=QR(t.dataset.q);state.map.ask=null;r.stops=r.stops.filter(x=>x.q!==q.id);q.visit.date=null;q.visit.route=null;logQ(q,`Client can’t on ${fmtDate(r.date)} — back to visits to plan`);toast(`${qCust(q)} is back in the visits to plan`);},
 stopDone:t=>{completeVisit(QR(t.dataset.q));toast('Visit marked as done');},
 clearDone:()=>{const n=ROUTES_().filter(routeDone).length;DB.routes=ROUTES_().filter(r=>!routeDone(r));toast(`${n} finished route${n>1?'s':''} cleared`);},
};
/* Permissions are checked here for every action (the screens also hide what you can't do). In production the Web API enforces the same rules. */
const ACT_PERM={
 'setup.edit':'company newQType editQType delQType closeLine reopenLine delLine newDim editDim newDimValue editDimValue delDim delDimValue newSeries editSeries addSeriesLine delSeries unit delUnit',
 'quotes.edit':'descEdit quickAdd addLine addVendor rmLine editLine editParties editSite billUnlock billReset refreshPrice dates visitNeed reject cancelInstead addSpec voice',
 'quotes.edit|work.manage':'lock markDone',
 'work.manage':'confirmAll confirmV',
 'quotes.send|data.manage':'processOutbox retryOut',
 'customers.edit':'newCust blockCust delCust editCust custSave selfContact unlinkSelf addContact rmContact primary addLocation rmLocation',
 'vendors.edit':'blockVend delVend',
 'resources.price':'price resource newResLine',
 'map.planner':'pick mapMode mapDay mapKind mapPer suggest sugClose useSug optOrder mvStop clearSel savePlan editRoute delRoute stopAsk stopSlot sortSlots rMv stopNo stopDone clearDone planVisit routeICS',
 'users.manage':'userTab editUser delUser editRole delRole invite',
 'data.manage':'exportDB reloadFile',
 'work.addResources|expenses.onBehalf':'expAdd expAddJob expEdit expRm',
 'work.addResources':'collabAdd collabEdit collabRm',
 'expenses.onBehalf':'expAddHere expEditAny expRmAny'};
const PERM_OF={};Object.entries(ACT_PERM).forEach(([p,acts])=>acts.split(' ').forEach(a=>PERM_OF[a]=p));
const allowed=act=>{const p=PERM_OF[act];return !p||p.split('|').some(x=>can(x));};
const CHG_PERM={sla:'alerts.rules',workAlert:'alerts.rules',perm:'users.manage',rperm:'users.manage',rmob:'users.manage',importDB:'data.manage',dirBlocked:'',mdate:'map.planner',mstart:'map.planner'};
const allowedChg=k=>{const p=CHG_PERM[k];return !p||p.split('|').some(x=>can(x));};
document.addEventListener('click',e=>{const t=e.target.closest('[data-act]');if(!t)return;
 if(t.dataset.act==='scrim'&&e.target!==t)return; /* clicks inside a modal: let inputs and labels behave normally */
 if(state.menu&&!['menu','menuClose'].includes(t.dataset.act))state.menu=false;
 if(t.tagName==='INPUT'&&t.type!=='radio')return;
 if(t.tagName!=='INPUT')e.preventDefault();
 if(t.disabled)return;
 if(state.qmore&&t.dataset.act!=='qmore')state.qmore=false;
 if(state.navMore&&t.dataset.act!=='navMore')state.navMore=false;
 if(state.formErr&&!/^combo/.test(t.dataset.act))state.formErr=null; /* the action sets it again if the form is still not valid */
 if(!allowed(t.dataset.act))return toast('You don’t have permission for this');
 A[t.dataset.act]?.(t,e);});
document.addEventListener('input',e=>{const t=e.target;
 if(t.id==='combo-q'){state.combo.q=t.value;document.getElementById('combo-list').innerHTML=comboOptsHtml(COMBO[state.combo.id],t.value);return;}
 if(t.dataset.inp==='q'){state.q=t.value;document.getElementById('qlist').innerHTML=listHtml();watchMore();}
 if(t.dataset.inp==='dq'){state.q=t.value;document.getElementById('dlist').innerHTML=dirList();watchMore();}
 if(t.dataset.f&&!t.dataset.rerender){const f=F();f[t.dataset.f]=t.type==='checkbox'?t.checked:t.value;
  if(t.dataset.f==='desc'){const s=document.getElementById('qa-sug');if(s)s.innerHTML=sugHtml(suggestSpecs(f.desc,f.dims));}}
 if(t.dataset.af){const i=t.dataset.af.indexOf(':');const o=getPath(F(),t.dataset.af.slice(0,i));if(o)o[t.dataset.af.slice(i+1)]=t.value;}
 if(t.dataset.sync){const f=F();const code=(f.code!=null&&state.modal.title==='New series'?f.code.trim().toUpperCase():state.modal.title.replace('Add line to ',''));
  if(code&&f.start){const nf=code+yy(f.start)+'000001',nt=code+yy(f.start)+'999999';
   [['from',nf,'_af'],['to',nt,'_at']].forEach(([k,v,m])=>{if(!f[k]||f[k]===f[m]){f[k]=v;const el=document.querySelector(`[data-f=${k}]`);if(el)el.value=v;}f[m]=v;});}}
 if(t.dataset.f&&state.view==='customer')document.querySelectorAll(`[data-mirror="${t.dataset.f}"]`).forEach(e=>e.textContent=t.value||'—');
 if(t.dataset.cf){const [i,k]=t.dataset.cf.split(':');F().contacts[+i][k]=t.value;}
 if(t.dataset.qf){QR(state.qid)[t.dataset.qf]=t.value;saveDB();}
 if(t.dataset.pf&&state.prof)state.prof[t.dataset.pf]=t.value;
 if(t.dataset.chg==='dirBlocked'){state.dirBlocked=t.checked;document.getElementById('dlist').innerHTML=dirList();return;}
});
document.addEventListener('change',e=>{const t=e.target,k=t.dataset.chg;
 if(t.dataset.rerender){F()[t.dataset.f]=t.type==='checkbox'?t.checked:t.value;render();return;}
 if(t.dataset.qf==='description')logQ(QR(state.qid),'Description 2 updated');
 if(t.dataset.qf==='title')logQ(QR(state.qid),`Description → ${QR(state.qid).title||'—'}`);
 if(!k)return;if(!allowedChg(k)){toast('You don’t have permission for this');render();return;}const q=QR(state.qid);
 if(k==='perm'){const r=RL(t.dataset.r),p=t.dataset.p;if(!r||r.system)return;t.checked?r.perms.includes(p)||r.perms.push(p):r.perms.splice(r.perms.indexOf(p),1);r.perms=ALL_PERMS.filter(x=>r.perms.includes(x));render();return;}
 if(k==='rmob'){const a=F().mobile,p=t.dataset.p;if(t.checked){if(a.length>=MOBILE_MAX){t.checked=false;return toast(LT(`Up to ${MOBILE_MAX} buttons`,`Até ${MOBILE_MAX} botões`));}a.includes(p)||a.push(p);}else a.splice(a.indexOf(p),1);render();return;}
 if(k==='rperm'){const a=F().perms,p=t.dataset.p;t.checked?a.includes(p)||a.push(p):a.splice(a.indexOf(p),1);return;}
 if(k==='rcpt'){const file=t.files&&t.files[0];if(!file)return;readReceipt(file,data=>{F().rcpt={data};render();});return;}
 if(k==='importDB'){const file=t.files[0];if(!file)return;const rd=new FileReader();rd.onload=()=>{try{const keep=state.user;importDB(rd.result);state.viewAs=null;
   if(!U(keep)?.active){signOut();toast('Data loaded — sign in with an account from the file');}else{render();toast(`Loaded ${file.name}`);}}catch(x){toast('Could not load: '+x.message);}};rd.readAsText(file);return;}
 if(k==='workAlert'){DB.settings.workAlert[t.dataset.i]=Math.max(0,Math.floor(+t.value)||0);render();return;}
 if(k==='sla'){DB.settings.sla[t.dataset.s][+t.dataset.i]=+t.value||1;render();}
 if(k==='notif')state.notif[t.dataset.k]=t.checked;
 if(k==='mdate'){if(t.value)state.map.date=t.value;render();}
});
document.addEventListener('keydown',e=>{
 if(e.key==='Enter'&&(e.target.id==='li-email'||e.target.id==='li-pass')){e.preventDefault();signIn();return;}
 if(e.key==='Escape'&&state.menu){state.menu=false;render();return;}
 if(e.key==='Escape'){if(state.combo){state.combo=null;render();}else if(state.modal)closeModal();}
 if(e.key==='Enter'&&e.target.id==='combo-q'){e.preventDefault();document.querySelector('#combo-list .copt')?.click();}
 if(e.key==='ArrowDown'&&e.target.id==='combo-q'){e.preventDefault();document.querySelector('#combo-list .copt')?.focus();}
});
/* Filter chips: drag with the mouse, or use the mouse wheel / arrows (touch scrolls natively) */
let _cd=null,_dragged=false;
document.addEventListener('mousedown',e=>{const c=e.target.closest('.chips');if(!c||e.button)return;_cd={c,x:e.clientX,l:c.scrollLeft,m:false};});
document.addEventListener('mousemove',e=>{if(!_cd)return;const dx=e.clientX-_cd.x;if(!_cd.m&&Math.abs(dx)>5){_cd.m=true;_cd.c.classList.add('drag');}if(_cd.m)_cd.c.scrollLeft=_cd.l-dx;});
document.addEventListener('mouseup',()=>{if(!_cd)return;_cd.c.classList.remove('drag');if(_cd.m){_dragged=true;setTimeout(()=>{_dragged=false;},60);}_cd=null;});
document.addEventListener('click',e=>{if(_dragged){e.stopPropagation();e.preventDefault();}},true);
document.addEventListener('wheel',e=>{const c=e.target.closest?.('.chips');if(!c||Math.abs(e.deltaX)>Math.abs(e.deltaY)||c.scrollWidth<=c.clientWidth)return;e.preventDefault();c.scrollLeft+=e.deltaY;},{passive:false});
window.addEventListener('scroll',()=>{if(state.combo&&window.innerWidth>=700){state.combo=null;render();}},{passive:true});
let _w=window.innerWidth<700;window.addEventListener('resize',()=>{const n=window.innerWidth<700;if(n!==_w){_w=n;state.combo=null;render();}});
/* Boot: load data (browser copy → data/db.json → built-in empty), restore the session */
(async()=>{render();i18nStart();await loadDB();const sid=lsGet(SESSION_KEY);if(sid&&U(sid)?.active)state.user=sid;render();})();
