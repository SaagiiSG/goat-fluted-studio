// 15 Fluted Studio. Reads window.PLAN (goat.mjs writes it; look.mjs works out when each card flies into the fan and
// when each word comes and goes) and builds one paused GSAP timeline. The cards are in index.html already (look.mjs
// writes them there, as HyperFrames needs), each playing its own clip.
const P = window.PLAN, T = P.T, D = P.dur;
const $ = (s) => document.querySelector(s);
const tl = gsap.timeline({ paused: true });
const rng = GOAT.rng(15);
const EPS = 1e-6;

const FAN_Y = 1050; // the cards' bottom edge (look.css .card), the point each card turns about
const DROP = 392; // a card flies up from 60% of its height lower (preview)
const SLOT = [{ x: -228, r: -13 }, { x: 0, r: 0 }, { x: 228, r: 13 }]; // preview: translateX(-62%) rotate(-13deg), …
// Where the words sit. The opening title is centred on the safe box (y 270-1248): the headline's cap centre on y 748,
// the kicker and chip hugging it (they follow its fitted size, so a long, smaller headline doesn't leave gaps). In the
// fan the kicker's baseline sits above the cards, the headline's capitals start 35 px under them (its tails, Д Щ,
// stay above y 1248, so its largest size is 160 px; preview 170) and the chip sits on the cards' lower edge.
const TITLE_HEAD = 748, FAN = { kicker: 330, headTop: 1085, headMax: 160, chip: 1005 };

// The wall's light: the preview's beam stood still; here it drifts 160 px across the flutes over the whole video
// (the direction seeded) and its strength wanders between 75% and 100% every 1.2-2 s (seeded), so renders repeat.
const dir = rng() < 0.5 ? -1 : 1;
gsap.set("#beam", { x: -80 * dir, opacity: 1, force3D: false });
tl.fromTo("#beam", { x: -80 * dir }, { x: 80 * dir, duration: D, ease: "sine.inOut", immediateRender: false }, 0);
for (let t = 0, a = 1; t < D - EPS; ) {
  const len = Math.min(1.2 + rng() * 0.8, D - t), b = 0.75 + rng() * 0.25;
  tl.fromTo("#beam", { opacity: a }, { opacity: b, duration: len, ease: "sine.inOut", immediateRender: false }, t);
  t += len;
  a = b;
}

// The opening title drifts up 14 px while it holds (no scale: the headline already fills the safe width).
if (P.intro > 0) tl.fromTo("#title", { y: 0 }, { y: -14, duration: P.intro, ease: "sine.inOut", immediateRender: false }, 0);

// Each card flies up from 392 px lower, fading in over its first 0.25 s, and fans out to its slot while it rises
// (y on power3.out, the turn and the spread on back.out, so the fan settles with a little give). A card in the fan on
// frame 0 is simply there. Once a later card has landed on it, it is hidden (its video has ended there too).
for (const c of P.cards) {
  const el = document.getElementById(`card-${c.i}`), s = SLOT[c.slot];
  el.style.zIndex = String(c.slot === 1 ? 100 + c.i : c.i); // the centre card on top; a later card over the one it covers
  if (c.land < EPS) gsap.set(el, { x: s.x, y: 0, rotation: s.r, opacity: 1, force3D: false });
  else {
    gsap.set(el, { x: 0, y: DROP, rotation: 0, opacity: 0, force3D: false });
    tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power1.out", immediateRender: false }, c.land);
    tl.fromTo(el, { y: DROP }, { y: 0, duration: T.FLY, ease: "power3.out", immediateRender: false }, c.land);
    tl.fromTo(el, { x: 0, rotation: 0 }, { x: s.x, rotation: s.r, duration: T.FLY, ease: "back.out(1.4)", immediateRender: false }, c.land);
  }
  if (c.until < D - EPS) tl.set(el, { visibility: "hidden" }, c.until);
}
// The fan pushes in 1.5% from the first card to the end, about the cards' bottom edge (slow, so it never fights a
// fly-up; small, so the side cards' tops stay clear of the kicker).
if (P.cards.length) {
  const t0 = P.cards[0].land;
  gsap.set("#fan", { transformOrigin: `540px ${FAN_Y}px`, force3D: false });
  tl.fromTo("#fan", { scale: 1 }, { scale: 1.015, duration: D - t0, ease: "none", immediateRender: false }, t0);
}

// The words. Each comes in over 0.6 s and goes out over 0.3 s (eased at both ends, so the change is spread over it;
// look.mjs keeps both clear of every fly-up); one up on frame 0 is already there, one that runs to the end stays.
const HIDDEN = {
  kicker: { opacity: 0, y: 18, filter: "blur(8px)" },
  headline: { clipPath: "inset(0% 0% 100% 0%)", y: 30 }, // revealed from the top down while it rises 30 px (preview)
  chip: { opacity: 0, scale: 0.85 },
};
const SHOWN = {
  kicker: { opacity: 1, y: 0, filter: "blur(0px)" },
  headline: { clipPath: "inset(0% 0% 0% 0%)", y: 0 },
  chip: { opacity: 1, scale: 1 },
};
const EASE_IN = { kicker: "power3.out", headline: "power3.out", chip: "back.out(1.7)" };
const GONE = {
  kicker: { opacity: 0, y: -14, filter: "blur(6px)" },
  headline: { clipPath: "inset(0% 0% 100% 0%)", y: -24 }, // wiped away upwards, the way it came
  chip: { opacity: 0, scale: 0.92 },
};

const words = P.items.map((it) => {
  const el = document.createElement("div");
  el.className = it.role;
  if (it.role === "chip") {
    const dot = el.appendChild(document.createElement("i"));
    dot.className = "dot";
    dot.appendChild(document.createElement("b")).className = "halo";
    el.appendChild(document.createElement("span")).textContent = it.text;
  } else el.textContent = it.text;
  (it.mode === "title" ? $("#title") : $("#over")).appendChild(el);
  gsap.set(el, { xPercent: -50, ...(it.role === "chip" ? { yPercent: -50 } : {}), force3D: false });

  const up = it.start < EPS, r = it.role, last = it.stays ? it.end : it.end - T.OUT;
  gsap.set(el, up ? SHOWN[r] : HIDDEN[r]);
  if (!up) tl.fromTo(el, HIDDEN[r], { ...SHOWN[r], duration: T.IN, ease: EASE_IN[r], immediateRender: false }, it.start);
  if (!it.stays) tl.fromTo(el, SHOWN[r], { ...GONE[r], duration: T.OUT, ease: "power2.inOut", immediateRender: false }, last);

  if (r === "headline") { // a sheen of light sweeps across the silver once it is up, if there is time before it goes
    const at = up ? 0.35 : it.start + T.IN;
    if (at + 1.1 <= last + EPS)
      tl.fromTo(el, { "--sheen": "100%" }, { "--sheen": "0%", duration: 1.1, ease: "sine.inOut", immediateRender: false }, at);
  }
  if (r === "chip") { // the dot pops in after the chip, then its glow breathes once a second (v1) while the chip is up
    const dot = el.querySelector(".dot"), halo = el.querySelector(".halo");
    if (!up) {
      gsap.set(dot, { scale: 0 });
      tl.fromTo(dot, { scale: 0 }, { scale: 1, duration: 0.4, ease: "back.out(3)", immediateRender: false }, it.start + 0.15);
    }
    const b0 = up ? 0 : it.start + T.IN, n = Math.floor((last - b0) / 0.5 + EPS);
    gsap.set(halo, { opacity: 0.35, scale: 0.8 });
    if (n >= 1)
      tl.fromTo(halo, { opacity: 0.35, scale: 0.8 }, { opacity: 1, scale: 1.25, duration: 0.5, ease: "sine.inOut", repeat: n - 1,
        yoyo: true, immediateRender: false }, b0);
  }
  return { it, el };
});

tl.set({}, {}, D);
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;

// Sizes need the real fonts; the renderer waits for document.fonts.ready before the first frame. Each word fits the
// 840 px safe width, down to the floors look.mjs's row limits are measured at (kicker 44 px, headline 78, chip 28).
// Headline (Oswald: ascent 1.193, descent 0.289, capitals 0.81 em, Й Ё up to 1.042 em, tails 0.16 em): with line-height
// 1 and 0.3 em padding, its capitals start 0.442 em below the box's top. Kicker (Cormorant: ascent 0.924, descent
// 0.287): at line-height 1 its baseline is 0.8185 em below the box's top. Chip: centred on its y (yPercent -50).
function layout() {
  const size = new Map();
  for (const { it, el } of words)
    if (it.role === "headline") size.set(el, GOAT.fit(el, 840, it.mode === "title" ? 230 : FAN.headMax, 78));
  const first = words.find((w) => w.it.mode === "title" && w.it.role === "headline");
  const S = first ? size.get(first.el) : 230, capTop = TITLE_HEAD - 0.405 * S;
  for (const { it, el } of words) {
    const title = it.mode === "title";
    if (it.role === "headline") {
      const s = size.get(el);
      el.style.top = `${(title ? TITLE_HEAD - 0.405 * s : FAN.headTop) - 0.442 * s}px`;
    } else if (it.role === "kicker") { // its descenders clear the headline's accents by 24 px
      const k = GOAT.fit(el, 840, 68, 44);
      el.style.top = `${(title ? capTop - 0.232 * S - 24 : FAN.kicker) - 0.8185 * k}px`;
    } else { // the chip's top clears the headline's tails by about 22 px
      GOAT.fit(el, 840, 36, 28);
      el.style.top = `${title ? capTop + 0.97 * S + 62 : FAN.chip}px`;
    }
  }
}
layout();
document.fonts.ready.then(layout);
