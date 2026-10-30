export const CONFIG = Object.freeze({whatsapp:'5491160472484',menuReady:false,address:'Coucheiro 213, Villa Sarmiento'});
export const categories=['Pizzas clásicas','Pizzas especiales','Empanadas','Calzones','Sandwiches'];
export const products=[
  {id:'muzzarella',name:'Muzzarella',category:categories[0],description:'Salsa de tomate, muzzarella y orégano.',price:12000,unit:'Grande · 8 porciones'},
  {id:'napolitana',name:'Napolitana',category:categories[0],description:'Muzzarella, tomate fresco y orégano.',price:14000,unit:'Grande · 8 porciones'},
  {id:'fugazzeta',name:'Fugazzeta',category:categories[1],description:'Muzzarella y cebolla fileteada.',price:14500,unit:'Grande · 8 porciones'},
  {id:'cuatro-quesos',name:'Cuatro quesos',category:categories[1],description:'Una combinación para los que quieren más queso.',price:16000,unit:'Grande · 8 porciones'},
  {id:'carne',name:'Empanada de carne',category:categories[2],description:'Relleno de carne.',price:2000,unit:'Por unidad'},
  {id:'jyq',name:'Empanada de jamón y queso',category:categories[2],description:'Jamón y queso.',price:2000,unit:'Por unidad'},
  {id:'calzone',name:'Calzone de jamón y queso',category:categories[3],description:'Masa de pizza rellena de jamón y queso.',price:15000,unit:'Por unidad'},
  {id:'sandwich',name:'Sandwich de lomito',category:categories[4],description:'Lomito con lechuga y tomate.',price:11000,unit:'Por unidad'}
];
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
export function message(cart,data){const lines=products.filter(p=>cart[p.id]>0).map(p=>`${cart[p.id]} × ${p.name} — ${money(p.price*cart[p.id])}`);return ['Hola, Ponzzoni. Quiero hacer este pedido:','',...lines,'',`Productos: ${money(total(cart))}`,`Modalidad: ${data.mode==='delivery'?'Delivery propio gratis':'Take away'}`,`Horario: ${data.timing==='asap'?'Lo antes posible (demora a confirmar)':`${data.date} a las ${data.time}`}`,...(data.mode==='delivery'?[`Dirección: ${data.address}`,...(data.instructions?[`Indicaciones para la entrega: ${data.instructions}`]:[])]:[`Retiro en ${CONFIG.address}`]),`Teléfono: ${data.phone}`,`Pago: ${data.payment==='cash'?'Efectivo':'Transferencia'}`,...(data.notes?[`Aclaraciones del pedido: ${data.notes}`]:[]),'','¿Me confirman disponibilidad, total y demora?'].join('\n');}
export function whatsappUrl(text){return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;}
export function orderUrl(cart,data){if(!CONFIG.menuReady)throw new Error('La carta de ejemplo no admite pedidos reales.');if(!count(cart))throw new Error('Elegí al menos un producto.');return whatsappUrl(message(cart,data));}
