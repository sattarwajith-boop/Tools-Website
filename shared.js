(function(){
  // Global design-token fallback for pages that use var(--r-lg).
  document.documentElement.style.setProperty('--r-lg','22px');

  // Remove duplicate Contact text link when the highlighted Contact CTA exists.
  document.querySelectorAll('nav .nls').forEach(function(list){
    var contactLinks=[].slice.call(list.querySelectorAll('a[href$="contact.html"]'));
    var cta=contactLinks.find(function(a){return a.classList.contains('nc');});
    if(cta){
      contactLinks.forEach(function(a){
        if(a!==cta && a.textContent.trim().toLowerCase()==='contact'){
          var li=a.closest('li');
          if(li) li.remove();
        }
      });
    }
  });

  // Keep footer copyright year current across static pages.
  document.querySelectorAll('.fbot span:first-child').forEach(function(el){
    if(/©\s*\d{4}\s*ToolNest Studio\./.test(el.textContent)){
      el.textContent='© '+new Date().getFullYear()+' ToolNest Studio.';
    }
  });

  // Homepage upgrade: show the new QR tool and updated 23+ count without risky full-page rewrites.
  if(location.pathname==='/' || /index\.html$/.test(location.pathname)){
    document.title='ToolNest Studio | 23+ Free Browser-Powered AI Tools';
    var homeDesc=document.querySelector('meta[name="description"]');
    if(homeDesc) homeDesc.setAttribute('content','23+ free browser-powered AI tools for writing, images, grammar, QR codes, lessons, thumbnails and more.');
    document.querySelectorAll('meta[property="og:title"],meta[name="twitter:title"]').forEach(function(m){m.setAttribute('content','ToolNest Studio | 23+ Free Browser-Powered AI Tools');});
    document.querySelectorAll('meta[property="og:description"],meta[name="twitter:description"]').forEach(function(m){m.setAttribute('content','23+ free browser-powered AI tools for writing, images, grammar, QR codes, lessons, thumbnails and more.');});
    document.querySelectorAll('body *').forEach(function(el){
      if(el.childElementCount===0 && el.textContent && el.textContent.indexOf('22+')>-1){
        el.textContent=el.textContent.replace(/22\+/g,'23+');
      }
    });
    var toolsGrid=document.querySelector('#tools .con > div[style*="grid-template-columns"]') || document.querySelector('#tools div[style*="grid-template-columns"]');
    if(toolsGrid && !document.querySelector('a[href="tools/qr-code-generator.html"]')){
      var card=document.createElement('a');
      card.className='tc-card rv on';
      card.href='tools/qr-code-generator.html';
      card.setAttribute('data-cat','utilities');
      card.setAttribute('data-name','qr code generator url text vcard barcode download png');
      card.innerHTML='<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:.85rem"><div style="width:42px;height:42px;border-radius:11px;background:rgba(6,182,212,.1);border:1px solid rgba(6,182,212,.15);display:flex;align-items:center;justify-content:center;font-size:1.2rem">▦</div><span style="padding:.18rem .55rem;border-radius:5px;font-size:.66rem;font-weight:700;color:var(--em);background:rgba(16,185,129,.1);border-color:rgba(16,185,129,.2)">New</span></div><div style="font-weight:700;font-size:.94rem;margin-bottom:.38rem;color:var(--t)">QR Code Generator</div><div style="font-size:.78rem;color:var(--t2);line-height:1.5;margin-bottom:.875rem">Create QR codes from URLs or text and download as PNG.</div><div style="display:flex;align-items:center;justify-content:space-between"><span style="font-size:.7rem;color:var(--t3);font-weight:600;text-transform:uppercase;letter-spacing:.05em">utilities</span><span style="font-size:.76rem;font-weight:700;color:var(--cy)">Open →</span></div>';
      toolsGrid.insertBefore(card,toolsGrid.firstChild);
    }
  }

  // Safer public-facing wording for fictional payment-card test data.
  if(location.pathname.indexOf('/tools/credit-card-generator.html')>-1){
    document.title='Payment Card Test Data Generator | ToolNest Studio';
    var desc=document.querySelector('meta[name="description"]');
    if(desc) desc.setAttribute('content','Generate fictional Luhn-valid payment card test numbers for software development and UI testing only.');
    document.querySelectorAll('h1 span.gt,.bc span,.tt').forEach(function(el){
      if(el.textContent.trim()==='Credit Card Generator') el.textContent='Payment Card Test Data Generator';
    });
    document.querySelectorAll('p').forEach(function(p){
      p.innerHTML=p.innerHTML
        .replace(/Generate test card numbers that pass Luhn validation for Visa, Mastercard, Amex, and Discover\. For UI and software testing only — not real cards\./g,'Generate fictional payment card test numbers that pass Luhn validation for Visa, Mastercard, Amex, and Discover. For UI and software testing only — not real payment cards.')
        .replace(/All numbers generated here are <strong>fictional test data only<\/strong>\. They pass Luhn checksum validation but are NOT real credit cards, cannot be used for purchases, and have no financial value\. For software development and UI testing only\./g,'All numbers generated here are <strong>fictional test data only</strong>. They pass Luhn checksum validation but are NOT real payment cards, cannot be used for purchases, and have no financial value. For software development and UI testing only.');
    });
  }

  // cursor
  if(window.matchMedia('(pointer:fine)').matches){
    const d=document.getElementById('cd'),r=document.getElementById('cr');
    if(d&&r){
      d.style.display=r.style.display='block';
      let mx=0,my=0,rx=0,ry=0;
      document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;d.style.left=mx+'px';d.style.top=my+'px'});
      (function t(){rx+=(mx-rx)*.11;ry+=(my-ry)*.11;r.style.left=rx+'px';r.style.top=ry+'px';requestAnimationFrame(t)})();
      const o=()=>{r.style.width='48px';r.style.height='48px';r.style.borderColor='rgba(6,182,212,.8)';d.style.background='#8b5cf6'};
      const l=()=>{r.style.width='34px';r.style.height='34px';r.style.borderColor='rgba(6,182,212,.5)';d.style.background='#06b6d4'};
      document.querySelectorAll('a,button,input,select,textarea,label,[role=button]').forEach(el=>{el.addEventListener('mouseenter',o);el.addEventListener('mouseleave',l)});
    }
  }
  // nav
  const nav=document.getElementById('tnav');
  if(nav)window.addEventListener('scroll',()=>nav.classList.toggle('sc',scrollY>40),{passive:true});
  // reveal
  if(window.matchMedia('(prefers-reduced-motion:reduce)').matches){
    document.querySelectorAll('.rv').forEach(el=>el.classList.add('on'));return;
  }
  const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');obs.unobserve(e.target)}}),{threshold:.07,rootMargin:'0px 0px -28px 0px'});
  document.querySelectorAll('.rv').forEach(el=>obs.observe(el));
})();
