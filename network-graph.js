/* network-graph.js — enriched force/concentric network for Chula Powermap
   Vanilla JS, no external libs. Pairs with network-data.js + network_rich.html */
(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const W = 1000, H = 720, CX = W / 2, CY = H / 2 - 6;

  const svg = document.getElementById("netSvg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  const viewport = document.getElementById("netViewport");
  const linksLayer = document.getElementById("netLinksLayer");
  const nodesLayer = document.getElementById("netNodesLayer");
  const panel = document.getElementById("analysisPanel");
  const hudFocus = document.getElementById("hudFocus");

  const nodes = NET_NODES.map(n => ({ ...n }));
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  const links = NET_LINKS
    .filter(([a, b]) => nodeMap[a] && nodeMap[b])
    .map(([a, b]) => ({ a, b, sa: nodeMap[a], sb: nodeMap[b] }));

  // ---- degree (centrality) ----
  nodes.forEach(n => (n.deg = 0));
  links.forEach(l => { l.sa.deg++; l.sb.deg++; });
  const maxDeg = Math.max(...nodes.map(n => n.deg));

  // node radius by type + degree
  function radiusOf(n) {
    if (n.type === "site") return n.id === "S05" ? 30 : 19 + (n.deg / maxDeg) * 6;
    const base = { actor: 7, instrument: 7, event: 6 }[n.type] || 7;
    return base + (n.deg / maxDeg) * 13;
  }
  nodes.forEach(n => (n.r = radiusOf(n)));

  const UI = {
    en: {
      counts: { actor: "actors", instrument: "instruments", event: "events", site: "sites" },
      types: { actor: "Actor", instrument: "Instrument", event: "Event", site: "Site" },
      stance: { threat: "Threat", complicit: "Complicit", neutral: "Neutral", defender: "Defender", shrine: "Shrine" },
      layoutAtlas: "Layout · Atlas", layoutForce: "Layout · Force",
      analysis: "Analysis", connections: "connections", centrality: "centrality rank", connectedTo: "Connected to",
      emptyFocus: "— hover a node —", emptyPanel: "Hover a node to read the analysis", flagship: "flagship"
    },
    zh: {
      counts: { actor: "行动者", instrument: "工具", event: "事件", site: "地点" },
      types: { actor: "行动者", instrument: "工具", event: "事件", site: "地点" },
      stance: { threat: "威胁方", complicit: "共谋方", neutral: "中性", defender: "守护方", shrine: "庙/核心" },
      layoutAtlas: "布局 · 图谱", layoutForce: "布局 · 力导图",
      analysis: "分析", connections: "连接", centrality: "中心性排名", connectedTo: "连接到",
      emptyFocus: "— 悬停节点 —", emptyPanel: "悬停或点击节点以查看分析", flagship: "核心节点"
    },
    th: {
      counts: { actor: "ผู้กระทำ", instrument: "เครื่องมือ", event: "เหตุการณ์", site: "พื้นที่" },
      types: { actor: "ผู้กระทำ", instrument: "เครื่องมือ", event: "เหตุการณ์", site: "พื้นที่" },
      stance: { threat: "คุกคาม", complicit: "ร่วมเอื้อ", neutral: "กลาง", defender: "ปกป้อง", shrine: "ศาลเจ้า" },
      layoutAtlas: "ผัง · Atlas", layoutForce: "ผัง · Force",
      analysis: "บทวิเคราะห์", connections: "ความเชื่อมโยง", centrality: "อันดับศูนย์กลาง", connectedTo: "เชื่อมกับ",
      emptyFocus: "— ชี้ที่โหนด —", emptyPanel: "ชี้หรือคลิกโหนดเพื่ออ่านบทวิเคราะห์", flagship: "โหนดหลัก"
    }
  };

  function lang() { return window.I18N ? window.I18N.current : "en"; }
  function ui() { return UI[lang()] || UI.en; }
  function localizedNode(n) {
    const pack = n.i18n && (n.i18n[lang()] || n.i18n.en);
    return {
      name: (pack && pack.name) || n.name,
      note: (pack && pack.note) || n.note,
      cn: n.i18n && n.i18n.zh ? n.i18n.zh.name : (n.cn || "")
    };
  }

  // ---- counts in meta bar ----
  const c = t => nodes.filter(n => n.type === t).length;
  function renderCounts() {
    const labels = ui().counts;
    document.getElementById("metaCount").textContent =
      `${c("actor")} ${labels.actor} · ${c("instrument")} ${labels.instrument} · ${c("event")} ${labels.event} · ${c("site")} ${labels.site}`;
  }
  renderCounts();

  // ---- initial positions ----
  nodes.forEach((n, i) => {
    if (n.id === "S05") { n.x = CX; n.y = CY; }
    else {
      const ang = (i / nodes.length) * Math.PI * 2;
      n.x = CX + Math.cos(ang) * (120 + (i % 5) * 55);
      n.y = CY + Math.sin(ang) * (110 + (i % 5) * 45);
    }
    n.vx = 0; n.vy = 0; n.pinned = false;
  });

  // ---- atlas targets (poster order: instruments inner -> actors -> events -> sites) ----
  const ATLAS = {
    instrument: { rx: 170, ry: 118, offset: -Math.PI / 2 },
    actor: { rx: 305, ry: 210, offset: -Math.PI * 0.78 },
    event: { rx: 405, ry: 278, offset: -Math.PI * 0.55 },
    site: { rx: 455, ry: 310, offset: -Math.PI * 0.08 }
  };
  const SITE_TARGETS = {
    S01: [820, 430], S02: [840, 275], S03: [145, 235], S04: [760, 98],
    S06: [118, 400], S07: [730, 608], S08: [610, 275], S09: [315, 575], S10: [168, 520]
  };

  function assignRingAngles() {
    const byType = { instrument: [], actor: [], event: [], site: [] };
    nodes.forEach(n => { if (n.id !== "S05") byType[n.type] && byType[n.type].push(n); });
    Object.keys(byType).forEach(type => {
      const arr = byType[type];
      // order by stance so colours group around the ring
      const order = { threat: 0, complicit: 1, neutral: 2, shrine: 3, defender: 4 };
      arr.sort((p, q) => (order[p.stance] - order[q.stance]) || p.id.localeCompare(q.id));
      arr.forEach((n, k) => {
        n.ringAng = ATLAS[type].offset + (k / arr.length) * Math.PI * 2;
        if (SITE_TARGETS[n.id]) {
          n.tx = SITE_TARGETS[n.id][0];
          n.ty = SITE_TARGETS[n.id][1];
        } else {
          n.tx = CX + Math.cos(n.ringAng) * ATLAS[type].rx;
          n.ty = CY + Math.sin(n.ringAng) * ATLAS[type].ry;
        }
      });
    });
  }
  assignRingAngles();

  let layoutMode = "atlas"; // 'atlas' | 'force'

  // ---- simple force simulation ----
  let alpha = 1;
  function tick() {
    const k = alpha;
    // repulsion (O(n^2), n~105 fine)
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        let dx = a.x - b.x, dy = a.y - b.y;
        let d2 = dx * dx + dy * dy || 0.01;
        const minD = (a.r + b.r + 10);
        const rep = (layoutMode === "force" ? 2600 : 1300) / d2;
        let f = rep;
        if (d2 < minD * minD) f += (minD * minD - d2) / d2 * 0.12; // collision
        const d = Math.sqrt(d2);
        const fx = (dx / d) * f, fy = (dy / d) * f;
        if (!a.pinned) { a.vx += fx; a.vy += fy; }
        if (!b.pinned) { b.vx -= fx; b.vy -= fy; }
      }
    }
    // link springs
    const target = layoutMode === "force" ? 78 : 74;
    links.forEach(l => {
      const a = l.sa, b = l.sb;
      let dx = b.x - a.x, dy = b.y - a.y;
      let d = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const f = (d - target) * 0.02 * k;
      const fx = (dx / d) * f, fy = (dy / d) * f;
      if (!a.pinned) { a.vx += fx; a.vy += fy; }
      if (!b.pinned) { b.vx -= fx; b.vy -= fy; }
    });
    // positioning gravity
    nodes.forEach(n => {
      if (n.pinned) return;
      if (n.id === "S05") { n.x = CX; n.y = CY; n.vx = n.vy = 0; return; }
      if (layoutMode === "atlas") {
        n.vx += (n.tx - n.x) * 0.075;
        n.vy += (n.ty - n.y) * 0.075;
      } else {
        n.vx += (CX - n.x) * 0.0016;
        n.vy += (CY - n.y) * 0.0016;
      }
      n.vx *= 0.86; n.vy *= 0.86;
      n.x += n.vx; n.y += n.vy;
    });
    alpha *= 0.992;
    if (alpha < 0.02) alpha = 0.02;
  }

  // ---- build SVG elements ----
  const linkEls = links.map(l => {
    const el = document.createElementNS(SVG_NS, "path");
    el.setAttribute("class", "net-link");
    el.dataset.a = l.a; el.dataset.b = l.b;
    linksLayer.appendChild(el);
    l.el = el;
    return l;
  });

  const nodeEls = nodes.map(n => {
    const g = document.createElementNS(SVG_NS, "g");
    g.setAttribute("class", "net-node" + (n.flagship ? " flagship" : ""));
    g.dataset.id = n.id; g.dataset.type = n.type; g.dataset.stance = n.stance;

    let shape;
    if (n.type === "instrument") {
      shape = document.createElementNS(SVG_NS, "rect");
      shape.setAttribute("width", n.r * 1.9); shape.setAttribute("height", n.r * 1.9);
      shape.setAttribute("x", -n.r * 0.95); shape.setAttribute("y", -n.r * 0.95);
      shape.setAttribute("rx", 2);
    } else if (n.type === "event") {
      shape = document.createElementNS(SVG_NS, "polygon");
      const r = n.r * 1.15;
      shape.setAttribute("points", `0,${-r} ${r},0 0,${r} ${-r},0`);
    } else {
      shape = document.createElementNS(SVG_NS, "circle");
      shape.setAttribute("r", n.r);
    }
    shape.setAttribute("class", "net-node-shape");
    g.appendChild(shape);

    const code = document.createElementNS(SVG_NS, "text");
    code.setAttribute("class", "net-node-code");
    code.setAttribute("dy", "2.6");
    code.textContent = n.id;
    if (n.r >= 9) g.appendChild(code);

    const label = document.createElementNS(SVG_NS, "text");
    label.setAttribute("class", "net-node-label");
    label.setAttribute("dy", n.r + 11);
    label.textContent = shortName(n);
    g.appendChild(label);

    g.addEventListener("mouseenter", () => setActiveNode(n.id));
    g.addEventListener("click", e => { e.stopPropagation(); setActiveNode(n.id); });
    nodesLayer.appendChild(g);
    n.g = g; n.shapeEl = shape; n.labelEl = label;
    return n;
  });

  function shortName(n) {
    const s = localizedNode(n).name.replace(/\s*\(.*?\)\s*/g, " ").trim();
    return s.length > 24 ? s.slice(0, 22) + "…" : s;
  }

  function render() {
    linkEls.forEach(l => {
      const a = l.sa, b = l.sb;
      if (layoutMode === "atlas") {
        l.el.setAttribute("d", `M${a.x},${a.y} L${b.x},${b.y}`);
      } else {
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const dx = b.x - a.x, dy = b.y - a.y;
        const curve = 0.06;
        const cx = mx - dy * curve, cy = my + dx * curve;
        l.el.setAttribute("d", `M${a.x},${a.y} Q${cx},${cy} ${b.x},${b.y}`);
      }
    });
    nodeEls.forEach(n => n.g.setAttribute("transform", `translate(${n.x},${n.y})`));
  }

  function settleLayout(iterations = 160) {
    alpha = 1;
    for (let i = 0; i < iterations; i++) tick();
    render();
  }
  settleLayout();

  // ====================== INTERACTION ======================
  let activeId = null;
  let typeFilter = "all", stanceFilter = "all";

  function neighborsOf(id) {
    const set = new Set([id]);
    links.forEach(l => { if (l.a === id) set.add(l.b); if (l.b === id) set.add(l.a); });
    return set;
  }

  function passesFilter(n) {
    return (typeFilter === "all" || n.type === typeFilter) &&
           (stanceFilter === "all" || n.stance === stanceFilter);
  }

  function applyFilterDim() {
    nodeEls.forEach(n => {
      n.g.classList.toggle("dimmed", !passesFilter(n));
    });
    linkEls.forEach(l => {
      const vis = passesFilter(l.sa) && passesFilter(l.sb);
      l.el.classList.toggle("dimmed", !vis);
      l.el.classList.remove("highlighted");
    });
    if (activeId) setActiveNode(activeId, true);
  }

  function setActiveNode(id, keepFilter) {
    activeId = id;
    const n = nodeMap[id];
    const nb = neighborsOf(id);
    const loc = localizedNode(n);
    hudFocus.textContent = `${id} · ${loc.name}`;

    nodeEls.forEach(m => {
      m.g.classList.toggle("active", m.id === id);
      const dim = !nb.has(m.id) || !passesFilter(m);
      m.g.classList.toggle("dimmed", dim);
      m.g.classList.toggle("faded-label", dim);
    });
    linkEls.forEach(l => {
      const conn = l.a === id || l.b === id;
      l.el.classList.toggle("highlighted", conn);
      l.el.classList.toggle("dimmed", !conn);
    });

    const conns = links.filter(l => l.a === id || l.b === id)
      .map(l => nodeMap[l.a === id ? l.b : l.a]);
    renderPanel(n, conns);
  }

  function renderPanel(n, conns) {
    const loc = localizedNode(n);
    const labels = ui();
    const typeName = labels.types[n.type];
    const stanceName = labels.stance[n.stance];

    panel.innerHTML = `
      <div class="na-tag">§ ${n.id}</div>
      <div class="na-badges">
        <span class="na-badge type">${typeName}</span>
        <span class="na-badge stance" data-stance="${n.stance}">${stanceName}</span>
        ${n.year ? `<span class="na-badge year">${n.year}</span>` : ""}
        ${n.flagship ? `<span class="na-badge year">★ ${labels.flagship}</span>` : ""}
      </div>
      <h3 class="na-name">${n.flagship ? `<em>${loc.name}</em>` : loc.name}</h3>
      <div class="na-section">
        <div class="na-section-label">${labels.analysis}</div>
        <div class="na-section-body">${loc.note}</div>
      </div>
      <div class="na-section">
        <div class="na-metrics">
          <div class="na-metric"><div class="v">${n.deg}</div><div class="k">${labels.connections}</div></div>
          <div class="na-metric"><div class="v">${rankOf(n)}</div><div class="k">${labels.centrality}</div></div>
        </div>
      </div>
      <div class="na-section" style="flex:1; display:flex; flex-direction:column;">
        <div class="na-section-label">${labels.connectedTo} · ${conns.length}</div>
        <div class="na-conns">
          ${conns.sort((a, b) => b.deg - a.deg).map(x => `
            <div class="na-conn" data-goto="${x.id}">
              <span class="id" data-stance="${x.stance}">${x.id}</span>
              <span class="name">${localizedNode(x).name}</span>
            </div>`).join("")}
        </div>
      </div>`;
    panel.querySelectorAll(".na-conn").forEach(el =>
      el.addEventListener("click", () => focusNode(el.dataset.goto)));
  }

  const degRank = [...nodes].sort((a, b) => b.deg - a.deg);
  function rankOf(n) { return "#" + (degRank.indexOf(n) + 1); }

  function focusNode(id) {
    setActiveNode(id);
  }

  // ---- type filter chips ----
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      typeFilter = btn.dataset.filter;
      activeId ? setActiveNode(activeId, true) : applyFilterDim();
    });
  });
  // ---- stance filter chips ----
  document.querySelectorAll('[data-stancefilter]').forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll('[data-stancefilter]').forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      stanceFilter = btn.dataset.stancefilter;
      activeId ? setActiveNode(activeId, true) : applyFilterDim();
    });
  });

  // ---- search ----
  const search = document.getElementById("netSearch");
  search.addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    const q = search.value.trim().toLowerCase();
    if (!q) return;
    const hit = nodes.find(n =>
      n.id.toLowerCase() === q ||
      n.name.toLowerCase().includes(q) ||
      (n.cn && n.cn.includes(q)) ||
      Object.values(n.i18n || {}).some(pack =>
        (pack.name && pack.name.toLowerCase().includes(q)) ||
        (pack.note && pack.note.toLowerCase().includes(q))));
    if (hit) focusNode(hit.id);
  });

  // ---- layout toggle ----
  const layoutBtn = document.getElementById("layoutToggle");
  function updateLayoutLabel() {
    layoutBtn.textContent = layoutMode === "atlas" ? ui().layoutAtlas : ui().layoutForce;
  }
  updateLayoutLabel();
  layoutBtn.addEventListener("click", () => {
    layoutMode = layoutMode === "force" ? "atlas" : "force";
    updateLayoutLabel();
    nodes.forEach(n => (n.pinned = false));
    if (layoutMode === "atlas") assignRingAngles();
    settleLayout();
  });

  // ---- click empty space clears focus ----
  svg.addEventListener("click", () => {
    activeId = null;
    nodeEls.forEach(m => m.g.classList.remove("active", "dimmed", "faded-label"));
    linkEls.forEach(l => l.el.classList.remove("highlighted", "dimmed"));
    hudFocus.textContent = ui().emptyFocus;
    applyFilterDim();
    panel.innerHTML = `<div class="na-empty">${ui().emptyPanel}</div>`;
  });

  // ====================== ZOOM / PAN ======================
  const view = { s: 1, tx: 0, ty: 0 };
  function applyView() {
    view.tx = CX * (1 - view.s);
    view.ty = CY * (1 - view.s);
    viewport.setAttribute("transform", `translate(${view.tx},${view.ty}) scale(${view.s})`);
  }
  svg.addEventListener("wheel", e => {
    e.preventDefault();
    const f = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    const ns = Math.min(4, Math.max(0.4, view.s * f));
    view.s = ns; applyView();
  }, { passive: false });

  document.getElementById("zoomIn").onclick = () => zoomBy(1.2);
  document.getElementById("zoomOut").onclick = () => zoomBy(1 / 1.2);
  function zoomBy(f) {
    const ns = Math.min(4, Math.max(0.4, view.s * f));
    view.s = ns; applyView();
  }
  document.getElementById("resetView").onclick = () => {
    view.s = 1; view.tx = 0; view.ty = 0; applyView();
    nodes.forEach(n => (n.pinned = false));
    layoutMode = "atlas";
    assignRingAngles();
    updateLayoutLabel();
    settleLayout();
  };

  document.addEventListener("langchange", () => {
    renderCounts();
    nodeEls.forEach(n => { n.labelEl.textContent = shortName(n); });
    updateLayoutLabel();
    if (activeId) setActiveNode(activeId, true);
    else panel.innerHTML = `<div class="na-empty">${ui().emptyPanel}</div>`;
  });

  // ---- start focused on the shrine ----
  setActiveNode("S05");
})();
