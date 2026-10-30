/* Núcleo del diagnóstico (v4): aplicabilidad por perfil, cálculo de puntajes,
   alertas críticas, gráfico radar e informe PDF.
   Lo usan index.html (encuesta) y admin.html (panel). Requiere banco.js. */
(function(){
"use strict";
const B=window.DIAG_BANCO;
const {AREAS,SCALE,PERFIL,ACTIVIDADES}=B;

const LEVELS=[
 {max:1.8,name:"Inicial",c:"--l1"},
 {max:2.6,name:"Básico",c:"--l2"},
 {max:3.4,name:"En desarrollo",c:"--l3"},
 {max:4.2,name:"Consolidado",c:"--l4"},
 {max:5.01,name:"Avanzado",c:"--l5"}
];
const PRINT_COLORS={"--l1":"#B3412F","--l2":"#CF7428","--l3":"#B8961A","--l4":"#5A9A3C","--l5":"#007851"};
const levelOf=s=>LEVELS.find(l=>s<l.max)||LEVELS[4];
const levelIdx=s=>LEVELS.indexOf(levelOf(s));
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=v=>(+v).toFixed(2).replace(".",",");
const scaleName=v=>v===0?"No aplica":(SCALE[v-1]?SCALE[v-1].name:"");

/* Índice plano de ítems */
const ITEMS=[];
AREAS.forEach(a=>a.subs.forEach(s=>s.items.forEach(it=>ITEMS.push({area:a,sub:s,item:it}))));
const TOTAL=ITEMS.length;
const BY_ID={};ITEMS.forEach(x=>BY_ID[x.item.id]=x);

/* ---------- Aplicabilidad ---------- */
function flag(k,p){
 p=p||{};
 if(k==="emp")return (+p.trab||0)>0;
 if(k==="com"||k==="serv"||k==="man")return p.act===k;
 return p[k]===true;
}
const ok=(cond,p)=>!cond||cond.split("|").some(k=>flag(k.trim(),p));
const areaApplies=(a,p)=>ok(a.cond,p);
const subApplies=(a,s,p)=>areaApplies(a,p)&&ok(s.cond,p);
const itemApplies=(a,s,it,p)=>subApplies(a,s,p)&&ok(it.cond,p);
function applicableItems(p){return ITEMS.filter(x=>itemApplies(x.area,x.sub,x.item,p))}
function pending(rec){return applicableItems(rec.perfil).filter(x=>rec.answers[x.item.id]==null).map(x=>x.item.id)}
function progress(rec){const ap=applicableItems(rec.perfil);const d=ap.filter(x=>rec.answers[x.item.id]!=null).length;return {done:d,total:ap.length}}

/* ---------- Cálculo ---------- */
function compute(rec){
 const p=rec.perfil||{},ans=rec.answers||{};
 const areas=[],excluded=[];
 AREAS.forEach(a=>{
  if(!areaApplies(a,p)){excluded.push({name:a.name,reason:"No aplica según el perfil"});return}
  const subs=[];
  a.subs.forEach(s=>{
   if(!subApplies(a,s,p))return;
   const vals=s.items.filter(it=>itemApplies(a,s,it,p)).map(it=>+ans[it.id]).filter(v=>v>=1&&v<=5);
   if(!vals.length)return;
   subs.push({name:s.name,rec:s.rec,area:a.name,score:vals.reduce((x,y)=>x+y,0)/vals.length,n:vals.length});
  });
  if(!subs.length){excluded.push({name:a.name,reason:"Sin prácticas aplicables"});return}
  areas.push({id:a.id,name:a.name,short:a.short||a.name,subs,score:subs.reduce((t,s)=>t+s.score,0)/subs.length});
 });
 const global=areas.length?areas.reduce((t,a)=>t+a.score,0)/areas.length:0;
 const allSubs=areas.flatMap(a=>a.subs);
 const fort=allSubs.filter(s=>s.score>=3.4).sort((x,y)=>y.score-x.score).slice(0,5);
 const debil=allSubs.filter(s=>s.score<2.6).sort((x,y)=>x.score-y.score);
 const plan=allSubs.filter(s=>s.score<3.4).sort((x,y)=>x.score-y.score).map(s=>({...s,prio:s.score<2.6?"Alta":"Media"}));
 const alerts=applicableItems(p).filter(x=>x.item.crit&&ans[x.item.id]>=1&&ans[x.item.id]<=2)
  .map(x=>({id:x.item.id,area:x.area.name,sub:x.sub.name,t:x.item.t,v:+ans[x.item.id]}));
 const sorted=areas.slice().sort((x,y)=>y.score-x.score);
 return {areas,excluded,global,fort,debil,plan,alerts,best:sorted[0],worst:sorted[sorted.length-1]};
}
function summaryText(r){
 const lv=levelOf(r.global).name.toLowerCase();
 let t=`La empresa obtiene un puntaje global de ${fmt(r.global)} sobre 5, que corresponde a un nivel de madurez ${lv}. `;
 if(r.best&&r.worst&&r.best.id!==r.worst.id)t+=`Su área más fuerte es ${r.best.name} (${fmt(r.best.score)}) y la que requiere más atención es ${r.worst.name} (${fmt(r.worst.score)}). `;
 t+=r.plan.length?`Se identificaron ${r.plan.length} sub-dimensiones por debajo del nivel consolidado, ${r.plan.filter(p=>p.prio==="Alta").length} de ellas con prioridad alta. `:`Todas las sub-dimensiones evaluadas alcanzan al menos el nivel consolidado. `;
 if(r.alerts.length)t+=`Además, hay ${r.alerts.length} alerta${r.alerts.length>1?"s":""} crítica${r.alerts.length>1?"s":""} que deben atenderse de inmediato, independientemente del puntaje.`;
 return t.trim();
}
function perfilLines(rec){
 const p=rec.perfil||{};const act=(ACTIVIDADES.find(a=>a.k===p.act)||{}).name||"—";
 return [["Actividad principal",act],["Trabajadores directos",String(+p.trab||0)]].concat(PERFIL.map(f=>[f.q.replace(/^¿|\?$/g,""),p[f.k]===true?"Sí":(p[f.k]===false?"No":"—")]));
}

/* ---------- Radar ---------- */
function radarSVG(areas,colors){
 const W=380,H=330,cx=190,cy=168,R=110,nA=areas.length;
 const pt=(i,r)=>{const a=-Math.PI/2+i*2*Math.PI/nA;return [cx+r*Math.cos(a),cy+r*Math.sin(a)]};
 let g="";
 for(let lvl=1;lvl<=5;lvl++){
  const p=areas.map((_,i)=>pt(i,R*lvl/5).map(v=>v.toFixed(1)).join(",")).join(" ");
  g+=`<polygon points="${p}" fill="none" stroke="${colors.line}" stroke-width="1"/>`;
 }
 areas.forEach((a,i)=>{const [x,y]=pt(i,R);g+=`<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${colors.line}"/>`});
 const poly=areas.map((a,i)=>pt(i,R*a.score/5).map(v=>v.toFixed(1)).join(",")).join(" ");
 g+=`<polygon points="${poly}" fill="${colors.fill}" fill-opacity=".22" stroke="${colors.fill}" stroke-width="2.5" stroke-linejoin="round"/>`;
 areas.forEach((a,i)=>{const [x,y]=pt(i,R*a.score/5);g+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="${colors.fill}"/>`});
 areas.forEach((a,i)=>{
  const [x,y]=pt(i,R+26);const anchor=Math.abs(x-cx)<8?"middle":(x>cx?"start":"end");
  g+=`<text x="${x.toFixed(1)}" y="${(y-4).toFixed(1)}" text-anchor="${anchor}" font-size="13" font-weight="700" fill="${colors.ink}" font-family="Source Sans 3, Segoe UI, sans-serif">${esc(a.short)}</text>`;
  g+=`<text x="${x.toFixed(1)}" y="${(y+12).toFixed(1)}" text-anchor="${anchor}" font-size="12.5" fill="${colors.muted}" font-family="Source Sans 3, Segoe UI, sans-serif">${fmt(a.score)}</text>`;
 });
 return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfico radar de puntajes por área">${g}</svg>`;
}

/* ---------- Informe PDF (jsPDF) ---------- */
function buildPDF(rec,r,fecha){
 const doc=new window.jspdf.jsPDF({unit:"mm",format:"letter"});
 const W=215.9,H=279.4,M=18,CW=W-2*M;let y=M;
 const rgb=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
 const INK="#14201B",MUT="#56645D",PRI="#007851",LINE="#D5DDD8",SOFT="#E2F0EA",YEL="#E9C303",RED="#B3412F",REDSOFT="#FBECE9";
 const LOGOS=window.DIAG_LOGOS||null;
 const col=s=>PRINT_COLORS[levelOf(s).c];
 const tc=h=>doc.setTextColor(...rgb(h));const fc=h=>doc.setFillColor(...rgb(h));const dc=h=>doc.setDrawColor(...rgb(h));
 const ensure=h=>{if(y+h>H-M-4){doc.addPage();y=M}};
 function para(str,o){o=o||{};const size=o.size||10,x=o.x||M,w=o.w||CW,lh=size*0.42+(o.lead||1.2);
  doc.setFont("helvetica",o.bold?"bold":"normal");doc.setFontSize(size);tc(o.color||INK);
  doc.splitTextToSize(String(str),w).forEach(l=>{ensure(lh);doc.text(l,x,y+size*0.35);y+=lh});y+=o.after||0}
 function h2(t){y+=4;ensure(16);doc.setFont("helvetica","bold");doc.setFontSize(13);tc(PRI);doc.text(t,M,y+4.5);y+=8;dc(LINE);doc.setLineWidth(.3);doc.line(M,y,W-M,y);y+=4}
 function bar(x,yy,w,h,s){fc(LINE);doc.roundedRect(x,yy,w,h,h/2,h/2,"F");fc(col(s));doc.roundedRect(x,yy,Math.max(h,w*s/5),h,h/2,h/2,"F")}
 const e=rec.empresa||{};

 // Encabezado
 fc(PRI);doc.rect(0,0,W,8,"F");fc(YEL);doc.rect(0,8,W,1.4,"F");y=17;
 const LW=50,LH=LOGOS?LW*LOGOS.full.h/LOGOS.full.w:0,TW=LOGOS?CW-LW-8:CW;
 if(LOGOS){doc.setFont("helvetica","normal");doc.setFontSize(7.5);tc(MUT);doc.text("Con el apoyo de",W-M-LW,16);
  try{doc.addImage(LOGOS.full.src,"PNG",W-M-LW,18,LW,LH)}catch(err){}}
 para("Informe de diagnóstico empresarial",{size:10,color:PRI,bold:true,w:TW});
 para(e.nombre,{size:20,bold:true,after:1,w:TW});
 const act=(ACTIVIDADES.find(a=>a.k===(rec.perfil||{}).act)||{}).name;
 const meta=[e.nit&&("NIT "+e.nit),act,e.tamano,e.ciudad].filter(Boolean).join("  ·  ");
 if(meta)para(meta,{size:10,color:MUT,w:TW});
 para("Fecha: "+fecha,{size:10,color:MUT,w:TW});
 if(e.responsable)para("Respondió: "+e.responsable+(e.cargo?" ("+e.cargo+")":""),{size:10,color:MUT,w:TW});
 y=Math.max(y,18+LH+2)+4;

 // Radar + puntaje global
 const top=y,cx=M+42,cy=top+40,R=28,nA=r.areas.length;
 const pt=(i,rad)=>{const a=-Math.PI/2+i*2*Math.PI/nA;return [cx+rad*Math.cos(a),cy+rad*Math.sin(a)]};
 dc(LINE);doc.setLineWidth(.25);
 for(let l=1;l<=5;l++){for(let i=0;i<nA;i++){const [x1,y1]=pt(i,R*l/5),[x2,y2]=pt((i+1)%nA,R*l/5);doc.line(x1,y1,x2,y2)}}
 for(let i=0;i<nA;i++){const [x,y2]=pt(i,R);doc.line(cx,cy,x,y2)}
 const P=r.areas.map((a,i)=>pt(i,R*a.score/5));
 fc(SOFT);dc(PRI);doc.setLineWidth(.7);
 doc.lines(P.slice(1).map((p,i)=>[p[0]-P[i][0],p[1]-P[i][1]]),P[0][0],P[0][1],[1,1],"FD",true);
 fc(PRI);P.forEach(p=>doc.circle(p[0],p[1],.9,"F"));
 doc.setFontSize(8);
 r.areas.forEach((a,i)=>{const [x,yy]=pt(i,R+6);const al=Math.abs(x-cx)<3?"center":(x>cx?"left":"right");
  doc.setFont("helvetica","bold");tc(INK);doc.text(a.short,x,yy-1,{align:al});doc.setFont("helvetica","normal");tc(MUT);doc.text(fmt(a.score),x,yy+2.6,{align:al})});
 const gx=M+95;let gy=top+14;
 doc.setFont("helvetica","normal");doc.setFontSize(10);tc(MUT);doc.text("Puntaje global",gx,gy);
 doc.setFont("helvetica","bold");doc.setFontSize(30);tc(INK);doc.text(fmt(r.global),gx,gy+12);
 doc.setFont("helvetica","normal");doc.setFontSize(11);tc(MUT);doc.text("de 5",gx+doc.getTextWidth(fmt(r.global))*30/11+3,gy+12);
 const lv=levelOf(r.global);doc.setFont("helvetica","bold");doc.setFontSize(10);
 const lt="Nivel "+lv.name.toLowerCase();const lw=doc.getTextWidth(lt)+8;fc(PRINT_COLORS[lv.c]);doc.roundedRect(gx,gy+17,lw,7,3.5,3.5,"F");doc.setTextColor(255,255,255);doc.text(lt,gx+4,gy+21.8);
 const li=levelIdx(r.global),sw=(W-M-gx-8)/5;
 LEVELS.forEach((l,i)=>{fc(i<=li?PRINT_COLORS[l.c]:LINE);doc.rect(gx+i*(sw+2),gy+29,sw,2.5,"F");doc.setFont("helvetica","normal");doc.setFontSize(6.5);tc(MUT);doc.text(l.name,gx+i*(sw+2),gy+35)});
 if(r.alerts.length){doc.setFont("helvetica","bold");doc.setFontSize(9.5);tc(RED);doc.text(`${r.alerts.length} alerta${r.alerts.length>1?"s":""} crítica${r.alerts.length>1?"s":""}`,gx,gy+43)}
 y=top+84;
 para(summaryText(r),{size:10.5,after:2});

 // Alertas críticas
 if(r.alerts.length){
  h2("Alertas críticas");
  para("Prácticas legales o financieras calificadas como «No existe» o «Informal». Requieren atención inmediata, aunque el puntaje promedio del área sea bueno.",{size:9.5,color:MUT,after:2});
  r.alerts.forEach(a=>{doc.setFontSize(9.5);const lines=doc.splitTextToSize(a.t,CW-46);const hh=4+lines.length*4.2+3;ensure(hh+2);
   fc(REDSOFT);doc.rect(M,y,CW,hh,"F");fc(RED);doc.rect(M,y,1.6,hh,"F");
   doc.setFont("helvetica","normal");tc(INK);lines.forEach((l,i)=>doc.text(l,M+5,y+5+i*4.2));
   doc.setFont("helvetica","bold");doc.setFontSize(8.5);tc(RED);doc.text(`${a.area} · ${scaleName(a.v)}`,W-M-3,y+5,{align:"right"});
   y+=hh+2});
 }

 // Áreas
 h2("Puntaje por área");
 r.areas.forEach(a=>{ensure(8);doc.setFont("helvetica","normal");doc.setFontSize(10.5);tc(INK);doc.text(a.name,M,y+4);bar(M+52,y+1.3,75,3.6,a.score);doc.setFont("helvetica","bold");doc.text(fmt(a.score),M+132,y+4);doc.setFont("helvetica","normal");tc(MUT);doc.text(levelOf(a.score).name,M+145,y+4);y+=8});
 r.excluded.forEach(x=>para(`${x.name}: no aplica según el perfil de la empresa y no afecta el puntaje global.`,{size:9,color:MUT}));
 para("Todas las áreas aplicables pesan igual en el puntaje global.",{size:9,color:MUT});

 // Sub-dimensiones
 h2("Detalle por sub-dimensión");
 r.areas.forEach(a=>{ensure(14);para(a.name,{size:10.5,bold:true,after:.5});
  a.subs.forEach(s=>{doc.setFont("helvetica","normal");doc.setFontSize(9.5);const nl=doc.splitTextToSize(s.name,56);const hh=Math.max(6.2,nl.length*4+2.2);ensure(hh);
   tc(INK);nl.forEach((l,i)=>doc.text(l,M+3,y+3.5+i*4));bar(M+62,y+1.2,60,2.8,s.score);doc.setFont("helvetica","bold");doc.text(fmt(s.score),M+127,y+3.5);doc.setFont("helvetica","normal");tc(MUT);doc.text(levelOf(s.score).name,M+140,y+3.5);y+=hh});y+=2});

 // Fortalezas / debilidades
 h2("Fortalezas");
 if(r.fort.length)r.fort.forEach(s=>para("•  "+s.name+" ("+s.area+", "+fmt(s.score)+")",{size:10}));else para("Ninguna sub-dimensión alcanza todavía el nivel consolidado (3,40 o más).",{size:10,color:MUT});
 h2("Debilidades");
 if(r.debil.length)r.debil.forEach(s=>para("•  "+s.name+" ("+s.area+", "+fmt(s.score)+")",{size:10}));else para("No hay sub-dimensiones por debajo de 2,60.",{size:10,color:MUT});

 // Plan
 h2("Plan de acción priorizado");
 if(!r.plan.length)para("Todas las sub-dimensiones están en nivel consolidado o avanzado. Se recomienda mantener la medición y repetir el diagnóstico en seis meses.",{size:10});
 r.plan.forEach(p=>{doc.setFontSize(9.5);const lines=doc.splitTextToSize(p.rec,CW-8);const hh=9+lines.length*4.3;ensure(hh+3);
  fc("#F4F7F5");doc.rect(M,y,CW,hh,"F");fc(col(p.score));doc.rect(M,y,1.6,hh,"F");
  doc.setFont("helvetica","bold");doc.setFontSize(10);tc(INK);doc.text(doc.splitTextToSize(p.area+": "+p.name,CW-50)[0],M+5,y+5.5);
  doc.setFont("helvetica","normal");doc.setFontSize(9);tc(MUT);doc.text("Prioridad "+p.prio.toLowerCase()+"  ·  "+fmt(p.score),W-M-3,y+5.5,{align:"right"});
  doc.setFontSize(9.5);tc(INK);lines.forEach((l,i)=>doc.text(l,M+5,y+10.5+i*4.3));y+=hh+3});

 // Perfil
 h2("Perfil de la empresa");
 para("Estas respuestas definen qué prácticas aplican a la empresa.",{size:9,color:MUT,after:1});
 perfilLines(rec).forEach(([k,v])=>{doc.setFontSize(9);const lines=doc.splitTextToSize(k,CW-30);const hh=lines.length*3.9+1.6;ensure(hh);
  doc.setFont("helvetica","normal");tc(INK);lines.forEach((l,i)=>doc.text(l,M+3,y+3.2+i*3.9));doc.setFont("helvetica","bold");doc.text(v,W-M,y+3.2,{align:"right"});y+=hh});

 // Respuestas
 h2("Respuestas registradas");
 AREAS.forEach(a=>{
  if(!areaApplies(a,rec.perfil)){ensure(8);para(a.name+": no aplica según el perfil",{size:10,bold:true,color:MUT,after:1});return}
  ensure(12);para(a.name,{size:10.5,bold:true,after:.5});
  a.subs.forEach(s=>s.items.forEach(it=>{
   if(!itemApplies(a,s,it,rec.perfil))return;
   const v=rec.answers[it.id];
   doc.setFontSize(9);const lines=doc.splitTextToSize(it.id+". "+it.t,CW-42);const hh=lines.length*3.9+1.8;ensure(hh);
   doc.setFont("helvetica","normal");tc(INK);lines.forEach((l,i)=>doc.text(l,M+3,y+3.2+i*3.9));
   doc.setFont("helvetica","bold");tc(v>0?col(v):MUT);doc.text(v>0?(v+"  "+scaleName(v)):(v===0?"No aplica":"—"),W-M,y+3.2,{align:"right"});
   if(it.crit){doc.setFontSize(6.5);tc(RED);doc.text("CRÍTICA",W-M,y+6.4,{align:"right"})}
   y+=hh}));y+=2});

 h2("Escala utilizada");
 SCALE.forEach(s=>para(`${s.v}. ${s.name}: ${s.desc}`,{size:9,color:MUT}));
 para("Niveles de madurez: Inicial, menos de 1,80; Básico, 1,80 a 2,59; En desarrollo, 2,60 a 3,39; Consolidado, 3,40 a 4,19; Avanzado, 4,20 a 5,00.",{size:9,color:MUT,after:1});

 const np=doc.getNumberOfPages();
 for(let i=1;i<=np;i++){doc.setPage(i);dc(LINE);doc.setLineWidth(.3);doc.line(M,H-17,W-M,H-17);
  let fx=M;if(LOGOS){try{doc.addImage(LOGOS.icon.src,"PNG",M,H-15,8,8);fx=M+10}catch(err){}}
  doc.setFont("helvetica","bold");doc.setFontSize(8);tc(PRI);doc.text("Con el apoyo de la Universidad Católica de Oriente  ·  NIT 809.984.746-7",fx,H-11.5);
  doc.setFont("helvetica","normal");tc(MUT);doc.text("Diagnóstico empresarial  ·  "+(e.nombre||""),fx,H-8);
  doc.text("Página "+i+" de "+np,W-M,H-9.5,{align:"right"})}
 return doc.output("arraybuffer");
}

window.DIAG={VERSION:B.version,AREAS,SCALE,PERFIL,ACTIVIDADES,ITEMS,BY_ID,TOTAL,LEVELS,PRINT_COLORS,levelOf,levelIdx,esc,fmt,scaleName,
 flag,ok,areaApplies,subApplies,itemApplies,applicableItems,pending,progress,compute,summaryText,perfilLines,radarSVG,buildPDF};
})();
