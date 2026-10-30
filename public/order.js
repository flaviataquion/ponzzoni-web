import {products,empanadaFlavors} from './menu.js';
export {products,categories,empanadaFlavors} from './menu.js';
export const CONFIG = Object.freeze({whatsapp:'5491160472484',menuReady:true,address:'Coucheiro 213, Villa Sarmiento',deliveryRadiusKm:2});
export const money=n=>new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(n);
export function count(cart){return products.reduce((n,p)=>n+Math.max(0,Number(cart[p.id])||0),0);}
export function total(cart){return products.reduce((n,p)=>n+p.price*Math.max(0,Number(cart[p.id])||0),0);}
export function buenosAiresParts(now=new Date()){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Argentina/Buenos_Aires',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now);return Object.fromEntries(parts.map(p=>[p.type,p.value]));}
export function localDate(now=new Date()){const p=buenosAiresParts(now);return `${p.year}-${p.month}-${p.day}`;}
export function storeOpen(now=new Date()){const p=buenosAiresParts(now);const day=new Date(`${p.year}-${p.month}-${p.day}T12:00:00-03:00`).getUTCDay();return day!==1&&day!==2&&Number(p.hour)>=19&&Number(p.hour)<23;}
export function validSchedule(date,time,now=new Date()){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time))return false;
  const d=new Date(`${date}T${time}:00-03:00`),h=Number(time.slice(0,2)),min=Number(time.slice(3));
  if(!Number.isFinite(d.getTime())||h<19||h>=23||min>59||d<=now)return false;
  const weekday=new Date(`${date}T12:00:00-03:00`).getUTCDay();return weekday!==1&&weekday!==2;
}
export function flavorSummary(selection={}){return empanadaFlavors.filter(f=>selection[f.id]>0).map(f=>`${selection[f.id]} de ${f.name}`).join(', ');}
export function flavorsComplete(cart,flavors={}){return products.filter(p=>p.flavorCount&&cart[p.id]>0).every(p=>{const selection=flavors[p.id]||{};const values=Object.values(selection);return Object.keys(selection).every(id=>empanadaFlavors.some(f=>f.id===id))&&values.every(n=>Number.isInteger(n)&&n>=0)&&values.reduce((a,b)=>a+b,0)===p.flavorCount*cart[p.id];});}
export function message(cart,data){const lines=products.filter(p=>cart[p.id]>0).flatMap(p=>[`${cart[p.id]} × ${p.name} — ${money(p.price*cart[p.id])}${p.provisionalPrice?' (precio provisorio, a confirmar)':''}`,...(p.flavorCount?[`  Sabores: ${flavorSummary(data.flavors?.[p.id])}`]:[])]);return ['Hola, Ponzzoni. Quiero hacer este pedido:','',...lines,'',`Productos: ${money(total(cart))}`,`Modalidad: ${data.mode==='delivery'?'Delivery propio gratis (radio de 2 km desde el local)':'Take away'}`,`Horario: ${data.timing==='asap'?'Lo antes posible (demora a confirmar)':`${data.date} a las ${data.time}`}`,...(data.mode==='delivery'?[`Dirección: ${data.address}`,...(data.instructions?[`Indicaciones para la entrega: ${data.instructions}`]:[])]:[`Retiro en ${CONFIG.address}`]),`Teléfono: ${data.phone}`,`Pago: ${data.payment==='cash'?'Efectivo':'Transferencia'}`,...(data.notes?[`Aclaraciones del pedido: ${data.notes}`]:[]),'','¿Me confirman disponibilidad, cobertura de entrega, total y demora?'].join('\n');}
export function whatsappUrl(text){return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;}
export function orderUrl(cart,data){if(!CONFIG.menuReady)throw new Error('La carta todavía no admite pedidos.');if(!count(cart))throw new Error('Elegí al menos un producto.');if(!flavorsComplete(cart,data.flavors))throw new Error('Completá los sabores de tus empanadas.');return whatsappUrl(message(cart,data));}
