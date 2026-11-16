// 15 Fluted Studio: a dark ribbed (fluted) studio wall with a diagonal beam of light that drifts slowly across it.
// The video opens on a title: a Cormorant Garamond italic kicker over a huge silver Oswald headline (it reveals from
// the top down while rising 30 px) and a dark chip with a breathing blue dot. Then each clip flies up into a fan of
// three cards (±228 px, ±13°, turning about the card's bottom centre); a card keeps its clip's last frame once the
// clip ends. Each clip is its own file (PER_CLIP), so every card plays its own footage.
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { missing } from "./scripts/fonts.mjs";

export const NAME = "fluted-studio";
export const TALKS = false;
export const PER_CLIP = true;
export const FIT = [368, 654]; // a card: 34% of the screen width at 9:16 (v1)

const SKILL_DIR = dirname(fileURLToPath(import.meta.url));
const GRADE = "eq=contrast=1.05:saturation=0.92"; // v1's
const ROLES = ["kicker", "headline", "chip"];
const FONTS = {
  kicker: ["CormorantGaramond-Italic[wght].ttf", "Cormorant Garamond"],
  headline: ["Oswald[wght].ttf", "Oswald"],
  chip: ["Inter[opsz,wght].ttf", "Inter"],
};
// Row limits, from HarfBuzz advances of the bundled fonts at the floor sizes look.js fits down to, so a row of the
// widest letter a Mongolian keyboard types still fits the 840 px safe width: kicker 19 x 0.965 em (Ш, Cormorant
// Garamond Italic 500) at 44 px = 807 px; headline 12 x 0.888 em (Щ, Oswald 700) at 78 px = 831 px; chip 26 x
// 1.017 em (Ю, Inter 600) at 28 px = 740 px, plus the padding, dot and border (82 px) = 822 px. Symbols wider than
// those letters (— № %) can still run past. Real words are much narrower: "БИДНИЙ АЖИЛ" fits at 129 px.
const ROW = { kicker: 19, headline: 12, chip: 26 };
// seconds: a card's fly-up into the fan; the least time between two fly-ups (a cascade, as in the preview); a word's
// way in and way out; a word's least time on screen; the least time a card shows before the video ends
const T = { FLY: 0.6, GAP: 0.3, IN: 0.6, OUT: 0.3, MIN: 1.2, ROOM: 1 };
const EPS = 1e-9;

const isNum = (n) => typeof n === "number" && Number.isFinite(n);
const frame = (t) => (t === Infinity ? t : Math.round(t * 30) / 30); // the frame look.js shows it on
const s2 = (t) => t.toFixed(2);
const r3 = (t) => Math.round(t * 1000) / 1000;
const num = (t) => String(Math.round(t * 1e6) / 1e6);
const quote = (t) => `"${String(t.text ?? "").trim().replace(/\s*\n\s*/g, " / ")}"`;
const seconds = (dur) => {
  if (!(dur === Infinity || (isNum(dur) && dur > 0))) throw new Error("the video's length must be seconds");
};
const checkIntro = (v) => {
  if (!(isNum(v) && v >= 0)) throw new Error('look "intro" must be seconds, 0 or more');
};
function introOf(look) {
  const v = look?.intro === undefined ? 2.5 : look.intro;
  checkIntro(v);
  return frame(v);
}

export function validate(plan) {
  const intro = introOf(plan.look);
  if ((plan.clips?.length ?? 0) < 3)
    throw new Error("this look needs at least 3 clips: the cards fan out three at a time (left, centre, right). " +
      "Add clips (the same photo can be used twice)");
  const list = plan.texts ?? [];
  for (const t of list) {
    if (!ROLES.includes(t.role)) throw new Error(`text role "${t.role}" is not used by this look. Use "kicker", "headline" or "chip".`);
    const text = String(t.text ?? "");
    if (!text.trim()) throw new Error(`a "${t.role}" text is empty`);
    if (t.start !== undefined && !(isNum(t.start) && t.start >= 0)) throw new Error(`${quote(t)}: "start" must be seconds, 0 or more`);
    if (t.end !== undefined && !(isNum(t.end) && t.end > (t.start ?? 0))) throw new Error(`${quote(t)} must end after it starts`);
    const rows = text.split("\n").map((r) => r.trim());
    if (rows.some((r) => !r)) throw new Error(`${quote(t)} has an empty row: remove the extra \\n`);
    if (rows.length > 1) throw new Error(`${quote(t)}: a ${t.role} is one row: remove the \\n and shorten it`);
    const drawn = t.role === "headline" ? rows[0].toUpperCase() : rows[0]; // the headline is drawn in capitals
    if ([...drawn].length > ROW[t.role])
      throw new Error(`"${rows[0]}" is too long for a ${t.role} (${ROW[t.role]} characters at most): ` +
        (t.role === "headline" ? "shorten it to one or two words" : "shorten it"));
    const [file, name] = FONTS[t.role];
    const bad = missing(drawn, join(SKILL_DIR, "fonts", file));
    if (bad.length) throw new Error(`${quote(t)} uses ${bad.join(" ")}, which ${name} can't draw`);
  }
  if (intro > 0 && !list.some((t) => t.role === "headline" && frame(t.start ?? 0) === 0))
    throw new Error("the first frame is the Reels thumbnail: start the opening headline at 0 (it is then already there " +
      'on frame 0), or set look "intro" to 0 to open on the cards');
  texts(list, intro, Infinity);
}

// Per clip, after the crop to the card: v1's grade. prep runs it, so it records the clips it made the card files
// from in the work folder (goat.mjs's .work-<NAME>), for prepare to check. It writes the record only when the clips
// change, before prep makes the cards, so a card file older than the record comes from a prep that stopped halfway.
export async function clipFilter(clip, ctx) {
  const work = join(ctx.planDir, `.work-${NAME}`), stamp = join(work, "clips.json");
  const now = JSON.stringify(ctx.plan.clips ?? []);
  mkdirSync(work, { recursive: true });
  if (!existsSync(stamp) || readFileSync(stamp, "utf8") !== now) writeFileSync(stamp, now);
  return GRADE;
}

// One card per clip, in order: the centre (slot 1), then left (0) and right (2), then round again (a 4th card lands on
// the 1st), so the first card never stands alone off to one side (the preview's three came 0.24 s apart). It flies
// up when its clip starts; clips that start under the opening title land after it, and no two fly-ups start under
// 0.3 s apart. A card stays until the next card in its slot has landed on it. Times on the frame grid.
export function cards(cuts, intro, dur) {
  checkIntro(intro);
  seconds(dur);
  dur = frame(dur); // ffprobe's 6 decimals can sit a hair off the last frame
  if (!Array.isArray(cuts) || !cuts.every(isNum)) throw new Error("the cut times must be seconds");
  const out = [];
  for (const [i, start] of cuts.entries()) {
    const land = frame(Math.max(start, intro, i ? out[i - 1].land + T.GAP : 0));
    if (land + T.ROOM > dur + EPS)
      throw new Error(`card ${i + 1} comes in at ${s2(land)} s, less than ${T.ROOM} s before the video ends (${s2(dur)} s): ` +
        "make the last clip longer, or leave it out");
    out.push({ i, slot: [1, 0, 2][i % 3], start, land, until: dur });
  }
  for (const c of out) {
    const next = out.find((d) => d.i > c.i && d.slot === c.slot);
    if (next) c.until = frame(next.land + T.FLY);
  }
  return out;
}

// The words in time order, one of each role at a time (a later one ends the one before). One that starts before the
// opening title ends ("intro") is part of it and ends with it at the latest; later ones sit around the fan. Times on
// the frame grid. One that runs to the end of the video stays up. dur is Infinity before prep (validate).
export function texts(list, intro, dur) {
  seconds(dur);
  dur = frame(dur); // ffprobe's 6 decimals can sit a hair off the last frame (55.866667 vs 1676/30), and a word
  // that runs to the end must still count as staying
  const out = [];
  for (const role of ROLES) {
    const mine = list.filter((t) => t.role === role);
    for (const t of mine) {
      if (!(isNum(t.start ?? 0) && (t.start ?? 0) >= 0)) throw new Error(`${quote(t)}: "start" must be seconds, 0 or more`);
      if (t.end !== undefined && !isNum(t.end)) throw new Error(`${quote(t)}: "end" must be seconds`);
    }
    const order = [...mine].sort((a, b) => (a.start ?? 0) - (b.start ?? 0));
    order.forEach((t, k) => {
      const start = frame(t.start ?? 0), next = order[k + 1];
      if (start >= dur) throw new Error(`${quote(t)} starts at ${s2(t.start ?? 0)} s, after the video ends (${s2(dur)} s)`);
      const mode = start < intro - EPS ? "title" : "fan";
      let end = frame(Math.min(t.end ?? Infinity, next?.start ?? Infinity, dur));
      if (mode === "title") end = Math.min(end, intro);
      if (end - start < T.MIN - EPS)
        throw new Error(`${quote(t)} shows for ${s2(end - start)} s: a ${role} needs ${T.MIN} s (to come in, be read and ` +
          `go out). Move its start or end${next ? `, or the next ${role}'s start` : ""}` +
          (mode === "title" && end === intro ? `; the opening title ends at ${s2(intro)} s (look "intro")` : "") + ".");
      out.push({ role, text: String(t.text).trim(), start, end, mode, stays: end >= dur - EPS });
    });
  }
  return out.sort((a, b) => a.start - b.start || ROLES.indexOf(a.role) - ROLES.indexOf(b.role));
}

// The cards and the words, and the stutter rule: a word never comes in (0.6 s) or goes out (0.3 s) while a card flies
// into the fan (0.6 s), so two big changes never fight. A card already in the fan on frame 0 doesn't fly.
export function schedule(plan, dur, cuts) {
  const intro = introOf(plan.look);
  const cs = cards(cuts, intro, dur), items = texts(plan.texts ?? [], intro, dur);
  const flies = cs.filter((c) => c.land > EPS);
  const flying = (a, b) => flies.find((c) => a < c.land + T.FLY - EPS && c.land < b - EPS);
  const clearFrom = (t, len) => { // the first start at or after t whose [t, t + len) is clear
    for (let c = flying(t, t + len); c; c = flying(t, t + len)) t = c.land + T.FLY;
    return t;
  };
  const clearUntil = (e, len) => { // the last end at or before e whose [e - len, e) is clear
    for (let c = flying(e - len, e); c; c = flying(e - len, e)) e = c.land;
    return e;
  };
  const span = (c) => `card ${c.i + 1} flies into the fan (${s2(c.land)}–${s2(c.land + T.FLY)} s): a word changing under a moving card stutters`;
  for (const t of items) {
    const c = t.start > EPS && flying(t.start, t.start + T.IN);
    if (c) throw new Error(`${quote(t)} comes in at ${s2(t.start)} s while ${span(c)}. Start it at ${s2(clearFrom(t.start, T.IN))} s or later.`);
    const d = !t.stays && flying(t.end - T.OUT, t.end);
    if (d)
      throw new Error(`${quote(t)} goes out over ${s2(t.end - T.OUT)}–${s2(t.end)} s while ${span(d)}. End it at ` +
        `${s2(clearUntil(t.end, T.OUT))} s or earlier, or at ${s2(clearFrom(t.end - T.OUT, T.OUT) + T.OUT)} s or later.`);
  }
  return { intro, cards: cs, items };
}

// HyperFrames finds videos in the page's HTML, so the cards go into index.html ({{CARDS}}): each card's video starts
// at its clip's start, playing clip-<i>.mp4 from 0 (which holds its last frame), until a later card covers it.
export async function prepare(ctx) {
  const stamp = join(ctx.work, "clips.json"), was = existsSync(stamp) ? readFileSync(stamp, "utf8") : null;
  if (was === null) throw new Error(`the cards' clips weren't recorded (prepared by an older version): run "prep" again`);
  if (was !== JSON.stringify(ctx.plan.clips ?? [])) throw new Error(`the clips changed since prep: run "prep" again`);
  for (let i = 0; i < ctx.cuts.length; i++) {
    const card = join(ctx.work, "media", `clip-${i}.mp4`);
    if (!existsSync(card)) throw new Error(`media/clip-${i}.mp4 is missing: run "prep" again`);
    if (statSync(card).mtimeMs < statSync(stamp).mtimeMs)
      throw new Error(`media/clip-${i}.mp4 is older than the clips it should show: run "prep" again`);
  }
  const s = schedule(ctx.plan, ctx.dur, ctx.cuts);
  const CARDS = s.cards.map((c) => `<div class="card" id="card-${c.i}"><video id="clip-${c.i}" src="media/clip-${c.i}.mp4" ` +
    `data-start="${num(c.start)}" data-duration="${num(c.until - c.start)}" data-media-start="0" ` +
    `data-track-index="${c.i + 1}" muted playsinline></video></div>`).join("\n");
  return { ...s, T, html: { CARDS } };
}

// v1's events at about 30% of its levels (Saagii, 15 Nov: half was still "a bit too much" on 08); members raise them
// with "sfx": {"volume": …}. A soft thud as a headline comes in, a swish as a card flies up, a click as a chip comes
// in; nothing for what is already on screen on frame 0, and never two within 0.5 s (the earlier one plays).
export function sfx(plan, ctx) {
  const { cards: cs, items } = schedule(plan, ctx.dur, ctx.cuts);
  const ev = [
    ...items.filter((t) => t.start > EPS && t.role !== "kicker")
      .map((t) => (t.role === "headline" ? { sound: "thud", at: r3(t.start), volume: 0.15 } : { sound: "click", at: r3(t.start), volume: 0.18 })),
    ...cs.filter((c) => c.land > EPS).map((c) => ({ sound: "swish", at: r3(c.land), volume: 0.18 })),
  ].sort((a, b) => a.at - b.at);
  let last = -Infinity;
  return ev.filter((e) => e.at - last >= 0.5 - EPS && ((last = e.at), true));
}
