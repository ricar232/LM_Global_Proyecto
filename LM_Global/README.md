# LM Global

Página de vuelos internacionales. El proyecto usa HTML, CSS y JavaScript, con imágenes y fuentes locales. No necesita instalar dependencias ni compilar nada.

## Abrir en tu PC

**Forma rápida (Windows):** haz doble clic en `Abrir LM Global.bat`, que está junto a la carpeta `LM_Global`. Enciende el servidor y abre la página en tu navegador. Deja esa ventana abierta mientras la ves.

**Forma manual:**

1. Descomprime el ZIP y abre la carpeta `LM_Global` en VS Code.
2. Abre una terminal **dentro de `LM_Global`** y ejecuta `py -m http.server 8000` en Windows o `python3 -m http.server 8000` en Linux o macOS. Requiere Python 3.
3. Visita http://localhost:8000/ en tu navegador.

La página usa módulos de JavaScript. Debe abrirse desde un servidor HTTP local o desde un alojamiento web: si abres `index.html` con doble clic, o entras a `localhost:8000` sin el servidor encendido, no cargará.

## Personalizar

- `index.html` contiene la estructura de la página y los iconos (símbolos SVG al inicio del `<body>`).
- `style.css` contiene el diseño: colores y cristal (variables en `:root`), secciones, ficha de ruta y adaptación a móvil.
- `app.js` contiene los filtros, las tarjetas, el calendario de salidas y la preparación de consultas por WhatsApp.
- `fx.js` contiene los efectos visuales: cabecera, luces que siguen al cursor, inclinación 3D, estrellas y apariciones al hacer scroll.
- `globe.js` contiene el globo interactivo del mapa de rutas.
- `routes.js` contiene las rutas, fechas, tarifas, equipaje, condiciones y los datos de contacto.
- `assets/` contiene las imágenes, fuentes y sus licencias.

### Al cambiar rutas

- Las tarjetas, el calendario, las cifras del inicio y la cinta de destinos se generan solos a partir de `routes.js`.
- Si agregas una ciudad nueva, añade sus coordenadas en `PLACES`, al inicio de `globe.js`, para que aparezca en el globo. Sin coordenadas, la ruta funciona igual en el resto de la página.
- La ruta destacada del inicio se elige con `data-route` en el botón `#featured` de `index.html`.

### Movimiento y accesibilidad

Las animaciones se desactivan solas cuando el visitante tiene activada la opción «reducir movimiento» en su sistema, y el cristal se vuelve opaco con «reducir transparencia».

Para alojarla, sube el contenido de `LM_Global` a la carpeta pública de un servidor web estático.
