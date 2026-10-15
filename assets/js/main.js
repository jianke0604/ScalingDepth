/* ScalingDepth — shared layout + page renderers */
(function () {
  const ROOT = document.body.dataset.root || ".";
  const PAGE = document.body.dataset.page || "home";
  const L = SD.links;

  const LOGO = `
  <svg viewBox="0 0 32 32" aria-hidden="true"><rect x="1" y="1" width="30" height="30" rx="8" style="fill:var(--accent)"/><g transform="translate(5 3.2) scale(.22)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round"><g stroke-width="4.5" opacity=".75"><path d="M32 7.2V96.3"/><path d="M46 10.5V77"/><path d="M60 22.9V57.8"/><path d="M74 27.2V38.5"/></g><path d="M18 14C30 2 45 6 55 18S78 30 86 22" stroke-width="9"/><path d="M22 110L86 22" stroke-width="11"/><path d="M18 14C14 45 15 85 20 112M12 112H34" stroke-width="9"/></g></svg>`;

  // ---------- Theme ----------
  const stored = (() => { try { return localStorage.getItem("sd-theme"); } catch (e) { return null; } })();
  if (stored) document.documentElement.dataset.theme = stored;
  function isDark() {
    const t = document.documentElement.dataset.theme;
    return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function toggleTheme() {
    const next = isDark() ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("sd-theme", next); } catch (e) {}
    themeBtn.textContent = isDark() ? "☀" : "☾";
  }

  // ---------- Header / footer ----------
  const nav = [
    ["home", "Home", `${ROOT}/index.html`],
    ["methods", "Residuals", `${ROOT}/pages/methods.html`],
    ["benchmarks", "Benchmarks", `${ROOT}/pages/benchmarks.html`],
    ["papers", "Papers", `${ROOT}/pages/papers.html`],
    ["tutorials", "Tutorials", `${ROOT}/pages/tutorials.html`],
    ["blogs", "Blogs", `${ROOT}/pages/blogs.html`],
    ["community", "Community", `${ROOT}/pages/community.html`]
  ];
  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <div class="container nav">
      <a class="brand" href="${ROOT}/index.html">${LOGO}<span>ScalingDepth</span></a>
      <button class="icon-btn menu-btn" aria-label="Menu">☰</button>
      <nav class="nav-links">
        ${nav.map(([id, t, h]) => `<a href="${h}" class="${id === PAGE ? "active" : ""}">${t}</a>`).join("")}
        <a href="${L.repo}" target="_blank" rel="noopener">GitHub ↗</a>
        <button class="icon-btn theme-btn" aria-label="Toggle theme"></button>
      </nav>
    </div>`;
  document.body.prepend(header);
  const themeBtn = header.querySelector(".theme-btn");
  themeBtn.textContent = isDark() ? "☀" : "☾";
  themeBtn.onclick = toggleTheme;
  header.querySelector(".menu-btn").onclick = () => header.querySelector(".nav-links").classList.toggle("open");

  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="container footer-grid">
      <div>
        <div class="brand" style="margin-bottom:8px">${LOGO}<span>ScalingDepth</span></div>
        <div>A community collection of residual connections &amp; depth scaling.</div>
      </div>
      <div>
        <a href="${ROOT}/pages/methods.html">Residuals</a>
        <a href="${ROOT}/pages/benchmarks.html">Benchmarks</a>
        <a href="${ROOT}/pages/papers.html">Papers</a>
        <a href="${ROOT}/pages/tutorials.html">Tutorials</a>
        <a href="${ROOT}/pages/blogs.html">Blogs</a>
        <a href="${L.repo}" target="_blank" rel="noopener">GitHub</a>
        <div style="margin-top:8px">© 2026 ScalingDepth contributors · MIT License</div>
      </div>
    </div>`;
  document.body.append(footer);

  // ---------- Helpers ----------
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const famById = Object.fromEntries(SD.families.map((f) => [f.id, f]));
  const arxivUrl = (id) => `https://arxiv.org/abs/${id}`;
  // Release time for sorting: arXiv id (YYMM.NNNNN), else an optional "YYYY-MM" date, else the year.
  function pubKey(m) {
    if (m.arxiv) {
      const [ym, n] = m.arxiv.split(".");
      const yy = +ym.slice(0, 2);
      return ((yy >= 90 ? 1900 : 2000) + yy) * 100 + +ym.slice(2) + +n / 1e6;
    }
    if (m.date) { const [y, mo] = m.date.split("-"); return +y * 100 + +mo; }
    return m.year * 100;
  }

  function tex(src, display = true) {
    if (window.katex) {
      try { return katex.renderToString(src, { displayMode: display, throwOnError: false }); } catch (e) {}
    }
    return `<code>${esc(src)}</code>`;
  }

  function methodCard(m) {
    const fam = famById[m.family];
    return `
      <article class="card method" id="${m.id}">
        <div class="method-top">
          <h3>${esc(m.name)}</h3>
        </div>
        <div class="meta">${esc(m.authors)} · ${esc(m.venue)} · ${m.year}</div>
        <div class="formula">${tex(m.formula)}</div>
        <p>${esc(m.desc)}</p>
        <div class="tags"><span class="pill">${fam.icon} ${esc(fam.name)}</span>${(m.tags || []).map((t) => `<span class="pill">${esc(t)}</span>`).join("")}</div>
        <div class="links">
          ${m.arxiv ? `<a href="${arxivUrl(m.arxiv)}" target="_blank" rel="noopener">arXiv:${m.arxiv} ↗</a>` : ""}
          ${m.link ? `<a href="${m.link}" target="_blank" rel="noopener">${esc(m.linkLabel || "Paper")} ↗</a>` : ""}
          ${m.code ? `<a href="${m.code}" target="_blank" rel="noopener">Code ↗</a>` : ""}
        </div>
      </article>`;
  }

  function paperRow(p) {
    return `
      <div class="paper">
        <div class="yr">${p.year}</div>
        <div>
          <h3><a href="${arxivUrl(p.arxiv)}" target="_blank" rel="noopener">${esc(p.title)}</a></h3>
          <p>${esc(p.authors)}${p.note ? ` — ${esc(p.note)}` : ""}</p>
        </div>
        <div><span class="pill">${esc(p.topic)}</span></div>
      </div>`;
  }

  function tutorialCard(t) {
    const links = [{ label: t.linkLabel || "Open", url: t.link }, ...(t.extra || [])];
    return `
      <article class="card tutorial">
        <div class="tags"><span class="pill db">${esc(t.type)}</span></div>
        <h3><a href="${t.link}" target="_blank" rel="noopener">${esc(t.title)}</a></h3>
        <div class="meta">${esc(t.source)}</div>
        ${t.desc ? `<p>${esc(t.desc)}</p>` : ""}
        <div class="links">${links.map((l) => `<a href="${l.url}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join("")}</div>
      </article>`;
  }

  function blogRow(b) {
    return `
      <div class="paper">
        <div class="yr">${esc(b.date)}</div>
        <div>
          <h3><a href="${b.link}" target="_blank" rel="noopener">${esc(b.title)}</a></h3>
          <p>${esc(b.authors)}${b.note ? ` — ${esc(b.note)}` : ""}</p>
        </div>
        <div>${b.tag ? `<span class="pill">${esc(b.tag)}</span>` : ""}</div>
      </div>`;
  }

  function wireCopy() {
    document.querySelectorAll(".copy-btn").forEach((b) => {
      b.onclick = () => {
        const txt = b.parentElement.querySelector("pre").innerText;
        const done = () => { b.textContent = "Copied"; setTimeout(() => (b.textContent = "Copy"), 1400); };
        const fallback = () => {
          const r = document.createRange(); r.selectNodeContents(b.parentElement.querySelector("pre"));
          const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
          b.textContent = "Press Ctrl+C";
        };
        try { navigator.clipboard.writeText(txt).then(done, fallback); } catch (e) { fallback(); }
      };
    });
  }

  // ---------- Page renderers ----------
  const renderers = {
    home() {
      $("#stat-methods").textContent = SD.methods.length;
      $("#stat-families").textContent = SD.families.length;
      $("#stat-papers").textContent = SD.papers.length;
      $("#stat-recent").textContent = SD.methods.filter((m) => m.year >= 2025).length;

      $("#news").innerHTML = SD.news.map((n) => `
        <div class="news-item">
          <div class="news-date">${n.date}</div>
          <div>
            <h3>${n.link ? `<a href="${n.link}" target="_blank" rel="noopener">${esc(n.title)}</a>` : esc(n.title)} <span class="pill" style="margin-left:6px">${n.tag}</span></h3>
            <p>${esc(n.text)}</p>
          </div>
        </div>`).join("");

      $("#families").innerHTML = SD.families.map((f) => {
        const n = SD.methods.filter((m) => m.family === f.id).length;
        return `
          <a class="card" href="pages/methods.html#${f.id}">
            <div class="fam-icon">${f.icon}</div>
            <h3>${esc(f.name)}</h3>
            <p>${esc(f.blurb)}</p>
            <span class="count">${n} methods →</span>
          </a>`;
      }).join("") + `
          <a class="card" href="pages/community.html#contribute" style="border-style:dashed">
            <div class="fam-icon" style="background:var(--bg-alt);color:var(--accent-2)">+</div>
            <h3>Missing a design?</h3>
            <p>Add a residual connection, normalisation scheme or depth parametrization with one entry in a data file.</p>
            <span class="count">Contribute →</span>
          </a>`;

      wireCopy();
    },

    methods() {
      const state = { q: "", family: "all", sort: "year-desc" };
      // read hash: #norm (a family id)
      const h = location.hash.slice(1);
      if (famById[h]) state.family = h;

      const chips = $("#chips");
      chips.innerHTML = [`<button class="chip" data-f="all">All</button>`]
        .concat(SD.families.map((f) => `<button class="chip" data-f="${f.id}">${f.icon} ${esc(f.name)}</button>`)).join("");

      function draw() {
        chips.querySelectorAll(".chip").forEach((c) => c.classList.toggle("on", c.dataset.f === state.family));
        const q = state.q.toLowerCase();
        let list = SD.methods.filter((m) =>
          (state.family === "all" || m.family === state.family) &&
          (!q || [m.name, m.authors, m.desc, m.venue, (m.tags || []).join(" ")].join(" ").toLowerCase().includes(q)));
        const [key, dir] = state.sort.split("-");
        list.sort((a, b) => key === "name" ? a.name.localeCompare(b.name) : (dir === "desc" ? pubKey(b) - pubKey(a) : pubKey(a) - pubKey(b)));
        $("#count").textContent = `${list.length} of ${SD.methods.length} methods`;
        $("#grid").innerHTML = list.length ? list.map(methodCard).join("") : `<div class="empty" style="grid-column:1/-1">No methods match. Know one we're missing? <a href="community.html#contribute">Add it →</a></div>`;
      }
      chips.onclick = (e) => { const c = e.target.closest(".chip"); if (c) { state.family = c.dataset.f; draw(); } };
      $("#q").oninput = (e) => { state.q = e.target.value; draw(); };
      $("#sort").onchange = (e) => { state.sort = e.target.value; draw(); };
      draw();
    },

    papers() {
      const topics = ["all", ...new Set(SD.papers.map((p) => p.topic))];
      let cur = "all";
      const chips = $("#chips");
      chips.innerHTML = topics.map((t) => `<button class="chip" data-t="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join("");
      function draw() {
        chips.querySelectorAll(".chip").forEach((c) => c.classList.toggle("on", c.dataset.t === cur));
        $("#paper-list").innerHTML = SD.papers.filter((p) => cur === "all" || p.topic === cur).sort((a, b) => b.year - a.year || (b.ours ? 1 : 0) - (a.ours ? 1 : 0)).map(paperRow).join("");
      }
      chips.onclick = (e) => { const c = e.target.closest(".chip"); if (c) { cur = c.dataset.t; draw(); } };
      draw();
    },

    tutorials() {
      const groups = [...new Set(SD.tutorials.map((t) => t.group))];
      $("#tutorial-groups").innerHTML = groups.map((g) => `
        <div class="tut-group">
          <h2>${esc(g)}</h2>
          <div class="grid g2">${SD.tutorials.filter((t) => t.group === g).map(tutorialCard).join("")}</div>
        </div>`).join("");
    },

    blogs() {
      $("#blog-list").innerHTML = SD.blogs.length
        ? [...SD.blogs].sort((a, b) => b.date.localeCompare(a.date)).map(blogRow).join("")
        : `<div class="empty">No posts yet. Written something on depth or residual streams? <a href="community.html#contribute">Add it →</a></div>`;
    },

    community() { wireCopy(); }
  };

  function boot() { (renderers[PAGE] || (() => {}))(); }
  // KaTeX loads with defer; wait for it so formulas render.
  if (document.readyState === "complete") boot();
  else window.addEventListener("load", boot);
})();
