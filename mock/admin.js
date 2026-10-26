/* ===== Sign-in, users & roles, profile ===== */

/* Sign in — mock: checks email + password against users in the data file */
function vLogin(){const e=state.loginEmail||'';
 return `<div class="login"><div class="lcard">
  <div class="brand" style="margin-bottom:22px"><div class="logo">R</div><span>Raposo Solutions</span></div>
  <h1>Sign in</h1><div class="muted small" style="margin-top:4px">Quotes and work, from request to done.</div>
  <div class="stack" style="margin-top:20px">
   <label class="f">Email<input type="email" id="li-email" autocomplete="username" value="${esc(e)}" placeholder="name@company.pt"></label>
   <label class="f">Password<input type="password" id="li-pass" autocomplete="current-password" placeholder="••••••••"></label>
   ${state.loginErr?`<div class="banner red" style="font-size:13px">${ic('alert',16)}<div>${esc(state.loginErr)}</div></div>`:''}
   <button class="btn pri" style="width:100%;min-height:44px" data-act="signIn">Sign in</button><button class="btn sm" style="align-self:center" data-act="lang">Language · ${isPT()?'English':'Português'}</button></div>
  <div class="ltest"><div class="k" style="margin:0 0 8px">For testing</div>
   <button class="btn" style="width:100%" data-act="signInAdmin">${ic('shield',16)} Sign in as Administrator</button>
   <button class="btn" style="width:100%;margin-top:8px" data-act="signInCollab">${ic('user',16)} Sign in as Collaborator</button>
   <div class="tiny faint" style="margin-top:8px">Test account: <span class="mono">admin@foxbillions.pt</span> · password <span class="mono">admin</span>. Collaborators: password <span class="mono">colab</span>.</div></div>
 </div>
 <div class="row" style="justify-content:center;margin-top:14px;gap:10px"><button class="btn sm ghost" data-act="theme">${ic(isDark()?'sun':'moon',15)} ${isDark()?'Light':'Dark'} mode</button></div></div>`;}
function startSession(u){state.user=u.id;state.viewAs=null;state.view='home';state.loginErr='';state.loginEmail='';u.lastLogin=new Date().toISOString();lsSet(SESSION_KEY,u.id);render();window.scrollTo(0,0);}
function signIn(){const email=(document.getElementById('li-email')?.value||'').trim().toLowerCase(),pass=document.getElementById('li-pass')?.value||'';
 state.loginEmail=email;const u=USERS.find(x=>(x.email||'').toLowerCase()===email);
 if(!email||!pass)state.loginErr='Enter your email and password.';
 else if(!u||u.password!==pass)state.loginErr='Email or password not recognised.';
 else if(!u.active)state.loginErr='This account is inactive. Ask an administrator.';
 else return startSession(u);
 render();document.getElementById(state.loginErr.startsWith('Enter')&&!email?'li-email':'li-pass')?.focus();}
function signInAdmin(){const u=USERS.find(x=>x.active&&x.roles.includes(ADMIN_ROLE));if(u)startSession(u);}
/* test shortcut: first active user whose only role is Collaborator (falls back to any active user with that role) */
function signInCollab(){const u=USERS.find(x=>x.active&&x.roles.length===1&&x.roles[0]==='collab')||USERS.find(x=>x.active&&x.roles.includes('collab'));
 if(u)return startSession(u);state.loginErr='No active collaborator yet. Sign in as Administrator and add one in Users & roles.';render();}
function signOut(silent){if(state.nav)state.nav={stack:[],id:null,snap:null};state.user=null;state.viewAs=null;state.menu=false;state.modal=null;state.combo=null;lsSet(SESSION_KEY,null);if(!silent)render();}


/* Users & roles screen */
const activeAdmins=()=>USERS.filter(u=>u.active&&u.roles.includes(ADMIN_ROLE));
const fmtWhen=s=>{if(!s)return 'Never';const d=new Date(s),p=n=>String(n).padStart(2,'0');return `${p(d.getDate())}-${p(d.getMonth()+1)}-${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;};
const rolePills=u=>u.roles.length?u.roles.map(r=>RL(r)).filter(Boolean).map(r=>`<span class="pill ${r.id===ADMIN_ROLE?'p-accent':'p-grey'} nodot">${esc(r.name)}</span>`).join(''):'<span class="pill p-amber nodot">No role</span>';
function vUsers(){const t=state.userTab||'users';
 return `<div class="page-head"><div class="grow"><h1>Users & roles</h1><div class="muted small" style="margin-top:4px">Who can sign in, and what each role can do. A person can have more than one role — they get all of its permissions.</div></div>
  ${t==='users'?`<button class="btn pri" data-act="editUser">${ic('plus',18)} New user</button>`:`<button class="btn pri" data-act="editRole">${ic('plus',18)} New role</button>`}</div>
  <div class="seg" style="margin-bottom:14px">${[['users',`Users · ${USERS.length}`],['roles',`Roles · ${ROLES.length}`]].map(([k,l])=>`<button class="${t===k?'on':''}" data-act="userTab" data-t="${k}">${l}</button>`).join('')}</div>
  ${t==='users'?usersList():rolesList()}`;}
function usersList(){const us=USERS.slice().sort((a,b)=>(b.active-a.active)||a.name.localeCompare(b.name));
 const st=u=>u.active?'<span class="pill p-green">Active</span>':'<span class="pill p-grey">Inactive</span>';
 const you=u=>u.id===state.user?' <span class="tiny faint">(you)</span>':'';
 const acts=u=>`<button class="btn sm" data-act="editUser" data-id="${u.id}">${ic('edit',15)} Edit</button>`;
 return `<div class="mlist only-m">${us.map(u=>`<div class="mcard" style="cursor:default"><div class="row between"><div class="row" style="min-width:0"><span class="avatar">${initials(u.name)}</span><div style="min-width:0"><b>${esc(u.name)}</b>${you(u)}<div class="tiny faint ell">${esc(u.email)}</div></div></div>${st(u)}</div>
   <div class="tagline" style="margin-top:8px">${rolePills(u)}</div><div class="row between" style="margin-top:10px"><span class="tiny faint">Last sign-in ${fmtWhen(u.lastLogin)}</span><span class="row">${acts(u)}</span></div></div>`).join('')}</div>
  <div class="tcard only-d"><table class="ltable"><thead><tr><th>Person</th><th>Email</th><th>Roles</th><th>Status</th><th>Last sign-in</th><th></th></tr></thead><tbody>
   ${us.map(u=>`<tr><td><div class="row"><span class="avatar">${initials(u.name)}</span><span class="t">${esc(u.name)}</span>${you(u)}</div></td><td class="small">${esc(u.email)}</td><td><div class="tagline" style="margin:0">${rolePills(u)}</div></td><td>${st(u)}</td><td class="small muted">${fmtWhen(u.lastLogin)}</td><td class="r"><div class="row" style="justify-content:flex-end">${acts(u)}</div></td></tr>`).join('')}
  </tbody></table></div>`;}
function rolesList(){const n=r=>USERS.filter(u=>u.roles.includes(r.id)).length;
 return `<div class="role-grid">${ROLES.map(r=>`<div class="card"><div class="row between"><div class="row"><b style="font-size:16px">${esc(r.name)}</b>${r.system?'<span class="pill p-accent nodot">System</span>':''}</div><button class="btn sm" data-act="editRole" data-id="${r.id}">${ic('edit',15)} ${r.system?'View':'Edit'}</button></div>
   <div class="small muted" style="margin-top:4px">${esc(r.description||'')||'<span class="faint">No description</span>'}</div>
   <div class="tiny faint" style="margin-top:10px">${n(r)} user${n(r)===1?'':'s'} · ${r.perms.length} of ${ALL_PERMS.length} permissions</div>
   <div class="tagline" style="margin-top:8px">${r.system?'<span class="pill p-grey nodot">Everything</span>':r.perms.length?PERM_DEFS.filter(([k])=>r.perms.includes(k)).map(([,l])=>`<span class="pill p-grey nodot">${esc(l.split(' · ')[0])}</span>`).join(''):'<span class="pill p-amber nodot">No permissions</span>'}</div></div>`).join('')}</div>
  <div class="card" style="margin-top:16px"><h3>Permissions by role</h3><div class="small muted" style="margin:4px 0 8px">Tick to grant — changes apply straight away. The Administrator role always has everything.</div>
   <div class="scroll-x"><table class="tbl perm-tbl"><thead><tr><th>Permission</th>${ROLES.map(r=>`<th class="c">${esc(r.name)}</th>`).join('')}</tr></thead><tbody>
    ${PERM_GROUPS.map(([g,ps])=>`<tr class="pg"><td colspan="${ROLES.length+1}">${esc(g)}</td></tr>`+ps.map(([k,l])=>`<tr><td>${esc(l)}</td>${ROLES.map(r=>`<td class="c"><input type="checkbox" data-chg="perm" data-p="${k}" data-r="${r.id}" ${r.perms.includes(k)?'checked':''} ${r.system?'disabled':''} aria-label="${esc(l)} – ${esc(r.name)}"></td>`).join('')}</tr>`).join('')).join('')}
   </tbody></table></div></div>`;}

function mUser(id){const u=id?U(id):null;
 state.form={name:u?.name||'',email:u?.email||'',password:'',roles:u?[...u.roles]:[],active:u?u.active:true,vendor:u?.vendor||''};
 const used=id&&JSON.stringify(DB.quotes).includes(`"${id}"`);
 openModal(u?u.name:'New user',()=>{const f=F();return `<div class="stack">
  <label class="f">Full name<input type="text" data-f="name" value="${esc(f.name)}" placeholder="e.g. Maria Santos"></label>
  <label class="f">Email (used to sign in)<input type="email" data-f="email" value="${esc(f.email)}" placeholder="name@company.pt"></label>
  <label class="f">${u?'New password <span class="faint">(leave empty to keep)</span>':'Password'}<input type="text" data-f="password" value="${esc(f.password)}" autocomplete="new-password" placeholder="${u?'••••••••':'At least 4 characters'}"></label>
  <div><span class="flabel">Roles</span>${combo('us-roles',{opts:ROLES.map(r=>({v:r.id,l:r.name,sub:r.description})),value:f.roles,multi:true,placeholder:'Pick one or more roles…',title:'Roles',onPick:v=>{f.roles=v;}})}
   <div class="tiny faint" style="margin-top:4px">With more than one role, the person gets all their permissions combined.</div></div>
  <div><span class="flabel">Linked vendor <span class="faint" style="font-weight:400">(optional)</span></span>${combo('us-vendor',{opts:[{v:'',l:'— none —'},...VENDORS.filter(v=>!v.blocked||v.id===f.vendor).map(v=>({v:v.id,l:v.name,sub:v.no}))],value:f.vendor,title:'Linked vendor',onPick:v=>{f.vendor=v;}})}
   <div class="tiny faint" style="margin-top:4px">For collaborators: they only see the jobs this vendor works on. Without a link they see every job in progress.</div></div>
  <label class="check"><input type="checkbox" data-f="active" ${f.active?'checked':''} ${id===state.user?'disabled':''}> Active — can sign in${id===state.user?' <span class="faint">(you can’t deactivate yourself)</span>':''}</label>
  ${u?`<div class="tiny faint">Last sign-in ${fmtWhen(u.lastLogin)}</div>`:''}</div>`;},
 ()=>{const f=F();const name=f.name.trim(),email=f.email.trim().toLowerCase();
  if(!name)return err('Add the name');if(!/^\S+@\S+\.\S+$/.test(email))return err('Enter a valid email');
  if(USERS.some(x=>x!==u&&(x.email||'').toLowerCase()===email))return err('Another user already has this email');
  if(!u&&f.password.length<4)return err('Password needs at least 4 characters');if(u&&f.password&&f.password.length<4)return err('Password needs at least 4 characters');
  if(!f.roles.length)return err('Give the user at least one role');
  const o=u||{id:uid('u'),lastLogin:null};const before={roles:o.roles,active:o.active};
  Object.assign(o,{name,email,roles:[...f.roles],active:id===state.user?true:!!f.active,vendor:f.vendor||null});if(f.password)o.password=f.password;
  if(!u)USERS.push(o);
  if(!activeAdmins().length){Object.assign(o,before);return err('At least one active Administrator is needed');}
  if(state.viewAs===o.id&&!o.active)state.viewAs=null;
  state.modal=null;toast(u?'User saved':`${name} added — they can sign in now`);},u?'Save':'Add user');
 if(u&&id!==state.user&&!used)state.modal.extra=`<button class="btn ghost danger" style="margin-right:auto" data-act="delUser" data-id="${id}">${ic('trash',15)} Delete</button>`;
 else if(u&&used&&id!==state.user)state.modal.extra=`<span class="tiny faint" style="margin-right:auto;align-self:center">Has quote history — deactivate instead of deleting</span>`;
 render();}
function delUser(id){const u=U(id);if(!u||id===state.user)return;
 const rest=USERS.filter(x=>x!==u);if(!rest.some(x=>x.active&&x.roles.includes(ADMIN_ROLE)))return toast('At least one active Administrator is needed');
 USERS.splice(USERS.indexOf(u),1);if(state.viewAs===id)state.viewAs=null;state.modal=null;toast(`${u.name} deleted`);}

function mRole(id){const r=id?RL(id):null;
 state.form={name:r?.name||'',description:r?.description||'',perms:r?[...r.perms]:['quotes.viewPipeline'],mobile:r?[...(r.mobile||[])]:DEFAULT_MOBILE._.slice()};
 openModal(r?r.name:'New role',()=>{const f=F();const sys=r?.system;const n=r?USERS.filter(u=>u.roles.includes(r.id)).length:0;
  return `<div class="stack">
  ${sys?`<div class="banner info" style="font-size:13px">${ic('lock',16)}<div>The Administrator role is built in and always has every permission, so the app can never be locked out.</div></div>`:''}
  <label class="f">Role name<input type="text" data-f="name" value="${esc(f.name)}" placeholder="e.g. Site supervisor" ${sys?'disabled':''}></label>
  <label class="f">Description<input type="text" data-f="description" value="${esc(f.description)}" placeholder="What this role is for" ${sys?'disabled':''}></label>
  <div><span class="flabel">Permissions</span>${PERM_GROUPS.map(([g,ps])=>`<div class="pgroup"><div class="k">${esc(g)}</div>${ps.map(([k,l])=>`<label class="check"><input type="checkbox" data-chg="rperm" data-p="${k}" ${f.perms.includes(k)||sys?'checked':''} ${sys?'disabled':''}> ${esc(l)}</label>`).join('')}</div>`).join('')}
   <div class="tiny faint" style="margin-top:6px">Everyone always sees the quotes they own.</div></div>
  <div><span class="flabel">${LT(`Phone bar buttons (up to ${MOBILE_MAX})`,`Botões da barra no telemóvel (até ${MOBILE_MAX})`)}</span>
   <div class="tiny faint" style="margin-bottom:6px">${LT('What people with this role use most on site. The other pages they can open are under “More”. With several roles, the buttons are joined in order.','O que quem tem esta função mais usa no terreno. As outras páginas a que tem acesso ficam em “Mais”. Com várias funções, os botões juntam-se por ordem.')}</div>
   <div class="mobpick">${NAV.map(([k,l,i])=>{const on=f.mobile.includes(k),n=f.mobile.indexOf(k)+1;return `<label class="mobchk ${on?'on':''}"><input type="checkbox" data-chg="rmob" data-p="${k}" ${on?'checked':''}>${ic(i,18)}<span>${l}</span>${on?`<b class="mobn">${n}</b>`:''}</label>`;}).join('')}</div>
   <div class="mobprev">${f.mobile.map(k=>{const x=NAV.find(y=>y[0]===k);return x?`<span>${ic(x[2],18)}<i>${x[1]}</i></span>`:'';}).join('')}<span>${ic('more',18)}<i>More</i></span></div></div>
  ${r?`<div class="tiny faint">${n} user${n===1?'':'s'} with this role.</div>`:''}</div>`;},
 r?.system?()=>{r.mobile=[...F().mobile];state.modal=null;toast('Role saved');}:()=>{const f=F();const name=f.name.trim();if(!name)return err('Add the role name');
  if(ROLES.some(x=>x!==r&&norm(x.name)===norm(name)))return err('A role with this name already exists');
  if(r)Object.assign(r,{name,description:f.description.trim(),perms:ALL_PERMS.filter(p=>f.perms.includes(p)),mobile:[...f.mobile]});
  else ROLES.push({id:norm(name).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,24)+'-'+Math.random().toString(36).slice(2,5),name,description:f.description.trim(),perms:ALL_PERMS.filter(p=>f.perms.includes(p)),mobile:[...f.mobile]});
  state.modal=null;toast(r?'Role saved':`Role “${name}” added — assign it to users`);},r?'Save':'Add role');
 if(r&&!r.system)state.modal.extra=`<button class="btn ghost danger" style="margin-right:auto" data-act="delRole" data-id="${id}">${ic('trash',15)} Delete</button>`;
 render();}
function delRole(id){const r=RL(id);if(!r||r.system)return;const n=USERS.filter(u=>u.roles.includes(id)).length;
 if(n)return toast(`${n} user${n>1?'s have':' has'} this role — change ${n>1?'their':'their'} roles first`);
 ROLES.splice(ROLES.indexOf(r),1);state.modal=null;toast(`Role “${r.name}” deleted`);}

/* My profile — the signed-in person (not the "view as" user) */
function vProfile(){const u=realMe(),p=state.prof||(state.prof={name:u.name,email:u.email,cur:'',n1:'',n2:''});
 const th=document.documentElement.dataset.theme||'system';
 return `<div class="page-head"><div class="grow"><h1>My profile</h1><div class="muted small" style="margin-top:4px">Your account and preferences.</div></div>
  <button class="btn" data-act="signOut">${ic('logout',16)} Sign out</button></div>
 ${formErrHtml()}
 <div class="home-grid" style="margin-top:0"><div class="stack">
  <div class="card"><div class="row" style="gap:14px;margin-bottom:14px"><span class="avatar" style="width:52px;height:52px;font-size:18px">${initials(u.name)}</span><div><b style="font-size:17px">${esc(u.name)}</b><div class="small muted">${esc(u.email)}</div></div></div>
   <div class="stack"><label class="f">Full name<input type="text" data-pf="name" value="${esc(p.name)}"></label>
   <label class="f">Email (used to sign in)<input type="email" data-pf="email" value="${esc(p.email)}"></label>
   <div><button class="btn pri sm" data-act="saveProfile">Save details</button></div></div></div>
  <div class="card"><h3>Change password</h3><div class="stack" style="margin-top:10px">
   <label class="f">Current password<input type="password" data-pf="cur" value="${esc(p.cur)}" autocomplete="current-password"></label>
   <div class="grid2"><label class="f">New password<input type="password" data-pf="n1" value="${esc(p.n1)}" autocomplete="new-password"></label><label class="f">Repeat new password<input type="password" data-pf="n2" value="${esc(p.n2)}" autocomplete="new-password"></label></div>
   <div><button class="btn sm" data-act="savePassword">Change password</button></div></div></div>
 </div><div class="stack">
  <div class="card"><h3>Roles</h3><div class="tagline" style="margin-top:10px">${rolePills(u)}</div>
   <div class="small muted" style="margin-top:8px">${esc(scopeNoteFor(u))} ${canReal('users.manage')?'':'Roles are set by an administrator.'}</div></div>
  <div class="card"><h3>Appearance</h3><div class="seg" style="margin-top:10px">${[['system','Device'],['light','Light'],['dark','Dark']].map(([k,l])=>`<button class="${th===k?'on':''}" data-act="themeSet" data-v="${k}">${l}</button>`).join('')}</div>
   <div class="tiny faint" style="margin-top:8px">“Device” follows your phone or computer setting.</div></div>
  <div class="card"><h3>Session</h3><div class="small muted" style="margin-top:6px">Signed in on this device · last sign-in ${fmtWhen(u.lastLogin)}</div></div>
 </div></div>`;}
function scopeNoteFor(u){const save=state.viewAs;state.viewAs=u.id===state.user?null:u.id;const n=scopeNote();state.viewAs=save;return n;}
function saveProfile(){const u=realMe(),p=state.prof;const name=p.name.trim(),email=p.email.trim().toLowerCase();
 if(!name)return err('Add your name');if(!/^\S+@\S+\.\S+$/.test(email))return err('Enter a valid email');
 if(USERS.some(x=>x!==u&&(x.email||'').toLowerCase()===email))return err('Another user already has this email');
 u.name=name;u.email=email;state.prof=null;toast('Details saved');}
function savePassword(){const u=realMe(),p=state.prof;
 if(p.cur!==u.password)return err('Current password is not right');if(p.n1.length<4)return err('New password needs at least 4 characters');if(p.n1!==p.n2)return err('The new passwords don’t match');
 u.password=p.n1;Object.assign(p,{cur:'',n1:'',n2:''});toast('Password changed');}
