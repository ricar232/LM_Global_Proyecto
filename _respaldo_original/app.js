import {routes,months,contacts} from './routes.js';

const $=id=>document.getElementById(id);
const filters=$('filters'), origin=$('origin'), destination=$('destination'), month=$('month');
const dialog=$('detail'), empty=$('empty');
const quoteDate=$('quoteDate'), quoteOffer=$('quoteOffer'), quoteAdvisor=$('quoteAdvisor');
const money=new Intl.NumberFormat('es-ES',{useGrouping:'always'});
const dateFormat=new Intl.DateTimeFormat('es',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
const formatDate=key=>dateFormat.format(new Date(key+'T00:00:00Z'));
let quoteRoute, optionsByDate;
const mainRoutes=new Set(['habana-guyana','habana-moscu','moscu-habana']);

function fillOptions(select,items,placeholder){
  select.replaceChildren();
  if(placeholder)select.add(new Option(placeholder,''));
  for(const [value,label] of items)select.add(new Option(label,value));
}
const cities=key=>[...new Set(routes.map(route=>route[key]))].map(value=>[value,value]);
fillOptions(origin,cities('from'),'Todos los orígenes');
fillOptions(destination,cities('to'),'Todos los destinos');
fillOptions(month,Object.entries(months),'Cualquier mes');
fillOptions(quoteAdvisor,contacts.map(person=>[person.number,person.name]));

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
$('featured-price').textContent=fare(lowest(routes.find(route=>route.id==='habana-guyana').offers));
const greeting='Hola, LM Global. Quisiera consultar fechas y disponibilidad para un vuelo.';
$('contacts').innerHTML=contacts.map(person=>'<a class="contact-link" target="_blank" rel="noopener noreferrer" href="'+whatsapp(person.number,greeting)+'"><span>'+person.name+'<small>'+person.display+'</small></span><span>WhatsApp →</span></a>').join('');

function render(){
  const matches=routes.filter(route=>
    (!origin.value||route.from===origin.value)&&
    (!destination.value||route.to===destination.value)&&visibleOffers(route).length);
  $('count').textContent=matches.length+(matches.length===1?' ruta':' rutas');
  empty.hidden=matches.length>0;
  $('results').innerHTML=matches.map(route=>{
    const offer=lowest(visibleOffers(route));
    const foreign=offer.usd?'<span class="usd">'+money.format(offer.usd)+' USD</span>':'';
    const details=[route.connection,route.airline].filter(Boolean).join(' · ');
    const visual=matches.length<4||mainRoutes.has(route.id);
    const path='<span class="route-country">'+route.fromCountry+' → '+route.toCountry+'</span>';
    const media=visual?'<span class="route-media"><img loading="lazy" src="./assets/'+route.image+'.webp" alt="">'+path+'</span>':'';
    return '<article class="route-card glass '+(visual?'visual':'compact')+'"><button type="button" data-route="'+route.id+'" aria-label="Ver tarifas de '+route.from+' a '+route.to+'">'+media+
      '<span class="route-info"><span class="route-text">'+(visual?'':path)+'<span class="route-title">'+route.from+'<span aria-hidden="true"> → </span>'+route.to+'</span>'+
      (details?'<span class="route-meta">'+details+'</span>':'')+
      '<span class="route-price"><small>Desde</small>'+fare(offer)+foreign+'</span></span><span class="circle-arrow" aria-hidden="true">→</span></span></button></article>';
  }).join('');
}
function displayDays(days){
  if(days.length>=5&&days.every((day,index)=>day===days[0]+index))return 'Del '+days[0]+' al '+days.at(-1);
  return (days.length===1?'Día ':'Días ')+days.join(', ');
}
function updateQuoteOffers(){
  const offered=optionsByDate.get(quoteDate.value);
  fillOptions(quoteOffer,offered.map((offer,index)=>[String(index),fare(offer)+' · '+(offer.baggage??'Equipaje a consultar')]));
  updateQuoteLink();
}
function updateQuoteLink(){
  const selected=optionsByDate.get(quoteDate.value)[Number(quoteOffer.value)];
  const bag=selected.baggage?' con equipaje '+selected.baggage:'';
  const text='Hola, LM Global. Quisiera consultar el vuelo de '+quoteRoute.from+' a '+quoteRoute.to+' para el '+formatDate(quoteDate.value)+'. Vi la tarifa de '+fare(selected)+bag+'. ¿Me confirman disponibilidad y precio final?';
  $('quoteLink').href=whatsapp(quoteAdvisor.value,text);
}
function showDetail(route,allMonths){
  $('detailKicker').textContent=route.fromCountry+' → '+route.toCountry;
  $('detailTitle').textContent=route.from+' → '+route.to;
  const service=[route.connection,route.airline].filter(Boolean).join(' · ');
  $('detailConnection').textContent=service;
  $('detailConnection').hidden=!service;
  const offers=allMonths?route.offers:visibleOffers(route);
  const season=[...new Set(offers.map(offer=>offer.month))];
  $('detailBody').innerHTML=season.map(value=>
    '<section class="month-section"><h3>'+months[value]+'</h3>'+
    offers.filter(offer=>offer.month===value).map(offer=>
      '<div class="offer"><span class="dates">'+displayDays(offer.days)+'</span><strong>'+fare(offer)+(offer.usd?'<small>'+money.format(offer.usd)+' USD</small>':'')+'</strong>'+
      '<span class="baggage">'+(offer.baggage?'Equipaje '+offer.baggage:'Equipaje a consultar')+'</span></div>').join('')+'</section>'
  ).join('')+
  '<div class="conditions"><h3>Incluye según la oferta</h3><ul>'+route.included.map(item=>'<li>'+item+'</li>').join('')+'</ul>'+
  (route.terms.length?'<p class="rules">'+route.terms.join(' · ')+'</p>':'')+
  '<p class="muted">Confirma con un asesor la disponibilidad y las condiciones para tu fecha.</p></div>';

  quoteRoute=route;
  optionsByDate=new Map();
  for(const offer of offers){
    for(const day of offer.days){
      const key=offer.month+'-'+String(day).padStart(2,'0');
      if(!optionsByDate.has(key))optionsByDate.set(key,[]);
      optionsByDate.get(key).push(offer);
    }
  }
  fillOptions(quoteDate,[...optionsByDate.keys()].sort().map(date=>[date,formatDate(date)]));
  updateQuoteOffers();
  dialog.showModal();
  dialog.scrollTop=0;
}
filters.addEventListener('submit',event=>{event.preventDefault();render();$('routes-title').scrollIntoView({block:'start'});});
for(const select of [origin,destination,month])select.addEventListener('change',render);
$('clear').addEventListener('click',()=>{filters.reset();render();$('routes-title').focus({preventScroll:true});});
document.addEventListener('click',event=>{
  const button=event.target.closest('button[data-route]');
  if(button)showDetail(routes.find(route=>route.id===button.dataset.route),button.hasAttribute('data-all-months'));
});
quoteDate.addEventListener('change',updateQuoteOffers);
for(const select of [quoteOffer,quoteAdvisor])select.addEventListener('change',updateQuoteLink);
$('close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const rect=dialog.getBoundingClientRect();
  if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();
});
render();
