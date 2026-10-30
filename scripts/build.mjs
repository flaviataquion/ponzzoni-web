import {cp, mkdir, stat} from 'node:fs/promises';
await mkdir('dist', {recursive:true});
await cp('public', 'dist', {recursive:true});
for (const file of ['index.html','styles.css','app.js','order.js','menu.js','catalog.js','assets/hero-1600.webp','assets/logo-hero.svg','assets/fonts.css','assets/dm-sans.ttf','assets/archivo-black.ttf']) {
  if (!(await stat(`dist/${file}`)).size) throw new Error(`Archivo vacío: ${file}`);
}
console.log('Build estático listo en dist/.');
