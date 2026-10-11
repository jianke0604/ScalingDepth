/* DepthBench interactive chart, ported from the DepthBench project website
   (https://keyu-wang-2002.github.io/DepthBench-Website/). */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  // ---------- Interactive chart (values read from Figures 1, 2 and 4 of the paper) ----------
  const COLORS = {
    "Pre-LN": "var(--text)", "Full AttnRes": "#e3394a", "HC": "#7540c8", "Sandwich-LN": "#d58a00", "LNS": "#388b52",
    "DeepNorm": "#697586", "KEEL": "#b5653c", "MoDA": "#258daa", "Block AttnRes": "#578bcb", "mHC": "#c95fae",
  };
  const ORDER = Object.keys(COLORS);
  const on = { "Pre-LN": true, "Full AttnRes": true, "HC": true };

  // 400M shapes, ordered shallow -> deep
  const AR5 = [76.0, 56.0, 42.7, 34.3, 28.0];
  const LD5 = ["L16 · d1216", "L20 · d1120", "L24 · d1024", "L28 · d960", "L32 · d896"];
  const zip = (xs, vs) => vs.map((v, i) => [xs[i], v]);
  const VAL400 = {
    "Pre-LN": [2.759, 2.759, 2.765, 2.774, 2.782],
    "Full AttnRes": [2.751, 2.728, 2.726, 2.722, 2.718],
    "HC": [2.729, 2.716, 2.702, 2.714, 2.700],
    "Sandwich-LN": [2.765, 2.754, 2.757, 2.757, 2.766],
    "LNS": [2.749, 2.737, 2.740, 2.740, 2.739],
    "DeepNorm": [2.790, 2.779, 2.796, 2.792, 2.798],
    "KEEL": [2.781, 2.768, 2.767, 2.771, 2.775],
    "MoDA": [2.753, 2.746, 2.764, 2.761, 2.780],
    "Block AttnRes": [2.734, 2.716, 2.719, 2.726, 2.730],
    "mHC": [2.720, 2.720, 2.710, 2.727, 2.721],
  };
  const NLL = {
    coding: {
      "Pre-LN": [3.891, 3.698, 3.793, 3.737, 3.797], "Sandwich-LN": [3.748, 3.729, 3.768, 3.775, 3.785],
      "LNS": [3.835, 3.861, 3.873, 3.868, 3.944], "DeepNorm": [3.585, 3.537, 3.677, 3.753, 3.775],
      "KEEL": [3.782, 3.821, 3.839, 3.736, 3.628], "Full AttnRes": [3.616, 3.615, 3.580, 3.507, 3.542],
      "Block AttnRes": [3.523, 3.494, 3.474, 3.594, 3.512], "HC": [3.676, 3.700, 3.538, 3.534, 3.527],
      "mHC": [3.756, 3.737, 3.542, 3.649, 3.534], "MoDA": [3.917, 3.776, 3.604, 3.581, 3.672],
    },
    stem: {
      "Pre-LN": [2.448, 2.441, 2.440, 2.471, 2.472], "Sandwich-LN": [2.432, 2.426, 2.448, 2.458, 2.444],
      "LNS": [2.440, 2.429, 2.435, 2.436, 2.448], "DeepNorm": [2.454, 2.435, 2.466, 2.461, 2.471],
      "KEEL": [2.465, 2.469, 2.466, 2.477, 2.442], "Full AttnRes": [2.411, 2.384, 2.383, 2.374, 2.370],
      "Block AttnRes": [2.405, 2.366, 2.366, 2.379, 2.382], "HC": [2.401, 2.387, 2.354, 2.376, 2.362],
      "mHC": [2.396, 2.390, 2.360, 2.386, 2.377], "MoDA": [2.444, 2.434, 2.439, 2.429, 2.441],
    },
    math: {
      "Pre-LN": [3.095, 3.099, 3.040, 3.145, 3.094], "Sandwich-LN": [3.016, 3.028, 3.085, 3.052, 3.030],
      "LNS": [3.065, 3.059, 3.117, 3.028, 3.099], "DeepNorm": [3.024, 3.029, 3.094, 3.116, 3.105],
      "KEEL": [3.141, 3.147, 3.194, 3.196, 3.079], "Full AttnRes": [3.018, 2.882, 2.915, 2.883, 2.844],
      "Block AttnRes": [3.009, 2.911, 2.878, 2.909, 2.889], "HC": [2.927, 2.931, 2.887, 2.869, 2.858],
      "mHC": [2.941, 2.889, 2.885, 2.887, 2.921], "MoDA": [3.077, 3.029, 3.017, 2.972, 3.033],
    },
  };
  const mapObj = (o, f) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, f(v, k)]));
  const VIEWS = {
    main: {
      title: "Interactive · validation loss at ≈400M", y: "Validation loss ↓",
      x: zip(AR5, LD5), series: mapObj(VAL400, v => zip(AR5, v)),
    },
    ext: {
      title: "Interactive · validation loss at ≈400M, up to 70 layers", y: "Validation loss ↓",
      x: zip([76.0, 56.0, 42.7, 34.3, 28.0, 19.1, 9.1], ["L16 · d1216", "", "", "", "L32 · d896", "L42 · d800", "L70 · d640"]),
      series: {
        "Pre-LN": zip(AR5, VAL400["Pre-LN"]),
        "LNS": zip([76.0, 56.0, 42.7, 34.3, 28.0, 19.1], [2.749, 2.737, 2.740, 2.740, 2.739, 2.748]),  // L42 point from Figure 1
        "Full AttnRes": zip([76.0, 56.0, 42.7, 34.3, 28.0, 19.1, 9.1], [2.751, 2.728, 2.726, 2.722, 2.718, 2.708, 2.702]),
        "HC": zip([76.0, 56.0, 42.7, 34.3, 28.0, 19.1, 9.1], [2.729, 2.716, 2.702, 2.714, 2.700, 2.691, 2.682]),
      },
    },
    backbone: {
      title: "Interactive · validation loss at a fixed ≈300M backbone", y: "Validation loss ↓",
      x: [[78, "L16 · 425M"], [42.7, "L24 · 405M"], [28, "L32 · 399M"], [18.3, "L42 · 375M"], [8.7, "L70 · 373M"], [6.48, "L84 · 354M"]],
      series: {
        "Pre-LN": [[78, 2.753], [42.7, 2.765], [28, 2.763], [18.3, 2.817]],
        "Full AttnRes": [[78, 2.746], [42.7, 2.726], [28, 2.718], [18.3, 2.740], [8.7, 2.739]],
        "HC": [[78, 2.721], [42.7, 2.702], [28, 2.700], [18.3, 2.697], [8.7, 2.694], [6.48, 2.719]],
      },
    },
    coding: { title: "Interactive · coding NLL at ≈400M (MBPP, HumanEval)", y: "NLL loss ↓", x: zip(AR5, LD5), series: mapObj(NLL.coding, v => zip(AR5, v)) },
    stem:   { title: "Interactive · STEM NLL at ≈400M (SciQ, GPQA)",      y: "NLL loss ↓", x: zip(AR5, LD5), series: mapObj(NLL.stem,   v => zip(AR5, v)) },
    math:   { title: "Interactive · math NLL at ≈400M (GSM8K, MATH-500)", y: "NLL loss ↓", x: zip(AR5, LD5), series: mapObj(NLL.math,   v => zip(AR5, v)) },
  };

  const chart = document.querySelector("#loss-chart");
  if (chart) {
    const X0 = 70, X1 = 620, Y0 = 18, Y1 = 330;
    let view = "main";
    const gGrid = el("g", {}, chart), gLines = el("g", {}, chart), gTop = el("g", {}, chart);
    const yl = el("text", { x: 18, y: (Y0 + Y1) / 2, class: "axis-label", transform: `rotate(-90 18 ${(Y0 + Y1) / 2})`, "text-anchor": "middle", stroke: "none" }, chart);
    el("text", { x: (X0 + X1) / 2, y: 408, class: "axis-label", "text-anchor": "middle", stroke: "none" }, chart).textContent = "Aspect ratio d / L";
    el("text", { x: X0, y: 408, class: "tick", stroke: "none" }, chart).textContent = "◀ deeper – narrower";
    el("text", { x: X1, y: 408, class: "tick", "text-anchor": "end", stroke: "none" }, chart).textContent = "shallower – wider ▶";

    const lines = {};
    ORDER.forEach(k => {
      lines[k] = {
        path: el("path", { class: "line", style: `stroke:${COLORS[k]}` }, gLines),
        dots: Array.from({ length: 7 }, () => el("circle", { class: "dot", r: 4, "stroke-width": 2, style: `fill:var(--surface);stroke:${COLORS[k]}` }, gLines)),
        label: el("text", { "font-size": 12.5, "font-weight": 600, stroke: "none", style: `fill:${COLORS[k]}` }, gTop),
      };
    });

    // two rows, in the legend order of Figure 2 in the paper
    const legend = document.querySelector("#legend");
    const ROWS = [["Pre-LN", "Sandwich-LN", "LNS", "DeepNorm", "KEEL"], ["Full AttnRes", "Block AttnRes", "HC", "mHC", "MoDA"]];
    const rowEls = ROWS.map(() => { const r = document.createElement("div"); r.className = "legend-row"; legend.appendChild(r); return r; });
    const chips = {};
    ROWS.flat().forEach(k => {
      const b = document.createElement("button");
      b.type = "button"; b.style.setProperty("--c", COLORS[k]);
      b.innerHTML = `<i></i>${k}`;
      b.addEventListener("click", () => { on[k] = !on[k]; render(); });
      rowEls[ROWS.findIndex(r => r.includes(k))].appendChild(b); chips[k] = b;
    });
    document.querySelectorAll(".view-switch button").forEach(b => b.addEventListener("click", () => {
      view = b.dataset.view;
      document.querySelectorAll(".view-switch button").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
      render();
    }));

    function niceStep(range) {
      for (const s of [0.01, 0.02, 0.025, 0.05, 0.1, 0.2]) if (range / s <= 7) return s;
      return 0.5;
    }
    function render() {
      const V = VIEWS[view];
      document.querySelector("#chart-title").textContent = V.title;
      yl.textContent = V.y;
      const xs = V.x.map(p => p[0]);
      const arMin = Math.min(...xs), arMax = Math.max(...xs);
      const all = Object.values(V.series).flat().map(p => p[1]);
      const lo = Math.min(...all), hi = Math.max(...all), step = niceStep(hi - lo);
      const yMin = Math.floor(lo / step + 1e-6) * step, yMax = Math.ceil(hi / step - 1e-6) * step;
      const lx = v => X0 + (Math.log(v) - Math.log(arMin)) / (Math.log(arMax) - Math.log(arMin)) * (X1 - X0);
      const ly = v => Y1 - (v - yMin) / (yMax - yMin) * (Y1 - Y0);

      gGrid.innerHTML = "";
      for (let v = yMin; v <= yMax + 1e-9; v += step) {
        el("line", { class: "grid", x1: X0 - 8, x2: X1 + 8, y1: ly(v), y2: ly(v) }, gGrid);
        el("text", { class: "tick", x: X0 - 16, y: ly(v) + 4, "text-anchor": "end", stroke: "none" }, gGrid).textContent = v.toFixed(step < 0.01 || step === 0.025 ? 3 : 2);
      }
      V.x.forEach(([ar, sub]) => {
        el("text", { class: "tick", x: lx(ar), y: Y1 + 26, "text-anchor": "middle", stroke: "none" }, gGrid).textContent = view === "backbone" ? String(ar) : ar.toFixed(1);
        if (sub) el("text", { class: "tick2", x: lx(ar), y: Y1 + 43, "text-anchor": "middle", stroke: "none" }, gGrid).textContent = sub;
      });

      const present = ORDER.filter(k => V.series[k]);
      const anyOn = present.some(k => on[k]);
      const labels = [];
      ORDER.forEach(k => {
        const L = lines[k], s = V.series[k];
        chips[k].hidden = !s;
        chips[k].setAttribute("aria-pressed", on[k] ? "true" : "false");
        if (!s) { L.path.style.opacity = 0; L.dots.forEach(d => d.style.opacity = 0); L.label.style.opacity = 0; return; }
        const pts = s.map(([ar, v]) => [lx(ar), ly(v)]);
        L.path.setAttribute("d", pts.map((p, j) => (j ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(""));
        L.path.style.opacity = on[k] || !anyOn ? 1 : 0.16;
        L.path.classList.toggle("on", !!on[k]);
        L.dots.forEach((d, j) => {
          if (j < pts.length) { d.setAttribute("cx", pts[j][0]); d.setAttribute("cy", pts[j][1]); d.style.opacity = on[k] ? 1 : 0; }
          else d.style.opacity = 0;
        });
        L.label.textContent = k;
        L.label.style.opacity = on[k] ? 1 : 0;
        if (on[k]) { const r = pts.reduce((a, b) => (b[0] > a[0] ? b : a)); labels.push({ L, x: r[0] + 12, y: r[1] + 4 }); }
      });
      gLines.append(...ORDER.filter(k => V.series[k] && on[k]).flatMap(k => [lines[k].path, ...lines[k].dots]));
      labels.sort((a, b) => a.y - b.y);
      for (let i = 1; i < labels.length; i++) if (labels[i].y - labels[i - 1].y < 15) labels[i].y = labels[i - 1].y + 15;
      labels.forEach(l => { l.L.label.setAttribute("x", l.x); l.L.label.setAttribute("y", l.y); });
    }
    render();
  }
})();
