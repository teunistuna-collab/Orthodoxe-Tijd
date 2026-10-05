# Design System: Orthodoxe Tijd

A Dutch-language guide to the Orthodox rhythm of prayer (day, week, church year, saints, feasts, fasting, psalms).
This file describes the design system as it is actually built (source of truth: `src/index.css`, tokens `--ot-*`,
`--color-*`, `--lit-*`, `--hoeksier`). Use it to prompt new screens that belong to the same world.
All interface copy is **Dutch**.

## 0. Deliberate deviations from the generic taste rules

This project follows its own liturgical identity. Where a generic "premium UI" rule conflicts, the brand wins:

- **Serif is the core voice, in three roles.** `Cinzel` (inscription capitals) for page titles, small labels and
  buttons; `Cormorant Garamond` for card titles, navigation and descriptions; `EB Garamond` for prayers, psalms and
  long reading texts. Together they echo icon inscriptions and printed prayer books. No sans-serif, no modern serif.
- **Warm neutrals, not Zinc/Slate.** The base is dark bark brown and parchment. Cool grays are banned.
- **Centered, symmetric banners are correct here.** Variance is deliberately low: symmetry reads as liturgical order.
- **No perpetual micro-interactions.** Nothing loops by itself except two quiet signals (today's pulse, the candle
  glow). Every other movement starts from a user action. This is a place for prayer, not a dashboard.
- **Ornamental glyphs are allowed** as typography, never as emoji: `✣` (dividers), `✠` (great feast), `✦` (other
  feast), `›` (forward). The cross is always the gold cross image (`public/images/ui/kruis.webp`, also as a CSS mask
  in liturgical colors via `KruisTeken`), never the ☦ glyph.

## 1. Visual Theme & Atmosphere

A quiet, candle-lit prayer book on a phone. One continuous sheet of aged parchment (a fixed texture behind every
page), an illuminated Byzantine arch at the top of each page and dialog, and buttons that look printed and painted on
the same parchment, slightly worn. The Christ icon (Pantocrator) is the only figurative image on Vandaag and the cycles.
Calm, reverent, legible; never flashy, never "app-store SaaS".

- **Density 4** — daily-app balanced; generous line height for reading, compact lists for navigation.
- **Variance 2** — symmetric, centered headings, single column on mobile.
- **Motion 3** — restrained CSS transitions (150–300 ms); motion only where it carries meaning.

## 2. Color Palette & Roles

Warm palette only. One accent family: gold. Never pure black.

**Dark wood (frame and accents)**
- **Bark** (#1B0D09, `--ot-bark`) — darkest surface: banner overlay, header, bottom navigation, text-shadow on photos.
- **Bark Two** (#2C180F, `--ot-bark2`) — dark surfaces inside light pages: search field, medallion fill,
  the *selected* chip, tile or day.

**Gold (the single accent)**
- **Liturgical Gold** (#C49332, `--ot-gold`) — rings around medallions, 1px rules, corner ornaments, `›` on dark.
- **Candle Gold** (#E0B95A, `--ot-gold2`) — gold *text* on dark (selected chip label, numbers in medallions), focus on dark.
- **Deep Gold** (#7D5218, `--color-gold-deep`) — gold for small text and icons on parchment
  (labels, `›`, printed button edges). Use this, not Liturgical Gold, for text on light backgrounds (contrast ≥ 4.9:1
  on the parchment texture).
- **Gold Border** (Liturgical Gold at 60% opacity, `color-mix(... 60%, transparent)`) — the 1px card and field border.

**Parchment (reading surfaces)**
- **Parchment** (`public/images/ui/perkament.webp`, fixed, fallback #F7E4BB) — the background of the whole site and of
  every dialog. Large panels are transparent so they become one with it.
- **Button Parchment** (`--knop-vlak`: the same texture under a 50% warm white wash) — cards, rows, buttons and search
  fields: a few shades lighter than the page, so they stay distinct.
- **Ivory** (#F4E6C8, `--ot-ivory`) — text on dark.

**Ink (text)**
- **Ink** (#2B1D12, `--color-ink`) — primary text on parchment.
- **Ink Soft** (#6B5B45, `--color-ink-soft`) — secondary text, sublines, descriptions.
- **Heading Ink** (#4B2D20, `--ot-ink`) — section headings inside dialogs.

**Liturgical signals (calendar only, never decorative)**
- **Wine Red** (#7D1F25, `--ot-wijnrood`) — Sundays, liturgical red.
- **Lazuli** (#233F8C) — feasts of the Mother of God.
- **Olive** (#566A2B) — Palm Sunday, Pentecost.
- **Violet** (#4A2A76) — Cross feasts, Sundays of Lent.
- Liturgical white = Ivory with a gold edge; fasting black = Bark.

## 3. Typography Rules

Self-hosted via `@fontsource` (`src/main.tsx`); tokens `--font-titel`, `--font-display` / `--font-body`, `--font-lees`.

| Role | Font |
|---|---|
| Page title (banner), `h1` | **Cinzel** 500 |
| Small uppercase labels | **Cinzel** 500, letter-spacing 0.14em, Deep Gold |
| Buttons | **Cinzel** 500, letter-spacing 0.08em |
| Card titles, section titles | **Cormorant Garamond** 500–600 |
| Navigation | **Cormorant Garamond** 500 |
| Descriptions | **Cormorant Garamond** 400, at least 15px (16px from tablet) |
| Prayers, psalms, long saints' lives (reading dialogs) | **EB Garamond** 400 |

- Always **lining numerals** in Cormorant (`font-variant-numeric: lining-nums`), so "1" never reads as "I".
- Hierarchy through weight and color, not size jumps. Italic only for quotes and prayer lines.
- **Banned:** sans-serif, Inter, system UI stacks, monospace.

## 4. Component Stylings

- **Page banner (sier-kop)** — `PageHero`, on every page except Vandaag. An illuminated arch cut out of its
  parchment (`scripts/sierkop.mjs`), the gold cross under its point and the page title (Cinzel, uppercase) in the
  opening. Mobile: the 3:1 arch (`boog.webp`). From 768px: a flatter arch (`boog-web.webp`) as a low 200px band,
  cropped from the top. The banner is sticky; content scrolls away beneath it.
- **Vandaag** has no banner: the Christ icon, then the date head.
- **Card or row (the default clickable element).** Button Parchment fill, a worn, printed double ink line in Deep Gold
  as a 9-slice `border-image` (`knop-rand.png`, `scripts/knop-rand.mjs`), square corners, a Deep Gold `›` at the
  right. **No round icons or medallions inside buttons.** Hover brightens slightly; press moves 1px down.
  The same style is used for services, days, periods, psalm rows, prayer rows, "today" rows and the big desktop tiles.
- **Search field and selects.** Same as a card: Button Parchment, printed edge, Ink text, Deep Gold magnifier.
- **Cycle rings (Etmaal, Week, Jaar, Pascha, desktop).** The Christ icon in the center; each position on the ring is
  a small gold dot, and the card beside it is the button.
- **Filters.**
  - Top level: a **tab bar**, plain Cormorant text on parchment over a thin gold line; the active tab is darker and
    bolder with a 2px Deep Gold underline.
  - Second level: **thin light chips** with a Gold Border; the selected chip is Bark Two with Candle Gold text.
  - **Never a large yellow or gold fill for a selected state.**
- **Buttons.**
  - Actions: the printed-parchment style above, Cinzel 500 uppercase, text ending in ` ›`.
  - A gold wash marks the selected calendar (Oud/Nieuw) and the small "Vandaag" jump in the calendar.
  - Every button must do something: no decorative or dead buttons.
- **Dialog.** Parchment throughout. The header is the same arch as the page banner with cross and title; the eyebrow
  (date, kind of reading) sits small in Cinzel just below the arch; the close × is a round parchment button. Long
  titles run on below the cross. In evening reading mode the body inverts and the header switches to a tight-cut arch
  (`boog-nacht.webp`) on #1D1400. Each section is a card; long lists collapse behind a "Meer … (n)" disclosure.
- **First visit.** One menu: calendar (Oud · juliaans / Nieuw · gregoriaans) and tradition (Koptisch, Syrisch,
  Oosters Orthodox). A tradition button closes it and opens Vandaag. Reachable later from the footer.
- **Floating "naar boven" button.** A 44px Bark medallion with a gold ring and a chevron, bottom-right above the
  navigation. It appears only after scrolling far on long pages.
- **Bottom navigation (mobile).** Five items on Bark, gold active state.

## 5. Layout Principles

- Mobile first (375px), single column below 768px, 16px side gutters, content max-width 1500px.
- **Where light and dark go:**
  - Reading and list content always sits on parchment.
  - Dark is reserved for the frame (header, bottom navigation), the site search panel, the Bronnen page and at most
    one accent block per page.
- Pages are one continuous flow. Avoid alternating light and dark bands more than once.
- Tap targets are at least 44px. There is never horizontal scroll on a page (horizontal scroll inside a tab bar
  is allowed).
- Keep empty space tight on mobile: panels start 20–24px below the banner and lists 18px below their heading.

## 6. Motion & Interaction

- CSS only. Durations 150–300 ms, ease or ease-in-out. Animate only `transform` and `opacity`, plus `height` for disclosures.
- **Existing vocabulary:**
  - pages fade in (280 ms);
  - disclosures slide open (280 ms);
  - the `›` nudges 3px on hover;
  - today's date pulses softly;
  - the candle glow flickers.
- **"Adem mee" (breathe along)** on the Jesus Prayer runs only after a tap. It uses an 8 s cycle: 4 s in and 4 s out;
  a warm Byzantine-red glow behind the Christ icon and the rings grow and shrink, and the matching prayer line lights up.
- `prefers-reduced-motion`: no movement. Only opacity signals remain.

## 7. Anti-Patterns (Banned)

- **Visual style:**
  - no emoji;
  - no Inter or system fonts;
  - no pure black;
  - no cool grays;
  - no neon, glow halos or colored drop shadows beyond soft warm shadows.
- **Color use:**
  - no large gold or yellow fills for selected states;
  - no more than one dark accent block on a light page;
  - no saturated accents outside the liturgical calendar colors.
- **Shape and layout:**
  - no rounded "SaaS" cards or pills (printed, square edges) and no floating pastel UI;
  - no round icons or medallions inside buttons;
  - no 3-equal-card marketing rows;
  - no glassmorphism;
  - no custom cursors.
- **Copy and behavior:**
  - no animations that loop by themselves (except today's pulse and the candle);
  - no generated or paraphrased liturgical texts, prayers or psalm translations;
  - no invented saints' data;
  - no dummy audio;
  - no English leftovers in Dutch UI;
  - no AI copywriting ("Ontdek de magie…", "naadloos");
  - no filler such as "Scroll om te ontdekken" or bouncing arrows;
  - no buttons without a function.
