
(function(){
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
