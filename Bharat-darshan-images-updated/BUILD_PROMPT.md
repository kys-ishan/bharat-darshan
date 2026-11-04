# Bharat Darshan — Heritage Atlas India
## Master build spec (plain HTML / CSS / JS — no build step)

This is the single source of truth for the project. Use it for every new feature.
**Keep this theme and these features exactly as written.**

---

## 1. What this is

A map-first digital heritage and travel platform for discovering 20–30 important
monuments across India. It must feel like a **vintage digital museum** crossed with
an **elegant travel explorer** — visually impressive for a hackathon, but technically
realistic: **static local data, browser storage, frontend logic only.**

No login. No backend. No paid APIs. No API keys.

Do not merely plan — **build the complete working site.**

---

## 2. Technology

Plain HTML, CSS and JavaScript. **No framework, no bundler, no build step.**
It must open by double-clicking `index.html`, and also work on any static host.

| Need | Use |
|---|---|
| Map | Leaflet (CDN) |
| Marker clustering | Leaflet.markercluster (CDN) |
| 360° tour | Pannellum (CDN) |
| Optional 3D model | Google `<model-viewer>` (CDN), with graceful fallback |
| Audio guide | `window.speechSynthesis` |
| Saved data | `localStorage` |
| Fonts | Google Fonts, with system fallbacks |

**File structure**

```
bharat-darshan/
├─ index.html            Explore map (home)
├─ monument.html         Detail page, reads ?id=
├─ journey.html          Itinerary + passport
├─ guess.html            "Guess the Monument" game
├─ about.html            Team, architecture, credits, licences
├─ stories/
│   └─ taj-mahal.html    Featured heritage experience
├─ css/
│   ├─ base.css          Theme tokens, layout, components
│   └─ pages.css         Page-specific styles
├─ js/
│   ├─ sites-data.js     ★ ALL monument data lives here
│   ├─ i18n.js           English / हिन्दी dictionary
│   ├─ store.js          localStorage helpers
│   ├─ app.js            Map, markers, filters, search
│   ├─ monument.js       Detail page logic
│   ├─ journey.js        Itinerary logic
│   └─ quiz.js           Quiz + badges
└─ assets/
    ├─ 360/              Panorama images
    └─ img/              Photos, close-ups
```

**File ownership (3-person team, avoids merge conflicts):**

| Person | Owns |
|---|---|
| A | `js/sites-data.js`, `assets/`, credits in `about.html` |
| B | `index.html`, `js/app.js`, `js/journey.js`, `journey.html` |
| C | `monument.html`, `stories/`, `js/monument.js`, `js/i18n.js`, `css/` |

Never edit a file you do not own — message the owner instead.

---

## 3. Visual identity — VINTAGE HERITAGE

Elegant **vintage ancient-Indian heritage**: aged manuscripts, moss-covered ruins,
weathered sandstone, hand-painted Mughal/Rajput art. Sophisticated and minimal —
never loud or stereotypical.

### Colour tokens (exact values)

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#0A3323` | Deep forest green — primary text, dark surfaces, footer |
| `--moss` | `#839958` | Moss green — secondary, botanical accents, success |
| `--parchment` | `#F7F4D5` | Warm ivory — page background, cards |
| `--rose` | `#D3968C` | Rosy brown — primary accent, buttons |
| `--teal` | `#105666` | Midnight green — deep accent, links, map chrome |
| `--gold` | `#C9A227` | Antique gold — UNESCO crests, hairline frames |
| `--oxblood` | `#7B2E2E` | Deep maroon — rare emphasis only |

Body text `#0A3323` on `#F7F4D5`. Inverse `#F7F4D5` on `#0A3323`.
All pairs must pass **WCAG AA** contrast.

### Landing page

- Warm parchment base with subtle paper-grain texture
- Manuscript-style frames: thin double rules with a gold hairline
- Cusped multifoil **arch** shapes for section headers and the hero mask
- Light jali-screen pattern and lotus line motifs as quiet separators
- Hero: moss-covered ruins imagery under a parchment scrim, large serif display type
- Weathered edges used sparingly — **never on every card**
- Micro-animations only: marker pulse, card fade/slide, route draw, soft hover lift
- **Respect `prefers-reduced-motion`**

**Avoid:** neon, glassmorphism, heavy gradients, stock-dashboard styling,
religious imagery used decoratively without context.

### Typography

- Headings: refined serif (Cormorant Garamond / Playfair Display / Marcellus)
- Body: clean sans (Inter / Source Sans 3)
- Hindi: Noto Sans Devanagari

### Brand

Header: **Bharat Darshan** — subtitle: **Heritage Atlas India**
Logo: a map pin combined with a small cusped arch outline. No copyrighted logos.

---

## 4. Navigation

Sticky top bar: logo · Explore Map · Heritage Stories · My Journey · About ·
English/हिन्दी toggle · Accessibility menu · mobile hamburger.

Accessibility menu: High contrast · Larger text · Reduced motion · Map/list guidance.

---

## 5. Home page — interactive heritage map

Hero:

> **Explore India through stories etched in stone.**
>
> Discover forts, temples, stepwells, caves, and world heritage sites across India.

### Map

Leaflet with sensible India bounds. Two base layers — street and satellite with
correct attribution — via `L.control.layers()`.

20–30 curated monuments balanced across regions:

Taj Mahal · Agra Fort · Fatehpur Sikri · Qutub Minar · Red Fort · Humayun's Tomb ·
Amer Fort · Mehrangarh Fort · Jaisalmer Fort · Rani ki Vav · Ajanta Caves ·
Ellora Caves · Elephanta Caves · Khajuraho · Sanchi Stupa · Hampi ·
Brihadeeswarar Temple · Mahabalipuram · Golconda Fort · Charminar ·
Konark Sun Temple · Nalanda · Mahabodhi Temple · Victoria Memorial · Rang Ghar

**Never invent** historical claims, dates, government URLs, UNESCO labels or
citations. Mark unverified content as `TODO`. Only write "Official source" when the
URL is verified — otherwise use "ASI portal" or "Official tourism portal".

### Marker system

Custom SVG teardrop markers. **Every marker has an icon AND an accessible text
label — colour alone must never convey meaning.**

- **Fort** — crimson red, fortress/rampart icon
- **Stepwell / baoli** — water teal, stair/water icon
- **Temple / monument** — amber gold, dome/pillar/arch icon
- **Cave** — moss green, cave-entrance icon
- **UNESCO** — keep the site's **own type colour**, then add a **gold outline +
  heritage crest icon**, so type and UNESCO read at the same time

Marker clustering at low zoom. Selected marker gets a subtle pulse or halo.

### Search and filters

Autocomplete search — typing `Kon` suggests `Konark Sun Temple`. Searches
monument, city, state and tags.

Collapsible multi-select filter panel:

- **Region** — North, South, East, West, Central, Northeast
- **Site type** — Fort, Temple, Stepwell, Cave, Tomb, Palace, Monument
- **Tradition** — Hindu, Buddhist, Jain, Islamic, Sikh, Colonial, Multi-tradition
- **Era** — Ancient, Medieval, Mughal, Colonial, Modern
- **UNESCO World Heritage**
- **ASI protected** (only where data supports it)

**Do not use a "Faith" filter** — use the tradition tagging above.

Filters update markers, list results and result counts instantly.

### Preview card

On marker click: desktop = right-side floating panel, mobile = bottom sheet.

Shows image · name · city/state · region · era · one-line description · UNESCO
badge · **View Details** · **Add to Journey** · **Mark Visited**.

Hover cards allowed on desktop, but everything must work with click, touch and
keyboard.

Provide a **Map view / List view** switch. List view shows all filtered monuments
and lets keyboard users pick one and focus the map.

### Near Me

Requests geolocation, lists monuments within **50 km** (Haversine), shows distance
per result. On failure, show a **"Choose a city"** dropdown (Delhi, Mumbai, Jaipur,
Agra, Chennai, Bengaluru, Kolkata, Hyderabad, Varanasi). Always state distance is
approximate.

---

## 6. Heritage Story Mode (every monument)

Each monument page opens with **five swipeable cards / a compact timeline**:

1. **Why it was built**
2. **Who built it**
3. **What to notice in its architecture**
4. **How it changed over time**
5. **Why it matters today**

Short, scannable text — no wall of prose. One visual per stage. Numbered progress,
swipe + arrows + keyboard. Horizontal carousel on mobile, vertical timeline on
desktop. Translated to Hindi where content exists.

**This replaces long unbroken history paragraphs.**

---

## 7. Monument detail page — `monument.html?id=`

Hero image · name · city/state/region · type and era · tradition tags · short
intro · **Heritage Story Mode** · **"What makes it special"** three visual fact
cards (Architecture / History / Cultural significance) · quick facts · official
source link opening in a new tab · **Add to Journey** · **Mark as Visited** ·
**Listen to History** · sources and attribution · photo licence/credit ·
loading and empty states.

**Never** add Related Discoveries, Nearby Discoveries or recommendation sections.

---

## 8. Journey page — `journey.html`

- Max **5 stops** per trip
- Itinerary cards with accessible **up/down** reorder controls, plus remove
- **Dashed polyline** connecting stops in order
- Cumulative Haversine distance labelled **"Approximate straight-line distance"**
- If drive time shown: label it a rough estimate, say it is not live navigation,
  and link out to an external map service
- Summary: stops, distance, duration, regions covered
- Auto-save to `localStorage`
- Mark visited
- Heritage passport ring, e.g. `8 / 25 sites visited`
- Badges in `localStorage`
- WhatsApp share via a `wa.me` **text** link:
  "I explored 8 heritage sites on Bharat Darshan!"

Badges: Mughal Explorer · Temple Trailblazer · Cave Chronicle · Heritage Scholar ·
India Atlas Explorer

State that journey data stays on the user's device unless they share it.

---

## 9. Featured experience — `stories/taj-mahal.html`

Title: **"Taj Mahal: A Monument of Memory"**

Immersive hero · short poetic-but-factual intro · **360° Heritage Tour** ·
**full Heritage Story Mode** · **Architecture hotspots** · **Manuscript Lens** ·
quick facts · sources/official links · quiz · audio guide.

### 360° tour (Pannellum)

Equirectangular panorama from `assets/360/`. If missing, show a polished fallback
state and document where to add the image.

Hotspots: **Main dome · Marble inlay · Calligraphy · Charbagh garden · Minarets**
Each opens a card with icon, title, short text and a close button.

Label it **"360° Site Tour"** — never "3D twin" unless a real 3D model exists.

### Manuscript Lens

Historical manuscript image (or high-quality placeholder) with highlighted regions.
Click a region → original crop · OCR transcription · plain-English explanation ·
script/language metadata · archive link · attribution and rights.

Call it **"AI-assisted transcription demo"** only if real OCR content is used;
otherwise **"Manuscript interpretation demo."**
Pre-prepared sample content only. No upload system, no claim of supporting all
Indian scripts.

### 3D artefact viewer

One `<model-viewer>` with rotate/zoom/camera controls, loading poster, accessible
description, attribution, path like `assets/models/heritage-artefact.glb`.
If the file is missing, show a **beautiful fallback card** explaining where to put
it — never a broken component. Never add an unrelated model to fill space.

---

## 10. Quiz and gamification (offline, no API)

- Featured monuments: **3 MCQ** each, stored in `sites-data.js`
- Standard pages: at most one optional "Did you notice?" question
- **`guess.html`** — "Guess the Monument": five visual challenges using close-up
  images of arches, carvings, pillars, domes, stairwells

Immediate feedback · explanation after each answer · progress indicator · badges in
`localStorage` · **no external API, no leaderboard, no account.**

---

## 11. Language and audio

**English / हिन्दी** switch covering navigation, buttons, filters, empty states,
accessibility labels and core UI text via a client-side dictionary. Persist choice
in `localStorage`. Devanagari typography in Hindi mode. Bilingual monument fields
where available. **Do not pretend long articles are professionally translated.**

**Listen to History** — play / pause / resume / stop via `speechSynthesis`.
`en-IN` in English, `hi-IN` in Hindi. Graceful fallback if unavailable.
Visible transcript always present.

---

## 12. Accessibility (core feature, not an afterthought)

Semantic landmarks · visible focus states · ARIA labels on buttons, map controls,
markers, dialogs and icon-only controls · keyboard-accessible marker list ·
map/list toggle · high-contrast mode · larger-text mode · reduced-motion support ·
AA contrast · alt text on meaningful images · **no essential info on hover only** ·
~44px touch targets · correct focus management for modals, drawers and bottom sheets.

---

## 13. Responsive

**Desktop** — large map, floating filters, right-side preview, rich split layouts.
**Mobile** — full-width map, sticky search, filter drawer, bottom-sheet details,
stacked cards, touch-friendly buttons, **no horizontal overflow**.

---

## 14. Data model

Every entry in `js/sites-data.js`:

```js
{
  id, name, nameHi, slug,
  latitude, longitude,
  city, state, region,
  siteType,        // fort | temple | stepwell | cave | tomb | palace | monument
  era,             // ancient | medieval | mughal | colonial | modern
  traditions: [],  // hindu | buddhist | jain | islamic | sikh | colonial | multi
  isUnesco, isOfficiallyProtected,
  heroImage, thumbnailImage,
  shortDescription, shortDescriptionHi,
  history, historyHi,
  story: [         // Heritage Story Mode — exactly 5 stages
    { title, titleHi, body, bodyHi, image }
  ],
  quickFacts: [],
  officialSourceLabel, officialSourceUrl,
  sources: [],
  photoCredit, photoLicense,
  quiz: [ { q, options[], answer, explain } ],
  pano360,         // optional
  featured
}
```

Data stays separate from UI. Use image placeholders with comments saying where
real licensed images go.

---

## 15. Quality bar

Runs without errors · no broken images or links · no blank components ·
loading, empty and error states · reusable components · looks finished, not a
wireframe · realistic text, never lorem ipsum · **never fabricate sources or
official links** · all placeholders clearly documented · no recommendation
sections · a beginner can keep editing it.

---

## 16. Definition of done (before Oct 29, 18:30 IST)

- [ ] All pages open with zero console errors
- [ ] Every photo URL loads, every gov link opens
- [ ] Map, filters, search, clustering, preview card work
- [ ] Journey: add → reorder → route → distance → save
- [ ] Heritage Story Mode on every monument
- [ ] 360° tour + hotspots on Taj page
- [ ] Hindi toggle flips the whole UI
- [ ] Keyboard-only pass + reduced motion
- [ ] `README.md` — setup, asset locations, data structure
- [ ] `about.html` — **all photo credits and licences (CC BY-SA requires this)**
- [ ] Public GitHub repo with clean commit history
- [ ] Unlisted YouTube walkthrough
- [ ] Pitch deck — problem, architecture, schema, scalability
