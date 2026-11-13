import {products,categories,empanadaFlavors,money,count,total,flavorsComplete} from './order.js';
const element=(tag,text,className)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(className)e.className=className;return e;};
const chosenFlavors=new Map();

const muzzarella = {file: 'pizza-muzzarella', width: 1086, title: 'Pizza de muzzarella'};
const napolitana = {file: 'pizza-napolitana', width: 1086, title: 'Pizza napolitana'};
const productPhotos = new Map([
  ['orderar-300', {src: 'assets/menu-photos/orderar-300.webp', title: 'Pizza Ponzzoni'}],
  ['orderar-100', muzzarella],
  ['orderar-107', napolitana],
  ['orderar-700', {file: 'empanadas-abiertas', width: 1300, title: 'Empanadas de carne'}],
  ['orderar-800', {file: 'sandwich-milanesa', width: 1254, title: 'Sánguche de milanesa'}],
  ['orderar-900', {file: 'bocaditos-pollo', width: 1086, title: 'Bastones de pollo con papas'}],
]);

const photoDialog = document.querySelector('#menu-photo-dialog');
photoDialog.addEventListener('click', event => {
  if (event.target !== photoDialog) return;
  const rect = photoDialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom) photoDialog.close();
});

function productThumbnail(product, photo) {
  const title = photo.illustrative ? `${photo.title} · Imagen ilustrativa` : photo.title;
  const button = element('button', '', 'product-thumbnail');
  button.type = 'button';
  button.setAttribute('aria-label', `Ampliar foto de ${product.name}`);
  button.setAttribute('aria-haspopup', 'dialog');
  const thumbnail = element('img');
  thumbnail.src = photo.src ?? `assets/${photo.file}-160.webp`;
  thumbnail.alt = '';
  thumbnail.width = 160;
  thumbnail.height = 160;
  thumbnail.loading = 'lazy';
  button.append(thumbnail);
  button.addEventListener('click', () => {
    photoDialog.querySelector('h2').textContent = title;
    const fullPhoto = element('img', '', 'menu-photo-full');
    fullPhoto.alt = photo.title;
    fullPhoto.src = photo.src ?? `assets/${photo.file}-${photo.width}.webp`;
    photoDialog.querySelector('.menu-photo-body').replaceChildren(fullPhoto);
    photoDialog.showModal();
  });
  return button;
}

export function drawCategories(category,onSelect){
  const container=document.querySelector('#categories');container.replaceChildren();
  for(const name of categories){const b=element('button',name);b.type='button';b.setAttribute('aria-pressed',String(name===category));b.addEventListener('click',()=>onSelect(name));container.append(b);}
}
export function drawProducts({cart,flavors,category,changed}){
  const active=document.activeElement?.dataset?.focus;
  const container=document.querySelector('#product-list');container.replaceChildren();
  for(const p of products.filter(p=>p.category===category)){
    const article=element('article','','product');const copy=element('div');copy.append(element('h3',p.name));
    if(p.description||p.unit)copy.append(element('p',[p.description,p.unit].filter(Boolean).join(' · ')));
    if(p.provisionalPrice)copy.append(element('small','Precio provisorio · se confirma por WhatsApp','provisional'));
    copy.append(element('span',money(p.price),'price'));
    const quantity=element('div','','quantity');quantity.setAttribute('role','group');quantity.setAttribute('aria-label',`Cantidad de ${p.name}`);
    for(const delta of [-1,0,1]){
      if(!delta){const output=element('output',String(cart[p.id]||0));output.setAttribute('aria-label',`Cantidad elegida de ${p.name}`);quantity.append(output);continue;}
      const b=element('button',delta>0?'+':'−');b.type='button';b.dataset.focus=`${p.id}:${delta}`;
      b.setAttribute('aria-label',`${delta>0?'Sumar':'Restar'} ${p.name}`);b.disabled=delta<0?!(cart[p.id]>0):cart[p.id]>=99;
      b.addEventListener('click',()=>{cart[p.id]=Math.min(99,Math.max(0,(cart[p.id]||0)+delta));if(!cart[p.id])delete flavors[p.id];changed();});quantity.append(b);
    }
    const photo = p.category === 'Promociones' ? undefined : productPhotos.get(p.id) ?? {
      title: p.name,
      src: `assets/menu-photos/${p.id}.webp`,
      illustrative: true,
    };
    if (photo?.illustrative) copy.append(element('small', 'Imagen ilustrativa', 'product-photo-note'));
    if (photo) {
      const details = element('div', '', 'product-details');
      details.append(productThumbnail(p, photo), copy);
      article.append(details, quantity);
    } else {
      article.append(copy, quantity);
    }
    container.append(article);
  }
  drawFlavors(cart,flavors,changed);
  const number=count(cart);document.querySelector('#selection-count').textContent=number?`${number} producto${number===1?'':'s'} elegido${number===1?'':'s'}`:'Sin productos elegidos';
  document.querySelector('#selection-total').textContent=money(total(cart));
  const complete=flavorsComplete(cart,flavors);
  document.querySelector('#to-delivery').disabled=!number||!complete;
  document.querySelector('#flavor-help').hidden=complete||!number;
  if(active){const replacement=[...document.querySelectorAll('[data-focus]')].find(e=>e.dataset.focus===active);if(replacement&&!replacement.disabled)replacement.focus({preventScroll:true});}
}
function drawFlavors(cart,flavors,changed){
  const container=document.querySelector('#flavor-selection');container.replaceChildren();
  for(const p of products.filter(p=>p.flavorCount&&cart[p.id]>0)){
    const selection=flavors[p.id]||{};flavors[p.id]=selection;
    const required=p.flavorCount*cart[p.id],selected=Object.values(selection).reduce((a,b)=>a+b,0);
    const fieldset=element('fieldset','','flavor-picker');fieldset.append(element('legend',`Sabores: ${p.name}`));
    const counter=element('p',`${selected} de ${required} empanadas elegidas`,'flavor-counter');counter.setAttribute('aria-live','polite');fieldset.append(counter);
    if(selected>required)fieldset.append(element('p','Restá sabores hasta completar la cantidad del pedido.','form-error'));
    const controls=element('div','','flavor-controls');const label=element('label','Elegí un sabor','field');
    const select=element('select');select.dataset.focus=`flavor-select:${p.id}`;
    for(const flavor of empanadaFlavors){const option=element('option',flavor.name);option.value=flavor.id;select.append(option);}
    select.value=chosenFlavors.get(p.id)||empanadaFlavors[0].id;select.addEventListener('change',()=>chosenFlavors.set(p.id,select.value));label.append(select);
    const add=element('button','Añadir sabor','button button-secondary');add.type='button';add.dataset.focus=`flavor-add:${p.id}`;add.disabled=selected>=required;
    add.addEventListener('click',()=>{selection[select.value]=(selection[select.value]||0)+1;changed();});controls.append(label,add);fieldset.append(controls);
    for(const flavor of empanadaFlavors.filter(f=>selection[f.id]>0)){
      const row=element('div','','flavor-row');row.append(element('span',flavor.name));const quantity=element('div','','quantity');
      for(const delta of [-1,0,1]){
        if(!delta){quantity.append(element('output',String(selection[flavor.id])));continue;}
        const b=element('button',delta>0?'+':'−');b.type='button';b.dataset.focus=`${p.id}:${flavor.id}:${delta}`;
        b.setAttribute('aria-label',`${delta>0?'Sumar':'Restar'} sabor ${flavor.name} en ${p.name}`);b.disabled=delta>0&&selected>=required;
        b.addEventListener('click',()=>{selection[flavor.id]=Math.max(0,selection[flavor.id]+delta);changed();});quantity.append(b);
      }
      row.append(quantity);fieldset.append(row);
    }
    fieldset.append(element('p','Si pedís varias promos, podés aclarar cómo repartir los sabores en las notas del pedido.','helper'));container.append(fieldset);
  }
}
