# Design System: Orthodoxe Tijd

A Dutch-language guide to the Orthodox rhythm of prayer (day, week, church year, saints, feasts, fasting, psalms).
This file describes the design system as it is actually built (source of truth: `src/index.css`, tokens `--ot-*`,
`--color-*`, `--lit-*`, `--hoeksier`). Use it to prompt new screens that belong to the same world.
All interface copy is **Dutch**.

## 0. Deliberate deviations from the generic taste rules

This project follows its own liturgical identity. Where a generic "premium UI" rule conflicts, the brand wins:

- **Serif is the core voice.** `Cormorant Garamond` is used for all titles, names, numbers and prayer text. It echoes
  printed prayer books and icon inscriptions. Do not replace it with a modern display serif.
- **Warm neutrals, not Zinc/Slate.** The base is dark bark brown and parchment. Cool grays are banned.
- **Centered, symmetric banners are correct here.** Variance is deliberately low: symmetry reads as liturgical order.
- **No perpetual micro-interactions.** Nothing loops by itself except two quiet signals (today's pulse, the candle
  glow). Every other movement starts from a user action. This is a place for prayer, not a dashboard.
- **Ornamental glyphs are allowed** as typography, never as emoji: `✣` (dividers), `✠` (great feast), `☦` (Pascha),
  `✦` (other feast), `◆` (banner rule), `›` (forward).

## 1. Visual Theme & Atmosphere

A quiet, candle-lit prayer book on a phone. Warm parchment pages framed by dark carved wood, thin gold rules and
small gold corner ornaments, with painted icon medallions as the only imagery besides the page banners.
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
- **Deep Gold** (#8A5A1E, `--color-gold-deep`) — gold for small text and icons on parchment
  (labels, `›`, borders on hover). Use this, not Liturgical Gold, for text on light backgrounds (contrast ≥ 5:1).
- **Gold Border** (Liturgical Gold at 60% opacity, `color-mix(... 60%, transparent)`) — the 1px card and field border.

**Parchment (reading surfaces)**
- **Parchment** (#F5ECD8 with a faint warm radial glow) — page background of every content page.
- **Ivory** (#F4E6C8, `--ot-ivory`) — text on dark; full-width light bands (for example "Vandaag gedenken wij").
- **Card Paper** (Ivory mixed with #FFFDF6 paper) — card, row and chip fill.

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

- **Display — Cormorant Garamond** (500–600). Page and section titles, names, prayer text, numbers.
  Page banner title: uppercase, letter-spacing 0.12–0.14em, `clamp(1.75rem, 7vw, 3.5rem)`.
  Section titles: sentence case, 22–26px. Always **lining numerals** (`font-variant-numeric: lining-nums`),
  so "1" never reads as "I".
- **Body — Alegreya Sans** (400–700). Descriptions and sublines 13–15px, relaxed leading (1.5), max about 65 characters.
- **Labels — Alegreya Sans** 11.5–12px, bold, uppercase, letter-spacing 0.14em, Deep Gold.
- Hierarchy through weight and color, not size jumps. Italic Cormorant only for quotes and prayer lines.
- **Banned:** Inter, system UI stacks, any second serif, monospace.

## 4. Component Stylings

- **Page banner.** A text-free photo (icons, candles, church interior) under a dark radial Bark overlay.
  Centered: small gold cross, uppercase title, subtitle, gold rule with `◆`, optional italic quote in Candle Gold.
  Compact on mobile (about 136px high), so reading starts on the first screen.
- **Light card or row (the default clickable element).** Card Paper fill, 1px Gold Border, 4px corners,
  a double inner line (inset 4px paper, 5px faint gold), gold corner ornaments (`hoeksier`, 12–14px) in two
  opposite corners, and a Deep Gold `›` at the right.
  - Hover and focus: the border turns Deep Gold and the soft shadow deepens slightly.
  - The same style is used for services, days, periods, psalm rows, prayer rows and "today" rows.
- **Medallion.** A round Bark disc with a 1–1.5px gold ring and a soft shadow, holding a painted icon, a gold cross
  or a number (Candle Gold, Cormorant, lining numerals). About 40–46px in rows and 64px in cards.
- **Search field.** The one dark input: Bark Two fill, Gold Border, Ivory text, gold magnifier, 4px corners.
  Selects and other filters stay light.
- **Filters.**
  - Top level: a **tab bar**, plain Cormorant text on parchment over a thin gold line; the active tab is darker and
    bolder with a 2px Deep Gold underline.
  - Second level: **thin light chips** with a Gold Border; the selected chip is Bark Two with Candle Gold text.
  - **Never a large yellow or gold fill for a selected state.**
- **Buttons.**
  - Secondary actions: outlined pill, Deep Gold 1px border, uppercase Alegreya Sans 13px bold, text ending in ` ›`.
  - Gold fill is reserved for the small "Vandaag" jump in the calendar and the calendar toggle (Oud/Nieuw).
  - Every button must do something: no decorative or dead buttons.
- **Big tiles (desktop).** Square dark tiles with a painted frame for the main entry points of a page. On mobile
  they become light rows.
- **Dialog.** A dark Bark header band (eyebrow date, centered Cormorant title, close ×) over a parchment body.
  Each section is a light card and each heading has a thin gold line after it. Long lists collapse behind a
  "Meer … (n)" disclosure.
- **Floating "naar boven" button.** A 44px Bark medallion with a gold ring and a chevron, bottom-right above the
  navigation. It appears only after scrolling far on long pages.
- **Bottom navigation (mobile).** Five items on Bark, gold active state.

## 5. Layout Principles

- Mobile first (375px), single column below 768px, 16px side gutters, content max-width 1500px.
- **Where light and dark go:**
  - Reading and list content always sits on parchment.
  - Dark is reserved for the frame (header, navigation, banners), medallions, the search field, selected states,
    and at most one accent block per page.
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
  a gold glow and the rings grow and shrink, and the matching prayer line lights up.
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
  - no rounded "SaaS" cards (keep 4px corners) and no floating pastel UI;
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
