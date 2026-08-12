const names=Object.keys(DEFENSES);
const defenseList=document.getElementById("defenseList");
const hitMap=document.getElementById("hitMap");
const equipmentUse=document.getElementById("equipmentUse");
const mode=document.getElementById("mode");
const gaLevel=document.getElementById("gaLevel");
const rbLevel=document.getElementById("rbLevel");
const fbLevel=document.getElementById("fbLevel");
const preview=document.getElementById("damagePreview");
const modeNote=document.getElementById("modeNote");

function fill(select,values){
  select.innerHTML="";
  values.forEach(v=>{
    const o=document.createElement("option");
    o.value=v;o.textContent="Lv."+v;select.appendChild(o);
  });
}
fill(gaLevel,Object.keys(GIANT_ARROW).map(Number));
fill(rbLevel,Object.keys(ROCKET_BACKPACK).map(Number));
fill(fbLevel,Object.keys(FIREBALL).map(Number));

equipmentUse.innerHTML=`
<div class="equipment-item">
<label><input type="checkbox" id="useEQ" checked> Earthquake</label>
<div class="note">Damage: 29% formula</div>
</div>
<div class="equipment-item">
<label><input type="checkbox" id="useGA" checked> Giant Arrow</label>
<div class="note">Selected level</div>
</div>
<div class="equipment-item">
<label><input type="checkbox" id="useRB" checked> Rocket Backpack</label>
<div class="note">Selected level</div>
</div>
<div class="equipment-item">
<label><input type="checkbox" id="useFB"> Fireball</label>
<div class="note">Selected level</div>
</div>
<div class="equipment-item">
<label><input type="checkbox" id="useLightning" checked> Lightning Lv.${LIGHTNING.level}</label>
<div class="note">${LIGHTNING.damage} damage / spell. Count is entered separately for each defense.</div>
</div>`;

function updateMode(){
  if(mode.value==="esports"){
    gaLevel.value=TOURNAMENT.common;
    rbLevel.value=TOURNAMENT.epic;
    fbLevel.value=TOURNAMENT.epic;
    gaLevel.disabled=rbLevel.disabled=fbLevel.disabled=true;
    modeNote.textContent="Esports/Tournament: Common Lv15, Epic Lv18.";
  }else{
    gaLevel.disabled=rbLevel.disabled=fbLevel.disabled=false;
    modeNote.textContent="Custom mode: choose equipment levels.";
  }
  updatePreview();
}
mode.onchange=updateMode;
[gaLevel,rbLevel,fbLevel].forEach(x=>x.onchange=updatePreview);

function updatePreview(){
  const ga=Number(gaLevel.value),rb=Number(rbLevel.value),fb=Number(fbLevel.value);
  preview.innerHTML=`
  <b>Selected damage</b><br>
  Giant Arrow Lv.${ga}: <b>${GIANT_ARROW[ga]}</b> base /
  <b>${GIANT_ARROW[ga]*2}</b> vs Air Defense<br>
  Rocket Backpack Lv.${rb}: <b>${ROCKET_BACKPACK[rb]}</b><br>
  Fireball Lv.${fb}: <b>${FIREBALL[fb].damage}</b>, radius ${FIREBALL[fb].radius} tiles<br>
  Lightning Lv.${LIGHTNING.level}: <b>${LIGHTNING.damage}</b>, radius ${LIGHTNING.radius} tiles`;
}

names.forEach((name,i)=>{
  const label=document.createElement("label");
  label.className="defense";
  label.innerHTML=`<input type="checkbox" class="defense-select" value="${i}"> ${i+1}. ${name} <span class="pill">${DEFENSES[name].hp} HP</span>`;
  defenseList.appendChild(label);
});

document.getElementById("selectAll").onclick=()=>{
  document.querySelectorAll(".defense-select").forEach(x=>x.checked=true);buildHitMap();
};
document.getElementById("clearAll").onclick=()=>{
  document.querySelectorAll(".defense-select").forEach(x=>x.checked=false);buildHitMap();
};
defenseList.addEventListener("change",buildHitMap);
equipmentUse.addEventListener("change",buildHitMap);

function buildHitMap(){
  const selected=[...document.querySelectorAll(".defense-select:checked")].map(x=>names[Number(x.value)]);
  if(!selected.length){hitMap.innerHTML='<p class="note">Select defenses above.</p>';return;}

  const useEQ=document.getElementById("useEQ").checked;
  const useGA=document.getElementById("useGA").checked;
  const useRB=document.getElementById("useRB").checked;
  const useFB=document.getElementById("useFB").checked;
  const useLightning=document.getElementById("useLightning").checked;

  hitMap.innerHTML=`
  <div class="table-wrap"><table class="hit-table">
  <thead><tr>
  <th>Defense</th>
  ${useEQ?'<th>EQ Count</th>':''}
  ${useGA?'<th>GA Hit</th>':''}
  ${useRB?'<th>RB Hit</th>':''}
  ${useFB?'<th>Fireball Hit</th>':''}
  ${useLightning?'<th>Lightning Count<br><small>Lv.10</small></th>':''}
  </tr></thead>
  <tbody>
  ${selected.map(d=>`
  <tr data-defense="${encodeURIComponent(d)}">
  <td>${escapeHTML(d)}<br><span class="pill">HP ${DEFENSES[d].hp}</span></td>
  ${useEQ?'<td><input type="number" class="eq-count" min="0" max="8" step="1" value="0"></td>':''}
  ${useGA?'<td><input type="checkbox" class="ga-hit"></td>':''}
  ${useRB?'<td><input type="checkbox" class="rb-hit"></td>':''}
  ${useFB?'<td><input type="checkbox" class="fb-hit"></td>':''}
  ${useLightning?`<td><input type="number" class="lightning" min="0" max="11" step="1" value="0" ${DEFENSES[d].lightning?"":"disabled"}></td>`:''}
  </tr>`).join("")}
  </tbody></table></div>`;
}

function escapeHTML(v){
  return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}

function eqDamage(maxHP,count){
  let total=0;
  for(let n=1;n<=count;n++) total+=maxHP*EARTHQUAKE_PERCENT/(2*n-1);
  return Math.round(total);
}

function apply(hp,damage,attack,log){
  const before=hp;
  hp=Math.max(0,hp-damage);
  log.push({attack,before,damage,after:hp});
  return hp;
}

function checked(row,cls){
  const x=row.querySelector(cls);
  return x ? x.checked : false;
}

function numberValue(row,cls){
  const x=row.querySelector(cls);
  return x ? Math.max(0,Number(x.value)||0) : 0;
}

function calcDefense(def,row){
  let hp=DEFENSES[def].hp;
  const initial=hp,log=[];

  const useEQ=document.getElementById("useEQ").checked;
  const useGA=document.getElementById("useGA").checked;
  const useRB=document.getElementById("useRB").checked;
  const useFB=document.getElementById("useFB").checked;
  const useLightning=document.getElementById("useLightning").checked;

  const defenseEQCount = useEQ ? Math.max(0, Math.min(8, numberValue(row,".eq-count"))) : 0;

  if(defenseEQCount > 0)
    hp=apply(hp,eqDamage(initial,defenseEQCount),`${defenseEQCount} Earthquake (hit)`,log);

  if(hp>0 && useGA && checked(row,".ga-hit")){
    let damage=GIANT_ARROW[Number(gaLevel.value)];
    if(def==="Air Defense") damage*=2;
    hp=apply(hp,damage,`Giant Arrow Lv.${gaLevel.value}`,log);
  }

  if(hp>0 && useRB && checked(row,".rb-hit"))
    hp=apply(hp,ROCKET_BACKPACK[Number(rbLevel.value)],`Rocket Backpack Lv.${rbLevel.value}`,log);

  if(hp>0 && useFB && checked(row,".fb-hit"))
    hp=apply(hp,FIREBALL[Number(fbLevel.value)].damage,`Fireball Lv.${fbLevel.value}`,log);

  const lightning=useLightning ? numberValue(row,".lightning") : 0;
  if(hp>0 && lightning>0 && DEFENSES[def].lightning)
    hp=apply(hp,lightning*LIGHTNING.damage,`${lightning} Lightning Lv.${LIGHTNING.level}`,log);

  let destroyedBy="";
  if(hp===0){
    for(let i=log.length-1;i>=0;i--){
      if(log[i].after===0 && log[i].damage>0){destroyedBy=log[i].attack;break;}
    }
  }

  return {
    def,initial,remaining:hp,destroyed:hp===0,destroyedBy,
    lightningUsed:lightning,
    lightningNeeded:(hp>0&&DEFENSES[def].lightning)?Math.ceil(hp/LIGHTNING.damage):0,
    log
  };
}

document.getElementById("calculate").onclick=()=>{
  const rows=[...document.querySelectorAll("#hitMap tbody tr")];
  if(!rows.length){alert("Select at least one defense.");return;}

  const results=rows.map(r=>calcDefense(decodeURIComponent(r.dataset.defense),r));
  const destroyed=results.filter(r=>r.destroyed).length;
  const extra=results.reduce((s,r)=>s+r.lightningNeeded,0);
  const used=results.reduce((s,r)=>s+r.lightningUsed,0);

  document.getElementById("summary").innerHTML=`
  <div class="summary">
  <b>Destroyed:</b> ${destroyed}/${results.length}<br>
  <b>Success rate:</b> ${Math.round(destroyed/results.length*100)}%<br>
  <b>Lightning Lv.${LIGHTNING.level} allocated:</b> ${used}<br>
  <b>Additional Lightning Lv.${LIGHTNING.level} needed:</b> ${extra}
  </div>`;

  document.getElementById("details").innerHTML=results.map(r=>`
  <div class="result">
  <h3>${escapeHTML(r.def)}</h3>
  Initial HP: <b>${r.initial}</b><br>
  Remaining HP: <b>${r.remaining}</b><br>
  <div class="${r.destroyed?"good":"bad"}">
  ${r.destroyed?"✅ DESTROYED by "+escapeHTML(r.destroyedBy):"❌ SURVIVED"}
  </div>
  ${r.destroyed
    ?`<div>Lightning allocated: <b>${r.lightningUsed}</b></div>`
    :`<div>Minimum additional Lightning Lv.${LIGHTNING.level}: <b>${r.lightningNeeded}</b></div>`}
  <div class="table-wrap"><table class="log">
  <thead><tr><th>Attack</th><th>Before</th><th>Damage</th><th>After</th></tr></thead>
  <tbody>${r.log.map(x=>`<tr><td>${escapeHTML(x.attack)}</td><td>${x.before}</td><td>${x.damage}</td><td>${x.after}</td></tr>`).join("")}</tbody>
  </table></div>
  </div>`).join("");

  document.getElementById("results").classList.remove("hidden");
};

updateMode();
buildHitMap();
