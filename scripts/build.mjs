import {cp, mkdir, stat} from 'node:fs/promises';
await mkdir('dist', {recursive:true});
await cp('public', 'dist', {recursive:true});
for (const file of ['index.html','styles.css','app.js','order.js','menu.js','catalog.js','assets/hero-pizza-horno-1395.webp','assets/ponzzoni-blanco.png','assets/ponzzoni-rojo.png','assets/ponzzoni-negro.png','assets/pizza-muzzarella-1086.webp','assets/pizza-napolitana-1086.webp','assets/empanadas-abiertas-1300.webp','assets/empanadas-plato-1382.webp','assets/fonts.css','assets/dm-sans.ttf','assets/archivo-black.ttf']) {
  if (!(await stat(`dist/${file}`)).size) throw new Error(`Archivo vacío: ${file}`);
}
console.log('Build estático listo en dist/.');
