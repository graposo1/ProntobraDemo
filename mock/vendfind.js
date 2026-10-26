/* ===== Separador Fornecedores da obra (26-10-2026) — pensado para muitos fornecedores (ex.: 40 000) =====
   Antes: a lista de TODOS os fornecedores, com a disponibilidade calculada para cada um. Com milhares deixa de servir
   (ninguém percorre a lista) e de funcionar (cálculo e ecrã enormes).
   Agora duas partes:
   1. "Nesta obra" — os fornecedores que já estão nas linhas (poucos): sempre visíveis, com disponibilidade e custo.
   2. "Encontrar fornecedor" — pesquisa (nome, telefone, NIF, localidade, especialidade) + filtros já preenchidos a partir da obra:
      "Cumprem os requisitos" (as especialidades da obra), "Só livres nestas datas" (com datas) e "Só colaboradores".
      Resultados 20 de cada vez (páginas no PC, scroll infinito no telemóvel), ordenados por requisitos cumpridos e nome.
      Sem pesquisa nem filtros: não mostra a lista toda — mostra até 10 fornecedores usados mais recentemente ("Pesquise para ver mais").
   Na produção: GET /api/jobs/{id}/vendors?q=&req=&free=&collab=&page= — filtra, ordena e pagina no SQL Server; a disponibilidade
   ("Só livres") é um NOT EXISTS sobre obras confirmadas/propostas e folgas nessas datas; a de cada linha mostrada só para a página. */

const VF_SUGGEST=10;
function vfSt(q){const all=state.vf||(state.vf={});
 return all[q.id]||(all[q.id]={q:'',req:reqsOf(q).length>0,free:!!q.workStart,collab:false});}
const vfIsUser=v=>USERS.some(u=>u.vendor===v.id&&u.active);
const vfOnJob=q=>[...new Set(q.lines.filter(l=>l.kind==='labor'&&!l.onSite).map(l=>l.ref))].map(V).filter(Boolean);

/* one quiet row: name; type · app user · phone · town; cost per unit; specialties; colour only when busy / maybe busy */
function vfRow(q,v,right){const a=avail(v.id,q.workStart,q.workEnd,q.id),i=availInfo(a),warn=a.lvl==='tentative'||a.lvl==='busy',specs=vSpecs(v);
 const meta=[v.type==='person'?'Person':'Company'],usr=vfIsUser(v); /* app user = user icon next to the name (26-10-2026) */
 return `<div class="vrow"><span class="avatar">${initials(v.name)}</span><div style="min-width:0"><b>${esc(v.name)}</b>${usr?` <span class="vuser" title="App user" aria-label="App user">${ic('user',14)}</span>`:''}
   <div class="small muted">${meta.map(t=>`<span>${t}</span>`).join(' · ')}${v.phone?` · <a href="tel:${esc(v.phone)}">${esc(v.phone)}</a>`:''}${v.address?.city?` · ${esc(v.address.city)}`:''}</div>
   ${vRateLine(v)}
   ${specs.length?`<div class="small faint">${esc(specs.join(' · '))}</div>`:''}
   ${warn?`<div class="tagline"><span class="pill p-${i.c}" title="${esc(i.t)}">${esc(i.t)}</span>${a.items.length>1?`<span class="tiny faint">+${a.items.length-1} more</span>`:''}</div>`:''}</div>
   <div>${right||''}</div></div>`;}

/* the search: what the API would do in SQL */
function vfResults(q){const s=vfSt(q),nq=norm(s.q.trim()),reqs=reqsOf(q),on=new Set(vfOnJob(q).map(v=>v.id));
 const narrowed=!!nq||(s.req&&reqs.length)||s.collab||(s.free&&q.workStart);
 let c=VENDORS.filter(v=>!v.blocked&&!on.has(v.id));
 if(!narrowed){/* nothing to search with: a few suggestions, never the whole list */
  const last=new Map();QUOTES.forEach(x=>x.lines.forEach(l=>{if(l.kind==='labor'){const d=x.workStart||x.created||'';if(!last.has(l.ref)||last.get(l.ref)<d)last.set(l.ref,d);}}));
  const rec=c.filter(v=>last.has(v.id)).sort((a,b)=>last.get(b.id).localeCompare(last.get(a.id))||a.name.localeCompare(b.name));
  return {mode:'suggest',list:(rec.length?rec:c.slice().sort((a,b)=>a.name.localeCompare(b.name))).slice(0,VF_SUGGEST),total:c.length};}
 if(nq)c=c.filter(v=>norm([v.name,v.phone,v.nif,v.no,v.address?.city,vSpecs(v).join(' ')].join(' ')).includes(nq));
 const fit=new Map(c.map(v=>[v.id,vendorFit(q,v)]));
 if(s.req&&reqs.length)c=c.filter(v=>fit.get(v.id).match);
 if(s.collab)c=c.filter(vfIsUser);
 if(s.free&&q.workStart)c=c.filter(v=>avail(v.id,q.workStart,q.workEnd,q.id).lvl==='ok');
 c.sort((a,b)=>fit.get(b.id).score-fit.get(a.id).score||a.name.localeCompare(b.name));
 return {mode:'search',list:c,total:c.length};}

function vfList(q){const s=vfSt(q),edit=can('quotes.edit')&&q.status==='open',r=vfResults(q);
 const add=v=>edit?`<button class="btn sm" data-act="addVendor" data-v="${v.id}" data-t="${esc(lineDescFor(q,v))}">${ic('plus',14)} Add</button>`:'';
 if(r.mode==='suggest')return `${r.list.length?`<div class="tiny faint" style="margin:6px 0 2px">${esc(LT('Used recently','Usados recentemente'))}</div>${r.list.map(v=>vfRow(q,v,add(v))).join('')}`:''}
  <div class="small muted" style="padding:10px 0">${esc(LT(`Search by name, phone or specialty to see the other ${r.total} vendors.`,`Pesquise por nome, telefone ou especialidade para ver os outros ${r.total} fornecedores.`))}</div>`;
 if(!r.list.length)return `<div class="small muted" style="padding:12px 0">${esc(LT('No vendor matches. Try another search or turn a filter off.','Nenhum fornecedor encontrado. Experimente outra pesquisa ou desligue um filtro.'))}</div>`;
 const P_=pg('vf:'+q.id+':'+JSON.stringify(s),r.list);
 return `<div class="tiny faint" style="margin:6px 0 2px">${esc(LT(`${r.total} found`,`${r.total} encontrado${r.total===1?'':'s'}`))}</div>${P_.items.map(v=>vfRow(q,v,add(v))).join('')}${P_.foot}`;}

function tabVendors(q){const s=vfSt(q),reqs=reqsOf(q),on=vfOnJob(q);
 const chip=(k,label,ok=true)=>ok?`<button class="chip ${s[k]?'on':''}" data-act="vfSet" data-k="${k}" aria-pressed="${!!s[k]}">${s[k]?ic('check',13)+' ':''}${esc(label)}</button>`:'';
 const reqTxt=reqs.map(r=>r.vals.map(x=>dimValName(r.d.code,x)).join(', ')).join(' · ');
 return `<div class="small muted" style="margin-bottom:6px">${q.workStart?`Availability for <b style="color:var(--ink)">${fmtRange(q.workStart,q.workEnd)}</b> — checked against locked work, open proposals and time off.`:`<span style="color:var(--amber)">No work dates yet</span> — set dates to see who’s free.`}
  ${can('quotes.edit')&&['open','locked'].includes(q.status)?` <button class="link" data-act="dates">${q.workStart?'Change dates':'Set dates'}</button>`:''}</div>
 <h3 style="margin-top:14px">${esc(LT('On this job','Nesta obra'))} <span class="faint">· ${on.length}</span></h3>
 ${on.length?on.map(v=>vfRow(q,v,'')).join(''):`<div class="small faint" style="padding:6px 0 4px">${esc(LT('No vendor on this job yet.','Ainda nenhum fornecedor nesta obra.'))}</div>`}
 <h3 style="margin-top:20px">${esc(LT('Find a vendor','Encontrar fornecedor'))}</h3>
 ${!VENDORS.length?'<div class="empty">No vendors yet.</div>':`
 <div class="vfbar"><input type="search" data-inp="vq" value="${esc(s.q)}" placeholder="${esc(LT('Name, phone, NIF, town or specialty…','Nome, telefone, NIF, localidade ou especialidade…'))}" aria-label="${esc(LT('Search vendors','Pesquisar fornecedores'))}">
  <div class="chips vfchips">${chip('req',LT(`Meets the requirements${reqTxt?': '+reqTxt:''}`,`Cumprem os requisitos${reqTxt?': '+reqTxt:''}`),reqs.length>0)}${chip('free',LT('Free on these dates','Só livres nestas datas'),!!q.workStart)}${chip('collab',LT('Collaborators only','Só colaboradores'))}</div></div>
 <div id="vlist">${vfList(q)}</div>`}`;}

/* actions and search box: typing only redraws the results, so the box keeps the focus */
Object.assign(A,{vfSet:t=>{const s=vfSt(QR(state.qid));s[t.dataset.k]=!s[t.dataset.k];render();}});
document.addEventListener('input',e=>{const t=e.target;if(t.dataset.inp!=='vq'||state.view!=='quote')return;const q=QR(state.qid);if(!q)return;
 vfSt(q).q=t.value;const el=document.getElementById('vlist');if(el){el.innerHTML=vfList(q);watchMore();}});
