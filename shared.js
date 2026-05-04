(function(){
  var GA_ID='G-S7TGS7QSZW';
  (function(){
    if(window.gtag||document.querySelector('script[src*="googletagmanager.com/gtag/js?id='+GA_ID+'"]'))return;
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+GA_ID;document.head.appendChild(s);
    window.gtag('js',new Date());window.gtag('config',GA_ID);
  })();

  var STORAGE={theme:'tn-theme',fav:'tn-favorites',recent:'tn-recent',rating:'tn-ratings'};
  function safeParse(k,fb){try{return JSON.parse(localStorage.getItem(k))||fb;}catch(e){return fb;}}
  function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
  function toast(msg){var t=document.createElement('div');t.className='tn-toast';t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.remove();},1800);}
  function isToolPage(){return location.pathname.indexOf('/tools/')>-1;}
  function pageUrl(){return location.pathname.replace(/^\//,'')||'index.html';}
  function pageTitle(){var h=document.querySelector('h1');return (h?h.textContent:document.title).replace(/\s+/g,' ').replace(/^[^A-Za-z0-9]+/,'').trim().replace(/\s*\|\s*ToolNest Studio$/,'')||'ToolNest Studio';}
  function setTheme(theme){document.documentElement.setAttribute('data-theme',theme);try{localStorage.setItem(STORAGE.theme,theme);}catch(e){}var b=document.querySelector('[data-tn-theme]');if(b)b.textContent=theme==='light'?'🌙 Dark':'☀️ Light';}
  setTheme(localStorage.getItem(STORAGE.theme)||'dark');
  document.documentElement.style.setProperty('--r-lg','22px');

  document.querySelectorAll('nav .nls').forEach(function(list){
    var links=[].slice.call(list.querySelectorAll('a[href$="contact.html"]'));
    var cta=links.find(function(a){return a.classList.contains('nc');});
    if(cta){links.forEach(function(a){if(a!==cta&&a.textContent.trim().toLowerCase()==='contact'){var li=a.closest('li');if(li)li.remove();}});}
  });
  document.querySelectorAll('.fbot span:first-child').forEach(function(el){if(/©\s*\d{4}\s*ToolNest Studio\./.test(el.textContent))el.textContent='© '+new Date().getFullYear()+' ToolNest Studio.';});
  document.querySelectorAll('.offline-badge').forEach(function(b){b.textContent='Browser ✓';b.setAttribute('title','Runs locally in your browser. Your input is not uploaded.');});

  if(isToolPage()){
    var recent=safeParse(STORAGE.recent,[]).filter(function(x){return x.url!==pageUrl();});
    recent.unshift({title:pageTitle(),url:pageUrl(),at:Date.now()});
    save(STORAGE.recent,recent.slice(0,5));
  }

  var emojiMap={
    'meta-tag-generator.html':'🏷️','html-entity-encoder.html':'&lt;','css-gradient-generator.html':'🌈','jwt-decoder.html':'🔑','cron-expression-builder.html':'⏲️','regex-tester.html':'.*','hash-generator.html':'#','url-encoder-decoder.html':'🔗','base64-encoder-decoder.html':'{ }','tip-calculator.html':'🧮','random-name-generator.html':'🎲','countdown-timer.html':'⏳','pomodoro-timer.html':'🍅','color-palette-generator.html':'🎨','markdown-editor.html':'📝','word-counter-pro.html':'✍️','qr-code-generator.html':'▦','json-formatter.html':'{}','ai-detector.html':'🤖','ai-writing-assistant.html':'✨','grammar-checker.html':'📝','plagiarism-checker.html':'🔍','prompt-helper.html':'💬','text-formatter.html':'🔤','reading-time.html':'⏱️','image-converter.html':'🖼️','image-collage.html':'🧩','thumbnail-creator.html':'🎬','image-generator.html':'🎨','pdf-tools.html':'📄','resume-builder.html':'💼','lesson-generator.html':'📚','budget-calculator.html':'💰','invoice-calculator.html':'🧾','password-generator.html':'🔐','unit-converter.html':'📏','card-validator.html':'✅','credit-card-generator.html':'🧪','email-generator.html':'📧','bio-link.html':'🔗'
  };
  function restoreHomeVisuals(){
    document.querySelectorAll('.tc-card').forEach(function(card){
      var href=card.getAttribute('href')||'',icon='⚡';
      Object.keys(emojiMap).forEach(function(k){if(href.indexOf(k)>-1)icon=emojiMap[k];});
      if(card.querySelector('.tn-card-emoji,.card-emoji'))return;
      var box=document.createElement('div');box.className='tn-card-emoji';box.setAttribute('aria-hidden','true');box.style.cssText='width:42px;height:42px;border-radius:12px;background:rgba(6,182,212,.1);border:1px solid rgba(6,182,212,.16);display:flex;align-items:center;justify-content:center;font-size:1.25rem;margin-bottom:.85rem;box-shadow:0 0 16px rgba(6,182,212,.08)';box.textContent=icon;card.insertBefore(box,card.firstChild);
    });
  }

  function cardHtml(t){return '<a class="tc-card rv on" href="'+t.href+'" data-cat="'+t.cat+'" data-name="'+t.name+'"><div class="card-emoji">'+t.icon+'</div><strong>'+t.title+'</strong><p style="font-size:.78rem;color:var(--t2);line-height:1.5;margin:.45rem 0">'+t.desc+'</p><div class="card-meta"><span style="font-size:.7rem;color:var(--t3);text-transform:uppercase">'+t.label+'</span><span class="offline-badge">Browser ✓</span></div></a>';}
  function addHomeTool(t){
    if(window.TOOLNEST_TOOLS&&!window.TOOLNEST_TOOLS.some(function(x){return x.href===t.href;}))window.TOOLNEST_TOOLS.unshift(t);
    var grid=document.getElementById('tool-grid');
    if(grid&&!document.querySelector('a[href="'+t.href+'"]'))grid.insertAdjacentHTML('afterbegin',cardHtml(t));
  }

  if(location.pathname==='/'||/index\.html$/.test(location.pathname)){
    document.title='ToolNest Studio | 40+ Free Browser-Powered AI Tools';
    var descTxt='40+ free browser-powered AI tools for writing, images, grammar, meta tags, HTML entities, CSS gradients, JWT decoding, cron expressions, regex testing, hash generation, URL encoding, Base64, tip calculation, random names, countdowns, Pomodoro timing, color palettes, QR codes, Markdown, JSON, word counting, lessons, thumbnails and more.';
    var homeDesc=document.querySelector('meta[name="description"]');if(homeDesc)homeDesc.setAttribute('content',descTxt);
    document.querySelectorAll('meta[property="og:title"],meta[name="twitter:title"]').forEach(function(m){m.setAttribute('content','ToolNest Studio | 40+ Free Browser-Powered AI Tools');});
    document.querySelectorAll('meta[property="og:description"],meta[name="twitter:description"]').forEach(function(m){m.setAttribute('content',descTxt);});
    document.querySelectorAll('body *').forEach(function(el){if(el.childElementCount===0&&el.textContent&&/(22\+|23\+|24\+|25\+|26\+|27\+|28\+|29\+|30\+|31\+|32\+|33\+|34\+|35\+|36\+|37\+|38\+|39\+)/.test(el.textContent)){el.textContent=el.textContent.replace(/22\+|23\+|24\+|25\+|26\+|27\+|28\+|29\+|30\+|31\+|32\+|33\+|34\+|35\+|36\+|37\+|38\+|39\+/g,'40+');}});
    var extraTools=[
      {href:'tools/meta-tag-generator.html',cat:'seo',label:'seo',name:'meta tag generator seo open graph twitter card json ld canonical robots',icon:'🏷️',title:'Meta Tag Generator',desc:'Generate SEO, Open Graph, Twitter Card and JSON-LD tags.',browser:true},
      {href:'tools/html-entity-encoder.html',cat:'developer',label:'developer',name:'html entity encoder decoder escape unescape developer',icon:'&lt;',title:'HTML Entity Encoder / Decoder',desc:'Encode and decode HTML entities safely.',browser:true},
      {href:'tools/css-gradient-generator.html',cat:'developer',label:'developer',name:'css gradient generator linear radial color developer design',icon:'🌈',title:'CSS Gradient Generator',desc:'Create CSS gradients with live preview and copyable code.',browser:true},
      {href:'tools/jwt-decoder.html',cat:'developer',label:'developer',name:'jwt decoder json web token claims header payload developer',icon:'🔑',title:'JWT Decoder',desc:'Decode JWT header, payload and common claims locally.',browser:true},
      {href:'tools/cron-expression-builder.html',cat:'developer',label:'developer',name:'cron expression builder schedule job developer',icon:'⏲️',title:'Cron Expression Builder',desc:'Build and explain cron expressions with run previews.',browser:true},
      {href:'tools/regex-tester.html',cat:'developer',label:'developer',name:'regex tester regular expression pattern match replace developer',icon:'.*',title:'Regex Tester',desc:'Test regex patterns with matches and replacement preview.',browser:true},
      {href:'tools/hash-generator.html',cat:'developer',label:'developer',name:'hash generator sha256 sha384 sha512 checksum developer',icon:'#',title:'Hash Generator',desc:'Generate SHA hashes and checksums from text.',browser:true},
      {href:'tools/url-encoder-decoder.html',cat:'developer',label:'developer',name:'url encoder decoder encode decode uri component query string',icon:'🔗',title:'URL Encoder / Decoder',desc:'Encode and decode URLs, URI components and query strings.',browser:true}
    ];
    for(var i=extraTools.length-1;i>=0;i--)addHomeTool(extraTools[i]);
    document.querySelectorAll('script[type="application/ld+json"]').forEach(function(s){try{var data=JSON.parse(s.textContent);if(data&&data.hasPart&&Array.isArray(data.hasPart)){data.description=descTxt;extraTools.slice().reverse().forEach(function(t){var url='https://toolneststudio.online/'+t.href;if(!data.hasPart.some(function(x){return x.url===url;}))data.hasPart.unshift({'@type':'WebApplication',position:1,name:t.title,url:url,applicationCategory:t.cat==='seo'?'UtilitiesApplication':'DeveloperApplication',operatingSystem:'Any'});});data.hasPart.forEach(function(x,i){x.position=i+1;});s.textContent=JSON.stringify(data);}}catch(e){}});
    var favs=safeParse(STORAGE.fav,[]),rec=safeParse(STORAGE.recent,[]);function shelf(title,items){if(!items.length)return'';return'<section class="tn-shelf"><div class="con"><div class="ey">'+title+'</div><div class="tn-shelf-grid">'+items.map(function(x){return'<a class="tn-mini-card" href="'+x.url+'"><strong>'+x.title+'</strong><span>'+x.url.replace('tools/','')+'</span></a>';}).join('')+'</div></div></section>';}
    var hero=document.querySelector('main section');if(hero&&!document.querySelector('.tn-shelf'))hero.insertAdjacentHTML('afterend',shelf('My Favorites',favs)+shelf('Recently Used',rec));restoreHomeVisuals();
  }

  if(location.pathname.indexOf('/tools/credit-card-generator.html')>-1){document.title='Payment Card Test Data Generator | ToolNest Studio';var cd=document.querySelector('meta[name="description"]');if(cd)cd.setAttribute('content','Generate fictional Luhn-valid payment card test numbers for software development and UI testing only.');document.querySelectorAll('h1 span.gt,.bc span,.tt').forEach(function(el){if(el.textContent.trim()==='Credit Card Generator')el.textContent='Payment Card Test Data Generator';});}

  var quick=document.createElement('div');quick.className='tn-quick';quick.innerHTML='<button type="button" data-tn-theme>☀️ Light</button>'+(isToolPage()?'<button type="button" data-tn-fav>☆ Favorite</button><button type="button" data-tn-share>↗ Share</button><button type="button" data-tn-up>👍</button><button type="button" data-tn-down>👎</button>':'');document.body.appendChild(quick);setTheme(localStorage.getItem(STORAGE.theme)||'dark');
  quick.querySelector('[data-tn-theme]').onclick=function(){setTheme((document.documentElement.getAttribute('data-theme')||'dark')==='dark'?'light':'dark');};
  if(isToolPage()){
    var favBtn=quick.querySelector('[data-tn-fav]'),favs=safeParse(STORAGE.fav,[]),cur={title:pageTitle(),url:pageUrl()};
    function syncFav(){var on=favs.some(function(x){return x.url===cur.url;});favBtn.textContent=on?'★ Favorited':'☆ Favorite';favBtn.classList.toggle('is-on',on);}syncFav();
    favBtn.onclick=function(){var on=favs.some(function(x){return x.url===cur.url;});favs=on?favs.filter(function(x){return x.url!==cur.url;}):[cur].concat(favs).slice(0,12);save(STORAGE.fav,favs);syncFav();toast(on?'Removed from favorites':'Added to favorites');};
    quick.querySelector('[data-tn-share]').onclick=function(){var u=location.href;if(navigator.share){navigator.share({title:pageTitle(),url:u}).catch(function(){});}else if(navigator.clipboard){navigator.clipboard.writeText(u);toast('Tool link copied');}};
    var ratings=safeParse(STORAGE.rating,{}),up=quick.querySelector('[data-tn-up]'),down=quick.querySelector('[data-tn-down]');function syncRating(){up.classList.toggle('is-on',ratings[cur.url]==='up');down.classList.toggle('is-on',ratings[cur.url]==='down');}up.onclick=function(){ratings[cur.url]=ratings[cur.url]==='up'?'':'up';save(STORAGE.rating,ratings);syncRating();toast('Thanks for the feedback');};down.onclick=function(){ratings[cur.url]=ratings[cur.url]==='down'?'':'down';save(STORAGE.rating,ratings);syncRating();toast('Thanks for the feedback');};syncRating();
  }
  document.addEventListener('keydown',function(e){var run=document.querySelector('[data-run],#qr-generate,#json-format,#wc-run,#md-render,#pal-generate,#pomo-start,#cd-start,#name-generate,#tip-calc,#b64-run,#url-run,#hash-run,#rx-run,#cron-run,#jwt-run,#grad-run,#ent-run,#meta-run');var clear=document.querySelector('[data-clear],#qr-clear,#json-clear,#wc-clear,#md-clear,#pal-reset,#pomo-reset,#cd-reset,#name-clear,#tip-clear,#b64-clear,#url-clear,#hash-clear,#rx-clear,#cron-clear,#jwt-clear,#grad-clear,#ent-clear,#meta-clear');if((e.ctrlKey||e.metaKey)&&e.key==='Enter'&&run){e.preventDefault();run.click();}if(e.key==='Escape'&&clear){clear.click();}});
  if(window.matchMedia('(pointer:fine)').matches){var d=document.getElementById('cd'),r=document.getElementById('cr');if(d&&r){d.style.display=r.style.display='block';var mx=0,my=0,rx=0,ry=0;document.addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;d.style.left=mx+'px';d.style.top=my+'px';});(function t(){rx+=(mx-rx)*.11;ry+=(my-ry)*.11;r.style.left=rx+'px';r.style.top=ry+'px';requestAnimationFrame(t);})();var over=function(){r.style.width='48px';r.style.height='48px';r.style.borderColor='rgba(6,182,212,.8)';d.style.background='#8b5cf6';},out=function(){r.style.width='34px';r.style.height='34px';r.style.borderColor='rgba(6,182,212,.5)';d.style.background='#06b6d4';};document.querySelectorAll('a,button,input,select,textarea,label,[role=button]').forEach(function(el){el.addEventListener('mouseenter',over);el.addEventListener('mouseleave',out);});}}
  var nav=document.getElementById('tnav');if(nav)window.addEventListener('scroll',function(){nav.classList.toggle('sc',scrollY>40);},{passive:true});
  if(window.matchMedia('(prefers-reduced-motion:reduce)').matches){document.querySelectorAll('.rv').forEach(function(el){el.classList.add('on');});return;}
  var obs=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('on');obs.unobserve(e.target);}});},{threshold:.07,rootMargin:'0px 0px -28px 0px'});document.querySelectorAll('.rv').forEach(function(el){obs.observe(el);});
})();
