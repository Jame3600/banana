/* PixelSoft HQ — pixel office where you (CEO) run a software company of AI agents.
   Fable = CTO, Opus = Assistant CTO, Gemini = Artist, plus 5 departments. */

"use strict";

/* ---------------------------------------------------------------- constants */
const U = 4;                 // logical pixel unit
const W = 264, H = 158;      // office grid (units)
const CORR_Y = 80;           // corridor walk line

const ROOMS = {
  "CEO OFFICE": { box: [6, 14, 46, 58],   paint: "#f2d696", floor: "#fdf5e4", tile: "#f9edd4", accent: "#c48024", dark: "#4a2c08", door: "bottom" },
  "CTO OFFICE": { box: [52, 14, 92, 58],  paint: "#d2ccf4", floor: "#f0effc", tile: "#e6e5f8", accent: "#534ab7", dark: "#26215c", door: "bottom" },
  "MEETING":    { box: [98, 14, 162, 58], paint: "#cec8f0", floor: "#eeedfc", tile: "#e4e2f8", accent: "#534ab7", dark: "#26215c", door: "bottom" },
  "ASST. CTO":  { box: [168, 14, 204, 58],paint: "#bce2d4", floor: "#eaf7f1", tile: "#dcf0e8", accent: "#0f6e56", dark: "#04342c", door: "bottom" },
  "CAFETERIA":  { box: [210, 14, 258, 58],paint: "#f4c6aa", floor: "#fcf1e7", tile: "#f8e9dd", accent: "#d85a30", dark: "#4a1b0c", door: "bottom" },
  "DESIGN":     { box: [6, 104, 52, 152], paint: "#f0c4d6", floor: "#fceef4", tile: "#f6e2ec", accent: "#d4537e", dark: "#4b1528", door: "top" },
  "FRONTEND":   { box: [58, 104, 104, 152], paint: "#bad6f0", floor: "#e8f2fc", tile: "#dae9f8", accent: "#378add", dark: "#042c53", door: "top" },
  "BACKEND":    { box: [110, 104, 156, 152], paint: "#b2e2ce", floor: "#e4f6ee", tile: "#d4efe5", accent: "#1d9e75", dark: "#04342c", door: "top" },
  "QA LAB":     { box: [162, 104, 208, 152], paint: "#f4d8aa", floor: "#fcf0dc", tile: "#f8e8ce", accent: "#ef9f27", dark: "#412402", door: "top" },
  "ART STUDIO": { box: [214, 104, 260, 152], paint: "#d8c4ee", floor: "#f6f0fc", tile: "#eee6f8", accent: "#9370db", dark: "#38245f", door: "top" },
};
const DEPTS = ["DESIGN", "FRONTEND", "BACKEND", "QA LAB", "ART STUDIO"];

const COLORS = {
  ceo:    { hair: "#302826", shirt: "#be3a34", tag: "#aa342e" },
  fable:  { hair: "#7c56a8", shirt: "#534ab7", tag: "#534ab7" },
  opus:   { hair: "#dad2c6", shirt: "#0f6e56", tag: "#0f6e56" },
  gemini: { hair: "#2464b4", shirt: "#9370db", tag: "#2c3e96" },
  system: { tag: "#605c68" },
  worker: [
    { hair: "#52341c", shirt: "#d4537e" },
    { hair: "#ecba46", shirt: "#378add" },
    { hair: "#282828", shirt: "#1d9e75" },
    { hair: "#b04824", shirt: "#ef9f27" },
    { hair: "#2464b4", shirt: "#9370db" },
  ],
};

const DESK = Object.fromEntries(DEPTS.map((n) => {
  const [x0, , x1, y1] = ROOMS[n].box;
  return [n, [((x0 + x1) >> 1) - 3, y1 - 28]];
}));
const SPOT = {
  ceoDesk: [23, 30], ctoDesk: [69, 30], opusDesk: [183, 30],
  meetCeo: [116, 30], meetCto: [140, 30],
  cafeCeo: [215, 28], cafeCto: [242, 28], cafeOpus: [230, 45],
  cafeWorkers: [[212, 45], [221, 45], [236, 45], [245, 45], [227, 31]],
};

/* ------------------------------------------------------------- draw helpers */
function doorX(name) { const [x0, , x1] = ROOMS[name].box; return ((x0 + x1) >> 1) - 3; }
function mixc(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const c = [16, 8, 0].map((s) => {
    const va = (pa >> s) & 255, vb = (pb >> s) & 255;
    return Math.round(va + (vb - va) * t);
  });
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
function P(d, x, y, w, h, c) { d.fillStyle = c; d.fillRect(x * U, y * U, w * U, h * U); }

function drawBookshelf(d, x, y, rnd) {
  P(d, x, y, 9, 12, "#704a2c"); P(d, x + 1, y + 1, 7, 10, "#543620");
  const cs = ["#d4537e", "#378add", "#1d9e75", "#ef9f27", "#9370db", "#e2e2e2"];
  for (let r = 0; r < 3; r++) {
    let bx = x + 1;
    while (bx < x + 8) { const bw = rnd() < 0.34 ? 2 : 1; P(d, bx, y + 2 + r * 3, bw, 2, cs[(rnd() * cs.length) | 0]); bx += bw; }
  }
  P(d, x, y + 12, 9, 1, "#3c2616");
}
function drawPlant(d, x, y) {
  P(d, x + 1, y + 4, 4, 3, "#b06038"); P(d, x + 1, y + 4, 4, 1, "#c8784c");
  P(d, x, y, 6, 4, "#2e7a3e"); P(d, x + 1, y, 2, 2, "#54a85e"); P(d, x + 4, y + 1, 2, 2, "#54a85e");
}
function drawDesk(d, x, y, w) {
  P(d, x + 1, y + 5, w, 1, "#603e22");
  P(d, x, y, w, 5, "#96693c"); P(d, x, y, w, 1, "#c49664"); P(d, x + 1, y + 1, w - 2, 1, "#aa7a4c");
}
function drawChair(d, x, y) { P(d, x, y, 4, 2, "#3a3a48"); P(d, x, y - 1, 4, 1, "#525264"); }
function drawMonitor(d, x, y) { P(d, x, y, 4, 3, "#282830"); P(d, x + 1, y + 3, 2, 1, "#3c3c46"); }
function drawRug(d, x, y, w, h, base, dot) {
  P(d, x, y, w, h, base); P(d, x, y, w, 1, mixc(base, "#000000", 0.25)); P(d, x, y + h - 1, w, 1, mixc(base, "#000000", 0.25));
  for (let xx = x + 2; xx < x + w - 2; xx += 3) P(d, xx, y + ((h / 2) | 0), 1, 1, dot);
}
function drawTrophy(d, x, y) {
  P(d, x + 1, y, 3, 2, "#fad046"); P(d, x, y, 1, 1, "#fad046"); P(d, x + 4, y, 1, 1, "#fad046");
  P(d, x + 2, y + 2, 1, 1, "#d6a428"); P(d, x + 1, y + 3, 3, 1, "#96693c");
}
function drawWhiteboard(d, x, y) {
  P(d, x, y, 16, 8, "#f8f8fa"); P(d, x, y, 16, 1, "#c8c8ce"); P(d, x, y + 7, 16, 1, "#aaaab2");
  P(d, x + 1, y + 2, 9, 1, "#534ab7"); P(d, x + 1, y + 4, 6, 1, "#d4537e");
  P(d, x + 8, y + 4, 5, 1, "#1d9e75"); P(d, x + 1, y + 6, 11, 1, "#787882");
}
function drawEasel(d, x, y) {
  P(d, x + 1, y + 7, 2, 3, "#704a2c"); P(d, x + 6, y + 7, 2, 3, "#704a2c");
  P(d, x, y, 9, 7, "#f8f8fa"); P(d, x, y, 9, 1, "#d2d2d8");
  P(d, x + 1, y + 2, 3, 2, "#378add"); P(d, x + 5, y + 1, 2, 2, "#ef9f27");
  P(d, x + 2, y + 4, 5, 1, "#1d9e75"); P(d, x + 6, y + 4, 2, 2, "#d4537e");
}
function drawVending(d, x, y) {
  P(d, x, y, 6, 10, "#4660aa"); P(d, x, y, 6, 1, "#6e8cd2"); P(d, x + 1, y + 1, 3, 7, "#1c2234");
  const cc = ["#e25a48", "#ef9f27", "#54a85e"];
  for (let r = 0; r < 3; r++) for (let i = 0; i < 3; i++) P(d, x + 1 + i, y + 1 + r * 2, 1, 1, cc[i]);
  P(d, x + 4, y + 2, 1, 4, "#a0b4dc");
}
function drawCafeTable(d, x, y) {
  P(d, x + 1, y + 4, 6, 1, "#603e22"); P(d, x, y, 8, 4, "#a87644"); P(d, x, y, 8, 1, "#d0a06c");
  P(d, x - 2, y + 1, 2, 2, "#3a3a48"); P(d, x + 8, y + 1, 2, 2, "#3a3a48");
}
function drawCoffeeMachine(d, x, y) {
  P(d, x, y, 6, 8, "#46464e"); P(d, x, y, 6, 1, "#64646e"); P(d, x + 1, y + 2, 4, 2, "#1e1e24");
  P(d, x + 4, y + 1, 1, 1, "#e25a48"); P(d, x + 2, y + 6, 2, 2, "#eeeeee");
}

/* mulberry32 — deterministic decoration */
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ----------------------------------------------------------- background art */
function buildBackground() {
  const cv = document.createElement("canvas");
  cv.width = W * U; cv.height = H * U;
  const d = cv.getContext("2d");
  const rnd = rng(11);

  for (let yy = 0; yy < H; yy += 3) {
    P(d, 0, yy, W, 3, (yy / 3 | 0) % 2 ? "#bb9a6c" : "#c7a678");
    for (let xx = (yy * 7) % 20; xx < W; xx += 20) P(d, xx, yy, 1, 3, "#987a54");
  }
  for (let i = 0; i < 260; i++) P(d, (rnd() * W) | 0, (rnd() * H) | 0, 1, 1, "#ab8a60");

  P(d, 0, 0, W, 10, "#684a34"); P(d, 0, 0, W, 1, "#7e614a"); P(d, 0, 9, W, 1, "#463024");
  P(d, 0, 0, 2, H, "#463024"); P(d, W - 2, 0, 2, H, "#463024"); P(d, 0, 154, W, 4, "#463024");
  for (let wx = 14; wx < W - 20; wx += 34) {
    P(d, wx, 2, 10, 6, "#96c4e8"); P(d, wx, 2, 10, 1, "#c4e2f6");
    P(d, wx, 2, 1, 6, "#604632"); P(d, wx + 9, 2, 1, 6, "#604632"); P(d, wx + 4, 2, 1, 6, "#604632");
  }

  drawRug(d, 10, 78, W - 20, 10, "#b24a3e", "#d4866e");

  for (const name of Object.keys(ROOMS)) {
    const r = ROOMS[name], [x0, y0, x1, y1] = r.box;
    P(d, x0 - 2, y0 - 2, x1 - x0 + 4, y1 - y0 + 4, "#463024");
    P(d, x0 - 1, y0 - 1, x1 - x0 + 2, 1, "#5c4434");
    P(d, x0, y0, x1 - x0, y1 - y0, r.floor);
    P(d, x0, y0, x1 - x0, 4, r.paint); P(d, x0, y0 + 3, x1 - x0, 1, mixc(r.paint, "#000000", 0.2));
    for (let yy = y0 + 6; yy < y1; yy += 4) for (let xx = x0; xx < x1; xx += 4)
      if (((xx >> 2) + (yy >> 2)) % 2 === 0) P(d, xx, yy, 4, 4, r.tile);
    const dx = doorX(name);
    if (r.door === "bottom") { P(d, dx - 1, y1, 8, 2, r.floor); P(d, dx - 1, y1 + 1, 8, 1, mixc(r.floor, "#000000", 0.12)); }
    else P(d, dx - 1, y0 - 2, 8, 2, r.floor);
    d.fillStyle = r.dark; d.font = "bold 12px monospace"; d.fillText(name, x0 * U + 8, y0 * U + 12);
  }

  const co = ROOMS["CEO OFFICE"].box;
  drawDesk(d, co[0] + 8, co[3] - 20, co[2] - co[0] - 16); drawChair(d, ((co[0] + co[2]) >> 1) - 2, co[3] - 13);
  drawMonitor(d, co[0] + 11, co[3] - 24); drawTrophy(d, co[2] - 12, co[1] + 8); drawPlant(d, co[0] + 3, co[1] + 8);
  drawRug(d, co[0] + 6, co[3] - 10, co[2] - co[0] - 12, 5, "#e2b25e", "#c48024");

  const ct = ROOMS["CTO OFFICE"].box;
  drawDesk(d, ct[0] + 8, ct[3] - 20, ct[2] - ct[0] - 16); drawChair(d, ((ct[0] + ct[2]) >> 1) - 2, ct[3] - 13);
  drawMonitor(d, ct[0] + 11, ct[3] - 24); drawMonitor(d, ct[2] - 15, ct[3] - 24);
  drawBookshelf(d, ct[0] + 3, ct[1] + 8, rnd); drawPlant(d, ct[2] - 9, ct[1] + 8);
  drawRug(d, ct[0] + 6, ct[3] - 10, ct[2] - ct[0] - 12, 5, "#c8c4f0", "#534ab7");

  const ao = ROOMS["ASST. CTO"].box;
  drawDesk(d, ao[0] + 6, ao[3] - 20, ao[2] - ao[0] - 12); drawChair(d, ((ao[0] + ao[2]) >> 1) - 2, ao[3] - 13);
  drawMonitor(d, ao[0] + 9, ao[3] - 24);
  P(d, ao[0] + 4, ao[1] + 8, 6, 8, "#f6f6f8"); P(d, ao[0] + 5, ao[1] + 10, 4, 1, "#787882");
  P(d, ao[0] + 5, ao[1] + 12, 4, 1, "#787882"); P(d, ao[0] + 5, ao[1] + 14, 3, 1, "#1d9e75");
  drawPlant(d, ao[2] - 9, ao[1] + 8);
  drawRug(d, ao[0] + 5, ao[3] - 10, ao[2] - ao[0] - 10, 5, "#bee6d6", "#0f6e56");

  const m = ROOMS["MEETING"].box, mc = (m[0] + m[2]) >> 1;
  drawWhiteboard(d, m[0] + 3, m[1] + 6);
  P(d, mc - 11, m[3] - 17, 23, 1, "#603e22"); P(d, mc - 11, m[3] - 24, 22, 7, "#96693c");
  P(d, mc - 11, m[3] - 24, 22, 1, "#c89a66"); P(d, mc - 9, m[3] - 22, 18, 3, "#b08050");
  P(d, mc - 15, m[3] - 22, 3, 4, "#3a3a48"); P(d, mc + 12, m[3] - 22, 3, 4, "#3a3a48");
  drawPlant(d, m[2] - 10, m[1] + 7);
  /* dashboard screen on the meeting room wall */
  P(d, m[0] + 24, m[1] + 6, 14, 8, "#1a1c2c"); P(d, m[0] + 24, m[1] + 6, 14, 1, "#4a4870");
  P(d, m[0] + 25, m[1] + 8, 12, 1, "#ef9f27"); P(d, m[0] + 25, m[1] + 10, 8, 1, "#1d9e75"); P(d, m[0] + 25, m[1] + 12, 10, 1, "#378add");

  const cf = ROOMS["CAFETERIA"].box;
  P(d, cf[0] + 2, cf[1] + 9, 16, 5, "#96693c"); P(d, cf[0] + 2, cf[1] + 9, 16, 1, "#c49664");
  P(d, cf[0] + 4, cf[1] + 10, 2, 2, "#f0f0f4"); P(d, cf[0] + 8, cf[1] + 10, 2, 2, "#f0f0f4"); P(d, cf[0] + 12, cf[1] + 10, 2, 2, "#f0f0f4");
  drawCoffeeMachine(d, cf[0] + 26, cf[1] + 5); drawVending(d, cf[2] - 9, cf[1] + 5);
  drawCafeTable(d, cf[0] + 5, 38); drawCafeTable(d, cf[0] + 29, 38);

  DEPTS.forEach((name, i) => {
    const r = ROOMS[name], [x0, y0, x1, y1] = r.box;
    drawRug(d, x0 + 4, y1 - 7, x1 - x0 - 8, 4, mixc(r.accent, "#ffffff", 0.55), r.accent);
    if (name === "ART STUDIO") {
      drawEasel(d, ((x0 + x1) >> 1) - 4, y1 - 18);
      P(d, x0 + 3, y1 - 13, 6, 3, "#96693c");
      ["#e25a48", "#ef9f27", "#54a85e", "#378add"].forEach((c, ci) => P(d, x0 + 4 + ci, y1 - 12, 1, 1, c));
      drawPlant(d, x1 - 9, y0 + 10);
      P(d, x0 + 3, y0 + 10, 7, 5, "#fafafc"); P(d, x0 + 4, y0 + 11, 2, 2, "#ef9f27"); P(d, x0 + 7, y0 + 12, 2, 2, "#378add");
    } else {
      drawDesk(d, x0 + 5, y1 - 16, x1 - x0 - 12); drawChair(d, ((x0 + x1) >> 1) - 2, y1 - 9);
      drawMonitor(d, x0 + 7, y1 - 20); drawMonitor(d, x1 - 13, y1 - 20);
      if (i % 2 === 0) { drawBookshelf(d, x0 + 2, y0 + 10, rnd); drawPlant(d, x1 - 9, y0 + 10); }
      else { drawBookshelf(d, x1 - 11, y0 + 10, rnd); drawPlant(d, x0 + 3, y0 + 10); }
    }
  });

  P(d, 8, 64, 5, 1, "#e0e4e8"); P(d, 8, 68, 5, 6, "#e0e4e8"); P(d, 9, 64, 3, 4, "#78b4e6");
  drawPlant(d, 4, 94); drawPlant(d, W - 10, 94); drawPlant(d, 56, 63); drawPlant(d, 150, 63);

  /* HQ sign */
  d.font = "bold 17px monospace";
  const tw = d.measureText("PIXELSOFT  HQ").width, sx = (W * U) / 2 - tw / 2;
  d.fillStyle = "#342218"; d.fillRect(sx - 14, 5, tw + 28, 28);
  d.strokeStyle = "#e0c48c"; d.lineWidth = 2; d.strokeRect(sx - 14, 5, tw + 28, 28);
  d.fillStyle = "#f4dea8"; d.fillText("PIXELSOFT  HQ", sx, 25);
  return cv;
}

/* ------------------------------------------------------------- characters */
class Char {
  constructor(id, pos, col, opts = {}) {
    this.id = id; this.x = pos[0]; this.y = pos[1];
    this.col = col; this.boss = !!opts.boss; this.artist = !!opts.artist; this.aide = !!opts.aide;
    this.path = null; this.seg = 0; this.step = 0; this.onArrive = null;
    this.bubble = null; this.bubbleTtl = 0; this.home = pos.slice();
  }
  walkTo(fromRoom, toRoom, target, onArrive) {
    const pts = [[this.x, this.y]];
    if (fromRoom) { const dx = doorX(fromRoom); pts.push([dx, this.y], [dx, CORR_Y]); }
    else pts.push([this.x, CORR_Y]);
    if (toRoom) { const dx = doorX(toRoom); pts.push([dx, CORR_Y], [dx, target[1]], target); }
    else pts.push([target[0], CORR_Y], target);
    this.path = pts; this.seg = 0; this.onArrive = onArrive || null;
  }
  say(text, ttl = 2600) { this.bubble = text; this.bubbleTtl = ttl; }
  update(dt) {
    if (this.bubbleTtl > 0) { this.bubbleTtl -= dt; if (this.bubbleTtl <= 0) this.bubble = null; }
    if (!this.path) return;
    const speed = 42 * (dt / 1000); // units per second
    let remain = speed;
    while (remain > 0 && this.path) {
      const t = this.path[this.seg + 1];
      if (!t) { this.path = null; const cb = this.onArrive; this.onArrive = null; if (cb) cb(); break; }
      const dx = t[0] - this.x, dy = t[1] - this.y, dist = Math.abs(dx) + Math.abs(dy);
      if (dist <= remain) { this.x = t[0]; this.y = t[1]; this.seg++; remain -= dist; }
      else {
        if (Math.abs(dx) > 0.01) this.x += Math.sign(dx) * Math.min(remain, Math.abs(dx));
        else this.y += Math.sign(dy) * Math.min(remain, Math.abs(dy));
        remain = 0;
      }
      this.step += speed * 2;
    }
  }
  draw(d, t) {
    const x = Math.round(this.x), y = Math.round(this.y);
    const walking = !!this.path;
    const st = walking ? (this.step | 0) : ((t / 400) | 0);
    P(d, x, y + 10, 6, 1, "#847054");
    const { hair, shirt } = this.col;
    P(d, x + 1, y, 4, 2, hair); P(d, x + 1, y, 2, 1, mixc(hair, "#ffffff", 0.3));
    if (this.artist) { P(d, x, y - 1, 5, 1, "#2c3e96"); P(d, x + 4, y, 2, 1, "#2c3e96"); P(d, x + 2, y - 2, 1, 1, "#2c3e96"); }
    P(d, x + 1, y + 2, 4, 2, "#f7d6b6"); P(d, x + 1, y + 2, 1, 1, hair);
    P(d, x + 2, y + 3, 1, 1, "#281e1e"); P(d, x + 4, y + 3, 1, 1, "#281e1e");
    P(d, x, y + 4, 6, 3, shirt); P(d, x, y + 6, 6, 1, mixc(shirt, "#000000", 0.3));
    if (this.boss) { P(d, x + 2, y + 4, 2, 3, "#f0f0f4"); P(d, x + 2, y + 4, 2, 1, "#c83c3c"); }
    P(d, x + 1, y + 7, 4, 2, "#36364a");
    if (st % 2 === 0) { P(d, x + 1, y + 9, 2, 1, "#22222c"); P(d, x + 3, y + 9, 2, 1, "#22222c"); }
    else { P(d, x, y + 9, 2, 1, "#22222c"); P(d, x + 4, y + 9, 2, 1, "#22222c"); }
    if (this.aide) { P(d, x + 6, y + 4, 2, 3, "#f6f6f8"); P(d, x + 6, y + 4, 2, 1, "#b4b4bc"); }
  }
  drawBubble(d) {
    if (!this.bubble) return;
    d.font = "bold 12px monospace";
    const tw = d.measureText(this.bubble).width;
    const cx = (this.x + 3) * U, top = this.y * U;
    let x0 = cx - tw / 2 - 8, x1 = cx + tw / 2 + 8;
    const shift = x0 < 4 ? 4 - x0 : x1 > W * U - 4 ? W * U - 4 - x1 : 0;
    x0 += shift; x1 += shift;
    const y0 = top - 30, y1 = top - 6;
    d.fillStyle = "#5a4632"; r(d, x0 + 2, y0 + 3, x1 - x0, y1 - y0, 7); d.fill();
    d.fillStyle = "#fffffc"; r(d, x0, y0, x1 - x0, y1 - y0, 7); d.fill();
    d.strokeStyle = "#34281e"; d.lineWidth = 2; r(d, x0, y0, x1 - x0, y1 - y0, 7); d.stroke();
    d.beginPath(); d.moveTo(cx - 5, y1 - 1); d.lineTo(cx + 5, y1 - 1); d.lineTo(cx, y1 + 7); d.closePath();
    d.fillStyle = "#fffffc"; d.fill(); d.stroke();
    d.fillStyle = "#28201a"; d.fillText(this.bubble, (x0 + x1) / 2 - tw / 2, y0 + 16);
  }
}
function r(d, x, y, w, h, rad) {
  d.beginPath();
  d.moveTo(x + rad, y); d.arcTo(x + w, y, x + w, y + h, rad); d.arcTo(x + w, y + h, x, y + h, rad);
  d.arcTo(x, y + h, x, y, rad); d.arcTo(x, y, x + w, y, rad); d.closePath();
}

/* ------------------------------------------------------------------ state */
const G = {
  bg: null, canvas: null, ctx: null, last: 0,
  chars: {}, workers: [],
  model: "fable",
  usage: { used: 0, budget: 200000, by_dept: {}, resets_in: null },
  onBreak: false, paused: false,
  project: null, // {id, tasks:{dept:{progress,status,summary}}}
  confetti: null,
  server: true, // backend reachable?
};

function initChars() {
  G.chars.ceo    = new Char("ceo", SPOT.ceoDesk, COLORS.ceo, { boss: true });
  G.chars.fable  = new Char("fable", SPOT.ctoDesk, COLORS.fable);
  G.chars.opus   = new Char("opus", SPOT.opusDesk, COLORS.opus, { aide: true });
  G.workers = COLORS.worker.map((c, i) => {
    const w = new Char("w" + i, [112 + (i % 3) * 13, 64 + ((i / 3) | 0) * 8], c, { artist: i === 4 });
    w.hidden = true; return w;
  });
}

/* ------------------------------------------------------------------- UI */
const $ = (id) => document.getElementById(id);
function setDialog(who, text, color) {
  $("dlg-name").textContent = who;
  $("dlg-name").style.background = color || "#605c68";
  $("dlg-text").textContent = text;
  const log = $("log-body");
  const row = document.createElement("div");
  row.innerHTML = `<b style="color:${color || "#aaa"}">${who}:</b> ${escapeHtml(text)}`;
  log.appendChild(row); log.scrollTop = log.scrollHeight;
}
function escapeHtml(s) { const e = document.createElement("span"); e.textContent = s; return e.innerHTML; }
function sysMsg(t) { setDialog("SYSTEM", t, COLORS.system.tag); }

/* --------------------------------------------------------------- backend */
async function api(path, body) {
  try {
    const res = await fetch(path, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : undefined);
    if (!res.ok) throw new Error("http " + res.status);
    G.server = true;
    return await res.json();
  } catch (e) { G.server = false; return null; }
}
/* demo fallbacks when no backend (opening index.html directly) */
const DEMO = {
  chat(to, text) {
    const t = text.toLowerCase();
    if (to === "opus") return "On it, boss — quick task handled! (demo mode: run server.py for real agents)";
    if (t.includes("hello") || t.includes("hi")) return "Hello CEO! Ready when you are. Try: /project build a robot control app";
    return "Noted! Say '/project <your idea>' and I'll split it across the departments. (demo mode)";
  },
  tokens(s) { return Math.ceil(s.length / 3) + 40; },
};

/* ------------------------------------------------------------- commands */
function currentTalker() { return G.model === "opus" ? "opus" : "fable"; }

async function handleInput(raw) {
  const text = raw.trim();
  if (!text) return;
  if (text.startsWith("/")) return handleCommand(text);
  await talkTo(currentTalker(), text);
}

async function handleCommand(text) {
  const [cmd, ...rest] = text.slice(1).split(/\s+/);
  const arg = rest.join(" ");
  switch (cmd.toLowerCase()) {
    case "help":
      sysMsg("Commands: /project <idea> · /model fable|opus · /usage · /pause · /resume · /reset · /help");
      break;
    case "model": {
      const m = (arg || "").toLowerCase();
      if (!["fable", "opus"].includes(m)) { sysMsg("Usage: /model fable | opus"); return; }
      G.model = m; await api("/api/model", { model: m });
      sysMsg(m === "opus" ? "Now talking to OPUS (Asst. CTO) — quick tasks." : "Now talking to FABLE (CTO).");
      updateDashboard();
      break;
    }
    case "usage":
      G.chars.ceo.walkTo(roomOf(G.chars.ceo), "MEETING", SPOT.meetCeo, () => { openDashboard(); });
      sysMsg("Walking to the meeting room to check the token dashboard…");
      refreshUsage();
      break;
    case "project":
      if (!arg) { sysMsg("Usage: /project <your idea>"); return; }
      await startProject(arg);
      break;
    case "pause": await api("/api/pause", {}); G.paused = true; sysMsg("Agents paused."); break;
    case "resume": endBreak(); break;
    case "reset": location.reload(); break;
    default: sysMsg("Unknown command. Try /help");
  }
}

function roomOf(ch) {
  for (const [name, r] of Object.entries(ROOMS)) {
    const [x0, y0, x1, y1] = r.box;
    if (ch.x >= x0 && ch.x <= x1 && ch.y >= y0 && ch.y <= y1) return name;
  }
  return null;
}

async function talkTo(who, text) {
  const target = who === "opus" ? { room: "ASST. CTO", ceo: [175, 32], npc: G.chars.opus }
                                : { room: "MEETING", ceo: SPOT.meetCeo, npc: G.chars.fable };
  setDialog("CEO  (YOU)", text, COLORS.ceo.tag);
  if (who === "fable" && roomOf(G.chars.fable) !== "MEETING")
    G.chars.fable.walkTo(roomOf(G.chars.fable), "MEETING", SPOT.meetCto);
  G.chars.ceo.walkTo(roomOf(G.chars.ceo), target.room, target.ceo, async () => {
    G.chars.ceo.say("…");
    const res = await api("/api/chat", { to: who, text });
    const reply = res ? res.reply : DEMO.chat(who, text);
    if (res) applyUsage(res.usage); else localSpend(DEMO.tokens(text + "x"), who === "opus" ? "ASST. CTO" : "MEETING");
    target.npc.say(reply.length > 34 ? reply.slice(0, 32) + "…" : reply);
    setDialog(who === "opus" ? "OPUS  (ASST. CTO)" : "FABLE  (CTO)", reply, COLORS[who].tag);
  });
}

/* -------------------------------------------------------------- projects */
async function startProject(idea) {
  if (G.project && !G.project.done) { sysMsg("A project is already running — let it finish first."); return; }
  setDialog("CEO  (YOU)", idea, COLORS.ceo.tag);
  G.chars.fable.walkTo(roomOf(G.chars.fable), "MEETING", SPOT.meetCto);
  G.chars.ceo.walkTo(roomOf(G.chars.ceo), "MEETING", SPOT.meetCeo, async () => {
    setDialog("FABLE  (CTO)", "Great idea, boss! Splitting it into 5 tasks…", COLORS.fable.tag);
    G.chars.fable.say("Splitting tasks!");
    const res = await api("/api/project", { idea });
    const id = res ? res.id : "demo";
    G.project = { id, idea, done: false, tasks: {} };
    DEPTS.forEach((d) => (G.project.tasks[d] = { progress: 0, status: "queued", summary: "" }));
    dispatchWorkers();
    if (!res) demoProgress();
    else pollProject();
  });
}

function dispatchWorkers() {
  G.workers.forEach((w, i) => {
    w.hidden = false;
    w.x = 112 + (i % 3) * 13; w.y = 64 + ((i / 3) | 0) * 8;
    setTimeout(() => w.walkTo(null, DEPTS[i], DESK[DEPTS[i]]), i * 350);
  });
  setDialog("FABLE  (CTO)", "Agents dispatched — Gemini will paint the art!", COLORS.fable.tag);
}

async function pollProject() {
  if (!G.project || G.project.done) return;
  const res = await api(`/api/project/${G.project.id}`);
  if (res) {
    Object.assign(G.project.tasks, res.tasks);
    applyUsage(res.usage);
    if (res.done) return finishProject();
  }
  setTimeout(pollProject, 1500);
}

function demoProgress() {
  const t = setInterval(() => {
    if (G.onBreak || G.paused) return;
    let allDone = true;
    DEPTS.forEach((d, i) => {
      const task = G.project.tasks[d];
      if (task.progress < 100) {
        task.progress = Math.min(100, task.progress + 2 + Math.random() * 4 - i * 0.3);
        task.status = "working";
        localSpend(60 + Math.random() * 40, d);
        if (task.progress >= 100) { task.status = "done"; task.summary = d + " demo task complete"; }
      }
      if (task.progress < 100) allDone = false;
    });
    if (allDone) { clearInterval(t); finishProject(); }
  }, 400);
}

function finishProject() {
  if (!G.project || G.project.done) return;
  G.project.done = true;
  setDialog("FABLE  (CTO)", "Project shipped! Great teamwork, CEO! Check the Log for each department's report.", "#17805f");
  G.chars.fable.say("Shipped! 🎉");
  Object.entries(G.project.tasks).forEach(([d, t]) => { if (t.summary) setDialog(`AGENT · ${d}`, t.summary, ROOMS[d].accent); });
  G.confetti = { t: 0, bits: Array.from({ length: 60 }, () => [6 + Math.random() * (W - 12), 60 + Math.random() * 40, ["#d85a30", "#1d9e75", "#378add", "#ef9f27", "#d4537e", "#9370db"][(Math.random() * 6) | 0]]) };
  setTimeout(() => (G.confetti = null), 6000);
}

/* ---------------------------------------------------------------- tokens */
function localSpend(n, dept) {
  G.usage.used += n;
  G.usage.by_dept[dept] = (G.usage.by_dept[dept] || 0) + n;
  checkBudget(); updateDashboard();
}
function applyUsage(u) { if (!u) return; G.usage = Object.assign(G.usage, u); checkBudget(); updateDashboard(); }
async function refreshUsage() { const u = await api("/api/usage"); if (u) applyUsage(u); }

function checkBudget() {
  if (!G.onBreak && G.usage.used >= G.usage.budget) startBreak();
}
function startBreak() {
  G.onBreak = true;
  sysMsg("Token limit reached! Everyone — break time in the cafeteria ☕");
  banner("TOKEN LIMIT — BREAK TIME!", "#a32d2d");
  G.chars.ceo.walkTo(roomOf(G.chars.ceo), "CAFETERIA", SPOT.cafeCeo);
  G.chars.fable.walkTo(roomOf(G.chars.fable), "CAFETERIA", SPOT.cafeCto);
  G.chars.opus.walkTo(roomOf(G.chars.opus), "CAFETERIA", SPOT.cafeOpus);
  G.workers.forEach((w, i) => { if (!w.hidden) w.walkTo(roomOf(w), "CAFETERIA", SPOT.cafeWorkers[i]); });
  $("send").disabled = true;
  $("resume-hint").style.display = "block";
}
function endBreak() {
  if (!G.onBreak && !G.paused) { sysMsg("Nothing to resume — everyone is working!"); return; }
  G.onBreak = false; G.paused = false;
  G.usage.used = 0; G.usage.by_dept = {};
  api("/api/resume", {});
  sysMsg("Tokens restored — back to work!");
  banner("TOKENS RESET!", "#1d9e75");
  G.chars.ceo.walkTo("CAFETERIA", "CEO OFFICE", SPOT.ceoDesk);
  G.chars.fable.walkTo("CAFETERIA", "CTO OFFICE", SPOT.ctoDesk);
  G.chars.opus.walkTo("CAFETERIA", "ASST. CTO", SPOT.opusDesk);
  G.workers.forEach((w, i) => { if (!w.hidden) w.walkTo("CAFETERIA", DEPTS[i], DESK[DEPTS[i]]); });
  $("send").disabled = false;
  $("resume-hint").style.display = "none";
  updateDashboard();
}

let bannerState = null;
function banner(text, color) { bannerState = { text, color, ttl: 3500 }; }

/* ------------------------------------------------------------- dashboard */
function openDashboard() { $("dash").style.display = "flex"; updateDashboard(); }
function closeDashboard() { $("dash").style.display = "none"; }
function updateDashboard() {
  const pct = Math.min(100, Math.round((G.usage.used / G.usage.budget) * 100));
  $("dash-pct").textContent = pct + "%";
  $("dash-bar").style.width = pct + "%";
  $("dash-bar").style.background = pct > 85 ? "#e24b4a" : "#ef9f27";
  $("dash-nums").textContent = `${fmt(G.usage.used)} / ${fmt(G.usage.budget)} tokens` + (G.server ? "" : "  ·  demo mode (no server)");
  const rows = $("dash-depts"); rows.innerHTML = "";
  DEPTS.forEach((dname) => {
    const v = G.usage.by_dept[dname] || 0;
    const p = Math.min(100, Math.round((v / Math.max(1, G.usage.used)) * 100));
    rows.insertAdjacentHTML("beforeend",
      `<div class="drow"><span>${dname}</span><div class="dtrack"><div style="width:${p}%;background:${ROOMS[dname].accent}"></div></div><em style="color:${ROOMS[dname].accent}">${fmt(v)}</em></div>`);
  });
  document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("sel", c.dataset.m === G.model));
}
function fmt(n) { return n >= 1000 ? (n / 1000).toFixed(1) + "k" : Math.round(n); }

/* -------------------------------------------------------------- the loop */
function frame(t) {
  const dt = Math.min(50, t - (G.last || t)); G.last = t;
  const d = G.ctx;
  d.imageSmoothingEnabled = false;
  d.drawImage(G.bg, 0, 0);

  /* monitor glow */
  const lit = G.project && !G.project.done && !G.onBreak;
  DEPTS.forEach((n, i) => {
    if (n === "ART STUDIO") return;
    const [x0, , x1, y1] = ROOMS[n].box;
    const cols = ["#78dcff", "#96f0c8"];
    [x0 + 7, x1 - 13].forEach((sx, j) => P(d, sx + 1, y1 - 20, 2, 2, lit ? cols[(((t / 300) | 0) + i + j) % 2] : "#464e5a"));
  });

  /* progress bars */
  if (G.project) {
    DEPTS.forEach((n) => {
      const task = G.project.tasks[n]; if (!task) return;
      const r0 = ROOMS[n], [x0, y0, x1] = r0.box, bw = x1 - x0 - 14;
      P(d, x0 + 3, y0 + 6, bw, 3, "#ffffff");
      const fw = Math.max(1, Math.round((bw * task.progress) / 100));
      P(d, x0 + 3, y0 + 6, fw, 3, r0.accent);
      if (task.progress >= 100) { d.fillStyle = "#16803e"; d.font = "bold 16px monospace"; d.fillText("✓", (x1 - 9) * U, (y0 + 10) * U); }
    });
  }

  const everyone = [...G.workers.filter((w) => !w.hidden), G.chars.opus, G.chars.fable, G.chars.ceo];
  everyone.forEach((c) => c.update(dt));
  everyone.forEach((c) => c.draw(d, t));
  everyone.forEach((c) => c.drawBubble(d));

  /* coffee mugs during break */
  if (G.onBreak) everyone.forEach((c) => { if (roomOf(c) === "CAFETERIA" && !c.path) { P(d, Math.round(c.x) + 6, Math.round(c.y) + 4, 2, 2, "#f0f0f4"); P(d, Math.round(c.x) + 8, Math.round(c.y) + 4, 1, 1, "#c8c8d0"); } });

  if (G.confetti) {
    G.confetti.t += dt;
    G.confetti.bits.forEach(([x, y, c], i) => P(d, x, y + (((G.confetti.t / 80 + i) % 12) - 6), 1, 1, c));
  }
  if (bannerState) {
    bannerState.ttl -= dt; if (bannerState.ttl <= 0) bannerState = null;
    else if ((t / 400 | 0) % 3 !== 2) {
      d.font = "bold 26px monospace";
      const tw = d.measureText(bannerState.text).width, bx = (W * U) / 2 - tw / 2;
      d.fillStyle = "#281e16"; r(d, bx - 17, 263, tw + 34, 44, 9); d.fill();
      d.fillStyle = bannerState.color; r(d, bx - 20, 260, tw + 34, 44, 9); d.fill();
      d.strokeStyle = "#04342c"; d.lineWidth = 3; r(d, bx - 20, 260, tw + 34, 44, 9); d.stroke();
      d.fillStyle = "#fff"; d.fillText(bannerState.text, bx - 3, 290);
    }
  }
  requestAnimationFrame(frame);
}

/* ------------------------------------------------------------------ boot */
window.addEventListener("DOMContentLoaded", async () => {
  G.canvas = $("game"); G.ctx = G.canvas.getContext("2d");
  G.bg = buildBackground();
  initChars();
  sysMsg("Welcome to PixelSoft HQ, CEO! Type an idea, or /help for commands. Try: /project build a robot control web app");

  $("chat").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { const v = $("chat").value; $("chat").value = ""; handleInput(v); }
  });
  $("send").addEventListener("click", () => { const v = $("chat").value; $("chat").value = ""; handleInput(v); });
  $("dash-close").addEventListener("click", closeDashboard);
  $("btn-dash").addEventListener("click", openDashboard);
  $("btn-log").addEventListener("click", () => { const l = $("log"); l.style.display = l.style.display === "block" ? "none" : "block"; });
  $("dash-pause").addEventListener("click", () => handleCommand("/pause"));
  $("dash-cafe").addEventListener("click", () => { closeDashboard(); startBreak(); });
  $("dash-resume").addEventListener("click", () => { closeDashboard(); endBreak(); });
  document.querySelectorAll(".chip").forEach((c) => c.addEventListener("click", () => handleCommand("/model " + c.dataset.m)));
  $("resume-link").addEventListener("click", (e) => { e.preventDefault(); endBreak(); });

  await refreshUsage();
  if (!G.server) sysMsg("No backend found — running in DEMO mode. Start server.py for real agents.");
  setInterval(() => { if (G.server) refreshUsage(); }, 6000);
  requestAnimationFrame(frame);
});
