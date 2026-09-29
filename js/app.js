// Trilha do Código — Lógica principal (3 níveis + Projetos de Consolidação)
// Persistência via localStorage, sem backend

const STORAGE_KEY = "trilha-rpg-v1";
const STORAGE_KEY_V2 = "trilha-rpg-v2";
const STORAGE_KEY_V3 = "trilha-rpg-v3";
const ACTIVE_LEVEL_KEY = "trilha-rpg-active-level";

// Estado — conteúdo
let checkedByLevel = {
  iniciante: new Set(),
  intermediario: new Set(),
  avancado: new Set(),
};
// Projetos: status + critérios separados (não poluem conteúdo, mas obrigatório conta para %)
const PROJECT_STATUS = { NOT_STARTED: "not_started", IN_PROGRESS: "in_progress", DONE: "done" };
function defaultProjectState() {
  return {
    mandatoryStatus: PROJECT_STATUS.NOT_STARTED,
    challengeStatus: PROJECT_STATUS.NOT_STARTED,
    mandatoryChecks: new Set(),
    challengeChecks: new Set(),
  };
}
let projectState = {
  iniciante: defaultProjectState(),
  intermediario: defaultProjectState(),
  avancado: defaultProjectState(),
};
let activeLevel = "iniciante";
let filter = "all";
let search = "";
// recolhidos por padrão — cirúrgico, sem alterar lógica
let projectCollapsed = {
  iniciante: { mandatory: true, challenge: true },
  intermediario: { mandatory: true, challenge: true },
  avancado: { mandatory: true, challenge: true },
};

// ——— Helpers de nível ———
function getLevel(percent) {
  let lvl = LEVEL_CONFIG[0];
  for (const l of LEVEL_CONFIG) if (percent >= l.min) lvl = l;
  const idx = LEVEL_CONFIG.indexOf(lvl);
  const next = LEVEL_CONFIG[idx + 1] || null;
  return { level: lvl, idx, next, levelNumber: idx + 1 };
}
function getActiveData() { return JOURNEY_DATA[activeLevel] || NIVEL_1_DATA; }
function getJourneyLevelMeta(key) { return JOURNEY_LEVELS.find(j => j.key === key); }
function getActiveMeta() { return getJourneyLevelMeta(activeLevel); }

// Conteúdo puro (sem projetos)
function contentStatsForLevel(levelKey) {
  const data = JOURNEY_DATA[levelKey];
  let total = 0, done = 0, blocksDone = 0;
  const checked = checkedByLevel[levelKey];
  for (const b of data) {
    const items = [...b.topics, ...b.criteria];
    total += items.length;
    let d = 0;
    for (const it of items) if (checked.has(it.id)) d++;
    done += d;
    if (d === items.length && items.length > 0) blocksDone++;
  }
  return { total, done, blocksDone, remaining: total - done, percent: total ? Math.round(done / total * 100) : 0, blocksTotal: data.length };
}
function mandatoryProjectMeta(levelKey) { return CONSOLIDATION_PROJECTS[levelKey]?.mandatory || null; }
function challengeProjectMeta(levelKey) { return CONSOLIDATION_PROJECTS[levelKey]?.challenge || null; }
function projectStats(levelKey, kind) {
  const meta = kind === "mandatory" ? mandatoryProjectMeta(levelKey) : challengeProjectMeta(levelKey);
  if (!meta) return { total: 0, done: 0, percent: 0, isDone: false };
  const state = projectState[levelKey];
  const checks = kind === "mandatory" ? state.mandatoryChecks : state.challengeChecks;
  const total = meta.criteria.length;
  let done = 0;
  for (const c of meta.criteria) if (checks.has(c.id)) done++;
  const pct = total ? Math.round(done / total * 100) : 0;
  return { total, done, percent: pct, isDone: done === total && total > 0 };
}
function levelStatus(levelKey) {
  const content = contentStatsForLevel(levelKey);
  const mProj = mandatoryProjectMeta(levelKey);
  const mState = projectState[levelKey];
  const mStats = projectStats(levelKey, "mandatory");
  const cStats = projectStats(levelKey, "challenge");
  const contentDone = content.percent === 100;
  const mandatoryDone = mState.mandatoryStatus === PROJECT_STATUS.DONE;
  const mandatoryCriteriaDone = mStats.isDone;
  // Nível concluído requer conteúdo 100% + projeto obrigatório com status DONE (critérios são progress, mas não bloqueantes além do status)
  // Para ser mais rigoroso, também exige critérios do obrigatório 100% — descomente se quiser:
  // const isFullyCompleted = contentDone && mandatoryDone && mandatoryCriteriaDone;
  const isFullyCompleted = contentDone && mandatoryDone;
  let label = "Em andamento";
  if (isFullyCompleted) label = "Nível Concluído";
  else if (contentDone && !mandatoryDone) label = "Projeto obrigatório pendente";
  else if (contentDone) label = "Conteúdo concluído";
  // Para retrocompat: se não houver projeto, usa contentDone puro
  return { content, mStats, cStats, contentDone, mandatoryDone, mandatoryCriteriaDone, isFullyCompleted, label, mandatoryStatus: mState.mandatoryStatus, challengeStatus: mState.challengeStatus };
}

// Mantido para compat (agora inclui obrigatório no total)
function totalStatsForLevel(levelKey) {
  const c = contentStatsForLevel(levelKey);
  const m = projectStats(levelKey, "mandatory");
  const total = c.total + m.total;
  const done = c.done + m.done;
  const blocksDone = c.blocksDone + (m.isDone ? 1 : 0);
  const blocksTotal = c.blocksTotal + 1;
  const percent = total ? Math.round(done / total * 100) : 0;
  return { total, done, blocksDone, blocksTotal, remaining: total - done, percent, blocksTotalRaw: c.blocksTotal, content: c, mandatory: m };
}
function journeyStats() {
  let total = 0, done = 0, blocksDone = 0, blocksTotal = 0;
  for (const key of ["iniciante","intermediario","avancado"]) {
    const s = totalStatsForLevel(key);
    total += s.total; done += s.done; blocksDone += s.blocksDone; blocksTotal += s.blocksTotal;
  }
  // desafio não conta
  return { total, done, blocksDone, blocksTotal, remaining: total - done, percent: total ? Math.round(done / total * 100) : 0 };
}
function blockProgress(block) {
  const checked = checkedByLevel[activeLevel];
  const items = [...block.topics, ...block.criteria];
  const done = items.filter(i => checked.has(i.id)).length;
  const pct = items.length ? Math.round(done / items.length * 100) : 0;
  return { done, total: items.length, pct, isDone: done === items.length, isStarted: done > 0 && done !== items.length };
}
function projectStatusLabel(status) {
  if (status === PROJECT_STATUS.DONE) return "Concluído";
  if (status === PROJECT_STATUS.IN_PROGRESS) return "Em andamento";
  return "Não iniciado";
}
function projectStatusClass(status) {
  if (status === PROJECT_STATUS.DONE) return "done";
  if (status === PROJECT_STATUS.IN_PROGRESS) return "progress";
  return "";
}

// ——— Persistência ———
function load() {
  try {
    // Tenta v3
    const rawV3 = localStorage.getItem(STORAGE_KEY_V3);
    if (rawV3) {
      const obj = JSON.parse(rawV3);
      if (obj.checks) {
        for (const k of ["iniciante","intermediario","avancado"]) {
          if (Array.isArray(obj.checks[k])) checkedByLevel[k] = new Set(obj.checks[k]);
        }
      }
      if (obj.projects) {
        for (const k of ["iniciante","intermediario","avancado"]) {
          const p = obj.projects[k];
          if (!p) continue;
          if (["not_started","in_progress","done"].includes(p.mandatoryStatus)) projectState[k].mandatoryStatus = p.mandatoryStatus;
          if (["not_started","in_progress","done"].includes(p.challengeStatus)) projectState[k].challengeStatus = p.challengeStatus;
          if (Array.isArray(p.mandatoryChecks)) projectState[k].mandatoryChecks = new Set(p.mandatoryChecks);
          if (Array.isArray(p.challengeChecks)) projectState[k].challengeChecks = new Set(p.challengeChecks);
        }
      }
      // fallback: se v3 tem checks vazios mas v2 existia (migração parcial), não sobrescreve vazio
    } else {
      // Migração v2 -> v3
      const rawV2 = localStorage.getItem(STORAGE_KEY_V2);
      if (rawV2) {
        const obj = JSON.parse(rawV2);
        for (const k of ["iniciante","intermediario","avancado"]) {
          if (Array.isArray(obj[k])) checkedByLevel[k] = new Set(obj[k]);
        }
        saveV3();
      } else {
        const rawV1 = localStorage.getItem(STORAGE_KEY);
        if (rawV1) {
          const arr = JSON.parse(rawV1);
          if (Array.isArray(arr)) checkedByLevel.iniciante = new Set(arr);
          saveV3();
        }
      }
    }
    const savedActive = localStorage.getItem(ACTIVE_LEVEL_KEY);
    if (savedActive && JOURNEY_DATA[savedActive]) activeLevel = savedActive;
    let first = localStorage.getItem(STORAGE_KEY + "-first");
    if (!first) localStorage.setItem(STORAGE_KEY + "-first", String(Date.now()));
    // missões recolhidas por padrão — preserva escolha do usuário se já definida
    for (const k of ["iniciante","intermediario","avancado"]) {
      for (const b of (JOURNEY_DATA[k]||[])) {
        if (b._collapsed === undefined) b._collapsed = true;
      }
    }
  } catch {}
}
function saveV3() {
  const obj = {
    checks: {
      iniciante: [...checkedByLevel.iniciante],
      intermediario: [...checkedByLevel.intermediario],
      avancado: [...checkedByLevel.avancado],
    },
    projects: {
      iniciante: {
        mandatoryStatus: projectState.iniciante.mandatoryStatus,
        challengeStatus: projectState.iniciante.challengeStatus,
        mandatoryChecks: [...projectState.iniciante.mandatoryChecks],
        challengeChecks: [...projectState.iniciante.challengeChecks],
      },
      intermediario: {
        mandatoryStatus: projectState.intermediario.mandatoryStatus,
        challengeStatus: projectState.intermediario.challengeStatus,
        mandatoryChecks: [...projectState.intermediario.mandatoryChecks],
        challengeChecks: [...projectState.intermediario.challengeChecks],
      },
      avancado: {
        mandatoryStatus: projectState.avancado.mandatoryStatus,
        challengeStatus: projectState.avancado.challengeStatus,
        mandatoryChecks: [...projectState.avancado.mandatoryChecks],
        challengeChecks: [...projectState.avancado.challengeChecks],
      },
    }
  };
  localStorage.setItem(STORAGE_KEY_V3, JSON.stringify(obj));
  // compat: mantém v2 e v1
  localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(obj.checks));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj.checks.iniciante));
}
function saveV2Fallback() {
  localStorage.setItem(STORAGE_KEY_V2, JSON.stringify({
    iniciante: [...checkedByLevel.iniciante],
    intermediario: [...checkedByLevel.intermediario],
    avancado: [...checkedByLevel.avancado],
  }));
}
function save() { saveV3(); }

function daysSinceStart() {
  const first = Number(localStorage.getItem(STORAGE_KEY + "-first") || Date.now());
  return Math.max(1, Math.ceil((Date.now() - first) / (1000*60*60*24)));
}

// ——— Render ———
function levelIconHTML(j) {
  const asset = j.iconAsset;
  if (asset) {
    return `<span class="journey-tab-icon"><img src="${asset}" alt="" width="28" height="28" loading="lazy" decoding="async" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid'"><span class="icon-fallback" style="display:none">${j.icon}</span></span>`;
  }
  return `<span class="journey-tab-icon">${j.icon}</span>`;
}
function renderLevelSelector() {
  const container = document.getElementById("journeySelector");
  if (!container) return;
  container.innerHTML = JOURNEY_LEVELS.map(j => {
    const s = levelStatus(j.key);
    const total = totalStatsForLevel(j.key);
    const isActive = j.key === activeLevel;
    const fallbackGradient = j.key === 'iniciante' ? 'level-fallback-village' : j.key === 'intermediario' ? 'level-fallback-city' : 'level-fallback-kingdom';
    return `<button class="journey-tab ${isActive ? 'active' : ''} ${s.isFullyCompleted ? 'completed' : ''}" data-level="${j.key}" aria-pressed="${isActive}">
      <div class="journey-tab-media ${fallbackGradient}">
        <img src="${j.image}" alt="${j.imageAlt}" width="640" height="400" loading="lazy" decoding="async" onerror="this.style.display='none'" />
      </div>
      ${levelIconHTML(j)}
      <span class="journey-tab-label">${j.shortLabel}<small>${j.subtitle}</small></span>
      <span class="journey-tab-pct">${total.percent}%</span>
      ${s.isFullyCompleted ? '<span class="journey-tab-check">✓</span>' : ''}
    </button>`;
  }).join("");
  container.querySelectorAll(".journey-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      activeLevel = btn.getAttribute("data-level");
      localStorage.setItem(ACTIVE_LEVEL_KEY, activeLevel);
      render();
    });
  });
}
function renderProgression() {
  const el = document.getElementById("journeyProgression");
  if (!el) return;
  el.innerHTML = JOURNEY_LEVELS.map((j, idx) => {
    const s = levelStatus(j.key);
    const total = totalStatsForLevel(j.key);
    const isActive = j.key === activeLevel;
    const arrow = idx < JOURNEY_LEVELS.length - 1 ? `<div class="prog-arrow" aria-hidden="true">↓</div>` : "";
    return `<div class="prog-step ${isActive ? 'active' : ''} ${s.isFullyCompleted ? 'done' : ''}" data-level="${j.key}">
      <div class="prog-icon">${j.icon}</div>
      <div class="prog-info">
        <span class="prog-label">${j.label}</span>
        <span class="prog-sub">${j.subtitle}</span>
        <span class="prog-motto">"${j.motto}"</span>
        <span class="prog-pct">${total.percent}% • ${s.content.done}/${s.content.total} conteúdo • ${s.mStats.done}/${s.mStats.total} missão</span>
        <span class="prog-status ${s.isFullyCompleted ? 'done' : ''}">${s.isFullyCompleted ? '✓ Nível Concluído' : s.label}</span>
      </div>
    </div>${arrow}`;
  }).join("");
  el.querySelectorAll(".prog-step").forEach(step => {
    step.addEventListener("click", () => {
      activeLevel = step.getAttribute("data-level");
      localStorage.setItem(ACTIVE_LEVEL_KEY, activeLevel);
      render();
    });
  });
}
function renderLevelHeader() {
  const meta = getActiveMeta();
  const st = levelStatus(activeLevel);
  const journey = journeyStats();
  const titleEl = document.getElementById("currentLevelTitle");
  const subEl = document.getElementById("currentLevelSubtitle");
  const descEl = document.getElementById("currentLevelDesc");
  const pctEl = document.getElementById("currentLevelPct");
  const fracEl = document.getElementById("currentLevelFrac");
  const blocksEl = document.getElementById("currentLevelBlocks");
  const jPctEl = document.getElementById("journeyPct");
  const fillEl = document.getElementById("currentLevelFill");
  const msgEl = document.getElementById("currentLevelMsg");
  // novos campos
  const contentPctEl = document.getElementById("summaryContentPct");
  const mandatoryStatusEl = document.getElementById("summaryMandatoryStatus");
  const challengeStatusEl = document.getElementById("summaryChallengeStatus");
  const levelStatusEl = document.getElementById("summaryLevelStatus");
  const mandatoryProgressEl = document.getElementById("summaryMandatoryProgress");
  const challengeProgressEl = document.getElementById("summaryChallengeProgress");

  // kicker NÍVEL I/II/III
  const kickerEl = document.getElementById("currentLevelKicker");
  if (kickerEl) {
    const roman = meta.order === 1 ? "NÍVEL I" : meta.order === 2 ? "NÍVEL II" : "NÍVEL III";
    kickerEl.textContent = roman;
  }
  // aplica tema por nível no card (para cor da barra)
  const heroCard = document.querySelector(".level-hero-card");
  if (heroCard) heroCard.setAttribute("data-level", activeLevel);
  if (titleEl) titleEl.textContent = meta.label;
  if (subEl) subEl.textContent = meta.subtitle;
  if (descEl) descEl.textContent = meta.desc;
  const total = totalStatsForLevel(activeLevel);
  if (pctEl) pctEl.textContent = total.percent + "%";
  if (fracEl) fracEl.textContent = `${total.done}/${total.total} tarefas (conteúdo + missão)`;
  if (blocksEl) blocksEl.textContent = `${st.content.blocksDone}/${st.content.blocksTotal} blocos`;
  if (jPctEl) jPctEl.textContent = journey.percent + "%";
  if (fillEl) fillEl.style.width = total.percent + "%";

  if (contentPctEl) contentPctEl.textContent = st.content.percent + "%";
  if (mandatoryStatusEl) {
    mandatoryStatusEl.textContent = projectStatusLabel(st.mandatoryStatus);
    mandatoryStatusEl.className = "badge " + projectStatusClass(st.mandatoryStatus);
  }
  if (challengeStatusEl) {
    const isOpt = true;
    challengeStatusEl.textContent = projectStatusLabel(st.challengeStatus) + " • opcional";
    challengeStatusEl.className = "badge " + projectStatusClass(st.challengeStatus);
  }
  if (mandatoryProgressEl) mandatoryProgressEl.textContent = st.mStats.percent + "% (" + st.mStats.done + "/" + st.mStats.total + ")";
  if (challengeProgressEl) challengeProgressEl.textContent = st.cStats.percent + "% (" + st.cStats.done + "/" + st.cStats.total + ")";
  if (levelStatusEl) {
    levelStatusEl.textContent = st.label;
    levelStatusEl.className = "level-status-badge " + (st.isFullyCompleted ? "done" : st.mandatoryStatus === PROJECT_STATUS.IN_PROGRESS ? "progress" : "");
  }

  if (msgEl) {
    if (st.isFullyCompleted) {
      msgEl.textContent = "✓ " + meta.completeMsg + " — Nível concluído (conteúdo + missão principal).";
      msgEl.classList.add("visible");
    } else if (st.contentDone && st.mandatoryStatus !== PROJECT_STATUS.DONE) {
      msgEl.textContent = "Conteúdo concluído — finalize a Missão Principal para consolidar o nível.";
      msgEl.classList.add("visible");
    } else if (st.content.percent >= 75) {
      msgEl.textContent = "Reta final — o topo está próximo!";
      msgEl.classList.add("visible");
    } else {
      msgEl.textContent = "";
      msgEl.classList.remove("visible");
    }
  }
  // Encerramento do nível
  const closureTitle = document.getElementById("closureTitle");
  const closureStatus = document.getElementById("closureStatus");
  const closureDesc = document.getElementById("closureDesc");
  if (closureTitle) closureTitle.textContent = meta.label.toUpperCase();
  if (closureStatus) {
    closureStatus.textContent = st.isFullyCompleted ? "NÍVEL CONCLUÍDO — " + total.percent + "%" : "EM ANDAMENTO — " + total.percent + "%";
    closureStatus.style.color = st.isFullyCompleted ? "var(--color-emerald)" : "var(--color-ink-muted)";
  }
  if (closureDesc) closureDesc.textContent = st.isFullyCompleted ? `Título conquistado: ${meta.subtitle} — ${meta.completeMsg}` : "Complete todas as missões e a Missão Principal para conquistar o próximo título.";
}

function projectIconHTML(meta, isMandatory) {
  const fallback = meta.icon || (isMandatory ? "🛡️" : "⚔️");
  if (meta.iconAsset) {
    return `<span class="project-icon"><img src="${meta.iconAsset}" alt="" width="26" height="26" loading="lazy" decoding="async" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid'"><span class="icon-fallback" style="display:none">${fallback}</span></span>`;
  }
  return `<span class="project-icon">${fallback}</span>`;
}
function projectCardHTML(levelKey, kind) {
  const meta = kind === "mandatory" ? mandatoryProjectMeta(levelKey) : challengeProjectMeta(levelKey);
  if (!meta) return "";
  const state = projectState[levelKey];
  const checks = kind === "mandatory" ? state.mandatoryChecks : state.challengeChecks;
  const status = kind === "mandatory" ? state.mandatoryStatus : state.challengeStatus;
  const stats = projectStats(levelKey, kind);
  const isMandatory = kind === "mandatory";
  const isCollapsed = projectCollapsed[levelKey][kind];
  const cardClass = (isMandatory ? "project-card mandatory" + (status === PROJECT_STATUS.DONE ? " done" : "") : "project-card challenge" + (status === PROJECT_STATUS.DONE ? " done" : "")) + (isCollapsed ? " collapsed" : "");
  const headingIcon = meta.icon || (isMandatory ? "🛡️" : "⚔️");
  const iconHTML = meta.iconAsset ? `<span class="project-icon"><img src="${meta.iconAsset}" alt="" width="26" height="26" loading="lazy" decoding="async" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid'"><span class='icon-fallback' style='display:none'>${headingIcon}</span></span>` : `<span class="project-icon">${headingIcon}</span>`;
  const ribbon = isMandatory ? "Missão Principal" : "Missão Desafio";
  const optionalBadge = !isMandatory ? `<span class="project-optional-badge">${meta.badge || "Projeto opcional para reforço de domínio"}</span>` : "";
  const problemsHTML = meta.problems ? `<div class="project-problems"><strong>Problemas a resolver:</strong><ul>${meta.problems.map(p=>`<li>${p}</li>`).join("")}</ul></div>` : "";
  const bannerHTML = meta.image ? `<div class="project-banner level-banner-${levelKey}"><img src="${meta.image}" alt="${meta.imageAlt || meta.title}" width="800" height="300" loading="lazy" decoding="async" onerror="this.style.display='none'" /><div class="project-banner-fallback" aria-hidden="true"></div><div class="project-banner-overlay" aria-hidden="true"></div></div>` : "";

  return `
  <article class="${cardClass}" data-project="${meta.id}">
    ${bannerHTML}
    <div class="project-card-header">
      ${iconHTML}
      <div class="project-titles">
        <span class="project-ribbon">${ribbon}</span>
        <h3>${meta.title}</h3>
        <p class="project-objective">${meta.objective}</p>
      </div>
      <div class="project-status-wrap">
        <span class="project-pct">${stats.percent}%</span>
        <span class="badge ${projectStatusClass(status)}">${projectStatusLabel(status)}</span>
      </div>
    </div>
    <div class="project-progress"><div class="project-progress-fill" style="width:${stats.percent}%"></div></div>
    <div class="project-card-body">
      ${optionalBadge}
      ${meta.stack ? `<div class="project-meta-row"><strong>Stack sugerida:</strong> ${meta.stack.join(" • ")}</div>` : ""}
      <div class="project-meta-row"><strong>Funcionalidades:</strong> ${meta.features.join(" • ")}</div>
      ${problemsHTML}
      <div class="project-actions">
        <label class="project-status-label">Status:</label>
        <div class="project-status-segmented" data-kind="${kind}" data-level="${levelKey}">
          <button class="seg-btn ${status===PROJECT_STATUS.NOT_STARTED?'active':''}" data-status="not_started">Não iniciado</button>
          <button class="seg-btn ${status===PROJECT_STATUS.IN_PROGRESS?'active':''}" data-status="in_progress">Em andamento</button>
          <button class="seg-btn ${status===PROJECT_STATUS.DONE?'active':''}" data-status="done">Concluído</button>
        </div>
        <span class="count ${stats.isDone?'done':''}">${stats.done}/${stats.total}</span>
      </div>
      <div class="expand-row">
        <button class="btn btn-ghost btn-expand" data-expand="${kind}" data-level="${levelKey}">${isCollapsed ? (isMandatory ? 'Ver missão completa →' : 'Ver desafio →') : 'Recolher ↑'}</button>
        <span class="expand-hint">${stats.done}/${stats.total} critérios • ${stats.percent}%</span>
      </div>
      <div class="group collapsible-group ${isCollapsed ? 'hidden' : ''}">
        <div class="group-head"><span>🏅</span><h4>Critérios de Aprovação ${!isMandatory ? '(opcional)' : ''}</h4><span class="count ${stats.isDone?'done':''}">${stats.done}/${stats.total}</span></div>
        <ul class="checklist">
          ${meta.criteria.map(c=>`
            <li class="check-item criteria ${checks.has(c.id)?'checked':''}" data-check="${c.id}" data-kind="${kind}">
              <input type="checkbox" ${checks.has(c.id)?'checked':''} id="chk-${c.id}" data-id="${c.id}" data-kind="${kind}">
              <label for="chk-${c.id}">${c.label}</label>
            </li>`).join("")}
        </ul>
      </div>
    </div>
    <div class="card-footer">
      <span>${stats.done}/${stats.total} critérios</span>
      <strong>${status===PROJECT_STATUS.DONE ? 'Missão concluída! 🎉' : stats.percent + '% concluído'}</strong>
    </div>
  </article>`;
}

function renderProjects() {
  const container = document.getElementById("projectsSection");
  if (!container) return;
  const m = mandatoryProjectMeta(activeLevel);
  const c = challengeProjectMeta(activeLevel);
  if (!m && !c) { container.innerHTML = ""; return; }
  container.innerHTML = `
    <div class="projects-header">
      <h2 class="projects-title">Projetos de Consolidação</h2>
      <p class="projects-subtitle">Missão Principal consolida o nível. Missão Desafio é opcional — para provar autonomia em outro contexto.</p>
    </div>
    <div class="projects-grid">
      ${m ? projectCardHTML(activeLevel, "mandatory") : ""}
      ${c ? projectCardHTML(activeLevel, "challenge") : ""}
    </div>
  `;
  // bind expand
  container.querySelectorAll(".btn-expand").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const kind = btn.getAttribute("data-expand");
      const lvl = btn.getAttribute("data-level");
      projectCollapsed[lvl][kind] = !projectCollapsed[lvl][kind];
      render();
    });
  });
  container.querySelectorAll(".project-card-header").forEach(h => {
    h.style.cursor = "pointer";
    h.addEventListener("click", () => {
      const card = h.closest(".project-card");
      const kind = card.querySelector(".btn-expand")?.getAttribute("data-expand");
      const lvl = card.querySelector(".btn-expand")?.getAttribute("data-level");
      if (kind && lvl) { projectCollapsed[lvl][kind] = !projectCollapsed[lvl][kind]; render(); }
    });
  });
  // bind status segmented
  container.querySelectorAll(".project-status-segmented .seg-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const seg = btn.closest(".project-status-segmented");
      const kind = seg.getAttribute("data-kind");
      const level = seg.getAttribute("data-level");
      const newStatus = btn.getAttribute("data-status");
      if (kind === "mandatory") projectState[level].mandatoryStatus = newStatus;
      else projectState[level].challengeStatus = newStatus;
      save();
      render();
    });
  });
  // bind checklist clicks (project criteria)
  container.querySelectorAll(".check-item input").forEach(inp => {
    inp.addEventListener("change", (e) => {
      e.stopPropagation();
      const id = inp.getAttribute("data-id");
      const kind = inp.getAttribute("data-kind");
      const checks = kind === "mandatory" ? projectState[activeLevel].mandatoryChecks : projectState[activeLevel].challengeChecks;
      if (inp.checked) checks.add(id); else checks.delete(id);
      save();
      // celebração se projeto obrigatório 100%
      if (kind === "mandatory") {
        const st = projectStats(activeLevel, "mandatory");
        if (st.isDone && projectState[activeLevel].mandatoryStatus !== PROJECT_STATUS.DONE) {
          // não auto-marca, apenas celebra critérios completos
        }
      }
      render();
    });
  });
  container.querySelectorAll(".check-item").forEach(li => {
    li.addEventListener("click", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "LABEL") return;
      const inp = li.querySelector("input");
      inp.checked = !inp.checked;
      inp.dispatchEvent(new Event("change", {bubbles:true}));
    });
  });
}

function render() {
  const stats = journeyStats();
  const lvlInfo = getLevel(stats.percent);
  const activeStats = totalStatsForLevel(activeLevel);

  document.getElementById("totalPercent").textContent = stats.percent + "%";
  document.getElementById("totalFraction").textContent = `${stats.done} / ${stats.total}`;
  const xpFill = document.getElementById("xpFill");
  if (xpFill) xpFill.style.width = stats.percent + "%";
  document.getElementById("xpPoints").textContent = stats.done * 10;
  document.getElementById("levelNum").textContent = lvlInfo.levelNumber;
  document.getElementById("levelTitle").textContent = lvlInfo.level.title;
  document.getElementById("heroGreeting").textContent = `Bem-vindo, ${lvlInfo.level.title}`;
  document.getElementById("heroQuote").textContent = `“${lvlInfo.level.quote}”`;
  document.getElementById("avatarEl").textContent = lvlInfo.level.icon;
  document.getElementById("nextTitle").textContent = lvlInfo.next ? lvlInfo.next.title : "— Lenda Máxima —";
  document.getElementById("statDone").textContent = stats.done;
  document.getElementById("statBlocks").textContent = `${stats.blocksDone}/${stats.blocksTotal}`;
  document.getElementById("statRemaining").textContent = stats.remaining;
  document.getElementById("statStreak").textContent = daysSinceStart();

  const track = document.getElementById("levelTrack");
  if (track) {
    track.innerHTML = LEVEL_CONFIG.map((l, i) => {
      const isActive = i === lvlInfo.idx;
      const isDone = stats.percent >= l.min && !isActive;
      return `<div class="level-dot ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}"><span>${l.icon}</span> ${l.title} <span style="opacity:.6">${l.min}%</span></div>`;
    }).join("");
  }

  renderLevelSelector();
  renderProgression();
  renderLevelHeader();

  const activeHeroPct = document.getElementById("heroActivePct");
  const heroJourneyPct = document.getElementById("heroJourneyPct");
  if (activeHeroPct) activeHeroPct.textContent = activeStats.percent + "%";
  if (heroJourneyPct) heroJourneyPct.textContent = stats.percent + "%";

  const grid = document.getElementById("blocksGrid");
  const q = search.trim().toLowerCase();
  const data = getActiveData();

  let visible = data.filter(b => {
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
  } else {
    grid.innerHTML = visible.map(block => {
      const p = blockProgress(block);
      const collapsed = block._collapsed ? "collapsed" : "";
      const doneClass = p.isDone ? "done" : "";
      const checked = checkedByLevel[activeLevel];
      const topicsDone = block.topics.filter(t=>checked.has(t.id)).length;
      const critDone = block.criteria.filter(c=>checked.has(c.id)).length;
      return `
      <article class="card ${doneClass} ${collapsed}" data-id="${block.id}">
        <div class="card-header" data-toggle="${block.id}">
          <div class="card-icon">${block.icon}</div>
          <div class="card-titles"><h3>${block.title}</h3><p>${block.desc}</p></div>
          <div class="card-meta"><span class="badge ${p.isDone ? 'done' : p.isStarted ? 'progress' : ''}">${p.isDone ? '✓ Concluído' : p.isStarted ? 'Em progresso' : 'Pendente'}</span><span class="card-pct">${p.pct}%</span></div>
          <div class="chevron">⌃</div>
        </div>
        <div class="card-progress"><div class="card-progress-fill" style="width:${p.pct}%"></div></div>
        <div class="card-body">
          <div class="group"><div class="group-head"><span>📖</span><h4>Tópicos</h4><span class="count ${topicsDone===block.topics.length?'done':''}">${topicsDone}/${block.topics.length}</span></div>
            <ul class="checklist">${block.topics.map(t => `<li class="check-item ${checked.has(t.id)?'checked':''}" data-check="${t.id}"><input type="checkbox" ${checked.has(t.id)?'checked':''} id="chk-${t.id}" data-id="${t.id}"><label for="chk-${t.id}">${t.label}</label></li>`).join("")}</ul>
          </div>
          <div class="group"><div class="group-head"><span>🏅</span><h4>Critérios de Aprovação</h4><span class="count ${critDone===block.criteria.length?'done':''}">${critDone}/${block.criteria.length}</span></div>
            <ul class="checklist">${block.criteria.map(c => `<li class="check-item criteria ${checked.has(c.id)?'checked':''}" data-check="${c.id}"><input type="checkbox" ${checked.has(c.id)?'checked':''} id="chk-${c.id}" data-id="${c.id}"><label for="chk-${c.id}">${c.label}</label></li>`).join("")}</ul>
          </div>
        </div>
        <div class="card-footer"><span>${p.done}/${p.total} tarefas completas</span><strong>${p.isDone ? 'Missão completa! 🎉' : p.pct + '% concluído'}</strong></div>
      </article>`;
    }).join("");
  }

  bindCardEvents();
  renderProjects();
}

function bindCardEvents() {
  const data = getActiveData();
  document.querySelectorAll("#blocksGrid [data-toggle]").forEach(el => {
    el.addEventListener("click", () => {
      const id = el.getAttribute("data-toggle");
      const block = data.find(b=>b.id===id);
      if (block) block._collapsed = !block._collapsed;
      render();
    });
  });
  document.querySelectorAll("#blocksGrid .check-item input").forEach(inp => {
    inp.addEventListener("change", (e) => {
      e.stopPropagation();
      const id = inp.getAttribute("data-id");
      const dataNow = getActiveData();
      const wasDoneBlocks = new Set(dataNow.filter(b=>blockProgress(b).isDone).map(b=>b.id));
      const checked = checkedByLevel[activeLevel];
      if (inp.checked) checked.add(id); else checked.delete(id);
      save();
      const nowDoneBlocks = dataNow.filter(b=>blockProgress(b).isDone).map(b=>b.id);
      const newlyDone = nowDoneBlocks.filter(blockId=>!wasDoneBlocks.has(blockId));
      if (newlyDone.length) {
        const bid = newlyDone[0];
        const block = dataNow.find(b=>b.id===bid);
        showModal(block);
      }
      render();
    });
  });
  document.querySelectorAll("#blocksGrid .check-item").forEach(li => {
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
  if (navigator.vibrate) navigator.vibrate(120);
}
function hideModal(){ const modal=document.getElementById("modal"); modal.classList.add("hidden"); modal.setAttribute("aria-hidden","true"); }

// ——— Init ———
load();
render();

document.querySelectorAll(".chip").forEach(chip=>{
  chip.addEventListener("click", ()=>{
    document.querySelectorAll(".chip").forEach(c=>c.classList.remove("active"));
    chip.classList.add("active");
    filter = chip.dataset.filter;
    render();
  });
});
const searchInput = document.getElementById("searchInput");
if (searchInput) searchInput.addEventListener("input", (e)=>{ search = e.target.value; render(); });
const btnExpand = document.getElementById("btnExpandAll");
if (btnExpand) btnExpand.addEventListener("click", ()=>{ getActiveData().forEach(b=>b._collapsed=false); render(); });
const btnCollapse = document.getElementById("btnCollapseAll");
if (btnCollapse) btnCollapse.addEventListener("click", ()=>{ getActiveData().forEach(b=>b._collapsed=true); render(); });
const btnReset = document.getElementById("btnReset");
if (btnReset) btnReset.addEventListener("click", ()=>{
  const meta = getActiveMeta();
  if (!confirm(`Zerar progresso do ${meta.label}?`)) return;
  if (confirm("Deseja zerar TODA a jornada (3 níveis)? OK = tudo, Cancelar = só este nível.")) {
    for (const k of ["iniciante","intermediario","avancado"]) {
      checkedByLevel[k].clear();
      projectState[k].mandatoryChecks.clear();
      projectState[k].challengeChecks.clear();
      projectState[k].mandatoryStatus = PROJECT_STATUS.NOT_STARTED;
      projectState[k].challengeStatus = PROJECT_STATUS.NOT_STARTED;
    }
  } else {
    checkedByLevel[activeLevel].clear();
    projectState[activeLevel].mandatoryChecks.clear();
    projectState[activeLevel].challengeChecks.clear();
    projectState[activeLevel].mandatoryStatus = PROJECT_STATUS.NOT_STARTED;
    projectState[activeLevel].challengeStatus = PROJECT_STATUS.NOT_STARTED;
  }
  save();
  getActiveData().forEach(b=>b._collapsed=false);
  render();
});
const modalClose = document.getElementById("modalClose");
if (modalClose) modalClose.addEventListener("click", hideModal);
const backdrop = document.querySelector(".modal-backdrop");
if (backdrop) backdrop.addEventListener("click", hideModal);
document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") hideModal(); });
