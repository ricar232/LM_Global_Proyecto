import {routes,months,contacts} from './routes.js';
import {initFx,observeReveals,countTo,reducedMotion} from './fx.js';
import {createGlobe} from './globe.js';

const $=id=>document.getElementById(id);
const filters=$('filters'), origin=$('origin'), destination=$('destination'), month=$('month');
const dialog=$('detail'), empty=$('empty'), results=$('results');
const money=new Intl.NumberFormat('es-ES',{useGrouping:'always'});
const dateFormat=new Intl.DateTimeFormat('es',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
const shortDateFormat=new Intl.DateTimeFormat('es',{day:'numeric',month:'short',timeZone:'UTC'});
const shortMonthFormat=new Intl.DateTimeFormat('es',{month:'short',year:'numeric',timeZone:'UTC'});
const weekdayFormat=new Intl.DateTimeFormat('es',{weekday:'long',timeZone:'UTC'});
const toDate=key=>new Date(key+'T00:00:00Z');
const formatDate=key=>dateFormat.format(toDate(key));
const pad=value=>String(value).padStart(2,'0');
const capitalize=text=>text.charAt(0).toUpperCase()+text.slice(1);
const now=new Date();
const todayKey=now.getFullYear()+'-'+pad(now.getMonth()+1)+'-'+pad(now.getDate());
const mainRoutes=new Set(['habana-guyana','habana-moscu','moscu-habana']);

const escapes={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};
const esc=value=>String(value).replace(/[&<>"']/g,char=>escapes[char]);
const icon=name=>'<svg class="icon" aria-hidden="true"><use href="#i-'+name+'"/></svg>';

function fillOptions(select,items,placeholder){
  select.replaceChildren();
  if(placeholder)select.add(new Option(placeholder,''));
  for(const [value,label] of items)select.add(new Option(label,value));
}
const cities=key=>[...new Set(routes.map(route=>route[key]))].map(value=>[value,value]);
fillOptions(origin,cities('from'),'Todos los orígenes');
fillOptions(destination,cities('to'),'Todos los destinos');
fillOptions(month,Object.entries(months),'Cualquier mes');

function whatsapp(number,message){
  return 'https://wa.me/'+number+'?text='+encodeURIComponent(message);
}
function fare(offer){
  return money.format(offer.rub)+' RUB';
}
function lowest(offers){
  return offers.reduce((best,current)=>current.rub<best.rub?current:best);
}
function visibleOffers(route){
  return route.offers.filter(offer=>!month.value||offer.month===month.value);
}
function offerDates(offers){
  return [...new Set(offers.flatMap(offer=>offer.days.map(day=>offer.month+'-'+pad(day))))].sort();
}
function initials(name){
  const words=name.split(/\s+/).filter(Boolean);
  return (words[0].charAt(0)+(words.length>1?words.at(-1).charAt(0):'')).toUpperCase();
}
const dateCount=total=>total+(total===1?' fecha':' fechas');
const shortDay=key=>shortDateFormat.format(toDate(key)).replace('.','');

/* ---------- Hero: ruta destacada y cifras ---------- */
function fillFeatured(){
  const route=routes.find(item=>item.id===$('featured').dataset.route);
  if(!route)return;
  const offer=lowest(route.offers);
  const details=[route.connection,route.airline].filter(Boolean).join(' · ');
  const next=offerDates(route.offers).find(date=>date>=todayKey);
  $('featuredFrom').textContent=route.from;
  $('featuredTo').textContent=route.to;
  $('featured-price').textContent=fare(offer);
  $('featuredUsd').textContent=offer.usd?money.format(offer.usd)+' USD':'';
  $('featuredMeta').innerHTML=details?icon('route')+'<span>'+esc(details)+'</span>':'';
  $('featuredMeta').hidden=!details;
  $('featuredNext').textContent=next?'Próxima salida · '+shortDay(next):'';
  $('featuredNext').hidden=!next;
}
function fillStats(){
  const figures=[
    ['statRoutes',routes.length],
    ['statCountries',new Set(routes.flatMap(route=>[route.fromCountry,route.toCountry])).size],
    ['statDates',routes.reduce((total,route)=>total+offerDates(route.offers).length,0)]
  ];
  for(const [id,value] of figures)$(id).textContent=value;
  if(reducedMotion())return;
  setTimeout(()=>{
    for(const [id,value] of figures)countTo($(id),value);
  },1050);
}

/* ---------- Tarjetas de rutas ---------- */
const crops=['50% 14%','50% 48%','50% 84%'];
function cardHtml(route,index,visual,crop,animate,oddLast){
  const offers=visibleOffers(route);
  const offer=lowest(offers);
  const usd=offer.usd?'<span class="usd">'+money.format(offer.usd)+' USD</span>':'';
  const chips='<span class="rc-top"><span class="chip">'+icon('pin')+esc(route.fromCountry)+' → '+esc(route.toCountry)+'</span>'+
    '<span class="chip">'+icon('calendar')+dateCount(offerDates(offers).length)+'</span></span>';
  const title='<span class="rc-title">'+esc(route.from)+'<i aria-hidden="true">→</i>'+esc(route.to)+'</span>';
  const details=[route.connection&&icon('route')+esc(route.connection),route.airline&&icon('plane')+esc(route.airline)].filter(Boolean);
  const meta=details.length?'<span class="rc-meta">'+details.map(item=>'<span>'+item+'</span>').join('')+'</span>':'';
  const foot='<span class="rc-foot"><span class="rc-price"><small>Desde</small><b>'+money.format(offer.rub)+'<i>RUB</i></b>'+usd+'</span>'+
    '<span class="go" aria-hidden="true">'+icon('arrow-up-right')+'</span></span>';
  const image=position=>'<img loading="lazy" decoding="async" src="./assets/'+esc(route.image)+'.webp" alt=""'+(position?' style="object-position:'+position+'"':'')+'>';
  const open='<article class="route-card '+(visual?'visual':'compact')+(oddLast?' odd-last':'')+' spot tilt" data-tilt="'+(visual?4:3)+'"'+(animate?' data-reveal':'')+
    ' style="--i:'+index+'">'+
    '<button type="button" data-route="'+esc(route.id)+'" aria-label="Ver tarifas de '+esc(route.from)+' a '+esc(route.to)+'">';
  if(visual){
    return open+'<span class="rc-media">'+image()+'</span><span class="rc-shade"></span><span class="rc-light"></span><span class="rc-sheen"></span>'+
      chips+'<span class="rc-plate">'+title+meta+foot+'</span></button></article>';
  }
  return open+'<span class="rc-backdrop">'+image(crops[crop%crops.length])+'</span><span class="rc-light"></span>'+
    chips+'<span class="rc-body">'+title+'</span>'+foot+'</button></article>';
}
function render(animate=false){
  const matches=routes.filter(route=>
    (!origin.value||route.from===origin.value)&&
    (!destination.value||route.to===destination.value)&&visibleOffers(route).length);
  $('count').textContent=matches.length+(matches.length===1?' ruta':' rutas');
  empty.hidden=matches.length>0;
  $('reset').hidden=!(origin.value||destination.value||month.value);
  results.dataset.total=matches.length;
  /* Con cuatro rutas o más, las principales llevan foto y el resto va en tarjetas compactas. */
  const visuals=matches.map(route=>matches.length<4||mainRoutes.has(route.id));
  const compacts=visuals.filter(visual=>!visual).length;
  let crop=0;
  results.innerHTML=matches.map((route,index)=>{
    const position=visuals[index]?0:crop++;
    const oddLast=!visuals[index]&&compacts%2===1&&position===compacts-1;
    return cardHtml(route,index,visuals[index],position,animate,oddLast);
  }).join('');
  if(animate)observeReveals(results);
}
/* Al filtrar, cada tarjeta viaja a su nueva posición (View Transitions, si el navegador las ofrece). */
let filterTransition=null;
function nameCards(named){
  for(const card of results.children){
    card.style.viewTransitionName=named?'route-'+card.firstElementChild.dataset.route:'';
  }
}
function update(){
  if(!document.startViewTransition||reducedMotion()){
    render();
    return;
  }
  nameCards(true);
  const transition=filterTransition=document.startViewTransition(()=>{
    render();
    nameCards(true);
  });
  transition.finished.catch(()=>{}).then(()=>{
    if(filterTransition!==transition)return;
    filterTransition=null;
    nameCards(false);
  });
}

/* ---------- Ficha de la ruta: calendario de salidas y consulta ---------- */
const sheet={route:null,byDate:new Map(),months:[],month:'',date:'',offer:0,advisor:contacts[0].number,lowest:0,varied:false};

function arcSvg(){
  const path='M8 40 Q110 -16 212 40';
  return '<svg class="arc" viewBox="0 0 220 48" aria-hidden="true" focusable="false"><path class="arc-line" d="'+path+'"/>'+
    '<circle class="arc-dot" cx="8" cy="40" r="3.2"/><circle class="arc-dot" cx="212" cy="40" r="3.2"/>'+
    '<g class="arc-plane"><use href="#i-plane" x="-9" y="-9" width="18" height="18" transform="rotate(90)"/>'+
    '<animateMotion dur="4.6s" repeatCount="indefinite" rotate="auto" calcMode="spline" keyTimes="0;1" keySplines=".5 0 .5 1" path="'+path+'"/>'+
    '<animate attributeName="opacity" dur="4.6s" repeatCount="indefinite" values="0;1;1;0" keyTimes="0;.1;.9;1"/></g></svg>';
}
function monthLabel(key){
  return capitalize(shortMonthFormat.format(toDate(key+'-01')).replace('.',''));
}
function renderMonths(){
  $('monthTabs').innerHTML=sheet.months.map(key=>
    '<button type="button" data-month="'+key+'" aria-pressed="'+(key===sheet.month)+'" title="'+esc(months[key]??key)+'">'+esc(monthLabel(key))+'</button>').join('');
}
function renderCalendar(){
  const [year,monthNumber]=sheet.month.split('-').map(Number);
  const offset=(new Date(Date.UTC(year,monthNumber-1,1)).getUTCDay()+6)%7;
  const length=new Date(Date.UTC(year,monthNumber,0)).getUTCDate();
  const available=[];
  for(let day=1;day<=length;day++){
    if(sheet.byDate.has(sheet.month+'-'+pad(day)))available.push(day);
  }
  const focusDay=sheet.date.startsWith(sheet.month)?Number(sheet.date.slice(8)):available[0];
  let html='';
  for(let blank=0;blank<offset;blank++)html+='<span class="day" aria-hidden="true"></span>';
  for(let day=1;day<=length;day++){
    const key=sheet.month+'-'+pad(day);
    const offers=sheet.byDate.get(key);
    if(!offers){
      html+='<span class="day" aria-hidden="true"><b>'+day+'</b></span>';
      continue;
    }
    const price=Math.min(...offers.map(offer=>offer.rub));
    const best=sheet.varied&&price===sheet.lowest;
    html+='<button type="button" class="day'+(best?' low':'')+'" data-date="'+key+'" aria-pressed="'+(key===sheet.date)+'" tabindex="'+(day===focusDay?0:-1)+'"'+
      ' aria-label="'+esc(formatDate(key))+', desde '+money.format(price)+' RUB'+(best?', mejor precio':'')+'"><b>'+day+'</b><small>'+Math.round(price/1000)+'k</small></button>';
  }
  const grid=$('calendarDays');
  grid.innerHTML=html;
  grid.setAttribute('aria-label',months[sheet.month]??sheet.month);
  grid.style.animation='none';
  void grid.offsetWidth;
  grid.style.animation='';
}
function updateQuoteLink(){
  const selected=sheet.byDate.get(sheet.date)[sheet.offer];
  const bag=selected.baggage?' con equipaje '+selected.baggage:'';
  const text='Hola, LM Global. Quisiera consultar el vuelo de '+sheet.route.from+' a '+sheet.route.to+' para el '+formatDate(sheet.date)+'. Vi la tarifa de '+fare(selected)+bag+'. ¿Me confirman disponibilidad y precio final?';
  $('quoteLink').href=whatsapp(sheet.advisor,text);
}
function renderQuote(){
  const offers=sheet.byDate.get(sheet.date);
  $('quoteDate').innerHTML='<small>'+esc(capitalize(weekdayFormat.format(toDate(sheet.date))))+'</small>'+esc(formatDate(sheet.date));
  $('quoteOffers').innerHTML=offers.map((offer,index)=>
    '<label class="offer"><input type="radio" name="quoteOffer" value="'+index+'"'+(index===sheet.offer?' checked':'')+'>'+
    '<span class="offer-text"><span class="offer-price"><b>'+fare(offer)+'</b>'+(offer.usd?'<small>'+money.format(offer.usd)+' USD</small>':'')+'</span>'+
    '<span class="offer-bag">'+icon('luggage')+(offer.baggage?'<span class="sr-only">Equipaje </span>'+esc(offer.baggage):'Equipaje a consultar')+'</span></span></label>').join('');
  updateQuoteLink();
}
function selectDate(key){
  sheet.date=key;
  sheet.offer=0;
  for(const button of $('calendarDays').querySelectorAll('button[data-date]')){
    const on=button.dataset.date===key;
    button.setAttribute('aria-pressed',String(on));
    button.tabIndex=on?0:-1;
  }
  renderQuote();
}
function showDetail(route,allMonths){
  const offers=allMonths?route.offers:visibleOffers(route);
  const service=[route.connection&&icon('route')+esc(route.connection),route.airline&&icon('plane')+esc(route.airline)].filter(Boolean);
  sheet.route=route;
  sheet.byDate=new Map();
  for(const offer of offers){
    for(const day of offer.days){
      const key=offer.month+'-'+pad(day);
      if(!sheet.byDate.has(key))sheet.byDate.set(key,[]);
      sheet.byDate.get(key).push(offer);
    }
  }
  const dates=[...sheet.byDate.keys()].sort();
  sheet.months=[...new Set(dates.map(date=>date.slice(0,7)))];
  sheet.lowest=lowest(offers).rub;
  sheet.varied=offers.some(offer=>offer.rub!==sheet.lowest);
  sheet.date=dates.find(date=>date>=todayKey)??dates[0];
  sheet.month=sheet.date.slice(0,7);
  sheet.offer=0;

  $('detailKicker').textContent=route.fromCountry+' → '+route.toCountry;
  $('detailTitle').innerHTML='<span>'+esc(route.from)+'</span><span class="sr-only"> → </span>'+arcSvg()+'<span>'+esc(route.to)+'</span>';
  $('detailChips').innerHTML=[...service,icon('calendar')+dateCount(dates.length),icon('sparkle')+'Desde '+fare(lowest(offers))]
    .map(item=>'<span class="chip">'+item+'</span>').join('');
  $('detailImage').src='./assets/'+route.image+'.webp';
  $('detailConditions').innerHTML='<div><h3>'+icon('check')+'Incluye según la oferta</h3><ul class="included">'+
    route.included.map(item=>'<li>'+icon('check')+'<span>'+esc(item)+'</span></li>').join('')+'</ul></div>'+
    (route.terms.length?'<div class="terms">'+route.terms.map(term=>'<span class="chip">'+icon('info')+esc(term)+'</span>').join('')+'</div>':'')+
    '<p class="conditions-note">Confirma con un asesor la disponibilidad y las condiciones para tu fecha.</p>';
  $('bestLegend').hidden=!sheet.varied;
  renderMonths();
  renderCalendar();
  renderQuote();
  dialog.showModal();
  $('sheetScroll').scrollTop=0;
}

/* En pantallas amplias, la foto de la tarjeta crece hasta convertirse en la cabecera de la ficha. */
const roomy=matchMedia('(min-width: 761px)');
function openRoute(button,route,allMonths){
  const media=button.querySelector('.rc-media,.rc-backdrop');
  if(!media||!document.startViewTransition||reducedMotion()||!roomy.matches){
    showDetail(route,allMonths);
    return;
  }
  const parts=[[$('detailPhoto'),'route-photo'],[$('detailHead'),'route-head'],[$('close'),'route-close']];
  media.style.viewTransitionName='route-photo';
  dialog.classList.add('morph');
  const transition=document.startViewTransition(async()=>{
    media.style.viewTransitionName='';
    for(const [element,name] of parts)element.style.viewTransitionName=name;
    showDetail(route,allMonths);
    await $('detailImage').decode?.().catch(()=>{});
  });
  transition.finished.catch(()=>{}).then(()=>{
    media.style.viewTransitionName='';
    for(const [element] of parts)element.style.viewTransitionName='';
    dialog.classList.remove('morph');
  });
}

$('quoteAdvisors').innerHTML=contacts.map((person,index)=>
  '<label class="advisor"><input type="radio" name="quoteAdvisor" value="'+esc(person.number)+'"'+(index===0?' checked':'')+'>'+
  '<span class="avatar" aria-hidden="true">'+esc(initials(person.name))+'</span><b>'+esc(person.name)+'</b></label>').join('');

/* ---------- Contacto ---------- */
const greeting='Hola, LM Global. Quisiera consultar fechas y disponibilidad para un vuelo.';
$('contacts').innerHTML=contacts.map(person=>
  '<a class="advisor-card" target="_blank" rel="noopener noreferrer" href="'+whatsapp(person.number,greeting)+'">'+
  '<span class="avatar" aria-hidden="true">'+esc(initials(person.name))+'</span>'+
  '<span class="advisor-info"><b>'+esc(person.name)+'</b><small>'+esc(person.display)+'</small></span>'+
  '<span class="advisor-cta">'+icon('whatsapp')+'WhatsApp'+icon('arrow-up-right')+'</span></a>').join('');

/* ---------- Cinta de destinos ---------- */
function fillMarquee(){
  const names=[...new Set(routes.flatMap(route=>[route.from,route.to]))];
  const loop=names.length%2?[...names,...names]:names;
  const half=loop.map((name,index)=>'<span'+(index%2?' class="outline"':'')+'>'+esc(name)+icon('plane')+'</span>').join('');
  $('marquee').innerHTML=half+half;
}

/* ---------- Mapa de rutas ---------- */
function initNetwork(){
  const list=$('netList'), card=$('netCard'), section=$('mapa');
  const globe=createGlobe($('globe'),{routes,still:reducedMotion});
  const mapped=routes.filter(route=>globe.has(route.id));
  if(!mapped.length){
    section.hidden=true;
    return;
  }
  const cycle=5200;
  let current='', timer=0, hovering=false, onScreen=false;

  list.style.setProperty('--cycle',cycle+'ms');
  list.innerHTML=mapped.map((route,index)=>
    '<li data-reveal style="--i:'+(index+3)+'"><button type="button" class="net-item" data-net="'+esc(route.id)+'" aria-pressed="false">'+
    '<span class="net-name">'+esc(route.from)+'<i aria-hidden="true">→</i>'+esc(route.to)+'</span>'+
    '<span class="net-price">desde <b>'+fare(lowest(route.offers))+'</b></span><span class="net-bar"></span></button></li>').join('');

  const select=id=>{
    const route=mapped.find(item=>item.id===id);
    if(!route)return;
    current=id;
    for(const button of list.querySelectorAll('.net-item'))button.setAttribute('aria-pressed',String(button.dataset.net===id));
    $('netCardKicker').textContent=route.fromCountry+' → '+route.toCountry;
    $('netCardTitle').textContent=route.from+' → '+route.to;
    $('netCardPrice').textContent='Desde '+fare(lowest(route.offers));
    $('netCardButton').dataset.route=id;
    card.classList.remove('swap');
    void card.offsetWidth;
    card.classList.add('swap');
    globe.setActive(id);
  };
  const schedule=()=>{
    clearTimeout(timer);
    const running=onScreen&&!hovering&&!reducedMotion();
    list.classList.toggle('cycling',running);
    if(!running)return;
    timer=setTimeout(()=>{
      if(globe.dragging){
        schedule();
        return;
      }
      const index=mapped.findIndex(route=>route.id===current);
      select(mapped[(index+1)%mapped.length].id);
      schedule();
    },cycle);
  };
  const pause=state=>{
    if(hovering===state)return;
    hovering=state;
    schedule();
  };

  list.addEventListener('click',event=>{
    const button=event.target.closest('.net-item');
    if(!button)return;
    select(button.dataset.net);
    schedule();
  });
  list.addEventListener('pointerover',event=>{
    const button=event.target.closest('.net-item');
    if(button&&event.pointerType!=='touch'&&button.dataset.net!==current)select(button.dataset.net);
  });
  section.addEventListener('pointerenter',()=>pause(true));
  section.addEventListener('pointerleave',()=>pause(false));
  section.addEventListener('focusin',()=>pause(true));
  section.addEventListener('focusout',()=>pause(false));
  if('IntersectionObserver' in window){
    new IntersectionObserver(entries=>{
      onScreen=entries[0].isIntersecting;
      schedule();
    },{threshold:.25}).observe(section);
  }
  select(mapped[0].id);
}

/* ---------- Eventos ---------- */
filters.addEventListener('submit',event=>{
  event.preventDefault();
  update();
  $('routes-title').scrollIntoView({block:'start'});
});
for(const select of [origin,destination,month])select.addEventListener('change',update);
const clearFilters=()=>{
  filters.reset();
  update();
  $('routes-title').focus({preventScroll:true});
};
$('clear').addEventListener('click',clearFilters);
$('reset').addEventListener('click',clearFilters);

document.addEventListener('click',event=>{
  const button=event.target.closest('button[data-route]');
  if(!button)return;
  const route=routes.find(item=>item.id===button.dataset.route);
  if(route)openRoute(button,route,button.hasAttribute('data-all-months'));
});

dialog.addEventListener('click',event=>{
  const day=event.target.closest('button[data-date]');
  if(day){
    selectDate(day.dataset.date);
    return;
  }
  const tab=event.target.closest('button[data-month]');
  if(tab){
    sheet.month=tab.dataset.month;
    for(const button of $('monthTabs').children)button.setAttribute('aria-pressed',String(button===tab));
    renderCalendar();
    return;
  }
  if(event.target!==dialog)return;
  const rect=dialog.getBoundingClientRect();
  if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();
});
dialog.addEventListener('change',event=>{
  if(event.target.name==='quoteOffer')sheet.offer=Number(event.target.value);
  else if(event.target.name==='quoteAdvisor')sheet.advisor=event.target.value;
  else return;
  updateQuoteLink();
});
$('calendarDays').addEventListener('keydown',event=>{
  const current=event.target.closest('button[data-date]');
  if(!current)return;
  const buttons=[...$('calendarDays').querySelectorAll('button[data-date]')];
  const index=buttons.indexOf(current);
  const dayOf=button=>Number(button.dataset.date.slice(8));
  let next;
  if(event.key==='ArrowRight')next=buttons[index+1];
  else if(event.key==='ArrowLeft')next=buttons[index-1];
  else if(event.key==='ArrowDown')next=buttons.find(button=>dayOf(button)===dayOf(current)+7)??buttons[index+1];
  else if(event.key==='ArrowUp')next=buttons.find(button=>dayOf(button)===dayOf(current)-7)??buttons[index-1];
  else if(event.key==='Home')next=buttons[0];
  else if(event.key==='End')next=buttons.at(-1);
  else return;
  event.preventDefault();
  next?.focus();
});
$('close').addEventListener('click',()=>dialog.close());

/* ---------- Inicio ---------- */
fillFeatured();
fillStats();
fillMarquee();
render(true);
initNetwork();
initFx();
window.lmReady=true;
