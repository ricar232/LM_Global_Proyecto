# LM Global

Página de vuelos internacionales. El proyecto usa HTML, CSS y JavaScript, con imágenes y fuentes locales.

## Abrir en tu PC

1. Descomprime el ZIP y abre la carpeta `LM_Global` en VS Code.
2. Abre una terminal en esa carpeta y ejecuta `py -m http.server 8000` en Windows o `python3 -m http.server 8000` en Linux o macOS. Requiere Python 3.
3. Visita http://localhost:8000/ en tu navegador.

La página usa módulos de JavaScript. Debe abrirse desde un servidor HTTP local o desde un alojamiento web.

## Personalizar

- `index.html` contiene la estructura de la página.
- `style.css` contiene el diseño.
- `app.js` contiene los filtros, las fichas y la preparación de consultas por WhatsApp.
- `routes.js` contiene las rutas, fechas, tarifas, equipaje, condiciones y los datos de contacto.
- `assets/` contiene las imágenes, fuentes y sus licencias.

Para alojarla, sube el contenido de `LM_Global` a la carpeta pública de un servidor web estático.
