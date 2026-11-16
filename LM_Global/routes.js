const range = (first, last) => Array.from({length:last-first+1}, (_,i)=>i+first);
const offer = (month, days, rub, usd, baggage) => ({month,days,rub,usd,baggage});
const guyana = ['Boleto de ida y vuelta verificado','Formulario de entrada a Guyana','Reserva de hotel confirmada','Asesoramiento personalizado'];
export const months = {'2026-11':'Noviembre 2026','2026-12':'Diciembre 2026','2027-01':'Enero 2027'};
export const contacts = [
  {name:'Mario S. Tarragó',number:'79259042235',display:'+7 925 904-22-35'},
  {name:'Ilianet Bermúdez',number:'79933522469',display:'+7 993 352-24-69'}
];
export const routes = [
  {
    id:'habana-guyana',from:'La Habana',to:'Guyana',fromCountry:'Cuba',toCountry:'Guyana',image:'guyana',
    connection:'Escala en Santo Domingo',airline:'SKYhigh',included:guyana,
    terms:['No reembolsable','No transferible','No modificable'],
    offers:[
      offer('2026-11',[26,29],103980,1350,'7 + 23 kg'),
      offer('2026-12',[3,6,10,13,17,20,24,27,31],103980,1350,'7 + 23 kg')
    ]
  },
  {
    id:'habana-moscu',from:'La Habana',to:'Moscú',fromCountry:'Cuba',toCountry:'Rusia',image:'moscu',
    connection:'Vía Panamá, Estambul y Dubái',
    included:['Visado indicado en la oferta','Boleto de retorno verificable','Asesoramiento personalizado durante el viaje'],
    terms:[],
    offers:[
      offer('2026-11',[25,26,27,28,30],173400,2252,null),
      offer('2026-12',[1,2,3,6,7,9,10,11,12,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,30,31],173400,2252,null)
    ]
  },
  {
    id:'moscu-habana',from:'Moscú',to:'La Habana',fromCountry:'Rusia',toCountry:'Cuba',image:'habana',
    connection:'Escalas en Estambul y Panamá',included:['Formulario de viajero incluido'],terms:[],
    offers:[
      offer('2026-12',[7,13,31],119980,1558,'4 + 8 + 23 kg'),
      offer('2026-12',[7,13,31],127980,1662,'4 + 8 + 23 + 23 kg'),
      offer('2026-12',[6],120980,1571,'4 + 8 + 23 kg'),
      offer('2026-12',[6],128980,1675,'4 + 8 + 23 + 23 kg'),
      offer('2026-12',[10,11,15,23,24,28,29],138980,null,'4 + 8 + 23 kg'),
      offer('2026-12',[10,11,15,23,24,28,29],146980,null,'4 + 8 + 23 + 23 kg'),
      offer('2027-01',range(5,31),120590,1566,'4 + 8 + 23 kg'),
      offer('2027-01',range(5,31),128980,1675,'4 + 8 + 23 + 23 kg')
    ]
  },
  {
    id:'moscu-guyana',from:'Moscú',to:'Guyana',fromCountry:'Rusia',toCountry:'Guyana',image:'guyana',
    included:guyana,terms:['No reembolsable'],
    offers:[
      offer('2026-12',[23,24,29],166980,2168,'4 + 8 + 23 kg'),
      offer('2026-12',[28,31],182980,null,'4 + 8 + 23 kg')
    ]
  },
  {
    id:'kazan-guyana',from:'Kazán',to:'Guyana',fromCountry:'Rusia',toCountry:'Guyana',image:'guyana',
    included:guyana,terms:['No reembolsable'],
    offers:[
      offer('2026-11',[27,30],191980,2493,'4 + 8 + 23 kg'),
      offer('2026-12',[2,4],186980,null,'4 + 8 + 23 kg'),
      offer('2026-12',[7],189980,null,'4 + 8 + 23 kg'),
      offer('2026-12',[9],181980,null,'4 + 8 + 23 kg'),
      offer('2026-12',[23,24,29],166980,null,'4 + 8 + 23 kg')
    ]
  },
  {
    id:'tashkent-guyana',from:'Tashkent',to:'Guyana',fromCountry:'Uzbekistán',toCountry:'Guyana',image:'guyana',
    included:guyana,terms:['No reembolsable'],
    offers:[
      offer('2026-11',[26],198980,null,'4 + 8 + 23 kg'),
      offer('2026-11',[27],166980,null,'4 + 8 + 23 kg'),
      offer('2026-11',[28],187980,null,'4 + 8 + 23 kg'),
      offer('2026-12',[3,8],179980,null,'4 + 8 + 23 kg'),
      offer('2026-12',[5],161980,null,'4 + 8 + 23 kg'),
      offer('2026-12',[15],187980,null,'4 + 8 + 23 kg')
    ]
  }
];
