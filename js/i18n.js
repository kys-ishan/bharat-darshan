/**
 * ============================================================
 *  Bharat Darshan — i18n.js
 *  Client-side English / हिन्दी dictionary. Person C owns this file.
 *
 *  How it works
 *  ------------
 *  1. Put a key on any element:      <h1 data-i18n="hero.h1">
 *  2. Placeholder:                   <input data-i18n-ph="search.ph" />
 *  3. Accessible name:               <button data-i18n-al="pv.close" />
 *  4. Call applyLang() — it walks the DOM and fills them in.
 *  5. For text you build in JS, call t('some.key') directly.
 *
 *  RULE: only translate UI chrome here. Long article text lives in
 *  sites-data.js as its own *Hi field, and we never pretend that
 *  automatically-produced Hindi is a professional translation.
 * ============================================================
 */

const I18N = {
  en: {
    "nav.map":       "Explore Map",
    "nav.stories":   "Heritage Stories",
    "nav.journey":   "My Journey",
    "nav.about":     "About",
    "nav.archive":   "Living Archive",
    "nav.manuscript":"Field Notes Reader",
    "nav.graph":     "Knowledge Graph",
    "nav.a11y":      "Accessibility",
    "nav.menu":      "Menu",
    "nav.otherLang": "हिन्दी",

    "hero.kicker": "A digital heritage atlas",
    "hero.h1a":    "Explore India through",
    "hero.h1b":    "stories etched in stone.",
    "hero.lede":   "Discover forts, temples, stepwells, caves and world heritage sites across India — their history, architecture and the routes between them.",
    "hero.cta1":   "Open the map",
    "hero.cta2":   "Read a heritage story",
    "hero.scroll": "Scroll",
    "facts.sites":   "25 sites",
    "facts.regions": "6 regions",
    "facts.eras":    "4 eras",

    "feature.kicker": "Featured story",
    "feature.title":  "The Taj Mahal, read in five acts",
    "feature.desc":   "A marble tomb built for an emperor's beloved wife, a garden conceived as paradise, and a silhouette that became shorthand for India itself. Walk the mausoleum in 360°, then follow its story from commission to conservation.",
    "feature.f1":     "Built 1632–1653",
    "feature.f2":     "UNESCO World Heritage",
    "feature.f3":     "Agra, Uttar Pradesh",
    "feature.cta1":   "Open the 360° story",
    "feature.cta2":   "Read the full record",

    "stories.kicker":   "Heritage Stories",
    "stories.title":    "Every monument, told in full",
    "stories.sub":      "Twenty-five sites across six regions. Open any one for its history, its architecture, and the routes that connect it to the rest of the atlas.",
    "stories.note":     "Only the Taj Mahal has the full interactive treatment with a 360° tour. Every other site opens its record, where the same five-part story is set out.",
    "stories.count":    "{sites} sites · {regions} regions",
    "stories.go":       "Open this story →",
    "stories.goFull":   "Open the full story →",
    "stories.tourFlag": "360° tour",

    "search.ph":     "Search a monument, city or state…",
    "search.label":  "Search monuments",
    "view.map":      "Map view",
    "view.list":     "List view",
    "filters.btn":   "Filters",
    "filters.near":  "Near me",
    "filters.region":    "Region",
    "filters.siteType":  "Site type",
    "filters.traditions":"Tradition",
    "filters.era":       "Era",
    "filters.flags":     "Recognition",
    "filters.clear":     "Clear all filters",
    "filters.city":      "Choose a city:",
    "filters.none":      "No sites match these filters. Try clearing one or two.",

    "list.head":  "All sites — list view",
    "list.desc":  "Pick a site to focus it on the map. Every filter above applies here too.",

    "pv.details":   "View details",
    "pv.journey":   "Add to Journey",
    "pv.visited":   "Mark visited",
    "pv.visitedOn": "Visited ✓",
    "pv.close":     "Close preview",

    "count":        "{n} sites shown",
    "countOne":     "1 site shown",
    "dist":         "~{d} km away",
    "legend.title": "Legend",
    "legend.fort":  "Fort / monument",
    "legend.temple":"Temple",
    "legend.stepwell":"Stepwell",
    "legend.cave":  "Cave",
    "legend.unesco":"★ = UNESCO World Heritage",

    "tag.unesco": "UNESCO World Heritage",
    "tag.asi":    "ASI protected",
    "tag.prot":   "Protected",

    "region.North": "North", "region.South": "South", "region.East": "East",
    "region.West": "West", "region.Central": "Central", "region.Northeast": "Northeast",

    "siteType.fort": "Fort", "siteType.temple": "Temple", "siteType.stepwell": "Stepwell",
    "siteType.cave": "Cave", "siteType.tomb": "Tomb", "siteType.palace": "Palace",
    "siteType.monument": "Monument",

    "traditions.hindu": "Hindu", "traditions.buddhist": "Buddhist", "traditions.jain": "Jain",
    "traditions.islamic": "Islamic", "traditions.sikh": "Sikh",
    "traditions.colonial": "Colonial", "traditions.multi": "Multi-tradition",

    "era.ancient": "Ancient", "era.medieval": "Medieval", "era.mughal": "Mughal",
    "era.colonial": "Colonial", "era.modern": "Modern",

    "flags.unesco": "UNESCO World Heritage",
    "flags.asi":    "ASI protected",

    "near.fallback": "Location unavailable — pick a city instead.",
    "near.denied":   "Location permission was declined. Pick a city instead.",
    "near.empty":    "No sites within {d} km of you. Showing the nearest ones instead.",

    "journey.add":   "Added to My Journey",
    "journey.remove":"Removed from My Journey",
    "journey.full":  "Your journey already has 5 stops. Remove one first.",
    "visited.set":   "Marked as visited",
    "visited.unset": "Marked as not visited",

    "listen.label":  "Listen to history",
    "listen.play":   "▶ Play",
    "listen.pause":  "⏸ Pause",
    "listen.resume": "⏵ Resume",
    "listen.stop":   "■ Stop",
    "listen.hint":   "Read along below — the text is always visible.",
    "listen.unsupported": "Your browser has no speech engine. The full text is below.",

    "mon.journey":   "Add to Journey",
    "mon.visited":   "Mark visited",
    "mon.map":       "Show on map",
    "mon.sources":   "Official sources",
    "mon.credits":   "Image credit",
    "mon.quiz":      "A few questions",
    "mon.story":     "Five stages, one monument",
    "mon.special":   "What makes it special",
    "mon.history":   "How it came to be",
    "mon.loading":   "Loading…",
    "mon.notfound":  "We could not find that monument.",
    "mon.notfoundHelp": "It may have been removed. Go back to the map and pick a site from the list.",
    "story.stage":   "Stage",
    "story.prev":    "← Prev",
    "story.next":    "Next →",

    "jr.title":  "My Journey",
    "jr.sub":    "Up to five stops, saved on this device only. Reorder them with the arrow buttons — every control works from the keyboard.",
    "jr.stops":  "Your stops",
    "jr.addMore":"Add more stops",
    "jr.badges": "Badges",
    "jr.share":  "Tell a friend",

    "taj.kicker": "Immersive heritage story · 360°",
    "taj.start":  "Start the 360° tour",
    "taj.detail": "Full detail page",

    "guess.title":   "Guess the Monument",
    "guess.kicker":  "Visual challenge",
    "guess.sub":     "Five close-up details, four possible names each. Everything runs in " +
                     "your browser — no account, no timer pressure, no leaderboard.",
    "guess.rule":    "You will see a zoomed detail of a real photograph. Pick the right " +
                     "name from four choices. Nothing is scored against you.",
    "guess.start":   "Start",
    "guess.round":   "Round {n} of {t}",
    "guess.alt":     "A zoomed detail of a heritage site. Guess which one it is.",
    "guess.missing": "Photograph unavailable offline",
    "guess.right":   "Correct",
    "guess.wrong":   "Not this one",
    "guess.answer":  "The answer was",
    "guess.next":    "Next",
    "guess.finish":  "See my score",
    "guess.view":    "See the full page",
    "guess.again":   "Play again",
    "guess.done":    "Round complete",
    "guess.great":   "You know these well. Open the map and keep building your journey.",
    "guess.ok":      "A good start — the detail shots are deliberately tight.",
    "guess.try":     "Tight crops make these hard. Try the map, then come back.",
    "guess.empty":   "Not enough photographed sites to build a round yet.",
    "guess.howHead": "Where the pictures come from",
    "guess.c1t":     "Real photographs",
    "guess.c1b":     "Every image is one of the licensed Wikimedia Commons photographs " +
                     "used on the map, zoomed into a detail.",
    "guess.c2t":     "No account",
    "guess.c2b":     "Rounds are generated in your browser from the local data file. " +
                     "Nothing is uploaded and no score is stored anywhere.",
    "guess.c3t":     "No leaderboard",
    "guess.c3b":     "There is no ranking to climb and nothing to sign up for. " +
                     "Your score disappears when you close the tab.",

    "about.kicker":  "About the project",
    "about.title":   "How Bharat Darshan works",
    "about.sub":     "A small, static website that puts India's heritage sites on a map, " +
                     "tells their story in five stages, and keeps every fact next to the " +
                     "source it came from.",
    "about.whatH":   "What you can do here",
    "about.whatP1":  "Open the map, filter by region or building type, and click a pin. " +
                     "Each site opens a detail page with its history, quick facts, official " +
                     "UNESCO and Archaeological Survey of India links, and a set of sources " +
                     "you can check yourself.",
    "about.whatP2":  "Add up to five stops to a journey and the page works out a rough " +
                     "straight-line distance between them. Earn badges as you explore. " +
                     "Switch the interface to Hindi. None of it needs an account.",
    "about.ruleT":   "The rule we followed",
    "about.ruleB":   "If a feature needed an API key, a login, a paid service, or a file " +
                     "we did not have, it was cut. Everything on this site runs from files " +
                     "in the repository.",
    "about.teamK":   "The team",
    "about.teamH":   "Three people, three lanes",
    "about.teamP":   "Work was split so no two people were editing the same file at the " +
                     "same time.",
    "about.archK":   "Architecture",
    "about.archH":   "How the pieces fit",
    "about.archP":   "Plain HTML, CSS and JavaScript. No framework, no bundler, no build " +
                     "step — open the file index.html and it runs.",
    "about.a1t":     "One data file",
    "about.a1b":     "Every page reads the same array of sites, so a fact written once " +
                     "appears everywhere and cannot drift apart.",
    "about.a2t":     "No backend",
    "about.a2b":     "There is no server to hack, no keys to leak and no database to break. " +
                     "Your saved journey never leaves the device.",
    "about.a3t":     "Everything local",
    "about.a3b":     "Libraries and images live in the repository, so the site still works " +
                     "when the wifi does not.",
    "about.credK":   "Provenance",
    "about.credH":   "Photo credits & licences",
    "about.credP":   "Generated from the data file, so this table always matches what the " +
                     "site actually uses. Every image is downloaded into the assets folder.",
    "about.srcK":    "Verification",
    "about.srcH":    "Where the facts came from",
    "about.srcP":    "Each site's detail page lists its own sources. These are the standing " +
                     "references the whole project relies on.",
    "about.honestT": "What we deliberately did not do",
    "about.honest1": "No invented dates, numbers or quotes. Anything we could not verify is " +
                     "marked “TODO” instead of filled in.",
    "about.honest2": "No invented transcriptions. The Persian verse in the Manuscript Lens " +
                     "is translated by the museum, not by us.",
    "about.honest3": "No UNESCO or ASI claim without a link to the page that makes it.",
    "about.honest4": "No “recommended for you” or “related sites” sections — the map shows " +
                     "what the filters ask for, nothing more.",
    "about.runH":    "Run it yourself",
    "about.run1":    "Clone or download the repository.",
    "about.run2":    "Double-click the file index.html. That is the whole setup — there is " +
                     "nothing to install.",
    "about.run3":    "Optional: serve the folder with any static server, for example " +
                     "python -m http.server 8000, then open http://localhost:8000.",
    "about.run4":    "To deploy, push the folder to GitHub Pages or drag it into Netlify. " +
                     "No build command.",
    "about.runNote": "Tested in current Chrome, Edge and Firefox on desktop, and in mobile " +
                     "Chrome and Safari.",

    "cred.th1":      "Site",
    "cred.th2":      "Photographer / source",
    "cred.th3":      "Licence",
    "cred.th4":      "File",
    "cred.alsoUsed": "Also used: the Taj Mahal 360° panorama (Arul Prakasam T, CC BY-SA 4.0) " +
                     "and the Cleveland Museum of Art calligraphy page (CC0, accession " +
                     "2013.342.b).",

    /* ---- Living Archive: archive.html ---- */
    "archive.kicker":   "The Living Archive",
    "archive.title":    "Search the whole archive at once",
    "archive.sub":      "Twenty-five monuments, their field-note pages and every material named across them — indexed together with BM25 ranking, matches highlighted, every result opening the real record. The map browses by place; this searches the text.",
    "archive.honesty":  "Live index — built in your browser, nothing uploaded",
    "archive.phLabel":  "Search the archive",
    "archive.ph":       "granite · marble inlay · stepwell · Vijayanagara",
    "archive.btn":      "Search",
    "archive.wing":     "Two more ways into the same archive",
    "archive.wingSub":  "Search answers “what does the record say?”. These answer “how was it made?” and “what connects to what?”.",

    /* ---- Living Archive: manuscript.html ---- */
    "lens.kicker":      "Field Notes Reader",
    "lens.title":       "Read the leaf, not just the record",
    "lens.sub":         "A demonstration of how an OCR pass reports a page: every word in its own region with a confidence score, and the faded regions where a person has to step in. These field notes are written for this project, not transcribed from an archive. For a real transcribed manuscript, open the Manuscript Lens inside the Taj Mahal story.",
    "lens.honesty":     "Synthetic demo corpus — CC0, written for this project",
    "lens.transcript":  "Transcription",
    "lens.perWord":     "Per-word confidence",
    "lens.uploadTitle": "Run real OCR on your own scan",
    "lens.uploadSub":   "Tesseract.js loads on demand and runs entirely in this browser tab. Nothing leaves your machine. If you are offline the demo leaves above still work — the language data just cannot be fetched.",
    "lens.ocrBtn":      "Read this image",
    "lens.ocrHiBtn":    "हिन्दी में पढ़ें",

    /* ---- Living Archive: graph.html ---- */
    "graph.kicker":     "Knowledge Graph",
    "graph.title":      "What connects to what",
    "graph.sub":        "Twenty-five monuments, every material they are made of, and the manuscript pages that mention them — one graph. Drag to rearrange, scroll to zoom, click a node to trace it.",
    "graph.honesty":    "Edges are drawn only from facts stated in the archive",
    "graph.searchLabel":"Filter the graph",
    "graph.ph":         "filter — granite, Taj, stepwell…",
    "graph.reheat":     "Re-settle",
    "graph.reset":      "Reset view"
  },

  hi: {
    "nav.map":       "मानचित्र",
    "nav.stories":   "धरोहर की कहानियाँ",
    "nav.journey":   "मेरी यात्रा",
    "nav.about":     "परिचय",
    "nav.archive":   "जीवित संग्रह",
    "nav.manuscript":"फ़ील्ड नोट्स रीडर",
    "nav.graph":     "ज्ञान ग्राफ़",
    "nav.a11y":      "सुलभता",
    "nav.menu":      "मेन्यू",
    "nav.otherLang": "English",

    "hero.kicker": "एक डिजिटल धरोहर मानचित्र",
    "hero.h1a":    "पत्थरों पर खुदी कहानियों के ज़रिए",
    "hero.h1b":    "भारत घूमें।",
    "hero.lede":   "भारत भर के क़िले, मंदिर, बावड़ियाँ, गुफ़ाएँ और विश्व धरोहर स्थल खोजें — उनका इतिहास, वास्तुकला और बीच के रास्ते।",
    "hero.cta1":   "मानचित्र खोलें",
    "hero.cta2":   "धरोहर कहानी पढ़ें",
    "hero.scroll": "नीचे देखें",
    "facts.sites":   "25 स्थल",
    "facts.regions": "6 क्षेत्र",
    "facts.eras":    "4 काल",

    "feature.kicker": "चुनिंदा कहानी",
    "feature.title":  "ताज महल, पाँच अंकों में",
    "feature.desc":   "एक बादशाह की बेगम के लिए बना संगमरमर का मक़बरा, फ़िरदौस की तरह बसाया गया बाग़, और एक ऐसा सिल्हूट जो भारत की पहचान बन गया। 360° में मक़बरे का चक्कर लगाएँ, फिर निर्माण से संरक्षण तक की उसकी कहानी पढ़ें।",
    "feature.f1":     "1632–1653 में निर्मित",
    "feature.f2":     "यूनेस्को विश्व धरोहर",
    "feature.f3":     "आगरा, उत्तर प्रदेश",
    "feature.cta1":   "360° कहानी खोलें",
    "feature.cta2":   "पूरा रिकॉर्ड पढ़ें",

    "stories.kicker":   "धरोहर कथाएँ",
    "stories.title":    "हर स्मारक, पूरी कहानी के साथ",
    "stories.sub":      "छह क्षेत्रों में पच्चीस स्थल। किसी भी स्थल का इतिहास, वास्तुकला और बाकी एटलस से जुड़े रास्ते खोलें।",
    "stories.note":     "पूरा इंटरैक्टिव अनुभव और 360° टूर केवल ताज महल पर है। बाकी हर स्थल अपना रिकॉर्ड खोलता है, जहाँ वही पाँच-भाग की कहानी दी गई है।",
    "stories.count":    "{sites} स्थल · {regions} क्षेत्र",
    "stories.go":       "यह कहानी खोलें →",
    "stories.goFull":   "पूरी कहानी खोलें →",
    "stories.tourFlag": "360° टूर",

    "search.ph":     "स्मारक, शहर या राज्य खोजें…",
    "search.label":  "स्मारक खोजें",
    "view.map":      "मानचित्र",
    "view.list":     "सूची",
    "filters.btn":   "छाँट",
    "filters.near":  "मेरे पास",
    "filters.region":    "क्षेत्र",
    "filters.siteType":  "स्थल का प्रकार",
    "filters.traditions":"परंपरा",
    "filters.era":       "काल",
    "filters.flags":     "मान्यता",
    "filters.clear":     "सभी छाँट हटाएँ",
    "filters.city":      "शहर चुनें:",
    "filters.none":      "इन छाँटों से कोई स्थल मेल नहीं खाता। कोई एक-दो हटाकर देखें।",

    "list.head":  "सभी स्थल — सूची",
    "list.desc":  "मानचित्र पर किसी स्थल को चुनने के लिए यहाँ क्लिक करें। ऊपर के सभी छाँट यहाँ भी लागू होते हैं।",

    "pv.details":   "विस्तार देखें",
    "pv.journey":   "यात्रा में जोड़ें",
    "pv.visited":   "देखा हुआ चिह्नित करें",
    "pv.visitedOn": "देखा ✓",
    "pv.close":     "पूर्वावलोकन बंद करें",

    "count":        "{n} स्थल दिख रहे हैं",
    "countOne":     "1 स्थल दिख रहा है",
    "dist":         "लगभग {d} किमी दूर",
    "legend.title": "संकेत",
    "legend.fort":  "क़िला / स्मारक",
    "legend.temple":"मंदिर",
    "legend.stepwell":"बावड़ी",
    "legend.cave":  "गुफ़ा",
    "legend.unesco":"★ = यूनेस्को विश्व धरोहर",

    "tag.unesco": "यूनेस्को विश्व धरोहर",
    "tag.asi":    "एएसआई संरक्षित",
    "tag.prot":   "संरक्षित",

    "region.North": "उत्तर", "region.South": "दक्षिण", "region.East": "पूर्व",
    "region.West": "पश्चिम", "region.Central": "मध्य", "region.Northeast": "उत्तर-पूर्व",

    "siteType.fort": "क़िला", "siteType.temple": "मंदिर", "siteType.stepwell": "बावड़ी",
    "siteType.cave": "गुफ़ा", "siteType.tomb": "समाधि", "siteType.palace": "महल",
    "siteType.monument": "स्मारक",

    "traditions.hindu": "हिंदू", "traditions.buddhist": "बौद्ध", "traditions.jain": "जैन",
    "traditions.islamic": "इस्लामी", "traditions.sikh": "सिख",
    "traditions.colonial": "औपनिवेशिक", "traditions.multi": "बहु-परंपरा",

    "era.ancient": "प्राचीन", "era.medieval": "मध्यकालीन", "era.mughal": "मुग़ल",
    "era.colonial": "औपनिवेशिक", "era.modern": "आधुनिक",

    "flags.unesco": "यूनेस्को विश्व धरोहर",
    "flags.asi":    "एएसआई संरक्षित",

    "near.fallback": "स्थान उपलब्ध नहीं — इसके बजाय शहर चुनें।",
    "near.denied":   "स्थान की अनुमति नहीं मिली। इसके बजाय शहर चुनें।",
    "near.empty":    "आपके {d} किमी के भीतर कोई स्थल नहीं। निकटतम दिखा रहे हैं।",

    "journey.add":   "मेरी यात्रा में जोड़ा गया",
    "journey.remove":"यात्रा से हटाया गया",
    "journey.full":  "आपकी यात्रा में पहले से 5 पड़ाव हैं। पहले कोई हटाएँ।",
    "visited.set":   "देखा हुआ चिह्नित किया गया",
    "visited.unset": "देखा हुआ हटाया गया",

    "listen.label":  "इतिहास सुनें",
    "listen.play":   "▶ चलाएँ",
    "listen.pause":  "⏸ रोकें",
    "listen.resume": "⏵ जारी रखें",
    "listen.stop":   "■ बंद करें",
    "listen.hint":   "नीचे पढ़ते रहें — पूरा पाठ हमेशा दिखाई देता है।",
    "listen.unsupported": "आपके ब्राउज़र में आवाज़ इंजन नहीं है। पूरा पाठ नीचे है।",

    "mon.journey":   "यात्रा में जोड़ें",
    "mon.visited":   "देखा हुआ चिह्नित करें",
    "mon.map":       "मानचित्र पर देखें",
    "mon.sources":   "आधिकारिक स्रोत",
    "mon.credits":   "चित्र श्रेय",
    "mon.quiz":      "कुछ प्रश्न",
    "mon.story":     "पाँच चरण, एक स्मारक",
    "mon.special":   "यह ख़ास क्यों है",
    "mon.history":   "यह कैसे बना",
    "mon.loading":   "लोड हो रहा है…",
    "mon.notfound":  "यह स्मारक हमें नहीं मिला।",
    "mon.notfoundHelp": "हो सकता है इसे हटा दिया गया हो। मानचित्र पर वापस जाएँ और सूची से कोई स्थल चुनें।",
    "story.stage":   "चरण",
    "story.prev":    "← पिछला",
    "story.next":    "अगला →",

    "jr.title":  "मेरी यात्रा",
    "jr.sub":    "अधिकतम पाँच पड़ाव, केवल इसी डिवाइस पर सुरक्षित। तीर बटनों से क्रम बदलें — हर नियंत्रण कीबोर्ड से चलता है।",
    "jr.stops":  "आपके पड़ाव",
    "jr.addMore":"और पड़ाव जोड़ें",
    "jr.badges": "प्रतीक",
    "jr.share":  "किसी मित्र को बताएँ",

    "taj.kicker": "डूबकर सुनें कहानी · 360°",
    "taj.start":  "360° दौरा शुरू करें",
    "taj.detail": "पूरा विवरण पृष्ठ",

    "guess.title":   "स्मारक पहचानें",
    "guess.kicker":  "चित्र-परीक्षा",
    "guess.sub":     "पाँच बारीक चित्र, हर बार चार नाम। सब कुछ आपके ब्राउज़र में चलता है — " +
                     "न कोई खाता, न समय का दबाव, न कोई रैंकिंग।",
    "guess.rule":    "आपको असली फ़ोटो का एक बड़ा किया हुआ हिस्सा दिखेगा। चार विकल्पों में " +
                     "सही नाम चुनें। कोई अंक काटे नहीं जाते।",
    "guess.start":   "शुरू करें",
    "guess.round":   "चरण {n} / {t}",
    "guess.alt":     "स्मारक का एक बड़ा किया हुआ हिस्सा। पहचानें कि यह कौन-सा है।",
    "guess.missing": "ऑफ़लाइन फ़ोटो उपलब्ध नहीं",
    "guess.right":   "बिल्कुल सही",
    "guess.wrong":   "यह नहीं",
    "guess.answer":  "सही उत्तर था",
    "guess.next":    "आगे",
    "guess.finish":  "मेरा परिणाम देखें",
    "guess.view":    "पूरा पृष्ठ देखें",
    "guess.again":   "फिर से खेलें",
    "guess.done":    "चरण पूरा",
    "guess.great":   "आप इन्हें अच्छे से जानते हैं। नक्शा खोलें और अपनी यात्रा बढ़ाते रहें।",
    "guess.ok":      "एक अच्छी शुरुआत — बारीक हिस्से जान-बूझकर कठिन हैं।",
    "guess.try":     "छोटे हिस्से इन्हें कठिन बनाते हैं। पहले नक्शा देखें, फिर यहाँ आएँ।",
    "guess.empty":   "अभी इतने फ़ोटो वाले स्मारक नहीं हैं कि एक चरण बन सके।",
    "guess.howHead": "तस्वीरें कहाँ से आती हैं",
    "guess.c1t":     "असली फ़ोटो",
    "guess.c1b":     "हर तस्वीर नक्शे पर इस्तेमाल हुआ लाइसेंस-युक्त Wikimedia Commons " +
                     "चित्र है, जिसका एक हिस्सा बड़ा किया गया है।",
    "guess.c2t":     "कोई खाता नहीं",
    "guess.c2b":     "चक्र आपके ब्राउज़र में स्थानीय डेटा फ़ाइल से बनते हैं। कुछ भी " +
                     "अपलोड नहीं होता और कोई अंक सहेजा नहीं जाता।",
    "guess.c3t":     "कोई रैंकिंग नहीं",
    "guess.c3b":     "चढ़ने की कोई लिस्ट नहीं, किसी चीज़ में जुड़ने की ज़रूरत नहीं। " +
                     "आपका अंक टैब बंद करते ही चला जाता है।",

    "about.kicker":  "परियोजना के बारे में",
    "about.title":   "भारत दर्शन कैसे काम करता है",
    "about.sub":     "एक छोटी, स्थिर वेबसाइट जो भारत के विरासत स्थलों को नक्शे पर रखती है, " +
                     "उनकी कहानी पाँच चरणों में सुनाती है, और हर तथ्य के साथ उसका स्रोत भी " +
                     "रखती है।",
    "about.whatH":   "यहाँ आप क्या कर सकते हैं",
    "about.whatP1":  "नक्शा खोलें, क्षेत्र या भवन के प्रकार से छाँटें, और किसी पिन पर " +
                     "क्लिक करें। हर स्थल का विवरण पृष्ठ खुलता है जिसमें इतिहास, त्वरित " +
                     "तथ्य, UNESCO और भारतीय पुरातत्व सर्वेक्षण के आधिकारिक लिंक, और " +
                     "स्रोतों की सूची है जिन्हें आप खुद जाँच सकते हैं।",
    "about.whatP2":  "पाँच तक पड़ाव जोड़ें और पृष्ठ उनके बीच की अनुमानित सीधी दूरी " +
                     "निकाल लेता है। घूमते-घूमते प्रतीक कमाएँ। इंटरफ़ेस हिन्दी में बदलें। " +
                     "किसी में भी खाते की ज़रूरत नहीं।",
    "about.ruleT":   "हमने जिस नियम का पालन किया",
    "about.ruleB":   "जिस सुविधा के लिए API कुंजी, लॉगिन, सशुल्क सेवा, या कोई ऐसी फ़ाइल " +
                     "चाहिए थी जो हमारे पास नहीं थी — उसे हटा दिया गया। इस साइट का सब " +
                     "कुछ रिपॉज़िटरी की फ़ाइलों से चलता है।",
    "about.teamK":   "टीम",
    "about.teamH":   "तीन लोग, तीन रास्ते",
    "about.teamP":   "काम इस तरह बाँटा गया कि दो लोग एक ही फ़ाइल पर एक साथ काम न करें।",
    "about.archK":   "संरचना",
    "about.archH":   "टुकड़े कैसे जुड़ते हैं",
    "about.archP":   "सादा HTML, CSS और JavaScript। न कोई फ़्रेमवर्क, न बंडलर, न कोई " +
                     "बिल्ड चरण — फ़ाइल index.html खोलिए और चल पड़ेगा।",
    "about.a1t":     "एक ही डेटा फ़ाइल",
    "about.a1b":     "हर पृष्ठ वही स्थल-सूची पढ़ता है, इसलिए एक बार लिखा तथ्य हर जगह " +
                     "दिखता है और अलग-अलग नहीं हो सकता।",
    "about.a2t":     "कोई बैकएंड नहीं",
    "about.a2b":     "न हैक करने के लिए कोई सर्वर, न लीक होने वाली कुंजी, न टूटने वाला " +
                     "डेटाबेस। आपकी सहेजी यात्रा डिवाइस से बाहर नहीं जाती।",
    "about.a3t":     "सब कुछ स्थानीय",
    "about.a3b":     "लाइब्रेरी और तस्वीरें रिपॉज़िटरी में हैं, इसलिए वाईफ़ाई न हो तो भी " +
                     "साइट चलती है।",
    "about.credK":   "स्रोत",
    "about.credH":   "फ़ोटो श्रेय और लाइसेंस",
    "about.credP":   "यह सूची डेटा फ़ाइल से बनती है, इसलिए यह हमेशा साइट के असली " +
                     "इस्तेमाल से मेल खाती है। हर तस्वीर assets फ़ोल्डर में डाउनलोड है।",
    "about.srcK":    "जाँच",
    "about.srcH":    "तथ्य कहाँ से आए",
    "about.srcP":    "हर स्थल का विवरण पृष्ठ अपने स्रोत खुद बताता है। ये वे स्थायी " +
                     "संदर्भ हैं जिन पर पूरी परियोजना टिकी है।",
    "about.honestT": "हमने जान-बूझकर क्या नहीं किया",
    "about.honest1": "कोई बनाई हुई तारीख़, संख्या या उद्धरण नहीं। जो जाँच नहीं सके उसे " +
                     "भरने के बजाय “TODO” लिखा गया।",
    "about.honest2": "कोई बनाया हुआ लेखन-अनुवाद नहीं। Manuscript Lens का फ़ारसी शेर " +
                     "संग्रहालय का अनुवाद है, हमारा नहीं।",
    "about.honest3": "बिना लिंक के कोई UNESCO या ASI दावा नहीं।",
    "about.honest4": "न कोई “आपके लिए सुझाव”, न “संबंधित स्थल” खंड — नक्शा ठीक वही " +
                     "दिखाता है जो छाँटने से माँगा जाए, कुछ और नहीं।",
    "about.runH":    "खुद चलाएँ",
    "about.run1":    "रिपॉज़िटरी क्लोन या डाउनलोड करें।",
    "about.run2":    "index.html फ़ाइल पर डबल-क्लिक करें। बस इतना ही — कुछ भी " +
                     "इंस्टॉल नहीं करना।",
    "about.run3":    "वैकल्पिक: किसी भी स्थिर सर्वर से फ़ोल्डर चलाएँ, जैसे " +
                     "python -m http.server 8000, फिर http://localhost:8000 खोलें।",
    "about.run4":    "प्रकाशित करने के लिए फ़ोल्डर को GitHub Pages पर धकेलें या Netlify " +
                     "में डाल दें। कोई बिल्ड कमांड नहीं।",
    "about.runNote": "डेस्कटॉप के वर्तमान Chrome, Edge और Firefox, तथा मोबाइल Chrome " +
                     "और Safari में परीक्षण किया गया।",

    "cred.th1":      "स्थल",
    "cred.th2":      "फ़ोटोग्राफ़र / स्रोत",
    "cred.th3":      "लाइसेंस",
    "cred.th4":      "फ़ाइल",
    "cred.alsoUsed": "साथ में: ताजमहल का 360° पैनोरमा (Arul Prakasam T, CC BY-SA 4.0) और " +
                     "Cleveland Museum of Art का क़लाम पृष्ठ (CC0, क्रमांक 2013.342.b)।",

    /* ---- जीवित संग्रह: archive.html ---- */
    "archive.kicker":   "जीवित संग्रह",
    "archive.title":    "पूरे संग्रह को एक साथ खोजें",
    "archive.sub":      "पच्चीस स्मारक, उनकी क्षेत्र नोटों के पन्ने और उनमें वर्णित हर सामग्री — BM25 रैंकिंग के साथ साथ अनुक्रमित, मिलान उजागर, हर परिणाम असली अभिलेख खोलता है। नक्शा स्थान से देखता है, यहाँ पाठ खोजा जाता है।",
    "archive.honesty":  "लाइव अनुक्रमण — आपके ब्राउज़र में बना, कुछ भी अपलोड नहीं",
    "archive.phLabel":  "संग्रह में खोजें",
    "archive.ph":       "ग्रेनाइट · संगमरमर की जड़ाई · बावड़ी · विजयनगर",
    "archive.btn":      "खोजें",
    "archive.wing":     "उसी संग्रह में जाने के दो और रास्ते",
    "archive.wingSub":  "खोज बताती है “अभिलेख में क्या लिखा है?”। ये बताते हैं “इसे कैसे बनाया गया?” और “किसका किससे संबंध है?”।",

    /* ---- जीवित संग्रह: manuscript.html ---- */
    "lens.kicker":      "क्षेत्र नोट पाठक",
    "lens.title":       "केवल अभिलेख नहीं, पन्ना भी पढ़ें",
    "lens.sub":         "यह दर्शाता है कि OCR किसी पन्ने को कैसे पढ़ता है: हर शब्द अपने ही क्षेत्र में विश्वास स्कोर के साथ, और धुँधले क्षेत्र जहाँ किसी व्यक्ति को आगे आना पड़ता है। ये क्षेत्र नोट इसी परियोजना के लिए लिखे गए हैं, किसी अभिलेख से प्रतिलिपि नहीं। असली प्रतिलिपि वाली पांडुलिपि के लिए ताजमहल की कहानी में खुलने वाला 'पांडुलिपि लेंस' देखें।",
    "lens.honesty":     "नमूना प्रदर्शन संग्रह — CC0, इसी परियोजना के लिए लिखा गया",
    "lens.transcript":  "प्रतिलिपि",
    "lens.perWord":     "शब्द-दर-शब्द विश्वास",
    "lens.uploadTitle": "अपने स्कैन पर असली OCR चलाएँ",
    "lens.uploadSub":   "Tesseract.js माँग पर लोड होता है और पूरी तरह इसी ब्राउज़र टैब में चलता है। कुछ भी आपकी मशीन से बाहर नहीं जाता। यदि आप ऑफ़लाइन हैं तो ऊपर के पन्ने फिर भी चलते हैं — बस भाषा डेटा डाउनलोड नहीं हो पाता।",
    "lens.ocrBtn":      "इस चित्र को पढ़ें",
    "lens.ocrHiBtn":    "हिन्दी में पढ़ें",

    /* ---- जीवित संग्रह: graph.html ---- */
    "graph.kicker":     "ज्ञान आरेख",
    "graph.title":      "किसका किससे संबंध है",
    "graph.sub":        "पच्चीस स्मारक, उनकी हर सामग्री और उनका उल्लेख करने वाले पांडुलिपि पन्ने — एक ही आरेख। खींचकर बदलें, स्क्रॉल से ज़ूम, नोड पर क्लिक कर उसका जाल देखें।",
    "graph.honesty":    "कड़ियाँ केवल उन्हीं तथ्यों से बनाई गई हैं जो संग्रह में वर्णित हैं",
    "graph.searchLabel":"आरेख छानें",
    "graph.ph":         "छानें — ग्रेनाइट, ताज, बावड़ी…",
    "graph.reheat":     "फिर से व्यवस्थित करें",
    "graph.reset":      "दृश्य रीसेट करें"
  }
};

/** Current language code: "en" or "hi". Persisted in localStorage. */
let LANG = (function () {
  try { return localStorage.getItem("bd.lang") || "en"; }
  catch (e) { return "en"; }
})();

/** Translate a key. Falls back to English, then to the key itself. */
function t(key) {
  const dict = I18N[LANG] || I18N.en;
  if (dict[key] !== undefined) return dict[key];
  if (I18N.en[key] !== undefined) return I18N.en[key];
  return key;
}

/** Translate then substitute {n}, {d} style placeholders. */
function tf(key, vars) {
  let s = t(key);
  Object.keys(vars || {}).forEach((k) => { s = s.replace("{" + k + "}", vars[k]); });
  return s;
}

/**
 * Walk the DOM and apply translations to any element carrying
 * data-i18n / data-i18n-ph / data-i18n-al.
 */
function applyLang() {
  document.documentElement.lang = LANG;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
  });
  document.querySelectorAll("[data-i18n-al]").forEach((el) => {
    el.setAttribute("aria-label", t(el.getAttribute("data-i18n-al")));
  });

  const lt = document.getElementById("langToggle");
  if (lt) {
    lt.textContent = t("nav.otherLang");
    lt.setAttribute("aria-pressed", LANG === "hi" ? "true" : "false");
    lt.setAttribute("aria-label", "Switch language");
  }

  // Let page scripts redraw anything they built from translated strings.
  document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: LANG } }));
}

/** Flip EN <-> HI, save the choice, re-apply everywhere. */
function toggleLang() {
  LANG = LANG === "en" ? "hi" : "en";
  try { localStorage.setItem("bd.lang", LANG); } catch (e) { /* private mode */ }
  applyLang();
}

/** Wire up the header language button if the page has one. */
function initLang() {
  const btn = document.getElementById("langToggle");
  if (btn) btn.addEventListener("click", toggleLang);
  applyLang();
}
