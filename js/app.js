// Trilha do Código — Lógica principal
// Persistência via localStorage, sem backend

const STORAGE_KEY = "trilha-rpg-v1";

// Estado: Set de ids marcados
let checked = new Set();
let filter = "all";
let search = "";

// ——— Helpers de nível ———
function getLevel(percent) {
  // retorna o maior nível cujo min <= percent
  let lvl = LEVEL_CONFIG[0];
  for (const l of LEVEL_CONFIG) if (percent >= l.min) lvl = l;
  const idx = LEVEL_CONFIG.indexOf(lvl);
  const next = LEVEL_CONFIG[idx + 1] || null;
  return { level: lvl, idx, next, levelNumber: idx + 1 };
}

function totalStats() {
  let total = 0, done = 0, blocksDone = 0;
  for (const b of TRILHA_DATA) {
    const items = [...b.topics, ...b.criteria];
    total += items.length;
    let d = 0;
    for (const it of items) if (checked.has(it.id)) d++;
    done += d;
    if (d === items.length && items.length > 0) blocksDone++;
  }
  return { total, done, blocksDone, remaining: total - done, percent: total ? Math.round(done / total * 100) : 0 };
}

function blockProgress(block) {
  const items = [...block.topics, ...block.criteria];
  const done = items.filter(i => checked.has(i.id)).length;
  const pct = items.length ? Math.round(done / items.length * 100) : 0;
  const isDone = done === items.length;
  const isStarted = done > 0 && !isDone;
  return { done, total: items.length, pct, isDone, isStarted };
}

// ——— Persistência ———
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      checked = new Set(arr);
    }
    // streak simples: dias de jornada
    let first = localStorage.getItem(STORAGE_KEY + "-first");
    if (!first) localStorage.setItem(STORAGE_KEY + "-first", String(Date.now()));
  } catch {}
}
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...checked]));
}
function daysSinceStart() {
  const first = Number(localStorage.getItem(STORAGE_KEY + "-first") || Date.now());
  const diff = Date.now() - first;
  return Math.max(1, Math.ceil(diff / (1000*60*60*24)));
}

// ——— Render ———
function render() {
  const stats = totalStats();
  const lvlInfo = getLevel(stats.percent);

  // Hero
  document.getElementById("totalPercent").textContent = stats.percent + "%";
  document.getElementById("totalFraction").textContent = `${stats.done} / ${stats.total}`;
  document.getElementById("xpFill").style.width = stats.percent + "%";
  document.getElementById("xpPoints").textContent = stats.done * 10; // 10 XP por tarefa
  document.getElementById("levelNum").textContent = lvlInfo.levelNumber;
  document.getElementById("levelTitle").textContent = lvlInfo.level.title;
  document.getElementById("heroGreeting").textContent = `Bem-vindo, ${lvlInfo.level.title}`;
  document.getElementById("heroQuote").textContent = `“${lvlInfo.level.quote}”`;
  document.getElementById("avatarEl").textContent = lvlInfo.level.icon;
  document.getElementById("nextTitle").textContent = lvlInfo.next ? lvlInfo.next.title : "— Lenda Máxima —";
  document.getElementById("statDone").textContent = stats.done;
  document.getElementById("statBlocks").textContent = `${stats.blocksDone}/${TRILHA_DATA.length}`;
  document.getElementById("statRemaining").textContent = stats.remaining;
  document.getElementById("statStreak").textContent = daysSinceStart();

  // Level track
  const track = document.getElementById("levelTrack");
  track.innerHTML = LEVEL_CONFIG.map((l, i) => {
    const isActive = i === lvlInfo.idx;
    const isDone = stats.percent >= l.min && !isActive;
    return `<div class="level-dot ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}"><span>${l.icon}</span> ${l.title} <span style="opacity:.6">${l.min}%</span></div>`;
  }).join("");

  // Grid filtrada
  const grid = document.getElementById("blocksGrid");
  const q = search.trim().toLowerCase();

  let visible = TRILHA_DATA.filter(b => {
    const p = blockProgress(b);
    if (filter === "done" && !p.isDone) return false;
    if (filter === "todo" && p.done !== 0) return false;
    if (filter === "progress" && (!p.isStarted)) return false;
    if (q) {
      const hay = (b.title + " " + b.desc + " " + b.topics.map(t=>t.label).join(" ") + " " + b.criteria.map(c=>c.label).join(" ")).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  if (visible.length === 0) {
    grid.innerHTML = `<div class="empty"><p style="font-size:28px; margin:0">🔍</p><p>Nenhum bloco encontrado com esse filtro.</p></div>`;
    return;
  }

  grid.innerHTML = visible.map(block => {
    const p = blockProgress(block);
    const collapsed = block._collapsed ? "collapsed" : "";
    const doneClass = p.isDone ? "done" : "";
    const topicsDone = block.topics.filter(t=>checked.has(t.id)).length;
    const critDone = block.criteria.filter(c=>checked.has(c.id)).length;

    return `
    <article class="card ${doneClass} ${collapsed}" data-id="${block.id}">
      <div class="card-header" data-toggle="${block.id}">
        <div class="card-icon">${block.icon}</div>
        <div class="card-titles">
          <h3>${block.title}</h3>
          <p>${block.desc}</p>
        </div>
        <div class="card-meta">
          <span class="badge ${p.isDone ? 'done' : p.isStarted ? 'progress' : ''}">${p.isDone ? '✓ Concluído' : p.isStarted ? 'Em progresso' : 'Pendente'}</span>
          <span class="card-pct">${p.pct}%</span>
        </div>
        <div class="chevron">⌃</div>
      </div>
      <div class="card-progress"><div class="card-progress-fill" style="width:${p.pct}%"></div></div>
      <div class="card-body">
        <div class="group">
          <div class="group-head">
            <span>📖</span><h4>Tópicos</h4>
            <span class="count ${topicsDone===block.topics.length?'done':''}">${topicsDone}/${block.topics.length}</span>
          </div>
          <ul class="checklist">
            ${block.topics.map(t => `
              <li class="check-item ${checked.has(t.id)?'checked':''}" data-check="${t.id}">
                <input type="checkbox" ${checked.has(t.id)?'checked':''} id="chk-${t.id}" data-id="${t.id}">
                <label for="chk-${t.id}">${t.label}</label>
              </li>
            `).join("")}
          </ul>
        </div>

        <div class="group">
          <div class="group-head">
            <span>🏅</span><h4>Critérios de Aprovação</h4>
            <span class="count ${critDone===block.criteria.length?'done':''}">${critDone}/${block.criteria.length}</span>
          </div>
          <ul class="checklist">
            ${block.criteria.map(c => `
              <li class="check-item criteria ${checked.has(c.id)?'checked':''}" data-check="${c.id}">
                <input type="checkbox" ${checked.has(c.id)?'checked':''} id="chk-${c.id}" data-id="${c.id}">
                <label for="chk-${c.id}">${c.label}</label>
              </li>
            `).join("")}
          </ul>
        </div>
      </div>
      <div class="card-footer">
        <span>${p.done}/${p.total} tarefas completas</span>
        <strong>${p.isDone ? 'Missão completa! 🎉' : p.pct + '% concluído'}</strong>
      </div>
    </article>`;
  }).join("");

  // Bind events após render
  bindCardEvents();
}

function bindCardEvents() {
  // toggle colapso
  document.querySelectorAll("[data-toggle]").forEach(el => {
    el.addEventListener("click", (e) => {
      // não colapsar se clicou no checkbox (não acontece aqui, mas previne)
      const id = el.getAttribute("data-toggle");
      const block = TRILHA_DATA.find(b=>b.id===id);
      block._collapsed = !block._collapsed;
      render();
    });
  });
  // checkboxes
  document.querySelectorAll(".check-item input").forEach(inp => {
    inp.addEventListener("change", (e) => {
      e.stopPropagation();
      const id = inp.getAttribute("data-id");
      const wasDoneBlocks = new Set(TRILHA_DATA.filter(b=>blockProgress(b).isDone).map(b=>b.id));

      if (inp.checked) checked.add(id);
      else checked.delete(id);
      save();

      // detectar novo bloco concluído para celebrar
      const nowDoneBlocks = TRILHA_DATA.filter(b=>blockProgress(b).isDone).map(b=>b.id);
      const newlyDone = nowDoneBlocks.filter(id=>!wasDoneBlocks.has(id));
      if (newlyDone.length) {
        const bid = newlyDone[0];
        const block = TRILHA_DATA.find(b=>b.id===bid);
        showModal(block);
      }

      render();
    });
  });
  // clique na linha inteira também marca
  document.querySelectorAll(".check-item").forEach(li => {
    li.addEventListener("click", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "LABEL") return;
      const inp = li.querySelector("input");
      inp.checked = !inp.checked;
      inp.dispatchEvent(new Event("change", {bubbles:true}));
    });
  });
}

function showModal(block) {
  const modal = document.getElementById("modal");
  document.getElementById("modalTitle").textContent = "Missão Cumprida!";
  document.getElementById("modalDesc").textContent = `Você concluiu “${block.title}”`;
  document.getElementById("modalQuote").textContent = `“${BLOCK_QUOTES[block.id] || "Mais um passo rumo à maestria!"}”`;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden","false");
  // confete simples via emoji? apenas vibração visual
  if (navigator.vibrate) navigator.vibrate(120);
}
function hideModal(){
  const modal = document.getElementById("modal");
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden","true");
}

// ——— Init ———
load();
render();

// Filtros
document.querySelectorAll(".chip").forEach(chip=>{
  chip.addEventListener("click", ()=>{
    document.querySelectorAll(".chip").forEach(c=>c.classList.remove("active"));
    chip.classList.add("active");
    filter = chip.dataset.filter;
    render();
  });
});
document.getElementById("searchInput").addEventListener("input", (e)=>{
  search = e.target.value;
  render();
});
document.getElementById("btnExpandAll").addEventListener("click", ()=>{
  TRILHA_DATA.forEach(b=>b._collapsed=false); render();
});
document.getElementById("btnCollapseAll").addEventListener("click", ()=>{
  TRILHA_DATA.forEach(b=>b._collapsed=true); render();
});
document.getElementById("btnReset").addEventListener("click", ()=>{
  if (!confirm("Tem certeza que deseja zerar TODO o progresso? Essa ação não pode ser desfeita.")) return;
  checked.clear();
  save();
  TRILHA_DATA.forEach(b=>b._collapsed=false);
  render();
});
document.getElementById("modalClose").addEventListener("click", hideModal);
document.querySelector(".modal-backdrop").addEventListener("click", hideModal);
document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") hideModal(); });

// Atalho: colapsar todos no mobile inicialmente? deixa expandido por padrão
