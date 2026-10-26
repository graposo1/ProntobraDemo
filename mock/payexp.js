/* ===== Expense payments (25-10-2026) =====
   Expenses recorded on site by collaborators (lines with onSite) are paid back to them by the company.
   People with "expenses.pay" (Administrator always; Finance by default) see every expense, filter the ones not paid yet,
   select several and mark them as paid in one go. Marking can be undone.
   Data: l.reimb = {date, by} on the expense line (null/absent = not paid yet).
   Amount owed = the amount on the receipt (l.paid) or, without it, quantity × cost of the line.
   Once paid, the collaborator can no longer change or remove that expense.
   "Paid by" (D-70, 26-10-2026): the money goes back to the expense's vendor (l.paidBy), not to whoever added it. Expenses paid by the
   company (no paidBy) have nothing to pay back: they never show under "To pay" (status "Paid by the company"). Filter and totals by "Paid by". */

const expAmount=l=>l.paid!=null?l.paid:l.qty*lineCost(l);
const allExpenses=()=>QUOTES.flatMap(q=>q.lines.filter(l=>l.onSite).map(l=>({q,l})));
function pxSt(){return state.px||(state.px={show:'due',who:'',from:'',to:'',sel:{}});}
function pxRows(){const s=pxSt();
 return allExpenses().filter(({l})=>(s.show==='all'||(s.show==='due'?!l.reimb&&!expByCo(l):!!l.reimb))&&(!s.who||(s.who==='__co'?expByCo(l):l.paidBy===s.who))&&(!s.from||(l.addedAt||'')>=s.from)&&(!s.to||(l.addedAt||'')<=s.to))
  .sort((a,b)=>(a.l.addedAt||'').localeCompare(b.l.addedAt||'')*(s.show==='paid'?-1:1));}

const pxKey=()=>{const s=pxSt();return ['px',s.show,s.who,s.from,s.to].join(':');};
function vPayExp(){const s=pxSt(),all=allExpenses(),due=all.filter(x=>!x.l.reimb&&!expByCo(x.l));
 const payers=[...new Map(all.filter(x=>x.l.paidBy).map(x=>[x.l.paidBy,expPayer(x.l)])).entries()].sort((a,b)=>a[1].localeCompare(b[1]));
 const rows=pxRows();Object.keys(s.sel).forEach(k=>{if(!rows.some(r=>r.l.id===k&&!r.l.reimb))delete s.sel[k];});
 const sel=rows.filter(r=>s.sel[r.l.id]);const dueRows=rows.filter(r=>!r.l.reimb&&!expByCo(r.l));
 const P_=pg(pxKey(),rows),page=P_.items,pageDue=page.filter(r=>!r.l.reimb&&!expByCo(r.l));
 return `<div class="page-head"><div class="grow"><h1>Expense payments</h1><div class="muted small" style="margin-top:4px">${LT('Expenses paid by collaborators or vendors, to be paid back to whoever paid them (“Paid by”). Select the ones you paid back and mark them as paid.','Despesas pagas por colaboradores ou fornecedores, que a empresa devolve a quem pagou (“Pago por”). Selecione as que já devolveu e marque-as como pagas.')}</div></div>
  ${rows.length?`<button class="btn sm" data-act="pxCsv">${ic('doc',15)} Export CSV</button>`:''}</div>
 <div class="row wrap" style="gap:10px;margin-bottom:10px;align-items:flex-end">
  <div class="chips" role="tablist">${[['due',LT('To pay','Por pagar')],['paid',LT('Paid','Pagas')],['all',LT('All','Todas')]].map(([k,l])=>`<button class="chip ${s.show===k?'on':''}" data-act="pxShow" data-k="${k}">${l}</button>`).join('')}</div>
  <div style="min-width:220px"><span class="flabel">${LT('Paid by','Pago por')}</span>${combo('px-who',{opts:[{v:'',l:LT('All','Todos')},...payers.map(([id,n])=>({v:id,l:n})),{v:'__co',l:LT('The company','A empresa')}],value:s.who,title:LT('Paid by','Pago por'),onPick:v=>{s.who=v;s.sel={};}})}</div>
  <div><span class="flabel">${LT('Expense date','Data da despesa')}</span>${rangePick('px-dates',{from:s.from,to:s.to,presets:rpPresets(),active:s.dk,empty:LT('All dates','Todas as datas'),onApply:(a,b)=>{s.from=a;s.to=b;s.dk='';s.sel={};},onPreset:(k,a,b)=>{s.from=a;s.to=b;s.dk=k;s.sel={};}})}</div></div>
 ${!rows.length?`<div class="card"><div class="empty">${s.show==='due'?'Nothing to pay — all expenses are paid.':'No expenses here.'}</div></div>`:`
 ${dueRows.length?`<div class="pxbar${sel.length?' on':''}"><div class="grow" style="min-width:0">${sel.length?`<b>${LT(`${sel.length} selected`,`${sel.length} selecionada${sel.length===1?'':'s'}`)} · ${eur2(sum(sel,r=>expAmount(r.l)))}</b><div class="tiny faint ell">${esc([...new Set(sel.map(r=>expPayer(r.l)||'—'))].join(', '))}${sel.length<dueRows.length?` · <button class="link tiny" data-act="pxAll">${LT(`Select all ${dueRows.length} to pay`,`Selecionar as ${dueRows.length} por pagar`)}</button>`:''}</div>`
   :`<span class="small muted">${LT(`Select the expenses you paid — ${dueRows.length} to pay · ${eur2(sum(dueRows,r=>expAmount(r.l)))}. Shift + click selects everything in between.`,`Selecione as despesas que pagou — ${dueRows.length} por pagar · ${eur2(sum(dueRows,r=>expAmount(r.l)))}. Shift + clique seleciona todas as do meio.`)}</span> <button class="link small" data-act="pxAll">${LT('Select all','Selecionar todas')}</button>`}</div>
  ${sel.length?`<button class="btn sm ghost" data-act="pxClear">${LT('Clear','Limpar')}</button>`:''}<button class="btn pri" data-act="pxPay" ${sel.length?'':'disabled'}>${ic('check',16)} ${LT('Mark as paid','Marcar como pagas')}${sel.length?' ('+sel.length+')':''}</button></div>`:''}
 <div class="tcard"><div class="scroll-x" style="margin:0;padding:0"><table class="ltable pxtable"><thead><tr>
  <th style="width:36px">${pageDue.length?`<input type="checkbox" data-px="page" ${pageDue.every(r=>s.sel[r.l.id])?'checked':''} aria-label="Select all on this page" title="${LT('Select all on this page','Selecionar todas desta página')}">`:''}</th>
  <th>Date</th><th>${LT('Paid by','Pago por')}</th><th>Job</th><th>Expense</th><th class="r">Amount</th><th>Status</th></tr></thead><tbody>
  ${page.map(({q,l})=>`<tr${s.sel[l.id]?' class="sel"':''}><td>${l.reimb||expByCo(l)?'':`<input type="checkbox" data-px="${l.id}" ${s.sel[l.id]?'checked':''} aria-label="Select">`}</td>
   <td style="white-space:nowrap">${fmtDate(l.addedAt)}</td><td>${expByCo(l)?`<span class="muted">${LT('The company','A empresa')}</span>`:esc(expPayer(l))}${U(l.addedBy)&&U(l.addedBy).vendor!==l.paidBy?`<div class="tiny faint">${esc(LT(`added by ${U(l.addedBy).name}`,`lançada por ${U(l.addedBy).name}`))}</div>`:''}</td>
   <td><button class="link" data-act="open" data-id="${q.id}">${esc(qCust(q))}</button><div class="tiny faint mono">${q.id}</div></td>
   <td style="min-width:180px"><div>${esc(l.desc)}</div>${l.detail?`<div class="small muted">${esc(l.detail)}</div>`:''}<div class="tiny faint">${l.qty} ${esc(lineUnit(l))}${l.receipt&&fileOf(l.receipt)?` · <button class="link tiny" data-act="rcpt" data-id="${l.receipt}">${ic('doc',11)} Receipt</button>`:' · no receipt'}</div></td>
   <td class="r" style="white-space:nowrap"><b>${eur2(expAmount(l))}</b>${l.paid==null?`<div class="tiny faint">${LT('resource price','preço do recurso')}</div>`:''}</td>
   <td>${l.reimb?`<span class="pill p-green">${LT('Paid','Paga')} ${fmtDate(l.reimb.date)}</span><div class="tiny faint" style="margin-top:3px">${esc(U(l.reimb.by)?.name||'')} · <button class="link tiny" data-act="pxUndo" data-q="${q.id}" data-l="${l.id}">${LT('Undo','Desfazer')}</button></div>`:expByCo(l)?`<span class="pill p-grey nodot">${LT('Paid by the company','Paga pela empresa')}</span>`:`<span class="pill p-amber">${LT('To pay','Por pagar')}</span>`}</td></tr>`).join('')}</tbody></table></div></div>${P_.foot}`}`;}

function mPxPay(){const s=pxSt(),sel=pxRows().filter(r=>s.sel[r.l.id]&&!r.l.reimb&&!expByCo(r.l));if(!sel.length)return;
 state.form={date:TODAY_ISO};
 openModal(LT(`Mark ${sel.length} expense${sel.length===1?'':'s'} as paid`,`Marcar ${sel.length} despesa${sel.length===1?'':'s'} como paga${sel.length===1?'':'s'}`),()=>{const f=F();
  const g=new Map();sel.forEach(r=>{const k=expPayer(r.l)||'—';if(!g.has(k))g.set(k,[]);g.get(k).push(r);});
  return `<div class="stack">${[...g.entries()].map(([u,rs])=>`<div class="sum-row"><span>${esc(u)} <span class="tiny faint">· ${rs.length}</span></span><b>${eur2(sum(rs,r=>expAmount(r.l)))}</b></div>`).join('')}
   <div class="sum-row" style="border-top:2px solid var(--line)"><b>Total</b><b>${eur2(sum(sel,r=>expAmount(r.l)))}</b></div>
   <label class="f">${LT('Paid on','Paga em')}<input type="date" data-f="date" value="${esc(f.date)}" max="${TODAY_ISO}"></label>
   <div class="tiny faint">${LT('Once paid, these expenses can no longer be changed or removed. You can undo it here.','Depois de paga, a despesa já não se altera nem se remove. Pode desfazer aqui.')}</div></div>`;},
 ()=>{const f=F();const date=f.date||TODAY_ISO;sel.forEach(({q,l})=>{l.reimb={date,by:me().id};logQ(q,LT(`Expense paid back to ${expPayer(l)}: ${l.desc} · ${eur2(expAmount(l))}`,`Despesa devolvida a ${expPayer(l)}: ${l.desc} · ${eur2(expAmount(l))}`));});
  if(typeof audit==='function')audit('edit','expenses','',`${sel.length} marked as paid`);
  s.sel={};state.modal=null;toast(LT(`${sel.length} expense${sel.length===1?'':'s'} marked as paid`,`${sel.length} despesa${sel.length===1?'':'s'} marcada${sel.length===1?'':'s'} como paga${sel.length===1?'':'s'}`));},LT('Mark as paid','Marcar como pagas'));}

/* CSV of the list as filtered (all pages) — semicolon, decimal comma, opens straight in Excel in Portugal */
function pxCsv(){const s=pxSt(),rows=pxRows();if(!rows.length)return;
 const n2=v=>(+v||0).toFixed(2).replace('.',','),cell=v=>{const x=String(v??'');return /[;"\n]/.test(x)?'"'+x.replace(/"/g,'""')+'"':x;};
 const head=isPT()?['Data','Pago por','Lançada por','Obra','Cliente','Despesa','Nota','Quantidade','Unidade','Valor','Origem do valor','Recibo','Estado','Paga em','Marcada por']
  :['Date','Paid by','Added by','Job','Customer','Expense','Note','Quantity','Unit','Amount','Amount from','Receipt','Status','Paid on','Marked by'];
 const body=rows.map(({q,l})=>[fmtDate(l.addedAt),expByCo(l)?LT('The company','A empresa'):expPayer(l),U(l.addedBy)?.name||'',q.id,qCust(q),l.desc,l.detail||'',String(l.qty).replace('.',','),lineUnit(l),n2(expAmount(l)),
  l.paid!=null?LT('Receipt','Talão'):LT('Resource price','Preço do recurso'),l.receipt&&fileOf(l.receipt)?LT('Yes','Sim'):LT('No','Não'),
  l.reimb?LT('Paid','Paga'):expByCo(l)?LT('Paid by the company','Paga pela empresa'):LT('To pay','Por pagar'),l.reimb?fmtDate(l.reimb.date):'',l.reimb?(U(l.reimb.by)?.name||''):'']);
 const csv='\ufeff'+[head,...body].map(r=>r.map(cell).join(';')).join('\r\n');
 const who=(s.who?'_'+(s.who==='__co'?'empresa':(V(s.who)?.name||'')).replace(/\s+/g,'-'):'')+(s.from||s.to?'_'+(s.from||'inicio')+'_a_'+(s.to||TODAY_ISO):'');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=`despesas_${{due:'por-pagar',paid:'pagas',all:'todas'}[s.show]}${who}${s.from||s.to?'':'_'+TODAY_ISO}.csv`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);
 if(typeof audit==='function')audit('export','expenses','',rows.length+' rows');toast(LT(`${rows.length} expenses exported`,`${rows.length} despesas exportadas`));}

Object.assign(A,{
 pxShow:t=>{const s=pxSt();s.show=t.dataset.k;s.sel={};render();},
 pxCsv:()=>pxCsv(),
 pxClear:()=>{const s=pxSt();s.sel={};s.last=null;render();},
 pxAll:()=>{const s=pxSt();pxRows().filter(r=>!r.l.reimb&&!expByCo(r.l)).forEach(r=>s.sel[r.l.id]=true);render();},
 pxPay:()=>mPxPay(),
 pxUndo:t=>{const q=QR(t.dataset.q),l=q&&q.lines.find(x=>x.id===t.dataset.l);if(!l||!l.reimb)return;l.reimb=null;logQ(q,LT(`Expense back to “to pay”: ${l.desc}`,`Despesa voltou a “por pagar”: ${l.desc}`));toast(LT('Back to “to pay”','Voltou a “por pagar”'));},
});
Object.assign(PERM_OF,{pxCsv:'expenses.pay',pxAll:'expenses.pay',pxShow:'expenses.pay',pxClear:'expenses.pay',pxPay:'expenses.pay',pxUndo:'expenses.pay'});
/* selection: click = one; Shift + click = everything between the last clicked and this one (same checked state); header = this page */
document.addEventListener('click',e=>{const t=e.target;if(!t.dataset||!t.dataset.px||state.view!=='payexp')return;const s=pxSt(),rows=pxRows().filter(r=>!r.l.reimb&&!expByCo(r.l));
 if(t.dataset.px==='page'){const P_=pg(pxKey(),pxRows());P_.items.filter(r=>!r.l.reimb&&!expByCo(r.l)).forEach(r=>{if(t.checked)s.sel[r.l.id]=true;else delete s.sel[r.l.id];});}
 else{const id=t.dataset.px,on=t.checked;
  if(e.shiftKey&&s.last&&s.last!==id){const i=rows.findIndex(r=>r.l.id===s.last),j=rows.findIndex(r=>r.l.id===id);
   if(i>=0&&j>=0)rows.slice(Math.min(i,j),Math.max(i,j)+1).forEach(r=>{if(on)s.sel[r.l.id]=true;else delete s.sel[r.l.id];});}
  else{if(on)s.sel[id]=true;else delete s.sel[id];}
  s.last=id;}
 render();});
/* Shift + click should not select the text of the table */
document.addEventListener('mousedown',e=>{if(e.shiftKey&&state.view==='payexp'&&e.target.closest&&e.target.closest('.pxtable'))e.preventDefault();});
