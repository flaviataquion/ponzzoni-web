import {CONFIG,categories,products,money,count,total,localDate,storeOpen,validSchedule,whatsappUrl,orderUrl,flavorsComplete,flavorSummary,empanadaFlavors} from './order.js';
import {drawCategories,drawProducts} from './catalog.js';
const $=s=>document.querySelector(s);
const dialog=$('#order-dialog');
let cart={},flavors={},category=categories[0],delivery={},step=1,opener=null;
try{const saved=JSON.parse(localStorage.getItem('ponzzoni-selection-v2')||'{}');for(const p of products)cart[p.id]=Math.min(99,Math.max(0,Math.trunc(Number(saved.cart?.[p.id])||0)));for(const p of products.filter(p=>p.flavorCount)){const selection={};for(const f of empanadaFlavors)selection[f.id]=Math.min(1188,Math.max(0,Math.trunc(Number(saved.flavors?.[p.id]?.[f.id])||0)));flavors[p.id]=selection;}}catch{cart={};flavors={};}
const emit=(event,placement)=>window.dispatchEvent(new CustomEvent('ponzzoni:conversion',{detail:{event,placement}}));
const persist=()=>{try{localStorage.setItem('ponzzoni-selection-v2',JSON.stringify({cart,flavors}));}catch{/* La navegación funciona sin almacenamiento. */}};
function renderCategories(){drawCategories(category,name=>{category=name;renderCategories();renderProducts();});}
function renderProducts(){drawProducts({cart,flavors,category,changed:()=>{persist();renderProducts();}});}
function setStep(next){step=next;$('#order-products').hidden=next!==1;$('#delivery-form').hidden=next!==2;$('#review').hidden=next!==3;$('#order-title').textContent=['¿Qué se te antoja hoy?','Entrega y datos','Pago y revisión'][next-1];document.querySelectorAll('.progress li').forEach((n,i)=>i===next-1?n.setAttribute('aria-current','step'):n.removeAttribute('aria-current'));if(next===3)renderReview();dialog.scrollTop=0;$('#order-title').focus({preventScroll:true});emit('order_step_view',String(next));}
function deliveryVisibility(){const form=$('#delivery-form');const mode=form.elements.mode.value,timing=form.elements.timing.value;$('#address-fields').hidden=mode!=='delivery';form.elements.address.required=mode==='delivery';$('#schedule-fields').hidden=timing!=='scheduled';form.elements.date.required=form.elements.time.required=timing==='scheduled';form.elements.time.setCustomValidity('');$('#delivery-error').textContent='';}
function setBusinessState(){const open=storeOpen();$('#store-status').textContent=open?'Estamos atendiendo · hasta las 23 h':'Miércoles a domingos · 19 a 23 h';$('#order-date').min=localDate();$('#closed-note').hidden=open;const asap=$('#delivery-form').elements.timing[0];asap.disabled=!open;if(!open&&asap.checked)$('#delivery-form').elements.timing[1].checked=true;deliveryVisibility();}
function openOrder(event){event.preventDefault();opener=event.currentTarget;if(opener.dataset.category){category=opener.dataset.category;step=1;}emit('order_open',opener.dataset.placement||'unknown');setBusinessState();renderCategories();renderProducts();if(!dialog.open)dialog.showModal();document.body.classList.add('modal-open');setStep(step);}
document.querySelectorAll('.order-open').forEach(a=>a.addEventListener('click',openOrder));
$('#close-order').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');opener?.focus({preventScroll:true});});
dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}});
$('#to-delivery').addEventListener('click',()=>{if(count(cart))setStep(2);});
$('#back-products').addEventListener('click',()=>setStep(1));
$('#edit-products').addEventListener('click',()=>setStep(1));
$('#edit-delivery').addEventListener('click',()=>setStep(2));
$('#delivery-form').addEventListener('change',deliveryVisibility);
$('#delivery-form').addEventListener('input',()=>{$('#delivery-form').elements.phone.setCustomValidity('');$('#delivery-form').elements.time.setCustomValidity('');});
$('#delivery-form').addEventListener('submit',event=>{event.preventDefault();const form=event.currentTarget;const data=Object.fromEntries(new FormData(form));data.phone=data.phone.trim();data.address=(data.address||'').trim();data.instructions=(data.instructions||'').trim();const digits=data.phone.replace(/\D/g,'');if(digits.length<8||digits.length>15){form.elements.phone.setCustomValidity('Ingresá un teléfono de contacto válido, con código de área.');form.elements.phone.reportValidity();return;}if(data.mode==='delivery'&&!data.address){$('#delivery-error').textContent='Ingresá la dirección de entrega.';form.elements.address.focus();return;}if(data.timing==='scheduled'&&!validSchedule(data.date,data.time)){form.elements.time.setCustomValidity('Elegí un horario futuro entre las 19 y las 23 h, de miércoles a domingos.');form.elements.time.reportValidity();return;}if(data.timing==='asap'&&!storeOpen()){$('#delivery-error').textContent='Ahora estamos fuera de horario. Elegí un día y horario de atención.';setBusinessState();return;}delivery=data;setStep(3);});
function renderReview(){
  const list=$('#review-products');list.replaceChildren();
  for(const p of products.filter(p=>cart[p.id]>0)){
    const li=document.createElement('li'),name=document.createElement('span'),price=document.createElement('strong');
    name.textContent=cart[p.id]+' × '+p.name;price.textContent=money(cart[p.id]*p.price);
    if(p.flavorCount){const detail=document.createElement('small');detail.textContent='Sabores: '+flavorSummary(flavors[p.id]);name.append(detail);}
    if(p.provisionalPrice){const note=document.createElement('small');note.className='provisional';note.textContent='Precio provisorio · a confirmar';name.append(note);}
    li.append(name,price);list.append(li);
  }
  $('#review-total').textContent=money(total(cart));
  $('#shipping-label').textContent=delivery.mode==='delivery'?'Envío hasta 2 km':'Retiro en el local';
  $('#shipping-value').textContent=delivery.mode==='delivery'?'Gratis':'Sin costo';
  $('#review-data').textContent=[delivery.mode==='delivery'?'Delivery propio gratis · radio de 2 km desde el local': 'Take away · '+CONFIG.address,delivery.timing==='asap'?'Lo antes posible · espera a confirmar':delivery.date+' a las '+delivery.time,...(delivery.mode==='delivery'?[delivery.address,...(delivery.instructions?['Indicaciones: '+delivery.instructions]:[])]:[]),'Teléfono: '+delivery.phone,...($('#order-notes').value.trim()?['Aclaraciones: '+$('#order-notes').value.trim()]:[])].join('\n');
}
$('#send-order').disabled=!CONFIG.menuReady;
if(CONFIG.menuReady){$('#send-order').textContent='Abrir WhatsApp con mi pedido';}
$('#send-order').addEventListener('click',()=>{if(!CONFIG.menuReady)return;if(!flavorsComplete(cart,flavors)){setStep(1);return;}const data={...delivery,flavors,notes:$('#order-notes').value.trim(),payment:document.querySelector('input[name="payment"]:checked').value};const url=orderUrl(cart,data);emit('whatsapp_order_intent','review');window.location.assign(url);});
document.querySelectorAll('a.whatsapp').forEach(a=>{a.href=whatsappUrl('Hola, Ponzzoni. Quisiera consultar la carta y la zona de delivery.');a.target='_blank';a.rel='noopener noreferrer';a.addEventListener('click',()=>emit('whatsapp_consult_intent',a.dataset.placement||'unknown'));});
document.querySelectorAll('[data-track]').forEach(a=>a.addEventListener('click',()=>emit(a.dataset.track,'location')));
const toggle=$('.menu-toggle'),nav=$('#navigation');toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{toggle.setAttribute('aria-expanded','false');nav.classList.remove('open');}));
document.addEventListener('keydown',event=>{if(event.key==='Escape'){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');}});
setBusinessState();setInterval(setBusinessState,60000);
