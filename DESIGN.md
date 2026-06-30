---
version: gamma
name: Cozy island ITNA visual system
description: "ITNA uses a cozy island-life game mood: floating rounded navigation, cream paper surfaces, grass green, sky blue, warm yellow, soft coral, chunky pill buttons, and friendly rounded type fallbacks. Do not use Nintendo logos, proprietary game assets, or exact franchise fonts."

colors:
  primary: "#5f4b32"
  on-primary: "#fff8e7"
  ink: "#3f3328"
  canvas: "#fff7df"
  inverse-canvas: "#3f6f55"
  inverse-ink: "#fff8e7"
  hairline: "#ddc889"
  hairline-soft: "#eadba8"
  surface-soft: "#f6e9bf"
  block-lime: "#bfe27a"
  block-lilac: "#cdb7e9"
  block-cream: "#fff0bd"
  block-pink: "#ffc9b5"
  block-mint: "#a8dca8"
  block-coral: "#f5a36d"
  block-sky: "#91d7ee"
  block-yellow: "#ffd76b"
  block-navy: "#426b7a"
  accent-magenta: "#e86f62"
  semantic-success: "#4f9f4b"

typography:
  note: "Use rounded local fallbacks only. Do not ship or imitate proprietary Nintendo fonts."
  display-xl:
    fontFamily: figmaSans
    fontSize: 86px
    fontWeight: 800
    lineHeight: 1.00
    letterSpacing: 0
  display-lg:
    fontFamily: figmaSans
    fontSize: 64px
    fontWeight: 760
    lineHeight: 1.10
    letterSpacing: 0
  headline:
    fontFamily: figmaSans
    fontSize: 26px
    fontWeight: 760
    lineHeight: 1.35
    letterSpacing: 0
  body:
    fontFamily: figmaSans
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: 0

rounded:
  md: 16px
  lg: 28px
  xl: 36px
  pill: 50px
  full: 9999px

components:
  floating-nav:
    backgroundColor: "{colors.block-cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    border: "2px {colors.hairline}"
    shadow: "soft ambient only, no chunky offset shadow"
  hero-visual:
    source: "https://my.spline.design/googlyeyes-pZmDXlBzedodrTTE2B4kOtSd-iwy/"
    layout: "full top-section iframe background"
    rounded: "{rounded.xl}"
    behavior: "use the Spline iframe directly; render it in an enlarged virtual viewport and scale it down so the characters are visible; do not overlay custom eyes or static replacement imagery"
  hero-search:
    text: "내가 원하는 서비스 검색하기"
    layout: "centered writable search input over Spline"
    shadow: "soft ambient only, no chunky offset shadow"
  product-card:
    structure: "rounded cream card, pastel media panel, circular accent avatar, compact action footer"
---

## Direction

Make the app feel like a cozy island notice board for discovering web/app products. Use cream paper, grass, sky, wood, fruit-like coral/yellow accents, rounded cards, thick soft borders, and floating controls.

## Rules

- Korean UI only.
- The menu bar must float above the page in a rounded pill shell.
- The homepage hero uses the full, uncropped Googly Eyes reference image as the top visual.
- The hero visual must use `object-fit: contain` so the full composition is visible.
- The center of the hero has a writable search input with `내가 원하는 서비스 검색하기`.
- Use cozy island-game mood, not Nintendo-owned assets, logos, characters, or exact fonts.
- Keep search visible in the first viewport.
- Product cards stay feed-like, rounded, and pastel.
