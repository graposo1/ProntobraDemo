/* ===== Separador Linhas da obra (D-68, 26-10-2026 — substituiu o formato antigo, que era uma linha por linha com botões) =====
   - Um BLOCO por fornecedor: uma linha de resumo (o quê, quem, quantidade × custo, preço do grupo) e, por baixo,
     "N recursos · custo do grupo · margem" com uma só etiqueta de preço.
   - As sub-linhas (recursos agregados à linha do fornecedor, l.parentLine) ficam FECHADAS por omissão; abertas, uma linha curta cada,
     e "+ Recurso deste fornecedor" no fim.
   - Ações num menu ⋯ em vez de vários botões. Etiquetas só quando há algo a tratar.
   - Recursos soltos e despesas a seguir, no mesmo formato curto. Total (custo · valor · margem) em baixo, a quem vê custos.
   (O nome do ficheiro vem do tempo em que era o separador "Linhas 2", para comparar.) */
I.dots='<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>';
state.lopen=state.lopen||{};state.lmenu=null;

const l2Pill=(c,t)=>`<span class="pill p-${c} nodot">${esc(t)}</span>`;
const l2Item=(act,id,icon,label,danger)=>`<button class="l2mi${danger?' danger':''}" data-act="${act}" data-l="${id}">${ic(icon,15)}<span>${esc(label)}</span></button>`;
function l2Menu(id,items){items=items.filter(Boolean);if(!items.length)return '<div class="l2m"></div>';
 return `<div class="l2m"><button class="iconbtn l2dots${state.lmenu===id?' on':''}" data-act="lmenu" data-l="${id}" aria-label="${esc(LT('Actions','Ações'))}" aria-expanded="${state.lmenu===id}">${ic('dots',18)}</button>${state.lmenu===id?`<div class="l2pop" role="menu">${items.join('')}</div>`:''}</div>`;}
/* the one price tag of a line or group (to whoever sees costs) */
function l2PriceTag(q,l){if(noValue(l))return l2Pill('amber',LT('No client value','Sem valor ao cliente'));
 if(l.pmode==='flat')return l2Pill('grey',LT('Fixed value','Valor fixo'));
 return l2Pill('grey',LT(`Markup ${Math.round((l.pmode==='pct'?+l.markup||0:+q.margin||0)*1000)/10}%`,`Acréscimo ${String(Math.round((l.pmode==='pct'?+l.markup||0:+q.margin||0)*1000)/10).replace('.',',')} %`));}
/* resource price today differs from the line's cost */
const l2Drift=l=>{const r=R(l.ref);return l.kind!=='labor'&&!l.onSite&&r&&price(r)!=null&&l.cost&&l.paid==null&&Math.abs(l.cost-price(r))>0.001;};

/* A vendor line with its sub-lines */
function l2Group(q,l,o){const kids=subLines(q,l),open=!!state.lopen[l.id],who=V(l.ref)||{},uc=lineCost(l);
 const gc=groupCost(q,l),gp=groupPrice(q,l),mg=gp?(gp-gc)/gp:0,up=o.costs?groupCostUp(q,l):0;
 const warn=[];
 if(!l.done&&q.workStart&&q.status!=='aborted'){const i=availInfo(avail(l.ref,q.workStart,q.workEnd,q.id));if(i.c!=='green')warn.push(`<span class="pill p-${i.c}" title="${esc(i.t)}">${esc(i.short)}</span>`);}
 if(who.blocked)warn.push(l2Pill('grey',LT('Blocked vendor','Fornecedor bloqueado')));
 if(q.status==='locked'&&!l.done&&!l.confirmed)warn.push(l2Pill('amber',LT('Not confirmed','Por confirmar')));
 if(l.done)warn.push(`<span class="pill p-green">${esc(LT(`Done by ${vName(l.doneBy,l.doneByName)} · ${fmtDate(l.done)}`,`Feito por ${vName(l.doneBy,l.doneByName)} · ${fmtDate(l.done)}`))}</span>`);
 if(up>0.005)warn.push(l2Pill('amber',LT(`Group cost up ${eur2(up)} since the fixed value`,`Custo do grupo subiu ${eur2(up)} desde o valor fixo`)));
 if(o.costs&&kids.some(k=>!k.cost&&k.ref))warn.push(l2Pill('amber',LT('Resource without price','Recurso sem preço')));
 const phone=l.refPhone??who.phone;
 const menu=l2Menu(l.id,[
  o.edit&&l2Item('addSub',l.id,'plus',LT('Add resource to this vendor','Adicionar recurso a este fornecedor')),
  o.edit&&l2Item('editLine',l.id,'edit',LT('Edit line','Editar linha')),
  q.status==='locked'&&!l.confirmed&&!l.done&&can('work.manage')&&l2Item('confirmV',l.id,'check',LT('Confirm vendor','Confirmar fornecedor')),
  o.edit&&l2Item('rmLine',l.id,'trash',kids.length?LT(`Remove (with ${kids.length} resource${kids.length>1?'s':''})`,`Remover (com ${kids.length} recurso${kids.length>1?'s':''})`):LT('Remove line','Remover linha'),true)]);
 const sumTxt=kids.length?LT(`${kids.length} resource${kids.length>1?'s':''}`,`${kids.length} recurso${kids.length>1?'s':''}`):LT('No resources','Sem recursos');
 return `<div class="l2g${open?' open':''}">
  <div class="l2row">
   <button class="l2tog" data-act="lgrp" data-l="${l.id}" aria-expanded="${open}" aria-label="${esc(open?LT('Close resources','Fechar recursos'):LT('Show resources','Ver recursos'))}">${ic('right',16)}</button>
   <div class="l2main"><div class="ti">${esc(l.desc)}</div><div class="small muted l2who">${esc(lineName(l))}${phone?` · <a href="tel:${esc(phone)}">${esc(phone)}</a>`:''}</div>${l.detail?`<div class="small ldetail">${esc(l.detail)}</div>`:''}</div>
   <div class="l2q">${l.qty} ${esc(lineUnit(l))}${o.costs?` <span class="faint">×</span> ${eur2(uc)}`:''}</div>
   <div class="l2v"><b>${eur(gp)}</b></div>
   ${menu}
  </div>
  <div class="l2meta"><button class="link l2count" data-act="lgrp" data-l="${l.id}">${esc(sumTxt)}</button>${o.costs?`<span>${esc(LT(`cost ${eur(gc)}`,`custo ${eur(gc)}`))}</span><span>${esc(LT(`margin ${pct(mg)}`,`margem ${pct(mg)}`))}</span>${l2PriceTag(q,l)}`:''}${warn.join('')}</div>
  ${open?`<div class="l2kids">${kids.map(k=>l2Kid(q,k,o)).join('')||`<div class="small faint l2empty">${esc(LT('No resources on this vendor yet.','Ainda sem recursos neste fornecedor.'))}</div>`}
   ${o.edit?`<button class="btn sm ghost l2add" data-act="addSub" data-l="${l.id}">${ic('plus',15)} ${esc(LT('Resource for this vendor','Recurso deste fornecedor'))}</button>`:''}</div>`:''}
 </div>`;}

/* A sub-line: only cost (the price is the group's) */
function l2Kid(q,k,o){const uc=lineCost(k),nm=lineName(k),drift=o.costs&&l2Drift(k);
 return `<div class="l2row l2kid">
  <div class="l2main"><span class="ti">${esc(k.desc)}</span>${nm!==k.desc?` <span class="small muted">· ${esc(nm)}</span>`:''}${o.costs&&!k.cost&&k.ref?' '+l2Pill('amber',LT('No price','Sem preço')):''}${drift?' '+l2Pill('grey',LT(`price today ${eur2(price(R(k.ref)))}`,`preço hoje ${eur2(price(R(k.ref)))}`)):''}${k.detail?`<div class="small ldetail">${esc(k.detail)}</div>`:''}</div>
  <div class="l2q">${k.qty} ${esc(lineUnit(k))}${o.costs?` <span class="faint">×</span> ${eur2(uc)}`:''}</div>
  <div class="l2v muted">${o.costs?eur(k.qty*uc):''}</div>
  ${l2Menu(k.id,[o.edit&&l2Item('editLine',k.id,'edit',LT('Edit','Editar')),o.edit&&drift&&l2Item('refreshPrice',k.id,'clock',LT('Use today’s price','Usar o preço de hoje')),o.edit&&l2Item('rmLine',k.id,'trash',LT('Remove','Remover'),true)])}
 </div>`;}

/* A resource line on its own (not under a vendor) */
function l2Res(q,l,o){const uc=lineCost(l),nm=lineName(l),drift=o.costs&&l2Drift(l);
 return `<div class="l2g l2solo"><div class="l2row">
  <div class="l2main"><div class="ti">${esc(l.desc)}</div>${nm!==l.desc?`<div class="small muted">${esc(nm)}</div>`:''}${l.detail?`<div class="small ldetail">${esc(l.detail)}</div>`:''}</div>
  <div class="l2q">${l.qty} ${esc(lineUnit(l))}${o.costs?` <span class="faint">×</span> ${eur2(uc)}`:''}</div>
  <div class="l2v"><b>${eur(linePrice(q,l))}</b></div>
  ${l2Menu(l.id,[o.edit&&l2Item('editLine',l.id,'edit',LT('Edit line','Editar linha')),o.edit&&drift&&l2Item('refreshPrice',l.id,'clock',LT('Use today’s price','Usar o preço de hoje')),o.edit&&l2Item('rmLine',l.id,'trash',LT('Remove line','Remover linha'),true)])}
 </div>${o.costs?`<div class="l2meta"><span>${esc(LT(`cost ${eur(l.qty*uc)}`,`custo ${eur(l.qty*uc)}`))}</span>${l2PriceTag(q,l)}${!l.cost&&l.ref?l2Pill('amber',LT('No price — edit the line','Sem preço — edite a linha')):''}${drift?l2Pill('grey',LT(`price today ${eur2(price(R(l.ref)))}`,`preço hoje ${eur2(price(R(l.ref)))}`)):''}</div>`:''}</div>`;}

/* An expense from the field: internal cost, never in the client price */
function l2Exp(q,l,o){const amt=l.paid!=null?l.paid:l.qty*lineCost(l),by=U(l.addedBy)?.name||'—';
 const tags=[];
 if(l.paid==null&&!l.ref)tags.push(l2Pill('amber',LT('No amount','Sem valor')));
 if(expByCo(l))tags.push(l2Pill('grey',LT('Paid by the company','Paga pela empresa')));
 else if(o.costs||can('expenses.pay'))tags.push(l.reimb?l2Pill('green',LT(`Paid ${fmtDate(l.reimb.date)}`,`Paga ${fmtDate(l.reimb.date)}`)):l2Pill('amber',LT('To pay','Por pagar')));
 if(l.receipt&&fileOf(l.receipt))tags.push(`<button class="pill p-blue nodot" data-act="rcpt" data-id="${l.receipt}" style="border:0;cursor:pointer">${ic('receipt',11)} ${esc(LT('Receipt','Recibo'))}</button>`);
 return `<div class="l2g l2solo"><div class="l2row">
  <div class="l2main"><div class="ti">${esc(l.desc)}</div><div class="small muted">${esc(expByCo(l)?LT(`Company · added by ${by}`,`Empresa · lançada por ${by}`):(U(l.addedBy)?.vendor===l.paidBy?LT(`Paid by ${expPayer(l)}`,`Pago por ${expPayer(l)}`):LT(`Paid by ${expPayer(l)} · added by ${by}`,`Pago por ${expPayer(l)} · lançada por ${by}`)))} · ${fmtDate(l.addedAt)}</div></div>
  <div class="l2q">${l.qty} ${esc(lineUnit(l))}</div>
  <div class="l2v">${o.costs?eur(amt):''}</div>
  ${l2Menu(l.id,[o.exp&&!l.reimb&&l2Item('expEditAny',l.id,'edit',LT('Edit expense','Editar despesa')),o.exp&&!l.reimb&&l2Item('expRmAny',l.id,'trash',LT('Remove','Remover'),true)])}
 </div>${tags.length?`<div class="l2meta">${tags.join('')}</div>`:''}</div>`;}

function tabLines(q){const costs=can('quotes.costs'),edit=can('quotes.edit')&&q.status==='open',lockd=isLocked(q);
 const o={costs,edit,exp:expOnBehalf()&&expCanJob(q)};
 if(!q.lines.length)return `<div class="empty">No lines yet.${edit||o.exp?`<div class="row" style="justify-content:center;margin-top:10px;gap:8px">${edit?`<button class="btn pri sm" data-act="addLine">${ic('plus',16)} Add line</button>`:''}${o.exp?`<button class="btn sm" data-act="expAddHere">${ic('receipt',16)} ${esc(LT('Add expense','Adicionar despesa'))}</button>`:''}</div>`:''}</div>`;
 const labor=q.lines.filter(l=>l.kind==='labor'&&!l.onSite&&!l.parentLine),solo=q.lines.filter(l=>l.kind!=='labor'&&!l.onSite&&!l.parentLine),exp=q.lines.filter(l=>l.onSite);
 const allOpen=labor.length&&labor.every(l=>state.lopen[l.id]);
 const c=calc(q);
 const sec=(k,title,n,body,extra='')=>`<div class="l2sec l2-${k}"><div class="l2h"><h3><span class="l2dot"></span>${esc(title)} <span class="faint">· ${n}</span></h3>${extra}</div>${body}</div>`;
 const pc=(typeof CLAIMS==='function'?CLAIMS():[]).filter(c=>c.q===q.id&&c.status==='pending'); /* expenses waiting for approval (D-72): not in the job yet */
 const pend=pc.length&&(costs||can('expenses.approve'))?`<div class="banner info" style="margin-bottom:12px;font-size:13px">${ic('clock',16)}<div>${esc(LT(`${pc.length} expense${pc.length>1?'s':''} awaiting approval (${eur2(sum(pc,claimAmount))}) — not in the job yet.`,`${pc.length} despesa${pc.length>1?'s':''} por aprovar (${eur2(sum(pc,claimAmount))}) — ainda não ${pc.length>1?'estão':'está'} na obra.`))}${can('expenses.approve')?` <button class="link" data-act="go" data-v="expapprove">${esc(LT('Review','Ver'))}</button>`:''}</div></div>`:'';
 return `${pend}${lockd?`<div class="banner info" style="margin-bottom:12px">${ic('lock',16)}<div>${esc(LT('Confirmed — values are fixed. Vendors can still be confirmed.','Confirmada — os valores estão fixos. Os fornecedores ainda se confirmam.'))}</div></div>`:''}
 ${q.status==='open'&&changedSinceSent(q)?`<div class="banner amber" style="margin-bottom:12px">${ic('alert',16)}<div>${esc(LT(`Lines changed since proposal v${lastSent(q).v} was sent.`,`As linhas mudaram desde que a proposta v${lastSent(q).v} foi enviada.`))}</div></div>`:''}
 ${q.status==='locked'&&can('work.manage')&&labor.some(l=>!l.confirmed&&!l.done)?`<div class="row wrap" style="margin-bottom:12px"><button class="btn sm pri" data-act="confirmAll">${ic('check',15)} Confirm all vendors</button></div>`:''}
 ${labor.length?sec('vend',LT('Vendors','Fornecedores'),labor.length,labor.map(l=>l2Group(q,l,o)).join(''),`<button class="link small" data-act="l2all">${esc(allOpen?LT('Close all','Fechar todos'):LT('Open all','Abrir todos'))}</button>`):''}
 ${solo.length?sec('res',LT('Other resources','Outros recursos'),solo.length,solo.map(l=>l2Res(q,l,o)).join('')):''}
 ${exp.length?sec('exp',LT('Expenses · not in the client price','Despesas · fora do preço ao cliente'),exp.length,exp.map(l=>l2Exp(q,l,o)).join(''),o.exp?`<button class="link small" data-act="expAddHere">${ic('plus',14)} ${esc(LT('Expense','Despesa'))}</button>`:''):''}
 ${costs?`<div class="l2tot"><span>${esc(LT('Cost','Custo'))} <b>${eur(c.cost)}</b></span><span>${esc(LT('Client value','Valor ao cliente'))} <b>${eur(c.prop)}</b></span><span>${esc(LT('Margin','Margem'))} <b>${pct(c.pct)}</b></span></div>`:''}
 ${edit||o.exp?`<div class="row wrap" style="margin-top:14px">${edit?`<button class="btn sm" data-act="addLine">${ic('plus',16)} Add line</button>`:''}${o.exp?`<button class="btn sm" data-act="expAddHere">${ic('receipt',16)} ${esc(LT('Add expense','Adicionar despesa'))}</button>`:''}${edit?`<button class="btn sm ghost" data-act="tab" data-t="vendors">Find available vendors</button>`:''}</div>`:''}`;}

/* Actions */
A.lgrp=t=>{state.lopen[t.dataset.l]=!state.lopen[t.dataset.l];render();};
A.l2all=()=>{const q=QR(state.qid),ls=q.lines.filter(l=>l.kind==='labor'&&!l.onSite&&!l.parentLine),open=!ls.every(l=>state.lopen[l.id]);ls.forEach(l=>state.lopen[l.id]=open);render();};
A.lmenu=t=>{state.lmenu=state.lmenu===t.dataset.l?null:t.dataset.l;render();};
A.addSub=t=>{const q=QR(state.qid);const p=q.lines.find(x=>x.id===t.dataset.l);if(!p)return;state.lopen[p.id]=true;mAddLine(q,{kind:'resource',parent:p.id});};
PERM_OF.addSub='quotes.edit';
/* the ⋯ menu closes on any other click (and on Escape) */
document.addEventListener('click',e=>{if(!state.lmenu)return;const t=e.target.closest('[data-act]');if(t&&t.dataset.act==='lmenu')return;
 state.lmenu=null;if(!t)render();},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.lmenu){state.lmenu=null;render();}});
