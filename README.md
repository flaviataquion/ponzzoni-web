# Ponzzoni · Boceto responsive y CRO

Implementación estática sin dependencias de ejecución, preparada para GitHub y Vercel. Diseño de referencia: https://www.figma.com/design/KD3QzBkkfitB67suNxWORf?node-id=92-140

## Uso

- `node server.mjs` sirve la vista local en http://127.0.0.1:4173
- `node --test tests/*.test.mjs` verifica totales, horarios, mensaje y bloqueo de pedidos de ejemplo.
- `node scripts/build.mjs` genera `dist/`.
- En Vercel: framework Other, build `node scripts/build.mjs`, output `dist`. La configuración ya está en `vercel.json`.

## Estado del boceto

La landing, navegación móvil, mapa, consultas de WhatsApp y simulación del pedido son interactivos. `public/order.js` concentra carta y configuración. `menuReady: false` bloquea el envío de productos/precios de ejemplo; las consultas normales al WhatsApp real sí están habilitadas. No se almacena teléfono, dirección ni notas en el navegador; solo cantidades. No hay un backend de recepción ni confirmación: la confirmación real ocurre en el chat.

Antes de admitir pedidos: cargar carta y precios definitivos, confirmar variantes/disponibilidad, cobertura y pedido mínimo, validar contenido/fotos ilustrativas con el comercio y luego cambiar `menuReady` a `true`. Para permitir indexación, retirar el noindex tanto del HTML como del header X-Robots-Tag de Vercel. Añadir dominio y URL canónica cuando exista. Las promos no se muestran hasta tener una oferta real.

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

Fotos y logos corresponden a los recursos descargados del diseño aprobado. Créditos de fotografías: Nano Erdozain (Pexels 28945115), Arthur Brognoli (3343624), Eneida Nieves (905847), Airam Dato-on (9471598). Poggio en curvas para la marca; DM Sans y Archivo Black para textos.

## Verificación

Seis pruebas de lógica pasaron. Se verificó en Chrome aislado: anchos 320, 375, 390, 768, 1024 y 1440 px sin desborde horizontal; menú móvil, cantidades, dirección condicional, indicaciones, horario programado, revisión editable, retiro y bloqueo del envío de prueba. Sin errores JavaScript. Capturas en `qa/`. El mapa es un recurso externo; siempre hay un enlace independiente «Cómo llegar».

`scripts/verify-browser.mjs` puede ejecutarse con Playwright disponible y el servidor iniciado. Para usar una instalación existente, definir `QA_PLAYWRIGHT_PATH` con la ruta absoluta a `playwright/index.mjs` y `QA_CHROME_PATH` con el ejecutable de Chrome. No envía mensajes ni pedidos.

