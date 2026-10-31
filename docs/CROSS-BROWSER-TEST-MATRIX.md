# Cross-Browser & Device Test Matrix

**Read this first.** The build environment provides **headless Chromium (Playwright) only**. No Safari, no Firefox, no Edge, no iPhone, no Android hardware was available. Every row below that was not actually executed is marked **Not tested** — it is *not* marked PASS. Emulated viewports are labelled *emulated* and are not a substitute for a real device or a real browser engine.

Legend: **PASS (local)** = executed here against the local production build · **Not tested** = not executed, no result claimed · **EXTERNAL INPUT REQUIRED** = needs a deployed URL and/or hardware.

## Desktop

| Browser | Version | Engine | Result | Notes |
|---|---|---|---|---|
| Chromium (headless) | Playwright 1.63 bundled | Blink | **PASS (local)** | 1440×900. Navigation, language switch, RTL/LTR, 3D, reduced motion, forms, 404, canonical/hreflang verified against the local build. |
| Chrome (stable, desktop) | — | Blink | **Not tested** | Blink is shared with Chromium, but the branded build and its extensions/GPU path were not exercised. Requires the deployed URL. |
| Edge (stable) | — | Blink | **Not tested** | Requires the deployed URL. |
| Firefox | — | Gecko | **Not tested** | Gecko is a *different engine* (CSS `color-mix`, `text-wrap: balance`, `svh` units, WebGL behaviour all differ). **Must be tested before launch.** |
| Safari (macOS) | — | WebKit | **Not tested** | WebKit differs on `backdrop-filter`, `svh`, font rendering and WebGL. **Must be tested before launch.** |

## Mobile

| Device | Browser | Engine | Result | Notes |
|---|---|---|---|---|
| Emulated 390×844 (iPhone-class viewport) | Chromium | Blink | **PASS (local)** | Layout, no horizontal overflow, RTL, reduced-motion fallback, contact form fields. *Emulated — not a real device.* |
| Emulated 834×1112 (tablet viewport) | Chromium | Blink | **PASS (local)** | Layout and sector grid. *Emulated.* |
| iPhone (real hardware) | Safari | WebKit | **Not tested** | EXTERNAL INPUT REQUIRED — no device. |
| Android phone (real hardware) | Chrome | Blink | **Not tested** | EXTERNAL INPUT REQUIRED — no device. |

## Test checklist for the real-device pass (run once the site is live)

| # | Area | What to do | Pass condition |
|---|---|---|---|
| 1 | Navigation | Open the menu, follow every link, use the language switch | Every link resolves; no dead end |
| 2 | Touch | Tap targets, dropdowns, the mobile menu | No mis-taps; targets ≥44 px |
| 3 | Scroll | Scroll the full homepage and back | No jank, no horizontal drift |
| 4 | Forms | Submit empty, then valid, on the contact form | Clear inline errors, then success state |
| 5 | 3D | Desktop: hero object appears after the copy | Object loads, page never blocked |
| 6 | 3D fallback | Phone / reduced motion / Data Saver | Static composition, no canvas, no error |
| 7 | Reduced Motion | Enable in OS settings, reload | Intro and 3D both skipped |
| 8 | RTL | Open `/ar` | Text right-aligned, mirrored layout intact |
| 9 | LTR | Open `/en` | Text left-aligned, layout intact |
| 10 | Images | Inspect hero, OG, screenshots | No broken image icon anywhere |
| 11 | Fonts | Cold load both locales | No flash of invisible/unstyled text |
| 12 | Horizontal overflow | Compare `scrollWidth` to viewport on every page | Equal at every width |
| 13 | Contact | Submit a real enquiry | Message arrives in `CONTACT_INBOX` |

## Environment actually used for this run

| Item | Value |
|---|---|
| Browser | Chromium via Playwright (headless), `--no-sandbox --disable-dev-shm-usage` |
| Server | `next start` (production build) on `127.0.0.1` |
| Node | v22.23.2 |
| Next.js | 14.2.35 |
| Quirks | Shared CPU sandbox; Lighthouse numbers are **Local**, not field data. WebGL executes via SwiftShader software rendering, so 3D timing is not representative of GPU hardware. |


## PWA — installability & offline

| Browser | Device | Version | Result | Notes |
|---|---|---|---|---|
| Chromium (headless) | localhost 390x844 | Playwright bundled | PASS | SW registered, controller=true, offline navigation shows the offline copy (AR+EN) |
| Chrome mobile | real Android | — | Not tested | needs a real handset |
| Safari | real iPhone/iPad | — | Not tested | different engine/install model |
| Firefox | desktop/mobile | — | Not tested | no driver here |
