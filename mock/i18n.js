/* ===== Language layer =====
   The app's structure and code stay in English; labels shown to the user are Portuguese (pt-PT) by default.
   Screens are rendered in English and translated on the way to the screen (exact phrases in PT.dict, patterns in PT.rules,
   see i18n-pt.js). Switch with "Language" in the user menu; the choice is remembered in this browser. */
const LANG_KEY='fb-lang';
let LANG='pt';try{LANG=localStorage.getItem(LANG_KEY)==='en'?'en':'pt';}catch(e){}
const isPT=()=>LANG==='pt';
const LOC=()=>isPT()?'pt-PT':'en-GB';
const PT={dict:{},rules:[],miss:null};
function tr(s){
 if(!isPT()||!s)return s;
 const m=s.match(/^(\s*)([\s\S]*?)(\s*)$/);const core=m[2];if(!core)return s;
 return m[1]+trCore(core)+m[3];
}
function trCore(c){
 const r=trTry(c);if(r!==c)return r;
 const m=c.match(/^([\s·—–:.,(…●]*)([\s\S]*?)([\s·—–:.,)]*)$/);
 if(m&&m[2]&&m[2]!==c){const r2=trTry(m[2]);if(r2!==m[2])return m[1]+r2+m[3];}
 if(PT.miss&&/[A-Za-z]{3,}/.test(c))PT.miss.add(c);
 return c;
}
function trTry(c){
 const d=PT.dict;if(d[c]!==undefined)return d[c];if(d[c+'.']!==undefined)return d[c+'.'].replace(/\.$/,'');
 for(const [re,f] of PT.rules){if(re.test(c)){const r=c.replace(re,f);if(r!==c)return r;}}
 for(const sep of [' · ',' — ',' – ','. ',': ',', ']){if(c.includes(sep)){const parts=c.split(sep);const out=parts.map(p=>trCore(p));if(out.some((x,i)=>x!==parts[i]))return out.join(sep);}}
 return c;
}
const TR_ATTR=['placeholder','title','aria-label'];
function trEl(el){if(el.nodeType!==1)return;TR_ATTR.forEach(a=>{const v=el.getAttribute(a);if(v){const t=tr(v);if(t!==v)el.setAttribute(a,t);}});}
function trTree(n){
 if(n.nodeType===3){if(n.parentNode&&/^(TEXTAREA|SCRIPT|STYLE)$/.test(n.parentNode.nodeName))return;const t=tr(n.nodeValue);if(t!==n.nodeValue)n.nodeValue=t;return;}
 if(n.nodeType!==1||/^(SCRIPT|STYLE|TEXTAREA)$/.test(n.nodeName))return;
 trEl(n);const w=document.createTreeWalker(n,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);let x;
 while(x=w.nextNode()){if(x.nodeType===3){if(!/^(TEXTAREA|SCRIPT|STYLE)$/.test(x.parentNode.nodeName)){const t=tr(x.nodeValue);if(t!==x.nodeValue)x.nodeValue=t;}}else trEl(x);}
}
let _mo=null;
function i18nStart(){
 document.documentElement.lang=isPT()?'pt-PT':'en';
 if(_mo)_mo.disconnect();
 if(!isPT())return;
 trTree(document.body);document.title=tr(document.title);
 _mo=new MutationObserver(ms=>{_mo.disconnect();try{ms.forEach(m=>{if(m.type==='childList')m.addedNodes.forEach(trTree);else if(m.type==='characterData')trTree(m.target);else if(m.type==='attributes')trEl(m.target);});}finally{_mo.observe(document.body,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:TR_ATTR});}});
 _mo.observe(document.body,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:TR_ATTR});
}
function setLang(l){LANG=l==='en'?'en':'pt';try{localStorage.setItem(LANG_KEY,LANG);}catch(e){}if(typeof render==='function')render();i18nStart();}
