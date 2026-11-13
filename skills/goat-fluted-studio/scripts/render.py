# /// script
# requires-python = ">=3.10,<3.13"
# dependencies = ["pillow>=10.4", "numpy>=1.26"]
# ///
"""Fluted Studio · Ховилтой хана.

A dark ribbed (fluted) studio wall with a diagonal beam of light, drawn in code. A small serif italic
line sits over a huge condensed silver headline, with a status chip and a glowing blue dot. Then the
user's clips fly up one by one into a fan of three photo cards.
Usage: uv run render.py plan.json
"""
import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import goatcut as g  # noqa: E402
from PIL import Image, ImageDraw, ImageFilter  # noqa: E402

NAME = "fluted-studio"
FIT_SIZE = (368, 654)  # every clip becomes a 9:16 card
GRADE = "eq=contrast=1.05:saturation=0.92"
SERIF = "CormorantGaramond-Italic[wght].ttf"
CONDENSED = "Oswald[wght].ttf"
INTER = "Inter[opsz,wght].ttf"
CW, CH = FIT_SIZE
PAD = 80                       # room around a card for its shadow and rotation
FAN_BOTTOM = 1084              # bottom edge of the fanned cards
SLOTS = [(-228, 13), (0, 0), (228, -13)]  # (x shift, degrees counter-clockwise): left, centre, right
DRAW_ORDER = (0, 2, 1)         # the centre card sits on top
LAYOUT = {  # per mode: kicker centre y, headline ink top y, headline max size, chip centre y
    "title": (590, 650, 230, 905),
    "fan": (330, 1110, 170, 1050),
}


# ---------------------------------------------------------------- wall

def wall():
    """Ribbed wall (26 px flutes), a diagonal light split at 115 degrees and a vignette, like the preview's CSS."""
    def mix(a, b, k):
        return tuple(round(x + (y - x) * k) for x, y in zip(a, b))
    lo, hi, dark = (17, 17, 19), (42, 42, 46), (13, 13, 15)
    row = Image.new("RGB", (g.W, 1))
    row.putdata([mix(lo, hi, (x % 26) / 13) if x % 26 < 13 else mix(hi, dark, (x % 26 - 13) / 13) for x in range(g.W)])
    img = row.resize((g.W, g.H), Image.NEAREST)
    # light and vignette are smooth, so they are worked out on a quarter-size grid and scaled up
    w, h = g.W // 4, g.H // 4
    sa, ca = math.sin(math.radians(115)), math.cos(math.radians(115))
    span = abs(g.W * sa) + abs(g.H * ca)
    rx, ry = g.W / 2 * 2 ** 0.5, g.H * 0.55 * 2 ** 0.5
    light, vig = Image.new("L", (w, h)), Image.new("L", (w, h))
    lp, vp = [], []
    for j in range(h):
        for i in range(w):
            x, y = i * 4 + 2, j * 4 + 2
            p = ((x - g.W / 2) * sa - (y - g.H / 2) * ca) / span + 0.5
            a = 0 if p < 0.52 else 0.10 * (p - 0.52) / 0.01 if p < 0.53 else \
                0.10 + (0.035 - 0.10) * (p - 0.53) / 0.22 if p < 0.75 else 0.035 * g.clamp((0.90 - p) / 0.15)
            lp.append(round(255 * a))
            d = math.hypot((x - g.W / 2) / rx, (y - g.H * 0.45) / ry)
            vp.append(round(255 * 0.65 * g.clamp((d - 0.4) / 0.6)))
    light.putdata(lp)
    vig.putdata(vp)
    img = Image.composite(Image.new("RGB", img.size, (255, 255, 255)), img, light.resize(img.size, Image.BILINEAR))
    return Image.composite(Image.new("RGB", img.size, (0, 0, 0)), img, vig.resize(img.size, Image.BILINEAR))


# ---------------------------------------------------------------- sprites

def silver_sprite(text, font, top=(255, 255, 255), bottom=(184, 188, 194), stop=0.3):
    """Text filled with a top-to-bottom silver gradient."""
    a = g.text_sprite(text, font).getchannel("A")
    w, h = a.size
    col = Image.new("RGB", (1, h))
    col.putdata([tuple(round(c0 + (c1 - c0) * g.clamp((y / h - stop) / (1 - stop))) for c0, c1 in zip(top, bottom))
                 for y in range(h)])
    face = col.resize((w, h)).convert("RGBA")
    face.putalpha(a)
    return face


def chip_parts(ctx, text):
    """The chip without its dot, and the dot's glow, so the glow can breathe."""
    f = ctx.fit(text, INTER, 640, 28, min_size=20, axes={"wght": 600, "opsz": 24})
    label = g.text_sprite(text, f)
    w, h = 24 + 16 + 14 + label.width + 24, max(label.height, 16) + 32
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((0, 0, w - 1, h - 1), 16, fill=(20, 22, 28, 217), outline=(51, 54, 62, 255), width=2)
    d.ellipse((24, h / 2 - 8, 40, h / 2 + 8), fill=(77, 163, 255, 255))
    img.alpha_composite(label, (54, (h - label.height) // 2))
    halo = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    ImageDraw.Draw(halo).ellipse((20, 20, 44, 44), fill=(77, 163, 255, 255))
    return img, halo.filter(ImageFilter.GaussianBlur(9))


def card_base():
    """Shadow under an empty card, with room to rotate."""
    img = Image.new("RGBA", (CW + PAD * 2, CH + PAD * 2), (0, 0, 0, 0))
    ImageDraw.Draw(img).rounded_rectangle((PAD, PAD + 24, PAD + CW, PAD + CH + 24), 22, fill=(0, 0, 0, 153))
    return img.filter(ImageFilter.GaussianBlur(28))


def card_sprite(ctx, frame_img):
    card = frame_img.convert("RGBA")
    card.putalpha(ctx.card_mask)
    card.alpha_composite(ctx.card_edge)
    out = ctx.card_base.copy()
    out.alpha_composite(card, (PAD, PAD))
    return out


# ---------------------------------------------------------------- look

def SFX(ctx):
    # a soft thud as each headline lands, a swish as each card flies up into the fan, a click for the chip
    return ([{"sound": "thud", "at": x["start"], "volume": 0.5} for x in ctx.texts("headline")]
            + [{"sound": "swish", "at": t, "volume": 0.6} for t in ctx.land]
            + [{"sound": "click", "at": x["start"], "volume": 0.6} for x in ctx.texts("chip")])


def setup(ctx):
    intro = ctx.opt("intro", 2.5)
    if not isinstance(intro, (int, float)) or not 0 <= intro < ctx.dur:
        g.die(f"look.intro must be a number of seconds from 0 to less than the video length ({ctx.dur:.1f}s)")
    ctx.intro = float(intro)
    # each clip's card flies up when its clip starts; clips that start during the opening title land just after it
    ctx.land = [c if c >= ctx.intro else ctx.intro + 0.25 * i for i, c in enumerate(ctx.cuts)]
    ctx.wall = wall().convert("RGBA")
    ctx.card_mask = g.rounded_mask((CW, CH), 22)
    ctx.card_edge = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
    ImageDraw.Draw(ctx.card_edge).rounded_rectangle((1, 1, CW - 2, CH - 2), 22, outline=(255, 255, 255, 36), width=4)
    ctx.card_base = card_base()
    ctx.last = {}


def mode(ctx, item):
    return "title" if item.get("start", 0) < ctx.intro else "fan"


def draw_card(canvas, ctx, i, t):
    dx, rot = SLOTS[i % 3]
    e = g.ease_out((t - ctx.land[i]) / 0.5)
    landed = e >= 1 and ctx.clip_at(t)[0] != i
    s = ctx.cache(("card", i), lambda: card_sprite(ctx, ctx.last[i]).rotate(rot, Image.BICUBIC, expand=True)) \
        if landed else card_sprite(ctx, ctx.last[i]).rotate(rot * e, Image.BICUBIC, expand=True)
    phi = math.radians(rot * e)
    # rotate about the card's bottom centre, like CSS transform-origin: 50% 100%
    px, py = 540 + dx * e, FAN_BOTTOM + CH * 0.6 * (1 - e)
    g.paste(canvas, s, px - CH / 2 * math.sin(phi), py - CH / 2 * math.cos(phi), g.clamp(e * 1.6), anchor="mm")


def frame(img, t, ctx):
    ctx.last[ctx.clip_at(t)[0]] = img
    canvas = ctx.wall.copy()

    shown = [i for i in range(len(ctx.cuts)) if t >= ctx.land[i] and i in ctx.last]
    for slot in DRAW_ORDER:
        mine = [i for i in shown if i % 3 == slot]
        # skip cards fully covered by a newer card that has already landed in the same place
        covered = max((i for i in mine if t >= ctx.land[i] + 0.5), default=None)
        for i in mine:
            if covered is None or i >= covered:
                draw_card(canvas, ctx, i, t)

    for item in ctx.active(t, "kicker")[-1:]:
        ky = LAYOUT[mode(ctx, item)][0]
        s = ctx.cache(("kick", item["text"]),
                      lambda: g.text_sprite(item["text"], ctx.fit(item["text"], SERIF, 840, 58, axes={"wght": 400}),
                                            fill=(237, 237, 237, 255)))
        g.paste(canvas, s, 540, ky, g.fade(t, item, 0.4, 0.25), anchor="mm")
    for item in ctx.active(t, "headline")[-1:]:
        _, hy, size, _ = LAYOUT[mode(ctx, item)]
        text = item["text"].upper()
        s = ctx.cache(("head", text, size),
                      lambda: silver_sprite(text, ctx.fit(text, CONDENSED, 907, size, axes={"wght": 700})))
        p = g.ease_out((t - item["start"]) / 0.5)  # reveals from the top edge down while rising 30 px
        if p > 0:
            part = s if p >= 1 else s.crop((0, 0, s.width, max(1, int(s.height * p))))
            g.paste(canvas, part, 540, hy + 30 * (1 - p), g.fade(t, item, 0.15, 0.25), anchor="mt")
    for item in ctx.active(t, "chip")[-1:]:
        cy = LAYOUT[mode(ctx, item)][3]
        chip, halo = ctx.cache(("chip", item["text"]), lambda: chip_parts(ctx, item["text"]))
        k = 0.85 + 0.15 * g.ease_out((t - item["start"]) / 0.3)
        s = chip if k >= 1 else chip.resize((round(chip.width * k), round(chip.height * k)))
        a = g.fade(t, item, 0.3, 0.25)
        g.paste(canvas, s, 540, cy, a, anchor="mm")
        if k >= 1:  # the blue dot's glow breathes once a second
            g.paste(canvas, halo, 540 - chip.width / 2 + 32, cy, a * (0.55 + 0.45 * math.sin(t * 2 * math.pi)),
                    anchor="mm")
    return canvas


if __name__ == "__main__":
    g.run(sys.modules[__name__])
