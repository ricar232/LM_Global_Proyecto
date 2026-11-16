/* Globo de puntos con las rutas de LM Global. Canvas 2D, sin dependencias. */

const RAD=Math.PI/180, TAU=Math.PI*2;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const unit=(lat,lon)=>{
  const cos=Math.cos(lat*RAD);
  return [cos*Math.sin(lon*RAD),Math.sin(lat*RAD),cos*Math.cos(lon*RAD)];
};
const shortAngle=angle=>{
  angle=(angle+Math.PI)%TAU;
  if(angle<0)angle+=TAU;
  return angle-Math.PI;
};

/* Coordenadas de las ciudades de routes.js. Una ciudad nueva necesita su entrada aquí
   para aparecer en el globo; "label" indica a qué lado se escribe el nombre. */
export const PLACES={
  'La Habana':{lat:23.11,lon:-82.37,label:'left'},
  'Moscú':{lat:55.75,lon:37.62,label:'left'},
  'Guyana':{lat:6.8,lon:-58.16,label:'right'},
  'Kazán':{lat:55.8,lon:49.11,label:'right'},
  'Tashkent':{lat:41.3,lon:69.24,label:'right'}
};

/* Contornos muy simplificados [lon,lat,…]. Solo sirven para decidir qué puntos son tierra. */
const LAND=[
  /* Norteamérica y Centroamérica */
  [-168,65.6,-166.8,68.3,-160,70.6,-156.5,71.3,-148.5,70.3,-141,69.6,-134,69.5,-128,70.4,-124,69.4,-116,68.9,-114.5,67.8,-108.5,67.6,-102,68,-96.5,68.3,-96.5,70,-94.6,71.9,-92,70.3,-90,68.6,-87,67.5,-85.5,69.3,-82,69.7,-81.4,68.5,-81.8,66.8,-86,66.4,-87.5,64.5,-90.7,63.4,-94,61.1,-94.3,58.8,-92.6,57,-87.6,56,-82.3,55.2,-82.2,53,-80.6,51.3,-79,51.5,-79,53.8,-79.7,54.6,-77.8,55.3,-76.6,56.6,-78.1,58.5,-77.3,60,-77.9,62.5,-75.7,62.2,-72,61.6,-69.9,60.9,-69.6,59.3,-68.3,58.6,-66,58.8,-64.8,60.4,-61.7,56.5,-60.2,55.4,-57,53.7,-55.7,52.1,-60,50.2,-66.5,50.2,-64.3,48.8,-64.8,47,-64,46,-60,46.2,-63.5,44.6,-66,43.7,-67.2,44.6,-69,44,-70.2,43.6,-70,41.8,-74,40.6,-74.9,38.9,-76,37.1,-75.5,35.2,-78,33.9,-79.9,32.7,-81.4,30.3,-80.5,28.4,-80.1,25.8,-81,25.1,-81.8,26.1,-82.8,27.8,-83,29.1,-84.2,30.1,-85.4,29.7,-87.2,30.3,-89.3,29.2,-91.3,29.5,-94.8,29.3,-97.2,27.8,-97.2,25.9,-97.8,22.3,-96.1,19.2,-94.4,18.2,-92.5,18.6,-90.6,19.9,-90.4,21,-87,21.6,-86.8,21.1,-87.4,20.2,-88,18.4,-88.2,17.5,-88.9,15.9,-86.8,15.8,-85.9,16,-83.2,15,-83.7,12,-83.7,10.9,-82.2,9.3,-79.9,9.4,-78.5,9.5,-77.4,8.7,-77.9,7.2,-78.2,8.3,-79.5,8.9,-80.4,7.4,-82.9,8.1,-83.6,8.5,-85.8,10.6,-87.6,13,-89.8,13.6,-92.2,14.5,-95.2,16.2,-96.5,15.7,-99.9,16.8,-104.3,19,-105.7,20.4,-105.3,21.5,-106.4,23.2,-109.9,22.9,-112.1,24.6,-115,27.8,-115.8,30.4,-117.2,32.7,-118.5,34,-120.5,34.5,-121.9,36.6,-122.5,37.8,-124.4,40.4,-124.5,42.8,-124,46.2,-124.7,48.4,-125.5,48.8,-128.3,50.8,-128,52,-130.4,54.3,-133.5,55.5,-136,58,-139.8,59.5,-144,60,-146,60.5,-149.5,59.9,-151.9,59.2,-153.5,58.6,-156,57,-159.5,55.6,-162.5,54.9,-164.8,54.4,-162,55.9,-158.6,56.9,-157,58.8,-158.5,58.9,-162.2,58.6,-162.5,60,-165.5,61.5,-165,63,-162,63.5,-160.8,63.9,-161,64.6,-165.4,64.5],
  /* Ártico canadiense */
  [-66,62,-62,66.6,-67,69,-72,71.5,-80,73.7,-88,73.6,-85,70.5,-78,69.6,-74,68,-77.5,65,-72,63.6],
  [-117,69,-104,68.6,-101.5,71.5,-108,73.2,-118,72.6],
  [-125,71.6,-116,72,-117,74.3,-124,74.2],
  [-90,76.5,-76,76.6,-62,82,-70,83.1,-90,81.5],
  [-59.3,47.6,-53.2,46.6,-52.7,47.6,-53.6,49.3,-55.6,51.5,-57.6,50.6,-59,48.4],
  /* Groenlandia e Islandia */
  [-73,78.2,-66,80.5,-58,82.2,-40,83.5,-25,83,-18,80.5,-19,77,-21,73.5,-23,70.3,-27,68.5,-33,67.5,-40,65.2,-42.5,62,-44,59.9,-48,60.9,-51,63.5,-53.5,66.5,-54,69.5,-56,72.5,-58,75.5,-66,76.2,-70,77.5],
  [-24.3,65.5,-22.3,66.4,-18,66.3,-14.6,66.3,-13.6,65,-15,64.2,-18.5,63.4,-22.6,63.8],
  /* Caribe */
  [-84.9,21.9,-83.2,22.9,-82.3,23.2,-80.5,23.1,-78,22.3,-76.1,21.2,-74.2,20.2,-75.5,19.9,-77.7,19.85,-77.2,20.7,-78.6,21.5,-80.5,22.05,-82,22.6,-83.5,22.2],
  [-74.5,18.4,-73,19.9,-70,19.9,-68.4,18.6,-70.5,18.2,-71.7,17.7],
  [-78.4,18.4,-76.2,18.3,-76.3,17.8,-77.9,17.8],
  [-67.2,18.5,-65.6,18.4,-65.8,17.95,-67.2,17.95],
  /* Sudamérica */
  [-77.4,8.7,-75.5,10.5,-74.8,11.1,-71.7,12.4,-70,12.1,-68,10.6,-64,10.4,-62,10.7,-60.5,8.6,-58.2,6.9,-55,6,-52.3,4.9,-50.5,1.8,-50,0,-48,-0.7,-44.3,-2.5,-40,-2.8,-37,-4.7,-35.2,-5.5,-34.9,-8,-37,-11,-38.5,-13,-39,-17,-40.3,-20.3,-42,-23,-44.5,-23.2,-48.5,-25.8,-48.6,-28.3,-52.1,-32.2,-53.5,-34,-56.5,-34.9,-58.4,-34,-57,-36.4,-57.6,-38.1,-62,-39,-65,-41,-63.6,-42.7,-65.5,-45,-67.5,-46.5,-65.8,-47.8,-68.5,-50.3,-68.4,-52.4,-65.2,-54.7,-67.3,-55.9,-71,-54.5,-74.5,-52,-75.5,-48.5,-74.5,-45,-73.8,-41.8,-73.5,-37.2,-71.6,-33,-71.5,-29.9,-70.4,-23.5,-70.3,-18.4,-71.4,-17.6,-75.2,-15.4,-76.3,-13.8,-77.2,-12,-79,-8,-81.2,-6,-81.3,-4.6,-80,-3.3,-81,-2.2,-80.1,0.1,-78.9,1.6,-77.2,3.9,-77.5,6.7,-77.9,7.2],
  /* Europa y Asia */
  [-9,37,-9.5,38.7,-8.8,41.2,-9.3,43,-8,43.7,-4,43.5,-1.8,43.4,-1.2,44.6,-1.2,46.2,-2.4,47.2,-4.7,48.4,-3,48.8,-1.6,48.65,-1.9,49.7,0.1,49.5,1.6,50.9,3.4,51.4,4.2,52.1,4.8,53,6.9,53.5,8.6,53.9,8.3,55.5,8.1,56.6,8.6,57.1,10.6,57.75,10.3,56.5,9.8,55.5,10,54.5,10.9,54,12.1,54.2,14.2,53.95,16.2,54.3,18.6,54.45,19.9,54.6,21.1,55.7,21,56.9,21.6,57.6,22.6,57.7,24.1,57.05,24.4,58.35,23.5,58.8,24.7,59.5,28,59.5,30,59.9,28.5,60.5,25,60.15,22.9,59.85,22.3,60.45,21.5,61.3,21.3,62.3,21.5,63.1,23.1,63.85,25.4,65,24.4,65.8,22.2,65.6,21.2,64.7,20.4,63.75,18.8,63.3,17.4,62.4,17.2,60.7,18.8,59.8,18.6,59.3,17.1,58.7,16.7,57.75,16.4,56.65,15.6,56.15,13.8,55.4,12.95,55.55,12.7,56.05,12.8,56.65,11.9,57.7,11.1,58.9,10.7,59.9,10,59,8,58.1,7.05,58,5.6,58.95,5,60.4,5,61.6,6.1,62.5,7.7,63.1,9.5,64,11.2,64.85,14.3,67.3,16.5,68.8,18.9,69.7,23.7,70.7,25.8,71.15,31.1,70.35,33.5,69.4,37,68.7,39.8,68.1,41.2,66.9,38,66.1,32.4,67.15,34.8,65,34.8,64.5,38,63.9,40.5,64.6,40,65.5,42.5,66.4,44,66,43.8,67.2,43.3,68.65,46,68.4,46.5,67,48.5,67.7,53,68.8,57.5,68.7,60.5,69.7,64.5,69.2,66.8,68.3,66.8,70.5,68.5,72.5,70,73.3,75,73,80.5,73.5,86.5,75,93,76.1,100,76.5,104.3,77.7,107,76.7,113,75.5,113,74.2,114,73.6,119.8,73,126,73.9,129.5,72.9,129,71.6,133,71.5,136.5,71.6,140.7,72.9,150,71.6,152.6,70.9,161.5,69.6,170.3,69.7,180,68.9,180,65,177.5,64.7,179.2,62.3,174.5,61.8,170.3,59.9,166,60.35,163.5,59,163,57.8,162.5,56.2,161.9,54.6,158.7,53,156.7,50.9,155.6,53,155.6,55.5,156.7,57.5,159.8,59.2,163.5,61.8,160.3,61.5,157,61.5,155,59.5,150.8,59.55,148,59.3,143.2,59.35,140.5,58,138.2,56.45,135.2,54.7,137.5,53.8,141.3,53.1,140.8,51.5,140.3,49,138.6,46.5,135.3,43.7,133,42.8,131.9,43.1,130.8,42.6,129.8,41.8,127.6,39.8,128.6,38,129.4,36,129.1,35.1,127.7,34.7,126.3,34.7,126.6,36,126.6,37.5,124.7,38.1,125.2,38.7,124.3,39.9,121.6,38.9,122.2,40.7,121,40.9,119.6,39.9,117.8,39,119,37.7,120.8,37.8,122.5,37.4,120.4,36.1,119.3,34.8,120.9,33,121.9,31.5,122,29.9,120.9,28,119.7,26,118.1,24.5,116.7,23.3,114.2,22.3,111.9,21.7,110.5,21.1,110.2,20.3,109.1,21.5,106.8,20.8,105.8,18.7,107.7,16.5,108.3,16.1,109.3,13.8,109.3,11.9,107.1,10.4,106.6,9.6,104.8,8.6,105,10,104.2,10.6,103.5,10.6,102.5,12.2,101.3,12.7,100.5,13.5,100,12.6,99.2,10.5,99.4,9.2,100,8.4,100.6,7.2,101.9,6.4,102.3,6.2,103.2,5.3,103.4,3.8,103.9,2.4,104.1,1.35,102.2,2.2,101.3,3,100.3,5.4,100,6.6,99.4,7.4,98.3,7.9,98.6,10,98.6,12.4,98.1,14,97.8,15.3,97.6,16.5,96.3,16.5,95.2,15.8,94.3,16,94.3,18.5,92.9,20.1,92,21.4,91.8,22.3,90.6,22.5,89,21.7,88,21.7,87,21.3,86.7,20.3,85.8,19.8,83.3,17.7,82.3,16.9,81.2,15.9,80.1,14.4,80.3,13.1,79.8,11.9,79.85,10.3,79,9.3,78.2,8.8,77.55,8.08,76.9,8.5,76.2,9.95,75.8,11.25,74.8,12.9,73.9,15.4,73.3,17,72.8,19,72.8,20.4,72.7,21.2,72.6,22.2,72.2,21.8,71,20.7,70.4,20.9,69.6,21.6,69,22.2,68.7,23.2,67.4,24,67,24.85,64.6,25.2,62.3,25.1,60.6,25.3,57.8,25.6,56.9,27,56.3,27.2,54.9,26.55,52.6,27.5,50.8,28.9,50.2,30,48.8,30,48,29.4,48.5,28.4,49.7,27,50.2,26.4,50.6,25.2,50.8,24.8,50.8,25.6,51.25,26.15,51.6,25.3,51.6,24.3,52.6,24.2,54.4,24.5,55.3,25.3,56,25.9,56.4,26.35,56.4,25.1,56.75,24.35,58.6,23.6,59.8,22.5,58.5,20.4,57.7,19.6,57.8,19,56.5,18,54.1,17,52.2,16.2,49.1,14.5,45,12.8,43.5,12.7,43.25,13.3,42.95,14.8,42.55,16.9,41.1,19.1,39.15,21.5,38,24.1,36.45,26.2,35.7,27.35,34.75,28.4,35,29.5,34.5,28.5,34.25,27.73,33.6,28.25,32.55,29.95,32.3,31.25,33.8,31.15,34.45,31.5,35,32.8,35.5,33.9,35.8,35.5,36.15,36.6,34.6,36.8,32.85,36.05,30.7,36.85,29.3,36.25,28.25,36.8,27.4,37,26.3,38.3,26.7,39.3,26.2,40,25.9,40.85,24.4,40.9,24,40.1,22.9,40.6,23,39.3,24.03,37.65,23.2,36.45,22.5,36.4,21.7,36.8,21.7,38.25,20.75,38.95,20.2,39.5,19.4,40.45,19.45,41.3,19.1,42.1,18.1,42.65,16.45,43.5,15.2,44.1,14.4,45.3,13.85,44.85,13.75,45.65,12.3,45.4,12.5,44.9,12.6,44.05,13.5,43.6,14.2,42.45,16.2,41.9,16.9,41.1,18,40.65,18.35,39.8,17.2,40.5,17.1,39.1,16.05,37.93,15.65,38.1,16,39.35,14.75,40.65,14.2,40.8,13.6,41.2,12.2,41.75,10.5,42.9,10.3,43.5,9.8,44.1,8.9,44.4,7.8,43.8,7.3,43.7,5.9,43.1,5.35,43.3,4.6,43.35,3.7,43.4,3.05,42.7,3.3,42.3,2.2,41.4,1.25,41.1,0.85,40.7,-0.3,39.5,0.2,38.75,-0.5,38.35,-0.95,37.6,-2.2,36.75,-4.4,36.7,-5.35,36.15,-5.6,36,-6.3,36.5,-6.95,37.2,-7.9,37],
  [-180,68.9,-175,67.5,-170,66,-172.5,64.4,-176,64.6,-180,65],
  /* Islas de Europa */
  [-5.5,50.1,-3.5,50.4,-1,50.7,1.3,51.1,1.7,52.7,0.3,53,0,53.6,-1.5,55,-2,56,-2,57.7,-3.3,58.6,-5,58.6,-6.2,57.3,-5.6,55.4,-4.8,54.8,-3.2,54,-3,53.4,-4.5,53.3,-4.2,52.3,-5.2,51.8,-3.2,51.4,-4.5,51],
  [-10,51.8,-8,51.6,-6.2,52.2,-6,53.4,-5.6,54.6,-6.5,55.2,-8.3,55.2,-10,54.2,-9.5,53],
  [12.4,38,15.6,38.2,15.1,36.7,12.5,37.6],
  [8.2,39,9.7,39.2,9.6,41.2,8.2,40.8],
  [8.6,41.4,9.5,41.5,9.5,43,8.7,42.4],
  [23.6,35.3,26.3,35.2,24.8,34.9],
  [32.3,34.7,33.6,35.4,34.6,35.6,33.9,34.95],
  [51.7,71.5,53.5,73,56,74.8,61,76.3,68.5,77,66,75.9,60.5,75,57.5,73.5,57,72,54.5,70.7,52.5,70.8],
  [11,79.6,16,80,21,80.4,27,80,23,78,18,76.9,14,77.4,12,78.4],
  /* África */
  [-5.9,35.8,-2.9,35.3,-1,35.8,3.1,36.8,7.8,36.9,9.8,37.3,11,37.1,10.6,35.5,10.8,34.7,10.1,33.9,11.1,33.2,13.2,32.9,15.2,32.4,17.5,31,19,30.3,20.1,32.1,21.7,32.9,24,32.1,25.2,31.6,27.5,31.2,29.9,31.2,32.3,31.25,32.55,29.95,33.8,27.2,35.5,23.9,37.2,21,37.3,19.5,38.6,18,39.5,15.6,41.2,14.6,43.3,12,43.1,11.6,45,10.4,48.5,11.2,51.3,11.8,51.4,10.4,49,7,48.5,5.4,45.3,2,42.5,-0.4,40.1,-2.6,39.7,-4,39.3,-6.8,40.6,-10.7,40.7,-15,39,-16.9,36.9,-17.9,34.9,-19.8,35.5,-23.8,32.9,-25.9,32.1,-28.8,31,-29.9,27.9,-33,25.6,-34,20,-34.8,18.4,-34.2,18.3,-31.7,16.5,-28.6,14.5,-22.9,11.75,-17.25,13.5,-12.4,13.2,-8.8,12.3,-6,11.9,-4.8,8.7,-0.6,9.45,0.4,9.7,4,8.5,4.5,6,4.3,3.4,6.4,1.2,6.1,-2.1,4.7,-4,5.3,-7.7,4.4,-10.8,6.3,-13.2,8.5,-13.7,9.5,-15.6,11.9,-16.6,13.5,-17.5,14.7,-16.5,16,-16,18.1,-17.05,20.8,-16,23.7,-14.5,26.1,-12.9,27.9,-10.2,29.4,-9.8,31.5,-7.6,33.6,-6.3,35],
  [49.3,-12,50.5,-15.5,49.4,-18.2,47.6,-23.8,46.5,-25.3,44.5,-25,43.4,-22,44.4,-19.5,44,-17,46.3,-15.7,48,-13.5],
  /* Asia insular y Oceanía */
  [130,31.2,131.4,31.4,132,33,133.2,33,134.7,33.8,135.8,33.5,137,34.6,138.8,34.7,140.9,35.7,141,38.3,142,39.6,141.5,41.4,140.2,41.1,139.9,39.6,138.6,37.4,137.3,37.5,136.7,36.6,136,36,135,35.7,132.6,35.5,131,34.4,129.7,33.2],
  [140.1,41.5,141.2,42.4,143.3,42,145.6,43.3,145.1,44.2,142,45.5,141.6,44,140.3,43.2],
  [142,46,143.6,49.3,143.3,52.5,142.8,54.3,141.9,52.2,142,49,141.8,46.7],
  [120.2,22.7,120.9,21.9,121.9,25,121,25.2,120.2,23.6],
  [108.7,19.2,110.5,20.1,111,19.6,109.5,18.2],
  [120.3,16,120.6,18.5,122.2,18.4,122.3,16.3,121.6,14.2,124,13,123.9,12.6,122,13.6,120.6,14.2,120,15.3],
  [122,7,123.6,8.6,125.5,9.8,126.5,7.6,125.4,5.6,124,6.6],
  [109,1.6,111.3,2.6,113,3.3,115,5,116.8,7,119.2,5.2,117.8,3.5,118.9,1,117.5,0.5,116.5,-2.5,116,-4,114.5,-4.1,113,-3.3,111.5,-3.3,110.2,-1.7,109,0.3],
  [95.3,5.6,97.5,5.2,100.3,2.6,103.7,0.5,104.5,-1.5,106,-3.3,105.8,-5.9,104.3,-5.8,102.3,-4,100.3,-0.9,98.7,1.7,96.5,3.8],
  [105.3,-6.8,106.8,-6,108.5,-6.6,110.9,-6.4,112.6,-6.9,114.4,-7.8,114.3,-8.6,110.5,-8.1,108,-7.8,106.4,-7.4],
  [119.5,-5.5,120.4,-3,119.3,-0.5,120.3,1,124.5,1.5,123,0.4,121,-0.9,123.2,-1,122.5,-4.5,121.3,-4.8,120.5,-5.6],
  [115,-8.2,119,-8.3,123,-8.4,127,-8.4,124,-10.2,119,-9.7,116,-8.9],
  [131,-0.8,134,-0.8,135.5,-3.3,138,-1.6,141,-2.6,145,-4.3,147.8,-6,150.8,-10.3,147,-10,143.5,-8,141,-9.1,138.5,-8.3,137.5,-5,134,-4,132.5,-2.8],
  [113.5,-22,114,-26,115.7,-32,115,-34.3,118,-35,121.9,-33.9,126,-32.3,131,-31.5,133.7,-32.1,135.8,-34.8,137.5,-33,138.5,-35,140.5,-38,144.9,-38.3,146.4,-39.1,150,-37.5,151.3,-33.8,153.5,-28.5,153,-25,150.8,-23,148.5,-20.3,146.3,-18.9,145.3,-15.5,143.5,-14,142.5,-10.7,141.5,-13,140.8,-17.5,137.5,-15.8,135.5,-14.8,136.8,-12.2,133,-11.5,130.8,-12.4,129.5,-14.9,126,-14,124.5,-16.5,122.2,-18,119,-20,116,-20.8],
  [144.7,-40.7,148.3,-40.9,148,-43.2,146.5,-43.6,145.3,-42.5],
  [172.7,-34.5,174.5,-36,176,-37.5,178.5,-37.7,177,-39.5,176.3,-41,174.9,-41.5,174.8,-39.8,173.8,-39.3,174.7,-38,174.3,-36.5],
  [172.7,-40.6,174.3,-41.8,172.8,-43.6,171.2,-44.4,170.7,-45.9,168.4,-46.6,166.5,-45.9,168.3,-44,170.5,-42.8,172.1,-41],
  [80,9.8,81.3,8.5,81.8,7,80.5,6,79.8,7.5]
];
/* Mares interiores y golfos que el contorno anterior deja como tierra. */
const WATER=[
  [28.2,41.5,28,43.3,29.3,45.2,31,46.4,33,45.9,32.6,45.3,33.5,44.5,35.5,44.9,36.7,45.2,38.2,44.5,40,43.4,41.6,41.7,39,41,36.5,41.2,35,42,33,42,31.3,41.1,29.5,41.2],
  [47,44.8,46.8,43,48,41.8,49.5,40.5,48.9,38.5,50,37.4,52,36.8,54,37.3,53.8,39.2,53,40,52.8,41.8,54.5,41.5,52.5,42.8,51,44.5,53,45.2,53,46.7,50,46.8,48,46.2],
  [-92,46.7,-89.5,48,-86,48.7,-84.6,46.6,-87,46.5,-90.5,46.6],
  [-87.8,41.7,-86.3,41.8,-86,44.5,-85,45.7,-86.5,45.9,-87.8,44.5],
  [-84.5,46,-81.5,46,-80,45,-81.7,43.2,-82.5,43,-83.5,44,-84,45.5],
  [-114.7,31.6,-112.6,29.8,-111,27.9,-109.3,26.2,-107.6,24.3,-106.6,23.4,-109.5,23.3,-110.6,24.6,-111.6,26.3,-112.9,28,-114.4,30.2]
];

const withBounds=shapes=>shapes.map(points=>{
  let minX=180, maxX=-180, minY=90, maxY=-90;
  for(let i=0;i<points.length;i+=2){
    minX=Math.min(minX,points[i]);
    maxX=Math.max(maxX,points[i]);
    minY=Math.min(minY,points[i+1]);
    maxY=Math.max(maxY,points[i+1]);
  }
  return {points,minX,maxX,minY,maxY};
});
const inside=(shape,x,y)=>{
  if(x<shape.minX||x>shape.maxX||y<shape.minY||y>shape.maxY)return false;
  const points=shape.points;
  let hit=false;
  for(let i=0,j=points.length-2;i<points.length;j=i,i+=2){
    const xi=points[i], yi=points[i+1], xj=points[j], yj=points[j+1];
    if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)hit=!hit;
  }
  return hit;
};
const landShapes=withBounds(LAND), waterShapes=withBounds(WATER);
export const isLand=(lon,lat)=>{
  if(lat<-70)return true;
  if(!landShapes.some(shape=>inside(shape,lon,lat)))return false;
  return !waterShapes.some(shape=>inside(shape,lon,lat));
};

/* Puntos repartidos de forma uniforme sobre la esfera (espiral de Fibonacci); se conservan los de tierra. */
function buildLand(total){
  const points=[];
  const golden=Math.PI*(3-Math.sqrt(5));
  for(let i=0;i<total;i++){
    const y=1-(i+.5)*2/total;
    const radius=Math.sqrt(1-y*y);
    const theta=i*golden;
    const x=Math.cos(theta)*radius, z=Math.sin(theta)*radius;
    if(isLand(Math.atan2(x,z)/RAD,Math.asin(y)/RAD))points.push(x,y,z);
  }
  return new Float32Array(points);
}

/* Arco de círculo máximo, elevado sobre la superficie. */
function arcPoints(a,b,steps){
  const dot=clamp(a[0]*b[0]+a[1]*b[1]+a[2]*b[2],-1,1);
  const omega=Math.acos(dot), sine=Math.sin(omega)||1;
  const lift=.07+.2*omega/Math.PI;
  const points=new Float32Array((steps+1)*3);
  for(let i=0;i<=steps;i++){
    const t=i/steps;
    const ka=Math.sin((1-t)*omega)/sine, kb=Math.sin(t*omega)/sine;
    const scale=1+lift*Math.sin(Math.PI*t);
    points[i*3]=(a[0]*ka+b[0]*kb)*scale;
    points[i*3+1]=(a[1]*ka+b[1]*kb)*scale;
    points[i*3+2]=(a[2]*ka+b[2]*kb)*scale;
  }
  return points;
}

const PLANE=typeof Path2D==='function'?new Path2D('M12 2.6c-.85 0-1.5 1-1.5 2.3v4.4L3.2 13.6v1.9l7.3-2.1v4.4l-2.2 1.6V21l3.7-1 3.7 1v-1.6l-2.2-1.6v-4.4l7.3 2.1v-1.9l-7.3-4.3V4.9c0-1.3-.65-2.3-1.5-2.3z'):null;
const STEPS=72, BUCKETS=5, CYCLE=3600;

export function createGlobe(canvas,{routes,still=()=>false}){
  const context=canvas.getContext('2d');
  const land=buildLand(11000);
  const arcs=routes.map(route=>{
    const from=PLACES[route.from], to=PLACES[route.to];
    if(!from||!to)return null;
    const a=unit(from.lat,from.lon), b=unit(to.lat,to.lon);
    const mid=[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
    const length=Math.hypot(mid[0],mid[1],mid[2])||1;
    return {
      id:route.id,from:route.from,to:route.to,points:arcPoints(a,b,STEPS),
      lon:Math.atan2(mid[0],mid[2]),lat:Math.asin(clamp(mid[1]/length,-1,1))
    };
  }).filter(Boolean);
  const cities=[...new Set(arcs.flatMap(arc=>[arc.from,arc.to]))].map(name=>({name,side:PLACES[name].label,vector:unit(PLACES[name].lat,PLACES[name].lon)}));

  let size=0, ratio=1, frame=0, last=0, visible=true;
  let lon=-32*RAD, lat=30*RAD, targetLon=lon, targetLat=lat;
  let active=null, activeSince=0, dragging=false, pointerX=0, pointerY=0, spin=0, holdUntil=0;
  const screen=new Float32Array((STEPS+1)*3);

  const resize=()=>{
    const next=canvas.clientWidth;
    if(!next)return;
    size=next;
    ratio=Math.min(2,window.devicePixelRatio||1);
    canvas.width=Math.round(size*ratio);
    canvas.height=Math.round(size*ratio);
    draw(performance.now());
  };

  function draw(now){
    if(!size)return;
    const center=size/2, radius=size*.4;
    const cosLon=Math.cos(lon), sinLon=Math.sin(lon), cosLat=Math.cos(lat), sinLat=Math.sin(lat);
    context.setTransform(ratio,0,0,ratio,0,0);
    context.clearRect(0,0,size,size);

    /* Halo y esfera */
    let gradient=context.createRadialGradient(center,center,radius*.82,center,center,radius*1.24);
    gradient.addColorStop(0,'rgba(90,160,245,.34)');
    gradient.addColorStop(.45,'rgba(90,160,245,.1)');
    gradient.addColorStop(1,'rgba(90,160,245,0)');
    context.fillStyle=gradient;
    context.beginPath();
    context.arc(center,center,radius*1.24,0,TAU);
    context.fill();
    gradient=context.createRadialGradient(center-radius*.36,center-radius*.44,radius*.08,center,center,radius);
    gradient.addColorStop(0,'#1b4068');
    gradient.addColorStop(.55,'#0b213a');
    gradient.addColorStop(1,'#050f1c');
    context.fillStyle=gradient;
    context.beginPath();
    context.arc(center,center,radius,0,TAU);
    context.fill();

    /* Meridianos y paralelos */
    context.strokeStyle='rgba(170,205,240,.075)';
    context.lineWidth=1;
    context.beginPath();
    const trace=(latitude,longitude,first)=>{
      const cos=Math.cos(latitude*RAD);
      const x=cos*Math.sin(longitude*RAD), y=Math.sin(latitude*RAD), z=cos*Math.cos(longitude*RAD);
      const x1=x*cosLon-z*sinLon, z1=x*sinLon+z*cosLon;
      const y2=y*cosLat-z1*sinLat, z2=y*sinLat+z1*cosLat;
      if(z2<=0)return false;
      if(first)context.moveTo(center+radius*x1,center-radius*y2);
      else context.lineTo(center+radius*x1,center-radius*y2);
      return true;
    };
    for(let longitude=-180;longitude<180;longitude+=30){
      let pen=false;
      for(let latitude=-90;latitude<=90;latitude+=5)pen=trace(latitude,longitude,!pen);
    }
    for(let latitude=-60;latitude<=60;latitude+=30){
      let pen=false;
      for(let longitude=-180;longitude<=180;longitude+=5)pen=trace(latitude,longitude,!pen);
    }
    context.stroke();

    /* Tierra: puntos agrupados por profundidad */
    const paths=[];
    for(let i=0;i<BUCKETS;i++)paths.push(new Path2D());
    const dot=radius/270*1.42;
    for(let i=0;i<land.length;i+=3){
      const x=land[i], y=land[i+1], z=land[i+2];
      const z1=x*sinLon+z*cosLon;
      const z2=y*sinLat+z1*cosLat;
      if(z2<=.02)continue;
      const px=center+radius*(x*cosLon-z*sinLon), py=center-radius*(y*cosLat-z1*sinLat);
      const r=dot*(.5+.62*z2);
      const path=paths[Math.min(BUCKETS-1,z2*BUCKETS|0)];
      path.moveTo(px+r,py);
      path.arc(px,py,r,0,TAU);
    }
    for(let i=0;i<BUCKETS;i++){
      context.fillStyle='rgba(178,210,242,'+(.2+.72*(i+.5)/BUCKETS).toFixed(3)+')';
      context.fill(paths[i]);
    }

    /* Brillo y borde atmosférico */
    gradient=context.createRadialGradient(center-radius*.5,center-radius*.56,0,center-radius*.3,center-radius*.34,radius*1.05);
    gradient.addColorStop(0,'rgba(255,255,255,.12)');
    gradient.addColorStop(.5,'rgba(255,255,255,.02)');
    gradient.addColorStop(1,'rgba(2,8,16,.34)');
    context.fillStyle=gradient;
    context.beginPath();
    context.arc(center,center,radius,0,TAU);
    context.fill();
    gradient=context.createLinearGradient(center-radius,center-radius,center+radius,center+radius);
    gradient.addColorStop(0,'rgba(255,240,214,.75)');
    gradient.addColorStop(.5,'rgba(150,200,255,.3)');
    gradient.addColorStop(1,'rgba(150,200,255,.06)');
    context.strokeStyle=gradient;
    context.lineWidth=1.3;
    context.beginPath();
    context.arc(center,center,radius,0,TAU);
    context.stroke();

    /* Arcos */
    const project=arc=>{
      const points=arc.points;
      for(let i=0;i<=STEPS;i++){
        const x=points[i*3], y=points[i*3+1], z=points[i*3+2];
        const x1=x*cosLon-z*sinLon, z1=x*sinLon+z*cosLon;
        const y2=y*cosLat-z1*sinLat, z2=y*sinLat+z1*cosLat;
        screen[i*3]=center+radius*x1;
        screen[i*3+1]=center-radius*y2;
        screen[i*3+2]=z2>0||x1*x1+y2*y2>1.02?1:0;
      }
    };
    const stroke=(from,to)=>{
      context.beginPath();
      let pen=false;
      for(let i=from;i<=to;i++){
        if(!screen[i*3+2]){
          pen=false;
          continue;
        }
        if(pen)context.lineTo(screen[i*3],screen[i*3+1]);
        else context.moveTo(screen[i*3],screen[i*3+1]);
        pen=true;
      }
      context.stroke();
    };
    context.lineCap='round';
    context.lineJoin='round';
    for(const arc of arcs){
      if(arc===active)continue;
      project(arc);
      context.strokeStyle='rgba(170,205,240,.24)';
      context.lineWidth=1;
      stroke(0,STEPS);
    }
    if(active){
      project(active);
      const phase=still()?.5:((now-activeSince)%CYCLE)/CYCLE;
      const linear=still()?.5:Math.min(1,phase/.8);
      const travel=linear<.5?2*linear*linear:1-Math.pow(-2*linear+2,2)/2;
      const head=Math.round(travel*STEPS);
      context.strokeStyle='rgba(247,215,160,.3)';
      context.lineWidth=1.3;
      context.setLineDash([2,5]);
      stroke(0,STEPS);
      context.setLineDash([]);
      context.shadowColor='rgba(247,200,130,.9)';
      context.shadowBlur=12;
      context.strokeStyle='rgba(247,215,160,.95)';
      context.lineWidth=2;
      stroke(0,head);
      context.shadowBlur=0;
      const fade=still()?1:phase>.8?1-(phase-.8)/.2:Math.min(1,phase/.06);
      if(PLANE&&head<STEPS&&screen[head*3+2]){
        const next=Math.min(STEPS,head+1), previous=Math.max(0,head-1);
        const angle=Math.atan2(screen[next*3+1]-screen[previous*3+1],screen[next*3]-screen[previous*3]);
        const scale=radius/270*.92;
        context.save();
        context.globalAlpha=fade;
        context.translate(screen[head*3],screen[head*3+1]);
        context.rotate(angle+Math.PI/2);
        context.scale(scale,scale);
        context.translate(-12,-12);
        context.shadowColor='rgba(255,220,160,.95)';
        context.shadowBlur=14;
        context.fillStyle='#fff3da';
        context.fill(PLANE);
        context.restore();
      }
    }

    /* Ciudades */
    const pulse=still()?.5:(now%2200)/2200;
    context.textBaseline='middle';
    for(const city of cities){
      const [x,y,z]=city.vector;
      const x1=x*cosLon-z*sinLon, z1=x*sinLon+z*cosLon;
      const y2=y*cosLat-z1*sinLat, z2=y*sinLat+z1*cosLat;
      if(z2<=.04)continue;
      const px=center+radius*x1, py=center-radius*y2;
      const alpha=Math.min(1,z2*3.2);
      const on=active&&(active.from===city.name||active.to===city.name);
      context.globalAlpha=alpha;
      if(on){
        context.strokeStyle='rgba(247,215,160,'+(.7*(1-pulse)).toFixed(3)+')';
        context.lineWidth=1.4;
        context.beginPath();
        context.arc(px,py,5+pulse*15,0,TAU);
        context.stroke();
        gradient=context.createRadialGradient(px,py,0,px,py,13);
        gradient.addColorStop(0,'rgba(247,215,160,.75)');
        gradient.addColorStop(1,'rgba(247,215,160,0)');
        context.fillStyle=gradient;
        context.beginPath();
        context.arc(px,py,13,0,TAU);
        context.fill();
      }
      context.fillStyle=on?'#fff3da':'rgba(247,215,160,.8)';
      context.beginPath();
      context.arc(px,py,on?4.2:2.7,0,TAU);
      context.fill();
      context.font=(on?'700 13px':'600 11.5px')+' "DM Sans", Arial, sans-serif';
      context.textAlign=city.side==='left'?'right':'left';
      context.shadowColor='rgba(2,8,16,.95)';
      context.shadowBlur=7;
      context.fillStyle=on?'#ffffff':'rgba(200,216,232,.82)';
      context.fillText(city.name,px+(city.side==='left'?-11:11),py+.5);
      context.shadowBlur=0;
    }
    context.globalAlpha=1;
  }

  const loop=now=>{
    frame=0;
    const elapsed=Math.min(64,now-last||16);
    last=now;
    if(!dragging){
      if(now>holdUntil){
        const ease=1-Math.pow(.05,elapsed/1000);
        const sway=still()?0:Math.sin(now/5200)*.1;
        lon+=shortAngle(targetLon+sway-lon)*ease;
        lat+=(targetLat-lat)*ease;
      }else if(Math.abs(spin)>.00005){
        lon+=spin;
        spin*=.94;
      }
    }
    draw(now);
    if(visible&&!still())frame=requestAnimationFrame(loop);
  };
  const wake=()=>{
    if(still()){
      lon=targetLon;
      lat=targetLat;
      draw(performance.now());
    }else if(!frame&&visible)frame=requestAnimationFrame(loop);
  };

  canvas.addEventListener('pointerdown',event=>{
    dragging=true;
    pointerX=event.clientX;
    pointerY=event.clientY;
    spin=0;
    canvas.classList.add('dragging');
    canvas.setPointerCapture?.(event.pointerId);
  });
  canvas.addEventListener('pointermove',event=>{
    if(!dragging)return;
    const scale=1/(size*.4);
    const dx=(event.clientX-pointerX)*scale, dy=(event.clientY-pointerY)*scale;
    pointerX=event.clientX;
    pointerY=event.clientY;
    lon=shortAngle(lon-dx);
    lat=clamp(lat+dy,-1.1,1.25);
    spin=-dx;
    holdUntil=performance.now()+4200;
    if(still())draw(performance.now());
  });
  const release=()=>{
    if(!dragging)return;
    dragging=false;
    holdUntil=performance.now()+4200;
    canvas.classList.remove('dragging');
  };
  canvas.addEventListener('pointerup',release);
  canvas.addEventListener('pointercancel',release);

  if('ResizeObserver' in window)new ResizeObserver(resize).observe(canvas);
  else{
    resize();
    addEventListener('resize',resize);
  }
  if('IntersectionObserver' in window){
    new IntersectionObserver(entries=>{
      visible=entries[0].isIntersecting;
      wake();
    },{rootMargin:'120px'}).observe(canvas);
  }
  document.fonts?.ready.then(()=>draw(performance.now()));

  return {
    has:id=>arcs.some(arc=>arc.id===id),
    get dragging(){return dragging;},
    setActive(id){
      active=arcs.find(arc=>arc.id===id)??null;
      if(active){
        targetLon=active.lon;
        targetLat=clamp(active.lat*.8,-.4,.74);
        activeSince=performance.now();
        holdUntil=0;
      }
      wake();
    }
  };
}
