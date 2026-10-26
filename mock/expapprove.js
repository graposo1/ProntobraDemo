/* ===== Aprovação de despesas (D-72, 26-10-2026) =====
   Quem lança uma despesa SEM a permissão "expenses.approve" cria um PEDIDO (DB.expClaims, status 'pending'): ainda não está na obra
   nem conta no custo. Quem tem a permissão aprova ou rejeita aqui — uma a uma ou várias de uma vez:
   - Aprovar → o pedido passa a linha da obra (despesa) e fica "Por pagar" (ou "Paga pela empresa"); segue para Pagamentos.
   - Rejeitar → fica rejeitado com o motivo; quem o lançou vê-o em As minhas despesas. Fica fechado (não se corrige nem reenvia:
     lança-se uma nova, se for preciso).
   Quem tem a permissão lança despesas diretamente na obra (sem pedido). Uma obra arquivada não aceita aprovações (só rejeitar).
   Por omissão: Administrador (sempre) e Operações. Na produção: tabela ExpenseClaims (JobLineId preenchido quando aprovada). */

function claimApprove(c){const q=QR(c.q);if(!q||q.archived||c.status!=='pending')return false;
 const line={id:uid('L'),kind:'resource',onSite:true,claim:c.id,ref:c.ref,refName:c.refName,desc:c.desc,detail:c.detail,qty:c.qty,unit:c.unit,cost:c.cost,priceDate:c.priceDate,
  paid:c.paid,addedBy:c.addedBy,addedAt:c.addedAt,paidBy:c.paidBy,paidByName:c.paidByName,...(c.receipt?{receipt:c.receipt}:{})};
 q.lines.push(line);if(c.receipt){const f=fileOf(c.receipt);if(f)f.line=line.id;}
 c.status='approved';c.review={date:TODAY_ISO,by:me().id};c.line=line.id;
 logQ(q,LT(`Expense approved: ${c.desc}${c.detail?' — '+c.detail:''} (added by ${U(c.addedBy)?.name||'—'})`,`Despesa aprovada: ${c.desc}${c.detail?' — '+c.detail:''} (lançada por ${U(c.addedBy)?.name||'—'})`));return true;}
function claimReject(c,reason){if(c.status!=='pending')return;c.status='rejected';c.review={date:TODAY_ISO,by:me().id,reason};}
const claimAmount=c=>c.paid!=null?c.paid:c.qty*(c.cost||0);

function eaSt(){return state.ea||(state.ea={show:'pending',sel:{}});}
function eaRows(){const s=eaSt();
 return CLAIMS().filter(c=>s.show==='all'||c.status===s.show).map(c=>({c,q:QR(c.q)})).filter(x=>x.q)
  .sort((a,b)=>(a.c.createdAt||a.c.addedAt||'').localeCompare(b.c.createdAt||b.c.addedAt||'')*(s.show==='pending'?1:-1));}
const eaPill=c=>c.status==='pending'?`<span class="pill p-blue nodot">${LT('Awaiting approval','Por aprovar')}</span>`
 :c.status==='approved'?`<span class="pill p-green nodot">${LT('Approved','Aprovada')} ${fmtDate(c.review?.date)}</span><div class="tiny faint" style="margin-top:3px">${esc(U(c.review?.by)?.name||'')}</div>`
 :`<span class="pill p-red nodot">${LT('Rejected','Rejeitada')} ${fmtDate(c.review?.date)}</span><div class="tiny" style="margin-top:3px;color:var(--red)">${esc(c.review?.reason||'')}</div><div class="tiny faint">${esc(U(c.review?.by)?.name||'')}</div>`;

function vExpApprove(){const s=eaSt(),rows=eaRows(),pend=CLAIMS().filter(c=>c.status==='pending');
 Object.keys(s.sel).forEach(k=>{if(!rows.some(r=>r.c.id===k&&r.c.status==='pending'))delete s.sel[k];});
 const sel=rows.filter(r=>s.sel[r.c.id]),selOk=sel.filter(r=>!r.q.archived);
 const P_=pg('ea:'+s.show,rows),page=P_.items,pagePend=page.filter(r=>r.c.status==='pending');
 const n=k=>CLAIMS().filter(c=>c.status===k).length;
 return `<div class="page-head"><div class="grow"><h1>${LT('Expense approvals','Aprovação de despesas')}</h1><div class="muted small" style="margin-top:4px">${LT('Expenses added by the team only enter the job once approved. Approved ones then show as “to pay” in Payments.','As despesas lançadas pela equipa só entram na obra depois de aprovadas. Aprovadas, ficam “Por pagar” em Pagamentos.')}</div></div></div>
 <div class="chips" role="tablist" style="margin-bottom:10px">${[['pending',LT('Awaiting approval','Por aprovar'),n('pending')],['approved',LT('Approved','Aprovadas'),n('approved')],['rejected',LT('Rejected','Rejeitadas'),n('rejected')],['all',LT('All','Todas'),CLAIMS().length]].map(([k,l,c])=>`<button class="chip ${s.show===k?'on':''}" data-act="eaShow" data-k="${k}">${l} <span class="faint">${c}</span></button>`).join('')}</div>
 ${!rows.length?`<div class="card"><div class="empty">${s.show==='pending'?LT('Nothing to approve.','Nada para aprovar.'):LT('No expenses here.','Sem despesas aqui.')}</div></div>`:`
 ${(s.show==='pending'||s.show==='all')&&rows.some(r=>r.c.status==='pending')?`<div class="pxbar${sel.length?' on':''}"><div class="grow" style="min-width:0">${sel.length?`<b>${LT(`${sel.length} selected`,`${sel.length} selecionada${sel.length===1?'':'s'}`)} · ${eur2(sum(sel,r=>claimAmount(r.c)))}</b>`
   :`<span class="small muted">${LT(`Select the expenses to approve or reject — ${pend.length} awaiting · ${eur2(sum(pend,claimAmount))}.`,`Selecione as despesas a aprovar ou rejeitar — ${pend.length} por aprovar · ${eur2(sum(pend,claimAmount))}.`)}</span> ${pend.length?`<button class="link small" data-act="eaAll">${LT('Select all','Selecionar todas')}</button>`:''}`}</div>
  ${sel.length?`<button class="btn sm ghost" data-act="eaClear">${LT('Clear','Limpar')}</button>`:''}
  <button class="btn sm" data-act="eaReject" ${sel.length?'':'disabled'}>${ic('x',15)} ${LT('Reject','Rejeitar')}${sel.length?' ('+sel.length+')':''}</button>
  <button class="btn pri" data-act="eaApprove" ${selOk.length?'':'disabled'}>${ic('check',16)} ${LT('Approve','Aprovar')}${selOk.length?' ('+selOk.length+')':''}</button></div>`:''}
 <div class="tcard"><div class="scroll-x" style="margin:0;padding:0"><table class="ltable pxtable"><thead><tr>
  <th style="width:36px">${pagePend.length?`<input type="checkbox" data-ea="page" ${pagePend.every(r=>s.sel[r.c.id])?'checked':''} aria-label="${esc(LT('Select all on this page','Selecionar todas desta página'))}">`:''}</th>
  <th>Date</th><th>${LT('Added by','Lançada por')}</th><th>${LT('Paid by','Pago por')}</th><th>${LT('Job','Obra')}</th><th>${LT('Expense','Despesa')}</th><th class="r">${LT('Amount','Valor')}</th><th>${LT('Status','Estado')}</th><th></th></tr></thead><tbody>
  ${page.map(({c,q})=>`<tr${s.sel[c.id]?' class="sel"':''}><td>${c.status==='pending'?`<input type="checkbox" data-ea="${c.id}" ${s.sel[c.id]?'checked':''} aria-label="Select">`:''}</td>
   <td style="white-space:nowrap">${fmtDate(c.addedAt)}</td><td>${esc(U(c.addedBy)?.name||'—')}</td><td>${expByCo(c)?`<span class="muted">${LT('The company','A empresa')}</span>`:esc(expPayer(c))}</td>
   <td><button class="link" data-act="open" data-id="${q.id}">${esc(qCust(q))}</button><div class="tiny faint mono">${q.id}</div>${q.archived?`<div class="tiny" style="color:var(--amber)">${LT('Archived — can only be rejected','Arquivada — só se pode rejeitar')}</div>`:''}</td>
   <td style="min-width:180px"><div>${esc(c.desc)}</div>${c.detail?`<div class="small muted">${esc(c.detail)}</div>`:''}<div class="tiny faint">${c.qty} ${esc(c.unit||'')}${c.receipt&&fileOf(c.receipt)?` · <button class="link tiny" data-act="rcpt" data-id="${c.receipt}">${ic('doc',11)} ${LT('Receipt','Recibo')}</button>`:` · ${LT('no receipt','sem recibo')}`}</div></td>
   <td class="r" style="white-space:nowrap"><b>${eur2(claimAmount(c))}</b>${c.paid==null?`<div class="tiny faint">${LT('resource price','preço do recurso')}</div>`:''}</td>
   <td>${eaPill(c)}</td>
   <td style="white-space:nowrap">${c.status==='pending'?`<button class="iconbtn" data-act="eaOneReject" data-id="${c.id}" title="${esc(LT('Reject','Rejeitar'))}" aria-label="${esc(LT('Reject','Rejeitar'))}">${ic('x',15)}</button>${q.archived?'':`<button class="iconbtn" data-act="eaOneApprove" data-id="${c.id}" title="${esc(LT('Approve','Aprovar'))}" aria-label="${esc(LT('Approve','Aprovar'))}" style="color:var(--green)">${ic('check',16)}</button>`}`:''}</td></tr>`).join('')}</tbody></table></div></div>${P_.foot}`}`;}

function mEaReject(list){if(!list.length)return;state.form={reason:''};
 openModal(LT(`Reject ${list.length} expense${list.length===1?'':'s'}`,`Rejeitar ${list.length} despesa${list.length===1?'':'s'}`),()=>{const f=F();
  return `<div class="stack">${list.slice(0,6).map(c=>`<div class="sum-row"><span>${esc(c.desc)} <span class="tiny faint">· ${esc(U(c.addedBy)?.name||'—')}</span></span><b>${eur2(claimAmount(c))}</b></div>`).join('')}${list.length>6?`<div class="tiny faint">+${list.length-6}</div>`:''}
   <label class="f">${LT('Reason (seen by whoever added it)','Motivo (quem lançou vai vê-lo)')}<input type="text" data-f="reason" value="${esc(f.reason)}" placeholder="${esc(LT('e.g. Not for this job / no receipt','ex.: Não é desta obra / sem recibo'))}"></label>
   <div class="tiny faint">${LT('A rejected expense is closed: it doesn’t go to the job. If needed, a new one is added.','Uma despesa rejeitada fica fechada: não vai para a obra. Se for preciso, lança-se uma nova.')}</div></div>`;},
 ()=>{const f=F();const r=(f.reason||'').trim();if(!r)return err(LT('Say why it is rejected','Diga porque é rejeitada'));
  list.forEach(c=>claimReject(c,r));eaSt().sel={};state.modal=null;if(typeof audit==='function')audit('edit','expenses','',`${list.length} rejected`);
  toast(LT(`${list.length} rejected`,`${list.length} rejeitada${list.length===1?'':'s'}`));},LT('Reject','Rejeitar'));
 state.modal.danger=true;render();}
function eaApprove(list){let n=0;list.forEach(c=>{if(claimApprove(c))n++;});eaSt().sel={};if(typeof audit==='function')audit('edit','expenses','',`${n} approved`);
 toast(LT(`${n} approved — now in the job, to pay`,`${n} aprovada${n===1?'':'s'} — já na obra, por pagar`));}

Object.assign(A,{
 eaShow:t=>{const s=eaSt();s.show=t.dataset.k;s.sel={};render();},
 eaAll:()=>{const s=eaSt();eaRows().filter(r=>r.c.status==='pending').forEach(r=>s.sel[r.c.id]=true);render();},
 eaClear:()=>{eaSt().sel={};render();},
 eaApprove:()=>{const s=eaSt();eaApprove(eaRows().filter(r=>s.sel[r.c.id]&&r.c.status==='pending'&&!r.q.archived).map(r=>r.c));},
 eaReject:()=>{const s=eaSt();mEaReject(eaRows().filter(r=>s.sel[r.c.id]&&r.c.status==='pending').map(r=>r.c));},
 eaOneApprove:t=>{const c=CLAIMS().find(x=>x.id===t.dataset.id);if(c)eaApprove([c]);},
 eaOneReject:t=>{const c=CLAIMS().find(x=>x.id===t.dataset.id);if(c)mEaReject([c]);},
 /* the person's own: a pending request can be changed or removed; a job line only by someone who approves (until paid) */
 expEdit:t=>{const q=QR(t.dataset.q),c=CLAIMS().find(x=>x.id===t.dataset.l&&x.addedBy===me().id);if(c){if(c.status==='pending'&&expCanJob(q))mExpense(q,c);return;}
  const l=q&&q.lines.find(x=>x.id===t.dataset.l&&x.addedBy===me().id);if(l&&!l.reimb&&expDirect()&&expCanJob(q))mExpense(q,l);},
 expRm:t=>{const q=QR(t.dataset.q),c=CLAIMS().find(x=>x.id===t.dataset.l&&x.addedBy===me().id);if(c){if(c.status==='pending')eaRemoveClaim(c);return;}
  const l=q&&q.lines.find(x=>x.id===t.dataset.l&&x.addedBy===me().id);if(!l||l.reimb||!expDirect()||!expCanJob(q))return;mRemoveLine(q,l,()=>{q.lines.splice(q.lines.indexOf(l),1);logQ(q,`Expense removed by ${me().name}: ${l.desc}`);toast('Line removed');});},
 collabEdit:t=>{A.expEdit({dataset:{q:state.qid,l:t.dataset.l}});},
 collabRm:t=>{A.expRm({dataset:{q:state.qid,l:t.dataset.l}});},
});
function eaRemoveClaim(c){openModal(LT('Remove expense','Remover despesa'),()=>`<div><b>${esc(c.desc)}</b><div class="small muted">${c.qty} ${esc(c.unit||'')} · ${eur2(claimAmount(c))}</div><div class="small muted" style="margin-top:8px">${LT('It was still awaiting approval — it is removed and never goes to the job.','Ainda estava por aprovar — é removida e não chega à obra.')}</div></div>`,
 ()=>{DB.expClaims=CLAIMS().filter(x=>x!==c);if(c.receipt)DB.files=DB.files.filter(x=>x.id!==c.receipt);state.modal=null;toast(LT('Expense removed','Despesa removida'));},LT('Remove','Remover'));state.modal.danger=true;render();}
Object.assign(PERM_OF,{eaShow:'expenses.approve',eaAll:'expenses.approve',eaClear:'expenses.approve',eaApprove:'expenses.approve',eaReject:'expenses.approve',eaOneApprove:'expenses.approve',eaOneReject:'expenses.approve'});
/* checkboxes: one, or the page */
document.addEventListener('click',e=>{const t=e.target;if(!t.dataset||!t.dataset.ea||state.view!=='expapprove')return;const s=eaSt();
 if(t.dataset.ea==='page'){pg('ea:'+s.show,eaRows()).items.filter(r=>r.c.status==='pending').forEach(r=>{if(t.checked)s.sel[r.c.id]=true;else delete s.sel[r.c.id];});}
 else{if(t.checked)s.sel[t.dataset.ea]=true;else delete s.sel[t.dataset.ea];}
 render();});
