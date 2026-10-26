/* ===== Proposal PDF (dummy generator for the mock) =====
   Builds a small, real PDF (A4, Helvetica, Portuguese text) from an archived proposal snapshot, stores it as base64 in DB.files
   and lets people open or download it. In production the PDF would be produced by a proper template service; the storage and
   the links (version.pdf → files[id], outbox.attachment.file) stay the same. */
const PDF_W=595,PDF_H=842,PDF_M=50;
/* WinAnsi: Latin-1 as octal escapes, plus the few typographic characters WinAnsi keeps at 0x80–0x9F */
const PDF_MAP={'€':0x80,'‚':0x82,'„':0x84,'…':0x85,'‘':0x91,'’':0x92,'“':0x93,'”':0x94,'•':0x95,'–':0x96,'—':0x97};
function pdfTxt(s){let o='';for(const ch of String(s??'')){let c=ch.codePointAt(0);
  if(ch===' '||ch===' ')c=32;else if(PDF_MAP[ch])c=PDF_MAP[ch];else if(c>255)c=63;
  if(c===40||c===41||c===92)o+='\\'+String.fromCharCode(c);else if(c<32||c>126)o+='\\'+c.toString(8).padStart(3,'0');else o+=String.fromCharCode(c);}
 return o;}
/* rough Helvetica widths (per 1000 em) — enough to right-align amounts */
const PDF_WD=ch=>/[0-9]/.test(ch)?556:ch===' '||ch===' '||ch===' '?278:ch===','||ch==='.'?278:ch==='€'?556:/[A-Z]/.test(ch)?667:/[il]/.test(ch)?222:/[mw]/.test(ch)?833:500;
const pdfWidth=(s,size)=>[...String(s)].reduce((a,ch)=>a+PDF_WD(ch),0)*size/1000;
function buildPdf(pages){/* pages: [[{t,x,y,size,bold,right,grey}]] → PDF as a binary string (ASCII only) */
 const objs=[];const add=s=>{objs.push(s);return objs.length;};
 const fR=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
 const fB=add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
 const pagesId=objs.length+1+pages.length*2;const kids=[];
 pages.forEach(items=>{const ops=items.filter(i=>!i.rule).map(i=>{const x=i.right?i.x-pdfWidth(i.t,i.size||10):i.x;
   return `${i.grey?'0.45 0.44 0.42':'0.11 0.11 0.1'} rg BT /${i.bold?'F2':'F1'} ${i.size||10} Tf ${x.toFixed(1)} ${i.y.toFixed(1)} Td (${pdfTxt(i.t)}) Tj ET`;}).join('\n');
  const lines=items.filter(i=>i.rule).map(i=>`0.85 0.84 0.82 RG 0.6 w ${PDF_M} ${i.y} m ${PDF_W-PDF_M} ${i.y} l S`).join('\n');
  const stream=lines+'\n'+ops;
  const c=add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  kids.push(add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PDF_W} ${PDF_H}] /Resources << /Font << /F1 ${fR} 0 R /F2 ${fB} 0 R >> >> /Contents ${c} 0 R >>`));});
 add(`<< /Type /Pages /Kids [${kids.map(k=>k+' 0 R').join(' ')}] /Count ${kids.length} >>`);
 const cat=add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
 let out='%PDF-1.4\n';const offs=[];
 objs.forEach((o,i)=>{offs.push(out.length);out+=`${i+1} 0 obj\n${o}\nendobj\n`;});
 const xref=out.length;
 out+=`xref\n0 ${objs.length+1}\n0000000000 65535 f \n`+offs.map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('');
 out+=`trailer\n<< /Size ${objs.length+1} /Root ${cat} 0 R >>\nstartxref\n${xref}\n%%EOF`;
 return out;}
const pdfUnit=u=>u?((typeof UNIT_PT!=='undefined'&&UNIT_PT[u])||u):'';
const pdfMoney=n=>n.toLocaleString('pt-PT',{minimumFractionDigits:2,maximumFractionDigits:2})+' €';
const pdfDate=iso=>iso?fmtDate(iso):'';
const pdfRange=(a,b)=>a?(a===b||!b?pdfDate(a):`${pdfDate(a)} a ${pdfDate(b)}`):'a combinar';
/* The proposal document, in Portuguese (it goes to the client). The template is still to be defined: no lines are listed;
   the open questions are printed in their place so everyone sees it is a placeholder. */
function proposalPdf(snap,label,date){const c=calc(snap),bt=snap.billTo||{},ct=snap.contact,site=snap.site||{};
 const pages=[[]];let y=PDF_H-PDF_M;let P=pages[0];
 const put=(t,x,o={})=>P.push({t,x,y,...o});
 const need=h=>{if(y-h<PDF_M+40){P=[];pages.push(P);y=PDF_H-PDF_M;put(label+' (continuação)',PDF_M,{size:9,grey:true});y-=24;}};
 const co=COMPANY();put(co.name||'',PDF_M,{size:20,bold:true});put(label,PDF_W-PDF_M,{size:11,bold:true,right:true});y-=16;
 addrLines(co.address||{}).forEach(l=>{put(l,PDF_M,{size:9,grey:true});y-=11;});y-=4;
 put('Proposta de orçamento',PDF_M,{size:10,grey:true});put('Data: '+pdfDate(date),PDF_W-PDF_M,{size:10,grey:true,right:true});y-=34;
 put('Cliente',PDF_M,{size:9,bold:true,grey:true});put('Local da obra',PDF_W/2,{size:9,bold:true,grey:true});y-=14;
 const left=[bt.name,bt.nif?'NIF '+bt.nif:'',...addrLines(bt.address||{}),ct?'A/C '+ct.name:''].filter(Boolean);
 const right=[...(addrStr(site.address)?addrLines(site.address):['A confirmar']),'Datas previstas: '+pdfRange(snap.workStart,snap.workEnd)].filter(Boolean);
 for(let i=0;i<Math.max(left.length,right.length);i++){if(left[i])put(left[i],PDF_M,{size:10,bold:i===0});if(right[i])put(right[i],PDF_W/2,{size:10});y-=13;}
 y-=14;
 if(snap.title){put(String(snap.title).slice(0,95),PDF_M,{size:10.5,bold:true});y-=14;}
 if(snap.description){String(snap.description).replace(/\s+/g,' ').match(/.{1,95}(\s|$)/g)?.slice(0,8).forEach(l=>{put(l.trim(),PDF_M,{size:9.5,grey:true});y-=12;});}
 y-=14;put('Modelo da proposta por definir',PDF_M,{size:10,bold:true});y-=15;
 ['As linhas vão na proposta (mão de obra, materiais / linhas de recurso), ou só a descrição do trabalho e o total?','Como vai ser o modelo — logótipo, disposição, condições, validade, condições de pagamento?']
  .forEach(t=>{t.match(/.{1,95}(\s|$)/g).forEach((l,k)=>{put((k?'   ':'• ')+l.trim(),PDF_M+6,{size:9.5,grey:true});y-=12;});y-=3;});
 y-=12;
 need(70);P.push({rule:true,y:y+6});y-=10;
 put('Subtotal',PDF_W-PDF_M-110,{size:10,right:true});put(pdfMoney(c.prop),PDF_W-PDF_M,{size:10,right:true});y-=15;
 put('IVA 23%',PDF_W-PDF_M-110,{size:10,right:true});put(pdfMoney(c.prop*.23),PDF_W-PDF_M,{size:10,right:true});y-=18;
 put('Total',PDF_W-PDF_M-110,{size:12,bold:true,right:true});put(pdfMoney(c.prop*1.23),PDF_W-PDF_M,{size:12,bold:true,right:true});y-=34;
 need(30);put('Proposta válida por 30 dias. Documento gerado automaticamente (maqueta).',PDF_M,{size:8.5,grey:true});
 return buildPdf(pages);}
/* Files table: {id, kind, quote, version, name, mime, size, base64, createdAt, createdBy} */
function storeProposalPdf(q,ver){const s=ver.snap;if(!s)return null;
 const bin=proposalPdf(s,`Proposta ${q.id}-v${ver.v}`,ver.date);
 const f={id:uid('f'),kind:'proposal-pdf',quote:q.id,version:ver.v,name:`Proposta-${q.id}-v${ver.v}.pdf`,mime:'application/pdf',size:bin.length,base64:btoa(bin),createdAt:new Date().toISOString(),createdBy:me().id};
 DB.files.push(f);ver.pdf=f.id;return f;}
const fileOf=id=>(DB.files||[]).find(f=>f.id===id);
function pdfBlobUrl(f){const bin=atob(f.base64);const a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return URL.createObjectURL(new Blob([a],{type:f.mime}));}
function openPdf(f,download){const u=pdfBlobUrl(f);const a=document.createElement('a');a.href=u;if(download)a.download=f.name;else a.target='_blank';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(u);a.remove();},4000);}
/* Older versions (sent before PDFs existed) get their PDF built on demand from the archived copy */
function pdfFor(q,x){let f=x.pdf&&fileOf(x.pdf);if(!f&&x.snap){f=storeProposalPdf(q,x);saveDB();}return f;}
