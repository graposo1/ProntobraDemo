/* ===== Attachments on a job (quote) =====
   Any file (plans, photos, the client's documents, PDFs…) kept in DB.files with kind 'attachment' and quote = job id.
   The Attachments tab also lists the job's receipt photos (expenses) and proposal PDFs, read-only.
   Mock: files live as base64 in the browser's storage (a few MB in total) — photos are reduced to 1600 px, other files up to 2 MB each.
   In production they go to file storage. Adding/removing: quotes.edit or work.manage, until the job is archived. Collaborators see them read-only. */
const ATT_MAX=2*1024*1024;
const qFiles=q=>(DB.files||[]).filter(f=>f.kind==='attachment'&&f.quote===q.id).sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));
const canAttach=q=>(can('quotes.edit')||can('work.manage'))&&!q.archived;
const fSize=n=>n>=1048576?(n/1048576).toLocaleString(LOC(),{maximumFractionDigits:1})+' MB':Math.max(1,Math.round(n/1024))+' KB';
const isImg=f=>/^image\/(jpeg|png|webp|gif)$/.test(f.mime||'');
const fSrc=f=>'data:'+f.mime+';base64,'+f.base64;
const fIcon=f=>isImg(f)?`<img class="attthumb" src="${fSrc(f)}" alt="">`:`<span class="atticon">${ic('doc',20)}<b>${esc((String(f.name).split('.').pop()||'').slice(0,4).toUpperCase())}</b></span>`;

function attRow(f,o={}){const u=U(f.createdBy);
 return `<div class="attrow">${fIcon(f)}<div class="grow" style="min-width:0"><button class="link ell" style="display:block;max-width:100%;text-align:left" data-act="attOpen" data-id="${f.id}">${esc(f.name)}</button>
  <div class="tiny faint">${fSize(f.size||0)} · ${fmtDate((f.createdAt||'').slice(0,10))}${u?' · '+esc(u.name):''}${o.note?' · '+esc(o.note):''}</div></div>
  <div class="row" style="gap:6px;flex-wrap:nowrap"><button class="iconbtn" style="width:34px;height:34px" data-act="attDl" data-id="${f.id}" title="Download" aria-label="Download">${ic('download',16)}</button>
  ${o.rm?`<button class="iconbtn" style="width:34px;height:34px" data-act="attRm" data-id="${f.id}" title="Remove" aria-label="Remove">${ic('trash',15)}</button>`:''}</div></div>`;}

function tabFiles(q){const fs=qFiles(q),ed=canAttach(q);
 const rc=(DB.files||[]).filter(f=>f.kind==='receipt'&&f.quote===q.id),pd=q.versions.map(v=>v.pdf&&fileOf(v.pdf)).filter(Boolean);
 return `<div class="row between wrap" style="gap:8px"><div><h3>Attachments</h3><div class="tiny faint" style="margin-top:2px">Plans, photos, documents from the client — anything that belongs to this job.</div></div>
  ${ed?`<label class="btn sm pri" style="cursor:pointer">${ic('upload',15)} Add files<input type="file" multiple data-chg="attAdd" hidden></label>`:''}</div>
 <div style="margin-top:10px">${fs.length?fs.map(f=>attRow(f,{rm:ed})).join(''):`<div class="empty" style="padding:24px 10px">No attachments yet.${ed?'<div class="tiny faint" style="margin-top:6px">Photos are reduced to 1600 px; other files up to 2 MB each.</div>':''}</div>`}</div>
 ${rc.length?`<h3 style="margin-top:18px">Expense receipts · ${rc.length}</h3><div class="tiny faint">From the expenses on the Lines tab.</div><div style="margin-top:6px">${rc.map(f=>attRow(f)).join('')}</div>`:''}
 ${pd.length?`<h3 style="margin-top:18px">Proposals sent · ${pd.length}</h3><div style="margin-top:6px">${pd.map(f=>attRow(f,{note:'v'+f.version})).join('')}</div>`:''}`;}

/* collaborator view: the job's attachments, read-only */
function collabFiles(q){const fs=qFiles(q);if(!fs.length)return '';
 return `<div class="card"><h3>Attachments · ${fs.length}</h3><div style="margin-top:6px">${fs.map(f=>attRow(f)).join('')}</div></div>`;}

function attViewer(f){
 if(isImg(f)){openModal(f.name,()=>`<div class="rcptview"><img src="${fSrc(f)}" alt=""></div><div class="row" style="margin-top:10px;gap:8px"><button class="btn sm" data-act="attDl" data-id="${f.id}">${ic('download',14)} Download</button><span class="tiny faint">${fSize(f.size||0)}</span></div>`,null);return;}
 openPdf(f,!/^(application\/pdf|text\/plain)$/.test(f.mime||''));}

/* read one file: photos reduced (JPEG), the rest kept as they are */
function readAttachment(file,done){
 if(/^image\/(jpeg|png|webp)$/.test(file.type)){const rd=new FileReader();rd.onload=()=>{const img=new Image();img.onload=()=>{const k=Math.min(1,1600/Math.max(img.width,img.height));
   const c=document.createElement('canvas');c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);c.getContext('2d').drawImage(img,0,0,c.width,c.height);
   const url=c.toDataURL('image/jpeg',.8);done({name:file.name.replace(/\.(png|webp|jpe?g)$/i,'')+'.jpg',mime:'image/jpeg',b64:url.split(',')[1]});};img.onerror=()=>done(null,'not an image');img.src=rd.result;};rd.readAsDataURL(file);return;}
 if(file.size>ATT_MAX)return done(null,'too big');
 const rd=new FileReader();rd.onload=()=>done({name:file.name,mime:file.type||'application/octet-stream',b64:String(rd.result).split(',')[1]||''});rd.onerror=()=>done(null,'unreadable');rd.readAsDataURL(file);}

function addAttachments(q,files){const list=[...files];if(!list.length)return;let left=list.length;const added=[],bad=[];
 list.forEach(file=>readAttachment(file,(r,why)=>{
  if(r){const f={id:uid('f'),kind:'attachment',quote:q.id,name:r.name,mime:r.mime,size:Math.round(r.b64.length*.75),base64:r.b64,createdAt:new Date().toISOString(),createdBy:me().id};
   if(f.size>ATT_MAX)bad.push(file.name+(isPT()?' (mais de 2 MB)':' (more than 2 MB)'));else{DB.files.push(f);added.push(f);}}
  else bad.push(file.name+(why==='too big'?(isPT()?' (mais de 2 MB)':' (more than 2 MB)'):''));
  if(--left)return;
  /* mock: check the browser can still hold the data; if not, undo */
  if(added.length){try{localStorage.setItem(STORE_KEY,JSON.stringify(DB));}catch(e){DB.files=DB.files.filter(x=>!added.includes(x));added.forEach(x=>bad.push(x.name));added.length=0;
   toast(isPT()?'Sem espaço no browser para estes ficheiros (maqueta — em produção vão para o armazenamento de ficheiros)':'No room left in the browser for these files (mock — in production they go to file storage)');render();return;}}
  if(added.length)logQ(q,`Attachment${added.length>1?'s':''} added: ${added.map(x=>x.name).join(', ')}`);
  state.tab='files';
  toast(bad.length?(isPT()?`${added.length} adicionado(s) · não foi possível: ${bad.join(', ')}`:`${added.length} added · couldn’t add: ${bad.join(', ')}`):(isPT()?`${added.length} anexo${added.length>1?'s':''} adicionado${added.length>1?'s':''}`:`${added.length} attachment${added.length>1?'s':''} added`));}));}

function mAttRm(q,f){openModal('Remove attachment',()=>`<div class="small">“${esc(f.name)}” is removed from this job. This can’t be undone.</div>`,
 ()=>{DB.files=DB.files.filter(x=>x.id!==f.id);logQ(q,`Attachment removed: ${f.name}`);state.modal=null;toast('Attachment removed');},'Remove');state.modal.danger=true;render();}

Object.assign(A,{
 attOpen:t=>{const f=fileOf(t.dataset.id);if(f){if(typeof audit==='function')audit('download','quote',f.quote||'',f.name);attViewer(f);}},
 attDl:t=>{const f=fileOf(t.dataset.id);if(f){if(typeof audit==='function')audit('download','quote',f.quote||'',f.name);openPdf(f,true);}},
 attRm:t=>{const q=QR(state.qid),f=fileOf(t.dataset.id);if(q&&f&&canAttach(q))mAttRm(q,f);}});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset&&t.dataset.chg==='attAdd'){const q=QR(state.qid);if(q&&canAttach(q))addAttachments(q,t.files);t.value='';}});
