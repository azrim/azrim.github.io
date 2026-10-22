# azrim.my.id

Personal homepage / dev portfolio for **Mirza Moulfi Ghozali** (`@azrim`), built with the modern [Wingfo](https://wingfo.org/) aesthetic.

## Features & Design System

- **Wingfo Aesthetic**: High-contrast typography, frosted glass (`backdrop-filter`), tactile SVG procedural film grain overlay, radial mesh ambient glows, and drifting atmospheric clouds.
- **Bilingual (EN / ID)**: Instant language switcher with zero flash, persisting preference in `localStorage`.
- **Light & Dark Theme Switch**: Custom dual-state switch with sun/moon icons, smooth sliding circular thumb, and system scheme sync.
- **Interactive Spotlight Cards**: Cursor-following radial light highlight on hover across bento cards, project items, and showcase badges.
- **Floating Bottom Deck Bar (Dock)**: Fixed dock tracking current section progress in real-time, with clickable pill indicators for instant smooth scrolling.
- **Self-Hosted Typography**:
  - Headings: **Clash Display** (500, 600, 700)
  - UI / Body: **Satoshi** (400, 500, 700)
  - Code & Metrics: **JetBrains Mono** variable
- **Pure Static**: No build steps, no external frameworks required. Runs directly on GitHub Pages.

## Sections

1. **Hero**: Headline with word accent, status badge, CTA buttons, and interactive avatar showcase with floating live badges.
2. **Community Numbers Strip**: Key metrics (81+ repos, 7+ years, 10+ device trees, 2 core orgs).
3. **Focus Lanes (Bento Grid)**: 4 core domains (Android & Kernels, Flutter Apps, Toolchains, Self-Hosted & Web3).
4. **Selected Work (Slider)**: Production builds (`sublator`, `boorusphere`, `captcha-solver`, `email-vault-panel`, `helivault-gate`, All Repos shelf).
5. **Tech Stack Marquee**: Infinite smooth ticker with pause-on-hover.
6. **Open-Source Tools**: Two-column registry of compilers, device trees, sidecars, and scripts with animated hover underline.
7. **The Journey**: Chronological milestones from 2019 to present.
8. **Verification & FAQ**: Official safety trust card + interactive collapsible accordion.
9. **Hero CTA Banner**: Rounded gradient banner with drifting text and contact actions.

## Hosting & Preview

```bash
# Preview locally
python -m http.server 8080
# Open http://localhost:8080
```

GitHub Pages custom domain: `azrim.my.id` (via `CNAME`).
