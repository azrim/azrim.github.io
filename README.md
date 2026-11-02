# azrim.my.id

Personal page for **Mirza Moulfi Ghozali** (`@azrim`): Android device bring-up, kernels, recoveries and the desktop tools around them. Static HTML, one stylesheet, one small script. No build step, no framework.

## What is on the page

1. **Hero.** The headline, one line, one action, and a graphite spec sheet: devices, kernel versions, packaging, recovery, toolchain, orgs, the repository count.
2. **What is running now.** Five projects as a horizontal rail: the section pins while the row slides sideways, with a cobalt progress line at its foot. Under 56rem, or with reduced motion on, it stacks as a plain list.
3. **Under the apps.** Bring-up, kernels, toolchains, recovery, one line each.
4. **Where the years went.** 2019, 2020, 2021, 2025 with what happened in each.
5. **Close.** `t.me/azrim_lab` and GitHub.

## Languages

Every string exists twice, inside `.l-en` and `.l-id` spans. The `lang` attribute on `<html>` picks which one renders, and `script.js` remembers the choice in `localStorage` under `azrim-lang`. To add a string, add both spans.

## Files

| File | What it holds |
| --- | --- |
| `index.html` | The page. Copy lives in the markup, in both languages. |
| `styles.css` | Tokens (`:root`), base rules, then every section. No colour or font is written outside the token block. |
| `script.js` | The language switch and the year in the footer. |
| `404.html` | The one-screen not-found page, on the same stylesheet. |
| `fonts/` | Self-hosted: Familjen Grotesk and IBM Plex Sans (variable), JetBrains Mono for identifiers and versions. |
| `assets/` | `soldering-a-0805-1920.jpg`: the bench photograph in the third section, from Wikimedia Commons (Aisart, CC BY-SA 3.0), credited in the footer. Swap it with `hallmarkSlots({ bench: 'your-photo.jpg' })` from the console, or replace the file. The avatar and the two org marks belong to the old layout. |
| `vendor/` | GSAP, ScrollTrigger and Lenis from the old layout. Not referenced by the current page. |

## Preview

```bash
python -m http.server 8080
# http://localhost:8080
```

Hosted on GitHub Pages at `azrim.my.id`, with `CNAME` pointing at it.
