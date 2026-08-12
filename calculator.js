const names = Object.keys(DEFENSES);
const defenseList = document.getElementById("defenseList");
const hitMap = document.getElementById("hitMap");
const equipmentUse = document.getElementById("equipmentUse");
const mode = document.getElementById("mode");
const gaLevel = document.getElementById("gaLevel");
const rbLevel = document.getElementById("rbLevel");
const fbLevel = document.getElementById("fbLevel");
const preview = document.getElementById("damagePreview");
const modeNote = document.getElementById("modeNote");

const CRAFTED_DEFENSE_MAX_LEVEL = 15;
const CRAFTED_DEFENSES = {
  "Cake-A-Pult": "Splash / delayed-explosion defense",
  "Hero Hunter": "Hero-focused defense",
  "Hot Candle": "Multi-target flame defense"
};

function fill(select, values) {
  select.innerHTML = "";
  values.forEach(v => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = "Lv." + v;
    select.appendChild(o);
  });
}

fill(gaLevel, Object.keys(GIANT_ARROW).map(Number));
fill(rbLevel, Object.keys(ROCKET_BACKPACK).map(Number));
fill(fbLevel, Object.keys(FIREBALL).map(Number));

/* Crafted Defense */
const craftedDefense = document.getElementById("craftedDefense");
const craftedOptions = document.getElementById("craftedOptions");
const craftedDescription = document.getElementById("craftedDescription");
const craftedModules = craftedOptions
  ? [...craftedOptions.querySelectorAll(".crafted-module")]
  : [];
const craftedHP = document.getElementById("craftedHP");

if (craftedDefense) {
  craftedModules.forEach(select => {
    for (let level = 1; level <= CRAFTED_DEFENSE_MAX_LEVEL; level++) {
      const option = document.createElement("option");
      option.value = level;
      option.textContent = "Lv." + level;
      select.appendChild(option);
    }
  });

  function updateCraftedDefense() {
    const selected = craftedDefense.value;
    const active = selected !== "none";

    if (craftedOptions) craftedOptions.classList.toggle("hidden", !active);

    if (!active) {
      craftedDescription.textContent = "No Crafted Defense selected.";
      return;
    }

    craftedDescription.innerHTML =
      "<b>" + escapeHTML(selected) + "</b><br>" +
      escapeHTML(CRAFTED_DEFENSES[selected]) +
      "<br><span class='note'>TH15 maximum: Lv.15. " +
      "Module levels: " +
      craftedModules.map(x => x.value).join(" / ") +
      ". Enter the actual current HP from the base.</span>";
  }

  craftedDefense.addEventListener("change", updateCraftedDefense);
  craftedModules.forEach(x => x.addEventListener("change", updateCraftedDefense));
  if (craftedHP) craftedHP.addEventListener("input", updateCraftedDefense);
  updateCraftedDefense();
}

/* Equipment master checks */
equipmentUse.innerHTML = `
<div class="equipment-item">
<label><input type="checkbox" id="useEQ" checked> Earthquake</label>
<div class="note">Per-defense EQ count</div>
</div>
<div class="equipment-item">
<label><input type="checkbox" id="useGA" checked> Giant Arrow</label>
<div class="note">Selected equipment level</div>
</div>
<div class="equipment-item">
<label><input type="checkbox" id="useRB" checked> Rocket Backpack</label>
<div class="note">Selected equipment level</div>
</div>
<div class="equipment-item">
<label><input type="checkbox" id="useFB"> Fireball</label>
<div class="note">Selected equipment level</div>
</div>
<div class="equipment-item">
<label><input type="checkbox" id="useLightning" checked> Lightning Lv.${LIGHTNING.level}</label>
<div class="note">${LIGHTNING.damage} damage per spell</div>
</div>`;

function updateMode() {
  if (mode.value === "esports") {
    gaLevel.value = TOURNAMENT.common;
    rbLevel.value = TOURNAMENT.epic;
    fbLevel.value = TOURNAMENT.epic;
    gaLevel.disabled = rbLevel.disabled = fbLevel.disabled = true;
    modeNote.textContent = "Esports/Tournament: Common Lv15, Epic Lv18.";
  } else {
    gaLevel.disabled = rbLevel.disabled = fbLevel.disabled = false;
    modeNote.textContent = "Custom mode: choose equipment levels.";
  }
  updatePreview();
}

function updatePreview() {
  const ga = Number(gaLevel.value);
  const rb = Number(rbLevel.value);
  const fb = Number(fbLevel.value);
  preview.innerHTML =
    `<b>Selected damage</b><br>
    Giant Arrow Lv.${ga}: <b>${GIANT_ARROW[ga]}</b> base /
    <b>${GIANT_ARROW[ga] * 2}</b> vs Air Defense<br>
    Rocket Backpack Lv.${rb}: <b>${ROCKET_BACKPACK[rb]}</b><br>
    Fireball Lv.${fb}: <b>${FIREBALL[fb].damage}</b>, radius ${FIREBALL[fb].radius} tiles<br>
    Lightning Lv.${LIGHTNING.level}: <b>${LIGHTNING.damage}</b>, radius ${LIGHTNING.radius} tiles`;
}

mode.onchange = updateMode;
[gaLevel, rbLevel, fbLevel].forEach(x => x.onchange = updatePreview);

names.forEach((name, i) => {
  const label = document.createElement("label");
  label.className = "defense";
  label.innerHTML =
    `<input type="checkbox" class="defense-select" value="${i}">
     ${i + 1}. ${name} <span class="pill">${DEFENSES[name].hp} HP</span>`;
  defenseList.appendChild(label);
});

document.getElementById("selectAll").onclick = () => {
  document.querySelectorAll(".defense-select").forEach(x => x.checked = true);
  buildHitMap();
};
document.getElementById("clearAll").onclick = () => {
  document.querySelectorAll(".defense-select").forEach(x => x.checked = false);
  buildHitMap();
};
defenseList.addEventListener("change", buildHitMap);
equipmentUse.addEventListener("change", buildHitMap);

function buildHitMap() {
  const selected = [...document.querySelectorAll(".defense-select:checked")]
    .map(x => names[Number(x.value)]);

  if (craftedDefense && craftedDefense.value !== "none" &&
      craftedHP && Number(craftedHP.value) > 0) {
    selected.push(craftedDefense.value);
  }

  if (!selected.length) {
    hitMap.innerHTML = '<p class="note">Select defenses above.</p>';
    return;
  }

  const useEQ = document.getElementById("useEQ").checked;
  const useGA = document.getElementById("useGA").checked;
  const useRB = document.getElementById("useRB").checked;
  const useFB = document.getElementById("useFB").checked;
  const useLightning = document.getElementById("useLightning").checked;

  hitMap.innerHTML = `
  <div class="table-wrap"><table class="hit-table">
  <thead><tr>
  <th>Defense</th>
  ${useEQ ? '<th>EQ Count</th>' : ''}
  ${useGA ? '<th>GA Hit</th>' : ''}
  ${useRB ? '<th>RB Hit</th>' : ''}
  ${useFB ? '<th>Fireball Hit</th>' : ''}
  ${useLightning ? '<th>Lightning Count<br><small>Lv.10</small></th>' : ''}
  </tr></thead>
  <tbody>
  ${selected.map(d => {
    const isCrafted = Object.prototype.hasOwnProperty.call(CRAFTED_DEFENSES, d);
    return `<tr data-defense="${encodeURIComponent(d)}">
      <td>${escapeHTML(d)}<br>
      <span class="pill">HP ${isCrafted ? Number(craftedHP.value) : DEFENSES[d].hp}</span></td>
      ${useEQ ? '<td><input type="number" class="eq-count" min="0" max="8" step="1" value="0"></td>' : ''}
      ${useGA ? '<td><input type="checkbox" class="ga-hit"></td>' : ''}
      ${useRB ? '<td><input type="checkbox" class="rb-hit"></td>' : ''}
      ${useFB ? '<td><input type="checkbox" class="fb-hit"></td>' : ''}
      ${useLightning
        ? `<td><input type="number" class="lightning" min="0" max="11" step="1" value="0"
             ${isCrafted || !DEFENSES[d]?.lightning ? "disabled" : ""}></td>`
        : ''}
    </tr>`;
  }).join("")}
  </tbody></table></div>`;
}

function escapeHTML(v) {
  return String(v).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function eqDamage(maxHP, count) {
  let total = 0;
  for (let n = 1; n <= count; n++)
    total += maxHP * EARTHQUAKE_PERCENT / (2 * n - 1);
  return Math.round(total);
}

function apply(hp, damage, attack, log) {
  const before = hp;
  hp = Math.max(0, hp - damage);
  log.push({attack, before, damage, after: hp});
  return hp;
}

function numberValue(row, selector) {
  const el = row.querySelector(selector);
  return el ? Math.max(0, Number(el.value) || 0) : 0;
}

function checked(row, selector) {
  const el = row.querySelector(selector);
  return !!(el && el.checked);
}

function calcDefense(def, row) {
  const isCrafted = Object.prototype.hasOwnProperty.call(CRAFTED_DEFENSES, def);
  let hp = isCrafted
    ? Math.max(0, Number(craftedHP.value) || 0)
    : DEFENSES[def].hp;

  const initial = hp;
  const log = [];

  const useEQ = document.getElementById("useEQ").checked;
  const useGA = document.getElementById("useGA").checked;
  const useRB = document.getElementById("useRB").checked;
  const useFB = document.getElementById("useFB").checked;
  const useLightning = document.getElementById("useLightning").checked;

  const eqCount = useEQ ? Math.min(8, numberValue(row, ".eq-count")) : 0;

  if (eqCount > 0)
    hp = apply(hp, eqDamage(initial, eqCount), `${eqCount} Earthquake (hit)`, log);

  if (hp > 0 && useGA && checked(row, ".ga-hit")) {
    let damage = GIANT_ARROW[Number(gaLevel.value)];
    if (def === "Air Defense") damage *= 2;
    hp = apply(hp, damage, `Giant Arrow Lv.${gaLevel.value}`, log);
  }

  if (hp > 0 && useRB && checked(row, ".rb-hit"))
    hp = apply(hp, ROCKET_BACKPACK[Number(rbLevel.value)],
      `Rocket Backpack Lv.${rbLevel.value}`, log);

  if (hp > 0 && useFB && checked(row, ".fb-hit"))
    hp = apply(hp, FIREBALL[Number(fbLevel.value)].damage,
      `Fireball Lv.${fbLevel.value}`, log);

  const lightning = useLightning ? numberValue(row, ".lightning") : 0;
  if (hp > 0 && lightning > 0 && !isCrafted && DEFENSES[def].lightning)
    hp = apply(hp, lightning * LIGHTNING.damage,
      `${lightning} Lightning Lv.${LIGHTNING.level}`, log);

  let destroyedBy = "";
  if (hp === 0) {
    for (let i = log.length - 1; i >= 0; i--) {
      if (log[i].after === 0 && log[i].damage > 0) {
        destroyedBy = log[i].attack;
        break;
      }
    }
  }

  return {
    def, initial, remaining: hp, destroyed: hp === 0, destroyedBy,
    lightningUsed: lightning,
    lightningNeeded: (!isCrafted && hp > 0 && DEFENSES[def].lightning)
      ? Math.ceil(hp / LIGHTNING.damage) : 0,
    log
  };
}

document.getElementById("calculate").onclick = () => {
  const rows = [...document.querySelectorAll("#hitMap tbody tr")];
  if (!rows.length) {
    alert("Select at least one defense.");
    return;
  }

  const results = rows.map(r =>
    calcDefense(decodeURIComponent(r.dataset.defense), r)
  );

  const destroyed = results.filter(r => r.destroyed).length;
  const extra = results.reduce((s, r) => s + r.lightningNeeded, 0);
  const used = results.reduce((s, r) => s + r.lightningUsed, 0);

  document.getElementById("summary").innerHTML = `
  <div class="summary">
    <b>Destroyed:</b> ${destroyed}/${results.length}<br>
    <b>Success rate:</b> ${Math.round(destroyed / results.length * 100)}%<br>
    <b>Lightning Lv.${LIGHTNING.level} allocated:</b> ${used}<br>
    <b>Additional Lightning Lv.${LIGHTNING.level} needed:</b> ${extra}
  </div>`;

  document.getElementById("details").innerHTML = results.map(r => `
  <div class="result">
    <h3>${escapeHTML(r.def)}</h3>
    Initial HP: <b>${r.initial}</b><br>
    Remaining HP: <b>${r.remaining}</b><br>
    <div class="${r.destroyed ? "good" : "bad"}">
      ${r.destroyed ? "✅ DESTROYED by " + escapeHTML(r.destroyedBy) : "❌ SURVIVED"}
    </div>
    ${r.destroyed
      ? `<div>Lightning allocated: <b>${r.lightningUsed}</b></div>`
      : `<div>Minimum additional Lightning Lv.${LIGHTNING.level}: <b>${r.lightningNeeded}</b></div>`}
    <div class="table-wrap"><table class="log">
    <thead><tr><th>Attack</th><th>Before</th><th>Damage</th><th>After</th></tr></thead>
    <tbody>${r.log.map(x =>
      `<tr><td>${escapeHTML(x.attack)}</td><td>${x.before}</td><td>${x.damage}</td><td>${x.after}</td></tr>`
    ).join("")}</tbody></table></div>
  </div>`).join("");

  document.getElementById("results").classList.remove("hidden");
};

updateMode();
buildHitMap();


/* Tournament decision menu */
const decisionMode = document.getElementById("decisionMode");
const tournamentInputs = document.getElementById("tournamentInputs");
const decisionOutput = document.getElementById("decisionOutput");

function updateDecisionMode() {
  if (!decisionMode) return;
  const tournament = decisionMode.value === "tournament";
  tournamentInputs.classList.toggle("hidden", !tournament);
  updateTournamentResult();
}

function updateTournamentResult() {
  if (!decisionMode || decisionMode.value !== "tournament") {
    if (decisionOutput) {
      decisionOutput.innerHTML =
        "Destruction mode: use the calculator above to determine whether the selected defenses can be destroyed.";
    }
    return;
  }

  const ys = Math.max(0, Number(document.getElementById("yourStars").value) || 0);
  const yd = Math.max(0, Math.min(100, Number(document.getElementById("yourDestruction").value) || 0));
  const os = Math.max(0, Number(document.getElementById("oppStars").value) || 0);
  const od = Math.max(0, Math.min(100, Number(document.getElementById("oppDestruction").value) || 0));

  let result = "TIE";
  if (ys > os || (ys === os && yd > od)) result = "YOU WIN";
  if (ys < os || (ys === os && yd < od)) result = "OPPONENT WINS";

  decisionOutput.innerHTML = `
    <b>${result}</b><br>
    Your result: ${ys}★, ${yd.toFixed(2)}% destruction<br>
    Opponent: ${os}★, ${od.toFixed(2)}% destruction<br>
    <span class="note">
    This uses Stars first and Destruction % as the tie-break. Confirm the
    specific tournament rules before using it for an official result.
    </span>`;
}

if (decisionMode) {
  decisionMode.addEventListener("change", updateDecisionMode);
  ["yourStars","yourDestruction","oppStars","oppDestruction"].forEach(id => {
    document.getElementById(id).addEventListener("input", updateTournamentResult);
  });
  updateDecisionMode();
}


/* Tournament Attack Tracker */
const attackTrackerKey = "th15_attack_tracker_v1";
let attackTracker = JSON.parse(localStorage.getItem(attackTrackerKey) || "null") || {
  total: 0,
  happened: 0,
  won: 0,
  lost: 0,
  drawn: 0,
  history: []
};

const totalAttacksEl = document.getElementById("totalAttacks");
const attacksHappenedEl = document.getElementById("attacksHappened");
const attacksWonEl = document.getElementById("attacksWon");
const attacksLostEl = document.getElementById("attacksLost");
const attacksDrawnEl = document.getElementById("attacksDrawn");
const trackerSummary = document.getElementById("attackTrackerSummary");
const attackHistory = document.getElementById("attackHistory");

function saveAttackTracker() {
  localStorage.setItem(attackTrackerKey, JSON.stringify(attackTracker));
}

function syncTrackerInputs() {
  totalAttacksEl.value = attackTracker.total;
  attacksHappenedEl.value = attackTracker.happened;
  attacksWonEl.value = attackTracker.won;
  attacksLostEl.value = attackTracker.lost;
  attacksDrawnEl.value = attackTracker.drawn;
}

function updateAttackTracker() {
  attackTracker.total = Math.max(0, Number(totalAttacksEl.value) || 0);
  attackTracker.happened = Math.max(0, Number(attacksHappenedEl.value) || 0);
  attackTracker.won = Math.max(0, Number(attacksWonEl.value) || 0);
  attackTracker.lost = Math.max(0, Number(attacksLostEl.value) || 0);
  attackTracker.drawn = Math.max(0, Number(attacksDrawnEl.value) || 0);

  if (attackTracker.happened > attackTracker.total && attackTracker.total > 0) {
    attackTracker.happened = attackTracker.total;
    attacksHappenedEl.value = attackTracker.total;
  }

  const remaining = Math.max(0, attackTracker.total - attackTracker.happened);
  const unresolved = Math.max(
    0,
    attackTracker.happened -
    attackTracker.won -
    attackTracker.lost -
    attackTracker.drawn
  );

  trackerSummary.innerHTML = `
    <b>Attacks planned:</b> ${attackTracker.total}<br>
    <b>Attacks happened:</b> ${attackTracker.happened}<br>
    <b>Attacks remaining:</b> ${remaining}<br>
    <b>Won:</b> ${attackTracker.won}
    &nbsp; <b>Lost:</b> ${attackTracker.lost}
    &nbsp; <b>Drawn:</b> ${attackTracker.drawn}<br>
    <b>Unrecorded results:</b> ${unresolved}
  `;

  saveAttackTracker();
}

function renderAttackHistory() {
  if (!attackTracker.history.length) {
    attackHistory.innerHTML = '<p class="note">No completed attacks recorded.</p>';
    return;
  }

  attackHistory.innerHTML = `
  <div class="table-wrap">
  <table class="log">
    <thead>
      <tr>
        <th>Attack #</th>
        <th>Result</th>
        <th>Stars</th>
        <th>Destruction %</th>
        <th>Note</th>
      </tr>
    </thead>
    <tbody>
      ${attackTracker.history.map((a, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${escapeHTML(a.result)}</td>
          <td>${a.stars}</td>
          <td>${Number(a.destruction).toFixed(2)}%</td>
          <td>${escapeHTML(a.note || "")}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>
  </div>`;
}

document.getElementById("recordAttack").addEventListener("click", () => {
  const result = prompt("Attack result: Win, Loss, or Draw", "Win");
  if (result === null) return;

  const normalized = result.trim().toLowerCase();
  let finalResult;
  if (normalized === "win" || normalized === "won") finalResult = "Win";
  else if (normalized === "loss" || normalized === "lost") finalResult = "Loss";
  else if (normalized === "draw" || normalized === "tie") finalResult = "Draw";
  else {
    alert("Enter Win, Loss, or Draw.");
    return;
  }

  const stars = Math.max(0, Number(prompt("Stars earned in this attack", "0")) || 0);
  const destruction = Math.max(
    0,
    Math.min(100, Number(prompt("Destruction percentage", "0")) || 0)
  );
  const note = prompt("Optional note", "") || "";

  attackTracker.happened += 1;
  if (finalResult === "Win") attackTracker.won += 1;
  if (finalResult === "Loss") attackTracker.lost += 1;
  if (finalResult === "Draw") attackTracker.drawn += 1;

  attackTracker.history.push({
    result: finalResult,
    stars,
    destruction,
    note,
    time: new Date().toISOString()
  });

  if (attackTracker.total > 0 &&
      attackTracker.happened > attackTracker.total) {
    attackTracker.total = attackTracker.happened;
  }

  syncTrackerInputs();
  updateAttackTracker();
  renderAttackHistory();
});

document.getElementById("resetAttackTracker").addEventListener("click", () => {
  if (!confirm("Reset all attack tracking data?")) return;
  attackTracker = {
    total: 0,
    happened: 0,
    won: 0,
    lost: 0,
    drawn: 0,
    history: []
  };
  syncTrackerInputs();
  updateAttackTracker();
  renderAttackHistory();
});

[
  totalAttacksEl,
  attacksHappenedEl,
  attacksWonEl,
  attacksLostEl,
  attacksDrawnEl
].forEach(el => el.addEventListener("input", updateAttackTracker));

syncTrackerInputs();
updateAttackTracker();
renderAttackHistory();
