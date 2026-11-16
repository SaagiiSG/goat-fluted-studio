---
name: goat-fluted-studio
description: Fluted Studio · Ховилтой хана. Turns the user's photos and clips into a reel on a dark ribbed studio wall with a drifting diagonal beam of light, a serif italic line over a huge condensed silver Mongolian headline that reveals from the top, a status chip with a breathing blue dot, and the photos flying up one by one into a fan of three cards. Built on HyperFrames. Renders a 1080x1920 MP4 for Reels/TikTok. Best for salons, barbers, retail, ecommerce, auto and real estate: portfolio and launch reels. Use whenever the user wants a portfolio fan, "бидний ажил", "ажлынхаа зургуудыг харуул", "portfolio reel", "photo cards", a dark studio or ribbed-wall look, or types /goat-fluted-studio, even if they don't name the skill.
---

# Fluted Studio · Ховилтой хана

A dark ribbed (fluted) studio wall fills the screen, cut by a diagonal beam of light that drifts slowly across it. The video opens on a title: a small serif italic line over a huge condensed silver headline, with a status chip whose blue dot breathes. Then the user's photos or clips fly up one by one into a fan of three cards, each card playing its own clip and keeping its last frame, with a new line above the fan and a second headline below it. There is no speaker on screen. It is the only GOAT look set on a ribbed studio wall with a serif-plus-condensed title.

**Good for:** salons, barbers, nails, retail, ecommerce, auto, real estate: "our work", portfolio and launch reels.
**Not for:** warm, cosy brands (it reads cold and techy), and talking-head videos: each clip is a card a third of the screen wide, so a face is small (the voice can still play). If the footage is like that, say so and suggest another GOAT look.

Talk to the user in the language they write in (usually Mongolian). Keep messages short and plain; many users are not technical. `SKILL_DIR` means this skill's base directory (shown when the skill loads). Run commands from the user's project folder with absolute paths into `SKILL_DIR`. `goat` below means `node SKILL_DIR/scripts/goat.mjs`.

## 1. Setup check (first time on a machine)

**Every new video, first:** run `claude plugin marketplace update goat-fluted-studio`, then `claude plugin update goat-fluted-studio@goat-fluted-studio`. If it installs a new version, tell the user a new version was installed and ask them to type `/reload-plugins` before you go on. If either command fails (offline, or installed from a zip), carry on and don't mention it.

Run `node --version` (needs 22 or newer) and `ffmpeg -version`. If either is missing, show the install command and ask before installing (it is their computer):
- Mac: `brew install node ffmpeg`
- Windows: `winget install OpenJS.NodeJS.LTS` and `winget install Gyan.FFmpeg`, then close and reopen the terminal.

This look has no captions, so it needs no speech model. The first render downloads, once, a private copy of Chrome that draws the frames. Tell the user the first run takes a while; after that it starts at once. Nothing is uploaded: everything runs on their computer, with no account.

**Long steps:** the first `render` (the Chrome download) can run longer than a normal command timeout. Run it in the background, or with a 600000 ms timeout, and wait for it to end. Never stop it and start it again.

**Windows has not been tested yet.** If a step fails there, show the error to the user in plain words.

## 2. Collect the clips and words

Make `raw/` and `output/` in the current folder. Ask for:
1. **The photos or clips:** at least 3 (the fan has three cards), 3–6 of their best work, upright (9:16) if possible. Drag them into the chat or copy them into `raw/`. Each one becomes a card.
2. **The words:** an opening title (a short italic line + one big word or two), an optional chip (a short status, e.g. "Захиалга нээлттэй"), and a line + big word for the fan. Every word comes from the user or from what the photos show. Never invent a price, phone number, date or number of years. Ask.

Then run `goat probe raw/*`. It prints each file's size, length, whether it has sound and whether it is HDR.

## 3. Prepare

Write `plan.json` in the project folder (paths are relative to it):

```json
{
  "output": "output/fluted-studio.mp4",
  "clips": [
    {"src": "raw/nails.jpg", "dur": 3},
    {"src": "raw/salon.jpg", "dur": 3},
    {"src": "raw/IMG_0415.MOV", "in": 1.0, "out": 4.0, "cy": 0.4},
    {"src": "raw/shop.jpg", "dur": 3}
  ],
  "texts": [
    {"role": "kicker", "text": "Манай салоны", "start": 0},
    {"role": "headline", "text": "Ажлууд", "start": 0},
    {"role": "chip", "text": "Захиалга нээлттэй", "start": 0.8},
    {"role": "kicker", "text": "Хумс, үс, будалт", "start": 3.6},
    {"role": "headline", "text": "Шинэ загвар", "start": 4.2}
  ],
  "look": {"intro": 2.5}
}
```

**clips** become the cards, in order. `dur` sets how long a photo counts for; `in`/`out` trim a video (seconds). `cx`/`cy` (0–1, default 0.5) choose which part of the picture the 9:16 card keeps (`cy: 0.3` keeps the upper part). Add `"sound": false` to mute one clip. The video is as long as all the clips together.

Each card flies up into the fan when its clip starts (a card's clip plays in it; when the clip ends, the card keeps its last frame). Cards go to the centre, then left, then right; a 4th card lands on the centre one, a 5th on the left, and so on. Clips that start while the opening title is up are hidden until it ends, then fly up 0.3 s apart (their footage keeps running underneath, so use a photo first, or a clip whose best moment is at its end). The last card must come in at least 1 s before the video ends.

Then run these in order. Each one says what to run first if a step is missing.
1. `goat prep plan.json`: crops every clip to a 368x654 card, grades it a little cooler (v1's contrast and colour), and makes one file per card in `.work-fluted-studio/media/`. **Run it again whenever `clips` change** (render refuses cards made from other clips).
2. `goat cut plan.json`: this look never cuts pauses; the step only readies the video and takes a second.

**Check the framing** before writing the words. Pull one frame of each card, 0.4 s into its file:
`ffmpeg -y -loglevel error -ss 0.4 -i .work-fluted-studio/media/clip-0.mp4 -frames:v 1 output/card-1.jpg` (clip-1.mp4 is the 2nd card, and so on). Read them. If a face or the work is cut off, move `cx`/`cy` toward it and run `prep` again.

## 4. Write the words

**texts** (only one of each role shows at a time: a later one ends the one before). Each is **one row**; a longer one, or one with `\n`, is refused with a message: shorten it.
- `kicker`: the small serif italic line (Cormorant Garamond Italic, up to 68 px; a long one shrinks, to 44 px at the least). **At most 19 characters** (spaces count). Written as you type it.
- `headline`: the huge condensed silver word (Oswald Bold), drawn in capitals whatever case you type. **At most 12 characters**: one or two words. It reveals from the top down while it rises, then a sheen of light crosses it. A long row shrinks to fit the 840 px safe width: on the opening title "ЗАГВАР" stays at the full 230 px, "АЖЛУУД" comes out at about 220 px and "ШИНЭ ЗАГВАР" at about 138 px; 12 of the widest letters (Щ Ш Ю) go down to 78 px. Under the fan it is up to 160 px.
- `chip`: a dark chip with a glowing blue dot that breathes (Inter SemiBold, up to 36 px). **At most 26 characters**: a short status such as "Захиалга нээлттэй" or "Шинэ". A long one shrinks, to 28 px at the least.

**The opening title and the fan.** Texts that start before `intro` are the opening title (centred: kicker, headline, chip under it); they end with it at the latest. Texts that start at `intro` or later sit around the fan: the kicker above the cards, the headline below them, the chip on the cards' lower edge.

**The first frame is the Reels thumbnail.** When there is an opening title, start its headline (and usually its kicker) at `0`: it is then already there on frame 0, sharp, with no animation. A plan whose opening headline doesn't start at 0 is refused. With `"intro": 0` the video opens on the first card, already in the fan.

**Timing:**
- Hold each photo 2–3 s. Each word needs **1.2 s on screen** at least (a shorter one is refused): it comes in over 0.6 s and goes out over 0.3 s.
- **Never change a word while a card flies.** A card takes 0.6 s to fly in from its clip's start. A word's 0.6 s coming in, or 0.3 s going out, may not overlap that, or render stops with a message that gives the nearest clear time. So start a word at least 0.6 s after a clip starts and at least 0.6 s before the next one starts, and end it exactly on a clip's start or at least 0.9 s after it. In the example the clips start at 3, 6 and 9 s: the fan's words come in at 3.6 and 4.2 s, after the second card has landed, and stay to the end.
- **To change words with a new card,** end the old ones exactly on that card's clip start (`"end"`) and start the new ones 0.6 s later: the words clear, the card flies in, the new words come. A clip under 1.8 s leaves no room for a word that comes in and goes out while it shows (0.6 s flight + 1.2 s on screen); let its card be the beat.
- A word that runs to the end of the video stays up on the last frame.

**look** options:
- `intro`: seconds the opening title holds the wall before the cards come. Default `2.5`; `0` opens on the cards.

**Auto sound effects** (soft, about a third of the old version's levels; raise them with `"sfx": {"volume": 1.5}`): a soft thud as a headline comes in, a swish as each card flies up, a click as a chip comes in. Nothing for what is already up on frame 0, and never two within 0.5 s (the earlier one plays).

Before rendering, tell the user the plan in plain words (the cards in order, the words, when the cards come) and ask "OK?". This is the only approval needed.

<!-- audio: this section is copied from core/skill-audio-node.md by build.py; edit it there -->
## Sound effects, voice-over and music

**Sound effects are on by default.** The look adds its own (see "Auto sound effects" above). They are made in code, so there's nothing to license, and they sit quietly under the voice.
- Turn them off: `"sfx": false`. Make them quieter or louder: `"sfx": {"volume": 0.6}`.
- Add one: `"sfx": {"add": [{"sound": "ding", "at": 4.2}]}`. Sounds: whoosh, swish, pop, click, type, shutter, boom, thud, hit, riser, ding, notify, shimmer, paper, tape, marker, projector, tick. `type`, `marker`, `projector` and `riser` also take `"dur"` in seconds; a riser should end on the moment it builds to.
- Let the user hear one render before adding more. Too many sounds feel cheap.

**Voice-over.** If the user wants to talk over the video, ask them to record it on their phone (a voice memo is fine: m4a, mp3 or wav) and copy it into `raw/`. Then add `"voiceover": {"src": "raw/vo.m4a", "at": 0.5}` (`at` = when it starts; optional `"volume"`). While the voice plays, the clips' own sound and the music dip automatically. Run `node SKILL_DIR/scripts/goat.mjs probe raw/vo.m4a` to get its `speech` spans and time the words on screen to them. The clips must add up to at least the voice-over's length (the render warns if not). Recording tips for the user: a small quiet room (a parked car or a wardrobe works), phone about 20 cm from the mouth, read the script out loud once before recording.

**Music.** `"music": {"src": "raw/song.mp3", "volume": 0.25}`. Only use music the user has the rights to. Music added inside the Instagram/TikTok app is the safe choice, so suggest that first.
<!-- /audio -->

## 5. Render and check

`goat render plan.json`

It draws the wall, the title, the cards and the words, mixes the sound and writes the MP4 plus a contact sheet (one frame per second) at `.work-fluted-studio/sheet.jpg`. On our test Mac a 15 s video of 5 clips took 21–26 s to render (prep 5 s), a 12 s one of 4 clips 25 s, and a 56 s video of 12 clips 89 s (prep and cut about 48 s more). Longer videos take longer. Run the next render only after the last one ends.

Read the contact sheet, the first frame, and full-size frames when nothing is moving: 0.7 s after each card comes in (its clip's start, or for clips under the opening title the moment it ends), and 0.1 s before each clip ends; skip a clip shorter than 0.5 s. Never pull one during a card's 0.6 s flight. For the example plan (clips start at 0, 3, 6, 9; the first card comes at 2.5):
`ffmpeg -y -loglevel error -i output/fluted-studio.mp4 -frames:v 1 output/check-0.jpg` (the opening title)
`ffmpeg -y -loglevel error -ss 2.0 -i output/fluted-studio.mp4 -frames:v 1 output/check-2.0.jpg` (the title with its chip)
`ffmpeg -y -loglevel error -ss 5.0 -i output/fluted-studio.mp4 -frames:v 1 output/check-5.0.jpg` (two cards, the fan's words)
`ffmpeg -y -loglevel error -ss 11.0 -i output/fluted-studio.mp4 -frames:v 1 output/check-11.0.jpg` (the full fan, the 4th card on the centre one).
Check that:
- the first frame (the thumbnail) shows the opening title;
- every word is spelled right (Ө ө Ү ү!) and whole;
- each card shows the work (fix with `cx`/`cy`), and nothing important is too dark.

If a render fails twice, stop and explain the error in plain words. Don't loop.

## 6. Hand over

Tell the user where the file is (`output/fluted-studio.mp4`) and that it is ready to post. Music can be added in the Instagram/TikTok app.

## Rules

- Every word and graphic on screen comes from what this video says or shows, or from what the user gave you. The examples in this file are only examples: never put them in a video. If the user hasn't given the words, ask.
- A price, phone number or offer goes in a `headline`, `kicker` or `chip`; all three sit inside the area no app buttons cover.
- Use only the fonts bundled in `SKILL_DIR/fonts` (they have Ө ө Ү ү and ₮). Don't swap in other fonts. Emoji and symbols such as ★ (in a kicker or headline) can't be drawn.
- Keep headlines short. One or two words read better than a sentence.
- Never invent a price, phone number or date; ask.
- The output is 1080x1920, 30 fps, H.264. The clips' own sound, the voice-over and the music are brought to -14 LUFS together (Instagram/TikTok level) and the effects play on top. With nothing to bring up (photos or silent clips, no music or voice-over) the effects play alone, so such a reel is much quieter than that (our silent test: -37 LUFS); add music in the app.
