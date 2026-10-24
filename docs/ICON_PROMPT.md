# PixelSoft HQ — app icon brief (for Gemini)

## What the program is
PixelSoft HQ is a cute pixel-art RPG about a tiny AI software company. The screen is a
top-down office floor with ten pastel rooms (CEO office, CTO office, meeting room,
cafeteria, Design, Frontend, Backend, QA Lab, Art Studio). Little pixel characters
walk between rooms; the CEO (the player) types in a chat bar and Fable the CTO answers
in a retro RPG dialogue box. A wall screen shows a "token dashboard".

## Palette taken from the game
- Deep indigo (CTO / meeting rooms): #26215c, accent #534ab7, pastel #d2ccf4
- CEO gold: #c48024, pastel #f2d696, floor cream #fdf5e4
- Department accents: pink #d4537e, blue #378add, green #1d9e75, orange #ef9f27, purple #9370db
- Wood / desk brown: #96693c, dark outline #463024

## Prompt (copy-paste)

> App icon for a game called "PixelSoft HQ". Cute pixel-art style, 16-bit retro RPG look,
> crisp square pixels, no anti-aliasing blur. Subject: a small, friendly office building
> seen slightly from above at a 3/4 isometric angle, two floors, big windows glowing
> warm cream (#fdf5e4), walls in pastel indigo (#d2ccf4) with deep indigo (#26215c) outlines
> and roof. On the roof a tiny pixel sign shaped like a speech bubble in CEO gold (#f2d696).
> Five small colored dots or window lights along the lower floor in pink #d4537e,
> blue #378add, green #1d9e75, orange #ef9f27, purple #9370db (one per department).
> A tiny pixel character with a laptop stands at the front door. Background: a single
> flat rounded square in deep indigo #26215c, nothing else. Centered, lots of padding,
> readable at 64×64. NO text, NO letters, NO logos, no real brands, original design only.
> Output: PNG, 1024×1024, transparent corners outside the rounded square.

## Variant prompts (ask for a 2×2 sheet if you want choices)
1. Same, but the building is replaced by a pixel **CTO character** (Fable): round head,
   indigo hoodie, holding a clipboard, gold speech bubble above.
2. Same, but a pixel **desk scene**: monitor showing a tiny office map, coffee cup,
   gold speech bubble.
3. Same building, **night mode**: dark indigo sky, windows glowing brighter, little moon.

## After Gemini delivers
Save the PNG as `desktop/icon.png` in this repo (overwrite the placeholder), then run
`desktop/start.sh` once or re-copy `desktop/PixelSoft-HQ.desktop` to `~/Desktop`.
Also drop a 32×32 copy at `static/favicon.png` for the browser tab.
