/* Efectos visuales de LM Global: cabecera viva, luces que siguen al cursor,
   inclinación 3D, botones magnéticos, cielo estrellado y apariciones al hacer scroll. */

const reduceQuery=matchMedia('(prefers-reduced-motion: reduce)');
const fineQuery=matchMedia('(hover: hover) and (pointer: fine)');
export const reducedMotion=()=>reduceQuery.matches;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

/* ---------- Aparición al entrar en pantalla ---------- */
let revealObserver;
export function observeReveals(root=document){
  const items=root.querySelectorAll('[data-reveal]:not(.in)');
  if(!('IntersectionObserver' in window)){
    for(const item of items)item.classList.add('in');
    return;
  }
  revealObserver??=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  },{threshold:.08,rootMargin:'0px 0px -4% 0px'});
  for(const item of items)revealObserver.observe(item);
}

/* ---------- Contador animado ---------- */
export function countTo(element,value,{duration=1600,format=String}={}){
  if(reducedMotion()){
    element.textContent=format(value);
    return;
  }
  const start=performance.now();
  const tick=now=>{
    const progress=Math.min(1,(now-start)/duration);
    element.textContent=format(Math.round(value*(1-Math.pow(1-progress,4))));
    if(progress<1)requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------- Cabecera: estado, progreso, sección activa y parallax del hero ---------- */
function initScroll(){
  const header=document.getElementById('siteHeader');
  const progress=header.querySelector('.nav-progress');
  const hero=document.querySelector('.hero');
  const parallax=hero.querySelector('.hero-parallax');
  const fading=[...hero.querySelectorAll('h1,.hero-description')];
  const navLinks=header.querySelector('.nav-links');
  const indicator=navLinks.querySelector('.nav-indicator');
  const spyLinks=[...document.querySelectorAll('[data-spy]')];
  const sections=[{id:'inicio',element:hero},...['rutas','mapa','como-funciona','asesoria'].map(id=>({id,element:document.getElementById(id)}))].filter(section=>section.element);
  let heroHeight=hero.offsetHeight, active='', ticking=false;

  const moveIndicator=link=>{
    if(!link||!link.offsetWidth){
      indicator.classList.remove('on');
      return;
    }
    indicator.style.setProperty('--x',link.offsetLeft+'px');
    indicator.style.setProperty('--w',link.offsetWidth+'px');
    indicator.classList.add('on');
  };
  const activeNavLink=()=>navLinks.querySelector('a.active');

  const update=()=>{
    ticking=false;
    const y=window.scrollY;
    const max=document.documentElement.scrollHeight-window.innerHeight;
    header.classList.toggle('scrolled',y>48);
    progress.style.transform='scaleX('+(max>0?clamp(y/max,0,1):0).toFixed(4)+')';

    if(!reducedMotion()&&y<=heroHeight){
      const ratio=y/heroHeight;
      parallax.style.transform='translate3d(0,'+(ratio*heroHeight*.22).toFixed(1)+'px,0)';
      for(const element of fading)element.style.opacity=clamp(1-ratio*1.7,0,1).toFixed(3);
    }

    const line=window.innerHeight*.42;
    let current=sections[0].id;
    for(const section of sections){
      if(section.element.getBoundingClientRect().top<=line)current=section.id;
    }
    if(max>0&&y>=max-2)current=sections.at(-1).id;
    if(current!==active){
      active=current;
      for(const link of spyLinks){
        const on=link.dataset.spy===active;
        link.classList.toggle('active',on);
        if(on)link.setAttribute('aria-current','true');
        else link.removeAttribute('aria-current');
      }
      moveIndicator(activeNavLink());
    }
  };
  const request=()=>{
    if(ticking)return;
    ticking=true;
    requestAnimationFrame(update);
  };
  addEventListener('scroll',request,{passive:true});
  addEventListener('resize',()=>{
    heroHeight=hero.offsetHeight;
    moveIndicator(activeNavLink());
    request();
  });
  navLinks.addEventListener('pointerover',event=>{
    const link=event.target.closest('a');
    if(link)moveIndicator(link);
  });
  navLinks.addEventListener('pointerleave',()=>moveIndicator(activeNavLink()));
  navLinks.addEventListener('focusin',event=>moveIndicator(event.target.closest('a')));
  navLinks.addEventListener('focusout',()=>moveIndicator(activeNavLink()));
  document.fonts?.ready.then(()=>moveIndicator(activeNavLink()));
  update();
}

/* ---------- Cursor: resplandor, foco de luz, inclinación 3D e imanes ---------- */
function initPointer(){
  if(!fineQuery.matches)return;
  const glow=document.querySelector('.cursor-glow');
  const hero=document.querySelector('.hero');
  const heroPointer=hero.querySelector('.hero-pointer');
  let glowX=innerWidth/2, glowY=innerHeight/3, targetX=glowX, targetY=glowY, frame=0;
  let tilted=null, magnet=null;

  const follow=()=>{
    glowX+=(targetX-glowX)*.14;
    glowY+=(targetY-glowY)*.14;
    glow.style.transform='translate3d('+glowX.toFixed(1)+'px,'+glowY.toFixed(1)+'px,0)';
    frame=Math.abs(targetX-glowX)+Math.abs(targetY-glowY)>.5?requestAnimationFrame(follow):0;
  };
  const releaseTilt=()=>{
    if(!tilted)return;
    tilted.classList.remove('is-tilting');
    tilted.style.setProperty('--rx','0deg');
    tilted.style.setProperty('--ry','0deg');
    tilted=null;
  };
  const releaseMagnet=()=>{
    if(!magnet)return;
    magnet.classList.remove('is-magnet');
    magnet.style.setProperty('--tx','0px');
    magnet.style.setProperty('--ty','0px');
    magnet=null;
  };

  document.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch')return;
    const x=event.clientX, y=event.clientY;
    const target=event.target instanceof Element?event.target:null;
    targetX=x;
    targetY=y;
    glow.classList.add('on');
    if(!frame)frame=requestAnimationFrame(follow);

    const spot=target?.closest('.spot');
    if(spot){
      const rect=spot.getBoundingClientRect();
      spot.style.setProperty('--mx',Math.round(x-rect.left)+'px');
      spot.style.setProperty('--my',Math.round(y-rect.top)+'px');
    }
    if(reducedMotion())return;

    const tilt=target?.closest('.tilt')??null;
    if(tilt!==tilted)releaseTilt();
    if(tilt){
      const rect=tilt.getBoundingClientRect();
      const amount=Number(tilt.dataset.tilt)||5;
      tilted=tilt;
      tilt.classList.add('is-tilting');
      tilt.style.setProperty('--ry',(((x-rect.left)/rect.width-.5)*amount*2).toFixed(2)+'deg');
      tilt.style.setProperty('--rx',((.5-(y-rect.top)/rect.height)*amount*2).toFixed(2)+'deg');
    }

    const pull=target?.closest('.magnetic')??null;
    if(pull!==magnet)releaseMagnet();
    if(pull){
      const rect=pull.getBoundingClientRect();
      magnet=pull;
      pull.classList.add('is-magnet');
      pull.style.setProperty('--tx',((x-rect.left-rect.width/2)*.2).toFixed(1)+'px');
      pull.style.setProperty('--ty',((y-rect.top-rect.height/2)*.3).toFixed(1)+'px');
    }

    if(window.scrollY<hero.offsetHeight){
      const dx=x/innerWidth-.5, dy=y/innerHeight-.5;
      heroPointer.style.transform='translate3d('+(-dx*26).toFixed(1)+'px,'+(-dy*16).toFixed(1)+'px,0)';
    }
  },{passive:true});

  document.documentElement.addEventListener('pointerleave',()=>{
    releaseTilt();
    releaseMagnet();
    glow.classList.remove('on');
  });
}

/* ---------- Cielo: estrellas que titilan y alguna estrella fugaz ---------- */
function initStars(){
  const canvas=document.querySelector('.hero-stars');
  if(!canvas)return;
  const context=canvas.getContext('2d');
  let stars=[], width=0, height=0, ratio=1, frame=0, last=0, visible=true;
  let meteor=null, nextMeteor=performance.now()+4200;

  const build=()=>{
    const rect=canvas.getBoundingClientRect();
    ratio=Math.min(2,window.devicePixelRatio||1);
    width=rect.width;
    height=rect.height;
    canvas.width=Math.round(width*ratio);
    canvas.height=Math.round(height*ratio);
    let seed=11;
    const random=()=>(seed=seed*16807%2147483647)/2147483647;
    const total=Math.round(clamp(width/7,46,190));
    stars=[];
    for(let guard=0;stars.length<total&&guard<total*30;guard++){
      const x=random(), y=random()*.36;
      /* Más densas arriba a la izquierda, lejos del atardecer y del avión. */
      if(random()>Math.max(.1,1-.5*x-1.9*y))continue;
      stars.push({x:x*width,y:y*height,radius:.4+random()*random()*1.3,alpha:.28+random()*.62,phase:random()*6.283,speed:.5+random()*1.7,warm:random()>.8});
    }
    draw(performance.now());
  };

  const draw=now=>{
    context.setTransform(ratio,0,0,ratio,0,0);
    context.clearRect(0,0,width,height);
    const still=reducedMotion();
    for(const star of stars){
      const twinkle=still?.85:.5+.5*Math.sin(now/1000*star.speed+star.phase);
      context.globalAlpha=star.alpha*twinkle;
      context.fillStyle=star.warm?'#ffe2ae':'#eaf3ff';
      context.beginPath();
      context.arc(star.x,star.y,star.radius,0,6.283);
      context.fill();
      if(star.radius>1.3){
        context.globalAlpha=star.alpha*twinkle*.5;
        context.fillRect(star.x-star.radius*3.2,star.y-.3,star.radius*6.4,.6);
        context.fillRect(star.x-.3,star.y-star.radius*3.2,.6,star.radius*6.4);
      }
    }
    if(meteor){
      const progress=(now-meteor.start)/meteor.duration;
      if(progress>=1)meteor=null;
      else{
        const headX=meteor.x+meteor.dx*progress, headY=meteor.y+meteor.dy*progress;
        const tailX=headX-meteor.dx*.2, tailY=headY-meteor.dy*.2;
        const gradient=context.createLinearGradient(tailX,tailY,headX,headY);
        gradient.addColorStop(0,'rgba(255,255,255,0)');
        gradient.addColorStop(1,'rgba(255,240,214,.95)');
        context.globalAlpha=Math.sin(progress*Math.PI);
        context.strokeStyle=gradient;
        context.lineWidth=1.4;
        context.lineCap='round';
        context.beginPath();
        context.moveTo(tailX,tailY);
        context.lineTo(headX,headY);
        context.stroke();
      }
    }
    context.globalAlpha=1;
  };

  const loop=now=>{
    frame=0;
    if(!visible)return;
    if(now-last>32){
      last=now;
      if(!meteor&&now>nextMeteor){
        meteor={start:now,duration:950,x:width*(.06+Math.random()*.42),y:height*(.03+Math.random()*.14),dx:width*.16+90,dy:height*.09+30};
        nextMeteor=now+7000+Math.random()*9000;
      }
      draw(now);
    }
    frame=requestAnimationFrame(loop);
  };
  const start=()=>{
    if(!frame&&visible&&!reducedMotion())frame=requestAnimationFrame(loop);
  };

  if('ResizeObserver' in window)new ResizeObserver(build).observe(canvas);
  else build();
  if('IntersectionObserver' in window){
    new IntersectionObserver(entries=>{
      visible=entries[0].isIntersecting;
      start();
    }).observe(canvas);
  }
  reduceQuery.addEventListener?.('change',()=>{
    draw(performance.now());
    start();
  });
  start();
}

/* ---------- Cinta de destinos: acelera con el scroll ---------- */
function initMarquee(){
  const track=document.getElementById('marquee');
  if(!track||reducedMotion()||!track.getAnimations)return;
  let animation=null, rate=1, lastY=window.scrollY, frame=0;
  const settle=()=>{
    rate+=(1-rate)*.07;
    if(Math.abs(rate-1)<.03)rate=1;
    animation.updatePlaybackRate(rate);
    frame=rate===1?0:requestAnimationFrame(settle);
  };
  addEventListener('scroll',()=>{
    animation??=track.getAnimations()[0]??null;
    const y=window.scrollY;
    const delta=Math.abs(y-lastY);
    lastY=y;
    if(!animation)return;
    rate=Math.min(7,rate+delta*.02);
    if(!frame)frame=requestAnimationFrame(settle);
  },{passive:true});
}

/* ---------- Descanso: pausa las animaciones continuas de las zonas que no se ven ---------- */
function initRest(){
  if(!('IntersectionObserver' in window))return;
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries)entry.target.classList.toggle('offscreen',!entry.isIntersecting);
  },{rootMargin:'80px'});
  for(const zone of document.querySelectorAll('.hero,.marquee,.steps-grid,.contact,.footer'))observer.observe(zone);
}

export function initFx(){
  initRest();
  initScroll();
  initPointer();
  initStars();
  initMarquee();
  observeReveals();
}
