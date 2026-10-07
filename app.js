const C={eng:"#6366f1",cal:"#ef4444",gra:"#0ea5e9",lab:"#14b8a6",soc:"#f59e0b",ele:"#22c55e",pro:"#a855f7"};
const DEF=[
{n:"Argumentación Lingüística",c:"ECSH 110",cr:4,p:"F. Abreu",col:C.eng,s:[{d:[1,3],a:9,b:11,r:"Aula GC-304"}]},
{n:"Cálculo Diferencial",c:"MATM 102",cr:5,p:"E. Elías",col:C.cal,s:[{d:[1,3],a:11,b:13,r:"Aula GC-203"},{d:[5],a:11,b:12,r:"Virtual"}]},
{n:"Gráficos en Ingeniería",c:"INGG 227",cr:4,p:"Y. Ruiz",col:C.gra,s:[{d:[2,4],a:11,b:13,r:"Aula ER-201"}]},
{n:"Lab. de Gráficos en Ingeniería",c:"INGG 227L",cr:1,p:"J. Meléndez",col:C.lab,s:[{d:[2],a:16,b:19,r:"LABTI411"}]},
{n:"Ser Humano y Sociedad",c:"SOCI 102",cr:2,p:"M. Camilo",col:C.soc,s:[{d:[1],a:14,b:16,r:"Aula GC-204"}]},
{n:"Nutrición Deportiva (Electiva)",c:"MEDI 106",cr:2,p:"A. Lebrón",col:C.ele,s:[{d:[4],a:14,b:16,r:"Virtual"}]},
{n:"Introducción a la Programación",c:"INGG 102",cr:2,p:"J. Jiménez",col:C.pro,s:[],as:"Virtual · Asincrónica"},
{n:"Lab. de Introducción a la Programación",c:"INGG 102L",cr:0,p:"J. Jiménez",col:C.pro,s:[],as:"Virtual · Asincrónica"}];
const D=["Lun","Mar","Mié","Jue","Vie"],DF=["Lunes","Martes","Miércoles","Jueves","Viernes"];
const H0=8,H1=19,PX=56,f=h=>{const x=Math.floor(h),m=Math.round((h-x)*60);return String(x).padStart(2,"0")+":"+String(m).padStart(2,"0")};
const $=id=>document.getElementById(id);
const META0={tri:"Noviembre 2026 – Enero 2027",car:"Ingeniería Eléctrica"};
let META={...META0},EM=null,S=JSON.parse(JSON.stringify(DEF)),ev=[],tot=0;
function build(){ev=[];S.forEach(m=>m.s.forEach(s=>s.d.forEach(d=>ev.push({m,d,a:s.a,b:s.b,r:s.r}))));ev.sort((a,b)=>a.d-b.d||a.a-b.a);tot=S.reduce((a,m)=>a+(+m.cr||0),0);drawHero()}
function drawHero(){$("tot").textContent=tot;$("hc").textContent="⚡ "+META.car;$("ht").textContent=META.tri+" · "+S.length+" materias"}
build();
const cd=d=>{const L=ev.filter(e=>e.d==d);return{n:L.length,h:L.reduce((a,e)=>a+e.b-e.a,0)}};
// ---- equipo (compartido vía db; respaldo local) ----
let T=[],E=null,unlocked=false,synced=false,editKey="",wd=new Date().getDay(),cur=wd>=1&&wd<=5?wd:1;
try{T=JSON.parse(localStorage.getItem("eq")||"[]")}catch(e){}
const ini=n=>n.trim().split(/\s+/).map(x=>x[0]).join("").slice(0,2).toUpperCase();
const who=m=>T.filter(t=>t.m.includes(m.c));
const avs=m=>{const w=who(m);return w.length?`<div class="av" title="${w.map(x=>x.n).join(", ")}">${w.map(x=>`<i>${ini(x.n)}</i>`).join("")}</div>`:""};
async function saveT(){try{localStorage.setItem("eq",JSON.stringify(T))}catch(e){}
try{const r=await api("team",{method:"PUT",body:JSON.stringify({members:T})});
note(r.status==401?"🔒 Para guardar el equipo necesitas la llave (pestaña Editar).":r.ok?"🔄 Sincronizado con todos":"No se pudo sincronizar")}catch(e){note("Sin conexión: guardado solo en este navegador")}}
function note(t){const e=$("sn");if(e)e.textContent=t}
// ---- API (Cloudflare Pages Functions) ----
try{editKey=sessionStorage.getItem("ek")||""}catch(e){}
const api=(p,o={})=>fetch("/api/"+p,{...o,headers:{"Content-Type":"application/json",...(editKey?{"X-Edit-Key":editKey}:{}),...(o.headers||{})}});
const busy=()=>{const a=document.activeElement;return a&&["INPUT","TEXTAREA","SELECT"].includes(a.tagName)&&a.type!="checkbox"};
async function load(){try{const [a,b,c]=await Promise.all([api("schedule"),api("team"),api("board")]);
if(a.ok){const d=await a.json();if(d&&Array.isArray(d.subjects)){S=d.subjects;if(d.meta&&d.meta.tri&&d.meta.car)META=d.meta;build()}}
if(b.ok){const d=await b.json();if(d&&Array.isArray(d.members))T=d.members}
if(c.ok){const d=await c.json();if(d&&Array.isArray(d.tasks)&&Array.isArray(d.notices))BD={notices:d.notices,tasks:d.tasks}}
synced=true;if(!E&&!busy())drawAll()}catch(e){synced=false}}
// ---- pestañas ----
const TB=["📅 Semana","🗓 Día","📋 Materias","👥 Equipo","⇅ Datos"];let tab=1;
function drawTabs(){$("tabs").innerHTML=TB.map((t,i)=>i==0?"":`<button class="tab ${tab==i?"on":""}" onclick="tab=${i};drawTabs()">${t}${i==6&&pend().length?" · "+pend().length:""}</button>`).join("");
for(let i=1;i<7;i++)$("p"+i).classList.toggle("on",i==tab);$("lay").classList.toggle("wide",tab==5)}
// ---- contador ----
function drawCnt(){$("cnt").innerHTML=D.map((d,i)=>{const c=cd(i+1);return `<div class="cn ${wd==i+1?"t":""}"><span>${d}</span><b>${c.n}</b><span>${c.n==1?"clase":"clases"} · ${c.h}h</span></div>`}).join("")}
// ---- semana ----
const g=$("grid");g.style.setProperty("--H",(H1-H0)*PX+"px");
const nowH=()=>{const n=new Date();return n.getHours()+n.getMinutes()/60};
const isOn=e=>e.d==new Date().getDay()&&nowH()>=e.a&&nowH()<e.b;
function drawGrid(){let h='<div class="dh"></div>'+D.map((d,i)=>`<div class="dh ${wd==i+1?"t":""}">${d} · ${cd(i+1).n}</div>`).join("");
h+='<div class="hrs">'+Array.from({length:H1-H0},(_,i)=>`<div class="hl" style="top:${i*PX}px">${f(H0+i)}</div>`).join("")+"</div>";
for(let d=1;d<=5;d++){h+='<div class="col">'+Array.from({length:H1-H0},(_,i)=>`<div class="hl" style="top:${i*PX}px"></div>`).join("");
ev.filter(e=>e.d==d).forEach(e=>h+=`<div class="ev ${isOn(e)?"on":""}" style="top:${(e.a-H0)*PX+2}px;height:${(e.b-e.a)*PX-4}px;background:${e.m.col}"><b>${e.m.n}</b><span>${e.m.c} · ${e.r}</span><span>${e.m.p}</span>${avs(e.m)}</div>`);
if(wd==d&&nowH()>=H0&&nowH()<H1)h+=`<div class="nl" style="top:${(nowH()-H0)*PX}px"></div>`;
h+="</div>"}g.innerHTML=h}
// ---- día ----
function drawDay(){$("days").innerHTML=D.map((d,i)=>`<button class="tab ${cur==i+1?"on":""}" onclick="cur=${i+1};drawDay()">${d}</button>`).join("");
const L=ev.filter(e=>e.d==cur),c=cd(cur);
$("day").innerHTML=`<div class="sub" style="margin-bottom:10px">${DF[cur-1]} · ${c.n} clases · ${c.h}h</div>`+(L.length?L.map(e=>`<div class="card ${isOn(e)?"on":""}" style="border-left-color:${e.m.col}"><div class="tm">${f(e.a)} – ${f(e.b)}</div><h3>${e.m.n}</h3><p>${e.m.c} · 📍 ${e.r}<br>👨‍🏫 ${e.m.p}</p>${avs(e.m)}</div>`).join(""):'<div class="card" style="border-left-color:var(--ln)"><p>Sin clases 🎉</p></div>')}
// ---- materias ----
function drawMat(){$("p2").innerHTML=S.map(m=>`<div class="card" style="border-left-color:${m.col}"><div class="tm">${m.c} · ${m.cr} créditos</div><h3>${m.n}</h3><div class="bar"><i style="width:${tot?Math.round(m.cr/tot*100):0}%;background:${m.col}"></i></div><p>👨‍🏫 ${m.p}<br>${m.as?"🌐 "+m.as:m.s.map(s=>`🕘 ${s.d.map(d=>D[d-1]).join(" y ")} ${f(s.a)}–${f(s.b)} · ${s.r}`).join("<br>")}</p>${avs(m)}</div>`).join("")}
// ---- equipo ----
function drawTeam(){$("p3").innerHTML=`<div class="card" style="border-left-color:var(--ac)"><div class="row"><input type="text" id="tn" placeholder="Nombre del compañero" style="flex:1;min-width:160px"><button class="bt" id="ta">+ Agregar</button></div>
<div class="msg" id="sn">${synced?"🔄 Compartido con todos (se actualiza solo).":"Guardado solo en este navegador."}</div>
${T.length?"":'<div class="sub">Aún no hay compañeros.</div>'}</div>`+T.map((t,i)=>`<div class="card" style="border-left-color:var(--ac)"><b>${t.n}</b> <button class="bt" style="padding:2px 8px;font-size:11px" onclick="T.splice(${i},1);saveT();drawAll()">Quitar</button>
${S.map(m=>`<label><input type="checkbox" ${t.m.includes(m.c)?"checked":""} onchange="tg(${i},'${m.c}')"> ${m.c} · ${m.n}</label>`).join("")}</div>`).join("");
$("ta").onclick=()=>{const v=$("tn").value.trim();if(!v)return;T.push({n:v,m:[]});saveT();drawAll()}}
function tg(i,c){const a=T[i].m,k=a.indexOf(c);k<0?a.push(c):a.splice(k,1);saveT();drawAll()}
// ---- datos: exportar / importar ----
const rows=()=>ev.map(e=>({Día:DF[e.d-1],Inicio:f(e.a),Fin:f(e.b),Código:e.m.c,Materia:e.m.n,Créditos:e.m.cr,Aula:e.r,Profesor:e.m.p,Equipo:who(e.m).map(x=>x.n).join(", ")}));
const msg=t=>$("dm").textContent=t;
function drawData(){$("p4").innerHTML=`<div class="card" style="border-left-color:var(--ac)"><h3>Exportar</h3><div class="row"><button class="bt" id="xx">📊 Excel</button><button class="bt" id="xj">🧾 JSON</button></div>
<h3 style="margin-top:14px">Importar equipo</h3><p>Carga un JSON exportado antes (o de un compañero) y se une a tu equipo.</p><input type="file" id="fi" accept=".json,application/json" style="margin-top:8px"><div class="msg" id="dm"></div></div>`;
$("xj").onclick=()=>save("horario.json",JSON.stringify({periodo:META.tri,carrera:META.car,creditos:tot,clases_por_dia:D.map((d,i)=>({dia:DF[i],...cd(i+1)})),horario:rows(),avisos:BD.notices,tareas:BD.tasks,asincronicas:S.filter(m=>m.as).map(m=>({codigo:m.c,materia:m.n,creditos:m.cr,profesor:m.p,nota:m.as})),equipo:T},null,2));
$("xx").onclick=()=>{if(!window.XLSX)return msg("No cargó la librería de Excel.");const wb=XLSX.utils.book_new();
const a=XLSX.utils.json_to_sheet(rows());a["!cols"]=[10,8,8,11,34,9,14,14,24].map(w=>({wch:w}));XLSX.utils.book_append_sheet(wb,a,"Horario");
XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(D.map((d,i)=>({Día:DF[i],Clases:cd(i+1).n,Horas:cd(i+1).h}))),"Contador");
XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(S.map(m=>({Código:m.c,Materia:m.n,Créditos:m.cr,Profesor:m.p,Modalidad:m.as||"Presencial/mixta",Equipo:who(m).map(x=>x.n).join(", ")}))),"Materias");
XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(BD.tasks.map(x=>({Tipo:x.kind,Título:x.t,Materia:x.c,Fecha:x.due,Hora:x.time,Instrucciones:x.note}))),"Tareas");
XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(BD.notices.map(x=>({Fecha:x.at,Aviso:x.t,Detalle:x.txt}))),"Avisos");
save("horario.xlsx",new Blob([XLSX.write(wb,{bookType:"xlsx",type:"array"})]))};
$("fi").onchange=async e=>{try{const j=JSON.parse(await e.target.files[0].text());if(!Array.isArray(j.equipo))throw 0;
let n=0;j.equipo.forEach(x=>{if(!x||typeof x.n!="string")return;const t=T.find(y=>y.n.toLowerCase()==x.n.toLowerCase());const ms=(x.m||[]).filter(c=>S.some(s=>s.c==c));if(t)ms.forEach(c=>{if(!t.m.includes(c))t.m.push(c)});else{T.push({n:x.n,m:ms});n++}});
saveT();drawAll();tab=4;drawTabs();msg("Importado: "+n+" compañeros nuevos.")}catch(x){msg("Archivo no válido.")}}}
function save(name,data){const b=data instanceof Blob?data:new Blob([data]);const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1e3);msg("Guardado: "+name)}
// ---- editar (protegido con llave) ----
const sha=async t=>[...new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t)))].map(b=>b.toString(16).padStart(2,"0")).join("");
const esc=t=>String(t??"").replace(/"/g,"&quot;").replace(/</g,"&lt;");
const hm=h=>f(h);
const ph=v=>{const m=String(v).match(/^(\d{1,2}):?(\d{2})?$/);return m?+m[1]+(+(m[2]||0))/60:NaN};
function drawEdit(){const el=$("p5");
if(!unlocked){el.innerHTML=`<div class="card" style="border-left-color:var(--ac)"><h3>🔒 Edición protegida</h3><p>Ingresa la llave para editar materias, horarios, aulas y profesores.</p><div class="row" style="margin-top:8px"><input type="text" id="ky" placeholder="Llave" style="flex:1;min-width:160px"><button class="bt" id="ku">Desbloquear</button></div><div class="msg" id="km"></div></div>`;
$("ku").onclick=async()=>{const k=$("ky").value.trim();
try{const r=await fetch("/api/auth",{headers:{"X-Edit-Key":k}});
if(r.ok){editKey=k;try{sessionStorage.setItem("ek",k)}catch(e){}unlocked=true;E=JSON.parse(JSON.stringify(S));drawEdit();drawBoard()}
else $("km").textContent=r.status==503?"El servidor no tiene EDIT_KEY configurada.":"Llave incorrecta."}catch(e){$("km").textContent="No se pudo contactar el servidor."}};return}
if(!E)E=JSON.parse(JSON.stringify(S));if(!EM)EM={...META};const etot=E.reduce((a,m)=>a+(+m.cr||0),0);
el.innerHTML=`<div class="card" style="border-left-color:var(--ac)"><h3>Carrera y trimestre</h3><div class="row" style="margin-top:8px"><input type="text" value="${esc(EM.car)}" onchange="EM.car=this.value" placeholder="Carrera" style="flex:1;min-width:180px"><input type="text" value="${esc(EM.tri)}" onchange="EM.tri=this.value" placeholder="Trimestre" style="flex:1;min-width:180px"></div><div class="msg">Créditos totales (se calculan solos): <b>${etot}</b></div></div><div class="row" style="margin-bottom:12px"><button class="bt" id="es">💾 Guardar cambios</button><button class="bt" id="ea">+ Materia</button><button class="bt" id="er">↺ Restablecer original</button><button class="bt" id="el">🔒 Bloquear</button></div><div class="msg" id="em">${synced?"Al guardar, el cambio se ve en todos.":"Sin servidor: el cambio vive solo en esta sesión."}</div>`+
E.map((m,i)=>`<div class="card" style="border-left-color:${m.col}"><div class="row"><input type="text" value="${esc(m.n)}" onchange="E[${i}].n=this.value" placeholder="Materia" style="flex:2;min-width:160px"><input type="text" value="${esc(m.c)}" onchange="E[${i}].c=this.value" placeholder="Código" style="width:100px"></div>
<div class="row" style="margin-top:6px"><input type="text" value="${esc(m.p)}" onchange="E[${i}].p=this.value" placeholder="Profesor" style="flex:1;min-width:120px"><input type="text" value="${m.cr}" onchange="E[${i}].cr=+this.value||0;drawEdit()" style="width:60px" title="Créditos"><input type="text" value="${esc(m.as||"")}" onchange="E[${i}].as=this.value" placeholder="Asincrónica: nota (vacío = presencial)" style="flex:2;min-width:160px"></div>
${m.s.map((x,j)=>`<div style="border-top:1px solid var(--ln);margin-top:8px;padding-top:6px"><div class="row">${D.map((d,k)=>`<label style="display:inline;margin:0"><input type="checkbox" ${x.d.includes(k+1)?"checked":""} onchange="tgd(${i},${j},${k+1})">${d}</label>`).join(" ")}</div>
<div class="row" style="margin-top:4px"><input type="text" value="${hm(x.a)}" onchange="tm(${i},${j},'a',this)" style="width:70px" title="Inicio HH:MM"><input type="text" value="${hm(x.b)}" onchange="tm(${i},${j},'b',this)" style="width:70px" title="Fin HH:MM"><input type="text" value="${esc(x.r)}" onchange="E[${i}].s[${j}].r=this.value" placeholder="Aula" style="flex:1;min-width:100px"><button class="bt" onclick="E[${i}].s.splice(${j},1);drawEdit()">✕</button></div></div>`).join("")}
<div class="row" style="margin-top:8px"><button class="bt" onclick="E[${i}].s.push({d:[1],a:8,b:10,r:'Aula'});drawEdit()">+ Sesión</button><button class="bt" onclick="if(confirm('¿Eliminar ${esc(m.n)}?')){E.splice(${i},1);drawEdit()}">🗑 Eliminar materia</button></div></div>`).join("");
$("ea").onclick=()=>{E.push({n:"Nueva materia",c:"COD 000",cr:0,p:"",col:Object.values(C)[E.length%7],s:[]});drawEdit()};
$("er").onclick=()=>{if(confirm("¿Volver al horario original?")){E=JSON.parse(JSON.stringify(DEF));EM={...META0};drawEdit()}};
$("el").onclick=()=>{unlocked=false;E=null;EM=null;editKey="";drawBoard();try{sessionStorage.removeItem("ek")}catch(e){}drawEdit()};
$("es").onclick=async()=>{const bad=E.some(m=>m.s.some(x=>!x.d.length||!(x.a<x.b)));if(bad){$("em").textContent="Revisa: cada sesión necesita un día y hora de fin mayor que la de inicio.";return}
S=JSON.parse(JSON.stringify(E));META={car:EM.car.trim()||META0.car,tri:EM.tri.trim()||META0.tri};build();
let ok="Guardado en esta sesión (sin servidor).";
try{const r=await api("schedule",{method:"PUT",body:JSON.stringify({subjects:S,meta:META})});ok=r.ok?"✅ Guardado y sincronizado con todos.":r.status==401?"🔒 Llave inválida o expirada: vuelve a desbloquear.":"No se pudo guardar en el servidor."}catch(e){}
const keep=E;E=null;drawAll();E=keep;$("em").textContent=ok}}
function tgd(i,j,d){const a=E[i].s[j].d,k=a.indexOf(d);k<0?a.push(d):a.splice(k,1);a.sort()}
function tm(i,j,w,inp){const v=ph(inp.value);if(isNaN(v)||v<0||v>24){inp.value=hm(E[i].s[j][w]);return}E[i].s[j][w]=v;inp.value=hm(v)}
// ---- banner en vivo ----
function live(){const L=$("live"),t=nowH(),d=new Date().getDay(),x=ev.filter(e=>e.d==d);
const cu=x.find(e=>t>=e.a&&t<e.b);L.className="live";
if(cu){const r=Math.round((cu.b-t)*60);L.classList.add("now");L.innerHTML=`🔔 ¡Es hora de clase!<b>${cu.m.n}</b>${cu.m.c} · ${cu.r} · ${cu.m.p}<br>Termina a las ${f(cu.b)} (faltan ${r} min)`;document.title="🔔 "+cu.m.n;return}
const nx=x.find(e=>e.a>t);
if(nx){const r=Math.round((nx.a-t)*60);if(r<=30)L.classList.add("soon");
L.innerHTML=`${r<=30?"⏰ Tu clase empieza pronto":"🟢 Próxima clase hoy"} · ${f(nx.a)} (en ${r>=60?Math.floor(r/60)+" h "+r%60+" min":r+" min"})<b>${nx.m.n}</b>${nx.m.c} · ${nx.r}`;document.title="Mi horario";return}
let k=1,e2;for(;k<=7;k++){const dd=(d+k)%7;e2=ev.find(e=>e.d==dd);if(e2)break}
L.innerHTML=e2?`😎 Sin más clases por hoy<br>Próxima: ${k==1?"mañana":DF[e2.d-1]} ${f(e2.a)}<b>${e2.m.n}</b>${e2.m.c} · ${e2.r}`:"Sin clases programadas";document.title="Mi horario"}
// ---- avisos y tareas ----
let BD={notices:[],tasks:[]},DONE={};
try{DONE=JSON.parse(localStorage.getItem("done")||"{}")}catch(e){}
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const pdate=(d,t)=>{const[y,m,dd]=d.split("-").map(Number);const[h,mi]=(t||"23:59").split(":").map(Number);return new Date(y,m-1,dd,h,mi)};
const pend=()=>BD.tasks.filter(x=>!DONE[x.id]);
async function saveB(){try{const r=await api("board",{method:"PUT",body:JSON.stringify(BD)});const m=r.status==401?"🔒 Llave inválida: vuelve a desbloquear en ✏️ Editar.":r.ok?"✅ Guardado y sincronizado.":"No se pudo guardar.";const e=$("bm");if(e)e.textContent=m}catch(e){const x=$("bm");if(x)x.textContent="Sin conexión: el cambio no se guardó en el servidor."}}
function rel(x){if(!x.due)return{l:"Sin fecha",c:"var(--mu)"};const n=new Date(),d=pdate(x.due,x.time);
if(d<n)return{l:"⚠️ Vencida",c:"#ef4444"};
const t0=new Date(n.getFullYear(),n.getMonth(),n.getDate()),k=Math.round((new Date(d.getFullYear(),d.getMonth(),d.getDate())-t0)/864e5);
return k==0?{l:"🔥 Hoy",c:"#f59e0b"}:k==1?{l:"Mañana",c:"#f59e0b"}:{l:"En "+k+" días",c:k<=3?"#f59e0b":"var(--mu)"}}
const fd=x=>x.due?pdate(x.due).toLocaleDateString("es-DO",{weekday:"short",day:"numeric",month:"short"})+(x.time?" · "+x.time:""):"Sin fecha";
function dn(id){DONE[id]=!DONE[id];try{localStorage.setItem("done",JSON.stringify(DONE))}catch(e){}drawBoard();drawTabs()}
function delB(k,id){if(!confirm("¿Eliminar?"))return;BD[k]=BD[k].filter(x=>x.id!=id);saveB();drawBoard();drawTabs()}
function addN(){const t=$("nt").value.trim();if(!t)return;BD.notices.unshift({id:uid(),t,txt:$("nx").value.trim(),at:new Date().toISOString().slice(0,10)});saveB();drawBoard()}
function addT(){const t=$("tt").value.trim();if(!t)return;BD.tasks.push({id:uid(),kind:$("tk").value,t,c:$("tc").value,due:$("td").value,time:$("th2").value,note:$("tn2").value.trim()});saveB();drawBoard();drawTabs()}
function drawBoard(){const el=$("p6");if(!el)return;const ed=unlocked;
const sorted=[...BD.tasks].sort((a,b)=>(!!DONE[a.id]-!!DONE[b.id])||((a.due?pdate(a.due,a.time):1e15)-(b.due?pdate(b.due,b.time):1e15)));
const nx=pend().filter(x=>x.due).sort((a,b)=>pdate(a.due,a.time)-pdate(b.due,b.time))[0];
el.innerHTML=(nx?`<div class="live" style="margin-top:0"><span class="tm">Próxima entrega</span><b>${esc(nx.t)}</b>${nx.c?esc(nx.c)+" · ":""}${fd(nx)} · ${rel(nx).l}</div>`:"")+
`<h2>📢 Avisos y observaciones</h2>`+
(ed?`<div class="card" style="border-left-color:var(--ac)"><div class="row"><input type="text" id="nt" placeholder="Título del aviso" style="flex:1;min-width:180px"></div><textarea id="nx" placeholder="Observación o detalle (opcional)" rows="2"></textarea><div class="row" style="margin-top:8px"><button class="bt" onclick="addN()">+ Publicar aviso</button></div></div>`:"")+
(BD.notices.length?BD.notices.map(x=>`<div class="card" style="border-left-color:#f59e0b"><div class="tm">${x.at||""}</div><h3>${esc(x.t)}</h3>${x.txt?`<p>${esc(x.txt)}</p>`:""}${ed?`<button class="bt" style="margin-top:8px;padding:3px 9px;font-size:11px" onclick="delB('notices','${x.id}')">🗑 Quitar</button>`:""}</div>`).join(""):'<div class="card" style="border-left-color:var(--ln)"><p>Sin avisos por ahora.</p></div>')+
`<h2>📝 Tareas y proyectos</h2>`+
(ed?`<div class="card" style="border-left-color:var(--ac)"><div class="row"><select id="tk"><option value="tarea">Tarea</option><option value="proyecto">Proyecto</option></select><select id="tc"><option value="">General</option>${S.map(m=>`<option value="${esc(m.c)}">${esc(m.c)} · ${esc(m.n)}</option>`).join("")}</select></div>
<div class="row" style="margin-top:8px"><input type="text" id="tt" placeholder="Título" style="flex:1;min-width:180px"><input type="date" id="td"><input type="time" id="th2"></div>
<textarea id="tn2" placeholder="Instrucciones / comanda (qué hay que entregar, formato, requisitos…)" rows="2"></textarea>
<div class="row" style="margin-top:8px"><button class="bt" onclick="addT()">+ Agregar</button></div></div>`:`<div class="msg">🔒 Para agregar o quitar avisos y tareas, desbloquea la edición con la llave en ✏️ Editar. Marcar como hecha lo puede hacer cualquiera.</div>`)+
(sorted.length?sorted.map(x=>{const m=S.find(s=>s.c==x.c),r=rel(x),dn_=DONE[x.id];return `<div class="card" style="border-left-color:${m?m.col:"var(--ac)"};${dn_?"opacity:.55":""}"><div class="row" style="align-items:center;justify-content:space-between"><label style="display:flex;gap:8px;align-items:center;margin:0;color:var(--tx)"><input type="checkbox" ${dn_?"checked":""} onchange="dn('${x.id}')"><span class="tm">${x.kind=="proyecto"?"🚀 Proyecto":"📝 Tarea"}${x.c?" · "+esc(x.c):""}</span></label><span style="font-size:11px;font-weight:700;color:${dn_?"var(--mu)":r.c}">${dn_?"✅ Hecha":r.l}</span></div>
<h3 style="${dn_?"text-decoration:line-through":""}">${esc(x.t)}</h3><p>📅 ${fd(x)}${x.note?"<br>📌 "+esc(x.note):""}</p>${ed?`<button class="bt" style="margin-top:8px;padding:3px 9px;font-size:11px" onclick="delB('tasks','${x.id}')">🗑 Quitar</button>`:""}</div>`}).join(""):'<div class="card" style="border-left-color:var(--ln)"><p>Sin tareas ni proyectos 🎉</p></div>')+
`<div class="msg" id="bm"></div>`}
function drawAll(){drawBoard();drawCnt();drawGrid();drawDay();drawMat();drawTeam();drawData();drawEdit();live();drawTabs()}
drawAll();load();setInterval(load,20000);setInterval(()=>{wd=new Date().getDay();live();drawGrid();drawDay()},30000);
const r=document.documentElement,tb=$("th");
tb.onclick=()=>{const dk=r.dataset.theme?r.dataset.theme=="dark":matchMedia("(prefers-color-scheme:dark)").matches;r.dataset.theme=dk?"light":"dark";tb.textContent=dk?"🌙":"☀️"};
$("ed").onclick=()=>{tab=5;drawTabs();$("p5").scrollIntoView({behavior:"smooth",block:"start"})};
