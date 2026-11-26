{
/* ======================= APPatrullando la Ziudad · motor v0.7 (app instalable) =======================
   El motor no contiene contenido legal: lo carga del DLC (dlc/lopsc.json).
   Los lugares (mobiliario fijo, huecos) son del motor; las viñetas, del DLC. */
const PASA=6;
const SETS={via:['Vía penal · atestado','Vía administrativa · denuncia'],
 grav:['Muy grave · art. 35','Grave · art. 36','Leve · art. 37'],
 act:['Denuncia','Denuncia, intervención cautelar y acta','Denuncia y traslado para identificación','Requerimiento previo','Comunicar al Ministerio Fiscal (menor de 14)']};
let DLC=null;

/* ---------- utilidades ---------- */
const TW=32,TH=16,OX=560,OY=250,W0=1120,H0=780;
const P=(x,y,z=0)=>[OX+(x-y)*TW,OY+(x+y)*TH-z];
const f1=n=>Math.round(n*10)/10;
const pts=a=>a.map(p=>f1(p[0])+','+f1(p[1])).join(' ');
const poly=(a,fill)=>`<polygon points="${pts(a)}" fill="${fill}"/>`;
function rng(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const shuffle=(arr,r)=>{const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch(_){return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}};
const line=(a,b,st='')=>`<path class="ln" ${st?`style="${st}"`:''} d="M${pts([a,b])}"/>`;

/* ---------- kit de dibujo ---------- */
function box(x,y,w,d,h,z=0,fl=['#fff','#e4dfd3','#fff']){
 return poly([P(x,y+d,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x,y+d,z+h)],fl[0])
 +poly([P(x+w,y,z),P(x+w,y+d,z),P(x+w,y+d,z+h),P(x+w,y,z+h)],fl[1])
 +poly([P(x,y,z+h),P(x+w,y,z+h),P(x+w,y+d,z+h),P(x,y+d,z+h)],fl[2])}
function person(sx,sy,o={}){
 const s=o.kid?0.72:1,dk=o.uni?'#2b303b':o.bombero?'#5a4a3a':o.hood?'#3b3b3b':'#fff';let g='';
 const lift=o.sit?6:0;
 if(o.sit)g+=`<path class="ln" d="M-4,-12 L-10,-11 L-10,0 M3,-12 L-4,-11 L-4,0"/>`;
 else g+=`<path class="ln" d="M-3,-14 L-4,0 M3,-14 L4,0"/>`;
 g+=`<rect x="-6" y="${-29+lift}" width="12" height="16" rx="4" fill="${dk}"/>`;
 if(o.chaleco)g+=`<rect x="-6.5" y="${-28+lift}" width="13" height="13" rx="2" fill="#efe3b0"/><path class="ln" style="stroke:#7d776b;stroke-width:1.4" d="M-6,${-20+lift} h12"/><text x="-5.6" y="${-23+lift}" font-size="3.6" font-weight="800">POLICÍA</text>`;
 if(o.gabardina)g+=o.abre?`<path d="M-6,${-28+lift} L-19,${-24+lift} L-17,${-5+lift} L-5,${-9+lift} Z" fill="#7d776b"/><path d="M6,${-28+lift} L19,${-24+lift} L17,${-5+lift} L5,${-9+lift} Z" fill="#7d776b"/>`:`<path d="M-7,${-28+lift} L7,${-28+lift} L8,${-5+lift} L-8,${-5+lift} Z" fill="#7d776b"/>`;
 if(o.tunica)g+=`<path d="M-7,${-28+lift} L7,${-28+lift} L9,0 L-9,0 Z" fill="#2b303b"/>`;
 if(o.tec)g+=`<path class="ln" style="stroke-width:1.4" d="M-5,${-22+lift} h10"/>`;
 const sh=-26+lift;
 const arms={none:`M-6,${sh} L-8,${sh+11} M6,${sh} L8,${sh+11}`,up:`M-6,${sh} L-8,${sh+11} M6,${sh} L12,${sh-11}`,aim:`M-6,${sh} L-8,${sh+11} M6,${sh} L15,${sh-3}`,
  punch:`M-6,${sh} L-9,${sh+9} M6,${sh+1} L19,${sh}`,cross:`M-6,${sh+2} L5,${sh+6} M6,${sh+2} L-5,${sh+6}`,
  phone:`M-6,${sh} L-2,${sh+6} M6,${sh} L2,${sh+6}`,hold:`M-6,${sh} L-8,${sh+11} M6,${sh} L13,${sh+3}`};
 g+=`<path class="ln" d="${arms[o.arm||'none']}"/>`;
 const hand={none:[8,sh+11],up:[12,sh-11],aim:[15,sh-3],hold:[13,sh+3],phone:[0,sh+6],cross:[0,sh+6],punch:[19,sh]}[o.arm||'none'];
 const it=o.item;
 if(it==='bottle')g+=`<rect x="${hand[0]-1.5}" y="${hand[1]-7}" width="3.5" height="9" rx="1" fill="#161616"/>`;
 if(it==='navaja')g+=`<path d="M${hand[0]},${hand[1]} l9,-5" style="stroke-width:2.2"/><path d="M${hand[0]-2},${hand[1]+1} l4,-2" style="stroke-width:3.5"/>`;
 if(it==='carabina')g+=`<path d="M-2,${sh+2} L26,${sh-5}" style="stroke-width:3"/><path d="M-4,${sh+3} l-3,5" style="stroke-width:4"/>`;
 if(it==='bate')g+=`<path d="M${hand[0]},${hand[1]+2} L${hand[0]+4},${hand[1]-18}" style="stroke-width:4;stroke-linecap:round"/>`;
 if(it==='cadena')g+=`<path class="ln" style="stroke-width:1.6;stroke-dasharray:2 1.5" d="M${hand[0]},${hand[1]} q6,8 0,14 q-5,4 -2,8"/>`;
 if(it==='boletin')g+=`<rect x="${hand[0]-1}" y="${hand[1]-6}" width="6" height="8" fill="#fff"/>`;
 if(it==='bolsabate')g+=`<rect x="-12" y="-12" width="22" height="9" rx="3" fill="#fff"/><path d="M6,-12 L12,-24" style="stroke-width:4;stroke-linecap:round"/>`;
 if(it==='correa')g+=`<path class="ln" d="M${hand[0]},${hand[1]} q8,6 14,14"/>`;
 if(it==='cafe')g+=`<rect x="${hand[0]-1}" y="${hand[1]-4}" width="4" height="4" fill="#fff"/>`;
 if(it==='laser')g+=`<rect x="${hand[0]-2}" y="${hand[1]-1.5}" width="7" height="2.6" rx="1" fill="#161616"/>`;
 if(it==='linterna')g+=`<rect x="${hand[0]-3}" y="${hand[1]-2.5}" width="10" height="5" rx="1.5" fill="#161616"/>`;
 if(it==='espray')g+=`<rect x="${hand[0]-1.5}" y="${hand[1]-8}" width="4" height="9" rx="1" fill="#c8102e" style="stroke:#161616"/>`;
 if(it==='lata')g+=`<rect x="${hand[0]-1.5}" y="${hand[1]-6}" width="3.5" height="6" fill="#fff"/>`;
 if(it==='liar')g+=`<rect x="${hand[0]-4}" y="${hand[1]-2}" width="8" height="2.6" fill="#fff"/>`;
 if(it==='porro')g+=`<path class="ln" style="stroke-width:1.8" d="M${hand[0]},${hand[1]} l5,-2"/><circle cx="${hand[0]+5.5}" cy="${hand[1]-2.2}" r="1.2" fill="#c8102e" style="stroke:none"/>`;
 if(it==='bengala')g+=`<path class="ln" style="stroke-width:2.4" d="M${hand[0]},${hand[1]+2} l2,-9"/><circle cx="${hand[0]+2}" cy="${hand[1]-8}" r="4.5" fill="#c8102e" style="stroke:none"/><circle cx="${hand[0]+2}" cy="${hand[1]-8}" r="2" fill="#fff" style="stroke:none"/>`;
 if(it==='tambor')g+=`<ellipse cx="0" cy="${-16+lift}" rx="9" ry="3.5" fill="#fff"/><path d="M-9,${-16+lift} v7 a9,3.5 0 0 0 18,0 v-7" fill="#c8102e"/><path class="ln" d="M${hand[0]},${hand[1]} l-6,-6"/>`;
 if(it==='megafono')g+=`<path d="M${hand[0]},${hand[1]-1} l9,-4 v10 z" fill="#fff"/>`;
 if(it==='camara')g+=`<rect x="${hand[0]-3}" y="${hand[1]-4}" width="9" height="7" rx="1" fill="#161616"/>`;
 if(it==='cirio')g+=`<path class="ln" style="stroke:#fff;stroke-width:2.4" d="M${hand[0]},${hand[1]+3} v-14"/><circle cx="${hand[0]}" cy="${hand[1]-12}" r="1.8" fill="#c8102e" style="stroke:none"/>`;
 if(o.arm==='phone')g+=`<rect x="-2" y="${sh+3}" width="5" height="7" fill="#161616"/>`;
 const hy=-34+lift;
 if(o.hood)g+=`<circle cx="0" cy="${hy}" r="6.5" fill="#3b3b3b"/><ellipse cx="1.5" cy="${hy+0.5}" rx="2.6" ry="3" fill="#fff"/>`;
 else g+=`<circle cx="0" cy="${hy}" r="5" fill="#fff"/>`;
 if(o.cap)g+=`<path d="M-5,${hy-1} A5,5 0 0 1 5,${hy-1} Z" fill="#161616"/><path class="ln" style="stroke-width:2" d="M3,${hy-1} L9,${hy}"/>`;
 if(o.uni)g+=`<path d="M-5.5,${hy-2} L5.5,${hy-2} L5,${hy-7} L-5,${hy-7} Z" fill="#2b303b"/><path class="ln" style="stroke-width:2" d="M3,${hy-2} L8,${hy-1.5}"/><path class="ln" style="stroke:#fff;stroke-width:1.4" d="M-5,${-21+lift} h10"/>`;
 if(o.bombero)g+=`<path d="M-6,${hy-1} q6,-10 12,0 z" fill="#161616"/><path class="ln" style="stroke:#fff;stroke-width:1.4" d="M-5,${-19+lift} h10"/>`;
 if(o.bowler)g+=`<path d="M-4.5,${hy-2} q0,-8 4.5,-8 q4.5,0 4.5,8 z" fill="#161616"/><path class="ln" style="stroke-width:2" d="M-8,${hy-2} h16"/>`;
 if(o.hair)g+=`<path d="M-5,${hy} q0,-7 5,-6 q5,-1 5,6 q-2,-3 -5,-3 q-3,0 -5,3 z" fill="#161616"/>`;
 return `<g transform="translate(${f1(sx)},${f1(sy)}) scale(${o.flip?-s:s},${s})${o.caida?' rotate(-82)':''}">${g}</g>`;
}
function bubble(x,y,txt){const w=Math.round(txt.length*5.3+18),bx=x-10,by=y-30;
 return `<g class="bub"><path d="M${bx},${by} h${w} v20 h-${w-22} l-6,8 l0,-8 h-16 z" fill="#fff" style="stroke:#161616"/><text x="${bx+9}" y="${by+14}" font-size="11" font-weight="700" style="fill:#161616">${esc(txt)}</text></g>`}
function wheels(list){return list.map(([a,b])=>{const w=P(a,b);return `<ellipse cx="${f1(w[0])}" cy="${f1(w[1])}" rx="5" ry="4" fill="#161616"/>`}).join('')}
function car(x,y,o={}){const bd=o.gris?['#bfb7a5','#a9a293','#cfc8b8']:['#fff','#e4dfd3','#fff'];let s=box(x,y,2.3,1,11,3,bd)+box(x+0.55,y+0.1,1.15,0.8,9,14,['#f0ece2','#d9d3c6','#fff'])+wheels([[x+0.4,y+1],[x+1.9,y+1]]);
 if(o.pita){const t=P(x+2.3,y+0.2,22);s+=`<path class="ln" style="stroke-width:1.6" d="M${f1(t[0]+4)},${f1(t[1]-2)} l7,-5 M${f1(t[0]+5)},${f1(t[1]+3)} l9,-1 M${f1(t[0]+2)},${f1(t[1]-7)} l3,-7"/>`}
 if(o.taxi){const t=P(x+1.1,y+0.5,25);s+=`<rect x="${f1(t[0]-7)}" y="${f1(t[1]-5)}" width="14" height="6" fill="#fff"/><text x="${f1(t[0]-6)}" y="${f1(t[1])}" font-size="5.5" font-weight="800">TAXI</text>`}
 if(o.fuego)s+=flames(P(x+0.4,y+1,10),0.7);return s}
function flames(c,k=1){return `<path d="M${f1(c[0]-8*k)},${f1(c[1])} q2,${-14*k} ${6*k},${-18*k} q1,${8*k} ${4*k},${6*k} q2,${-10*k} ${6*k},${-14*k} q4,${12*k} ${0},${26*k} z" fill="#161616"/>`}
function tree(x,y){const c=P(x,y);return `<path class="ln" d="M${c[0]},${c[1]} v-34"/><circle cx="${c[0]-9}" cy="${c[1]-44}" r="13" fill="#fff"/><circle cx="${c[0]+9}" cy="${c[1]-46}" r="14" fill="#fff"/><circle cx="${c[0]}" cy="${c[1]-58}" r="15" fill="#fff"/>`}
function farola(x,y){const c=P(x,y);return `<path class="ln" d="M${c[0]},${c[1]} v-74 h8"/><path d="M${c[0]+4},${c[1]-74} h10 l-3,7 h-4 z" fill="#fff"/>`}
function banco(x,y){return box(x,y,1.3,0.45,2,7)+box(x,y-0.05,1.3,0.1,9,9)}
function mesa(x,y){return box(x-0.15,y-0.15,0.55,0.55,1.5,12)+`<path class="ln" d="M${pts([P(x+0.12,y+0.12),P(x+0.12,y+0.12,12)])}"/>`}
function columpio(x,y){const a=P(x,y),b=P(x+1.2,y);return `<path class="ln" d="M${f1(a[0])},${f1(a[1])} l6,-44 l6,44 M${f1(b[0])},${f1(b[1])} l6,-44 l6,44 M${f1(a[0]+6)},${f1(a[1]-44)} L${f1(b[0]+6)},${f1(b[1]-44)} M${f1(a[0]+20)},${f1(a[1]-38)} v24 M${f1(a[0]+28)},${f1(a[1]-34)} v24"/><rect x="${f1(a[0]+18)}" y="${f1(a[1]-14)}" width="12" height="3" fill="#161616"/>`}
function marquesina(x,y,len=2.4){return [[x-0.5,y-0.4],[x+len-0.6,y-0.4]].map(([a,b])=>{const c=P(a,b);return `<path class="ln" d="M${f1(c[0])},${f1(c[1])} v-46"/>`}).join('')+poly([P(x-0.7,y-0.6,46),P(x+len-0.4,y-0.6,46),P(x+len-0.4,y+0.2,46),P(x-0.7,y+0.2,46)],'#fff')}
const KIT={
 latas:(x,y)=>{let s=box(x-0.3,y-0.2,1.1,0.4,2,6);[[0,0],[0.3,0],[0.6,0]].forEach(([a,b])=>{const c=P(x+a,y+b,8);s+=`<rect x="${f1(c[0]-2)}" y="${f1(c[1]-7)}" width="4" height="7" fill="#fff"/>`});return s},
 coche:(x,y,o)=>car(x,y,o),
 ambu:(x,y,o)=>{let s=box(x,y,2.6,1.05,22,3,['#fff','#e4dfd3','#fff']);const c=P(x+1.3,y+1.05,14);s+=`<path d="M${f1(c[0]-5)},${f1(c[1])} h10 M${f1(c[0])},${f1(c[1]-5)} v10" style="stroke-width:3"/>`+wheels([[x+0.4,y+1.05],[x+2.2,y+1.05]]);
  if(o.luces){const t=P(x+0.3,y+0.5,26);s+=`<path class="ln" style="stroke-width:1.4" d="M${f1(t[0]-4)},${f1(t[1]-4)} l-5,-5 M${f1(t[0]+4)},${f1(t[1]-4)} l5,-5 M${f1(t[0])},${f1(t[1]-6)} v-6"/>`}
  return s+box(x+0.15,y+0.35,0.35,0.35,3,25,['#161616','#161616','#161616'])},
 bomberos:(x,y)=>box(x,y,3.2,1.1,24,3,['#fff','#d9d3c6','#fff'])+line(P(x+0.2,y+0.5,30),P(x+3,y+0.5,30),'stroke-width:1.5')+[0.4,1.2,2].map(d=>line(P(x+d,y+0.5,27),P(x+d,y+0.5,31))).join('')+wheels([[x+0.5,y+1.1],[x+2.7,y+1.1]]),
 cont:(x,y,o)=>box(x,y,0.9,0.7,22,0,['#fff','#d9d3c6','#f0ece2'])+(o.fuego?flames(P(x+0.45,y+0.35,22),1.1):''),
 humo:(x,y)=>{const c=P(x,y,30);return `<path class="ln" style="stroke:#7d776b;stroke-width:2" d="M${f1(c[0])},${f1(c[1])} q-10,-14 0,-24 q10,-10 -2,-24 q-10,-12 4,-22"/><path class="ln" style="stroke:#7d776b;stroke-width:2" d="M${f1(c[0]+8)},${f1(c[1]-4)} q8,-14 -2,-26"/>`},
 cinta:(x,y)=>line(P(x-0.6,y,12),P(x+1.2,y,12),'stroke-dasharray:6 4;stroke-width:2'),
 camilla:(x,y)=>box(x,y,1.1,0.4,2,10,['#fff','#e4dfd3','#fff'])+line(P(x+0.1,y+0.4),P(x+0.1,y+0.4,10))+line(P(x+1,y+0.4),P(x+1,y+0.4,10)),
 perro:(x,y,o)=>{const c=P(x,y),k=o.g?1.4:1;return `<g transform="translate(${f1(c[0])},${f1(c[1])}) scale(${o.flip?-k:k},${k})"><ellipse cx="0" cy="-8" rx="9" ry="5" fill="${o.g?'#161616':'#fff'}"/><circle cx="9" cy="-13" r="4.5" fill="${o.g?'#161616':'#fff'}"/><path class="ln" d="M-6,-5 v6 M6,-5 v6 M-9,-9 l-4,-4"/></g>`},
 cartel:(x,y,o)=>{const c=P(x,y);return `<path class="ln" d="M${f1(c[0])},${f1(c[1])} v-40"/><rect x="${f1(c[0]-26)}" y="${f1(c[1]-58)}" width="52" height="18" fill="#fff"/><text x="${f1(c[0]-22)}" y="${f1(c[1]-45)}" font-size="8.5" font-weight="700">${esc(o.t||'')}</text>`},
 valla:(x,y)=>[0,0.6,1.2,1.8].map(d=>line(P(x+d,y),P(x+d,y,14))).join('')+line(P(x,y,12),P(x+1.8,y,12))+line(P(x,y,5),P(x+1.8,y,5)),
 /* --- kit v0.9 (lote 3) --- */
 pancarta:(x,y,o)=>{const w=o.w||1.6;if(o.caida)return poly([P(x,y),P(x+w,y+0.2),P(x+w,y+0.6),P(x,y+0.4)],'#fff')+sign(x+0.2,y+0.3,0,esc(o.t||''),6);
  return line(P(x,y),P(x,y,36),'stroke-width:2')+line(P(x+w,y),P(x+w,y,36),'stroke-width:2')+poly([P(x,y,20),P(x+w,y,20),P(x+w,y,35),P(x,y,35)],'#fff')+sign(x+0.15,y,24,esc(o.t||''),7)},
 estallido:(x,y,o)=>{const c=P(x,y,o.z||14),k=o.s||1;let d='';for(let i=0;i<10;i++){const a=i*Math.PI/5,r1=4*k,r2=(i%2?11:16)*k;d+=`M${f1(c[0]+Math.cos(a)*r1)},${f1(c[1]+Math.sin(a)*r1)} L${f1(c[0]+Math.cos(a)*r2)},${f1(c[1]+Math.sin(a)*r2)} `}
  return `<path class="ln" style="stroke:#c8102e;stroke-width:2.2" d="${d}"/><circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(3.5*k)}" fill="#fff" style="stroke:#c8102e"/>`},
 humorojo:(x,y,o)=>{const c=P(x,y,o.z||30);return `<path class="ln" style="stroke:#d6697a;stroke-width:3" d="M${f1(c[0])},${f1(c[1])} q-12,-12 -2,-22 q12,-10 0,-24 q-8,-10 6,-18"/><path class="ln" style="stroke:#d6697a;stroke-width:2" d="M${f1(c[0]+10)},${f1(c[1]-6)} q10,-12 0,-26"/>`},
 vallacaida:(x,y,o)=>{let s=poly([P(x,y),P(x+1.8,y),P(x+1.8,y+0.35),P(x,y+0.35)],'none')+[0,0.6,1.2,1.8].map(d=>line(P(x+d,y),P(x+d,y+0.35))).join('');
  if(o.obra)s+=line(P(x+0.3,y+0.17),P(x+1.5,y+0.17),'stroke:#c8102e;stroke-width:3');return s},
 manta:(x,y)=>{let s=poly([P(x,y),P(x+1.6,y),P(x+1.6,y+1.0),P(x,y+1.0)],'#e7e2d6');[[0.3,0.25],[0.8,0.3],[1.2,0.6],[0.5,0.7]].forEach(([a,b],i)=>{const c=P(x+a,y+b);s+=i%2?`<rect x="${f1(c[0]-5)}" y="${f1(c[1]-6)}" width="10" height="7" rx="1" fill="#fff"/>`:`<path class="ln" style="stroke-width:2" d="M${f1(c[0]-6)},${f1(c[1]-1)} h4 m3,0 h4"/>`});return s},
 mesaplegable:(x,y)=>{let s=box(x,y,1.4,0.7,1,12,['#fff','#e4dfd3','#f0ece2'])+line(P(x+0.1,y+0.7),P(x+0.1,y+0.7,12))+line(P(x+1.3,y+0.7),P(x+1.3,y+0.7,12));
  [[0.2,0.2],[0.6,0.3],[1.0,0.2]].forEach(([a,b])=>{const c=P(x+a,y+b,13);s+=`<rect x="${f1(c[0]-4)}" y="${f1(c[1]-6)}" width="8" height="6" fill="#d9d3c6"/>`});return s},
 macetas:(x,y,o)=>{const z=o.z||10;let s=poly([P(x-0.1,y,z),P(x+1.2,y,z),P(x+1.2,y,z+2),P(x-0.1,y,z+2)],'#e4dfd3');
  [0.15,0.55,0.95].forEach(d=>{const c=P(x+d,y,z+2);s+=`<path d="M${f1(c[0]-3.5)},${f1(c[1])} h7 l-1,-6 h-5 z" fill="#c8a882"/><path class="ln" style="stroke:#5f7a4e;stroke-width:1.6" d="M${f1(c[0])},${f1(c[1]-6)} l-6,-12 M${f1(c[0])},${f1(c[1]-6)} l1,-15 M${f1(c[0])},${f1(c[1]-6)} l7,-11 M${f1(c[0])},${f1(c[1]-6)} l-9,-5 M${f1(c[0])},${f1(c[1]-6)} l9,-4"/>`});return s},
 carro:(x,y)=>{const c=P(x,y);return `<path d="M${f1(c[0]-4)},${f1(c[1]-18)} h9 l-1,15 h-7 z" fill="#c8102e"/><path class="ln" d="M${f1(c[0]+5)},${f1(c[1]-18)} l3,-6"/><circle cx="${f1(c[0])}" cy="${f1(c[1]-1)}" r="2.5" fill="#161616"/>`},
 ruido:(x,y,o)=>{const c=P(x,y,o.z||40);return `<path class="ln" style="stroke-width:1.8" d="M${f1(c[0]-14)},${f1(c[1])} l4,-6 l4,6 l4,-6 l4,6 l4,-6 l4,6 M${f1(c[0]-10)},${f1(c[1]-10)} l4,-6 l4,6 l4,-6 l4,6"/>`},
 rotulo:(x,y,o)=>{const z=o.z||60;return poly([P(x,y,z),P(x+1.6,y,z),P(x+1.6,y,z+12),P(x,y,z+12)],'#efe3b0')+sign(x+0.15,y,z+3,esc(o.t||'BAR'),8)},
 /* --- kit v0.6 (lote 2) --- */
 bus:(x,y,o)=>{let s=box(x,y,3.8,1.1,26,3,['#fff','#e4dfd3','#fff']);
  for(let d=0.25;d<3.2;d+=0.62)s+=poly([P(x+d,y+1.1,15),P(x+d+0.45,y+1.1,15),P(x+d+0.45,y+1.1,24),P(x+d,y+1.1,24)],'#f0ece2');
  s+=poly([P(x+3.8,y+0.12,13),P(x+3.8,y+0.98,13),P(x+3.8,y+0.98,25),P(x+3.8,y+0.12,25)],'#d9d3c6');
  const t=P(x+3.25,y+1.1,8);s+=`<text x="${f1(t[0]-4)}" y="${f1(t[1])}" font-size="7" font-weight="800">24</text>`;
  s+=wheels([[x+0.6,y+1.1],[x+3.1,y+1.1]]);
  if(o.frena)[0.25,0.85].forEach(d=>{s+=line(P(x-1.4,y+d),P(x-0.15,y+d),'stroke-width:2;stroke-dasharray:5 3')});return s},
 heli:(x,y,o)=>{const c=P(x,y,o.z||170),k=o.s||1;return `<g transform="translate(${f1(c[0])},${f1(c[1])}) rotate(${o.rot||0}) scale(${k})"><path class="ln" style="stroke-width:2.2" d="M-26,-13 L28,-15"/><path class="ln" d="M0,-8 v-6"/><ellipse cx="0" cy="0" rx="16" ry="8" fill="#fff"/><path class="ln" d="M14,-2 L40,-6 M40,-13 v13"/><path class="ln" style="stroke:#c8102e;stroke-width:2.4" d="M-5,0 h10 M0,-5 v10"/><path class="ln" d="M-9,7 l-3,6 h24 M7,7 l3,6"/></g>`},
 haz:(x,y,o)=>{const hp=c=>[c[0]+(o.flip?-15:15),c[1]-29];const a=o.s?P(x+o.s[0],y+o.s[1],o.s[2]):hp(P(x,y));
  const b=o.face?(c=>[c[0],c[1]-34])(P(x+o.face[0],y+o.face[1])):P(x+o.e[0],y+o.e[1],o.e[2]);
  if(o.c==='luz'){const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;
   return `<polygon class="nos" points="${pts([[a[0]+nx*2,a[1]+ny*2],[b[0]+nx*10,b[1]+ny*10],[b[0]-nx*10,b[1]-ny*10],[a[0]-nx*2,a[1]-ny*2]])}" fill="#f5df6a" fill-opacity="0.7" style="stroke:none"/>`}
  const col=o.c==='verde'?'#1fa84a':'#e0242f';
  return `<path class="ln" style="stroke:${col};stroke-width:1.5" d="M${pts([a,b])}"/><circle cx="${f1(b[0])}" cy="${f1(b[1])}" r="3.2" fill="${col}" style="stroke:none"/>`},
 neum:(x,y)=>{let s='';[[0,0,0],[0,0,6],[0.55,0.15,0],[0.25,0.5,0]].forEach(([a,b,z])=>{const c=P(x+a,y+b,z);s+=`<ellipse cx="${f1(c[0])}" cy="${f1(c[1]-3)}" rx="10" ry="5" fill="#161616"/><ellipse cx="${f1(c[0])}" cy="${f1(c[1]-4)}" rx="4" ry="1.8" fill="#3b3b3b"/>`});return s},
 vallaobra:(x,y)=>{let s=line(P(x+0.1,y),P(x+0.1,y,16))+line(P(x+1.5,y),P(x+1.5,y,16))+poly([P(x,y,7),P(x+1.6,y,7),P(x+1.6,y,16),P(x,y,16)],'#fff');
  for(let d=0.15;d<1.6;d+=0.4)s+=line(P(x+d,y,7.5),P(x+Math.min(d+0.25,1.6),y,15.5),'stroke:#c8102e;stroke-width:3');return s},
 altavoz:(x,y,o)=>{let s=box(x,y,0.45,0.4,11,0,['#2b303b','#161616','#3b3b3b']);const c=P(x+0.2,y+0.4,6);s+=`<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="3" fill="#fff"/>`;
  if(o.notas){const t=P(x+0.3,y,26);s+=`<text x="${f1(t[0])}" y="${f1(t[1])}" font-size="13" font-weight="800">♪</text><text x="${f1(t[0]+11)}" y="${f1(t[1]-9)}" font-size="11" font-weight="800">♫</text>`}return s},
 mesavolcada:(x,y)=>poly([P(x,y,0),P(x+0.6,y,0),P(x+0.6,y,9),P(x,y,9)],'#fff')+line(P(x+0.3,y,4.5),P(x+0.3,y+0.75,4.5)),
 silla:(x,y)=>line(P(x,y),P(x+0.5,y+0.1))+line(P(x+0.5,y+0.1),P(x+0.5,y+0.1,5))+line(P(x,y),P(x,y+0.4)),
 camion:(x,y)=>{let s=box(x,y,2.8,1.15,32,3,['#fff','#e4dfd3','#fff'])+box(x+2.8,y+0.1,0.9,1.0,20,3,['#fff','#d9d3c6','#fff']);const t=P(x+0.4,y+1.15,16);
  s+=`<text x="${f1(t[0])}" y="${f1(t[1])}" font-size="7" font-weight="800" transform="rotate(26.6 ${f1(t[0])} ${f1(t[1])})">MUDANZAS</text>`;return s+wheels([[x+0.5,y+1.15],[x+3.2,y+1.1]])},
 sofa:(x,y)=>box(x,y,1.2,0.5,7,0,['#e4dfd3','#d9d3c6','#ece7dc'])+box(x,y,1.2,0.14,14,0,['#e4dfd3','#d9d3c6','#ece7dc']),
 nevera:(x,y)=>box(x,y,0.5,0.5,30,0,['#fff','#e4dfd3','#fff'])+line(P(x+0.1,y+0.5,18),P(x+0.1,y+0.5,26),'stroke-width:1.6'),
 pintada:(x,y,o)=>{const c=P(x+0.6,y,o.z||24);return `<path class="ln" style="stroke:#c8102e;stroke-width:2.6" d="M${f1(c[0]-20)},${f1(c[1]+4)} q5,-16 10,-2 q4,10 8,-6 q3,-8 6,4 q4,10 8,-10 l6,8"/>`},
 carteles:(x,y,o)=>{let s='';for(let i=0;i<(o.n||1);i++){const c=P(x,y,(o.z||30)-i*11);s+=`<rect x="${f1(c[0]-5+i*2)}" y="${f1(c[1]-9)}" width="9" height="11" fill="#fff"/><path class="ln" d="M${f1(c[0]-3+i*2)},${f1(c[1]-5)} h5 M${f1(c[0]-3+i*2)},${f1(c[1]-2)} h4"/>`}return s},
 cubo:(x,y)=>{const c=P(x,y);return `<path d="M${f1(c[0]-5)},${f1(c[1]-9)} h10 l-1.5,9 h-7 z" fill="#fff"/><path class="ln" d="M${f1(c[0]+1)},${f1(c[1]-8)} l5,-9"/>`},
 latasuelo:(x,y)=>[[0,0],[0.3,0.15],[-0.2,0.25],[0.5,-0.1]].map(([a,b],i)=>{const c=P(x+a,y+b);return i%2?`<rect x="${f1(c[0]-3)}" y="${f1(c[1]-3)}" width="6" height="3" fill="#fff"/>`:`<rect x="${f1(c[0]-1.5)}" y="${f1(c[1]-6)}" width="3" height="6" fill="#fff"/>`}).join(''),
 bolsita:(x,y,o)=>{const c=P(x,y,o.z||0);return `<rect x="${f1(c[0]-3)}" y="${f1(c[1]-3)}" width="${o.g?8:5}" height="${o.g?5:3.5}" rx="1" fill="${o.g?'#fff':'#161616'}"/>`},
 humillo:(x,y)=>{const c=P(x,y);return `<path class="ln" style="stroke:#7d776b" d="M${f1(c[0]+20)},${f1(c[1]-26)} q-4,-6 1,-10 q5,-4 0,-10"/>`},
 vecino:(x,y,o)=>{const c=o.abs?P(o.abs[0],o.abs[1],o.z||28):P(x,y,o.z||28);return `<rect x="${f1(c[0]-5)}" y="${f1(c[1]-4)}" width="10" height="6" rx="2" fill="#2b303b"/><circle cx="${f1(c[0])}" cy="${f1(c[1]-8)}" r="4" fill="#fff"/>`},
 buzon:(x,y)=>box(x,y,0.45,0.4,17,0,['#efe3b0','#d9c77a','#efe3b0'])+line(P(x+0.1,y+0.4,13),P(x+0.35,y+0.4,13),'stroke-width:2'),
 panel:(x,y)=>line(P(x,y),P(x,y,20),'stroke-width:2')+poly([P(x-0.5,y,20),P(x+0.5,y,20),P(x+0.5,y,40),P(x-0.5,y,40)],'#fff')+sign(x-0.35,y,27,'INFO',7),
 bici:(x,y,o)=>{const c=P(x,y);const f=o.flip?-1:1;return `<g transform="translate(${f1(c[0])},${f1(c[1])}) scale(${f},1)"><circle cx="-9" cy="-5" r="6" fill="none"/><circle cx="9" cy="-5" r="6" fill="none"/><path class="ln" d="M-9,-5 L-2,-14 L7,-14 L9,-5 M-2,-14 L0,-5"/></g>`+person(c[0],c[1]-4,{arm:'aim',flip:o.flip,cap:1})},
};
const NOANCH=new Set(['pancarta','estallido','humorojo','vallacaida','manta','mesaplegable','macetas','carro','ruido','rotulo','humo','cinta','cartel','valla','latas','cont','camilla','haz','heli','neum','vallaobra','altavoz','mesavolcada','silla','sofa','nevera','pintada','carteles','cubo','latasuelo','bolsita','humillo','vecino','buzon','panel']);
function anchorPts(el,x,y){const c=P(x,y);if(el==='coche'||el==='ambu')return [c,P(x+2.3,y+1)];if(el==='bomberos')return [c,P(x+3,y+1)];if(el==='bus')return [c,P(x+3.8,y+1.1)];if(el==='camion')return [c,P(x+3.7,y+1.1)];if(NOANCH.has(el))return [];return [c]}

/* ---------- lugares ---------- */
function winFront(x0,x1,y,h,lit){let s='';for(let x=x0+0.35;x<x1-0.5;x+=1)for(let z=24;z<h-14;z+=26){const on=lit&&((x*7+z)%3<1.1);s+=poly([P(x,y,z),P(x+0.5,y,z),P(x+0.5,y,z+15),P(x,y,z+15)],on?'#efe3b0':'#fff')}return s}
function winSide(y0,y1,x,h,lit){let s='';for(let y=y0+0.35;y<y1-0.5;y+=1)for(let z=24;z<h-14;z+=26){const on=lit&&((y*5+z)%3<1.1);s+=poly([P(x,y,z),P(x,y+0.5,z),P(x,y+0.5,z+15),P(x,y,z+15)],on?'#efe3b0':'#fff')}return s}
const sign=(x,y,z,t,fs=10)=>{const c=P(x,y,z);return `<text x="${f1(c[0])}" y="${f1(c[1])}" font-size="${fs}" font-weight="800" transform="rotate(26.6 ${f1(c[0])} ${f1(c[1])})">${t}</text>`};
const road=()=>poly([P(-2.5,12),P(16,12),P(16,15.5),P(-2.5,15.5)],'#d9d3c6')+line(P(-2.5,13.75),P(16,13.75),'stroke-dasharray:10 8')+poly([P(-2.5,15.5),P(16,15.5),P(16,16.6),P(-2.5,16.6)],'#ebe6da');
const LUGARES={
 estacion:{nombre:'Estación de autobuses',noche:true,turno:'noche',horas:['23:50','00:00','00:10'],
  huecos:{parada:[[1.6,7.4],[6.6,7.4],[11.6,7.4],[10.2,8.2]],calzada:[[0.4,13.1],[4.4,13.1],[8.4,13.1],[12.4,13.1],[-2.1,13.1]],portal_local:[[3.4,0.5],[9.4,0.5],[6.4,0.5],[0.8,0.5]],terraza:[[13.2,1.9]],plaza:[[5,10.2],[10,10.4],[2.4,10.0],[7.6,10.2]],parque:[[14.6,9.6]]},
  suelo(){let s=poly([P(-2.5,0),P(0,0),P(0,12),P(-2.5,12)],'#ebe6da')+poly([P(0,0),P(16,0),P(16,12),P(0,12)],'#f3efe6');
   for(let k=0;k<3;k++){const y0=5.6,x0=0.6+k*5;s+=poly([P(x0,y0),P(x0+4,y0),P(x0+4,y0+3.4),P(x0,y0+3.4)],'#e7e2d6');[0,1,2,3].forEach(d=>{s+=line(P(x0+d+0.5,y0),P(x0+d+0.5,y0+3.4),'stroke:#bfb7a5')})}
   s+=poly([P(13.6,8.6),P(16,8.6),P(16,11.4),P(13.6,11.4)],'#eef0e6');
   return s+road()},
  edificios(){let s=box(-2.6,0,2.6,12,140,0,['#fff','#ece7dc','#fff'])+winSide(0,12,0,140,true);
   s+=box(0,-3.2,16,3.2,70)+winFront(0,16,0,70,true);
   s+=poly([P(3,0,0),P(4.2,0,0),P(4.2,0,30),P(3,0,30)],'#e4dfd3')+poly([P(9,0,0),P(10.2,0,0),P(10.2,0,24),P(9,0,24)],'#e4dfd3');
   s+=sign(1.2,0,58,'ESTACIÓN DE AUTOBUSES',13)+sign(9.2,0,30,'CAFETERÍA',9);return s},
  mobiliario(){const L=[];[[1.6,7.4],[6.6,7.4],[11.6,7.4]].forEach(([x,y],i)=>{L.push({z:x+y-1,s:marquesina(x-0.6,y-1.2,3.6)});const c=P(x+2.9,y-1.4,52);L.push({z:x+y-1,s:`<text x="${f1(c[0])}" y="${f1(c[1])}" font-size="9" font-weight="800">DÁRSENA ${i+1}</text>`})});
   L.push({z:18.6,s:box(11.6,6,3.4,1.2,26,3,['#fff','#e4dfd3','#fff'])+wheels([[12,7.2],[14.6,7.2]])+[0.5,1.3,2.1,2.9].map(d=>poly([P(11.6+d,7.2,14),P(11.6+d+0.5,7.2,14),P(11.6+d+0.5,7.2,22),P(11.6+d,7.2,22)],'#f0ece2')).join('')});
   [[13,1.4],[14.2,1.9]].forEach(([x,y])=>L.push({z:x+y,s:mesa(x,y)}));
   [[0.8,11.6],[15.2,11.4]].forEach(([x,y])=>L.push({z:x+y,s:farola(x,y)}));
   L.push({z:24.8,s:tree(15,10)});
   [[14.4,14.6]].forEach(([x,y])=>L.push({z:x+y+0.1,s:car(x-1.5,y-0.7,{taxi:1})}));
   return L},
  fig:[[8.5,3.4],[12.6,4],[6,10.8],[2.2,10.6],[11,9.8],[14.6,3.6]],bombin:[[15.2,0.8],[0.6,10.4],[8,9.9]],gato:[4,-2.6,70]},
 rio:{nombre:'Paseo del río',noche:false,turno:'tarde',horas:['18:10','18:20','18:30'],
  huecos:{parque:[[2.4,2.2],[6.6,2.4],[9.6,1.6],[4.2,3.0],[11.2,2.4]],plaza:[[4.4,8.6],[13,9],[1.8,9.4],[6.4,10.6],[11.6,8.6]],calzada:[[0.6,13.1],[5.4,13.1],[10.4,13.1],[-2.0,13.1],[8.0,13.1],[13.0,13.1]],terraza:[[8.6,8.8]],parada:[[14.2,11]],portal_local:[[12.2,0.5],[14.6,0.5],[13.4,0.6]]},
  suelo(){let s=poly([P(-2.5,0),P(0,0),P(0,12),P(-2.5,12)],'#ebe6da');
   s+=poly([P(0,0),P(16,0),P(16,4.3),P(0,4.3)],'#eef0e6');
   for(let i=0;i<50;i++){const x=0.6+((i*37)%150)/10,y=0.4+((i*53)%37)/10;const c=P(x,y);s+=`<path class="ln" style="stroke:#a9ad98" d="M${f1(c[0])},${f1(c[1])} l2,-4 l2,4"/>`}
   s+=poly([P(0,4.3),P(16,4.3),P(16,6.6),P(0,6.6)],'#dfe6ea');
   for(let i=0;i<14;i++){const c=P(0.8+i*1.1,5+(i%3)*0.45);s+=`<path class="ln" style="stroke:#9fb0ba" d="M${f1(c[0])},${f1(c[1])} q4,-3 8,0 q4,3 8,0"/>`}
   s+=poly([P(0,6.6),P(16,6.6),P(16,12),P(0,12)],'#f6f2ea');
   for(let x=1;x<16;x+=1.5)s+=line(P(x,7.4),P(x,11.6),'stroke:#ded7c7');
   s+=line(P(0,6.75),P(16,6.75),'stroke-width:2');
   return s+road()},
  edificios(){let s=box(-2.6,0,2.6,8,120,0,['#fff','#ece7dc','#fff'])+winSide(0,8,0,120,false);
   s+=box(11.6,-2.8,4.4,2.8,96)+winFront(11.6,16,0,96,false);
   s+=poly([P(12.1,0,0),P(12.9,0,0),P(12.9,0,22),P(12.1,0,22)],'#e4dfd3')+poly([P(14.6,0,0),P(15.4,0,0),P(15.4,0,22),P(14.6,0,22)],'#e4dfd3');
   return s},
  mobiliario(){const L=[];
   L.push({z:14.6,s:box(9,3.9,2.4,3.1,6,8,['#fff','#e4dfd3','#f0ece2'])+[0,1,2,3].map(d=>line(P(9+d*0.8,7,14),P(9+d*0.8,7,24))).join('')+line(P(9,7,24),P(11.4,7,24),'stroke-width:2')+line(P(9,3.9,24),P(11.4,3.9,24),'stroke-width:2')});
   for(let x=0.5;x<16;x+=0.8){if(x>8.9&&x<11.5)continue;L.push({z:x+6.7,s:line(P(x,6.7),P(x,6.7,12))+line(P(x,6.7,12),P(Math.min(x+0.8,16),6.7,12))})}
   L.push({z:15.9,s:box(8.2,8.4,1.6,1.2,30,0,['#fff','#e4dfd3','#fff'])+poly([P(8,9.6,32),P(10,9.6,32),P(10,10.1,26),P(8,10.1,26)],'#fff')+sign(8.3,10,36,'QUIOSCO',8)});
   [[9.2,9.1],[10.3,9.5]].forEach(([x,y])=>L.push({z:x+y,s:mesa(x,y)}));
   [[4.6,1.2],[1.2,3.6],[8.4,3.4],[15.2,3.6]].forEach(([x,y])=>L.push({z:x+y,s:tree(x,y)}));
   [[5.6,0.9]].forEach(([x,y])=>L.push({z:x+y,s:columpio(x,y)}));
   [[14.4,7.8]].forEach(([x,y])=>L.push({z:x+y,s:columpio(x,y)}));
   [[2.4,1.4],[6.8,1.6],[9.8,0.9],[4.6,8],[12.8,8.2]].forEach(([x,y])=>L.push({z:x+y-0.5,s:banco(x-0.6,y-0.8)}));
   [[6.8,7.4],[11.8,11.6],[2,11.6]].forEach(([x,y])=>L.push({z:x+y,s:farola(x,y)}));
   L.push({z:24.3,s:marquesina(13.6,10.6,2.4)});
   return L},
  fig:[[6.4,10.4],[11.4,10.2],[2.8,9.6],[15.2,8.4],[9.6,1.6],[3.6,3.4]],bombin:[[11.2,3.6],[15.4,9.6],[7.4,11]],gato:[12.4,-2.2,96]},
 /* v0.9: cuarto lugar. Día de procesión en el casco viejo. Topología propia (requisito 11):
    sin calle con tráfico delante; un recorrido peatonal cruza a media profundidad entre vallas policiales,
    fachadas pegadas a la calle e iglesia al fondo, placita con estatua delante a la derecha y calle lateral a la izquierda.
    El paso avanza entre pases: es AMBIENTE del lugar (no seleccionable), no mobiliario. */
 procesion:{nombre:'Día de procesión en el casco viejo',noche:false,turno:'mediodía',pal:'piedra',horas:['12:40','12:50','13:00'],
  huecos:{recorrido:[[-1.8,8.7],[0.6,8.7],[3.0,8.7],[5.4,8.7],[7.8,8.7],[10.2,8.7],[12.6,8.7]],monumento:[[12.2,12.4]],plaza:[[9.8,13.6],[14.6,14.4],[1.2,11.8],[6.0,12.2]]},
  suelo(){let s=poly([P(-2.5,-2),P(16,-2),P(16,16.6),P(-2.5,16.6)],'#ebe6da');
   s+=poly([P(-2.5,4.2),P(16,4.2),P(16,7.8),P(-2.5,7.8)],'#e4dfd3');
   for(let x=-2;x<16;x+=0.9)s+=line(P(x,4.3),P(x,7.7),'stroke:#d9d3c6');
   for(let y=4.6;y<7.8;y+=0.9)s+=line(P(-2.4,y),P(15.9,y),'stroke:#d9d3c6');
   s+=poly([P(10.4,10.6),P(16,10.6),P(16,16.6),P(10.4,16.6)],'#f3efe6');
   for(let k=0;k<5;k++)s+=line(P(10.6+k*1.1,10.8),P(10.6+k*1.1,16.4),'stroke:#e4dfd3');
   s+=poly([P(3.2,9.6),P(5.4,9.6),P(5.4,16.6),P(3.2,16.6)],'#e4dfd3');
   return s},
  edificios(){let s='';
   [[-2.5,2.4,110],[0.2,3.0,96],[3.4,2.4,128]].forEach(([x,w,h])=>{s+=box(x,-1.6,w,4,h,0,['#fff','#ece7dc','#fff'])+winFront(x,x+w,2.4,h,false);
    for(let d=0.4;d<w-0.3;d+=1.1)s+=line(P(x+d,2.4,46),P(x+d+0.7,2.4,46),'stroke-width:2')+line(P(x+d,2.4,46),P(x+d,2.4,52))+line(P(x+d+0.7,2.4,46),P(x+d+0.7,2.4,52))});
   s+=box(6,-3.4,4.4,5.8,118,0,['#fff','#e7e2d6','#fff'])+box(6.6,-3,1.6,1.6,236,0,['#fff','#e7e2d6','#fff']);
   const ro=P(8.2,2.4,82);s+=`<circle cx="${f1(ro[0])}" cy="${f1(ro[1])}" r="13" fill="#e4dfd3"/><circle cx="${f1(ro[0])}" cy="${f1(ro[1])}" r="5" fill="#fff"/>`;
   s+=poly([P(7.6,2.4,0),P(8.8,2.4,0),P(8.8,2.4,34),P(7.6,2.4,34)],'#d9d3c6');
   const cp=P(7.4,-2.2,236);s+=`<path class="ln" d="M${f1(cp[0])},${f1(cp[1])} v-22 M${f1(cp[0]-6)},${f1(cp[1]-15)} h12"/>`;
   [[10.6,2.6,104],[13.4,2.6,120]].forEach(([x,w,h])=>{s+=box(x,-1.6,w,4,h,0,['#fff','#ece7dc','#fff'])+winFront(x,x+w,2.4,h,false);
    for(let d=0.4;d<w-0.3;d+=1.1)s+=line(P(x+d,2.4,46),P(x+d+0.7,2.4,46),'stroke-width:2')+line(P(x+d,2.4,46),P(x+d,2.4,52))+line(P(x+d+0.7,2.4,46),P(x+d+0.7,2.4,52))});
   return s},
  mobiliario(){const L=[];
   const cordon=y=>{let t='';for(let x=-2.4;x<15.9;x+=0.6)t+=line(P(x,y),P(x,y,13));return t+line(P(-2.4,y,12),P(15.9,y,12))+line(P(-2.4,y,5),P(15.9,y,5))};
   L.push({z:-2.4+4.2+6,s:cordon(4.2)});
   for(let x=-2.4;x<15.9;x+=3.6){const xe=Math.min(x+3.6,15.9);let t='';for(let xx=x;xx<xe;xx+=0.6)t+=line(P(xx,7.8),P(xx,7.8,13));t+=line(P(x,7.8,12),P(xe,7.8,12))+line(P(x,7.8,5),P(xe,7.8,5));L.push({z:x+7.8+0.3,s:t})}
   const e=[12.8,12.0];L.push({z:e[0]+e[1]-0.4,s:box(e[0],e[1],1.2,1.2,30,0,['#e4dfd3','#d9d3c6','#ece7dc'])+(c=>`<path d="M${f1(c[0]-14)},${f1(c[1])} q4,-26 16,-30 q10,-2 12,10 l-4,2 q-2,-6 -8,-4 l2,22 z" fill="#5a4a3a"/><circle cx="${f1(c[0]+2)}" cy="${f1(c[1]-34)}" r="5" fill="#5a4a3a"/>`)(P(e[0]+0.6,e[1]+0.6,30))});
   [[11,14.8],[15,11.6]].forEach(([x,y])=>L.push({z:x+y-0.5,s:banco(x-0.6,y-0.8)}));
   [[1.6,14.2],[7.0,14.6]].forEach(([x,y])=>L.push({z:x+y,s:box(x-0.7,y-0.6,1.4,1.2,12,0,['#e4dfd3','#d9d3c6','#eef0e6'])+tree(x,y)}));
   [[-1.6,9.8],[9.6,9.8],[15.4,9.8]].forEach(([x,y])=>L.push({z:x+y,s:farola(x,y)}));
   return L},
  ambiente(m){const x=1.2+m*4.6,y=5.4,L=[];
   L.push({z:x+y+1.6,s:box(x,y,2.6,1.4,14,6,['#2b303b','#1b1d24','#3b3b3b'])+box(x+0.2,y+0.2,2.2,1.0,4,20,['#efe3b0','#d9c77a','#f6eccb'])
    +[[0.3,0.3],[2.3,0.3],[0.3,1.1],[2.3,1.1]].map(([a,b])=>line(P(x+a,y+b,24),P(x+a,y+b,56))).join('')
    +poly([P(x+0.2,y+0.2,56),P(x+2.4,y+0.2,56),P(x+2.4,y+1.2,56),P(x+0.2,y+1.2,56)],'#c8102e')
    +[0.6,1.0,1.4,1.8].map(d=>line(P(x+d,y+0.7,24),P(x+d,y+0.7,32),'stroke:#fff;stroke-width:2')).join('')});
   [[3.2,0.3],[3.8,1.1],[4.4,0.4]].forEach(([a,b],i)=>{const c=P(x+a,y+b);L.push({z:x+a+y+b,s:person(c[0],c[1],{tunica:1,hood:1,arm:'hold',item:i===1?'':'cirio'})+(i===1?line(P(x+a+0.2,y+b),P(x+a+0.2,y+b,60),'stroke-width:2')+poly([P(x+a+0.2,y+b,44),P(x+a+0.9,y+b,44),P(x+a+0.9,y+b,58),P(x+a+0.2,y+b,58)],'#c8102e'):'')})});
   return L},
  fig:[[1.6,3.2],[12.4,3.3],[4.2,9.0],[9.8,9.0],[6.4,12.6],[14.8,12.8]],bombin:[[15.4,3.1],[1.4,9.1],[8.6,14.4]],gato:[1.2,-0.4,96]},
 /* v0.6: tercer lugar. Glorieta del hospital, turno de mañana. */
 hospital:{nombre:'Glorieta del hospital',noche:false,turno:'mañana',manana:true,horas:['11:10','11:20','11:30'],
  huecos:{portal_local:[[1.2,0.5],[3.2,0.5],[5.0,0.5]],parque:[[1.6,5.4],[3.8,7.6],[4.6,6.2]],plaza:[[7.6,5.6],[10.4,8.4]],terraza:[[13.4,7.0]],parada:[[6.0,11.0],[8.2,11.0],[10.4,11.0]],calzada:[[0.2,13.1],[4.4,13.1],[8.6,13.1],[12.2,13.1],[-2.2,13.1]]},
  suelo(){let s=poly([P(-2.5,0),P(0,0),P(0,12),P(-2.5,12)],'#ebe6da')+poly([P(0,0),P(16,0),P(16,12),P(0,12)],'#f3efe6');
   s+=poly([P(0.4,3.6),P(5.6,3.6),P(5.6,9.4),P(0.4,9.4)],'#eef0e6');
   for(let i=0;i<34;i++){const x=0.8+((i*37)%48)/10,y=3.9+((i*53)%52)/10;const c=P(x,y);s+=`<path class="ln" style="stroke:#a9ad98" d="M${f1(c[0])},${f1(c[1])} l2,-4 l2,4"/>`}
   s+=line(P(0.4,3.6),P(5.6,3.6),'stroke:#bfb7a5')+line(P(5.6,3.6),P(5.6,9.4),'stroke:#bfb7a5');
   for(let x=6.4;x<13;x+=1.2)s+=line(P(x,4.2),P(x,10),'stroke:#ded7c7');
   s+=poly([P(12.6,5.8),P(16,5.8),P(16,8.6),P(12.6,8.6)],'#e7e2d6');
   s+=road();for(let k=0;k<6;k++){const y=12.25+k*0.55;s+=poly([P(6.9,y),P(8.3,y),P(8.3,y+0.3),P(6.9,y+0.3)],'#fff')}
   return s},
  edificios(){let s=box(-2.6,0,2.6,12,110,0,['#fff','#ece7dc','#fff'])+winSide(0,12,0,110,false);
   s+=box(0,-3,5.8,3,90)+winFront(0,5.8,0,90,false);
   s+=poly([P(0.8,0,0),P(1.6,0,0),P(1.6,0,22),P(0.8,0,22)],'#e4dfd3')+poly([P(2.8,0,0),P(3.6,0,0),P(3.6,0,22),P(2.8,0,22)],'#e4dfd3')+poly([P(4.6,0,0),P(5.4,0,0),P(5.4,0,22),P(4.6,0,22)],'#e4dfd3');
   s+=box(6,-4,10,4,124)+winFront(6,16,0,124,false);
   s+=poly([P(8.6,0,0),P(11.4,0,0),P(11.4,0,26),P(8.6,0,26)],'#d9d3c6');
   s+=sign(8.4,0,40,'HOSPITAL',15);
   const cr=P(13.6,0,40);s+=`<path class="ln" style="stroke:#c8102e;stroke-width:5" d="M${f1(cr[0]-9)},${f1(cr[1])} h18 M${f1(cr[0])},${f1(cr[1]-9)} v18"/>`;
   const hp=P(10.2,-2,124);s+=`<ellipse cx="${f1(hp[0])}" cy="${f1(hp[1])}" rx="34" ry="17" fill="#e7e2d6"/><text x="${f1(hp[0]-6)}" y="${f1(hp[1]+6)}" font-size="16" font-weight="800">H</text>`;
   s+=box(13.2,3.6,2.6,1.8,32,0,['#fff','#e4dfd3','#f0ece2'])+sign(13.3,5.4,24,'CAFETERÍA',8);
   return s},
  mobiliario(){const L=[];
   L.push({z:16.6,s:marquesina(5.6,10.6,5.8)+poly([P(5.0,10.1,8),P(11.2,10.1,8),P(11.2,10.1,38),P(5.0,10.1,38)],'#f0ece2')});
   [[13.0,6.4],[14.6,6.6],[15.3,7.6]].forEach(([x,y])=>L.push({z:x+y,s:mesa(x,y)}));
   [[1.6,5.4],[3.8,7.6]].forEach(([x,y])=>L.push({z:x+y-1.3,s:banco(x-0.6,y-0.8)}));
   [[0.9,8.8],[4.9,4.2],[2.7,9.0]].forEach(([x,y])=>L.push({z:x+y,s:tree(x,y)}));
   [[7.6,5.6],[10.4,8.4]].forEach(([x,y])=>{L.push({z:x+y+0.6,s:farola(x+1.0,y-0.4)});L.push({z:x+y+1.7,s:KIT.buzon(x+1.4,y+0.1)});L.push({z:x+y-0.8,s:KIT.panel(x+0.2,y-1.0)})});
   [[0.6,11.6],[15.4,11.6]].forEach(([x,y])=>L.push({z:x+y,s:farola(x,y)}));
   return L},
  fig:[[6.4,3.0],[11.8,4.8],[9.0,7.0],[2.4,10.4],[12.2,9.6],[6.8,8.8]],bombin:[[15.4,2.6],[0.6,10.8],[11.6,6.2]],gato:[1.0,-1.6,90]}
};
const FALLBACK={plaza:['parque'],parque:['plaza'],parada:['plaza'],terraza:['plaza'],recorrido:['plaza'],monumento:['plaza']};
const DISTRITOS=[
 {id:'estacion',lugar:'estacion',ids:['36.10-B','37.2-A','37.2-B','36.6-A','37.4-B','36.5-A','36.5-B','37.17-A','37.17-B','36.8-B','36.11-B','37.14-A','37.7-B','S-37.2','S-36.5','S-37.6','S-36.14'],seed:5101},
 {id:'rio',lugar:'rio',ids:['36.10-A','36.6-B','37.4-A','36.5-C','37.16-A','37.16-B','37.6-A','36.3-A','36.8-A','36.11-A','37.5-B','36.18-B','S-37.4','S-37.16','S-37.17','S-36.8','S-37.15'],seed:7203},
 {id:'hospital',lugar:'hospital',ids:['35.4-A','35.4-B','37.6-B','36.3-B','36.16-A','36.16-B','37.13-A','37.13-B','36.18-A','37.5-A','S-36.3','S-36.16','S-36.11','S-36.18'],seed:9307},
 {id:'procesion',lugar:'procesion',ids:['36.1-A','36.1-B','36.1-C','36.14-A','37.15-A','37.7-A','S-36.1','S-37.14','S-37.7'],seed:4411}
];

/* ---------- composición ---------- */
function place(items,seed,lug){const r=rng(seed),free={};for(const k in lug.huecos)free[k]=lug.huecos[k].map(p=>p.slice());const out=[];
 for(const v of items){let slot=null;for(const t of [v.hueco,...(FALLBACK[v.hueco]||[])]){if(free[t]&&free[t].length){slot=free[t].splice(Math.floor(r()*free[t].length),1)[0];break}}
  if(!slot)continue;const k=v.beats.length;const s=v.inicio!=null?v.inicio:k>=3?0:k===2?(out.filter(o=>o.v.beats.length===2).length%2):[0,1,2][out.length%3];out.push({v,slot,s})}
 return out}
const FIG=[{c:'Vuelve a casa con la compra.',i:'—Buenas. Vengo del mercado.'},{c:'Hace footing.',i:'—Perdón, que llevo prisa.'},{c:'Lee el periódico de pie.',i:'—Aquí, mirando cómo está todo.'},{c:'Empuja un carro con paquetes.',i:'—Me quedan veinte entregas.'},{c:'Pasean de la mano.',i:'—Vamos al cine.'}];
function figuracion(seed,lug){const r=rng(seed+7),out=[];
 FIG.forEach((f,i)=>{const sp=lug.fig[i%lug.fig.length];out.push({id:'fig'+i,f,ms:[0,1,2].filter(()=>r()>0.25),pos:[0,1,2].map(m=>[sp[0]+(r()-0.5)*1.2,sp[1]+(r()-0.5)*0.8]),o:{hair:r()>0.5,flip:r()>0.5,arm:['none','hold','phone'][Math.floor(r()*3)]}})});
 out.push({id:'bombin',f:{c:'Con bombín y paraguas. Parece que te mira.',i:'—Buenas, agente. Yo no estoy aquí. Nunca estoy aquí.'},ms:[0,1,2],pos:lug.bombin,o:{bowler:1}});
 return out}
function buildMission(tipo,did){
 const all=DLC.vinetas,byId=Object.fromEntries(all.map(v=>[v.id,v]));
 if(tipo==='distrito'){const D=DISTRITOS.find(d=>d.id===did),lug=LUGARES[D.lugar];
  return {tipo,did,lug,nombre:lug.nombre,seed:D.seed,items:place(D.ids.map(i=>byId[i]).filter(Boolean),D.seed,lug)}}
 const cola=load(KC,[]);const seed=Date.now()%100000,r=rng(seed);const used=new Set(),items=[];
 const grupos={};cola.forEach(c=>{(grupos[c.regla+'|'+c.tipo]=grupos[c.regla+'|'+c.tipo]||[]).push(c.vid)});
 /* v0.6: algunas viñetas están atadas a un lugar (campo «lugares»). Se elige el lugar que puede alojar más rescates. */
 const cabe=(v,lid)=>(!v.lugares||v.lugares.includes(lid))&&[v.hueco,...(FALLBACK[v.hueco]||[])].some(t=>LUGARES[lid].huecos[t]&&LUGARES[lid].huecos[t].length);
 const lids=shuffle(Object.keys(LUGARES),r);const cubre=lid=>Object.keys(grupos).filter(key=>{const [rg,tp]=key.split('|');return all.some(v=>v.regla===rg&&v.tipo===tp&&cabe(v,lid))}).length;
 const lid=lids.reduce((b,l)=>cubre(l)>cubre(b)?l:b,lids[0]);const lug=LUGARES[lid];
 for(const key in grupos){const [rg,tp]=key.split('|');const fall=grupos[key];
  const ok=all.filter(v=>v.regla===rg&&v.tipo===tp&&cabe(v,lid));
  let cands=ok.filter(v=>!fall.includes(v.id));if(!cands.length)cands=ok;
  const v=cands[Math.floor(r()*cands.length)];if(v&&!used.has(v.id)){used.add(v.id);items.push(v)}}
 const hall=all.filter(v=>v.tipo==='hallazgo'&&cabe(v,lid)),sen=all.filter(v=>v.tipo==='senuelo'&&cabe(v,lid));
 shuffle(sen.filter(v=>!used.has(v.id)),r).slice(0,2).forEach(v=>{used.add(v.id);items.push(v)});
 shuffle(hall.filter(v=>!used.has(v.id)&&!cola.some(c=>c.regla===v.regla)),r).slice(0,2).forEach(v=>items.push(v));
 return {tipo:'rescate',lug,nombre:'Rescate · '+lug.nombre,seed,items:place(shuffle(items,r),seed,lug)}}

/* ---------- estado ---------- */
const KC='inv5.cola',KP=did=>'inv5.distrito.'+did;
let st=null,progs={};DISTRITOS.forEach(d=>progs[d.id]=load(KP(d.id),{res:[],quem:[],sup:false}));
const svg=document.getElementById('scene'),panel=document.getElementById('panel');
const prog=()=>st.mis.tipo==='distrito'?progs[st.mis.did]:null;
const plOf=id=>st.mis.items.find(p=>p.v.id===id);
function visibleBeat(pl,m){const v=pl.v,b=m-pl.s,k=v.beats.length;if(b<0)return -1;if(b<k)return b;return v.duracion==='continuo'?k-1:-1}
const actM=pl=>pl.v.duracion==='instantaneo'?pl.s+(pl.v.acto??(pl.v.beats.length-1)):null;
function isActAt(pl,m){if(pl.v.duracion==='instantaneo')return m===actM(pl);return visibleBeat(pl,m)>=0}
const isFig=k=>k.startsWith('fig')||k==='bombin';
const figOf=k=>st.figs.find(f=>f.id===k);
const prevOf=k=>{const p=prog();if(!p||isFig(k))return null;return p.res.includes(k)?'res':p.quem.includes(k)?'quem':null};
const H=m=>st.mis.lug.horas[m];

/* ---------- render ---------- */
const NOCHE=[['#f3efe6','#1b1d24'],['#f6f2ea','#1b1d24'],['#ebe6da','#15171d'],['#e7e2d6','#23262f'],['#eef0e6','#1a2320'],['#dfe6ea','#172029'],['#d9d3c6','#2b2e38'],['#e4dfd3','#2e313b'],['#ece7dc','#262933'],['#f0ece2','#2a2d36'],['#fff','#20232b'],['#161616','#e9e4d8'],['#efe3b0','#d9c77a'],['#3b3b3b','#9a9a9a'],['#2b303b','#8fa3c8'],['#bfb7a5','#3a3d47'],['#ded7c7','#30333c'],['#a9ad98','#3d4a42']];
const MANANA=[['#f3efe6','#fbf6e4'],['#f6f2ea','#fdf9ec'],['#ebe6da','#f4ecd5'],['#e7e2d6','#f1e7cd'],['#eef0e6','#e2edcf'],['#a9ad98','#93a77c'],['#ded7c7','#e9dcc0'],['#e4dfd3','#efe4c9'],['#ece7dc','#f6eed9']];
const PIEDRA=[['#ebe6da','#e8dcc4'],['#e4dfd3','#ddcfb2'],['#d9d3c6','#cdbd9c'],['#f3efe6','#f1e6cf'],['#ece7dc','#ece0c7'],['#e7e2d6','#e6d8bd']];
function night(s){const pal=st.mis.lug.noche?NOCHE:st.mis.lug.manana?MANANA:st.mis.lug.pal==='piedra'?PIEDRA:null;if(!pal)return s;return s.replace(/#[0-9a-f]{3,6}\b/gi,c=>{const r=pal.find(p=>p[0]===c.toLowerCase());return r?r[1]:c})}
function stampSVG(c,fill,txt,fs){return `<circle r="12" fill="${fill}" style="stroke:${c};stroke-width:2.2"/><text y="${fs>9?4:3}" text-anchor="middle" font-size="${fs}" font-weight="800" style="fill:${c}">${txt}</text>`}
function stamp(k,b){const e=st.exp[k],pv=prevOf(k);let g='';
 if(pv==='res')g=stampSVG('#1f6f4a','rgba(31,111,74,.2)','✓',11);
 else if(pv==='quem')g=stampSVG('#8a8478','rgba(0,0,0,.08)','COLA',7);
 else if(e){if(e.locked)g=stampSVG('#1f6f4a','rgba(31,111,74,.2)','✓',11);else if(e.tipo==='sin')g=stampSVG(st.mis.lug.noche?'#e9e4d8':'#161616','rgba(127,127,127,.12)','SIN',8);else g=stampSVG('#c8102e','rgba(200,16,46,.12)',H(e.m),7.5)}
 return g?`<g transform="translate(${f1(b[0]+b[2]-4)},${f1(b[1]+6)}) rotate(-14)" pointer-events="none">${g}</g>`:''}
function hitbox(pp){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;pp.forEach(p=>{x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1])});return [x0-15,y0-48,x1-x0+30,y1-y0+54]}
function drawEl(el,ax,ay,over){const [t,dx,dy,o]=el;const x=ax+dx,y=ay+dy;
 if(t==='p'){const c=P(x,y,(o&&o.z)||0);return {s:person(c[0],c[1],o||{}),pp:[c]}}
 if(t==='bocadillo'){const c=P(x,y);if(over)over.push(bubble(c[0]+4,c[1]-44,o.t));return {s:'',pp:[]}}
 return {s:KIT[t]?KIT[t](x,y,o||{}):'',pp:anchorPts(t,x,y)}}
function drawPl(pl,m,over){const bi=visibleBeat(pl,m);if(bi<0)return null;let s='',pp=[];
 pl.v.dibujo[bi].forEach(el=>{const r=drawEl(el,pl.slot[0],pl.slot[1],over);s+=r.s;pp=pp.concat(r.pp)});
 if(!pp.length)pp=[P(pl.slot[0],pl.slot[1])];return {s,pp}}
function figPos(f,m){return f.pos[m]}
function ghosts(){const k=st.sel;if(!k)return '';let g='',marks=[];
 for(let m=0;m<3;m++){if(m===st.m)continue;
  if(isFig(k)){const f=figOf(k);if(!f.ms.includes(m))continue;const p=figPos(f,m),c=P(p[0],p[1]);g+=person(c[0],c[1],f.o);marks.push([m,c])}
  else{const pl=plOf(k);const r=drawPl(pl,m,null);if(!r)continue;g+=r.s;marks.push([m,r.pp[0]])}}
 if(!marks.length)return '';
 let cur=null;if(isFig(k)){const f=figOf(k);if(f.ms.includes(st.m)){const p=figPos(f,st.m);cur=P(p[0],p[1])}}else{const r=drawPl(plOf(k),st.m,null);if(r)cur=r.pp[0]}
 const all=[...marks,...(cur?[[st.m,cur]]:[])].sort((a,b)=>a[0]-b[0]);
 const path=all.length>1?`<path d="M${all.map(a=>f1(a[1][0])+','+f1(a[1][1]-14)).join(' L')}" style="fill:none;stroke:#c8102e;stroke-width:1.6;stroke-dasharray:4 4"/>`:'';
 const labs=marks.map(([m,c])=>`<g transform="translate(${f1(c[0]-16)},${f1(c[1]+4)})"><rect width="32" height="14" rx="2" fill="#c8102e"/><text x="16" y="10.5" text-anchor="middle" font-size="9" font-weight="800" style="fill:#fff">${H(m)}</text></g>`).join('');
 return `<g pointer-events="none"><g opacity="0.22">${night(g)}</g>${path}${labs}</g>`}
function render(){
 const m=st.m,lug=st.mis.lug;const L=lug.mobiliario().slice();if(lug.ambiente)L.push(...lug.ambiente(m));const over=[];let body='',stamps='';
 st.mis.items.forEach(pl=>{const r=drawPl(pl,m,over);if(pl.v.fijo)L.push({z:pl.slot[0]+pl.slot[1]-0.6,s:pl.v.fijo.map(el=>drawEl(el,pl.slot[0],pl.slot[1],null).s).join('')});
  if(!r)return;L.push({z:pl.slot[0]+pl.slot[1]+0.5,s:r.s,k:pl.v.id,pp:r.pp})});
 st.figs.forEach(f=>{if(!f.ms.includes(m))return;const p=figPos(f,m);const c=P(p[0],p[1]);L.push({z:p[0]+p[1],s:person(c[0],c[1],f.o),k:f.id,pp:[c]})});
 L.sort((a,b)=>a.z-b.z);
 L.forEach(it=>{if(it.k){const b=hitbox(it.pp);body+=`<g class="hit${st.sel===it.k?' sel':''}" data-k="${it.k}">${it.s}<rect class="hb" x="${f1(b[0])}" y="${f1(b[1])}" width="${f1(b[2])}" height="${f1(b[3])}" rx="4"/></g>`;stamps+=stamp(it.k,b)}else body+=it.s});
 const g=lug.gato,cat=P(g[0]+m*0.8,g[1]+m*0.3,g[2]);
 const catS=`<g transform="translate(${f1(cat[0])},${f1(cat[1])})"><ellipse cx="0" cy="-5" rx="8" ry="5" fill="#161616"/><circle cx="7" cy="-11" r="4.5" fill="#161616"/><path d="M4.5,-14 l1,-4 l2,3 M8.5,-14 l2,-4 l1,4" fill="#161616"/></g>`;
 svg.classList.toggle('night',!!lug.noche);document.getElementById('stage').classList.toggle('night',!!lug.noche);document.getElementById('stage').classList.toggle('manana',!!lug.manana);
 svg.innerHTML=night(st.STATIC+body+catS)+ghosts()+over.join('')+stamps;
 document.getElementById('mlabel').textContent=st.mis.nombre+' · '+H(m);
 document.getElementById('t').value=m;
 document.getElementById('tlab').innerHTML=[0,1,2].map(i=>{const n=Object.values(st.exp).filter(e=>e.m===i).length;return `<button data-m="${i}" class="${i===m?'on':''}">${H(i)}<span class="dots">${'●'.repeat(n)}</span></button>`}).join('');
 const n=Object.keys(st.exp).length;const p=prog();
 document.getElementById('seals').textContent=(p&&p.sup?'Distrito superado · ':'')+(n?`Sellos: ${n}`:'');
 document.getElementById('ttl').textContent=st.mis.nombre;
}

/* ---------- expediente ---------- */
function complete(k){const e=st.exp[k];if(!e)return false;if(e.tipo==='sin')return true;if(e.via==null)return false;if(e.via===0)return true;return !!(e.grav&&e.act)}
function verdict(k){const e=st.exp[k];if(!e)return null;if(isFig(k))return e.tipo==='inf'?'improcedente':'neutro';
 const pl=plOf(k),v=pl.v;
 if(e.tipo==='sin')return v.tipo==='senuelo'?'ok':'habia';
 if(v.tipo==='senuelo')return 'senuelo';
 if(!isActAt(pl,e.m))return 'momento';
 if(!complete(k))return 'incompleto';
 const via=v.sol.via==='adm'?1:0;if(e.via!==via)return 'mal';if(via===0)return 'ok';
 return e.grav===v.sol.grav&&v.sol.acc.includes(e.act)?'ok':'mal'}
let tt;function toast(t){const el=document.getElementById('toast');el.textContent=t;el.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>el.classList.remove('show'),2400)}
function optBtns(set,val,key,dis){return `<div class="opts">${set.map(o=>`<button class="opt${o===val?' on':''}" data-f="${key}" data-v="${o}"${dis?' disabled':''}>${o}</button>`).join('')}</div>`}
const LUG={recorrido:'Junto al recorrido',monumento:'En el monumento',parque:'En el parque',plaza:'En la explanada',terraza:'En la terraza',portal_local:'Junto a los portales',parada:'En la parada',calzada:'En la calle'};
function panelHTML(){
 const k=st.sel,m=st.m;
 if(!k)return `<h2>Ficha</h2><p class="empty">Toca a cualquier persona de la lámina. Si mueves el deslizador con alguien seleccionado, verás en rojo su <strong>rastro</strong> por los otros pases.</p><p class="empty">Sellos puestos: <strong>${Object.keys(st.exp).length}</strong>.</p>`;
 let name,cap,info,vis;
 if(isFig(k)){const f=figOf(k);vis=f.ms.includes(m);name='Transeúnte';cap=vis?f.f.c:null;info=['voz',f.f.i]}
 else{const pl=plOf(k);const bi=visibleBeat(pl,m);vis=bi>=0;const ht=Object.keys(st.mis.lug.huecos).find(t=>st.mis.lug.huecos[t].some(p=>p===pl.slot||(p[0]===pl.slot[0]&&p[1]===pl.slot[1])));name=LUG[ht]||'En la calle';cap=vis?pl.v.beats[bi]:null;info=[pl.v.info.tipo,pl.v.info.texto]}
 if(isFig(k))name=LUG.plaza;
 const inf=st.rev[k]?info:null,pv=prevOf(k),e=st.exp[k];
 let s=`<div class="ph"><h2>${esc(name)}</h2><button class="opt" id="hide">Ocultar</button></div><p class="cap">${vis?esc(cap):`<em>A las ${H(m)} no está a la vista. Mira su rastro en rojo.</em>`}</p>`;
 if(inf){const lab={voz:'Dice',radio:'Radio · central',doc:'Documentación'}[inf[0]];s+=`<div class="info ${inf[0]}"><div class="k">${lab}</div>${esc(inf[1])}</div>`}
 const can=!st.closed&&!pv&&vis&&!e;
 s+=`<div class="row">${inf?'':`<button class="btn ghost" id="inv"${st.closed?' disabled':''}>Investigar</button>`}${can?`<button class="btn" id="seal">Sello: infracción</button><button class="btn ghost" id="sealSin">Sello: sin infracción LOPSC</button>`:''}</div>`;
 if(pv==='res')s+=`<p class="lock">✓ Resuelto en un servicio anterior.</p>`;
 if(pv==='quem')s+=`<p class="hint">Fallado en un servicio anterior. Está en la cola: vuelve en un rescate, con otra escena.</p>`;
 if(e&&e.tipo==='sin')s+=`<div class="exp"><h3>Sin infracción LOPSC · sellado a las ${H(e.m)} ${e.locked?'<span class="lock">✓ Confirmado</span>':`<button class="opt" id="unseal">Retirar sello</button>`}</h3><p class="hint">Has decidido que aquí no hay infracción de esta ley.</p></div>`;
 else if(e){const Lk=e.locked;s+=`<div class="exp"><h3>Expediente · sellado a las ${H(e.m)} ${Lk?'<span class="lock">✓ Confirmado</span>':`<button class="opt" id="unseal">Retirar sello</button>`}</h3>`;
  s+=`<div class="step"><div class="q">1 · ¿Por qué vía?</div>${optBtns(SETS.via,e.via==null?null:SETS.via[e.via],'via',Lk)}</div>`;
  if(e.via===1){s+=`<div class="step"><div class="q">2 · ¿Qué gravedad y qué artículo?</div>${optBtns(SETS.grav,e.grav,'grav',Lk)}</div>`;
   if(e.grav)s+=`<div class="step"><div class="q">3 · ¿Qué haces?</div>${optBtns(SETS.act,e.act,'act',Lk)}</div>`}
  if(!Lk&&!st.closed)s+=`<p class="hint">${complete(k)?'Expediente completo. Se corrige al cerrar el servicio.':'Rellena el expediente hasta el final.'}</p>`;
  s+='</div>'}
 return s}
function showPanel(){panel.innerHTML=panelHTML();panel.classList.toggle('open',!!st.sel)}
panel.addEventListener('click',ev=>{const k=st.sel;const b=ev.target.closest('button');if(!b||!k)return;
 if(b.id==='hide')st.sel=null;
 else if(b.id==='inv'){st.rev[k]=1}
 else if(b.id==='seal')st.exp[k]={tipo:'inf',via:null,grav:null,act:null,m:st.m,t:Date.now()};
 else if(b.id==='sealSin')st.exp[k]={tipo:'sin',m:st.m,t:Date.now()};
 else if(b.id==='unseal')delete st.exp[k];
 else if(b.dataset.f){const e=st.exp[k];if(!e||e.locked)return;const f=b.dataset.f,v=b.dataset.v;
  if(f==='via'){const n=SETS.via.indexOf(v);if(e.via!==n){e.via=n;e.grav=e.act=null}}else e[f]=v}
 else return;
 render();showPanel()});

/* ---------- lienzo ---------- */
let vb={x:0,y:0,w:W0,h:H0};
/* En pantallas estrechas hay dos encuadres: «lectura» (franja central, figuras legibles) y «entera» (toda la lámina).
   El botón ⤢ alterna entre los dos. En pantallas anchas siempre se ve entera. */
let vistaEntera=false;
function fitVB(){const r=svg.getBoundingClientRect();if(!r.width)return;const asp=r.height/r.width;const narrow=r.width<700&&!vistaEntera;
 const w=narrow?540:Math.max(W0,H0/asp);const cx=narrow?P(7.5,7)[0]:W0/2,cy=narrow?P(7.5,7)[1]-30:H0/2;vb={x:cx-w/2,w,h:w*asp,y:0};vb.y=cy-vb.h/2;apply()}
function apply(){svg.setAttribute('viewBox',`${f1(vb.x)} ${f1(vb.y)} ${f1(vb.w)} ${f1(vb.h)}`)}
function toSvg(cx,cy){const r=svg.getBoundingClientRect();const s=r.width/vb.w;return {x:vb.x+(cx-r.left)/s,y:vb.y+(cy-r.top)/s}}
function zoomAt(cx,cy,f){const p=toSvg(cx,cy);const nw=Math.min(1600,Math.max(240,vb.w/f));const k=nw/vb.w;vb.x=p.x-(p.x-vb.x)*k;vb.y=p.y-(p.y-vb.y)*k;vb.w=nw;vb.h*=k;apply()}
const ptr=new Map();let moved=false,pinch=null,last=null;
svg.addEventListener('pointerdown',e=>{svg.setPointerCapture(e.pointerId);ptr.set(e.pointerId,[e.clientX,e.clientY]);if(ptr.size===1){moved=false;last=[e.clientX,e.clientY]}if(ptr.size===2){const [a,b]=[...ptr.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1])};moved=true}});
svg.addEventListener('pointermove',e=>{if(!ptr.has(e.pointerId))return;ptr.set(e.pointerId,[e.clientX,e.clientY]);
 if(ptr.size===2&&pinch){const [a,b]=[...ptr.values()];const d=Math.hypot(a[0]-b[0],a[1]-b[1]);zoomAt((a[0]+b[0])/2,(a[1]+b[1])/2,d/pinch.d);pinch.d=d;return}
 if(ptr.size===1&&last){const dx=e.clientX-last[0],dy=e.clientY-last[1];if(Math.abs(dx)+Math.abs(dy)>4||moved){moved=true;svg.classList.add('grab');const s=svg.getBoundingClientRect().width/vb.w;vb.x-=dx/s;vb.y-=dy/s;apply();last=[e.clientX,e.clientY]}}});
function endPtr(e){if(!ptr.has(e.pointerId))return;ptr.delete(e.pointerId);svg.classList.remove('grab');if(ptr.size<2)pinch=null;
 if(ptr.size===0&&!moved&&e.type==='pointerup'){st.sel=elegir(e.clientX,e.clientY);render();showPanel()}
 if(ptr.size===1)last=[...ptr.values()][0]}
/* v0.9: el toque se resuelve por cercanía, no por lo que esté dibujado encima.
   Entre todas las zonas que contienen el punto gana la de centro más cercano; tocar otra vez
   en el mismo sitio pasa a la siguiente candidata. Así ningún caso queda tapado por otro o por un árbol. */
let ultimoToque=null;
function elegir(cx,cy){const pt=svg.createSVGPoint();pt.x=cx;pt.y=cy;const q=pt.matrixTransform(svg.getScreenCTM().inverse());
 const c=[...svg.querySelectorAll('.hit')].map(g=>{const r=g.querySelector('rect.hb');const x=+r.getAttribute('x'),y=+r.getAttribute('y'),w=+r.getAttribute('width'),h=+r.getAttribute('height');
  return {k:g.dataset.k,dentro:q.x>=x&&q.x<=x+w&&q.y>=y&&q.y<=y+h,d:Math.hypot(q.x-(x+w/2),q.y-(y+h/2))}}).filter(o=>o.dentro).sort((a,b)=>a.d-b.d).map(o=>o.k);
 const mismo=ultimoToque&&Math.hypot(cx-ultimoToque[0],cy-ultimoToque[1])<10;ultimoToque=[cx,cy];
 if(!c.length)return null;const i=c.indexOf(st.sel);return mismo&&i>=0&&c.length>1?c[(i+1)%c.length]:c[0]}
svg.addEventListener('pointerup',endPtr);svg.addEventListener('pointercancel',endPtr);
svg.addEventListener('wheel',e=>{e.preventDefault();if(e.ctrlKey||e.metaKey)zoomAt(e.clientX,e.clientY,Math.exp(-e.deltaY*0.01));else{const s=svg.getBoundingClientRect().width/vb.w;vb.x+=e.deltaX/s;vb.y+=e.deltaY/s;apply()}},{passive:false});
const stg=document.getElementById('stage');
document.getElementById('zin').onclick=()=>{const r=stg.getBoundingClientRect();zoomAt(r.left+r.width/2,r.top+r.height/2,1.3)};
document.getElementById('zout').onclick=()=>{const r=stg.getBoundingClientRect();zoomAt(r.left+r.width/2,r.top+r.height/2,1/1.3)};
document.getElementById('zfit').onclick=()=>{const estrecha=svg.getBoundingClientRect().width<700;vistaEntera=estrecha?!vistaEntera:false;fitVB();
 if(estrecha)toast(vistaEntera?'Lámina entera':'Vista de lectura')};
new ResizeObserver(()=>{const r=svg.getBoundingClientRect();if(!r.width)return;const c=vb.y+vb.h/2;vb.h=vb.w*r.height/r.width;vb.y=c-vb.h/2;apply()}).observe(svg);

/* ---------- tiempo y menú ---------- */
function setM(m){st.m=m;render();showPanel()}   /* la selección se mantiene entre pases */
document.getElementById('t').addEventListener('input',e=>setM(+e.target.value));
document.getElementById('tlab').addEventListener('click',e=>{const b=e.target.closest('button');if(b)setM(+b.dataset.m)});
document.addEventListener('keydown',e=>{if(document.querySelector('.ov.show'))return;if(e.key==='ArrowRight'&&st.m<2)setM(st.m+1);if(e.key==='ArrowLeft'&&st.m>0)setM(st.m-1);if(e.key==='Escape'){st.sel=null;render();showPanel()}});
function pendientes(did){const D=DISTRITOS.find(d=>d.id===did),p=progs[did];return D.ids.length-p.res.length-p.quem.length}
const hallRes=did=>progs[did].res.filter(id=>!id.startsWith('S-')).length;
function menu(){if(!load(KAV,false))return aviso();const cola=load(KC,[]);
 document.getElementById('menuBody').innerHTML=`<h2>Comisaría</h2><p>Elige servicio.</p>`+
 DISTRITOS.map(D=>{const lug=LUGARES[D.lugar],p=progs[D.id],pend=pendientes(D.id);return `<div class="mis"><h3>${lug.nombre} · turno de ${lug.turno}</h3><p>${p.sup?'<strong>Superado.</strong> ':''}${pend>0?`Quedan <strong>${pend} pendientes</strong>.`:'Completado.'} Para superarlo: ${PASA} infracciones bien resueltas (llevas ${hallRes(D.id)}).</p><button class="btn" data-go="${D.id}">Patrullar</button></div>`}).join('')+
 `<div class="mis"><h3>Misión de rescate</h3><p>${cola.length?`Tu compañero está retenido por <strong>${cola.length} ${cola.length===1?'fallo':'fallos'}</strong>: ${cola.map(c=>esc(c.t)).join(' · ')}. Vuelven con otra escena.`:'Cola vacía: no hay nadie a quien rescatar.'}</p><button class="btn${cola.length?'':' ghost'}" id="goR"${cola.length?'':' disabled'}>Salir al rescate</button></div>
 <details><summary>Cómo se juega</summary><ul><li>Tres pases: muévete entre ellos con el deslizador. Si seleccionas a alguien y cambias de pase, su rastro aparece en rojo.</li><li>Investiga a quien quieras, sin límite: la ficha te da lo que se oye, se ve o dice la central.</li><li>Sello de infracción → expediente. Sello «sin infracción LOPSC» → para lo que parece y no es.</li><li>Un hecho instantáneo se sella en el pase en que ocurre.</li><li>Puedes cerrar el servicio cuando quieras, con un solo caso: la corrección llega al cerrar. Para superar un distrito hacen falta ${PASA} infracciones bien resueltas, sumando patrullas; los señuelos no cuentan.</li><li>«← Comisaría» abandona la patrulla sin corregir nada.</li></ul></details>
 <div class="foot"><button class="opt" id="goSync">Sincronizar con otro dispositivo</button><button class="opt" id="goAviso">Aviso</button><button class="opt" id="wipe">Borrar todo el progreso</button><button class="opt" id="goUpd">Buscar actualizaciones</button><span class="ver">${esc(self.APP_NAME||'')} <span class="vnum">${self.APP_VER?'v'+esc(self.APP_VER):''}</span> · © 2026 ${esc(self.APP_AUTHOR||'')} · CC BY-NC 4.0</span></div>`;
 document.getElementById('goSync').onclick=syncView;document.getElementById('goUpd').onclick=buscarUpd;document.getElementById('goAviso').onclick=aviso;
 document.getElementById('menu').classList.add('show');
 document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>start('distrito',b.dataset.go));
 if(cola.length)document.getElementById('goR').onclick=()=>start('rescate');
 document.getElementById('wipe').onclick=()=>{DISTRITOS.forEach(d=>{progs[d.id]={res:[],quem:[],sup:false};save(KP(d.id),progs[d.id])});save(KC,[]);menu();toast('Progreso y cola borrados')}}
function start(tipo,did){const mis=buildMission(tipo,did);st={mis,m:0,rev:{},exp:{},sel:null,closed:false,STATIC:mis.lug.suelo()+mis.lug.edificios()};st.figs=figuracion(mis.seed,mis.lug);
 document.getElementById('menu').classList.remove('show');render();showPanel();fitVB()}
document.getElementById('close').onclick=()=>document.getElementById('cfm').classList.add('show');
document.getElementById('back').onclick=()=>{if(st.closed||!Object.keys(st.exp).length)return menu();document.getElementById('abn').classList.add('show')};
document.getElementById('abnNo').onclick=()=>document.getElementById('abn').classList.remove('show');
document.getElementById('abnYes').onclick=()=>{document.getElementById('abn').classList.remove('show');menu()};
document.getElementById('cfmNo').onclick=()=>document.getElementById('cfm').classList.remove('show');
document.getElementById('cfmYes').onclick=()=>{document.getElementById('cfm').classList.remove('show');closeService()};

/* ---------- resolución ---------- */
const cite=c=>`<blockquote><b>Art. ${esc(c.replace(/#.*/,''))}${c.includes('#')?' (párrafo '+c.split('#')[1]+')':''}</b>${esc(DLC.citas[c])}</blockquote>`;
function rowsFor(v,e){const r=[];const ya=x=>x==null?'—':x;const via=v.sol.via==='adm'?1:0;
 r.push(['Vía',ya(e.via==null?null:SETS.via[e.via]),SETS.via[via],e.via===via]);
 if(via===1){r.push(['Gravedad y artículo',ya(e.grav),v.sol.grav,e.grav===v.sol.grav]);r.push(['Qué haces',ya(e.act),v.sol.acc.join(' / '),v.sol.acc.includes(e.act)])}
 return `<table><thead><tr><th>Paso</th><th>Tu respuesta</th><th>Correcto</th></tr></thead><tbody>${r.map(x=>`<tr><td>${x[0]}</td><td class="${x[3]?'':'bad'}">${esc(x[1])}</td><td>${esc(x[2])}</td></tr>`).join('')}</tbody></table>`}
function closeService(){
 st.closed=true;const sel=st.sel;st.sel=null;render();showPanel();
 const ok=[],ko=[],imp=[];
 Object.keys(st.exp).forEach(k=>{const vd=verdict(k);if(vd==='neutro')return;if(vd==='improcedente'){imp.push(k);return}(vd==='ok'?ok:ko).push(k)});
 const card=k=>{const e=st.exp[k],pl=plOf(k),v=pl.v,vd=verdict(k);let chip,body='';
  const CH={ok:e.locked?'Confirmado en servicio':(v.tipo==='senuelo'?'Bien visto: sin infracción LOPSC':'Correcto'),senuelo:'Le pusiste sello de infracción y no la había',habia:'Lo marcaste sin infracción y sí la había',momento:'Sellado en un pase en el que no ocurría el hecho',mal:'Con errores',incompleto:'Expediente incompleto'};
  chip=`<span class="chip ${vd==='ok'?'ok':'ko'}">${CH[vd]}</span>`;
  if(vd==='momento')body=`<p class="why"><b>Lo sellaste a las ${H(e.m)}, pero el hecho ocurre a las ${H(actM(pl))}.</b> Un hecho instantáneo se sella en el pase en que sucede.</p>`;
  else if(v.tipo==='hallazgo'&&e.tipo==='inf')body=rowsFor(v,e);
  const tt=v.beats[v.acto??0];
  return `<div class="rc"><h4>${esc(tt.length>80?tt.slice(0,78)+'…':tt)} ${chip}</h4><p class="hint">Art. ${v.regla} · sellado a las ${H(e.m)}</p>${body}<p class="why">${esc(v.why)}</p>${(v._c||[]).map(cite).join('')}</div>`};
 let cola=load(KC,[]);const limpiados=[];const p=prog();
 if(p){ok.forEach(k=>{if(!p.res.includes(k))p.res.push(k)});ko.forEach(k=>{if(!p.quem.includes(k))p.quem.push(k)});if(hallRes(st.mis.did)>=PASA)p.sup=true;save(KP(st.mis.did),p)}
 else ok.forEach(k=>{const v=plOf(k).v;const antes=cola.length;cola=cola.filter(c=>!(c.regla===v.regla&&c.tipo===v.tipo));if(cola.length<antes)limpiados.push('art. '+v.regla+(v.tipo==='senuelo'?' (señuelo)':''))});
 ko.forEach(k=>{const v=plOf(k).v;if(!cola.some(c=>c.vid===v.id))cola.push({regla:v.regla,tipo:v.tipo,vid:v.id,t:'Art. '+v.regla+(v.tipo==='senuelo'?' (señuelo)':'')})});
 save(KC,cola);
 let s=`<h2>Servicio cerrado · ${esc(st.mis.nombre)}</h2>`;
 if(p){const pend=pendientes(st.mis.did);s+=p.sup?`<p><strong>Distrito superado.</strong> ${pend?`Quedan <strong>${pend} pendientes</strong>.`:'No queda nada por descubrir.'}</p>`:`<p>Distrito <strong>no superado</strong>: llevas ${hallRes(st.mis.did)} de las ${PASA} infracciones bien resueltas que hacen falta. Quedan <strong>${pend} pendientes</strong>.</p>`}
 else s+=limpiados.length?`<p><strong>Rescate:</strong> sale de la cola ${limpiados.join(', ')}.</p>`:`<p>Rescate sin éxito: la cola sigue igual o crece.</p>`;
 if(ok.length)s+=`<div class="sec">Aciertos de este servicio</div>`+ok.map(card).join('');
 if(ko.length)s+=`<div class="sec">Errores de este servicio</div>`+ko.map(card).join('');
 if(imp.length)s+=`<div class="sec">Denuncias improcedentes</div><div class="rc"><p class="why">${imp.length} ${imp.length===1?'sello':'sellos'} de infracción sobre transeúntes sin nada que denunciar.</p></div>`;
 if(!ok.length&&!ko.length&&!imp.length)s+=`<p>No tomaste ninguna decisión en este servicio.</p>`;
 s+=`<div class="sec">Cola de fallos</div><p>${cola.length?cola.map(c=>esc(c.t)).join(' · '):'Vacía.'}</p><p class="hint">Cada fallo sale de la cola cuando lo resuelves bien en un rescate, con otra escena.</p>`;
 s+=`<div class="row"><button class="btn" id="toMenu">Volver a la comisaría</button><button class="btn ghost" id="look">Mirar la lámina</button></div>`;
 document.getElementById('resBody').innerHTML=s;document.getElementById('res').classList.add('show');
 document.getElementById('toMenu').onclick=()=>{document.getElementById('res').classList.remove('show');menu()};
 document.getElementById('look').onclick=()=>document.getElementById('res').classList.remove('show');
}

/* ---------- arranque ---------- */

/* ---------- v0.7: aviso y sincronización por código ---------- */
const KAV='inv.aviso.v2';
function buscarUpd(){const reg=self.SWREG;if(!reg){toast('Sin conexión o en modo navegador: no se puede comprobar.');return}
 toast('Buscando…');reg.update().then(()=>{if(reg.installing||reg.waiting)toast('Versión nueva encontrada: pulsa «Actualizar» abajo.');else toast('Tienes la última versión'+(self.APP_VER?' (v'+self.APP_VER+')':'')+'.')}).catch(()=>toast('No se ha podido comprobar. ¿Hay conexión?'))}
function aviso(){
 document.getElementById('menuBody').innerHTML=`<h2>Antes de empezar</h2>
 <p><strong>Herramienta no oficial.</strong> La ha hecho un opositor para entrenar el supuesto práctico de Policía Local. No tiene relación con ningún tribunal, ayuntamiento ni administración.</p>
 <p><strong>Textos legales.</strong> Las citas de cada resolución son literales de la Ley Orgánica 4/2015, de 30 de marzo, de protección de la seguridad ciudadana, según el texto consolidado del BOE (última actualización publicada el 23-02-2021; comprobado el 25-11-2026). El texto consolidado es informativo; para fines jurídicos vale el BOE.</p>
 <p><strong>Criterio de los casos.</strong> La vía, la gravedad y la actuación de cada escena son el criterio del autor sobre la ley, no doctrina oficial. Si ves un error, avisa.</p>
 <p><strong>No sustituye</strong> al estudio del texto legal ni a la jurisprudencia.</p>
 <p><strong>Licencia.</strong> © 2026 ${esc(self.APP_AUTHOR||'')}. Puedes usar, copiar, compartir y adaptar esta app siempre que cites al autor y no la uses con fines comerciales (licencia Creative Commons CC BY-NC 4.0). Los textos de la ley son de dominio público.</p>
 <p><strong>Tus datos.</strong> El progreso se guarda solo en este dispositivo y no se envía a ningún sitio. Para llevarlo a otro, usa «Sincronizar».</p>
 <button class="btn" id="avOk">Entendido</button>`;
 document.getElementById('menu').classList.add('show');
 document.getElementById('avOk').onclick=()=>{save(KAV,true);menu()};
}
const B64=s=>{const b=new TextEncoder().encode(s);let t='';b.forEach(x=>t+=String.fromCharCode(x));return btoa(t).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const UNB64=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');const t=atob(s);return new TextDecoder().decode(Uint8Array.from(t,c=>c.charCodeAt(0)))};
function exportCode(){const p={};DISTRITOS.forEach(d=>p[d.id]=progs[d.id]);return 'INV1.'+B64(JSON.stringify({c:load(KC,[]),p}))}
function importCode(code){
 code=(code||'').trim().replace(/\s+/g,'');if(!code.startsWith('INV1.'))throw new Error('El código no es de esta app.');
 let d;try{d=JSON.parse(UNB64(code.slice(5)))}catch(_){throw new Error('El código está incompleto o dañado. Cópialo entero.')}
 if(!d||!Array.isArray(d.c)||typeof d.p!=='object')throw new Error('El código está incompleto o dañado.');
 const ok=x=>typeof x==='string'&&x.length<40;let nc=0,nr=0;
 const cola=load(KC,[]),key=c=>c.regla+'|'+c.tipo+'|'+c.vid,have=new Set(cola.map(key));
 d.c.forEach(c=>{if(c&&ok(c.regla)&&ok(c.tipo)&&ok(c.vid)&&!have.has(key(c))){cola.push({regla:c.regla,tipo:c.tipo,vid:c.vid,t:String(c.t||'').slice(0,80)});have.add(key(c));nc++}});
 save(KC,cola);
 DISTRITOS.forEach(D=>{const o=d.p[D.id];if(!o)return;const p=progs[D.id];
  (Array.isArray(o.res)?o.res:[]).forEach(k=>{if(ok(k)&&!p.res.includes(k)){p.res.push(k);nr++}});
  (Array.isArray(o.quem)?o.quem:[]).forEach(k=>{if(ok(k)&&!p.quem.includes(k))p.quem.push(k)});
  if(o.sup===true)p.sup=true;save(KP(D.id),p)});
 return {nc,nr};
}
function syncView(){
 const code=exportCode();
 document.getElementById('menuBody').innerHTML=`<div class="sync"><h2>Sincronizar</h2>
 <p>Para llevar tu progreso y tu cola de rescate a otro dispositivo: copia aquí tu código y pégalo en el otro, en «Traer progreso». Se <strong>suman</strong> los dos: no se pierde nada. Un caso que ya resolviste en un dispositivo puede volver a salir una vez en el otro.</p>
 <h3>Mi código</h3><textarea id="syOut" readonly>${esc(code)}</textarea>
 <div class="row"><button class="btn" id="syCopy">Copiar código</button></div>
 <h3>Traer progreso de otro dispositivo</h3><textarea id="syIn" placeholder="Pega aquí el código (empieza por INV1.)"></textarea>
 <div class="row"><button class="btn" id="syGo">Traer progreso</button><button class="opt" id="syBack">Volver</button></div>
 <p class="hint" id="syMsg" role="status"></p></div>`;
 const msg=t=>document.getElementById('syMsg').textContent=t;
 document.getElementById('syCopy').onclick=()=>{const ta=document.getElementById('syOut');
  const fall=()=>{ta.focus();ta.select();try{document.execCommand('copy');msg('Copiado.')}catch(_){msg('Selecciona el texto y cópialo a mano.')}};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(code).then(()=>msg('Copiado.'),fall);else fall()};
 document.getElementById('syGo').onclick=()=>{try{const r=importCode(document.getElementById('syIn').value);msg(`Hecho: ${r.nr} ${r.nr===1?'caso resuelto nuevo':'casos resueltos nuevos'} y ${r.nc} ${r.nc===1?'fallo nuevo':'fallos nuevos'} en la cola.`);document.getElementById('syIn').value='';document.getElementById('syOut').value=exportCode()}catch(e){msg(e.message)}};
 document.getElementById('syBack').onclick=menu;
}
fetch('dlc/lopsc.json').then(r=>r.json()).then(d=>{DLC=d;
 document.getElementById('dlcInfo').textContent=`DLC ${d.paquete} · lotes ${d.lote} · ${d.vinetas.length} viñetas`;
 start('distrito','estacion');menu()})
 .catch(err=>{document.getElementById('menuBody').innerHTML='<h2>No se pudo cargar el paquete</h2><p>'+esc(err.message)+'</p>';document.getElementById('menu').classList.add('show')});
}
