'use strict';
document.addEventListener("DOMContentLoaded", function() {

function G(id){ return document.getElementById(id); }
function T(id){ var el=G(id); return el ? el.textContent : ''; }
function S(id,val){ var el=G(id); if(el && val !== undefined && val !== null) el.textContent=val; }

// ── LANGUAGES (hand-written translations in assets/i18n.js) ─────────
var DICT=window.JR_I18N||{};
var LANGS=[['en','English','EN'],['bn','বাংলা','BN'],['hi','हिन्दी','HI'],['ur','اردو','UR'],['zh','中文','ZH'],['tr','Türkçe','TR']];
var FONTS={bn:'Hind+Siliguri:wght@400;500;600;700',hi:'Hind:wght@400;500;600;700',ur:'Noto+Naskh+Arabic:wght@400;500;600;700',zh:'Noto+Sans+SC:wght@400;500;700;900'};
var EN={
 'c.hello1':'Assalamu Alaikum! 👋 Welcome to JR Textile Machineries.',
 'c.hello2':'We supply Air Jet Looms, Water Jet Looms, Repair Looms and genuine spare parts from China to Bangladesh, India and Pakistan.\n\nAsk a question below, or tap a quick option.',
 'c.remind':'📞 For more details, WhatsApp or call us:','c.wa':'WhatsApp:','c.call':'Call:','c.email':'Email:','c.still':'Still there? 😊 ',
 'c.fallback':'Thanks for your message! Our team will get back to you shortly.\n\nFor the fastest reply, continue on WhatsApp or email us:',
 'c.price':'We give a full quotation within 24 hours — price, specifications, lead time and delivery cost, with no hidden fees.\n\nTell us the machine type, width/model and quantity. The quickest way is WhatsApp:',
 'c.airjet':'Yes, we supply high-speed Air Jet Looms for fine and medium-weight fabrics, sourced directly from leading Chinese manufacturers, with installation and training.\n\nWhich reed width and quantity do you need?',
 'c.waterjet':'We supply precision Water Jet Looms for synthetic and blended yarns, with full maintenance support.\n\nShare your reed width and quantity and we will quote quickly.',
 'c.repair':'We supply heavy-duty Repair Looms with spare parts and installation support. Send us the model you are looking for and we will check availability.',
 'c.spare':'We stock genuine spare parts for all major loom brands — Toyota, Tsudakoma, Picanol, Dornier, Itema, Somet, Sulzer, Smit and Stäubli.\n\nSend a photo or part number on WhatsApp for the fastest answer.',
 'c.license':'No import license needed. We handle customs clearance, port documentation and duties under our license — from China right to your factory.',
 'c.country':'Yes — besides Bangladesh we supply looms and spare parts to textile factories in India and Pakistan. Tell us your city and requirement and we will quote with delivery.',
 'c.delivery':'Delivery time depends on the machine and stock. We confirm the exact lead time in your quotation, and our Yangzhou (China) office keeps shipments moving fast.',
 'c.address':'Our offices:\n• Bangladesh: 175 Court Road, Bilashdi, Narsingdi Sadar, Narsingdi\n• Bangladesh: Adla, Atlapur Bazar, Rupganj, Narayanganj\n• China: 196 Yangzijin, Hanjiang District, Yangzhou, Jiangsu',
 'c.install':'Our technicians support installation, operator training and after-sales maintenance for every machine we sell.',
 'c.contact':'Of course! You can reach our team directly:',
 'c.hi':'Hello! 👋 How can we help you today? You can ask about prices, machines, spare parts, import or delivery.'
};
var curLang='en';
var I18N_SKIP='.h-captcha,script,style,noscript,.orbit,#jc-msgs,#jc-quick,.lang,#f-cc,#form-status,#about-more';
var I18N_ATTRS=['placeholder','aria-label','title','alt'];
function norm(x){ return x.replace(/\s+/g,' ').trim(); }
function t(k){ var d=DICT[curLang]; return (curLang!=='en'&&d&&d[k])||EN[k]||k; }
function applyLang(code,opt){
  opt=opt||{};
  if(!LANGS.some(function(lang){ return lang[0]===code; })) code='en';
  var fromEn=(curLang==='en');
  var d=DICT[code]||{};
  var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:function(n){ var p=n.parentElement; return (!p||!n.nodeValue.trim()||p.closest(I18N_SKIP))?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT; }});
  var n; while((n=w.nextNode())){
    if(fromEn||n.__jrEn===undefined) n.__jrEn=n.nodeValue;
    var en=n.__jrEn, tr=(code!=='en')?d[norm(en)]:null;
    if(tr){ var m=en.match(/^(\s*)[\s\S]*?(\s*)$/); n.nodeValue=m[1]+tr+m[2]; } else if(n.nodeValue!==en) n.nodeValue=en;
  }
  document.querySelectorAll('['+I18N_ATTRS.join('],[')+']').forEach(function(el){
    if(el.closest(I18N_SKIP)) return; el.__jrA=el.__jrA||{};
    I18N_ATTRS.forEach(function(a){ if(!el.hasAttribute(a)) return;
      if(fromEn||el.__jrA[a]===undefined) el.__jrA[a]=el.getAttribute(a);
      var en=el.__jrA[a], tr=(code!=='en')?d[norm(en)]:null; el.setAttribute(a,tr||en); });
  });
  curLang=code;
  var h=document.documentElement; h.setAttribute('lang',code);
  if(code==='ur') h.setAttribute('dir','rtl'); else h.removeAttribute('dir');
  if(FONTS[code] && !document.querySelector('link[data-jr-font="'+code+'"]')){
    var l=document.createElement('link'); l.rel='stylesheet'; l.setAttribute('data-jr-font',code);
    l.href='https://fonts.googleapis.com/css2?family='+FONTS[code]+'&display=swap'; document.head.appendChild(l);
  }
  var cur=LANGS.filter(function(x){return x[0]===code;})[0];
  var lc=G('lang-cur'); if(lc) lc.textContent=(window.innerWidth<560?cur[2]:cur[1]);
  document.querySelectorAll('#lang-menu li').forEach(function(li){ li.setAttribute('aria-selected',li.getAttribute('data-l')===code?'true':'false'); });
  if(!opt.temp){ try{ localStorage.setItem('jrLang',code); }catch(_){} }
  document.dispatchEvent(new CustomEvent('jr:lang',{detail:code}));
}
(function(){
  var box=G('lang'), btn=G('lang-btn'), menu=G('lang-menu'); if(!box) return;
  LANGS.forEach(function(L){ var li=document.createElement('li'); li.setAttribute('role','option'); li.setAttribute('tabindex','0'); li.setAttribute('data-l',L[0]); li.setAttribute('lang',L[0]);
    if(L[0]==='ur') li.setAttribute('dir','rtl');
    var title=document.createElement('span'), short=document.createElement('small'); title.textContent=L[1]; short.textContent=L[2]; li.appendChild(title); li.appendChild(short);
    function pick(){ applyLang(L[0]); box.classList.remove('open'); btn.setAttribute('aria-expanded','false'); }
    li.addEventListener('click',pick); li.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); pick(); } });
    menu.appendChild(li); });
  btn.addEventListener('click',function(e){ e.stopPropagation(); var o=box.classList.toggle('open'); btn.setAttribute('aria-expanded',o?'true':'false'); });
  document.addEventListener('click',function(e){ if(!box.contains(e.target)){ box.classList.remove('open'); btn.setAttribute('aria-expanded','false'); } });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'){ box.classList.remove('open'); btn.setAttribute('aria-expanded','false'); } });
})();
function startLang(){
  var pick=null, q=(location.search.match(/[?&]lang=([a-z]{2})/)||[])[1];
  if(q && (q==='en'||DICT[q])) pick=q;
  if(!pick){ try{ pick=localStorage.getItem('jrLang'); }catch(_){} }
  if(!pick){ (navigator.languages||[navigator.language||'en']).some(function(l){ l=(l||'').slice(0,2).toLowerCase(); if(DICT[l]){ pick=l; return true; } return l==='en'; }); }
  applyLang(pick||'en',{temp:!q && !pick});
}


// ── LIGHT / DARK THEME ───────────────────────────────────────────────
var LOGO_LIGHT={'assets/logo-3d-horizontal.webp':'assets/logo-3d-horizontal-light.webp?v=darkgold','assets/logo-3d.webp':'assets/logo-3d-light.webp?v=darkgold'};
function swapLogos(light){
  ['site-logo','site-logo2'].forEach(function(id){ var im=G(id); if(!im) return;
    var src=im.getAttribute('src'), dark=im.getAttribute('data-dark-src');
    if(light){ if(LOGO_LIGHT[src]){ im.setAttribute('data-dark-src',src); im.setAttribute('src',LOGO_LIGHT[src]); } }
    else if(dark){ im.setAttribute('src',dark); im.removeAttribute('data-dark-src'); } });
}
function setTheme(th,save){
  var h=document.documentElement;
  if(th==='light') h.setAttribute('data-theme','light'); else h.removeAttribute('data-theme');
  swapLogos(th==='light');
  var mc=document.querySelector('meta[name="theme-color"]'); if(mc) mc.setAttribute('content',th==='light'?'#f4f6fa':'#07101e');
  if(save){ try{ localStorage.setItem('jrTheme',th); }catch(_){} }
}
setTheme(document.documentElement.getAttribute('data-theme')==='light'?'light':'dark',false);
(function(){ var b=G('theme-btn'); if(!b) return;
  b.addEventListener('click',function(){
    var h=document.documentElement; h.classList.add('theme-anim');
    setTheme(h.getAttribute('data-theme')==='light'?'dark':'light',true);
    setTimeout(function(){ h.classList.remove('theme-anim'); },400);
  });
})();

// ── PHONE: country picker fills the code ─────────────────────────────
var COUNTRIES=[['BD','880','Bangladesh'],['IN','91','India'],['PK','92','Pakistan'],['CN','86','China'],['TR','90','Turkey'],['LK','94','Sri Lanka'],['NP','977','Nepal'],['VN','84','Vietnam'],['ID','62','Indonesia'],['EG','20','Egypt'],['AE','971','United Arab Emirates'],['SA','966','Saudi Arabia'],['UZ','998','Uzbekistan'],['XX','','Other']];
var LANG_CC={en:'BD',bn:'BD',hi:'IN',ur:'PK',zh:'CN',tr:'TR'}, ccTouched=false;
function buildCountries(){
  var sel=G('f-cc'); if(!sel) return; var v=sel.value; sel.replaceChildren();
  COUNTRIES.forEach(function(c){ var o=document.createElement('option'); o.value=c[0]; o.textContent=t(c[2])+(c[1]?'  +'+c[1]:''); sel.appendChild(o); });
  sel.value=(!ccTouched && LANG_CC[curLang])||v||'BD';
  updatePhoneHint();
}
function updatePhoneHint(){ var sel=G('f-cc'), ph=G('f-phone'); if(!sel||!ph) return; var c=COUNTRIES.filter(function(x){return x[0]===sel.value;})[0]; ph.placeholder=(c&&c[1]?'+'+c[1]+' ':'+')+t('Phone number'); }
(function(){ var sel=G('f-cc'); if(!sel) return; sel.addEventListener('change',function(){ ccTouched=true; updatePhoneHint(); }); })();
document.addEventListener('jr:lang',buildCountries);
function fullPhone(){
  var raw=(G('f-phone').value||'').trim(); if(!raw) return {num:'',country:''};
  var c=COUNTRIES.filter(function(x){return x[0]===G('f-cc').value;})[0]||COUNTRIES[0];
  var digits=raw.replace(/[^\d+]/g,'');
  if(digits.charAt(0)==='+'||!c[1]) return {num:digits,country:c[2]};
  digits=digits.replace(/^00/,'+'); if(digits.charAt(0)==='+') return {num:digits,country:c[2]};
  if(digits.indexOf(c[1])===0 && digits.length>c[1].length+6) return {num:'+'+digits,country:c[2]};
  return {num:'+'+c[1]+' '+digits.replace(/^0+/,''),country:c[2]};
}

// Enquiries are plain text; security.js also runs in Node for regression tests.
var enquiryForm=G('enquiry-form');
var enquiryStorage=null; try{ enquiryStorage=window.sessionStorage; }catch(_){}
var enquiryTransport=window.JRSecurity.createEnquiryController({
  fetch:window.fetch.bind(window), storage:enquiryStorage,
  now:Date.now, endpoint:'https://api.web3forms.com/submit'
});
function formStatus(message,ok){
  var status=G('form-status'); status.style.display='block';
  status.style.color=ok?'#4ade80':'#ff6b6b'; status.textContent=t(message);
}
enquiryForm.addEventListener('submit',async function(event){
  event.preventDefault();
  var btn=G('form-submit-btn'); if(btn.disabled) return;
  var ph=fullPhone();
  var raw={name:G('f-name').value,company:G('f-company').value,email:G('f-email').value,
    phone:ph.num,phoneRaw:G('f-phone').value,country:ph.country,
    machine:G('f-machine').value,license:G('f-license').value,message:G('f-message').value};
  var checked=window.JRSecurity.validateEnquiry(raw);
  if(!checked.ok){ formStatus(checked.error,false); return; }
  if(G('f-botcheck').checked) return;
  var token='';
  try{ token=window.hcaptcha && window.hcaptcha.getResponse(); }catch(_){}
  if(!token){ formStatus('Please complete the security check. If it is unavailable, contact us by WhatsApp or email.',false); return; }
  btn.disabled=true; btn.textContent=t('Sending...');
  try{
    await enquiryTransport.submit(checked.data,G('w3-key').value.trim(),token);
    enquiryForm.reset(); buildCountries();
    formStatus('✓ Enquiry sent! We will contact you within 24 hours.',true);
  }catch(error){
    formStatus(error.code==='COOLDOWN'?'Please wait a minute before sending another enquiry.':'Could not send. Please contact us directly via WhatsApp.',false);
  }finally{
    try{ if(window.hcaptcha) window.hcaptcha.reset(); }catch(_){}
    btn.disabled=false; btn.textContent=t('Send Enquiry →');
  }
});
document.querySelectorAll('[data-scroll-to]').forEach(function(button){
  button.addEventListener('click',function(){ var target=G(button.dataset.scrollTo); if(target) target.scrollIntoView({behavior:'smooth'}); });
});

// ── POLISH: nav, mobile menu, reveal, Buy Now ──────────────────────
document.documentElement.classList.add('js');
var topnav=G('topnav');
function onScroll(){ if(topnav) topnav.classList.toggle('scrolled', window.scrollY>40); }
window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
var ntg=G('nav-tg');
if(ntg){
  ntg.addEventListener('click', function(){
    var open=topnav.classList.toggle('open');
    ntg.setAttribute('aria-expanded', open?'true':'false');
  });
  document.querySelectorAll('#nav-links a').forEach(function(a){
    a.addEventListener('click', function(){ topnav.classList.remove('open'); ntg.setAttribute('aria-expanded','false'); });
  });
}
if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){ if(e.isIntersecting){ var t=e.target; t.classList.add('in'); io.unobserve(t);
      setTimeout(function(){ t.classList.remove('rv','in'); t.style.transitionDelay=''; }, 1300); } });
  },{threshold:0.12, rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.sec .st,.sec .ss,.ah,.ap2,.ipt,.wc,.mc,.ps,.oc,.fb3,.fdc,.ch,.fq').forEach(function(el){
    var sib=el.parentNode ? Array.prototype.indexOf.call(el.parentNode.children, el) : 0;
    el.style.transitionDelay=(Math.min(sib,5)*0.08)+'s';
    el.classList.add('rv'); io.observe(el);
  });
}
function buyNow(card){
  var sel=G('f-machine');
  var MAP={'mc-m1':'Repair Loom','mc-m2':'Air Jet Loom','mc-m3':'Water Jet Loom','mc-m4':'Spare Parts Only'};
  if(sel) sel.value=MAP[card.id]||'Multiple / Not Sure';
  G('contact').scrollIntoView({behavior:'smooth'});
}
G('machine-grid').addEventListener('click', function(e){
  var f=e.target.closest('.mc-foot'); if(f) buyNow(f.closest('.mc'));
});
G('machine-grid').addEventListener('keydown', function(e){
  var f=e.target.closest && e.target.closest('.mc-foot');
  if(f && (e.key==='Enter' || e.key===' ')){ e.preventDefault(); buyNow(f.closest('.mc')); }
});

// ── LIVE CHAT with auto replies ─────────────────────────────────────
(function(){
  var jc=G('jc'); if(!jc) return;
  var msgs=G('jc-msgs'), quick=G('jc-quick'), inp=G('jc-in'), started=false, lastQ='', answers=0, nudges=0, idleT=null;
  function waNum(){ var a=G('wa-btn'); var m=a&&a.href.match(/wa\.me\/(\d+)/); return m?m[1]:'8619505274754'; }
  function email(){ return (T('co-email')||'junaedm333@gmail.com').trim(); }
  function phone(){ return (T('bd-phone')||'+880 1876 284203').trim(); }
  function waLink(q){ return 'https://wa.me/'+waNum()+'?text='+encodeURIComponent('Hello JR Textile Machineries! '+(q?('I have a question: '+q):'I would like a quotation.')); }
  function mailLink(q){ return 'mailto:'+email()+'?subject='+encodeURIComponent('Enquiry from website')+'&body='+encodeURIComponent((q?'My question: '+q+'\n\n':'')+'Name:\nCompany / Factory:\nCountry:\nMachine type & quantity:\n'); }
  function telLink(){ return 'tel:'+phone().replace(/[^\d+]/g,''); }
  var WAICON=G('jc-wa').querySelector('svg');
  function refreshFoot(){ G('jc-wa').href=waLink(lastQ); G('jc-mail').href=mailLink(lastQ); G('jc-call').href=telLink(); }
  function scroll(){ msgs.scrollTop=msgs.scrollHeight; }
  function add(text,who,acts){
    var d=document.createElement('div'); d.className='jc-m '+who; d.textContent=text;
    if(acts){ var w=document.createElement('div'); w.className='jc-acts';
      function action(cls,href,label,newTab,icon){
        var a=document.createElement('a'); a.className=cls; a.href=href;
        if(newTab){ a.target='_blank'; a.rel='noopener noreferrer'; }
        if(icon) a.appendChild(icon.cloneNode(true));
        a.appendChild(document.createTextNode(label)); w.appendChild(a);
      }
      if(acts.indexOf('wa')>-1) action('a-wa',waLink(lastQ),'WhatsApp +'+waNum(),true,WAICON);
      if(acts.indexOf('mail')>-1) action('a-mail',mailLink(lastQ),'✉ '+email());
      if(acts.indexOf('call')>-1) action('a-call',telLink(),'✆ '+phone());
      d.appendChild(w); }
    msgs.appendChild(d); scroll();
  }
  function botSay(text,acts,delay){
    var t=document.createElement('div'); t.className='jc-typing'; for(var i=0;i<3;i++) t.appendChild(document.createElement('i')); msgs.appendChild(t); scroll();
    setTimeout(function(){ t.remove(); add(text,'bot',acts); }, delay||Math.min(1400,500+text.length*6));
  }
  var R=[
    {id:'price',  k:/(price|cost|quot|rate|dam|daam|koto|কত|দাম|budget|कीमत|दाम|कितन|قیمت|ریٹ|کتنے|价格|价钱|报价|多少钱|fiyat|teklif|ücret|kaça)/i, x:['wa','mail']},
    {id:'country',k:/(india|pakistan|kolkata|surat|faisalabad|karachi|lahore|delhi|mumbai|ভারত|পাকিস্তান|भारत|पाकिस्तान|بھارت|پاکستان|印度|巴基斯坦|hindistan)/i, x:['wa','mail']},
    {id:'airjet', k:/(air ?jet|এয়ার জেট|एयर जेट|ایئر جیٹ|喷气|hava jet)/i, x:['wa']},
    {id:'waterjet',k:/(water ?jet|ওয়াটার জেট|वॉटर जेट|واٹر جیٹ|喷水|su jet)/i, x:['wa']},
    {id:'repair', k:/(repair|rapier|used|second|রেপিয়ার|रेपियर|ریپیئر|剑杆)/i, x:['wa']},
    {id:'spare',  k:/(spare|parts?\b|nozzle|reed|heald|motor|board|স্পেয়ার|পার্টস|স্পেয়ার|स्पेयर|पार्ट|اسپیئر|پارٹ|配件|零件|yedek|parça)/i, x:['wa']},
    {id:'license',k:/(licen|import|custom|\blc\b|duty|\bport\b|লাইসেন্স|আমদানি|কাস্টমস|लाइसेंस|इम्पोर्ट|आयात|لائسنس|امپورٹ|کسٹم|许可证|进口|清关|lisans|ithalat|gümrük)/i, x:['wa','mail']},
    {id:'delivery',k:/(deliver|ship|\btime\b|kobe|days|lead|ডেলিভারি|কবে|কতদিন|डिलीवरी|कब तक|ڈیلیوری|کب تک|交货|发货|多久|teslim|kargo|ne zaman)/i, x:['wa']},
    {id:'address',k:/(address|office|location|where|thikana|ঠিকানা|অফিস|কোথায়|पता|ऑफिस|कहाँ|پتہ|دفتر|کہاں|地址|办公室|在哪|adres|ofis|nerede|narsingdi|rupganj|narayanganj|yangzhou)/i, x:['call','wa']},
    {id:'install',k:/(install|training|service|support|technician|warranty|ইনস্টল|ট্রেনিং|इंस्टॉल|ट्रेनिंग|انسٹال|ٹریننگ|安装|培训|售后|kurulum|eğitim|servis)/i, x:['wa']},
    {id:'contact',k:/(human|person|agent|talk|call|phone|number|contact|whats|email|mail|ফোন|নম্বর|যোগাযোগ|फ़ोन|फोन|नंबर|संपर्क|فون|نمبر|رابطہ|电话|联系|人工|telefon|iletişim)/i, x:['wa','mail','call']},
    {id:'hi',     k:/^(hi|hello|hey|salam|assalam|aslam|hlw|helo|good|হ্যালো|আসসালামু|नमस्ते|हैलो|السلام|سلام|你好|您好|merhaba|selam)/i, x:null}
  ];
  var RID={}; R.forEach(function(r){ RID[r.id]=r; });
  function remindText(){ return t('c.remind')+'\n'+t('c.wa')+' +'+waNum().replace(/^(\d{2})(\d{3})(\d{4})(\d+)$/,'$1 $2 $3 $4')+'\n'+t('c.call')+' '+phone()+'\n'+t('c.email')+' '+email(); }
  function remind(delay){ setTimeout(function(){ botSay(remindText(),['wa','call','mail']); },delay); }
  function armIdle(){
    clearTimeout(idleT);
    if(nudges>=2) return;
    idleT=setTimeout(function(){ if(jc.classList.contains('open')){ nudges++; botSay(t('c.still')+remindText(),['wa','call']); } },30000);
  }
  function answer(q,forceId){
    lastQ=q; refreshFoot(); answers++;
    var hit=forceId?RID[forceId]:null;
    if(!hit) for(var i=0;i<R.length;i++){ if(R[i].k.test(q)){ hit=R[i]; break; } }
    if(hit){ botSay(t('c.'+hit.id),hit.x); }
    else botSay(t('c.fallback'),['wa','mail']);
    // every second answer, remind visitors how to reach a person
    if(answers%2===0 && !(hit && hit.x && hit.x.length>=3)) remind(1800);
    armIdle();
  }
  var QUICK=[['💰 Get a price','price'],['Air Jet Loom','airjet'],['Water Jet Loom','waterjet'],['Spare parts','spare'],['No import license?','license'],['Office address','address'],['Talk to a person','contact']];
  function buildQuick(){ quick.replaceChildren();
    QUICK.forEach(function(q){ var b=document.createElement('button'); b.type='button'; b.textContent=t(q[0]);
      b.addEventListener('click',function(){ add(t(q[0]),'me'); answer(q[0],q[1]); }); quick.appendChild(b); }); }
  buildQuick(); document.addEventListener('jr:lang',buildQuick);
  function open(){
    jc.classList.add('open','seen'); G('jc-launch').setAttribute('aria-expanded','true'); G('jc-tip').classList.remove('show');
    refreshFoot();
    if(!started){ started=true;
      botSay(t('c.hello1'),null,500);
      setTimeout(function(){ botSay(t('c.hello2'),null,900); },700);
      setTimeout(function(){ botSay(remindText(),['wa','call'],700); },2700);
      armIdle();
    }
    setTimeout(function(){ if(window.innerWidth>560) inp.focus(); },350);
  }
  function close(){ jc.classList.remove('open'); G('jc-launch').setAttribute('aria-expanded','false'); }
  G('jc-launch').addEventListener('click',function(){ jc.classList.contains('open')?close():open(); });
  G('jc-close').addEventListener('click',close);
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') close(); });
  G('jc-form').addEventListener('submit',function(e){ e.preventDefault(); var q=inp.value.trim().slice(0,400); if(!q) return; inp.value=''; add(q,'me'); answer(q); });
  inp.addEventListener('input',armIdle);
  G('jc-tip').addEventListener('click',function(e){ if(e.target.id==='jc-tip-x'){ G('jc-tip').classList.remove('show'); try{sessionStorage.setItem('jcTip','1');}catch(_){} return; } open(); });
  var tipSeen=false; try{ tipSeen=!!sessionStorage.getItem('jcTip'); }catch(_){}
  if(!tipSeen) setTimeout(function(){ if(!jc.classList.contains('open')){ G('jc-tip').classList.add('show'); try{sessionStorage.setItem('jcTip','1');}catch(_){} } },4000);
})();


// ── ABOUT TABS ──────────────────────────────────────────────────────
function moveInk(){ var ink=document.querySelector('.tab-ink'), t=document.querySelector('.tab[aria-selected="true"]'); if(!ink||!t) return; ink.style.left=t.offsetLeft+'px'; ink.style.width=t.offsetWidth+'px'; }
function showTab(id,focus){
  var tabs=document.querySelectorAll('.tabs .tab'); if(!tabs.length) return;
  tabs.forEach(function(t){ var on=t.getAttribute('aria-controls')===id; t.setAttribute('aria-selected',on?'true':'false'); t.tabIndex=on?0:-1; var p=G(t.getAttribute('aria-controls')); if(p) p.hidden=!on; if(on&&focus) t.focus(); });
  moveInk();
}
document.querySelectorAll('.tabs .tab').forEach(function(t,i,all){
  t.addEventListener('click',function(){ showTab(t.getAttribute('aria-controls')); });
  t.addEventListener('keydown',function(e){ var k=e.key, rtl=document.documentElement.dir==='rtl', n=null;
    if(k==='ArrowRight') n=all[(i+(rtl?-1:1)+all.length)%all.length]; if(k==='ArrowLeft') n=all[(i+(rtl?1:-1)+all.length)%all.length];
    if(n){ e.preventDefault(); showTab(n.getAttribute('aria-controls'),true); } });
});
document.querySelectorAll('a[data-tab]').forEach(function(a){ a.addEventListener('click',function(){ showTab(a.getAttribute('data-tab')); }); });
window.addEventListener('resize',moveInk); document.addEventListener('jr:lang',function(){ setTimeout(moveInk,60); });
if(location.hash==='#process'){ showTab('t-how'); var ab=G('about'); if(ab) setTimeout(function(){ ab.scrollIntoView(); },50); }
setTimeout(moveInk,80); if(document.fonts&&document.fonts.ready) document.fonts.ready.then(moveInk);

// ── CLICK-TO-OPEN DETAILS ────────────────────────────────────────────
function xpWrap(el){
  if(!el) return null;
  if(el.parentElement && el.parentElement.classList.contains('xp-in')) return el.parentElement.parentElement;
  var b=document.createElement('div'); b.className='xp-body'; var i=document.createElement('div'); i.className='xp-in';
  el.parentNode.insertBefore(b,el); b.appendChild(i); i.appendChild(el); return b;
}
function makeXP(card,detail,tgAfter){
  if(!card||!detail) return;
  xpWrap(detail); card.classList.add('xp');
  if(!card.querySelector('.xp-tg')){ var tg=document.createElement('span'); tg.className='xp-tg'; tg.setAttribute('aria-hidden','true');
    if(tgAfter) tgAfter.insertAdjacentElement('afterend',tg); else card.insertBefore(tg,card.firstChild); }
  card.setAttribute('aria-expanded','false');
  if(!card.querySelector('a,button,.mc-foot')){ card.setAttribute('role','button'); card.setAttribute('tabindex','0'); }
}
function xpToggle(card){ var o=card.classList.toggle('open'); card.setAttribute('aria-expanded',o?'true':'false'); }
function initXP(){
  document.querySelectorAll('.ipt').forEach(function(c){ makeXP(c,c.querySelector('p')); });
  document.querySelectorAll('.wc').forEach(function(c){ makeXP(c,c.querySelector('p')); });
  document.querySelectorAll('.mc').forEach(function(c){ var b=c.querySelector('.mc-body'); if(!b) return; makeXP(c,b.querySelector('p')); var tg=c.querySelector('.xp-tg'); if(tg&&tg.parentElement!==b) b.insertBefore(tg,b.firstChild); });
  document.querySelectorAll('.ps').forEach(function(c){ makeXP(c,c.querySelector('p'),c.querySelector('h4')); });
}
initXP();
document.addEventListener('click',function(e){
  var c=e.target.closest('.xp'); if(!c||e.target.closest('a,.mc-foot,button,input,select,textarea')) return;
  if(e.target.closest('.xp-in') && c.classList.contains('open')) return;   // let people select the text they opened
  xpToggle(c);
});
document.addEventListener('keydown',function(e){ var c=e.target.closest&&e.target.closest('.xp[role="button"]'); if(c&&e.target===c&&(e.key==='Enter'||e.key===' ')){ e.preventDefault(); xpToggle(c); } });
// About: second paragraph behind "Read more"
(function(){ var p2=G('about-p2'); if(!p2) return; var body=xpWrap(p2); var wrap=body.parentElement;
  if(!wrap.classList.contains('xp')){ wrap.classList.add('xp-about'); }
  var btn=G('about-more'); if(!btn){ btn=document.createElement('button'); btn.type='button'; btn.id='about-more'; btn.className='xp-more'; btn.setAttribute('aria-expanded','false'); body.insertAdjacentElement('afterend',btn); }
  function label(){ btn.textContent=t(btn.getAttribute('aria-expanded')==='true'?'Show less':'Read more'); }
  body.classList.add('xp-solo'); label();
  btn.addEventListener('click',function(){ var o=btn.getAttribute('aria-expanded')!=='true'; btn.setAttribute('aria-expanded',o?'true':'false'); body.classList.toggle('xp-show',o); label(); });
  document.addEventListener('jr:lang',label);
})();

startLang();
}); // end DOMContentLoaded
