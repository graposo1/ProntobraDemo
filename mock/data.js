/* ===== Helpers, icons, statuses, permissions, data store ===== */
const pad2=n=>String(n).padStart(2,'0');
const isoOf=d=>`${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
const TODAY_ISO=isoOf(new Date());
const TODAY=new Date(TODAY_ISO+'T12:00:00');
const D=s=>new Date(s+'T12:00:00');
const daysSince=s=>Math.round((TODAY-D(s))/864e5);
const daysUntil=s=>-daysSince(s);
const addDays=(s,n)=>{const d=D(s);d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
/* dates on screen: dd-MM-yyyy (data stays ISO yyyy-MM-dd) */
const fmtDate=s=>s?`${s.slice(8,10)}-${s.slice(5,7)}-${s.slice(0,4)}`:'—';
/* range: both dates in full, with an arrow — clear on any screen */
/* a date range reads "01-01-2026 a 25-10-2026" (EN: "to") — no arrows (25-10-2026) */
const fmtRange=(a,b)=>a?(a===b||!b?fmtDate(a):`${fmtDate(a)} ${isPT()?'a':'to'} ${fmtDate(b)}`):'Not set';
const overlap=(a1,a2,b1,b2)=>a1<=b2&&b1<=a2;
const eur=n=>isPT()?Math.round(n).toLocaleString('pt-PT')+'\u00a0€':'€'+Math.round(n).toLocaleString('en-GB');
const eur2=n=>isPT()?n.toLocaleString('pt-PT',{minimumFractionDigits:2,maximumFractionDigits:2})+'\u00a0€':'€'+n.toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2});
const pct=n=>(n*100).toLocaleString(LOC(),{minimumFractionDigits:1,maximumFractionDigits:1})+'%';
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
const sum=(a,f)=>a.reduce((s,x)=>s+f(x),0);
const uid=p=>p+Math.random().toString(36).slice(2,7);

/* Addresses: always the same five fields */
const EMPTY_ADDR=()=>({line1:'',line2:'',country:'Portugal',city:'',postal:''});
const addrOf=a=>Object.assign(EMPTY_ADDR(),a&&typeof a==='object'?a:{});
const addrLines=a=>{a=addrOf(a);return [a.line1,a.line2,[a.postal,a.city].filter(Boolean).join(' '),a.country].filter(Boolean);};
/* the company using the app (Settings › Company information) */
const COMPANY=()=>DB.settings.company||(DB.settings.company={name:'',address:EMPTY_ADDR()});
const addrStr=a=>addrLines(a).join(', ');
const addrEmpty=a=>!(a&&(a.line1||a.line2||a.city||a.postal));
const addrHtml=(a,empty='<span class="faint">No address</span>')=>addrEmpty(a)?empty:addrLines(a).map(esc).join('<br>');
const getPath=(o,p)=>p?p.split('.').reduce((x,k)=>x?.[k],o):o;

const I={
 minus:'<path d="M5 12h14"/>',
 box:'<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>',
 week:'<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 3v3M16 3v3M9 9.5v11M15 9.5v11"/>',
 chart:'<path d="M3 20h18"/><path d="M6 16v-5M10.5 16V6M15 16v-7M19.5 16V4"/>',
 receipt:'<path d="M6 2.5h12v19l-2.5-1.6-2 1.6-1.5-1.2-1.5 1.2-2-1.6L6 21.5z"/><path d="M9 7.5h6M9 11h6M9 14.5h4"/>',
home:'<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
quotes:'<path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
map:'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
dir:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>',
settings:'<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
bell:'<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
alert:'<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
unlock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>',
right:'<path d="m9 6 6 6-6 6"/>',
left:'<path d="m15 6-6 6 6 6"/>',
plus:'<path d="M12 5v14M5 12h14"/>',back:'<path d="M15 18l-6-6 6-6"/>',chev:'<path d="m6 9 6 6 6-6"/>',
pin:'<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
swap:'<path d="M7 16H3l4 4M3 16h14a4 4 0 0 0 4-4M17 8h4l-4-4M21 8H7a4 4 0 0 0-4 4"/>',
doc:'<path d="M14 3v5h5"/><path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',check:'<path d="M5 12.5 10 17 19 7"/>',
send:'<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
route:'<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H16a3.5 3.5 0 0 0 0-7H8a3.5 3.5 0 0 1 0-7h7.5"/>',
mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
x:'<path d="M18 6 6 18M6 6l12 12"/>',edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
pause:'<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',
cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
shield:'<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
logout:'<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3"/>',
eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
download:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',more:'<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',rows:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M3 14h18M9 9v11"/>',upload:'<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
};
const ic=(k,s=20)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k]}</svg>`;


/* Status: Open -> Locked -> Finished (or Aborted). A proposal is NOT a status: an open quote keeps a list of the proposals sent (and whether each was rejected).
   "Approved" is a tag, set when the order is locked. The job dates are not a status either — they drive the alerts. */
const validEmail=e=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e||'').trim());
const ST={
 open:{label:'Open',c:'blue',hint:'Edit freely. Send a proposal if the client wants one, then lock the order once it is approved.'},
 locked:{label:'Locked',c:'green',hint:'Approved — values are locked. Confirm the vendors and follow the job until it is finished.'},
 finished:{label:'Finished',c:'grey',hint:''},
 aborted:{label:'Aborted',c:'grey',hint:''},
};
const FLOW=['open','locked','finished'];
const STEP={open:'Open',locked:'Locked',finished:'Finished'};
const STAGE={unscheduled:['Dates not set'],scheduled:['Scheduled'],ongoing:['Ongoing'],overdue:['Overdue'],done:['Done']};
const PIPELINE=['open'];

/* Permissions — fixed list in code; roles (sets of permissions) live in the data file */
const PERM_GROUPS=[
 ['Quotes you can see',[['quotes.viewPipeline','Open quotes'],['quotes.viewWork','Locked quotes (approved work)'],['quotes.viewClosed','Finished & aborted quotes']]],
 ['Directory',[['customers.edit','Create / edit customers & contacts'],['vendors.edit','Create / edit vendors'],['resources.price','Add resources & update prices']]],
 ['Quotes & work',[['quotes.costs','See internal costs & margins'],['quotes.edit','Add and edit quotes & lines'],['quotes.send','Send proposals to clients'],['work.manage','Manage locked work & vendors'],['work.addResources','Collaborator: record expenses on approved jobs they work on (own lines only; until archived)'],['map.planner','Use route planner'],['stats.view','Statistics (values only with “See internal costs”)']]],
 ['Expenses',[['expenses.pay','Expense payments: see all expenses and mark them as paid to the collaborator'],['expenses.onBehalf','Expenses for others: add expenses on any job that is not archived, paid by a vendor or by the company (e.g. invoices handed in)'],['expenses.approve','Approve expenses: approve or reject expenses before they go to the job (their own go straight to the job)']]],
 ['Administration',[['alerts.rules','Edit alert rules'],['setup.edit','Setup: number series, dimensions, quote types, units'],['users.manage','Manage users & roles'],['data.manage','Import / export the data file (JSON)'],['audit.view','Access log (RGPD)'],['customers.anonymize','Anonymise customers (RGPD) — cannot be undone']]],
];
const PERM_DEFS=PERM_GROUPS.flatMap(g=>g[1]);
const ALL_PERMS=PERM_DEFS.map(p=>p[0]);
const ADMIN_ROLE='admin';
/* default phone shortcuts per role — the people on site get what they use most */
const DEFAULT_MOBILE={collab:['home','expenses','quotes'],finance:['home','quotes','payexp','stats'],_:['home','quotes','map','dir']};
const MOBILE_MAX=4;

/* Data — everything below is loaded from data/db.json (or the copy saved in this browser) */
let DB=null,DB_SOURCE='',USERS=[],ROLES=[],CUSTOMERS=[],VENDORS=[],RESOURCES=[],QUOTES=[],OUTBOX=[],TOWNS=[];
/* outbox: buffer table of things to send (proposal emails). The app only writes a row; a background routine sends it and records the result.
   Row: {id, kind:'proposal', quote, version, to:{contact,name,email}, subject, body, attachment:{type:'proposal-pdf',ref}, status:'pending'|'sent'|'failed', attempts, error, createdAt, createdBy, sentAt} */
const U=id=>USERS.find(u=>u.id===id);
const RL=id=>ROLES.find(r=>r.id===id);
const initials=n=>String(n||'?').split(' ').filter(Boolean).map(x=>x[0]).slice(0,2).join('').toUpperCase();
const av=id=>{const u=U(id);return u?`<span class="avatar" title="${esc(u.name)}">${initials(u.name)}</span>`:''};
/* Blocked customers/vendors disappear from lists and pickers; everything already recorded with them stays. They can be deleted only while nothing refers to them. */
const custInUse=c=>QUOTES.some(q=>q.cust===c.id||q.customer?.id===c.id||q.billTo?.cust===c.id);
const vendInUse=v=>QUOTES.some(q=>q.lines.some(l=>l.ref===v.id||l.doneBy===v.id||l.paidBy===v.id));
const C=id=>CUSTOMERS.find(x=>x.id===id), V=id=>VENDORS.find(x=>x.id===id), R=id=>RESOURCES.find(x=>x.id===id);
const QR=id=>QUOTES.find(q=>q.id===id);
/* a resource's price is optional (e.g. fuel: the cost is entered on each line). No price → null. */
const price=r=>r&&r.hist&&r.hist.length?r.hist[r.hist.length-1][1]:null;
const priceOn=r=>r&&r.hist&&r.hist.length?r.hist[r.hist.length-1][0]:null;
const contactOf=q=>q.contactInfo||(()=>{const c=C(q.cust);return c&&contactSnap(c.contacts.find(x=>x.id===q.contact)||c.contacts.find(x=>x.primary)||c.contacts[0]);})();
const townXY=n=>{const t=TOWNS.find(x=>x[0]===n)||TOWNS[0]||['',38.722,-9.139];return {lat:t[1]+(Math.random()-.5)*.012,lng:t[2]+(Math.random()-.5)*.012}};
/* every line has its own client price: markup on its cost (pmode 'pct', default from Setup) or a fixed value (pmode 'flat') */
const lab=(id,ref,desc,qty,unit,cost,extra={})=>({id,kind:'labor',ref,refName:V(ref)?.name||'',refPhone:V(ref)?.phone||'',desc,qty,unit,cost,confirmed:false,pmode:'flat',sell:null,markup:null,...extra});
const res=(id,ref,desc,qty,extra={})=>({id,kind:'resource',ref,refName:R(ref)?.name||'',desc,qty,unit:R(ref)?.unit||'unit',cost:price(R(ref))??0,priceDate:TODAY_ISO,pmode:'flat',sell:null,markup:null,...extra}); /* new lines: Fixed value, client value filled in later */
const Q=o=>Object.assign({dims:{},customer:null,billTo:null,billUnlocked:false,contactInfo:null,site:{loc:null,name:'',address:EMPTY_ADDR()},contact:null,description:'',owner:null,cm:null,visit:{needed:false,date:null,done:false,route:null},visits:[],workStart:null,workEnd:null,workDone:null,margin:.25,priceMode:'markup',priceTotal:null,versions:[],lines:[],log:[],urgent:false},o);

/* Number series — one per record type, set in Settings. Customers, vendors, resources and quotes all get a number. */
const SERIES_KINDS=[['customer','Customers','CUST'],['vendor','Vendors','VEND'],['resource','Resources','RES'],['quote','Quotes','QUOTE']];
const seriesList=k=>({customer:CUSTOMERS,vendor:VENDORS,resource:RESOURCES,quote:QUOTES})[k];
const noOf=(k,x)=>k==='quote'?x.id:x.no;
/* Business-Central-style number series: a series (e.g. QUOTE) has lines; each line has a start date and a number range (QUOTE26000001 … QUOTE26999999).
   The newest line whose start date has arrived is used. Adding a line closes the previous one. */
const parseNo=s=>{const m=String(s||'').match(/^(.*?)(\d+)$/);return m?{p:m[1],n:+m[2],w:m[2].length}:null;};
const lineOpen=(l,d=TODAY_ISO)=>!l.closed||l.closed>d;
const yy=d=>String(d||TODAY_ISO).slice(2,4);
function activeLine(k){const ser=DB.settings.numberSeries.find(x=>x.code===DB.settings.seriesFor[k]);if(!ser)return {};
 const ls=ser.lines.filter(l=>l.start<=TODAY_ISO&&lineOpen(l)).sort((a,b)=>b.start.localeCompare(a.start));return {ser,line:ls[0]};}
function takeNo(k,commit){const {line}=activeLine(k);if(!line)return null;const f=parseNo(line.from),t=parseNo(line.to);if(!f||!t)return null;
 const used=new Set(seriesList(k).map(x=>noOf(k,x)));const fmt=n=>f.p+String(n).padStart(f.w,'0');
 let n=line.last&&parseNo(line.last)?parseNo(line.last).n+1:f.n;while(n<=t.n&&used.has(fmt(n)))n++;
 if(n>t.n)return null;if(commit)line.last=fmt(n);return fmt(n);}
const nextNo=k=>takeNo(k,true);
const peekNo=k=>takeNo(k,false)||'— (no open number line)';
const nextQuoteId=()=>nextNo('quote');
const noOpen=k=>!takeNo(k,false);
const noSeriesMsg=k=>`No open number line for ${(SERIES_KINDS.find(x=>x[0]===k)||[])[1]||k} — add one in Settings → Number series`;
const seriesUse=code=>SERIES_KINDS.filter(([k])=>DB.settings.seriesFor[k]===code).map(x=>x[1]);
function newSeries(code,desc,start){const y=yy(start);return {code,description:desc,lines:[{id:uid('sl'),start,from:code+y+'000001',to:code+y+'999999',last:'',closed:''}]};}
const defaultSeries=()=>SERIES_KINDS.map(([k,l,c])=>newSeries(c,l,TODAY_ISO.slice(0,4)+'-01-01'));
const defaultSeriesFor=()=>Object.fromEntries(SERIES_KINDS.map(([k,l,c])=>[k,c]));
/* Units of measure — the list resources and quote lines choose from */
const DEFAULT_UNITS=[['unit','Unit'],['L','Litre'],['kg','Kilogram'],['bag','Bag'],['can','Can'],['m','Metre'],['m²','Square metre'],['m³','Cubic metre'],['roll 100 m','Roll of 100 m'],['hour','Hour'],['day','Day'],['job','Per job'],['km','Kilometre']].map(([code,name])=>({code,name}));
/* Dimensions (like Business Central): free tags with values. Any entity — customer, vendor, quote (and quote types) — can hold any dimension,
   and several values of the same dimension: dims = {CODE:[value,…]}. There are no per-dimension rules.
   Vendor suggestions compare the quote's dimensions with the vendors' (only dimensions that vendors actually use). */
const _vals=a=>a.map(([code,name])=>({code,name}));
const DEFAULT_DIMS=()=>[
 {code:'ESPECIALIDADE',name:'Especialidade',values:_vals([['ALVENARIA','Alvenaria (pedreiro)'],['PINTURA','Pintura'],['CANALIZACAO','Canalização'],['ELETRICIDADE','Eletricidade'],['LADRILHOS','Ladrilhos e azulejos'],['CARPINTARIA','Carpintaria'],['PLADUR','Pladur e tetos falsos'],['TELHADOS','Telhados'],['IMPERMEABILIZACAO','Impermeabilização'],['AVAC','AVAC (climatização)'],['SERRALHARIA','Serralharia'],['MANUTENCAO','Manutenção geral']])},
 {code:'VIATURA',name:'Viatura',values:_vals([['SIM','Tem viatura'],['NAO','Sem viatura']])}];
const DEFAULT_QTYPES=()=>[
 {code:'WC',name:'Remodelação de casa de banho',dims:{ESPECIALIDADE:['CANALIZACAO','LADRILHOS','ELETRICIDADE']}},
 {code:'PINTURA',name:'Pintura interior',dims:{ESPECIALIDADE:['PINTURA']}},
 {code:'COBERTURA',name:'Cobertura e telhado',dims:{ESPECIALIDADE:['TELHADOS','IMPERMEABILIZACAO'],VIATURA:['SIM']}},
 {code:'MANUT',name:'Manutenção',dims:{ESPECIALIDADE:['MANUTENCAO']}}];
const dimOf=c=>DB.settings.dimensions.find(d=>d.code===c);
const dimsFor=()=>DB.settings.dimensions;
const dimValName=(dc,vc)=>{const v=dimOf(dc)?.values.find(x=>x.code===vc);return v?(v.name||v.code):vc;};
const dimLabel=d=>d.name||d.code;
const dvals=(dims,c)=>{const v=dims&&dims[c];return Array.isArray(v)?v:v?[v]:[];};
const normDims=d=>{const o={};Object.entries(d&&typeof d==='object'?d:{}).forEach(([k,v])=>{const a=(Array.isArray(v)?v:v?[v]:[]).filter(Boolean);if(a.length)o[k]=[...new Set(a)];});return o;};
const cleanDims=normDims;
const dimCopy=src=>{const o={};Object.entries(normDims(src)).forEach(([k,v])=>{if(dimOf(k))o[k]=[...v];});return o;};
const dimMerge=(dst,src)=>{Object.entries(normDims(src)).forEach(([k,v])=>{dst[k]=[...new Set([...dvals(dst,k),...v])];});return dst;};
const dimTagged=()=>[...CUSTOMERS,...VENDORS,...QUOTES];
const allLines=()=>QUOTES.flatMap(q=>q.lines||[]);
const dimUse=(dc,vc)=>{const f=x=>{const a=dvals(x.dims,dc);return vc==null?a.length>0:a.includes(vc);};return {customers:CUSTOMERS.filter(f).length,vendors:VENDORS.filter(f).length,quotes:QUOTES.filter(f).length,types:(DB.settings.quoteTypes||[]).filter(f).length};};
/* records tagged (customers, vendors, quotes); quote types are counted apart — a dimension in use anywhere can't be deleted */
const dimUseN=(dc,vc)=>{const u=dimUse(dc,vc);return u.customers+u.vendors+u.quotes;};
const dimInUse=(dc,vc)=>dimUseN(dc,vc)+dimUse(dc,vc).types;
const dimValsText=(d,k)=>dvals(d,k).map(x=>dimValName(k,x)).join(', ');
const dimsText=d=>Object.keys(d||{}).flatMap(k=>dvals(d,k).map(x=>k+' '+dimValName(k,x))).join(' ');
const dimPills=(d,empty='<span class="faint small">No dimensions</span>')=>{const e=Object.keys(d||{}).filter(k=>dimOf(k)&&dvals(d,k).length);return e.length?e.map(k=>`<span class="pill p-grey nodot" title="${esc(k)}"><b style="font-weight:700">${esc(dimLabel(dimOf(k)))}</b>&nbsp;${esc(dimValsText(d,k))}</span>`).join(' '):empty;};
const dimHolders=()=>[...dimTagged(),...(DB.settings.quoteTypes||[])];
function renameDimKey(oldC,newC){dimHolders().forEach(x=>{if(x.dims&&oldC in x.dims){x.dims[newC]=x.dims[oldC];delete x.dims[oldC];}});}
function renameDimValue(dc,oldC,newC){dimHolders().forEach(x=>{if(x.dims&&Array.isArray(x.dims[dc]))x.dims[dc]=x.dims[dc].map(v=>v===oldC?newC:v);});}
/* all dimension values of a record, as names (used for lists and search) */
const dimNames=x=>Object.keys(x.dims||{}).filter(dimOf).flatMap(k=>dvals(x.dims,k).map(v=>dimValName(k,v)));
const vSpecs=dimNames,qSpecs=dimNames;
/* Description (short, max 100 chars — identifies the job; starts as the template's name) and Description 2 (q.description, max 500 — what needs to be done) */
const TITLE_MAX=100,DESC_MAX=500;
const qLabel=q=>q.title||'';
/* Quote templates (stored as settings.quoteTypes): a ready-made set of dimensions. Applying one fills them in; the quote doesn't remember the template. */
const qtOf=c=>(DB.settings.quoteTypes||[]).find(t=>t.code===c);
const qtypeOpts=()=>[{v:'',l:'— none —'},...(DB.settings.quoteTypes||[]).map(t=>({v:t.code,l:t.name||t.code,sub:Object.keys(t.dims).map(k=>dimValsText(t.dims,k)).join(' · ')}))];
const unitName=c=>(DB.settings.units.find(u=>u.code===c)||{}).name||'';
const unitOpts=()=>DB.settings.units.map(u=>({v:u.code,l:u.code,sub:u.name}));
const unitUse=c=>RESOURCES.filter(r=>r.unit===c).length+VENDORS.filter(v=>v.unit===c).length+QUOTES.filter(q=>q.lines.some(l=>l.unit===c)).length;

/* A quote keeps its own copy of customer, bill-to, contact and job site. Customers/locations only supply the starting values. */
const custSnap=c=>({id:c.id,no:c.no||'',name:c.name,nif:c.nif||''});
const billSnap=c=>({cust:c.id,no:c.no||'',name:c.name,nif:c.nif||'',address:addrOf(c.billing)});
const contactSnap=x=>x?{id:x.id,name:x.name,role:x.role||'',phone:x.phone||'',email:x.email||''}:null;
const siteSnap=(l)=>l?{loc:l.id,name:l.name||'',address:addrOf(l.address)}:{loc:null,name:'',address:EMPTY_ADDR()};
const qTown=q=>q.site?.address?.city||'';
const qAddr=q=>addrStr(q.site?.address);
const qCust=q=>q.customer?.name||C(q.cust)?.name||'—';
/* A job is identified by customer + place (+ number). The place: the location's name, else street + town, else town. */
const qPlace=q=>{const s=q.site||{},a=s.address||{};if(s.name)return s.name+(a.city&&!s.name.includes(a.city)?' · '+a.city:'');return [a.line1,a.city].filter(Boolean).join(', ')||'No location';};


/* Used only if data/db.json can't be read (e.g. page opened straight from disk) and nothing is saved in this browser.
   Keep in step with data/db.json. */
function seedDB(){return {
 meta:{app:'Raposo Solutions',schema:3,updated:null,note:'Mock data file. Passwords are plain text for the demo only.'},
 settings:{company:{name:'',address:EMPTY_ADDR()},sla:{open:[3,6],waiting:[5,10]},workAlert:{amber:14,red:5},
  dimensions:DEFAULT_DIMS(),quoteTypes:DEFAULT_QTYPES(),numberSeries:defaultSeries(),seriesFor:defaultSeriesFor(),units:DEFAULT_UNITS.map(u=>({...u})),
  towns:[['Lisboa',38.722,-9.139],['Restelo',38.708,-9.208],['Algés',38.7026,-9.228],['Amadora',38.759,-9.24],['Queluz',38.7566,-9.2545],['Oeiras',38.705,-9.31],['Carcavelos',38.70,-9.335],['Parede',38.691,-9.354],['Cascais',38.705,-9.405],['Sintra',38.8029,-9.3817],['Mem Martins',38.79,-9.345],['Loures',38.8309,-9.1685],['Odivelas',38.793,-9.1838],['Mafra',38.937,-9.3277],['Almada',38.672,-9.157],['Seixal',38.64,-9.101],['Barreiro',38.655,-9.072],['Setúbal',38.5244,-8.8882]]},
 roles:[
  {id:'admin',name:'Administrator',description:'Full access. Manages users, roles and data. Can view the app as any user for testing.',system:true,perms:[...ALL_PERMS]},
  {id:'ceo',name:'CEO',description:'Sees everything, approves and sends.',perms:['quotes.viewPipeline','quotes.viewWork','quotes.viewClosed','customers.edit','vendors.edit','resources.price','quotes.costs','quotes.edit','quotes.send','work.manage','map.planner','alerts.rules','setup.edit']},
  {id:'cto',name:'CTO',description:'Technical lead on quotes and work.',perms:['quotes.viewPipeline','quotes.viewWork','quotes.viewClosed','customers.edit','vendors.edit','resources.price','quotes.costs','quotes.edit','work.manage','map.planner']},
  {id:'commercial',name:'Commercial manager',description:'Takes new quotes, visits sites, sends proposals.',perms:['quotes.viewPipeline','quotes.edit','quotes.send','map.planner']},
  {id:'ops',name:'Operations',description:'Builds quotes and runs locked work.',perms:['quotes.viewPipeline','quotes.viewWork','quotes.costs','quotes.edit','work.manage','map.planner','expenses.onBehalf','expenses.approve']},
  {id:'collab',name:'Collaborator',description:'Works on site: records expenses (amount and receipt photo) on approved jobs until they are archived. Does not see the job’s values.',perms:['work.addResources']},
  {id:'finance',name:'Finance',description:'Costs, prices and invoicing.',perms:['quotes.viewPipeline','quotes.viewWork','quotes.viewClosed','resources.price','quotes.costs','expenses.pay','expenses.onBehalf']}],
 users:[{id:'u1',name:'Administrator',email:'admin@foxbillions.pt',password:'admin',roles:['admin'],active:true,lastLogin:null}],
 customers:[],vendors:[],resources:[],quotes:[],outbox:[],files:[],routes:[],expClaims:[]};}

const STORE_KEY='fb-db',SESSION_KEY='fb-session';
const lsGet=k=>{try{return localStorage.getItem(k);}catch(e){return null;}};
const lsSet=(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v);}catch(e){}};
function useDB(d,src){
 const s=seedDB();d=d&&typeof d==='object'?d:s;
 /* mock: data files older than schema 3 (single-value dimensions, trades, old statuses) are discarded, not converted */
 if(!d.meta||!(d.meta.schema>=3))d=s;
 d.meta=Object.assign({},s.meta,d.meta||{});d.settings=Object.assign({},s.settings,d.settings||{});
 ['roles','users','customers','vendors','resources','quotes','outbox','files','routes','accessLog'].forEach(k=>{if(!Array.isArray(d[k]))d[k]=k==='roles'||k==='users'?s[k]:[];});
 let adm=d.roles.find(r=>r.id===ADMIN_ROLE);if(!adm){adm=s.roles[0];d.roles.unshift(adm);}
 adm.system=true;adm.perms=[...ALL_PERMS];
 d.users.forEach(u=>{if(!Array.isArray(u.roles))u.roles=u.role?[u.role]:[];if(u.active==null)u.active=true;});
 if(!d.users.some(u=>u.active&&u.roles.includes(ADMIN_ROLE)))d.users.push({...s.users[0],id:'u'+Math.random().toString(36).slice(2,7)});
 DB=d; /* helpers below read DB */
 migrate(d);
 d.quotes=d.quotes.map(Q);
 DB=d;DB_SOURCE=src;USERS=d.users;ROLES=d.roles;CUSTOMERS=d.customers;VENDORS=d.vendors;RESOURCES=d.resources;QUOTES=d.quotes;OUTBOX=d.outbox;TOWNS=d.settings.towns;
 QUOTES.forEach(q=>{const v=q.versions[q.versions.length-1];if(v&&!v.total&&typeof calc==='function')v.total=calc(q).prop;});
}
/* Bring older data files up to the current shape (addresses, numbers, units, quote copies). Safe to run on every load. */
function migrate(d){
 const st=d.settings,def=seedDB().settings;
 CUSTOMERS=d.customers;VENDORS=d.vendors;RESOURCES=d.resources;QUOTES=d.quotes;
 st.workAlert=Object.assign({},def.workAlert,st.workAlert||{});
 if(!st.sla||!st.sla.open)st.sla={open:(st.sla&&st.sla.quote)||[3,6],waiting:(st.sla&&st.sla.sent)||[5,10]};
 delete st.series; /* old prefix+counter format */
 if(!Array.isArray(st.numberSeries)||!st.numberSeries.length)st.numberSeries=defaultSeries();
 st.seriesFor=Object.assign(defaultSeriesFor(),st.seriesFor||{});
 st.numberSeries.forEach(x=>{x.lines=(x.lines||[]).map(l=>({id:l.id||uid('sl'),start:l.start,from:l.from,to:l.to,last:l.last||'',closed:l.closed||''}));});
 if(!Array.isArray(st.dimensions))st.dimensions=DEFAULT_DIMS();
 st.dimensions.forEach(x=>{if(!Array.isArray(x.values))x.values=[];delete x.rule;delete x.on;});
 if(!Array.isArray(st.quoteTypes))st.quoteTypes=DEFAULT_QTYPES();
 st.quoteTypes.forEach(t=>{t.dims=normDims(t.dims);});
 st.company={name:(st.company&&st.company.name)||'',address:addrOf(st.company&&st.company.address)}; /* company information (25-10-2026) — shown on proposals */
 delete st.globalDims; /* global dimensions were removed (25-10-2026) */
 delete st.trades;
 if(!st.collabRole){st.collabRole=true;if(!d.roles.some(r=>r.id==='collab'))d.roles.push({id:'collab',name:'Collaborator',description:'Works on site: records expenses (amount and receipt photo) on approved jobs until they are archived. Does not see the job’s values.',perms:['work.addResources']});}
 /* stock control was removed (25-10-2026, D-65) */
 delete d.stockMoves;delete st.stockLocations;delete st.stockPerm;
 d.roles.forEach(r=>{if(Array.isArray(r.perms))r.perms=r.perms.filter(p=>p!=='stock.manage');});
 d.resources.forEach(r=>{delete r.stock;delete r.min;});
 d.quotes.forEach(q=>(q.lines||[]).forEach(l=>{delete l.from;}));
 /* phone bottom bar: up to 4 shortcuts per role (25-10-2026); the rest is under "More" */
 d.roles.forEach(r=>{if(!Array.isArray(r.mobile))r.mobile=(DEFAULT_MOBILE[r.id]||DEFAULT_MOBILE._).slice();});
 /* expense approval (D-72, 26-10-2026): pending/rejected expenses live in d.expClaims until approved */
 if(!Array.isArray(d.expClaims))d.expClaims=[];
 if(!st.expApprovePerm){st.expApprovePerm=true;d.roles.forEach(r=>{if(r.id==='ops'&&!r.perms.includes('expenses.approve'))r.perms.push('expenses.approve');});}
 if(!st.expOnBehalfPerm){st.expOnBehalfPerm=true;d.roles.forEach(r=>{if(['finance','ops'].includes(r.id)&&!r.perms.includes('expenses.onBehalf'))r.perms.push('expenses.onBehalf');});}
 if(!st.expPayPerm){st.expPayPerm=true;d.roles.forEach(r=>{if(r.id==='finance'&&!r.perms.includes('expenses.pay'))r.perms.push('expenses.pay');});}
 if(!st.statsPerm){st.statsPerm=true;d.roles.forEach(r=>{if(['ceo','cto','finance','ops'].includes(r.id)&&!r.perms.includes('stats.view'))r.perms.push('stats.view');});}
 if(!Array.isArray(st.units)||!st.units.length)st.units=DEFAULT_UNITS.map(u=>({...u}));
 const addU=c=>{if(c&&!st.units.some(u=>u.code===c))st.units.push({code:c,name:''});};
 d.resources.forEach(r=>addU(r.unit));d.quotes.forEach(q=>(q.lines||[]).forEach(l=>addU(l.unit)));
 d.customers.forEach(c=>{
  if(typeof c.billing==='string'||!c.billing)c.billing=addrOf({line1:c.billing||'',city:c.town||''});else c.billing=addrOf(c.billing);
  delete c.town;if(!Array.isArray(c.locations))c.locations=[];c.locations.forEach(l=>{l.address=addrOf(l.address);if(!l.id)l.id=uid('loc');});
  if(!Array.isArray(c.contacts))c.contacts=[];if(c.phone==null)c.phone='';if(c.email==null)c.email='';});
 d.vendors.forEach(v=>{v.address=addrOf(v.address);});
 /* statuses: Open / Locked / Finished / Aborted (older files had request/quote/sent/accepted/postponed/cancelled) */
 {const cr=d.roles.find(r=>r.id==='collab');if(cr&&/jobs in progress|Sees no values/.test(cr.description||''))cr.description='Works on site: records expenses (amount and receipt photo) on approved jobs until they are archived. Does not see the job’s values.';}
 d.customers.forEach(c=>{if(!c.type)c.type=/\b(Lda|S\.A\.|Unipessoal)\b|Condom[ií]nio|Cl[ií]nica|Restaurante|Caf[eé]|Farm[aá]cia|Escola|Gin[aá]sio|Imobili[aá]ria|Hostel|Hotel|[OÓ]tica|Pastelaria|Padaria|Ag[eê]ncia|Lavandaria|Cabeleireiro|Livraria|Consult[oó]rio|Talho|Est[uú]dio|Mercearia|Escrit[oó]rios/i.test(c.name)?'company':'person';});
 d.quotes.forEach(q=>{delete q.source;delete q.qtype;q.title=/^(New quote|Nova obra|Obra)$/.test(q.title||'')?'':String(q.title||'').slice(0,100);}); /* quote templates are no longer kept on the quote */
 d.quotes.forEach(q=>{if(!Array.isArray(q.visits))q.visits=[];if(!q.visit)q.visit={needed:false,date:null,done:false,route:null};
  if(q.visit.done){q.visits.push({date:q.visit.date||null,route:q.visit.route||null});q.visit={needed:false,date:null,done:false,route:null};}
  else if(q.visit.date&&(!q.visit.route||!(d.routes||[]).some(r=>r.id===q.visit.route))){q.visit.needed=true;q.visit.date=null;q.visit.route=null;}
  if(!q.priceMode)q.priceMode='markup';if(q.priceTotal===undefined)q.priceTotal=null;
  /* the job price is no longer set on the header: lines that followed the job get their own price, keeping today's value */
  const ls=(q.lines||[]).filter(l=>!l.onSite),lc=l=>(+l.qty||0)*(+l.cost||0),auto=ls.filter(l=>l.pmode!=='pct'&&l.pmode!=='flat');
  if(auto.length){if(q.priceMode==='total'){const own=ls.filter(l=>!auto.includes(l)),fixed=own.reduce((a,l)=>a+(l.pmode==='flat'?+l.sell||0:lc(l)*(1+(+l.markup||0))),0),rest=(+q.priceTotal||0)-fixed,base=auto.reduce((a,l)=>a+lc(l),0);
    auto.forEach(l=>{l.pmode='flat';l.sell=Math.round((base>0?rest*lc(l)/base:rest/auto.length)*100)/100;l.markup=null;});}
   else auto.forEach(l=>{l.pmode='pct';l.markup=+q.margin||0;l.sell=null;});}
  q.priceMode='markup';q.priceTotal=null;});
 delete st.defaultMarkup; /* "markup for new lines" setting removed (25-10-2026) — new lines start as Fixed value */
 d.quotes.forEach(q=>{const o=q.status,lv=q.versions&&q.versions.length?q.versions[q.versions.length-1].v:null;
  if(['request','quote','sent'].includes(o))q.status='open';
  else if(o==='accepted'||(o==='postponed'&&q.postponed&&q.postponed.prev==='accepted')){q.status=q.workDone?'finished':'locked';if(!q.approved)q.approved={date:q.since||TODAY_ISO,v:lv};}
  else if(o==='postponed')q.status='open';
  else if(o==='cancelled')q.status='aborted';
  delete q.postponed;});
 [...d.customers,...d.vendors,...d.quotes].forEach(x=>{x.dims=normDims(x.dims);});
 d.resources.forEach(r=>{delete r.dims;}); /* resources don't have dimensions */
 /* numbers: records without one take the next number from their series */
 const lists={customer:d.customers,vendor:d.vendors,resource:d.resources};
 Object.entries(lists).forEach(([k,arr])=>{arr.forEach(x=>{if(!x.no){const n=takeNo(k,true);x.no=n||'';}});});
 /* quotes keep their own copies */
 const cu=id=>d.customers.find(c=>c.id===id),ve=id=>d.vendors.find(v=>v.id===id),re=id=>d.resources.find(r=>r.id===id);
 d.quotes.forEach(q=>{const c=cu(q.cust);
  if(!q.customer&&c)q.customer=custSnap(c);
  if(!q.billTo&&c)q.billTo=billSnap(c);else if(q.billTo)q.billTo.address=addrOf(q.billTo.address);
  if(!q.contactInfo&&c){const x=c.contacts.find(x=>x.id===q.contact)||c.contacts.find(x=>x.primary)||c.contacts[0];q.contactInfo=contactSnap(x);}
  if(!q.site||typeof q.site!=='object')q.site={loc:null,name:'',address:addrOf({line1:q.addr||'',city:q.town||''})};
  q.site.address=addrOf(q.site.address);delete q.town;delete q.addr;
  (q.lines||[]).forEach(l=>{
   if(l.kind==='labor'){const v=ve(l.ref);if(!l.refName&&v)l.refName=v.name;if(l.refPhone==null&&v)l.refPhone=v.phone||'';if(!l.unit)l.unit=(v&&v.unit)||'job';}
   else{const r=re(l.ref);if(!l.refName&&r)l.refName=r.name;if(!l.unit&&r)l.unit=r.unit;
    if(l.cost==null&&r)l.cost=l.locked??price(r)??0;if(!l.priceDate)l.priceDate=l.locked!=null?(q.versions[q.versions.length-1]||{}).date||TODAY_ISO:TODAY_ISO;delete l.locked;}
   delete l.history; /* "Replace vendor" removed (D-69, 26-10-2026): the replacements kept on the lines go */
   /* "Paid by" on expenses (D-70, 26-10-2026): who gets the money back — the vendor linked to whoever added it; none = the company */
   if(l.onSite&&l.paidBy===undefined){const u=(d.users||[]).find(x=>x.id===l.addedBy),v=u&&u.vendor?ve(u.vendor):null;l.paidBy=v?v.id:null;l.paidByName=v?v.name:'';}
   if(l.doneBy&&!l.doneByName&&ve(l.doneBy))l.doneByName=ve(l.doneBy).name;
   delete l.dims; /* lines don't have dimensions */});
  q.cust=q.cust||q.customer?.id;});
 d.vendors.forEach(v=>{if(v.rate!=null&&v.cost==null)v.cost=v.rate;delete v.rate;}); /* the old day rate (removed 25-10-2026) comes back as the vendor's default cost per unit (D-71, 26-10-2026) */
}
/* Load order: the browser's copy, unless the data file is a newer edition (meta.edition changed) — then the file wins,
   so a new demo database shows up without having to press "Reload". From disk (file://) the file is read from data/db.js. */
async function readDataFile(){try{const r=await fetch('data/db.json',{cache:'no-store'});if(!r.ok)throw new Error(r.status);return await r.json();}catch(e){}
 return window.DB_FILE?JSON.parse(JSON.stringify(window.DB_FILE)):null;}
async function loadDB(fromFileOnly){const file=await readDataFile();
 if(!fromFileOnly){const saved=lsGet(STORE_KEY);if(saved){try{const d=JSON.parse(saved);
   if(!file||!file.meta?.edition||d.meta?.edition===file.meta.edition){useDB(d,'browser');return;}
   setTimeout(()=>typeof toast==='function'&&toast('New data file loaded — the previous data in this browser was replaced'),600);}catch(e){}}}
 if(file){useDB(file,'file');return;}
 useDB(seedDB(),'builtin');}
let _saveT=null;
function saveDB(){if(!DB)return;clearTimeout(_saveT);_saveT=setTimeout(()=>{const s=JSON.stringify(DB);if(s===saveDB.last)return;saveDB.last=s;DB.meta.updated=new Date().toISOString();lsSet(STORE_KEY,JSON.stringify(DB));DB_SOURCE='browser';},150);}
/* Readable JSON: objects indented, short arrays of plain values kept on one line */
const prettyJSON=d=>JSON.stringify(d,null,2).replace(/\[\s*\n\s*((?:(?:"(?:[^"\\]|\\.)*"|-?[\d.eE+-]+|true|false|null)\s*,\s*\n\s*)*(?:"(?:[^"\\]|\\.)*"|-?[\d.eE+-]+|true|false|null))\s*\n\s*\]/g,(m,inner)=>'['+inner.split(/,\s*\n\s*/).join(', ')+']');
function exportDB(){const d=JSON.parse(JSON.stringify(DB));d.meta.exported=new Date().toISOString();
 const blob=new Blob([prettyJSON(d)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='db.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);}
function importDB(text){const d=JSON.parse(text);if(!d||!Array.isArray(d.users))throw new Error('Not an Raposo Solutions data file (no users list).');useDB(d,'browser');saveDB.last=null;lsSet(STORE_KEY,JSON.stringify(DB));}
