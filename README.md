# Ponzzoni · Landing y pedidos por WhatsApp

Implementación estática sin dependencias de ejecución, preparada para GitHub y Vercel. Diseño de referencia: https://www.figma.com/design/KD3QzBkkfitB67suNxWORf?node-id=92-140

## Uso

- `node server.mjs` sirve la vista local en http://127.0.0.1:4173
- `node --test tests/*.test.mjs` verifica carta, totales, horarios, sabores y mensaje de WhatsApp.
- `node scripts/build.mjs` genera `dist/`.
- En Vercel: framework Other, build `node scripts/build.mjs`, output `dist`. La configuración ya está en `vercel.json`.

## Carta y estado del pedido

La landing, navegación móvil, mapa y pedido son interactivos. `public/menu.js` contiene 84 productos de la carta indicada por el comercio, consultada el 30/10/2026: https://www.orderar.com/restaurant/mesa.php?oa=V74dd996_75d12ee6 . Se excluyeron Comidas Peruanas. Los adicionales de $0 se integran como sabores de empanadas, sin venderse ni cobrarse como productos separados. Se conservan las cinco promociones, pizzas clásicas/especiales/rellenas, la especial Ponzzoni, empanadas, calzones, fainá, sándwich de milanesa, milanesas para compartir y bastones de pollo.

El comercio confirmó los precios de las milanesas y del sánguche el 11/11/2026. El precio de $10.000 para los bastones de pollo sigue marcado como provisorio en la carta, la revisión y el mensaje. Las medias docenas, docenas y promos con empanadas requieren elegir exactamente 6/12 sabores por combo, multiplicados por la cantidad elegida.

`public/order.js` concentra la configuración, con `menuReady: true`. El botón abre WhatsApp con un borrador para que el cliente lo envíe; no envía mensajes por API ni registra una compra como confirmada. La confirmación de recepción, disponibilidad, total y demora ocurre en el chat. Solo se guardan cantidades y sabores en el navegador; teléfono, dirección y notas no se almacenan.

Delivery propio gratis en un radio de 2 km desde Coucheiro 213, Villa Sarmiento. Se muestra en landing, formulario, revisión y mensaje. No hay geocodificación ni validación automática de distancia: el local confirma la cobertura de la dirección por WhatsApp. Take away no requiere dirección.

Se conserva `noindex` del boceto. Al lanzar la URL definitiva, retirar el noindex del HTML y del header X-Robots-Tag de Vercel, y añadir dominio y URL canónica.

## Mejoras de conversión aplicadas

1. Camino principal consistente: «Ver carta y pedir». WhatsApp es un canal secundario de consulta y el paso final del pedido.
2. Carta antes del contenido de marca; envío gratis, modalidad y horarios visibles desde el hero.
3. Ubicación correctamente enlazada al mapa: en Figma el botón de ubicación todavía estaba dirigido a WhatsApp.
4. Botón persistente en móvil, elementos táctiles amplios, foco visible, reducción de movimiento y formulario sin registro.
5. Dirección e indicaciones solo para delivery; horario en ambos modos; estado fuera de horario coherente con Buenos Aires.
6. Resumen editable sin pantalla intermedia para WhatsApp. Ningún clic se presenta como pedido confirmado.
7. Imágenes WebP locales con variantes responsive, DM Sans y Archivo Black alojadas localmente y recursos bajo el pliegue diferidos. El hero de 1600 px pesa 100 KB frente a 4,2 MB del original. Sin reseñas, urgencia ni descuentos inventados.

Estas son hipótesis CRO, no resultados medidos. Base de criterio: https://baymard.com/blog/checkout-flow-ux-optimization y https://developers.google.com/search/docs/appearance/core-web-vitals

## Medición preparada

Se emiten eventos propios `ponzzoni:conversion` en `window`, sin datos personales. Eventos: `order_open`, `order_step_view`, `whatsapp_consult_intent`, `whatsapp_order_intent`, `directions`. No se instaló un proveedor de analítica ni se envían eventos a terceros. Medir apertura de carta → productos → datos → intención de WhatsApp; confirmar ventas desde la operación del local. El clic a WhatsApp no equivale a una venta.

## Recursos

Las fotos actuales de muzzarella, napolitana y empanadas y los logos PNG blanco, rojo y negro fueron proporcionados por el comercio. Los PNG conservan sus colores, transparencia y proporciones; solo se quitó el margen transparente derecho para alinear la marca. Las fotos se codificaron en WebP con variantes responsive. Se conservaron las imágenes de horno del diseño aprobado. Créditos de los recursos originales de Figma que permanecen en el proyecto: Nano Erdozain (Pexels 28945115), Arthur Brognoli (3343624), Eneida Nieves (905847), Airam Dato-on (9471598). DM Sans y Archivo Black para textos.

## Verificación

Nueve pruebas de lógica pasaron. Se verificó en Chrome aislado: anchos 320, 375, 390, 768, 1024 y 1440 px sin desborde horizontal; menú móvil, cantidades, dirección condicional, indicaciones, horario programado, revisión editable, retiro y elección obligatoria de sabores. El enlace final de WhatsApp se interceptó para comprobar el borrador sin enviar mensajes. Sin errores JavaScript. Capturas en `qa/`. El mapa es un recurso externo; siempre hay un enlace independiente «Cómo llegar».

`scripts/verify-browser.mjs` puede ejecutarse con Playwright disponible y el servidor iniciado. Para usar una instalación existente, definir `QA_PLAYWRIGHT_PATH` con la ruta absoluta a `playwright/index.mjs` y `QA_CHROME_PATH` con el ejecutable de Chrome. No envía mensajes ni pedidos.
