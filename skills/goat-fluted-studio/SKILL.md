---
name: goat-fluted-studio
description: Fluted Studio · Ховилтой хана. Turns the user's photos and clips into a reel on a dark ribbed studio wall with a diagonal beam of light, a small serif italic line over a huge condensed silver Mongolian headline, a status chip with a glowing blue dot, and the photos flying up into a fan of three cards. Renders a 1080x1920 MP4 for Reels/TikTok. Best for salons, barbers, retail, ecommerce, auto and real estate: "10 years", portfolio and launch reels. Use whenever the user wants a portfolio fan, "10 жилийн туршлага", "бидний ажил", "ажлынхаа зургуудыг харуул", "portfolio reel", "photo cards", a dark studio or ribbed-wall look, or types /goat-fluted-studio, even if they don't name the skill.
---

# Fluted Studio · Ховилтой хана

A dark ribbed (fluted) studio wall fills the screen, cut by a diagonal beam of light. The video opens on a title: a small serif italic line ("Арван жилийн") over a huge condensed silver headline ("ТУРШЛАГА"), with a status chip and a glowing blue dot ("Захиалга нээлттэй"). Then the user's photos or clips fly up one by one into a fan of three cards, with a new line above and a second headline ("10 ЖИЛ") below. There is no speaker on screen. It is the only GOAT look set on a ribbed studio wall with a serif-plus-condensed title.

**Good for:** salons, barbers, retail, ecommerce, auto, real estate: "10 years", "our work", portfolio and launch reels.
**Not for:** warm, cosy brands (it reads cold and techy), and talking-head videos (the speaker isn't shown; their voice can still play). If the footage is like that, say so and suggest another GOAT look.

Talk to the user in the language they write in (usually Mongolian). Keep messages short and plain; many users are not technical. `SKILL_DIR` means this skill's base directory (shown when the skill loads). Run commands from the user's project folder with absolute paths into `SKILL_DIR`.

## 1. Setup check (first time on a machine)

Run `ffmpeg -version` and `uv --version`. If either is missing, show the install command and ask before installing (it is their computer):
- Mac: `brew install ffmpeg uv`
- Windows: `winget install Gyan.FFmpeg` and `winget install astral-sh.uv`, then close and reopen the terminal.

The first render downloads two small Python packages (Pillow, numpy) once. After that it is instant.

## 2. Collect the clips and words

Make `raw/` and `output/` in the current folder. Ask for:
1. **The photos or clips:** 3–6 of their best work, upright (9:16) if possible. Drag them into the chat or copy them into `raw/`. Each one becomes a card.
2. **The words:** an opening title (a short italic line + one big word, e.g. "Арван жилийн" + "ТУРШЛАГА"), an optional chip ("Захиалга нээлттэй"), and a second line + big word for the fan ("Бидний ажил" + "10 ЖИЛ"). Never invent a price, phone number, date or number of years. Ask.

If the user wants to talk over it, see "Voice-over" below.

Then run: `uv run SKILL_DIR/scripts/goatcut.py probe raw/*`
It prints each file's size, length, whether it has sound and whether it is HDR.

## 3. Write plan.json

Write `plan.json` in the project folder. Paths are relative to it.

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
    {"role": "kicker", "text": "Арван жилийн", "start": 0.3, "end": 2.4},
    {"role": "headline", "text": "Туршлага", "start": 0.6, "end": 2.4},
    {"role": "chip", "text": "Захиалга нээлттэй", "start": 1.2, "end": 2.4},
    {"role": "kicker", "text": "Бидний ажил", "start": 2.7, "end": 11.8},
    {"role": "headline", "text": "10 жил", "start": 4.2, "end": 11.8}
  ],
  "look": {"intro": 2.5}
}
```

**clips** become the cards, in order. `dur` sets how long a photo counts for; `in`/`out` trim a video. `cx`/`cy` (0–1, default 0.5) choose which part of the picture the 9:16 card keeps (`cy: 0.3` keeps the upper part). A card flies up when its clip starts and keeps showing after it ends (a video card freezes on its last frame). Cards go left, centre, right; a 4th card lands on the left one, a 5th on the centre, and so on. The video is as long as all the clips together.
**texts:**
- `kicker`: the small serif italic line.
- `headline`: the huge condensed silver word, in capitals (typed in any case). It reveals from the top down. Long words shrink to fit; one or two words read best.
- `chip`: a dark status chip with a glowing blue dot ("Захиалга нээлттэй", "Шинэ", "Нээлттэй").
Texts that start before `intro` use the opening layout (centred title, chip under it). Texts that start later use the fan layout (line above the cards, headline below them, chip on the cards' lower edge). One of each role shows at a time.
**look** options:
- `intro`: seconds the opening title holds the wall before the cards come. Default `2.5`; `0` starts with the cards. Clips that start during the opening title are hidden until it ends, then land together, so use a photo for the first clip.

**Auto sound effects:** a soft thud as each headline lands, a swish as each card flies up into the fan, a click as the chip appears.

**Timing:** 2–3 s per photo. End the opening title just before `intro`. Start the second headline about 1 s after the cards begin.

Before rendering, tell the user the plan in plain words (the cards in order, the words, when the cards come) and ask "OK?". This is the only approval needed.

<!-- audio: this section is copied from core/skill-audio.md by build.py; edit it there -->
## Sound effects, voice-over and music

**Sound effects are on by default.** The look adds its own (see "Auto sound effects" above). They are made in code, so there's nothing to license, and they sit quietly under the voice.
- Turn them off: `"sfx": false`. Make them quieter or louder: `"sfx": {"volume": 0.6}`.
- Add one: `"sfx": {"add": [{"sound": "ding", "at": 4.2}]}`. Sounds: whoosh, swish, pop, click, type, shutter, boom, thud, hit, riser, ding, notify, shimmer, paper, tape, marker, projector, tick. `type`, `marker`, `projector` and `riser` also take `"dur"` in seconds; a riser should end on the moment it builds to.
- Let the user hear one render before adding more. Too many sounds feel cheap.

**Voice-over.** If the user wants to talk over the video, ask them to record it on their phone (a voice memo is fine: m4a, mp3 or wav) and copy it into `raw/`. Then add `"voiceover": {"src": "raw/vo.m4a", "at": 0.5}` (`at` = when it starts; optional `"volume"`). While the voice plays, the clips' own sound and the music dip automatically. Run `goatcut.py probe raw/vo.m4a` to get its `speech` spans and time the words on screen to them. The clips must add up to at least the voice-over's length (the render warns if not). Recording tips for the user: a small quiet room (a parked car or a wardrobe works), phone about 20 cm from the mouth, read the script out loud once before recording.

**Music.** `"music": {"src": "raw/song.mp3", "volume": 0.25}`. Only use music the user has the rights to. Music added inside the Instagram/TikTok app is the safe choice, so suggest that first.
<!-- /audio -->

## 4. Render and check

`uv run SKILL_DIR/scripts/render.py plan.json`

A 30 s video takes about 30–60 s. Then look at three frames before saying it is done:
`ffmpeg -y -loglevel error -ss 1.5 -i output/fluted-studio.mp4 -frames:v 1 output/check-1.jpg` (and two more times, in the fan). Read them. Check that words are not cut off, the important part of each photo is inside its card (fix with `cy`/`cx`), and the headline is readable.

If a render fails twice, stop and explain the error in plain words. Don't loop.

## 5. Hand over

Tell the user where the file is (`output/fluted-studio.mp4`) and that it is ready to post. Music can be added in the Instagram/TikTok app.

## Rules

- A price, phone number or offer goes in a `headline`, `kicker` or `chip`, which sit inside the area no app buttons cover.
- Use only the fonts bundled in `SKILL_DIR/fonts` (they have Ө ө Ү ү). Don't swap in other fonts.
- Keep headlines short. One or two words read better than a sentence.
- The output is 1080x1920, 30 fps, H.264, sound normalised to -14 LUFS (Instagram/TikTok level).
