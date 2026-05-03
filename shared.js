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
