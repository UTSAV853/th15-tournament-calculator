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

/* v1.5 COMPLETE: Crafted Defense + Tournament Decision + Attack Tracker */
const CRAFTED_DEFENSE_MAX_LEVEL=15;
const CRAFTED_DEFENSES={"Cake-A-Pult":"Splash / delayed-explosion defense","Hero Hunter":"Hero-focused defense","Hot Candle":"Multi-target flame defense"};
const craftedDefense=document.getElementById("craftedDefense"), craftedOptions=document.getElementById("craftedOptions"), craftedDescription=document.getElementById("craftedDescription"), craftedHP=document.getElementById("craftedHP");
const craftedModules=craftedOptions?[...craftedOptions.querySelectorAll(".crafted-module")]:[];
if(craftedDefense){craftedModules.forEach(x=>{for(let i=1;i<=15;i++){const o=document.createElement("option");o.value=i;o.textContent="Lv."+i;x.appendChild(o)}});function uc(){const active=craftedDefense.value!=="none";craftedOptions.classList.toggle("hidden",!active);craftedDescription.innerHTML=active?`<b>${escapeHTML(craftedDefense.value)}</b><br>${escapeHTML(CRAFTED_DEFENSES[craftedDefense.value])}<br><span class="note">TH15 max module level: Lv.15. Modules: ${craftedModules.map(x=>x.value).join(" / ")}. Enter actual HP.</span>`:"No Crafted Defense selected.";buildHitMap()}craftedDefense.addEventListener("change",uc);craftedModules.forEach(x=>x.addEventListener("change",uc));craftedHP.addEventListener("input",uc);uc()}
const originalBuildHitMap=buildHitMap;
buildHitMap=function(){originalBuildHitMap(); if(craftedDefense&&craftedDefense.value!=="none"&&Number(craftedHP.value)>0){const tbody=hitMap.querySelector("tbody");if(tbody&&!tbody.querySelector('[data-defense="'+encodeURIComponent(craftedDefense.value)+'"]')){const d=craftedDefense.value;const useEQ=document.getElementById("useEQ").checked,useGA=document.getElementById("useGA").checked,useRB=document.getElementById("useRB").checked,useFB=document.getElementById("useFB").checked,useL=document.getElementById("useLightning").checked;const tr=document.createElement("tr");tr.dataset.defense=encodeURIComponent(d);tr.innerHTML=`<td>${escapeHTML(d)}<br><span class="pill">HP ${Number(craftedHP.value)}</span></td>${useEQ?'<td><input type="number" class="eq-count" min="0" max="8" value="0"></td>':''}${useGA?'<td><input type="checkbox" class="ga-hit"></td>':''}${useRB?'<td><input type="checkbox" class="rb-hit"></td>':''}${useFB?'<td><input type="checkbox" class="fb-hit"></td>':''}${useL?'<td><input type="number" class="lightning" value="0" disabled></td>':''}`;tbody.appendChild(tr)}}};
const originalCalc=calcDefense;
calcDefense=function(def,row){if(CRAFTED_DEFENSES[def]){let hp=Math.max(0,Number(craftedHP.value)||0),initial=hp,log=[];const useEQ=document.getElementById("useEQ").checked,useGA=document.getElementById("useGA").checked,useRB=document.getElementById("useRB").checked,useFB=document.getElementById("useFB").checked;const eq=useEQ?Math.min(8,numberValue(row,".eq-count")):0;if(eq)hp=apply(hp,eqDamage(initial,eq),`${eq} Earthquake`,log);if(hp>0&&useGA&&checked(row,".ga-hit")){let d=GIANT_ARROW[Number(gaLevel.value)];hp=apply(hp,d,`Giant Arrow Lv.${gaLevel.value}`,log)}if(hp>0&&useRB&&checked(row,".rb-hit"))hp=apply(hp,ROCKET_BACKPACK[Number(rbLevel.value)],`Rocket Backpack Lv.${rbLevel.value}`,log);if(hp>0&&useFB&&checked(row,".fb-hit"))hp=apply(hp,FIREBALL[Number(fbLevel.value)].damage,`Fireball Lv.${fbLevel.value}`,log);let by="";if(hp===0){for(let i=log.length-1;i>=0;i--)if(log[i].after===0&&log[i].damage>0){by=log[i].attack;break}}return{def,initial,remaining:hp,destroyed:hp===0,destroyedBy:by,lightningUsed:0,lightningNeeded:0,log}}return originalCalc(def,row)};


/* =========================================================
   TOURNAMENT ATTACK TRACKER
   Inline entry. No popup / prompt input.
   ========================================================= */
(function () {
  "use strict";

  const STORAGE_KEY = "th15_tournament_tracker_final_v21";
  const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || {
    totalAttacks: 3,
    round: "",
    myTeam: "",
    opponent: "",
    mine: [],
    opp: []
  };

  const $ = id => document.getElementById(id);

  function n(value) {
    return Math.max(0, Number(value) || 0);
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[c]));
  }

  function formatTime(seconds) {
    const total = Math.max(0, Math.round(seconds || 0));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
  }

  function totals(list) {
    return {
      attacks: list.length,
      stars: list.reduce((sum, item) => sum + item.stars, 0),
      destruction: list.reduce((sum, item) => sum + item.destruction, 0),
      time: list.reduce((sum, item) => sum + item.time, 0)
    };
  }

  function averages(list) {
    const t = totals(list);

    if (t.attacks === 0) {
      return {
        stars: 0,
        destruction: 0,
        time: 0
      };
    }

    return {
      stars: t.stars / t.attacks,
      destruction: t.destruction / t.attacks,
      time: t.time / t.attacks
    };
  }

  /*
   * Result logic:
   * 1. Compare stars first.
   * 2. If stars are tied, compare average destruction of completed attacks.
   * 3. Calculate the exact destruction percentage required on the next
   *    attack to exceed the opponent's current average, when possible.
   *
   * This avoids treating unequal numbers of completed attacks as if raw
   * destruction totals were directly comparable.
   */
  function matchResult() {
    const mine = totals(state.mine);
    const opp = totals(state.opp);

    if (mine.attacks === 0 && opp.attacks === 0) {
      return {
        title: "WAITING FOR ATTACKS",
        message: "Enter the first completed attack.",
        className: "neutral"
      };
    }

    if (mine.stars > opp.stars) {
      return {
        title: "YOUR TEAM IS AHEAD",
        message:
          `Your team leads by <b>${mine.stars - opp.stars}★</b>. ` +
          `Current score: ${mine.stars}★ vs ${opp.stars}★.`,
        className: "good"
      };
    }

    if (mine.stars < opp.stars) {
      return {
        title: "YOUR TEAM IS BEHIND",
        message:
          `Your team trails by <b>${opp.stars - mine.stars}★</b>. ` +
          `Current score: ${mine.stars}★ vs ${opp.stars}★. ` +
          `A destruction percentage increase does not replace a missing star ` +
          `when stars are the primary result metric.`,
        className: "bad"
      };
    }

    const myAvg = mine.attacks ? mine.destruction / mine.attacks : 0;
    const oppAvg = opp.attacks ? opp.destruction / opp.attacks : 0;

    if (mine.attacks === 0) {
      return {
        title: "STARS TIED",
        message:
          `Opponent average destruction is ${oppAvg.toFixed(2)}%. ` +
          `Enter your first attack to calculate the target.`,
        className: "neutral"
      };
    }

    if (myAvg > oppAvg) {
      return {
        title: "STARS TIED • YOUR TEAM LEADS",
        message:
          `Your average destruction is <b>${myAvg.toFixed(2)}%</b> ` +
          `vs opponent <b>${oppAvg.toFixed(2)}%</b>.`,
        className: "good"
      };
    }

    if (myAvg < oppAvg) {
      const nextAttackCount = mine.attacks + 1;
      const required =
        oppAvg * nextAttackCount - mine.destruction;

      return {
        title: "STARS TIED • NEXT ATTACK TARGET",
        message:
          `Current averages: your team <b>${myAvg.toFixed(2)}%</b>, ` +
          `opponent <b>${oppAvg.toFixed(2)}%</b>.<br>` +
          `Your next attack needs at least ` +
          `<b>${Math.max(0, required + 0.01).toFixed(2)}%</b> ` +
          `to move your new average above the opponent's current average.`,
        className: "bad"
      };
    }

    return {
      title: "STARS AND DESTRUCTION TIED",
      message: "The next attack creates the advantage.",
      className: "neutral"
    };
  }

  function renderLive() {
    const mine = totals(state.mine);
    const opp = totals(state.opp);

    const mineRemaining =
      Math.max(0, state.totalAttacks - mine.attacks);

    const oppRemaining =
      Math.max(0, state.totalAttacks - opp.attacks);

    const result = matchResult();

    $("trackerLiveResult").innerHTML = `
      <b>Round:</b> ${esc(state.round || "Not specified")}<br><br>

      <b>${esc(state.myTeam || "My Team")}</b><br>
      Attacks: ${mine.attacks}/${state.totalAttacks}<br>
      Total Stars: ${mine.stars}★<br>
      Total Destruction: ${mine.destruction.toFixed(2)}%<br>
      Average Destruction: ${mine.attacks
        ? (mine.destruction / mine.attacks).toFixed(2)
        : "0.00"}%<br>
      Remaining Attacks: ${mineRemaining}<br><br>

      <b>${esc(state.opponent || "Opponent")}</b><br>
      Attacks: ${opp.attacks}/${state.totalAttacks}<br>
      Total Stars: ${opp.stars}★<br>
      Total Destruction: ${opp.destruction.toFixed(2)}%<br>
      Average Destruction: ${opp.attacks
        ? (opp.destruction / opp.attacks).toFixed(2)
        : "0.00"}%<br>
      Remaining Attacks: ${oppRemaining}
    `;

    $("liveResult").innerHTML = `
      <h3>${result.title}</h3>
      ${result.message}
      <br><br>
      <span class="note">
        This result recalculates immediately from every attack currently saved.
      </span>
    `;
  }

  function renderAttackStats() {
    const rowCount = Math.max(
      state.totalAttacks,
      state.mine.length,
      state.opp.length
    );

    if (!rowCount) {
      $("attackStats").innerHTML =
        '<p class="note">No attacks recorded.</p>';
      return;
    }

    let rows = "";

    for (let attackNo = 1; attackNo <= rowCount; attackNo++) {
      const mine = state.mine.find(
        item => item.attackNumber === attackNo
      );

      const opp = state.opp.find(
        item => item.attackNumber === attackNo
      );

      rows += `
        <tr>
          <td>${attackNo}</td>
          <td>${mine ? `${mine.stars}★` : "-"}</td>
          <td>${mine ? `${mine.destruction.toFixed(2)}%` : "-"}</td>
          <td>${mine ? formatTime(mine.time) : "-"}</td>
          <td>${mine ? `<button type="button" class="delete-attack" data-team="mine" data-attack="${attackNo}">Delete</button>` : "-"}</td>
          <td>${opp ? `${opp.stars}★` : "-"}</td>
          <td>${opp ? `${opp.destruction.toFixed(2)}%` : "-"}</td>
          <td>${opp ? formatTime(opp.time) : "-"}</td>
          <td>${opp ? `<button type="button" class="delete-attack" data-team="opp" data-attack="${attackNo}">Delete</button>` : "-"}</td>
        </tr>
      `;
    }

    $("attackStats").innerHTML = `
      <div class="table-wrap">
      <table class="log">
        <thead>
          <tr>
            <th>Attack #</th>
            <th>My ★</th>
            <th>My %</th>
            <th>My Time</th>
            <th>Delete My</th>
            <th>Opponent ★</th>
            <th>Opponent %</th>
            <th>Opponent Time</th>
            <th>Delete Opponent</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      </div>
    `;
  }


  function deleteAttack(team, attackNumber) {
    const list = team === "mine" ? state.mine : state.opp;
    const index = list.findIndex(item => item.attackNumber === attackNumber);

    if (index === -1) return;

    const teamName = team === "mine"
      ? (state.myTeam || "My Team")
      : (state.opponent || "Opponent");

    if (!confirm(`Delete ${teamName} attack #${attackNumber}?`)) {
      return;
    }

    list.splice(index, 1);

    renderAll();
  }

  function renderAverages() {
    const mineTotals = totals(state.mine);
    const mineAvg = averages(state.mine);

    const oppTotals = totals(state.opp);
    const oppAvg = averages(state.opp);

    $("teamAverages").innerHTML = `
      <div class="table-wrap">
      <table class="log">
        <thead>
          <tr>
            <th>Metric</th>
            <th>${esc(state.myTeam || "My Team")}</th>
            <th>${esc(state.opponent || "Opponent")}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Completed Attacks</td>
            <td>${mineTotals.attacks}</td>
            <td>${oppTotals.attacks}</td>
          </tr>
          <tr>
            <td>Total Stars</td>
            <td>${mineTotals.stars}</td>
            <td>${oppTotals.stars}</td>
          </tr>
          <tr>
            <td>Average Stars / Attack</td>
            <td>${mineAvg.stars.toFixed(2)}</td>
            <td>${oppAvg.stars.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Total Destruction</td>
            <td>${mineTotals.destruction.toFixed(2)}%</td>
            <td>${oppTotals.destruction.toFixed(2)}%</td>
          </tr>
          <tr>
            <td>Average Destruction / Attack</td>
            <td>${mineAvg.destruction.toFixed(2)}%</td>
            <td>${oppAvg.destruction.toFixed(2)}%</td>
          </tr>
          <tr>
            <td>Total Attack Time</td>
            <td>${formatTime(mineTotals.time)}</td>
            <td>${formatTime(oppTotals.time)}</td>
          </tr>
          <tr>
            <td>Average Attack Time</td>
            <td>${formatTime(mineAvg.time)}</td>
            <td>${formatTime(oppAvg.time)}</td>
          </tr>
        </tbody>
      </table>
      </div>
    `;
  }


  function renderAll() {
    $("trackerTotalAttacks").value = state.totalAttacks;
    $("trackerRound").value = state.round;
    $("trackerMyTeam").value = state.myTeam;
    $("trackerOpponent").value = state.opponent;

    renderLive();
    renderAttackStats();
    renderAverages();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  $("trackerTotalAttacks").addEventListener("input", event => {
    state.totalAttacks = Math.max(
      1,
      Math.floor(n(event.target.value))
    );
    renderAll();
  });

  $("trackerRound").addEventListener("input", event => {
    state.round = event.target.value;
    renderLive();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  });

  $("trackerMyTeam").addEventListener("input", event => {
    state.myTeam = event.target.value;
    renderAll();
  });

  $("trackerOpponent").addEventListener("input", event => {
    state.opponent = event.target.value;
    renderAll();
  });

  /*
   * THE ONLY SAVE HANDLER.
   * No prompt(), no duplicate button listener, no old tracker code.
   */
  $("saveTrackerAttack").addEventListener("click", function () {
    const team = $("trackerEntryTeam").value;

    const attackNumber = Math.max(
      1,
      Math.floor(n($("trackerEntryAttack").value))
    );

    const stars = Math.min(
      3,
      n($("trackerEntryStars").value)
    );

    const destruction = Math.min(
      100,
      n($("trackerEntryDestruction").value)
    );

    const minutes = n($("trackerEntryMinutes").value);

    const seconds = Math.min(
      59,
      n($("trackerEntrySeconds").value)
    );

    const note = $("trackerEntryNote").value.trim();

    const attack = {
      attackNumber,
      stars,
      destruction,
      time: minutes * 60 + seconds,
      note,
      savedAt: new Date().toISOString()
    };

    const list =
      team === "mine" ? state.mine : state.opp;

    const existingIndex = list.findIndex(
      item => item.attackNumber === attackNumber
    );

    if (existingIndex >= 0) {
      list[existingIndex] = attack;
    } else {
      list.push(attack);
      list.sort(
        (a, b) => a.attackNumber - b.attackNumber
      );
    }

    if (attackNumber > state.totalAttacks) {
      state.totalAttacks = attackNumber;
    }

    $("trackerEntryAttack").value =
      attackNumber + 1;

    $("trackerEntryStars").value = 2;
    $("trackerEntryDestruction").value = 80;
    $("trackerEntryMinutes").value = 2;
    $("trackerEntrySeconds").value = 30;
    $("trackerEntryNote").value = "";

    renderAll();
  });

  $("attackStats").addEventListener("click", function (event) {
    const button = event.target.closest(".delete-attack");
    if (!button) return;

    const team = button.dataset.team;
    const attackNumber = Number(button.dataset.attack);

    deleteAttack(team, attackNumber);
  });

  $("clearTournamentTracker").addEventListener("click", function () {
    if (!confirm(
      "Clear all tournament tracker data?"
    )) {
      return;
    }

    state.totalAttacks = 3;
    state.round = "";
    state.myTeam = "";
    state.opponent = "";
    state.mine = [];
    state.opp = [];

    $("trackerEntryAttack").value = 1;

    renderAll();
  });


  renderAll();
})();

/* =========================================================
   PREDICTION DIALOG
   Keeps prediction out of the main page until requested.
   ========================================================= */
(function () {
  const dialog = document.getElementById("predictionDialog");
  const openButton = document.getElementById("openPredictionDialog");
  const current = document.getElementById("predictionCurrent");
  const run = document.getElementById("runPrediction");
  const starsInput = document.getElementById("predictionStars");
  const destructionInput = document.getElementById("predictionDestruction");
  const target = document.getElementById("predictionTarget");

  if (!dialog || !openButton || !run) return;

  function getState() {
    return JSON.parse(
      localStorage.getItem("th15_tournament_tracker_v20") ||
      localStorage.getItem("th15_tournament_tracker_final_v21") ||
      localStorage.getItem("th15_attack_tracker_v3") ||
      "null"
    );
  }

  function totals(list) {
    return {
      attacks: list.reduce((s, a) => s + 1, 0),
      stars: list.reduce((s, a) => s + Number(a.stars || 0), 0),
      destruction: list.reduce((s, a) => s + Number(a.destruction || 0), 0)
    };
  }

  function openPrediction() {
    const state = getState();
    if (!state) {
      current.innerHTML = "No tournament attack data has been entered yet.";
      target.innerHTML = "Enter attacks in the tracker first.";
      dialog.showModal();
      return;
    }

    const mine = totals(state.mine || []);
    const opp = totals(state.opp || []);

    const totalAttacks = Number(state.totalAttacks || 0);
    const myRemaining = Math.max(0, totalAttacks - mine.attacks);

    current.innerHTML = `
      <b>${state.myTeam || "My Team"}:</b>
      ${mine.attacks}/${totalAttacks} attacks,
      ${mine.stars}★,
      ${mine.destruction.toFixed(2)}% destruction<br>
      <b>${state.opponent || "Opponent"}:</b>
      ${opp.attacks}/${totalAttacks} attacks,
      ${opp.stars}★,
      ${opp.destruction.toFixed(2)}% destruction<br>
      <b>Your remaining attacks:</b> ${myRemaining}
    `;

    if (myRemaining <= 0) {
      target.innerHTML = "<b>No attacks remaining.</b> There is nothing left to project.";
    } else {
      runPrediction();
    }

    dialog.showModal();
  }

  function runPrediction() {
    const state = getState();
    if (!state) return;

    const mineList = state.mine || [];
    const oppList = state.opp || [];

    const mine = totals(mineList);
    const opp = totals(oppList);

    const totalAttacks = Number(state.totalAttacks || 0);
    const remaining = Math.max(0, totalAttacks - mine.attacks);

    const expectedStars = Math.min(
      3,
      Math.max(0, Number(starsInput.value) || 0)
    );
    const expectedDestruction = Math.min(
      100,
      Math.max(0, Number(destructionInput.value) || 0)
    );

    if (remaining === 0) {
      target.innerHTML = "<b>No attacks remaining.</b>";
      return;
    }

    const projectedStars = mine.stars + expectedStars * remaining;
    const projectedDestruction =
      mine.destruction + expectedDestruction * remaining;

    const opponentStars = opp.stars;
    const opponentDestruction = opp.destruction;

    let result = "";
    let targetText = "";

    if (mine.stars < opponentStars) {
      const starGap = opponentStars - mine.stars;
      const requiredAverage =
        starGap / remaining;

      targetText =
        `To overtake the opponent's current ${opponentStars}★, ` +
        `you need at least <b>${starGap} additional star(s)</b> ` +
        `across ${remaining} remaining attack(s), ` +
        `or an average of <b>${requiredAverage.toFixed(2)}★ per attack</b>.`;
    } else if (mine.stars === opponentStars) {
      const myAvg = mine.attacks
        ? mine.destruction / mine.attacks
        : 0;
      const oppAvg = opp.attacks
        ? opp.destruction / opp.attacks
        : 0;

      if (myAvg >= oppAvg) {
        targetText =
          `Stars are tied and your current average destruction ` +
          `<b>${myAvg.toFixed(2)}%</b> is already at or above the ` +
          `opponent's <b>${oppAvg.toFixed(2)}%</b>.`;
      } else {
        const neededTotal =
          oppAvg * (mine.attacks + remaining) - mine.destruction;

        const perAttack =
          Math.max(0, neededTotal / remaining);

        targetText =
          `Stars are tied. To finish above the opponent's current ` +
          `average of <b>${oppAvg.toFixed(2)}%</b>, you need about ` +
          `<b>${perAttack.toFixed(2)}% destruction per remaining attack</b> ` +
          `on average.`;
      }
    } else {
      targetText =
        `Your team already leads ${mine.stars}★ to ${opponentStars}★. ` +
        `Protect the star lead.`;
    }

    if (projectedStars > opponentStars) {
      result = `Projection: <b>YOUR TEAM AHEAD ON STARS</b> ` +
               `(${projectedStars.toFixed(2)}★ vs ${opponentStars}★).`;
    } else if (projectedStars < opponentStars) {
      result = `Projection: <b>BEHIND ON STARS</b> ` +
               `(${projectedStars.toFixed(2)}★ vs ${opponentStars}★).`;
    } else if (projectedDestruction > opponentDestruction) {
      result = `Projection: <b>YOUR TEAM AHEAD ON DESTRUCTION</b> ` +
               `with stars tied.`;
    } else if (projectedDestruction < opponentDestruction) {
      result = `Projection: <b>BEHIND ON DESTRUCTION</b> ` +
               `with stars tied.`;
    } else {
      result = "Projection: <b>TIED</b>.";
    }

    target.innerHTML = `
      <b>Target</b><br>
      ${targetText}<br><br>
      <b>Projection from your remaining attacks</b><br>
      ${projectedStars.toFixed(2)}★,
      ${projectedDestruction.toFixed(2)}% destruction<br><br>
      ${result}
      <br><span class="note">
      The projection holds the opponent at the current entered score.
      Future opponent attacks can change the required target.
      </span>
    `;
  }

  openButton.addEventListener("click", openPrediction);
  run.addEventListener("click", runPrediction);
})();
