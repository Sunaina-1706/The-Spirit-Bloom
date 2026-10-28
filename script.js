// ═══════════════════════════════════════════════
//  THE SPIRIT BLOOM — script.js  (v3 — with Gallery)
//  Vanilla JS · SVG flower generator · WebLLM AI · My Blooms gallery
// ═══════════════════════════════════════════════

// ──────────────────────────────────────────────
// 1. IMPORTS
// ──────────────────────────────────────────────

// WebLLM is loaded from the jsDelivr CDN as an ES module.
// This requires <script type="module"> in index.html.
// The model itself (~400 MB) is downloaded once and cached by the browser.
import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

// ──────────────────────────────────────────────
// 2. CONSTANTS
// ──────────────────────────────────────────────

// Qwen2.5-0.5B is the smallest WebLLM model (~400 MB quantised).
// It is flagged low_resource_required and runs on most WebGPU-capable devices.
const MODEL_ID = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";

// ──────────────────────────────────────────────
// 3. APP STATE
// ──────────────────────────────────────────────

// Holds the loaded MLCEngine instance, or null if AI is unavailable.
let engine = null;

// Tracks the current mode so the UI is always honest with the user.
// "loading"  — model download / init in progress
// "ai"       — WebLLM ready, real AI inference is available
// "fallback" — WebLLM failed or unsupported, using sample data
let aiMode = "loading";

// ──────────────────────────────────────────────
// 4. SAMPLE DATA (Fallback)
// ──────────────────────────────────────────────
// Used when WebLLM cannot run.  Exactly the same data as v1.

const FLOWER_TEMPLATES = [
  {
    keywords: ["grandmother", "grandma", "abuela", "nana", "family", "ancestor"],
    name: "La Flor de la Memoria",
    meaning: "A flower rooted in ancestral love. It blooms between worlds, carrying the warmth of those who walked before us.",
    poem: "She lives in the scent of warm tortillas,\nin the creak of a wooden chair.\nClose your eyes — she has never left.\nShe is the golden thread in the air.",
    palette: { center: "#ffd700", petals: ["#f77f00", "#ff9f1c", "#ffbf69"], stem: "#4a7c59", accent: "#c77dff" }
  },
  {
    keywords: ["dream", "night", "sleep", "stars", "sky", "moon", "float"],
    name: "Flor del Sueño Eterno",
    meaning: "Born from the quiet hours between midnight and dawn. This flower holds your unconscious wanderings like a lantern in the dark.",
    poem: "In the dream you were weightless,\nthe moon a silver door.\nYou stepped through and came back different —\ncarrying light from the other shore.",
    palette: { center: "#c77dff", petals: ["#7b2fbe", "#9d4edd", "#c77dff"], stem: "#2d1b69", accent: "#ffd700" }
  },
  {
    keywords: ["love", "heart", "miss", "longing", "yearning", "beloved", "dear"],
    name: "Rosa del Corazón Partido",
    meaning: "Tenderness turned into colour. This flower grows in the space between closeness and distance, between saying goodbye and holding on.",
    poem: "Love doesn't vanish — it transforms.\nIt becomes the hum you can't place,\nthe warmth on an empty chair,\na flower growing in the space.",
    palette: { center: "#ff4d6d", petals: ["#c9184a", "#ff6b6b", "#ffb3c1"], stem: "#4a7c59", accent: "#ffd700" }
  },
  {
    keywords: ["father", "dad", "papa", "papá", "brother", "son", "uncle"],
    name: "El Cempasúchil del Hombre Fuerte",
    meaning: "Marigold-gold, sun-drenched. It honours those who carried weight in silence and showed love through presence, not words.",
    poem: "He taught me to hold a hammer,\nand how to let a storm pass.\nI keep him in the smell of wood shavings\nand the morning light on glass.",
    palette: { center: "#f77f00", petals: ["#e65c00", "#f77f00", "#ffa952"], stem: "#5a4a28", accent: "#ffd700" }
  },
  {
    keywords: ["sad", "grief", "loss", "gone", "death", "died", "cry", "tears", "pain"],
    name: "La Flor del Duelo Sagrado",
    meaning: "Grief made visible. Dark petals that still hold light — because mourning is not the absence of love. It is love with nowhere to go.",
    poem: "Grief is not a wound to close.\nIt is the shape of what was there.\nLet it stay — let it bloom in you.\nThe dead live in the ones who care.",
    palette: { center: "#9d4edd", petals: ["#1e0d2e", "#4a1a6e", "#7b2fbe"], stem: "#2a1a3e", accent: "#ff9f1c" }
  },
  {
    keywords: ["joy", "happy", "celebration", "dance", "laugh", "music", "bright"],
    name: "Flor de la Alegría Viva",
    meaning: "Pure, unfiltered joy crystallised into petals. This flower reminds you that happiness is also a form of remembrance.",
    poem: "I heard your laugh and time stopped.\nThe room was full of golden sound.\nI am still standing in that moment —\neven now, even here, I'm spellbound.",
    palette: { center: "#ffd700", petals: ["#f77f00", "#ffb347", "#ffe066"], stem: "#4a7c59", accent: "#c77dff" }
  },
  {
    keywords: ["childhood", "child", "young", "little", "home", "house", "place"],
    name: "La Flor de la Infancia",
    meaning: "A tender bloom. It carries the smell of rain on warm earth, the echoes of small feet, and the invincibility of youth.",
    poem: "I was small and the world was wide.\nThe garden seemed a continent.\nNow I am the garden —\nand still that child, still innocent.",
    palette: { center: "#ffb347", petals: ["#ff9f1c", "#ffd166", "#ffb3c1"], stem: "#5a9e6f", accent: "#c77dff" }
  },
  // Default fallback — used when no keywords match
  {
    keywords: [],
    name: "La Flor Sin Nombre",
    meaning: "Some feelings are too vast for words. This flower grew from the silence between what you meant to say and what remained in your heart.",
    poem: "There are blooms that have no name,\nonly colour and soft perfume.\nThey grow between the spoken words\nand bloom best in the half-light of a room.",
    palette: { center: "#c77dff", petals: ["#7b2fbe", "#c77dff", "#f77f00"], stem: "#3a2a5e", accent: "#ffd700" }
  }
];

// ──────────────────────────────────────────────
// 5. FALLBACK — keyword-based template picker
// ──────────────────────────────────────────────

/**
 * Picks the best matching fallback template for the given text.
 * @param {string} text
 * @returns {object}
 */
function pickFallbackTemplate(text) {
  const lower = text.toLowerCase();
  let bestScore = 0;
  let best = FLOWER_TEMPLATES[FLOWER_TEMPLATES.length - 1];

  for (let i = 0; i < FLOWER_TEMPLATES.length - 1; i++) {
    let score = 0;
    FLOWER_TEMPLATES[i].keywords.forEach(function (kw) {
      if (lower.includes(kw)) score++;
    });
    if (score > bestScore) {
      bestScore = score;
      best = FLOWER_TEMPLATES[i];
    }
  }

  if (bestScore === 0) {
    best = FLOWER_TEMPLATES[Math.floor(Math.random() * (FLOWER_TEMPLATES.length - 1))];
  }
  return best;
}

// ──────────────────────────────────────────────
// 6. AI PROMPT & JSON PARSING
// ──────────────────────────────────────────────

/**
 * Builds the system prompt that tells the model what JSON to return.
 * Keeping the prompt tight reduces token usage for the small model.
 */
function buildSystemPrompt() {
  return `You are a poetic AI that turns personal memories into symbolic flowers inspired by Día de los Muertos and remembrance.

When given a memory or feeling, respond with ONLY a valid JSON object — no extra text, no markdown fences.

The JSON must have exactly these keys:
{
  "flower_name": "A beautiful name in Spanish or a blend of Spanish and English (string)",
  "emotional_meaning": "2–3 sentences describing the emotional symbolism of this flower (string)",
  "mood": "one word, e.g. grief, joy, longing, peace, wonder, love (string)",
  "petal_color_1": "a CSS hex color for the darkest petal tone, e.g. #c9184a (string)",
  "petal_color_2": "a CSS hex color for the mid petal tone (string)",
  "petal_color_3": "a CSS hex color for the lightest petal tone (string)",
  "center_color": "a CSS hex color for the flower centre, e.g. #ffd700 (string)",
  "accent_color": "a CSS hex color for the inner accent petals (string)",
  "stem_color": "a CSS hex color for the stem and leaves (string)",
  "petal_count": "an integer between 6 and 12 (number)",
  "poem": "A short original poem of 4 lines inspired by the memory. Use \\n between lines (string)"
}

Choose colours that match the emotional tone. Grief → deep purples and blues. Joy → bright golds and oranges. Love → warm pinks and reds. Dream → violet and silver. Nature memories → greens and gold.`;
}

/**
 * Tries to extract and parse a JSON object from the model's raw output.
 * Handles cases where the model wraps the JSON in markdown fences.
 * @param {string} raw  - The model's raw text response.
 * @returns {object|null} Parsed object, or null if parsing failed.
 */
function extractJSON(raw) {
  // Strip markdown code fences if present
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

  // Find the first { and last } — robust to leading/trailing prose
  const start = cleaned.indexOf("{");
  const end   = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;

  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

/**
 * Validates the parsed AI JSON and normalises it into the shape
 * that displayFlower() and generateFlowerSVG() expect.
 * Falls back to sensible defaults for any missing / malformed fields.
 * @param {object} data - Parsed JSON from the model.
 * @param {string} inputText - The user's original text.
 * @returns {object} A normalised flower template object.
 */
function normaliseAIResponse(data, inputText) {
  // Helper: return val if it looks like a CSS hex colour, else fallback
  function hexOrDefault(val, fallback) {
    if (typeof val === "string" && /^#[0-9a-fA-F]{3,8}$/.test(val.trim())) {
      return val.trim();
    }
    return fallback;
  }

  // Helper: clamp petal count to 6–12
  function clampPetals(val) {
    const n = parseInt(val, 10);
    if (isNaN(n)) return 6 + (inputText.length % 7);
    return Math.max(6, Math.min(12, n));
  }

  return {
    // Text fields
    name:    (typeof data.flower_name === "string" && data.flower_name.trim())
               ? data.flower_name.trim()
               : "La Flor del Espíritu",

    meaning: (typeof data.emotional_meaning === "string" && data.emotional_meaning.trim())
               ? data.emotional_meaning.trim()
               : "A flower born from the depths of feeling.",

    poem:    (typeof data.poem === "string" && data.poem.trim())
               ? data.poem.trim().replace(/\\n/g, "\n")
               : "A bloom without words,\nonly colour and grace.\nIt rises from memory\nand rests in this place.",

    // Palette (passed directly to generateFlowerSVG)
    palette: {
      petals: [
        hexOrDefault(data.petal_color_1, "#7b2fbe"),
        hexOrDefault(data.petal_color_2, "#c77dff"),
        hexOrDefault(data.petal_color_3, "#f77f00"),
      ],
      center: hexOrDefault(data.center_color, "#ffd700"),
      accent: hexOrDefault(data.accent_color, "#c77dff"),
      stem:   hexOrDefault(data.stem_color,   "#4a7c59"),
    },

    // Pass petal count separately — generateFlowerSVG reads inputText length by default,
    // but we override it here with the AI's choice.
    petalCountOverride: clampPetals(data.petal_count),
  };
}

// ──────────────────────────────────────────────
// 7. WEBLLM — INITIALISE
// ──────────────────────────────────────────────

/**
 * Loads the WebLLM engine.  Updates the AI status banner and progress bar
 * as the model downloads.  Sets aiMode to "ai" or "fallback" when done.
 */
async function initWebLLM() {
  // Check WebGPU support before attempting to load
  if (!navigator.gpu) {
    setAIStatus("fallback", "WebGPU not supported in this browser — using built-in flower library.");
    return;
  }

  // Show the progress UI
  const progressWrap  = document.getElementById("model-progress-wrap");
  const progressBar   = document.getElementById("model-progress-bar");
  const progressLabel = document.getElementById("model-progress-label");
  const progressTrack = progressWrap.querySelector(".model-progress-track");

  progressWrap.hidden = false;
  setAIStatus("loading", "Summoning the spirit intelligence…");

  try {
    engine = await CreateMLCEngine(MODEL_ID, {
      // Called repeatedly during model download with progress info
      initProgressCallback: function (report) {
        // report.progress is a number 0–1; report.text is a human-readable string
        const pct = Math.round((report.progress || 0) * 100);
        progressBar.style.width = pct + "%";
        progressTrack.setAttribute("aria-valuenow", pct);
        progressLabel.textContent = report.text || "Loading model…";
      },
    });

    // Success
    engine = engine;          // keep reference in module scope
    progressWrap.hidden = true;
    setAIStatus("ai", "✦ Local AI active — your memories never leave this device.");
    document.getElementById("privacy-notice").hidden = false;

  } catch (err) {
    // Model failed to load — fall back gracefully
    console.error("[SpiritBloom] WebLLM load error:", err);
    progressWrap.hidden = true;
    engine = null;
    setAIStatus("fallback", "AI model could not load — using built-in flower library instead.");
  }
}

// ──────────────────────────────────────────────
// 8. WEBLLM — RUN INFERENCE
// ──────────────────────────────────────────────

/**
 * Sends the user's memory to the local AI and returns a normalised
 * flower template object.  Throws if inference fails.
 * @param {string} text - The user's memory text.
 * @returns {Promise<object>} Normalised flower template.
 */
async function runAIInference(text) {
  const response = await engine.chat.completions.create({
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user",   content: `Here is my memory:\n\n"${text}"\n\nPlease create a flower for it.` },
    ],
    temperature: 0.85,   // a little creative
    max_tokens:  512,    // enough for the JSON + poem
    // Ask WebLLM to force JSON output (supported in v0.2.x+)
    response_format: { type: "json_object" },
  });

  const raw  = response.choices[0].message.content || "";
  const data = extractJSON(raw);

  if (!data) {
    throw new Error("Model returned non-JSON output: " + raw.slice(0, 200));
  }

  return normaliseAIResponse(data, text);
}

// ──────────────────────────────────────────────
// 9. UI — AI STATUS BANNER
// ──────────────────────────────────────────────

/**
 * Updates the AI status banner text and visual style.
 * @param {"loading"|"ai"|"fallback"} mode
 * @param {string} message
 */
function setAIStatus(mode, message) {
  aiMode = mode;

  const banner  = document.getElementById("ai-status-banner");
  const text    = document.getElementById("ai-status-text");
  const iconEl  = banner.querySelector(".ai-banner__icon");

  // Remove all mode classes, add the active one
  banner.classList.remove("ai-banner--loading", "ai-banner--ai", "ai-banner--fallback");
  banner.classList.add("ai-banner--" + mode);

  const icons = { loading: "◌", ai: "✦", fallback: "⚠" };
  iconEl.textContent = icons[mode] || "◌";
  text.textContent   = message;
}

// ──────────────────────────────────────────────
// 10. SVG FLOWER GENERATOR  (unchanged from v1, plus petalCountOverride)
// ──────────────────────────────────────────────

/**
 * Creates a full SVG flower element.
 * @param {object} palette         - Colors { center, petals[], stem, accent }
 * @param {string} inputText       - Used to vary petal count if no override.
 * @param {number} [petalOverride] - If provided, use this petal count instead.
 * @returns {SVGElement}
 */
function generateFlowerSVG(palette, inputText, petalOverride) {
  const NS = "http://www.w3.org/2000/svg";
  const petalCount = petalOverride != null
    ? petalOverride
    : 6 + (inputText.length % 7);

  const SIZE = 300, CX = SIZE / 2, CY = SIZE / 2;

  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${SIZE} ${SIZE}`);
  svg.setAttribute("width",  "300");
  svg.setAttribute("height", "300");
  svg.setAttribute("xmlns",   NS);
  svg.setAttribute("role",    "img");
  svg.setAttribute("aria-label", "Generated spirit flower");

  // ── defs ──
  const defs = document.createElementNS(NS, "defs");

  const petalGrad = document.createElementNS(NS, "radialGradient");
  petalGrad.setAttribute("id", "petalGrad");
  petalGrad.setAttribute("cx", "50%");
  petalGrad.setAttribute("cy", "30%");
  petalGrad.setAttribute("r",  "70%");
  petalGrad.innerHTML = `
    <stop offset="0%"   stop-color="${palette.petals[2] || palette.petals[0]}" stop-opacity="1"/>
    <stop offset="60%"  stop-color="${palette.petals[1] || palette.petals[0]}" stop-opacity="0.9"/>
    <stop offset="100%" stop-color="${palette.petals[0]}" stop-opacity="0.7"/>
  `;

  const centerGrad = document.createElementNS(NS, "radialGradient");
  centerGrad.setAttribute("id", "centerGrad");
  centerGrad.setAttribute("cx", "40%");
  centerGrad.setAttribute("cy", "35%");
  centerGrad.setAttribute("r",  "65%");
  centerGrad.innerHTML = `
    <stop offset="0%"   stop-color="#fffde7" stop-opacity="1"/>
    <stop offset="40%"  stop-color="${palette.center}" stop-opacity="1"/>
    <stop offset="100%" stop-color="${palette.petals[0]}" stop-opacity="0.8"/>
  `;

  const filter = document.createElementNS(NS, "filter");
  filter.setAttribute("id", "glow");
  filter.innerHTML = `
    <feGaussianBlur stdDeviation="4" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  `;

  const filterShimmer = document.createElementNS(NS, "filter");
  filterShimmer.setAttribute("id", "shimmer");
  filterShimmer.innerHTML = `
    <feGaussianBlur stdDeviation="2.5" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  `;

  defs.appendChild(petalGrad);
  defs.appendChild(centerGrad);
  defs.appendChild(filter);
  defs.appendChild(filterShimmer);
  svg.appendChild(defs);

  // ── Stem ──
  const stemGroup = document.createElementNS(NS, "g");
  const stem = document.createElementNS(NS, "line");
  stem.setAttribute("x1", CX); stem.setAttribute("y1", CY + 38);
  stem.setAttribute("x2", CX); stem.setAttribute("y2", SIZE - 10);
  stem.setAttribute("stroke", palette.stem);
  stem.setAttribute("stroke-width", "4");
  stem.setAttribute("stroke-linecap", "round");
  stemGroup.appendChild(stem);

  const leaf = document.createElementNS(NS, "ellipse");
  leaf.setAttribute("cx", CX + 14); leaf.setAttribute("cy", CY + 68);
  leaf.setAttribute("rx", "14");    leaf.setAttribute("ry", "6");
  leaf.setAttribute("fill", palette.stem);
  leaf.setAttribute("opacity", "0.8");
  leaf.setAttribute("transform", `rotate(30, ${CX + 14}, ${CY + 68})`);
  stemGroup.appendChild(leaf);
  svg.appendChild(stemGroup);

  // ── Outer petals ──
  const petalsGroup = document.createElementNS(NS, "g");
  petalsGroup.setAttribute("filter", "url(#glow)");

  for (let i = 0; i < petalCount; i++) {
    const angle = (360 / petalCount) * i - 90;
    const rad   = (angle * Math.PI) / 180;
    const petalLen = 72 + (i % 3) * 6;
    const petalW   = 20 + (i % 2) * 5;
    const offsetDist = 42;
    const px = CX + Math.cos(rad) * offsetDist;
    const py = CY + Math.sin(rad) * offsetDist;

    const petal = document.createElementNS(NS, "ellipse");
    petal.setAttribute("cx", px); petal.setAttribute("cy", py);
    petal.setAttribute("rx", petalW); petal.setAttribute("ry", petalLen / 2);
    petal.setAttribute("fill", "url(#petalGrad)");
    petal.setAttribute("opacity", "0.88");
    petal.setAttribute("transform", `rotate(${angle + 90}, ${px}, ${py})`);

    const anim = document.createElementNS(NS, "animateTransform");
    anim.setAttribute("attributeName", "transform");
    anim.setAttribute("type", "rotate");
    anim.setAttribute("from", `${angle + 90} ${px} ${py}`);
    anim.setAttribute("to",   `${angle + 94} ${px} ${py}`);
    anim.setAttribute("dur",  `${2.5 + i * 0.2}s`);
    anim.setAttribute("repeatCount", "indefinite");
    anim.setAttribute("direction", "alternate");
    anim.setAttribute("calcMode", "spline");
    anim.setAttribute("keySplines", "0.42 0 0.58 1");
    petal.appendChild(anim);
    petalsGroup.appendChild(petal);
  }
  svg.appendChild(petalsGroup);

  // ── Inner accent petals ──
  const innerGroup = document.createElementNS(NS, "g");
  const innerCount = Math.max(5, petalCount - 2);

  for (let i = 0; i < innerCount; i++) {
    const angle = (360 / innerCount) * i - 60;
    const rad   = (angle * Math.PI) / 180;
    const offsetDist = 26;
    const px = CX + Math.cos(rad) * offsetDist;
    const py = CY + Math.sin(rad) * offsetDist;

    const innerPetal = document.createElementNS(NS, "ellipse");
    innerPetal.setAttribute("cx", px); innerPetal.setAttribute("cy", py);
    innerPetal.setAttribute("rx", "10"); innerPetal.setAttribute("ry", "28");
    innerPetal.setAttribute("fill", palette.accent);
    innerPetal.setAttribute("opacity", "0.55");
    innerPetal.setAttribute("transform", `rotate(${angle + 90}, ${px}, ${py})`);
    innerGroup.appendChild(innerPetal);
  }
  svg.appendChild(innerGroup);

  // ── Decorative inter-petal dots ──
  const dotGroup = document.createElementNS(NS, "g");
  for (let i = 0; i < petalCount; i++) {
    const angle = (360 / petalCount) * i - 90 + (180 / petalCount);
    const rad   = (angle * Math.PI) / 180;
    const dx = CX + Math.cos(rad) * 58;
    const dy = CY + Math.sin(rad) * 58;

    const dot = document.createElementNS(NS, "circle");
    dot.setAttribute("cx", dx); dot.setAttribute("cy", dy);
    dot.setAttribute("r", "3");
    dot.setAttribute("fill", palette.center);
    dot.setAttribute("opacity", "0.6");

    const anim = document.createElementNS(NS, "animate");
    anim.setAttribute("attributeName", "opacity");
    anim.setAttribute("values", "0.3;0.9;0.3");
    anim.setAttribute("dur", `${1.5 + i * 0.18}s`);
    anim.setAttribute("repeatCount", "indefinite");
    dot.appendChild(anim);
    dotGroup.appendChild(dot);
  }
  svg.appendChild(dotGroup);

  // ── Centre ──
  const centre = document.createElementNS(NS, "circle");
  centre.setAttribute("cx", CX); centre.setAttribute("cy", CY);
  centre.setAttribute("r", "30");
  centre.setAttribute("fill", "url(#centerGrad)");
  centre.setAttribute("filter", "url(#shimmer)");
  svg.appendChild(centre);

  const dotPattern = [[0,-16],[14,-8],[14,8],[0,16],[-14,8],[-14,-8],[0,0]];
  const dpGroup = document.createElementNS(NS, "g");
  dotPattern.forEach(function (pos) {
    const d = document.createElementNS(NS, "circle");
    d.setAttribute("cx", CX + pos[0]); d.setAttribute("cy", CY + pos[1]);
    d.setAttribute("r",  pos[0] === 0 && pos[1] === 0 ? "5" : "3");
    d.setAttribute("fill", pos[0] === 0 && pos[1] === 0 ? "#fff" : palette.center);
    d.setAttribute("opacity", "0.9");
    dpGroup.appendChild(d);
  });
  svg.appendChild(dpGroup);

  return svg;
}

// ──────────────────────────────────────────────
// 11. PARTICLE SYSTEM  (unchanged from v1)
// ──────────────────────────────────────────────

function initParticles() {
  const container = document.getElementById("particles-container");
  const PARTICLE_COUNT = 30;
  const colors = ["#f77f00","#ffd700","#c77dff","#ff9f1c","#ffbf69","#9d4edd","#ffb347"];

  for (let i = 0; i < PARTICLE_COUNT; i++) createParticle(container, colors, true);

  setInterval(function () {
    if (container.children.length < PARTICLE_COUNT + 10) {
      createParticle(container, colors, false);
    }
  }, 800);
}

function createParticle(container, colors, randomStartY) {
  const el  = document.createElement("div");
  el.classList.add("particle");
  const size     = 2 + Math.random() * 5;
  const color    = colors[Math.floor(Math.random() * colors.length)];
  const left     = Math.random() * 100;
  const duration = 8 + Math.random() * 14;
  const delay    = randomStartY ? Math.random() * -duration : 0;

  el.style.cssText = `
    width:${size}px;height:${size}px;background:${color};
    left:${left}%;bottom:-10px;
    animation-duration:${duration}s;animation-delay:${delay}s;
    box-shadow:0 0 ${size * 2}px ${color};opacity:0;
  `;
  container.appendChild(el);
  el.addEventListener("animationend", function () { el.remove(); });
}

// ──────────────────────────────────────────────
// 12. TOAST  (unchanged from v1)
// ──────────────────────────────────────────────

function showToast(message) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(function () { toast.classList.add("show"); }, 50);
  setTimeout(function () {
    toast.classList.remove("show");
    setTimeout(function () { toast.remove(); }, 500);
  }, 3000);
}

// ──────────────────────────────────────────────
// 13. SHOW LOADING SPINNER IN FLOWER AREA
// ──────────────────────────────────────────────

function showFlowerLoading() {
  const canvas = document.getElementById("flower-canvas");
  canvas.innerHTML = `
    <div class="loading-petals" role="status" aria-label="Growing your flower…">
      <span></span><span></span><span></span>
    </div>
  `;
}

// ──────────────────────────────────────────────
// 14. DISPLAY FLOWER RESULT
// ──────────────────────────────────────────────

/**
 * Renders the flower SVG and fills in the text fields.
 * Works with both AI output and fallback templates.
 * @param {object} template
 * @param {string} inputText
 */
function displayFlower(template, inputText) {
  const canvas = document.getElementById("flower-canvas");
  canvas.innerHTML = "";
  const svg = generateFlowerSVG(
    template.palette,
    inputText,
    template.petalCountOverride   // undefined for fallback templates (ignored)
  );
  canvas.appendChild(svg);

  document.getElementById("flower-name").textContent    = template.name;
  document.getElementById("flower-meaning").textContent = template.meaning;
  document.getElementById("flower-poem").textContent    = template.poem;

  const flowerSection = document.getElementById("flower-section");
  flowerSection.hidden = false;
  flowerSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ──────────────────────────────────────────────
// 15. SAVE AS PNG  (unchanged from v1)
// ──────────────────────────────────────────────

function saveFlowerAsPNG() {
  const svgEl = document.querySelector("#flower-canvas svg");
  if (!svgEl) return;

  const serialiser = new XMLSerializer();
  const svgString  = serialiser.serializeToString(svgEl);
  const svgBlob    = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url        = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = function () {
    const canvas = document.createElement("canvas");
    canvas.width = 600; canvas.height = 600;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#0a0608";
    ctx.fillRect(0, 0, 600, 600);
    ctx.drawImage(img, 0, 0, 600, 600);

    const flowerName = document.getElementById("flower-name").textContent;
    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 22px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText(flowerName, 300, 570);

    const link = document.createElement("a");
    link.download = "spirit-bloom.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    URL.revokeObjectURL(url);
    showToast("✿ Your flower has been saved!");
  };
  img.src = url;
}

// ──────────────────────────────────────────────
// 16. MY BLOOMS GALLERY — localStorage layer
// ──────────────────────────────────────────────

// The key used to store the gallery array in localStorage.
const STORAGE_KEY = "spiritBloom_gallery";

// In-memory cache of the gallery, kept in sync with localStorage.
// Each bloom is an object:
// {
//   id:       string  — unique id (timestamp-based)
//   name:     string  — flower name
//   meaning:  string  — emotional meaning
//   poem:     string  — the poem
//   palette:  object  — { center, petals[], stem, accent }
//   petalCountOverride: number|undefined
//   savedAt:  number  — Date.now() when saved
// }
let gallery = [];

/**
 * Loads the gallery array from localStorage.
 * Silently discards any entries that are missing required fields
 * or that could not be parsed, so corrupted data never crashes the app.
 */
function loadGallery() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { gallery = []; return; }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) { gallery = []; return; }

    // Validate each entry; keep only well-formed ones
    gallery = parsed.filter(function (item) {
      return (
        item &&
        typeof item.id      === "string" &&
        typeof item.name    === "string" && item.name.trim() !== "" &&
        typeof item.meaning === "string" &&
        typeof item.poem    === "string" &&
        item.palette &&
        typeof item.palette.center === "string" &&
        Array.isArray(item.palette.petals) && item.palette.petals.length >= 1
      );
    });
  } catch (err) {
    // JSON.parse failed — wipe out corrupted data and start fresh
    console.warn("[SpiritBloom] Gallery data corrupted; resetting.", err);
    gallery = [];
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  }
}

/**
 * Persists the current in-memory gallery array to localStorage.
 * Handles storage-quota errors without crashing.
 */
function persistGallery() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gallery));
  } catch (err) {
    console.warn("[SpiritBloom] Could not save to localStorage:", err);
    showToast("⚠ Storage full — could not save the bloom.");
  }
}

/**
 * Adds the currently displayed flower to the gallery.
 * Reads its data from the live DOM so we don't have to pass anything in.
 * @returns {string|null} The new bloom's id, or null if nothing is displayed.
 */
function addCurrentBloomToGallery() {
  const name    = document.getElementById("flower-name").textContent.trim();
  const meaning = document.getElementById("flower-meaning").textContent.trim();
  const poem    = document.getElementById("flower-poem").textContent.trim();

  // Nothing is displayed yet — bail out
  if (!name) return null;

  // Read the palette off the live SVG defs so we don't need a separate state variable
  const palette = readPaletteFromSVG();
  if (!palette) return null;

  // Prevent exact duplicates (same name saved twice in a row)
  const alreadySaved = gallery.some(function (b) { return b.name === name; });
  if (alreadySaved) {
    showToast("✦ This bloom is already in your gallery.");
    return null;
  }

  const bloom = {
    id:                  Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name:                name,
    meaning:             meaning,
    poem:                poem,
    palette:             palette,
    petalCountOverride:  readPetalCountFromSVG(),
    savedAt:             Date.now(),
  };

  gallery.unshift(bloom);   // newest first
  persistGallery();
  return bloom.id;
}

/**
 * Removes a bloom from the gallery by id.
 * @param {string} id
 */
function removeBloomFromGallery(id) {
  gallery = gallery.filter(function (b) { return b.id !== id; });
  persistGallery();
}

// ── Helpers to read palette/petal-count back from the live SVG ──

/**
 * Extracts the colour palette from the currently displayed SVG's <defs>.
 * This is simpler than maintaining a separate JS state variable.
 * @returns {object|null}
 */
function readPaletteFromSVG() {
  const svg = document.querySelector("#flower-canvas svg");
  if (!svg) return null;

  // Read gradient stops by id
  function stopColor(gradId, index) {
    const grad  = svg.querySelector("#" + gradId);
    if (!grad) return "#c77dff";
    const stops = grad.querySelectorAll("stop");
    return stops[index] ? stops[index].getAttribute("stop-color") : "#c77dff";
  }

  // Stem colour from the <line> element
  const stemEl  = svg.querySelector("line");
  const stemColor = stemEl ? stemEl.getAttribute("stroke") : "#4a7c59";

  // Accent colour from the first inner-group ellipse
  const innerEllipses = svg.querySelectorAll("ellipse");
  // The last batch of inner ellipses use the accent colour.
  // They are drawn after the outer petals and have rx="10".
  let accentColor = "#c77dff";
  innerEllipses.forEach(function (el) {
    if (el.getAttribute("rx") === "10") {
      accentColor = el.getAttribute("fill") || "#c77dff";
    }
  });

  return {
    center: stopColor("centerGrad", 1),
    petals: [
      stopColor("petalGrad", 2),
      stopColor("petalGrad", 1),
      stopColor("petalGrad", 0),
    ],
    stem:   stemColor,
    accent: accentColor,
  };
}

/**
 * Counts the outer petals in the displayed SVG to recover petalCountOverride.
 * @returns {number}
 */
function readPetalCountFromSVG() {
  // Outer petals are inside the first <g filter="url(#glow)">
  const glowGroup = document.querySelector("#flower-canvas svg g[filter]");
  if (!glowGroup) return 8;
  return glowGroup.querySelectorAll("ellipse").length;
}

// ──────────────────────────────────────────────
// 17. GALLERY — SVG thumbnail generator
// ──────────────────────────────────────────────

/**
 * Creates a small (120×120) SVG thumbnail using just the petals and centre.
 * Simpler than the full flower — no animations, no stem.
 * @param {object} palette
 * @param {number} petalCount
 * @returns {SVGElement}
 */
function generateThumbnailSVG(palette, petalCount) {
  const NS   = "http://www.w3.org/2000/svg";
  const SIZE = 120;
  const CX   = SIZE / 2;
  const CY   = SIZE / 2;
  const count = Math.max(6, Math.min(12, petalCount || 8));

  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${SIZE} ${SIZE}`);
  svg.setAttribute("width",  SIZE);
  svg.setAttribute("height", SIZE);
  svg.setAttribute("aria-hidden", "true");

  const defs = document.createElementNS(NS, "defs");

  const pGrad = document.createElementNS(NS, "radialGradient");
  pGrad.setAttribute("id", "tpg"); // thumbnail petal gradient
  pGrad.setAttribute("cx", "50%"); pGrad.setAttribute("cy", "30%"); pGrad.setAttribute("r", "70%");
  pGrad.innerHTML = `
    <stop offset="0%"   stop-color="${palette.petals[2] || palette.petals[0]}"/>
    <stop offset="60%"  stop-color="${palette.petals[1] || palette.petals[0]}" stop-opacity="0.9"/>
    <stop offset="100%" stop-color="${palette.petals[0]}" stop-opacity="0.7"/>
  `;

  const cGrad = document.createElementNS(NS, "radialGradient");
  cGrad.setAttribute("id", "tcg"); // thumbnail centre gradient
  cGrad.setAttribute("cx", "40%"); cGrad.setAttribute("cy", "35%"); cGrad.setAttribute("r", "65%");
  cGrad.innerHTML = `
    <stop offset="0%"  stop-color="#fffde7"/>
    <stop offset="40%" stop-color="${palette.center}"/>
    <stop offset="100%" stop-color="${palette.petals[0]}" stop-opacity="0.8"/>
  `;

  const glow = document.createElementNS(NS, "filter");
  glow.setAttribute("id", "tglow");
  glow.innerHTML = `<feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>`;

  defs.appendChild(pGrad); defs.appendChild(cGrad); defs.appendChild(glow);
  svg.appendChild(defs);

  // Outer petals
  const pg = document.createElementNS(NS, "g");
  pg.setAttribute("filter", "url(#tglow)");
  for (let i = 0; i < count; i++) {
    const angle = (360 / count) * i - 90;
    const rad   = (angle * Math.PI) / 180;
    const dist  = 18;
    const px    = CX + Math.cos(rad) * dist;
    const py    = CY + Math.sin(rad) * dist;
    const el    = document.createElementNS(NS, "ellipse");
    el.setAttribute("cx", px); el.setAttribute("cy", py);
    el.setAttribute("rx", "8"); el.setAttribute("ry", "28");
    el.setAttribute("fill", "url(#tpg)");
    el.setAttribute("opacity", "0.88");
    el.setAttribute("transform", `rotate(${angle + 90},${px},${py})`);
    pg.appendChild(el);
  }
  svg.appendChild(pg);

  // Centre
  const centre = document.createElementNS(NS, "circle");
  centre.setAttribute("cx", CX); centre.setAttribute("cy", CY);
  centre.setAttribute("r", "13");
  centre.setAttribute("fill", "url(#tcg)");
  svg.appendChild(centre);

  // Centre dot
  const dot = document.createElementNS(NS, "circle");
  dot.setAttribute("cx", CX); dot.setAttribute("cy", CY);
  dot.setAttribute("r", "3"); dot.setAttribute("fill", "#fff"); dot.setAttribute("opacity", "0.9");
  svg.appendChild(dot);

  return svg;
}

// ──────────────────────────────────────────────
// 18. GALLERY — render cards
// ──────────────────────────────────────────────

/**
 * Re-renders the entire gallery section from the in-memory gallery array.
 * Called after load, after save, and after delete.
 */
function renderGallery() {
  const section = document.getElementById("gallery-section");
  const grid    = document.getElementById("gallery-grid");

  // If gallery is empty, hide the whole section
  if (gallery.length === 0) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  grid.innerHTML = "";

  gallery.forEach(function (bloom) {
    const card = document.createElement("div");
    card.className    = "gallery-card";
    card.role         = "listitem";
    card.tabIndex     = 0;
    card.setAttribute("aria-label", "View saved bloom: " + bloom.name);
    card.dataset.bloomId = bloom.id;

    // Thumbnail SVG
    const thumbWrap = document.createElement("div");
    thumbWrap.className = "gallery-card__thumb";
    const thumbSVG = generateThumbnailSVG(bloom.palette, bloom.petalCountOverride);
    thumbWrap.appendChild(thumbSVG);

    // Card body
    const body = document.createElement("div");
    body.className = "gallery-card__body";

    const cardName = document.createElement("p");
    cardName.className   = "gallery-card__name";
    cardName.textContent = bloom.name;

    // Colour swatches
    const swatches = document.createElement("div");
    swatches.className = "gallery-card__swatches";
    const swatchColors = [bloom.palette.center].concat(bloom.palette.petals.slice(0, 2));
    swatchColors.forEach(function (color) {
      const swatch = document.createElement("span");
      swatch.className = "swatch";
      swatch.style.background = color;
      swatch.style.boxShadow  = "0 0 6px " + color + "88";
      swatches.appendChild(swatch);
    });

    // Saved date
    const date = document.createElement("p");
    date.className   = "gallery-card__date";
    date.textContent = formatDate(bloom.savedAt);

    body.appendChild(cardName);
    body.appendChild(swatches);
    body.appendChild(date);

    card.appendChild(thumbWrap);
    card.appendChild(body);
    grid.appendChild(card);

    // Open modal on click or Enter/Space key
    function openCard() { openBloomModal(bloom.id); }
    card.addEventListener("click", openCard);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openCard(); }
    });
  });
}

/** Formats a timestamp into a readable date string. */
function formatDate(ts) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  } catch (_) { return ""; }
}

// ──────────────────────────────────────────────
// 19. GALLERY — bloom detail modal
// ──────────────────────────────────────────────

// Track which bloom is currently open so the delete button knows what to remove
let activeModalBloomId = null;

/**
 * Opens the modal and populates it with the saved bloom's data.
 * @param {string} id
 */
function openBloomModal(id) {
  const bloom = gallery.find(function (b) { return b.id === id; });
  if (!bloom) return;

  activeModalBloomId = id;

  // Render a full flower SVG inside the modal
  const modalCanvas = document.getElementById("modal-flower-canvas");
  modalCanvas.innerHTML = "";
  const svg = generateFlowerSVG(bloom.palette, bloom.name, bloom.petalCountOverride);
  modalCanvas.appendChild(svg);

  // Fill text
  document.getElementById("modal-flower-name").textContent    = bloom.name;
  document.getElementById("modal-flower-meaning").textContent = bloom.meaning;
  document.getElementById("modal-flower-poem").textContent    = bloom.poem;

  // Show modal
  const backdrop = document.getElementById("modal-backdrop");
  backdrop.hidden = false;
  document.body.classList.add("modal-open");

  // Focus the close button for accessibility
  document.getElementById("modal-close").focus();
}

/** Closes the modal without deleting anything. */
function closeBloomModal() {
  document.getElementById("modal-backdrop").hidden = true;
  document.body.classList.remove("modal-open");
  activeModalBloomId = null;
}

// ──────────────────────────────────────────────
// 20. MAIN — EVENT LISTENERS & STARTUP
// ──────────────────────────────────────────────

// DOM is always ready by the time a module script runs,
// but wrapping in DOMContentLoaded is harmless and explicit.
document.addEventListener("DOMContentLoaded", function () {

  const memoryInput   = document.getElementById("memory-input");
  const charCount     = document.getElementById("char-count");
  const growBtn       = document.getElementById("grow-btn");
  const newBtn        = document.getElementById("new-btn");
  const saveBtn       = document.getElementById("save-btn");
  const gallerySaveBtn = document.getElementById("gallery-save-btn");
  const flowerSection = document.getElementById("flower-section");
  const inputSection  = document.getElementById("input-section");

  // Modal elements
  const modalBackdrop  = document.getElementById("modal-backdrop");
  const modalClose     = document.getElementById("modal-close");
  const modalDeleteBtn = document.getElementById("modal-delete-btn");

  // ── Particles ──
  initParticles();

  // ── Load gallery from localStorage on startup, then render ──
  loadGallery();
  renderGallery();

  // ── Start loading WebLLM in the background immediately ──
  initWebLLM().catch(function (err) {
    console.error("[SpiritBloom] Unexpected error during WebLLM init:", err);
    setAIStatus("fallback", "AI model unavailable — using built-in flower library.");
  });

  // ── Character counter ──
  memoryInput.addEventListener("input", function () {
    charCount.textContent = memoryInput.value.length;
  });

  // ── Grow My Flower ──
  growBtn.addEventListener("click", async function () {
    const text = memoryInput.value.trim();

    if (text.length < 5) {
      showToast("✦ Please share a little more to grow your flower…");
      memoryInput.focus();
      return;
    }

    growBtn.disabled = true;
    growBtn.innerHTML = '<span class="btn-icon" style="animation:spin-pulse 1s linear infinite">✿</span> Growing…';

    flowerSection.hidden = false;
    showFlowerLoading();
    flowerSection.scrollIntoView({ behavior: "smooth", block: "start" });

    let template;

    if (aiMode === "ai" && engine !== null) {
      try {
        template = await runAIInference(text);
      } catch (inferErr) {
        console.error("[SpiritBloom] Inference error:", inferErr);
        setAIStatus("fallback", "⚠ AI inference failed — using built-in flower library for this bloom.");
        template = pickFallbackTemplate(text);
      }
    } else {
      await new Promise(function (resolve) { setTimeout(resolve, 900); });
      template = pickFallbackTemplate(text);
    }

    displayFlower(template, text);

    growBtn.disabled = false;
    growBtn.innerHTML = '<span class="btn-icon">✿</span> Grow My Flower';
  });

  // ── Create Another ──
  newBtn.addEventListener("click", function () {
    memoryInput.value     = "";
    charCount.textContent = "0";
    flowerSection.hidden  = true;
    inputSection.scrollIntoView({ behavior: "smooth", block: "start" });
    memoryInput.focus();
  });

  // ── Save as Image (PNG download) ──
  saveBtn.addEventListener("click", function () {
    saveFlowerAsPNG();
  });

  // ── Save to My Blooms gallery ──
  gallerySaveBtn.addEventListener("click", function () {
    const id = addCurrentBloomToGallery();
    if (id) {
      renderGallery();
      showToast("✿ Bloom saved to your gallery!");
      // Scroll to the gallery so the user sees it appear
      setTimeout(function () {
        document.getElementById("gallery-section").scrollIntoView({ behavior: "smooth", block: "start" });
      }, 400);
    }
  });

  // ── Modal: close button ──
  modalClose.addEventListener("click", closeBloomModal);

  // ── Modal: click outside the box to close ──
  modalBackdrop.addEventListener("click", function (e) {
    if (e.target === modalBackdrop) closeBloomModal();
  });

  // ── Modal: delete button ──
  modalDeleteBtn.addEventListener("click", function () {
    if (!activeModalBloomId) return;
    removeBloomFromGallery(activeModalBloomId);
    closeBloomModal();
    renderGallery();
    showToast("Bloom removed from your gallery.");
  });

  // ── Keyboard: Escape closes modal, Ctrl/Cmd+Enter grows ──
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modalBackdrop.hidden) {
      closeBloomModal();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      growBtn.click();
    }
  });
});
