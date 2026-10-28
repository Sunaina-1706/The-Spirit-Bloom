// ═══════════════════════════════════════════════
//  THE SPIRIT BLOOM — script.js  (v4 — 12 Unique Species & Dynamic Engine)
//  Vanilla JS · SVG procedural flowers · WebLLM AI · My Blooms gallery
// ═══════════════════════════════════════════════

// ──────────────────────────────────────────────
// 1. IMPORTS
// ──────────────────────────────────────────────
import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";

// ──────────────────────────────────────────────
// 2. CONSTANTS & APP STATE
// ──────────────────────────────────────────────
const MODEL_ID = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";

let engine = null;
let aiMode = "loading"; // "loading" | "ai" | "fallback"

// Tracks the current memory and variation index for "Grow Another Bloom"
let lastMemoryText = "";
let memoryVariationIndex = 0;
let currentFlowerData = null;

// ──────────────────────────────────────────────
// 3. 12 FLOWER SPECIES REGISTRY
// ──────────────────────────────────────────────
// Each flower species has distinct symbolic resonance, emotional keywords,
// visual parameters, and a dedicated SVG rendering function.
const FLOWER_SPECIES = {
  marigold: {
    id: "marigold",
    displayName: "Marigold · Cempasúchil",
    symbolism: "Remembrance and warmth",
    meaningDefault: "A golden marigold rooted in ancestral tradition. Its fragrant, sunlit petals form a luminous pathway guiding cherished memories and wandering spirits back into our hearts.",
    keywords: [
      "grandmother", "grandma", "abuela", "nana", "grandfather", "grandpa", "abuelo", "ancestor",
      "altar", "ofrenda", "candle", "marigold", "cempasuchil", "family", "tradition", "warmth",
      "reunion", "roots", "remembrance", "remember", "heritage", "golden", "home", "scent"
    ],
    defaultPalette: {
      center: "#7a1a00",
      petals: ["#d9480f", "#f77f00", "#ffd166"],
      accent: "#ffe066",
      stem: "#386641"
    },
    defaultPetals: 14
  },
  rose: {
    id: "rose",
    displayName: "Rose · Rosa Sagrada",
    symbolism: "Love and longing",
    meaningDefault: "An impassioned bloom holding the tenderness of whispered promises, romantic yearning, and devotion that endures across oceans of time.",
    keywords: [
      "love", "romance", "beloved", "heart", "longing", "kiss", "yearning", "miss", "passion",
      "sweetheart", "darling", "partner", "lover", "devotion", "sweet", "holding", "tender",
      "embrace", "forever", "vow", "rose", "touch"
    ],
    defaultPalette: {
      center: "#ff4d6d",
      petals: ["#800f2f", "#c9184a", "#ff758f"],
      accent: "#ffd700",
      stem: "#2d5a3f"
    },
    defaultPetals: 12
  },
  moonflower: {
    id: "moonflower",
    displayName: "Moonflower · Flor de Luna",
    symbolism: "Mystery and dreams",
    meaningDefault: "Unfolding only beneath velvet night skies and silent stars. It preserves unconscious wanderings, midnight secrets, and cosmic reverie like a beacon in the shadow.",
    keywords: [
      "dream", "night", "stars", "moon", "midnight", "sleep", "mystery", "astral", "floating",
      "sky", "twilight", "visions", "secret", "cosmic", "nocturnal", "lunar", "wonder", "shadows",
      "lucid", "galaxy", "silver"
    ],
    defaultPalette: {
      center: "#ffffff",
      petals: ["#3c096c", "#7b2cbf", "#c77dff"],
      accent: "#e0aaff",
      stem: "#240046"
    },
    defaultPetals: 5
  },
  bluebell: {
    id: "bluebell",
    displayName: "Bluebell · Campanilla Silvestre",
    symbolism: "Nostalgia and humility",
    meaningDefault: "Softly chiming in gentle woodland breezes, carrying the quiet hum of simpler days, innocent laughter, and the humble grace of memories kept in secret.",
    keywords: [
      "nostalgia", "humility", "innocence", "woods", "forest", "gentle", "whisper", "echo",
      "bell", "chime", "quiet", "childhood", "playground", "old days", "humble", "soft",
      "breeze", "moss", "past", "bluebell"
    ],
    defaultPalette: {
      center: "#48cae4",
      petals: ["#023e8a", "#0077b6", "#90e0ef"],
      accent: "#caf0f8",
      stem: "#2d6a4f"
    },
    defaultPetals: 5
  },
  sunflower: {
    id: "sunflower",
    displayName: "Sunflower · Girasol Radiante",
    symbolism: "Joy and hope",
    meaningDefault: "Turning faithfully toward warmth and joy. A triumphant declaration of radiant energy, golden laughter, and resilience that banishes every encroaching shadow.",
    keywords: [
      "joy", "happy", "sunshine", "hope", "bright", "laugh", "smile", "cheer", "summer",
      "radiant", "play", "light", "energy", "optimism", "celebrate", "dancing", "fun",
      "sun", "warm", "field", "gleam"
    ],
    defaultPalette: {
      center: "#3d1308",
      petals: ["#e85d04", "#faa307", "#ffdd00"],
      accent: "#fff3b0",
      stem: "#406a38"
    },
    defaultPetals: 24
  },
  lavender: {
    id: "lavender",
    displayName: "Lavender · Lavanda Serena",
    symbolism: "Peace and healing",
    meaningDefault: "Brimming with soothing herbal tranquility. It gently mends frayed spirits, quietens tempestuous thoughts, and wraps the soul in comforting stillness.",
    keywords: [
      "peace", "calm", "healing", "rest", "soothing", "stillness", "safe", "breath", "serenity",
      "comfort", "relax", "tranquil", "quiet", "sleep", "recovery", "mending", "silent",
      "solace", "softness", "gentle"
    ],
    defaultPalette: {
      center: "#dec9e9",
      petals: ["#5a189a", "#7b2cbf", "#b5a6c9"],
      accent: "#e2afff",
      stem: "#4a7c59"
    },
    defaultPetals: 16
  },
  white_lily: {
    id: "white_lily",
    displayName: "White Lily · Lirio de Gracia",
    symbolism: "Purity and remembrance",
    meaningDefault: "An immaculate bloom consecrated to sacred farewells and solemn dignity. It honors departed souls with serene grace, forgiving what was broken and sanctifying what remains.",
    keywords: [
      "grief", "loss", "funeral", "passing", "died", "death", "soul", "purity", "farewell",
      "heaven", "angel", "solemn", "tears", "mourning", "crying", "passed", "gone", "honor",
      "sanctuary", "grace", "rest in peace"
    ],
    defaultPalette: {
      center: "#d8f3dc",
      petals: ["#95a5a6", "#ecf0f1", "#ffffff"],
      accent: "#e9c46a",
      stem: "#406343"
    },
    defaultPetals: 6
  },
  cherry_blossom: {
    id: "cherry_blossom",
    displayName: "Cherry Blossom · Flor de Cerezo",
    symbolism: "Fleeting moments and change",
    meaningDefault: "Exquisitely delicate and brief, celebrating the bittersweet beauty of impermanence. It marks growing up, drifting seasons, and milestones that shimmer before fading into history.",
    keywords: [
      "change", "growing", "fleeting", "passage", "impermanence", "moment", "spring", "graduation",
      "youth", "time", "transition", "drifting", "ephemeral", "temporary", "leaving", "goodbye",
      "new chapter", "growth", "season"
    ],
    defaultPalette: {
      center: "#d62828",
      petals: ["#f72585", "#ff70a6", "#ffccd5"],
      accent: "#ffd166",
      stem: "#583101"
    },
    defaultPetals: 5
  },
  forget_me_not: {
    id: "forget_me_not",
    displayName: "Forget-me-not · No Me Olvides",
    symbolism: "Cherished memories",
    meaningDefault: "Modest yet indelible. A steadfast promise that true companionship, shared secrets, and cherished memories remain alive across any span of distance or silence.",
    keywords: [
      "cherished", "promise", "friend", "friendship", "never", "remember", "keepsake",
      "treasured", "bond", "forever", "distance", "unforgettable", "classmate", "companion",
      "photo", "trinket", "token", "pledge"
    ],
    defaultPalette: {
      center: "#ffd166",
      petals: ["#0077b6", "#00b4d8", "#90e0ef"],
      accent: "#ffffff",
      stem: "#386641"
    },
    defaultPetals: 5
  },
  nightshade: {
    id: "nightshade",
    displayName: "Nightshade Fantasy · Sombra Mística",
    symbolism: "Mystery and transformation",
    meaningDefault: "A strange and magnetic bloom thriving on threshold realms. It transmutes painful truths, secret transformations, and shadows into radiant personal power.",
    keywords: [
      "transformation", "magic", "strangeness", "shadow", "rebirth", "alchemy", "secret",
      "deep", "dark", "unknown", "hidden", "weird", "uncanny", "change", "goth", "witch",
      "spell", "intensity", "unusual", "enchanted"
    ],
    defaultPalette: {
      center: "#ffd000",
      petals: ["#10002b", "#3c096c", "#7b2cbf"],
      accent: "#00f5d4",
      stem: "#1b263b"
    },
    defaultPetals: 5
  },
  ghost_orchid: {
    id: "ghost_orchid",
    displayName: "Ghost Orchid · Orquídea Fantasma",
    symbolism: "Solitude and the unknown",
    meaningDefault: "Suspended in pure wilderness without conventional soil, an elusive phantom bloom. It sings of introspective solitude, holy silence, and navigating uncharted inner spaces.",
    keywords: [
      "solitude", "lonely", "alone", "unknown", "wilderness", "quiet", "isolated", "silence",
      "phantom", "ghost", "strange", "wanderer", "untouched", "distant", "introvert",
      "independent", "solitary", "hidden", "fog", "mist"
    ],
    defaultPalette: {
      center: "#d8f3dc",
      petals: ["#52b788", "#b7e4c7", "#f8f9fa"],
      accent: "#95d5b2",
      stem: "#2d6a4f"
    },
    defaultPetals: 5
  },
  crimson_dahlia: {
    id: "crimson_dahlia",
    displayName: "Crimson Dahlia · Dalia de Fuego",
    symbolism: "Strength and resilience",
    meaningDefault: "Crowned with intricate concentric armor of scarlet and flame. It honors fierce endurance through adversity, triumph forged in struggle, and unbreakable inner fire.",
    keywords: [
      "strength", "resilience", "overcoming", "hardship", "battle", "courage", "trial", "survive",
      "fire", "fierce", "perseverance", "strong", "brave", "healing", "injury", "struggle",
      "triumph", "conquer", "stand", "powerful", "pain"
    ],
    defaultPalette: {
      center: "#370617",
      petals: ["#6a040f", "#9d0208", "#dc2f02"],
      accent: "#ffba08",
      stem: "#386641"
    },
    defaultPetals: 32
  }
};

const SPECIES_KEYS = Object.keys(FLOWER_SPECIES);

// ──────────────────────────────────────────────
// 4. EMOTIONAL MEMORY ANALYZER & VARIATION SELECTION
// ──────────────────────────────────────────────

/**
 * Analyzes the user's memory, ranks suitable flower species,
 * and uses the variationIndex to return a distinct candidate.
 * @param {string} text
 * @param {number} variationIndex
 * @returns {object} Selected flower species configuration
 */
function analyzeMemoryAndSelectSpecies(text, variationIndex = 0) {
  const lower = text.toLowerCase();

  // Score each flower species based on keyword occurrences and context
  const scored = SPECIES_KEYS.map((key) => {
    const spec = FLOWER_SPECIES[key];
    let score = 0;
    spec.keywords.forEach((kw) => {
      if (lower.includes(kw)) {
        score += kw.length > 5 ? 3 : 2; // longer matches have higher weight
      }
    });
    return { key, score, spec };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // If no keywords matched, use a text-hash based selection
  if (scored[0].score === 0) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    const offset = Math.abs(hash + variationIndex) % SPECIES_KEYS.length;
    return FLOWER_SPECIES[SPECIES_KEYS[offset]];
  }

  // Filter top tier candidates (at least 50% of the top score)
  const topScore = scored[0].score;
  const candidates = scored.filter((s) => s.score >= Math.max(2, topScore * 0.5));

  // Use variationIndex to cycle gracefully among top candidate species
  const selectedIdx = Math.abs(variationIndex) % candidates.length;
  return candidates[selectedIdx].spec;
}

// ──────────────────────────────────────────────
// 5. DYNAMIC NAME & POEM GENERATION ENGINE
// ──────────────────────────────────────────────

/**
 * Generates an evocative original name for the flower based on species, memory theme, and variation.
 */
function generateDynamicFlowerName(species, text, variationIndex) {
  const prefixes = {
    marigold: ["Cempasúchil", "Flor de Oro", "Flor de los Abuelos", "Cempasúchil Dorado", "Luz de la Memoria"],
    rose: ["Rosa del Amor", "Rosa Escarlata", "Rosa de las Promesas", "Rosa del Corazón", "Rosa de los Suspiros"],
    moonflower: ["Flor de Luna", "Manto Astral", "Flor del Cielo Nocturno", "Lirio de Medianoche", "Aura Lunar"],
    bluebell: ["Campanilla Azul", "Campana del Bosque", "Flor de la Nostalgia", "Campanilla Silvestre", "Eco de la Infancia"],
    sunflower: ["Girasol del Alba", "Girasol Radiante", "Flor del Sol Vivo", "Rayo Dorado", "Girasol de la Esperanza"],
    lavender: ["Lavanda Serena", "Espiga del Alivio", "Lavanda de la Paz", "Bálsamo del Silencio", "Lavanda del Sosiego"],
    white_lily: ["Lirio de Gracia", "Lirio del Sagrado Descanso", "Flor del Adiós", "Lirio de Luz Pura", "Lirio Blanco de la Paz"],
    cherry_blossom: ["Flor de Cerezo", "Pétalo del Tiempo", "Sakura de la Despedida", "Flor del Cambio", "Brisa de Primavera"],
    forget_me_not: ["No Me Olvides", "Flor de la Amistad Eterna", "Estrella Azul de la Memoria", "Lazo Inolvidable", "No Me Olvides Sagrado"],
    nightshade: ["Sombra Encantada", "Solanácea Mística", "Estrella del Misterio", "Flor de las Sombras", "Pétalo Arcano"],
    ghost_orchid: ["Orquídea Fantasma", "Flor de la Soledad", "Orquídea Espectral", "Espíritu del Bosque", "Orquídea de Niebla"],
    crimson_dahlia: ["Dalia de Fuego", "Dalia Resiliente", "Flor del Coraje", "Dalia del Fénix", "Dalia de la Fiera Esperanza"]
  };

  const suffixes = [
    "del Recuerdo Sagrado",
    "de los Días Dorados",
    "de la Tierra Amada",
    "del Alma Eterna",
    "de la Promesa Viva",
    "del Silencio Iluminado",
    "del Fuego Interior",
    "de las Aguas Serenas"
  ];

  const pool = prefixes[species.id] || ["Flor del Espíritu"];
  const prefix = pool[(text.length + variationIndex) % pool.length];
  const suffix = suffixes[(text.charCodeAt(0) + variationIndex) % suffixes.length];

  return `${prefix} ${suffix}`;
}

/**
 * Dynamically composes a personalized 4-line poem tailored to the memory context and chosen flower.
 */
function generateDynamicPoem(species, text, variationIndex) {
  const lower = text.toLowerCase();

  // Pick emotional tone
  let tone = "memory";
  if (lower.includes("love") || lower.includes("kiss") || lower.includes("heart")) tone = "love";
  else if (lower.includes("died") || lower.includes("loss") || lower.includes("grief") || lower.includes("funeral")) tone = "grief";
  else if (lower.includes("dream") || lower.includes("night") || lower.includes("star") || lower.includes("sky")) tone = "dream";
  else if (lower.includes("sun") || lower.includes("happy") || lower.includes("laugh") || lower.includes("joy")) tone = "joy";
  else if (lower.includes("peace") || lower.includes("calm") || lower.includes("safe") || lower.includes("quiet")) tone = "peace";
  else if (lower.includes("change") || lower.includes("grow") || lower.includes("left") || lower.includes("time")) tone = "change";
  else if (lower.includes("alone") || lower.includes("silent") || lower.includes("dark")) tone = "solitude";
  else if (lower.includes("fight") || lower.includes("pain") || lower.includes("survive") || lower.includes("strong")) tone = "strength";

  // Stanza library mapped by tone and flower
  const poems = {
    love: [
      "Love does not vanish into the past,\nIt gathers where the petals gleam.\nA quiet oath made to outlast\nThe waking day, the sweetest dream.",
      "In every petal pressed in red,\nYour laughter lingers soft and clear.\nNothing is lost that once was said\nWith all the devotion held right here."
    ],
    grief: [
      "Grief is but love with nowhere left to hide,\nSo here it blooms in holy white.\nAcross the veil, across the tide,\nYour memory remains my light.",
      "A silent taper burning low,\nA fragrant blossom in the dark.\nThe ones we loved will never go;\nThey live within this golden spark."
    ],
    dream: [
      "Beneath the silver canopy of sleep,\nThe quiet constellations turn.\nWhat midnight promised you to keep,\nThese starry velvet petals learn.",
      "You walked through doors of mist and stone,\nAnd woke with starlight on your hands.\nA secret bloom you call your own\nNow rooted where the spirit stands."
    ],
    joy: [
      "Golden as noon and free as air,\nYour happiness refused to fade.\nIt left its radiance everywhere,\nIn every dancing sunlit shade.",
      "A sudden laugh, a golden song,\nA summer afternoon of play.\nThis cheerful bloom has waited long\nTo turn your darkness into day."
    ],
    peace: [
      "Let every troubled tremor cease,\nThe world is gentle once again.\nA quiet fragrance breathing peace\nAcross the hills, beyond the pain.",
      "Breathe in the evening's velvet calm,\nThe storms have spent their bitter rain.\nThis blossom brings its soothing balm\nTo heal what will not hurt again."
    ],
    change: [
      "The seasons drift on tender wind,\nWhat once was budding now has grown.\nNo fleeting hour was left behind;\nIts beauty was your very own.",
      "The petal falls so fruit may rise,\nEach ending brings a morning new.\nBehold through ever-changing eyes\nThe garden blooming deep in you."
    ],
    strength: [
      "Through winter frost and cutting wire,\nYou kept the ember burning bright.\nThis dahlia crowns your inner fire\nWith fierce and unrelenting light.",
      "What sought to break you gave you root,\nYou rose against the bitter wind.\nNow every struggle bears its fruit;\nThe triumph has at last begun."
    ],
    solitude: [
      "In sacred wilderness afar,\nWhere nobody has tracked the ground,\nYou shine beside a quiet star\nWhere perfect peacefulness is found.",
      "Unseen, untouchable, and rare,\nA phantom petal in the gloom.\nYou do not need the crowded square\nTo claim your majesty and bloom."
    ],
    memory: [
      "A memory leaves its fragrant trace\nIn quiet hours of afternoon.\nA golden flower in this place\nBeneath the watchful spirit moon.",
      "Between the spoken words and thought,\nA silent petal gently grew.\nOf all the wonders time has brought,\nThe deepest remains kept in you."
    ]
  };

  const pool = poems[tone] || poems.memory;
  const choice = pool[(variationIndex + text.length) % pool.length];
  return choice;
}

// ──────────────────────────────────────────────
// 6. LOCAL FALLBACK GENERATOR (Deterministic & Rich)
// ──────────────────────────────────────────────

/**
 * Creates a complete flower template using local emotional analysis,
 * custom dynamic names, and dynamic poems.
 */
function createLocalFlower(text, variationIndex = 0) {
  const species = analyzeMemoryAndSelectSpecies(text, variationIndex);
  const name = generateDynamicFlowerName(species, text, variationIndex);
  const poem = generateDynamicPoem(species, text, variationIndex);

  // Slightly vary the palette based on text seed
  const palette = JSON.parse(JSON.stringify(species.defaultPalette));

  return {
    flowerType: species.id,
    speciesTitle: species.displayName,
    name: name,
    meaning: species.meaningDefault,
    poem: poem,
    palette: palette,
    petalCountOverride: species.defaultPetals
  };
}

// ──────────────────────────────────────────────
// 7. AI PROMPT & JSON PARSING (WebLLM)
// ──────────────────────────────────────────────

function buildSystemPrompt() {
  return `You are a poetic spirit botanist for The Spirit Bloom (Día de los Muertos celebration).
Transform the user's memory into an original digital flower.

Respond ONLY with valid JSON (no markdown formatting, no code fences):
{
  "flower_type": "one of: marigold, rose, moonflower, bluebell, sunflower, lavender, white_lily, cherry_blossom, forget_me_not, nightshade, ghost_orchid, crimson_dahlia",
  "flower_name": "Evocative poetic name in Spanish or Spanish/English",
  "emotional_meaning": "2-3 poetic sentences on how this flower reflects the memory",
  "mood": "e.g. warmth, longing, wonder, peace, resilience, nostalgia, reverence",
  "petal_color_1": "hex color for dark petal tone (e.g. #c9184a)",
  "petal_color_2": "hex color for mid petal tone",
  "petal_color_3": "hex color for bright petal highlight",
  "center_color": "hex color for center",
  "accent_color": "hex color for inner details",
  "stem_color": "hex color for stem",
  "petal_count": 8,
  "poem": "An original 4-line poem interpreting the memory. Use \\n between lines."
}`;
}

function extractJSON(raw) {
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

function normaliseAIResponse(data, inputText) {
  function hexOrDefault(val, fallback) {
    if (typeof val === "string" && /^#[0-9a-fA-F]{3,8}$/.test(val.trim())) {
      return val.trim();
    }
    return fallback;
  }

  // Validate flower_type against the 12 supported species
  let type = "marigold";
  if (typeof data.flower_type === "string") {
    const rawType = data.flower_type.toLowerCase().trim().replace(/[-\s]/g, "_");
    if (SPECIES_KEYS.includes(rawType)) {
      type = rawType;
    } else {
      // Find closest match
      const matched = SPECIES_KEYS.find((k) => rawType.includes(k) || k.includes(rawType));
      if (matched) type = matched;
    }
  }

  const spec = FLOWER_SPECIES[type] || FLOWER_SPECIES.marigold;

  return {
    flowerType: type,
    speciesTitle: spec.displayName,
    name: (typeof data.flower_name === "string" && data.flower_name.trim())
      ? data.flower_name.trim()
      : generateDynamicFlowerName(spec, inputText, 0),
    meaning: (typeof data.emotional_meaning === "string" && data.emotional_meaning.trim())
      ? data.emotional_meaning.trim()
      : spec.meaningDefault,
    poem: (typeof data.poem === "string" && data.poem.trim())
      ? data.poem.trim().replace(/\\n/g, "\n")
      : generateDynamicPoem(spec, inputText, 0),
    palette: {
      petals: [
        hexOrDefault(data.petal_color_1, spec.defaultPalette.petals[0]),
        hexOrDefault(data.petal_color_2, spec.defaultPalette.petals[1]),
        hexOrDefault(data.petal_color_3, spec.defaultPalette.petals[2])
      ],
      center: hexOrDefault(data.center_color, spec.defaultPalette.center),
      accent: hexOrDefault(data.accent_color, spec.defaultPalette.accent),
      stem: hexOrDefault(data.stem_color, spec.defaultPalette.stem)
    },
    petalCountOverride: parseInt(data.petal_count, 10) || spec.defaultPetals
  };
}

// ──────────────────────────────────────────────
// 8. WEBLLM ENGINE INIT & INFERENCE
// ──────────────────────────────────────────────

async function initWebLLM() {
  if (!navigator.gpu) {
    setAIStatus("fallback", "WebGPU not available — using built-in flower collection.");
    return;
  }

  const progressWrap = document.getElementById("model-progress-wrap");
  const progressBar = document.getElementById("model-progress-bar");
  const progressLabel = document.getElementById("model-progress-label");
  const progressTrack = progressWrap ? progressWrap.querySelector(".model-progress-track") : null;

  if (progressWrap) progressWrap.hidden = false;
  setAIStatus("loading", "Summoning the spirit intelligence…");

  try {
    engine = await CreateMLCEngine(MODEL_ID, {
      initProgressCallback: function (report) {
        const pct = Math.round((report.progress || 0) * 100);
        if (progressBar) progressBar.style.width = pct + "%";
        if (progressTrack) progressTrack.setAttribute("aria-valuenow", pct);
        if (progressLabel) progressLabel.textContent = report.text || "Loading model…";
      }
    });

    if (progressWrap) progressWrap.hidden = true;
    setAIStatus("ai", "✦ Local AI active — 12 flower species interpreted on-device.");
    const privNotice = document.getElementById("privacy-notice");
    if (privNotice) privNotice.hidden = false;
  } catch (err) {
    console.warn("[SpiritBloom] WebLLM load error:", err);
    if (progressWrap) progressWrap.hidden = true;
    engine = null;
    setAIStatus("fallback", "AI model unavailable — using built-in 12 flower collection.");
  }
}

async function runAIInference(text) {
  const response = await engine.chat.completions.create({
    messages: [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: `Memory:\n"${text}"\n\nChoose the best matching flower species among the 12 and return the JSON.` }
    ],
    temperature: 0.85,
    max_tokens: 512,
    response_format: { type: "json_object" }
  });

  const raw = response.choices[0].message.content || "";
  const data = extractJSON(raw);
  if (!data) throw new Error("Model returned invalid JSON format.");
  return normaliseAIResponse(data, text);
}

function setAIStatus(mode, message) {
  aiMode = mode;
  const banner = document.getElementById("ai-status-banner");
  if (!banner) return;
  const text = document.getElementById("ai-status-text");
  const iconEl = banner.querySelector(".ai-banner__icon");

  banner.classList.remove("ai-banner--loading", "ai-banner--ai", "ai-banner--fallback");
  banner.classList.add("ai-banner--" + mode);

  const icons = { loading: "◌", ai: "✦", fallback: "✿" };
  if (iconEl) iconEl.textContent = icons[mode] || "◌";
  if (text) text.textContent = message;
}

// ──────────────────────────────────────────────
// 9. THE 12 PROCEDURAL SVG FLOWER RENDERERS
// ──────────────────────────────────────────────

/**
 * Creates the base SVG container with species-scoped defs and filters.
 */
function createBaseSVG(uid, palette) {
  const NS = "http://www.w3.org/2000/svg";
  const SIZE = 300;
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${SIZE} ${SIZE}`);
  svg.setAttribute("width", "300");
  svg.setAttribute("height", "300");
  svg.setAttribute("xmlns", NS);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "Spirit flower bloom");

  const defs = document.createElementNS(NS, "defs");

  // Petal Radial Gradient
  const pGrad = document.createElementNS(NS, "radialGradient");
  pGrad.setAttribute("id", `pGrad_${uid}`);
  pGrad.setAttribute("cx", "50%");
  pGrad.setAttribute("cy", "25%");
  pGrad.setAttribute("r", "75%");
  pGrad.innerHTML = `
    <stop offset="0%" stop-color="${palette.petals[2] || palette.petals[0]}" stop-opacity="1"/>
    <stop offset="55%" stop-color="${palette.petals[1] || palette.petals[0]}" stop-opacity="0.95"/>
    <stop offset="100%" stop-color="${palette.petals[0]}" stop-opacity="0.8"/>
  `;

  // Secondary/Accent Gradient
  const aGrad = document.createElementNS(NS, "radialGradient");
  aGrad.setAttribute("id", `aGrad_${uid}`);
  aGrad.setAttribute("cx", "45%");
  aGrad.setAttribute("cy", "35%");
  aGrad.setAttribute("r", "65%");
  aGrad.innerHTML = `
    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
    <stop offset="50%" stop-color="${palette.accent || palette.center}"/>
    <stop offset="100%" stop-color="${palette.petals[0]}" stop-opacity="0.7"/>
  `;

  // Center Gradient
  const cGrad = document.createElementNS(NS, "radialGradient");
  cGrad.setAttribute("id", `cGrad_${uid}`);
  cGrad.setAttribute("cx", "40%");
  cGrad.setAttribute("cy", "35%");
  cGrad.setAttribute("r", "65%");
  cGrad.innerHTML = `
    <stop offset="0%" stop-color="#fffde7" stop-opacity="1"/>
    <stop offset="40%" stop-color="${palette.center}" stop-opacity="1"/>
    <stop offset="100%" stop-color="${palette.petals[0]}" stop-opacity="0.9"/>
  `;

  // Glow Filter
  const glow = document.createElementNS(NS, "filter");
  glow.setAttribute("id", `glow_${uid}`);
  glow.innerHTML = `
    <feGaussianBlur stdDeviation="3.5" result="blur"/>
    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
  `;

  defs.appendChild(pGrad);
  defs.appendChild(aGrad);
  defs.appendChild(cGrad);
  defs.appendChild(glow);
  svg.appendChild(defs);

  return { svg, defs, NS, SIZE, CX: SIZE / 2, CY: SIZE / 2 };
}

// ── 1. MARIGOLD (Dense, ruffled multi-tiered scalloped petals, feathery leaves) ──
function drawMarigold(svg, NS, CX, CY, palette, uid) {
  // Curved stem with feathery pinnate leaves
  const stem = document.createElementNS(NS, "path");
  stem.setAttribute("d", `M ${CX} ${CY + 30} Q ${CX - 8} ${CY + 90} ${CX} 290`);
  stem.setAttribute("stroke", palette.stem);
  stem.setAttribute("stroke-width", "5");
  stem.setAttribute("fill", "none");
  stem.setAttribute("stroke-linecap", "round");
  svg.appendChild(stem);

  // Feathery leaves
  [-1, 1].forEach((dir) => {
    for (let j = 0; j < 3; j++) {
      const ly = CY + 80 + j * 24;
      const lx = CX + dir * 6;
      const leaf = document.createElementNS(NS, "ellipse");
      leaf.setAttribute("cx", lx + dir * 18);
      leaf.setAttribute("cy", ly);
      leaf.setAttribute("rx", "16");
      leaf.setAttribute("ry", "5");
      leaf.setAttribute("fill", palette.stem);
      leaf.setAttribute("opacity", "0.85");
      leaf.setAttribute("transform", `rotate(${dir * 25 - j * 8}, ${lx + dir * 18}, ${ly})`);
      svg.appendChild(leaf);
    }
  });

  const marigoldGroup = document.createElementNS(NS, "g");
  marigoldGroup.setAttribute("filter", `url(#glow_${uid})`);

  // 3 Dense ruffled tiers
  const tiers = [
    { count: 16, dist: 50, rx: 16, ry: 34, op: 0.9 },
    { count: 12, dist: 34, rx: 14, ry: 28, op: 0.95 },
    { count: 9, dist: 18, rx: 12, ry: 22, op: 1 }
  ];

  tiers.forEach((t, tIdx) => {
    for (let i = 0; i < t.count; i++) {
      const angle = (360 / t.count) * i + tIdx * 11;
      const rad = (angle * Math.PI) / 180;
      const px = CX + Math.cos(rad) * t.dist;
      const py = CY + Math.sin(rad) * t.dist;

      const petal = document.createElementNS(NS, "path");
      // Scalloped ruffled petal shape
      petal.setAttribute("d", `M ${px - t.rx} ${py} Q ${px - t.rx * 1.2} ${py - t.ry} ${px} ${py - t.ry * 1.1} Q ${px + t.rx * 1.2} ${py - t.ry} ${px + t.rx} ${py} Z`);
      petal.setAttribute("fill", `url(#pGrad_${uid})`);
      petal.setAttribute("opacity", t.op);
      petal.setAttribute("transform", `rotate(${angle + 90}, ${px}, ${py})`);
      marigoldGroup.appendChild(petal);
    }
  });
  svg.appendChild(marigoldGroup);

  // Ruffled stippled center
  const center = document.createElementNS(NS, "circle");
  center.setAttribute("cx", CX);
  center.setAttribute("cy", CY);
  center.setAttribute("r", "22");
  center.setAttribute("fill", `url(#cGrad_${uid})`);
  svg.appendChild(center);

  // Radiating stamen dots
  for (let i = 0; i < 18; i++) {
    const a = (360 / 18) * i;
    const r = (a * Math.PI) / 180;
    const dot = document.createElementNS(NS, "circle");
    dot.setAttribute("cx", CX + Math.cos(r) * 14);
    dot.setAttribute("cy", CY + Math.sin(r) * 14);
    dot.setAttribute("r", "2.2");
    dot.setAttribute("fill", palette.accent);
    svg.appendChild(dot);
  }
}

// ── 2. ROSE (Layered spiral and cup petals with curved thorny stem) ──
function drawRose(svg, NS, CX, CY, palette, uid) {
  // Thorny curved stem
  const stem = document.createElementNS(NS, "path");
  stem.setAttribute("d", `M ${CX} ${CY + 40} C ${CX - 15} ${CY + 110} ${CX + 20} ${CY + 190} ${CX - 5} 290`);
  stem.setAttribute("stroke", palette.stem);
  stem.setAttribute("stroke-width", "5");
  stem.setAttribute("fill", "none");
  stem.setAttribute("stroke-linecap", "round");
  svg.appendChild(stem);

  // Thorns & rose leaves
  const thorn = document.createElementNS(NS, "path");
  thorn.setAttribute("d", `M ${CX - 6} ${CY + 120} Q ${CX - 16} ${CY + 124} ${CX - 22} ${CY + 132} Q ${CX - 12} ${CY + 130} ${CX - 3} ${CY + 127} Z`);
  thorn.setAttribute("fill", palette.stem);
  svg.appendChild(thorn);

  const leaf = document.createElementNS(NS, "path");
  leaf.setAttribute("d", `M ${CX + 10} ${CY + 150} Q ${CX + 55} ${CY + 135} ${CX + 60} ${CY + 165} Q ${CX + 35} ${CY + 180} ${CX + 10} ${CY + 155} Z`);
  leaf.setAttribute("fill", palette.stem);
  leaf.setAttribute("opacity", "0.9");
  svg.appendChild(leaf);

  const roseGroup = document.createElementNS(NS, "g");
  roseGroup.setAttribute("filter", `url(#glow_${uid})`);

  // Outer guard petals (5 broad cup petals)
  for (let i = 0; i < 5; i++) {
    const angle = (360 / 5) * i - 90;
    const rad = (angle * Math.PI) / 180;
    const px = CX + Math.cos(rad) * 44;
    const py = CY + Math.sin(rad) * 44;
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", `M ${px - 32} ${py} C ${px - 40} ${py - 48} ${px + 40} ${py - 48} ${px + 32} ${py} C ${px + 20} ${py + 25} ${px - 20} ${py + 25} ${px - 32} ${py} Z`);
    p.setAttribute("fill", `url(#pGrad_${uid})`);
    p.setAttribute("opacity", "0.85");
    p.setAttribute("transform", `rotate(${angle + 90}, ${px}, ${py})`);
    roseGroup.appendChild(p);
  }

  // Intermediate overlapping cup petals
  for (let i = 0; i < 6; i++) {
    const angle = (360 / 6) * i + 30;
    const rad = (angle * Math.PI) / 180;
    const px = CX + Math.cos(rad) * 26;
    const py = CY + Math.sin(rad) * 26;
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", `M ${px - 22} ${py} C ${px - 28} ${py - 34} ${px + 28} ${py - 34} ${px + 22} ${py} Z`);
    p.setAttribute("fill", `url(#pGrad_${uid})`);
    p.setAttribute("opacity", "0.95");
    p.setAttribute("transform", `rotate(${angle + 90}, ${px}, ${py})`);
    roseGroup.appendChild(p);
  }

  // Inner spiral whorl
  const spiral = document.createElementNS(NS, "path");
  spiral.setAttribute("d", `M ${CX} ${CY - 12} C ${CX + 14} ${CY - 12} ${CX + 18} ${CY + 8} ${CX} ${CY + 14} C ${CX - 16} ${CY + 14} ${CX - 14} ${CY - 6} ${CX - 4} ${CY - 4} C ${CX + 8} ${CY - 4} ${CX + 6} ${CY + 6} ${CX} ${CY + 6}`);
  spiral.setAttribute("stroke", palette.accent);
  spiral.setAttribute("stroke-width", "3");
  spiral.setAttribute("fill", `url(#cGrad_${uid})`);
  roseGroup.appendChild(spiral);

  svg.appendChild(roseGroup);
}

// ── 3. MOONFLOWER (Wide luminous star-trumpet, starlight ribs, twining vine) ──
function drawMoonflower(svg, NS, CX, CY, palette, uid) {
  // Twining vine stem
  const stem = document.createElementNS(NS, "path");
  stem.setAttribute("d", `M ${CX} ${CY + 40} Q ${CX + 35} ${CY + 110} ${CX} ${CY + 180} T ${CX - 15} 290`);
  stem.setAttribute("stroke", palette.stem);
  stem.setAttribute("stroke-width", "4");
  stem.setAttribute("fill", "none");
  stem.setAttribute("stroke-linecap", "round");
  svg.appendChild(stem);

  // Heart-shaped vine leaves
  const vleaf = document.createElementNS(NS, "path");
  vleaf.setAttribute("d", `M ${CX + 18} ${CY + 130} C ${CX + 38} ${CY + 105} ${CX + 65} ${CY + 135} ${CX + 35} ${CY + 160} Z`);
  vleaf.setAttribute("fill", palette.stem);
  vleaf.setAttribute("opacity", "0.8");
  svg.appendChild(vleaf);

  const moonGroup = document.createElementNS(NS, "g");
  moonGroup.setAttribute("filter", `url(#glow_${uid})`);

  // Fluted trumpet star-disk (5 wide scalloped lobes)
  let d = `M ${CX} ${CY - 82}`;
  for (let i = 0; i < 5; i++) {
    const tipAngle = -90 + i * 72;
    const dipAngle = tipAngle + 36;
    const r1 = 84;
    const r2 = 56;
    const rad1 = (tipAngle * Math.PI) / 180;
    const rad2 = (dipAngle * Math.PI) / 180;
    const p1x = CX + Math.cos(rad1) * r1;
    const p1y = CY + Math.sin(rad1) * r1;
    const p2x = CX + Math.cos(rad2) * r2;
    const p2y = CY + Math.sin(rad2) * r2;
    d += ` Q ${CX + Math.cos(rad1 - 0.25) * 80} ${CY + Math.sin(rad1 - 0.25) * 80} ${p1x} ${p1y}`;
    d += ` Q ${CX + Math.cos(rad1 + 0.25) * 80} ${CY + Math.sin(rad1 + 0.25) * 80} ${p2x} ${p2y}`;
  }
  d += " Z";

  const disc = document.createElementNS(NS, "path");
  disc.setAttribute("d", d);
  disc.setAttribute("fill", `url(#pGrad_${uid})`);
  disc.setAttribute("opacity", "0.92");
  moonGroup.appendChild(disc);

  // 5 Starburst ribs radiating outward
  for (let i = 0; i < 5; i++) {
    const angle = -90 + i * 72;
    const rad = (angle * Math.PI) / 180;
    const rib = document.createElementNS(NS, "line");
    rib.setAttribute("x1", CX);
    rib.setAttribute("y1", CY);
    rib.setAttribute("x2", CX + Math.cos(rad) * 80);
    rib.setAttribute("y2", CY + Math.sin(rad) * 80);
    rib.setAttribute("stroke", palette.accent);
    rib.setAttribute("stroke-width", "2");
    rib.setAttribute("opacity", "0.8");
    moonGroup.appendChild(rib);
  }

  // Glowing center with curved delicate pistils
  const center = document.createElementNS(NS, "circle");
  center.setAttribute("cx", CX);
  center.setAttribute("cy", CY);
  center.setAttribute("r", "16");
  center.setAttribute("fill", `url(#cGrad_${uid})`);
  moonGroup.appendChild(center);

  for (let i = 0; i < 5; i++) {
    const a = -90 + i * 72 + 36;
    const rad = (a * Math.PI) / 180;
    const dot = document.createElementNS(NS, "circle");
    dot.setAttribute("cx", CX + Math.cos(rad) * 22);
    dot.setAttribute("cy", CY + Math.sin(rad) * 22);
    dot.setAttribute("r", "3");
    dot.setAttribute("fill", "#ffffff");
    dot.setAttribute("opacity", "0.95");
    moonGroup.appendChild(dot);
  }

  svg.appendChild(moonGroup);
}

// ── 4. BLUEBELL (Nodding arching raceme with hanging bell florets) ──
function drawBluebell(svg, NS, CX, CY, palette, uid) {
  // Gracefully arching nodding stalk
  const stem = document.createElementNS(NS, "path");
  stem.setAttribute("d", `M ${CX - 30} 290 Q ${CX - 30} ${CY + 80} ${CX + 20} ${CY} Q ${CX + 50} ${CY - 40} ${CX + 20} ${CY - 60}`);
  stem.setAttribute("stroke", palette.stem);
  stem.setAttribute("stroke-width", "4.5");
  stem.setAttribute("fill", "none");
  stem.setAttribute("stroke-linecap", "round");
  svg.appendChild(stem);

  // Basal linear leaves
  const leaf1 = document.createElementNS(NS, "path");
  leaf1.setAttribute("d", `M ${CX - 35} 290 Q ${CX - 75} 220 ${CX - 65} 170 Q ${CX - 50} 220 ${CX - 30} 290`);
  leaf1.setAttribute("fill", palette.stem);
  leaf1.setAttribute("opacity", "0.85");
  svg.appendChild(leaf1);

  const bluebellGroup = document.createElementNS(NS, "g");
  bluebellGroup.setAttribute("filter", `url(#glow_${uid})`);

  // 4 Hanging bell florets dangling along the arch
  const bells = [
    { x: CX + 25, y: CY - 50, scale: 0.9, rot: -20 },
    { x: CX + 40, y: CY - 20, scale: 1.05, rot: 15 },
    { x: CX + 28, y: CY + 18, scale: 1.0, rot: 40 },
    { x: CX + 8, y: CY + 55, scale: 0.85, rot: 60 }
  ];

  bells.forEach((b) => {
    const bg = document.createElementNS(NS, "g");
    bg.setAttribute("transform", `translate(${b.x}, ${b.y}) scale(${b.scale}) rotate(${b.rot})`);

    // Pedicel
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", `M 0 0 C -8 -10 -15 -10 -22 -6`);
    p.setAttribute("stroke", palette.stem);
    p.setAttribute("stroke-width", "2");
    p.setAttribute("fill", "none");
    bg.appendChild(p);

    // Flared bell body
    const bell = document.createElementNS(NS, "path");
    bell.setAttribute("d", `M -10 -4 C -2 15 -6 32 -16 40 C -8 38 8 38 16 40 C 6 32 2 15 10 -4 Z`);
    bell.setAttribute("fill", `url(#pGrad_${uid})`);
    bell.setAttribute("opacity", "0.9");
    bg.appendChild(bell);

    // Reflexed flared tips
    const rim = document.createElementNS(NS, "path");
    rim.setAttribute("d", `M -16 40 Q -22 46 -14 48 Q 0 42 14 48 Q 22 46 16 40 Z`);
    rim.setAttribute("fill", palette.accent);
    rim.setAttribute("opacity", "0.85");
    bg.appendChild(rim);

    // Stamen peek
    const stamen = document.createElementNS(NS, "line");
    stamen.setAttribute("x1", "0");
    stamen.setAttribute("y1", "30");
    stamen.setAttribute("x2", "0");
    stamen.setAttribute("y2", "47");
    stamen.setAttribute("stroke", palette.center);
    stamen.setAttribute("stroke-width", "2");
    bg.appendChild(stamen);

    bluebellGroup.appendChild(bg);
  });

  svg.appendChild(bluebellGroup);
}

// ── 5. SUNFLOWER (Large prominent dark seed disc, 26 radiating golden rays) ──
function drawSunflower(svg, NS, CX, CY, palette, uid) {
  // Thick sturdy stem
  const stem = document.createElementNS(NS, "path");
  stem.setAttribute("d", `M ${CX} ${CY + 50} L ${CX} 290`);
  stem.setAttribute("stroke", palette.stem);
  stem.setAttribute("stroke-width", "8");
  stem.setAttribute("stroke-linecap", "round");
  svg.appendChild(stem);

  // Broad cordate leaves
  const leafL = document.createElementNS(NS, "path");
  leafL.setAttribute("d", `M ${CX - 4} ${CY + 140} C ${CX - 60} ${CY + 110} ${CX - 85} ${CY + 160} ${CX - 4} ${CY + 185} Z`);
  leafL.setAttribute("fill", palette.stem);
  leafL.setAttribute("opacity", "0.9");
  svg.appendChild(leafL);

  const leafR = document.createElementNS(NS, "path");
  leafR.setAttribute("d", `M ${CX + 4} ${CY + 170} C ${CX + 60} ${CY + 140} ${CX + 85} ${CY + 190} ${CX + 4} ${CY + 215} Z`);
  leafR.setAttribute("fill", palette.stem);
  leafR.setAttribute("opacity", "0.9");
  svg.appendChild(leafR);

  const sunGroup = document.createElementNS(NS, "g");
  sunGroup.setAttribute("filter", `url(#glow_${uid})`);

  // 26 Radiating pointed ray petals
  const rays = 26;
  for (let i = 0; i < rays; i++) {
    const angle = (360 / rays) * i;
    const rad = (angle * Math.PI) / 180;
    const px = CX + Math.cos(rad) * 58;
    const py = CY + Math.sin(rad) * 58;
    const petal = document.createElementNS(NS, "path");
    petal.setAttribute("d", `M ${px - 10} ${py} Q ${px} ${py - 38} ${px + 10} ${py} Q ${px} ${py + 8} ${px - 10} ${py} Z`);
    petal.setAttribute("fill", `url(#pGrad_${uid})`);
    petal.setAttribute("opacity", "0.95");
    petal.setAttribute("transform", `rotate(${angle + 90}, ${px}, ${py})`);
    sunGroup.appendChild(petal);
  }
  svg.appendChild(sunGroup);

  // Large dark central disk
  const disc = document.createElementNS(NS, "circle");
  disc.setAttribute("cx", CX);
  disc.setAttribute("cy", CY);
  disc.setAttribute("r", "44");
  disc.setAttribute("fill", `url(#cGrad_${uid})`);
  svg.appendChild(disc);

  // Concentric seed phyllotaxis dots
  for (let r = 10; r <= 36; r += 7) {
    const count = Math.floor(r * 1.5);
    for (let j = 0; j < count; j++) {
      const a = (360 / count) * j + r * 15;
      const rad = (a * Math.PI) / 180;
      const sdot = document.createElementNS(NS, "circle");
      sdot.setAttribute("cx", CX + Math.cos(rad) * r);
      sdot.setAttribute("cy", CY + Math.sin(rad) * r);
      sdot.setAttribute("r", "1.6");
      sdot.setAttribute("fill", palette.accent);
      sdot.setAttribute("opacity", "0.85");
      svg.appendChild(sdot);
    }
  }
}

// ── 6. LAVENDER (Tall upright spike with 6 tiered floret whorls) ──
function drawLavender(svg, NS, CX, CY, palette, uid) {
  // Slender upright stem
  const stem = document.createElementNS(NS, "line");
  stem.setAttribute("x1", CX);
  stem.setAttribute("y1", CY - 75);
  stem.setAttribute("x2", CX);
  stem.setAttribute("y2", "290");
  stem.setAttribute("stroke", palette.stem);
  stem.setAttribute("stroke-width", "3.5");
  stem.setAttribute("stroke-linecap", "round");
  svg.appendChild(stem);

  // Narrow needle-like leaves
  for (let j = 0; j < 4; j++) {
    const ly = CY + 100 + j * 30;
    [-1, 1].forEach((dir) => {
      const leaf = document.createElementNS(NS, "line");
      leaf.setAttribute("x1", CX);
      leaf.setAttribute("y1", ly);
      leaf.setAttribute("x2", CX + dir * 28);
      leaf.setAttribute("y2", ly - 18);
      leaf.setAttribute("stroke", palette.stem);
      leaf.setAttribute("stroke-width", "2.5");
      leaf.setAttribute("stroke-linecap", "round");
      svg.appendChild(leaf);
    });
  }

  const lavGroup = document.createElementNS(NS, "g");
  lavGroup.setAttribute("filter", `url(#glow_${uid})`);

  // 7 Tiered whorls of tubular florets along the top half
  const whorls = [
    { y: CY - 65, count: 5, rx: 7, ry: 10, spread: 14 },
    { y: CY - 42, count: 6, rx: 8, ry: 12, spread: 20 },
    { y: CY - 18, count: 7, rx: 9, ry: 13, spread: 24 },
    { y: CY + 8, count: 7, rx: 9, ry: 14, spread: 26 },
    { y: CY + 34, count: 6, rx: 8, ry: 13, spread: 22 },
    { y: CY + 60, count: 5, rx: 7, ry: 11, spread: 18 }
  ];

  whorls.forEach((w) => {
    for (let i = 0; i < w.count; i++) {
      const frac = (i - (w.count - 1) / 2) / ((w.count - 1) / 2 || 1);
      const fx = CX + frac * w.spread;
      const fy = w.y + (Math.abs(frac) * 4);
      const floret = document.createElementNS(NS, "ellipse");
      floret.setAttribute("cx", fx);
      floret.setAttribute("cy", fy);
      floret.setAttribute("rx", w.rx);
      floret.setAttribute("ry", w.ry);
      floret.setAttribute("fill", `url(#pGrad_${uid})`);
      floret.setAttribute("opacity", "0.92");
      floret.setAttribute("transform", `rotate(${frac * 35}, ${fx}, ${fy})`);
      lavGroup.appendChild(floret);

      // Accent dot on floret tip
      const fdot = document.createElementNS(NS, "circle");
      fdot.setAttribute("cx", fx);
      fdot.setAttribute("cy", fy - w.ry * 0.6);
      fdot.setAttribute("r", "2");
      fdot.setAttribute("fill", palette.accent);
      lavGroup.appendChild(fdot);
    }
  });

  // Soft fragrant aura motes
  for (let k = 0; k < 12; k++) {
    const mote = document.createElementNS(NS, "circle");
    mote.setAttribute("cx", CX + (Math.sin(k * 1.7) * 45));
    mote.setAttribute("cy", CY - 50 + k * 12);
    mote.setAttribute("r", "1.8");
    mote.setAttribute("fill", palette.accent);
    mote.setAttribute("opacity", "0.75");
    lavGroup.appendChild(mote);
  }

  svg.appendChild(lavGroup);
}

// ── 7. WHITE LILY (6 Long reflexed pointed tepals with 6 prominent protruding stamens) ──
function drawWhiteLily(svg, NS, CX, CY, palette, uid) {
  // Smooth upright stem
  const stem = document.createElementNS(NS, "path");
  stem.setAttribute("d", `M ${CX} ${CY + 35} Q ${CX + 10} ${CY + 120} ${CX} 290`);
  stem.setAttribute("stroke", palette.stem);
  stem.setAttribute("stroke-width", "5");
  stem.setAttribute("fill", "none");
  stem.setAttribute("stroke-linecap", "round");
  svg.appendChild(stem);

  // Lily lanceolate leaves
  const leaf = document.createElementNS(NS, "path");
  leaf.setAttribute("d", `M ${CX + 4} ${CY + 130} Q ${CX + 55} ${CY + 120} ${CX + 80} ${CY + 150} Q ${CX + 35} ${CY + 155} ${CX + 4} ${CY + 140} Z`);
  leaf.setAttribute("fill", palette.stem);
  leaf.setAttribute("opacity", "0.85");
  svg.appendChild(leaf);

  const lilyGroup = document.createElementNS(NS, "g");
  lilyGroup.setAttribute("filter", `url(#glow_${uid})`);

  // 6 Long reflexed pointed tepals (3 inner, 3 outer)
  for (let i = 0; i < 6; i++) {
    const angle = (360 / 6) * i - 90;
    const rad = (angle * Math.PI) / 180;
    const isInner = i % 2 === 1;
    const len = isInner ? 78 : 88;
    const w = isInner ? 24 : 30;

    const tepal = document.createElementNS(NS, "path");
    // Sweeping pointed reflexed petal
    tepal.setAttribute("d", `M ${CX} ${CY} Q ${CX - w} ${CY - len * 0.6} ${CX} ${CY - len} Q ${CX + w} ${CY - len * 0.6} ${CX} ${CY} Z`);
    tepal.setAttribute("fill", isInner ? `url(#aGrad_${uid})` : `url(#pGrad_${uid})`);
    tepal.setAttribute("opacity", isInner ? "0.95" : "0.85");
    tepal.setAttribute("transform", `rotate(${angle + 90}, ${CX}, ${CY})`);
    lilyGroup.appendChild(tepal);
  }

  // 6 Long protruding stamens with prominent horizontal T-shaped anthers
  for (let i = 0; i < 6; i++) {
    const angle = (360 / 6) * i - 60;
    const rad = (angle * Math.PI) / 180;
    const fx = CX + Math.cos(rad) * 48;
    const fy = CY + Math.sin(rad) * 48;

    // Filament
    const fil = document.createElementNS(NS, "line");
    fil.setAttribute("x1", CX);
    fil.setAttribute("y1", CY);
    fil.setAttribute("x2", fx);
    fil.setAttribute("y2", fy);
    fil.setAttribute("stroke", "#c7f9cc");
    fil.setAttribute("stroke-width", "2");
    lilyGroup.appendChild(fil);

    // T-shaped anther
    const anther = document.createElementNS(NS, "ellipse");
    anther.setAttribute("cx", fx);
    anther.setAttribute("cy", fy);
    anther.setAttribute("rx", "6");
    anther.setAttribute("ry", "2.8");
    anther.setAttribute("fill", palette.accent);
    anther.setAttribute("transform", `rotate(${angle + 90}, ${fx}, ${fy})`);
    lilyGroup.appendChild(anther);
  }

  // Pale chartreuse central throat
  const throat = document.createElementNS(NS, "circle");
  throat.setAttribute("cx", CX);
  throat.setAttribute("cy", CY);
  throat.setAttribute("r", "14");
  throat.setAttribute("fill", `url(#cGrad_${uid})`);
  lilyGroup.appendChild(throat);

  svg.appendChild(lilyGroup);
}

// ── 8. CHERRY BLOSSOM (5 Distinctive cleft/notched petals with radial stamens) ──
function drawCherryBlossom(svg, NS, CX, CY, palette, uid) {
  // Woody twig branch
  const branch = document.createElementNS(NS, "path");
  branch.setAttribute("d", `M ${CX - 60} 290 Q ${CX - 20} ${CY + 120} ${CX} ${CY + 30}`);
  branch.setAttribute("stroke", palette.stem);
  branch.setAttribute("stroke-width", "5.5");
  branch.setAttribute("fill", "none");
  branch.setAttribute("stroke-linecap", "round");
  svg.appendChild(branch);

  // Side shoot with small companion bud
  const shoot = document.createElementNS(NS, "path");
  shoot.setAttribute("d", `M ${CX - 15} ${CY + 110} Q ${CX - 40} ${CY + 85} ${CX - 45} ${CY + 70}`);
  shoot.setAttribute("stroke", palette.stem);
  shoot.setAttribute("stroke-width", "3");
  shoot.setAttribute("fill", "none");
  svg.appendChild(shoot);

  const bud = document.createElementNS(NS, "ellipse");
  bud.setAttribute("cx", CX - 47);
  bud.setAttribute("cy", CY + 66);
  bud.setAttribute("rx", "7");
  bud.setAttribute("ry", "11");
  bud.setAttribute("fill", `url(#pGrad_${uid})`);
  bud.setAttribute("transform", `rotate(-30, ${CX - 47}, ${CY + 66})`);
  svg.appendChild(bud);

  const cherryGroup = document.createElementNS(NS, "g");
  cherryGroup.setAttribute("filter", `url(#glow_${uid})`);

  // 5 Notched / cleft petals (each petal has a distinct V-cut on its top edge)
  for (let i = 0; i < 5; i++) {
    const angle = (360 / 5) * i - 90;
    const petal = document.createElementNS(NS, "path");
    // Heart/notched petal shape
    petal.setAttribute("d", `M ${CX} ${CY} C ${CX - 32} ${CY - 30} ${CX - 28} ${CY - 70} ${CX - 6} ${CY - 68} L ${CX} ${CY - 58} L ${CX + 6} ${CY - 68} C ${CX + 28} ${CY - 70} ${CX + 32} ${CY - 30} ${CX} ${CY} Z`);
    petal.setAttribute("fill", `url(#pGrad_${uid})`);
    petal.setAttribute("opacity", "0.92");
    petal.setAttribute("transform", `rotate(${angle + 90}, ${CX}, ${CY})`);
    cherryGroup.appendChild(petal);
  }

  // Central ring of radiating fine stamen filaments with golden/crimson dots
  for (let i = 0; i < 18; i++) {
    const angle = (360 / 18) * i;
    const rad = (angle * Math.PI) / 180;
    const sx = CX + Math.cos(rad) * 22;
    const sy = CY + Math.sin(rad) * 22;

    const fil = document.createElementNS(NS, "line");
    fil.setAttribute("x1", CX);
    fil.setAttribute("y1", CY);
    fil.setAttribute("x2", sx);
    fil.setAttribute("y2", sy);
    fil.setAttribute("stroke", palette.center);
    fil.setAttribute("stroke-width", "1.4");
    cherryGroup.appendChild(fil);

    const dot = document.createElementNS(NS, "circle");
    dot.setAttribute("cx", sx);
    dot.setAttribute("cy", sy);
    dot.setAttribute("r", "2");
    dot.setAttribute("fill", palette.accent);
    cherryGroup.appendChild(dot);
  }

  // Crimson floral eye
  const centerEye = document.createElementNS(NS, "circle");
  centerEye.setAttribute("cx", CX);
  centerEye.setAttribute("cy", CY);
  centerEye.setAttribute("r", "8");
  centerEye.setAttribute("fill", palette.center);
  cherryGroup.appendChild(centerEye);

  svg.appendChild(cherryGroup);
}

// ── 9. FORGET-ME-NOT (5 Rounded sky-blue petals with pentagonal yellow eye) ──
function drawForgetMeNot(svg, NS, CX, CY, palette, uid) {
  // Branching delicate stem
  const stem = document.createElementNS(NS, "path");
  stem.setAttribute("d", `M ${CX} ${CY + 30} Q ${CX - 15} ${CY + 120} ${CX - 5} 290`);
  stem.setAttribute("stroke", palette.stem);
  stem.setAttribute("stroke-width", "4");
  stem.setAttribute("fill", "none");
  stem.setAttribute("stroke-linecap", "round");
  svg.appendChild(stem);

  // Soft rounded leaves
  const leaf = document.createElementNS(NS, "ellipse");
  leaf.setAttribute("cx", CX + 20);
  leaf.setAttribute("cy", CY + 140);
  leaf.setAttribute("rx", "18");
  leaf.setAttribute("ry", "8");
  leaf.setAttribute("fill", palette.stem);
  leaf.setAttribute("opacity", "0.85");
  leaf.setAttribute("transform", `rotate(25, ${CX + 20}, ${CY + 140})`);
  svg.appendChild(leaf);

  const fmnGroup = document.createElementNS(NS, "g");
  fmnGroup.setAttribute("filter", `url(#glow_${uid})`);

  // 5 Soft rounded paddle petals
  for (let i = 0; i < 5; i++) {
    const angle = (360 / 5) * i - 90;
    const rad = (angle * Math.PI) / 180;
    const px = CX + Math.cos(rad) * 40;
    const py = CY + Math.sin(rad) * 40;

    const petal = document.createElementNS(NS, "ellipse");
    petal.setAttribute("cx", px);
    petal.setAttribute("cy", py);
    petal.setAttribute("rx", "26");
    petal.setAttribute("ry", "28");
    petal.setAttribute("fill", `url(#pGrad_${uid})`);
    petal.setAttribute("opacity", "0.92");
    petal.setAttribute("transform", `rotate(${angle + 90}, ${px}, ${py})`);
    fmnGroup.appendChild(petal);

    // White throat star ray
    const ray = document.createElementNS(NS, "line");
    ray.setAttribute("x1", CX);
    ray.setAttribute("y1", CY);
    ray.setAttribute("x2", CX + Math.cos(rad) * 25);
    ray.setAttribute("y2", CY + Math.sin(rad) * 25);
    ray.setAttribute("stroke", "#ffffff");
    ray.setAttribute("stroke-width", "2");
    ray.setAttribute("opacity", "0.9");
    fmnGroup.appendChild(ray);
  }

  // Vivid pentagonal raised yellow eye
  const eye = document.createElementNS(NS, "circle");
  eye.setAttribute("cx", CX);
  eye.setAttribute("cy", CY);
  eye.setAttribute("r", "14");
  eye.setAttribute("fill", palette.center);
  eye.setAttribute("stroke", "#ffffff");
  eye.setAttribute("stroke-width", "2");
  fmnGroup.appendChild(eye);

  const pupil = document.createElementNS(NS, "circle");
  pupil.setAttribute("cx", CX);
  pupil.setAttribute("cy", CY);
  pupil.setAttribute("r", "4.5");
  pupil.setAttribute("fill", "#592a00");
  fmnGroup.appendChild(pupil);

  svg.appendChild(fmnGroup);
}

// ── 10. NIGHTSHADE FANTASY (5 Reflexed pointed star petals, protruding golden cone) ──
function drawNightshade(svg, NS, CX, CY, palette, uid) {
  // Twisting dusky stem
  const stem = document.createElementNS(NS, "path");
  stem.setAttribute("d", `M ${CX} ${CY + 30} Q ${CX + 25} ${CY + 90} ${CX - 15} ${CY + 180} T ${CX} 290`);
  stem.setAttribute("stroke", palette.stem);
  stem.setAttribute("stroke-width", "4.5");
  stem.setAttribute("fill", "none");
  stem.setAttribute("stroke-linecap", "round");
  svg.appendChild(stem);

  // Wavy pointed leaves
  const nleaf = document.createElementNS(NS, "path");
  nleaf.setAttribute("d", `M ${CX - 10} ${CY + 120} Q ${CX - 60} ${CY + 90} ${CX - 75} ${CY + 130} Q ${CX - 40} ${CY + 145} ${CX - 10} ${CY + 130} Z`);
  nleaf.setAttribute("fill", palette.stem);
  nleaf.setAttribute("opacity", "0.85");
  svg.appendChild(nleaf);

  const nightGroup = document.createElementNS(NS, "g");
  nightGroup.setAttribute("filter", `url(#glow_${uid})`);

  // 5 Sharply reflexed pointed star petals curving backwards
  for (let i = 0; i < 5; i++) {
    const angle = (360 / 5) * i - 90;
    const starPetal = document.createElementNS(NS, "path");
    starPetal.setAttribute("d", `M ${CX} ${CY} Q ${CX - 24} ${CY - 30} ${CX} ${CY - 82} Q ${CX + 24} ${CY - 30} ${CX} ${CY} Z`);
    starPetal.setAttribute("fill", `url(#pGrad_${uid})`);
    starPetal.setAttribute("stroke", palette.accent);
    starPetal.setAttribute("stroke-width", "1.5");
    starPetal.setAttribute("opacity", "0.95");
    starPetal.setAttribute("transform", `rotate(${angle + 90}, ${CX}, ${CY})`);
    nightGroup.appendChild(starPetal);
  }

  // Dramatic forward-thrusting golden cone beak (fused anthers)
  const beak = document.createElementNS(NS, "path");
  beak.setAttribute("d", `M ${CX - 14} ${CY - 6} L ${CX + 14} ${CY - 6} L ${CX} ${CY + 36} Z`);
  beak.setAttribute("fill", palette.center);
  beak.setAttribute("stroke", "#ffffff");
  beak.setAttribute("stroke-width", "1.5");
  nightGroup.appendChild(beak);

  // Protruding green style tip
  const styleTip = document.createElementNS(NS, "line");
  styleTip.setAttribute("x1", CX);
  styleTip.setAttribute("y1", CY + 25);
  styleTip.setAttribute("x2", CX);
  styleTip.setAttribute("y2", CY + 48);
  styleTip.setAttribute("stroke", palette.accent);
  styleTip.setAttribute("stroke-width", "2.5");
  styleTip.setAttribute("stroke-linecap", "round");
  nightGroup.appendChild(styleTip);

  // Mystical floating embers
  for (let i = 0; i < 8; i++) {
    const ember = document.createElementNS(NS, "circle");
    ember.setAttribute("cx", CX + Math.sin(i * 1.9) * 60);
    ember.setAttribute("cy", CY + Math.cos(i * 2.1) * 60);
    ember.setAttribute("r", "2");
    ember.setAttribute("fill", palette.accent);
    ember.setAttribute("opacity", "0.8");
    nightGroup.appendChild(ember);
  }

  svg.appendChild(nightGroup);
}

// ── 11. GHOST ORCHID (Translucent petals, frog labellum lip with trailing ribbon tendrils) ──
function drawGhostOrchid(svg, NS, CX, CY, palette, uid) {
  // Photosynthetic green aerial root stem
  const root = document.createElementNS(NS, "path");
  root.setAttribute("d", `M ${CX - 40} 290 Q ${CX - 20} ${CY + 140} ${CX} ${CY + 40}`);
  root.setAttribute("stroke", palette.stem);
  root.setAttribute("stroke-width", "4");
  root.setAttribute("fill", "none");
  root.setAttribute("stroke-linecap", "round");
  svg.appendChild(root);

  // Aerial root clasp
  const rootClasp = document.createElementNS(NS, "path");
  rootClasp.setAttribute("d", `M ${CX - 15} ${CY + 130} Q ${CX + 25} ${CY + 110} ${CX + 35} ${CY + 150}`);
  rootClasp.setAttribute("stroke", palette.stem);
  rootClasp.setAttribute("stroke-width", "2.5");
  rootClasp.setAttribute("fill", "none");
  svg.appendChild(rootClasp);

  const orchidGroup = document.createElementNS(NS, "g");
  orchidGroup.setAttribute("filter", `url(#glow_${uid})`);

  // Dorsal and lateral spreading sepals (translucent white & celadon)
  const sepals = [
    { d: `M ${CX} ${CY} Q ${CX - 15} ${CY - 40} ${CX} ${CY - 78} Q ${CX + 15} ${CY - 40} ${CX} ${CY} Z`, rot: 0 },
    { d: `M ${CX} ${CY} Q ${CX - 45} ${CY - 20} ${CX - 72} ${CY - 24} Q ${CX - 40} ${CY + 8} ${CX} ${CY} Z`, rot: 0 },
    { d: `M ${CX} ${CY} Q ${CX + 45} ${CY - 20} ${CX + 72} ${CY - 24} Q ${CX + 40} ${CY + 8} ${CX} ${CY} Z`, rot: 0 }
  ];

  sepals.forEach((s) => {
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", s.d);
    p.setAttribute("fill", `url(#pGrad_${uid})`);
    p.setAttribute("opacity", "0.85");
    orchidGroup.appendChild(p);
  });

  // Characteristic frog-like lower lip (labellum) with two trailing curling ribbon tendrils
  const lip = document.createElementNS(NS, "path");
  lip.setAttribute("d", `M ${CX - 16} ${CY + 6} Q ${CX} ${CY + 22} ${CX + 16} ${CY + 6} C ${CX + 32} ${CY + 30} ${CX + 18} ${CY + 45} ${CX} ${CY + 40} C ${CX - 18} ${CY + 45} ${CX - 32} ${CY + 30} ${CX - 16} ${CY + 6} Z`);
  lip.setAttribute("fill", `url(#aGrad_${uid})`);
  lip.setAttribute("opacity", "0.95");
  orchidGroup.appendChild(lip);

  // Two long curling ribbon tendrils trailing downwards
  const tendrilL = document.createElementNS(NS, "path");
  tendrilL.setAttribute("d", `M ${CX - 12} ${CY + 38} Q ${CX - 38} ${CY + 65} ${CX - 48} ${CY + 95} Q ${CX - 35} ${CY + 115} ${CX - 22} ${CY + 110}`);
  tendrilL.setAttribute("stroke", palette.petals[2] || "#ffffff");
  tendrilL.setAttribute("stroke-width", "3");
  tendrilL.setAttribute("fill", "none");
  tendrilL.setAttribute("stroke-linecap", "round");
  orchidGroup.appendChild(tendrilL);

  const tendrilR = document.createElementNS(NS, "path");
  tendrilR.setAttribute("d", `M ${CX + 12} ${CY + 38} Q ${CX + 38} ${CY + 65} ${CX + 48} ${CY + 95} Q ${CX + 35} ${CY + 115} ${CX + 22} ${CY + 110}`);
  tendrilR.setAttribute("stroke", palette.petals[2] || "#ffffff");
  tendrilR.setAttribute("stroke-width", "3");
  tendrilR.setAttribute("fill", "none");
  tendrilR.setAttribute("stroke-linecap", "round");
  orchidGroup.appendChild(tendrilR);

  // Small central column
  const column = document.createElementNS(NS, "circle");
  column.setAttribute("cx", CX);
  column.setAttribute("cy", CY + 2);
  column.setAttribute("r", "7");
  column.setAttribute("fill", palette.center);
  orchidGroup.appendChild(column);

  svg.appendChild(orchidGroup);
}

// ── 12. CRIMSON DAHLIA (Dense geometric concentric multi-tiered quilled petals) ──
function drawCrimsonDahlia(svg, NS, CX, CY, palette, uid) {
  // Sturdy leafy stem
  const stem = document.createElementNS(NS, "path");
  stem.setAttribute("d", `M ${CX} ${CY + 45} L ${CX} 290`);
  stem.setAttribute("stroke", palette.stem);
  stem.setAttribute("stroke-width", "6.5");
  stem.setAttribute("stroke-linecap", "round");
  svg.appendChild(stem);

  // Dahlia compound leaves
  const dleaf1 = document.createElementNS(NS, "path");
  dleaf1.setAttribute("d", `M ${CX - 3} ${CY + 130} Q ${CX - 50} ${CY + 100} ${CX - 65} ${CY + 135} Q ${CX - 35} ${CY + 160} ${CX - 3} ${CY + 145} Z`);
  dleaf1.setAttribute("fill", palette.stem);
  dleaf1.setAttribute("opacity", "0.9");
  svg.appendChild(dleaf1);

  const dleaf2 = document.createElementNS(NS, "path");
  dleaf2.setAttribute("d", `M ${CX + 3} ${CY + 160} Q ${CX + 50} ${CY + 130} ${CX + 65} ${CY + 165} Q ${CX + 35} ${CY + 190} ${CX + 3} ${CY + 175} Z`);
  dleaf2.setAttribute("fill", palette.stem);
  dleaf2.setAttribute("opacity", "0.9");
  svg.appendChild(dleaf2);

  const dahliaGroup = document.createElementNS(NS, "g");
  dahliaGroup.setAttribute("filter", `url(#glow_${uid})`);

  // Dense concentric geometric tiers of quilled pointed petals
  const tiers = [
    { count: 18, dist: 56, w: 10, len: 44, op: 0.85 },
    { count: 14, dist: 40, w: 9, len: 36, op: 0.9 },
    { count: 10, dist: 25, w: 8, len: 28, op: 0.95 },
    { count: 8, dist: 12, w: 7, len: 20, op: 1.0 }
  ];

  tiers.forEach((t, tIdx) => {
    for (let i = 0; i < t.count; i++) {
      const angle = (360 / t.count) * i + tIdx * 12;
      const rad = (angle * Math.PI) / 180;
      const px = CX + Math.cos(rad) * t.dist;
      const py = CY + Math.sin(rad) * t.dist;

      const petal = document.createElementNS(NS, "path");
      // Geometric cupped pointed dahlia petal
      petal.setAttribute("d", `M ${px - t.w} ${py} Q ${px} ${py - t.len} ${px + t.w} ${py} Q ${px} ${py + 6} ${px - t.w} ${py} Z`);
      petal.setAttribute("fill", tIdx === 3 ? palette.accent : `url(#pGrad_${uid})`);
      petal.setAttribute("opacity", t.op);
      petal.setAttribute("transform", `rotate(${angle + 90}, ${px}, ${py})`);
      dahliaGroup.appendChild(petal);
    }
  });

  // Tight central button
  const center = document.createElementNS(NS, "circle");
  center.setAttribute("cx", CX);
  center.setAttribute("cy", CY);
  center.setAttribute("r", "12");
  center.setAttribute("fill", `url(#cGrad_${uid})`);
  dahliaGroup.appendChild(center);

  svg.appendChild(dahliaGroup);
}

// ──────────────────────────────────────────────
// 10. SVG FLOWER DISPATCHER
// ──────────────────────────────────────────────

let globalFlowerCounter = 0;

/**
 * Main dispatcher to render an SVG flower matching its distinct flowerType.
 */
function generateFlowerSVG(palette, flowerType = "marigold") {
  globalFlowerCounter++;
  const uid = `${Date.now().toString(36)}_${globalFlowerCounter}`;
  const base = createBaseSVG(uid, palette);
  const { svg, NS, CX, CY } = base;

  switch (flowerType) {
    case "marigold":
      drawMarigold(svg, NS, CX, CY, palette, uid);
      break;
    case "rose":
      drawRose(svg, NS, CX, CY, palette, uid);
      break;
    case "moonflower":
      drawMoonflower(svg, NS, CX, CY, palette, uid);
      break;
    case "bluebell":
      drawBluebell(svg, NS, CX, CY, palette, uid);
      break;
    case "sunflower":
      drawSunflower(svg, NS, CX, CY, palette, uid);
      break;
    case "lavender":
      drawLavender(svg, NS, CX, CY, palette, uid);
      break;
    case "white_lily":
      drawWhiteLily(svg, NS, CX, CY, palette, uid);
      break;
    case "cherry_blossom":
      drawCherryBlossom(svg, NS, CX, CY, palette, uid);
      break;
    case "forget_me_not":
      drawForgetMeNot(svg, NS, CX, CY, palette, uid);
      break;
    case "nightshade":
      drawNightshade(svg, NS, CX, CY, palette, uid);
      break;
    case "ghost_orchid":
      drawGhostOrchid(svg, NS, CX, CY, palette, uid);
      break;
    case "crimson_dahlia":
      drawCrimsonDahlia(svg, NS, CX, CY, palette, uid);
      break;
    default:
      drawMarigold(svg, NS, CX, CY, palette, uid);
  }

  return svg;
}

// ──────────────────────────────────────────────
// 11. GALLERY THUMBNAIL RENDERER (Species-aware)
// ──────────────────────────────────────────────

/**
 * Creates a lightweight 120x120 SVG thumbnail representing the specific flower species.
 */
function generateThumbnailSVG(palette, flowerType = "marigold") {
  const NS = "http://www.w3.org/2000/svg";
  const SIZE = 120;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const tid = `thumb_${Math.random().toString(36).slice(2, 7)}`;

  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${SIZE} ${SIZE}`);
  svg.setAttribute("width", SIZE);
  svg.setAttribute("height", SIZE);
  svg.setAttribute("aria-hidden", "true");

  const defs = document.createElementNS(NS, "defs");

  const pGrad = document.createElementNS(NS, "radialGradient");
  pGrad.setAttribute("id", tid + "_p");
  pGrad.setAttribute("cx", "50%");
  pGrad.setAttribute("cy", "30%");
  pGrad.setAttribute("r", "70%");
  pGrad.innerHTML = `
    <stop offset="0%" stop-color="${palette.petals[2] || palette.petals[0]}"/>
    <stop offset="60%" stop-color="${palette.petals[1] || palette.petals[0]}" stop-opacity="0.95"/>
    <stop offset="100%" stop-color="${palette.petals[0]}" stop-opacity="0.8"/>
  `;

  const glow = document.createElementNS(NS, "filter");
  glow.setAttribute("id", tid + "_g");
  glow.innerHTML = `<feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>`;

  defs.appendChild(pGrad);
  defs.appendChild(glow);
  svg.appendChild(defs);

  const g = document.createElementNS(NS, "g");
  g.setAttribute("filter", `url(#${tid}_g)`);

  if (flowerType === "sunflower") {
    for (let i = 0; i < 18; i++) {
      const a = (360 / 18) * i;
      const r = (a * Math.PI) / 180;
      const el = document.createElementNS(NS, "ellipse");
      el.setAttribute("cx", CX + Math.cos(r) * 24);
      el.setAttribute("cy", CY + Math.sin(r) * 24);
      el.setAttribute("rx", "5");
      el.setAttribute("ry", "16");
      el.setAttribute("fill", `url(#${tid}_p)`);
      el.setAttribute("transform", `rotate(${a + 90}, ${CX + Math.cos(r) * 24}, ${CY + Math.sin(r) * 24})`);
      g.appendChild(el);
    }
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", CX);
    c.setAttribute("cy", CY);
    c.setAttribute("r", "18");
    c.setAttribute("fill", palette.center);
    g.appendChild(c);
  } else if (flowerType === "cherry_blossom" || flowerType === "forget_me_not") {
    for (let i = 0; i < 5; i++) {
      const a = (360 / 5) * i - 90;
      const r = (a * Math.PI) / 180;
      const el = document.createElementNS(NS, "circle");
      el.setAttribute("cx", CX + Math.cos(r) * 16);
      el.setAttribute("cy", CY + Math.sin(r) * 16);
      el.setAttribute("r", "13");
      el.setAttribute("fill", `url(#${tid}_p)`);
      g.appendChild(el);
    }
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", CX);
    c.setAttribute("cy", CY);
    c.setAttribute("r", "6");
    c.setAttribute("fill", palette.center);
    g.appendChild(c);
  } else if (flowerType === "white_lily") {
    for (let i = 0; i < 6; i++) {
      const a = (360 / 6) * i - 90;
      const r = (a * Math.PI) / 180;
      const el = document.createElementNS(NS, "ellipse");
      el.setAttribute("cx", CX + Math.cos(r) * 20);
      el.setAttribute("cy", CY + Math.sin(r) * 20);
      el.setAttribute("rx", "7");
      el.setAttribute("ry", "25");
      el.setAttribute("fill", `url(#${tid}_p)`);
      el.setAttribute("transform", `rotate(${a + 90}, ${CX + Math.cos(r) * 20}, ${CY + Math.sin(r) * 20})`);
      g.appendChild(el);
    }
  } else {
    // Default multi-petal rosette (Marigold, Rose, Dahlia, etc.)
    const count = flowerType === "crimson_dahlia" ? 16 : 10;
    for (let i = 0; i < count; i++) {
      const a = (360 / count) * i - 90;
      const r = (a * Math.PI) / 180;
      const el = document.createElementNS(NS, "ellipse");
      el.setAttribute("cx", CX + Math.cos(r) * 18);
      el.setAttribute("cy", CY + Math.sin(r) * 18);
      el.setAttribute("rx", "8");
      el.setAttribute("ry", "22");
      el.setAttribute("fill", `url(#${tid}_p)`);
      el.setAttribute("transform", `rotate(${a + 90}, ${CX + Math.cos(r) * 18}, ${CY + Math.sin(r) * 18})`);
      g.appendChild(el);
    }
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", CX);
    c.setAttribute("cy", CY);
    c.setAttribute("r", "10");
    c.setAttribute("fill", palette.center);
    g.appendChild(c);
  }

  svg.appendChild(g);
  return svg;
}

// ──────────────────────────────────────────────
// 12. PARTICLES BACKGROUND
// ──────────────────────────────────────────────

function initParticles() {
  const container = document.getElementById("particles-container");
  if (!container) return;
  const PARTICLE_COUNT = 30;
  const colors = ["#f77f00", "#ffd700", "#c77dff", "#ff9f1c", "#ffbf69", "#9d4edd", "#ffb347"];

  for (let i = 0; i < PARTICLE_COUNT; i++) createParticle(container, colors, true);

  setInterval(() => {
    if (container.children.length < PARTICLE_COUNT + 10) {
      createParticle(container, colors, false);
    }
  }, 800);
}

function createParticle(container, colors, randomStartY) {
  const el = document.createElement("div");
  el.classList.add("particle");
  const size = 2 + Math.random() * 5;
  const color = colors[Math.floor(Math.random() * colors.length)];
  const left = Math.random() * 100;
  const duration = 8 + Math.random() * 14;
  const delay = randomStartY ? Math.random() * -duration : 0;

  el.style.cssText = `
    width:${size}px;height:${size}px;background:${color};
    left:${left}%;bottom:-10px;
    animation-duration:${duration}s;animation-delay:${delay}s;
    box-shadow:0 0 ${size * 2}px ${color};opacity:0;
  `;
  container.appendChild(el);
  el.addEventListener("animationend", () => el.remove());
}

// ──────────────────────────────────────────────
// 13. TOAST NOTIFICATIONS
// ──────────────────────────────────────────────

function showToast(message) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 50);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

function showFlowerLoading() {
  const canvas = document.getElementById("flower-canvas");
  if (!canvas) return;
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
 * Updates DOM to show flower illustration, name, type badge, emotional meaning, and poem.
 */
function displayFlower(flowerData, inputText) {
  currentFlowerData = flowerData;

  const canvas = document.getElementById("flower-canvas");
  canvas.innerHTML = "";
  const svg = generateFlowerSVG(flowerData.palette, flowerData.flowerType);
  canvas.appendChild(svg);

  // Set titles and badge
  document.getElementById("flower-name").textContent = flowerData.name;

  const typeBadge = document.getElementById("flower-type-badge");
  if (typeBadge) {
    const spec = FLOWER_SPECIES[flowerData.flowerType] || FLOWER_SPECIES.marigold;
    typeBadge.innerHTML = `<span class="badge-icon">✿</span> <span class="badge-text">${spec.displayName} · ${spec.symbolism}</span>`;
  }

  document.getElementById("flower-meaning").textContent = flowerData.meaning;
  document.getElementById("flower-poem").textContent = flowerData.poem;

  const flowerSection = document.getElementById("flower-section");
  flowerSection.hidden = false;
  flowerSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ──────────────────────────────────────────────
// 15. SAVE AS PNG
// ──────────────────────────────────────────────

function saveFlowerAsPNG() {
  const svgEl = document.querySelector("#flower-canvas svg");
  if (!svgEl) return;

  const serialiser = new XMLSerializer();
  const svgString = serialiser.serializeToString(svgEl);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = function () {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 680;
    const ctx = canvas.getContext("2d");

    // Dark background
    ctx.fillStyle = "#0a0608";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw SVG
    ctx.drawImage(img, 20, 20, 600, 600);

    // Add Flower Name and Subtitle
    const flowerName = document.getElementById("flower-name").textContent || "The Spirit Bloom";
    const flowerType = currentFlowerData && currentFlowerData.flowerType
      ? FLOWER_SPECIES[currentFlowerData.flowerType].displayName
      : "Spirit Bloom";

    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 22px 'Cinzel', serif";
    ctx.textAlign = "center";
    ctx.fillText(flowerName, 320, 635);

    ctx.fillStyle = "#c77dff";
    ctx.font = "italic 14px 'Lato', sans-serif";
    ctx.fillText(flowerType, 320, 660);

    const link = document.createElement("a");
    link.download = `${flowerName.toLowerCase().replace(/[^a-z0-9]/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    URL.revokeObjectURL(url);
    showToast("✿ Your flower has been saved as an image!");
  };
  img.src = url;
}

// ──────────────────────────────────────────────
// 16. GALLERY & LOCALSTORAGE CRUD
// ──────────────────────────────────────────────

const STORAGE_KEY = "spiritBloom_gallery";
let gallery = [];

function loadGallery() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      gallery = [];
      return;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      gallery = [];
      return;
    }

    gallery = parsed.filter((item) => {
      return (
        item &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        item.name.trim() !== "" &&
        typeof item.meaning === "string" &&
        typeof item.poem === "string" &&
        item.palette &&
        typeof item.palette.center === "string" &&
        Array.isArray(item.palette.petals) &&
        item.palette.petals.length >= 1
      );
    });
  } catch (err) {
    console.warn("[SpiritBloom] Gallery data corrupted, resetting:", err);
    gallery = [];
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
  }
}

function persistGallery() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gallery));
  } catch (err) {
    console.warn("[SpiritBloom] Could not save to localStorage:", err);
    showToast("⚠ Storage full — could not save bloom to gallery.");
  }
}

function addCurrentBloomToGallery() {
  if (!currentFlowerData) {
    showToast("Please grow a flower first!");
    return null;
  }

  const name = currentFlowerData.name;
  const alreadySaved = gallery.some((b) => b.name === name);
  if (alreadySaved) {
    showToast("✦ This bloom is already in your gallery.");
    return null;
  }

  const bloom = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    flowerType: currentFlowerData.flowerType || "marigold",
    name: currentFlowerData.name,
    meaning: currentFlowerData.meaning,
    poem: currentFlowerData.poem,
    palette: currentFlowerData.palette,
    petalCountOverride: currentFlowerData.petalCountOverride,
    savedAt: Date.now()
  };

  gallery.unshift(bloom);
  persistGallery();
  return bloom.id;
}

function removeBloomFromGallery(id) {
  gallery = gallery.filter((b) => b.id !== id);
  persistGallery();
}

function renderGallery() {
  const section = document.getElementById("gallery-section");
  const grid = document.getElementById("gallery-grid");
  if (!section || !grid) return;

  if (gallery.length === 0) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  grid.innerHTML = "";

  gallery.forEach((bloom) => {
    const card = document.createElement("div");
    card.className = "gallery-card";
    card.role = "listitem";
    card.tabIndex = 0;
    card.setAttribute("aria-label", "View saved bloom: " + bloom.name);
    card.dataset.bloomId = bloom.id;

    // Thumbnail SVG
    const thumbWrap = document.createElement("div");
    thumbWrap.className = "gallery-card__thumb";
    const thumbSVG = generateThumbnailSVG(bloom.palette, bloom.flowerType || "marigold");
    thumbWrap.appendChild(thumbSVG);

    // Card body
    const body = document.createElement("div");
    body.className = "gallery-card__body";

    const cardName = document.createElement("p");
    cardName.className = "gallery-card__name";
    cardName.textContent = bloom.name;

    // Swatches
    const swatches = document.createElement("div");
    swatches.className = "gallery-card__swatches";
    const swatchColors = [bloom.palette.center].concat(bloom.palette.petals.slice(0, 2));
    swatchColors.forEach((color) => {
      const swatch = document.createElement("span");
      swatch.className = "swatch";
      swatch.style.background = color;
      swatch.style.boxShadow = "0 0 6px " + color + "88";
      swatches.appendChild(swatch);
    });

    // Date
    const date = document.createElement("p");
    date.className = "gallery-card__date";
    date.textContent = formatDate(bloom.savedAt);

    body.appendChild(cardName);
    body.appendChild(swatches);
    body.appendChild(date);

    card.appendChild(thumbWrap);
    card.appendChild(body);
    grid.appendChild(card);

    function openCard() {
      openBloomModal(bloom.id);
    }
    card.addEventListener("click", openCard);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openCard();
      }
    });
  });
}

function formatDate(ts) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch (_) {
    return "";
  }
}

let activeModalBloomId = null;

function openBloomModal(id) {
  const bloom = gallery.find((b) => b.id === id);
  if (!bloom) return;

  activeModalBloomId = id;

  const modalCanvas = document.getElementById("modal-flower-canvas");
  modalCanvas.innerHTML = "";
  const svg = generateFlowerSVG(bloom.palette, bloom.flowerType || "marigold");
  modalCanvas.appendChild(svg);

  document.getElementById("modal-flower-name").textContent = bloom.name;

  const modalBadge = document.getElementById("modal-flower-type-badge");
  if (modalBadge) {
    const spec = FLOWER_SPECIES[bloom.flowerType] || FLOWER_SPECIES.marigold;
    modalBadge.innerHTML = `<span class="badge-icon">✿</span> <span class="badge-text">${spec.displayName} · ${spec.symbolism}</span>`;
  }

  document.getElementById("modal-flower-meaning").textContent = bloom.meaning;
  document.getElementById("modal-flower-poem").textContent = bloom.poem;

  const backdrop = document.getElementById("modal-backdrop");
  backdrop.hidden = false;
  document.body.classList.add("modal-open");
  document.getElementById("modal-close").focus();
}

function closeBloomModal() {
  const backdrop = document.getElementById("modal-backdrop");
  if (backdrop) backdrop.hidden = true;
  document.body.classList.remove("modal-open");
  activeModalBloomId = null;
}

// ──────────────────────────────────────────────
// 17. MAIN APP ORCHESTRATION & EVENT LISTENERS
// ──────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  const memoryInput = document.getElementById("memory-input");
  const charCount = document.getElementById("char-count");
  const growBtn = document.getElementById("grow-btn");
  const growAnotherBtn = document.getElementById("grow-another-btn");
  const newBtn = document.getElementById("new-btn");
  const saveBtn = document.getElementById("save-btn");
  const gallerySaveBtn = document.getElementById("gallery-save-btn");
  const flowerSection = document.getElementById("flower-section");
  const inputSection = document.getElementById("input-section");

  const modalBackdrop = document.getElementById("modal-backdrop");
  const modalClose = document.getElementById("modal-close");
  const modalDeleteBtn = document.getElementById("modal-delete-btn");

  initParticles();
  loadGallery();
  renderGallery();

  // Initialize WebLLM in the background
  initWebLLM().catch((err) => {
    console.error("[SpiritBloom] Unexpected WebLLM error:", err);
    setAIStatus("fallback", "AI model unavailable — using built-in 12 flower collection.");
  });

  // Character counter
  memoryInput.addEventListener("input", () => {
    charCount.textContent = memoryInput.value.length;
  });

  // Central generation function (supports variation index)
  async function growFlowerFromMemory(isVariation = false) {
    const text = memoryInput.value.trim() || lastMemoryText;

    if (!text || text.length < 5) {
      showToast("✦ Please share a little more to grow your flower…");
      memoryInput.focus();
      return;
    }

    lastMemoryText = text;

    if (isVariation) {
      memoryVariationIndex++;
    } else {
      memoryVariationIndex = 0;
    }

    growBtn.disabled = true;
    if (growAnotherBtn) growAnotherBtn.disabled = true;
    growBtn.innerHTML = '<span class="btn-icon" style="animation:spin-pulse 1s linear infinite">✿</span> Growing…';

    flowerSection.hidden = false;
    showFlowerLoading();
    flowerSection.scrollIntoView({ behavior: "smooth", block: "start" });

    let flowerData;

    if (aiMode === "ai" && engine !== null && !isVariation) {
      try {
        flowerData = await runAIInference(text);
      } catch (inferErr) {
        console.warn("[SpiritBloom] AI inference failed, switching to local species engine:", inferErr);
        setAIStatus("fallback", "AI response failed — generated using rich botanical collection.");
        flowerData = createLocalFlower(text, memoryVariationIndex);
      }
    } else {
      // Local emotional analyzer with controlled variation
      await new Promise((r) => setTimeout(r, 700));
      flowerData = createLocalFlower(text, memoryVariationIndex);
    }

    displayFlower(flowerData, text);

    growBtn.disabled = false;
    if (growAnotherBtn) growAnotherBtn.disabled = false;
    growBtn.innerHTML = '<span class="btn-icon">✿</span> Grow My Flower';
  }

  // Grow My Flower button
  growBtn.addEventListener("click", () => growFlowerFromMemory(false));

  // Grow Another Bloom button
  if (growAnotherBtn) {
    growAnotherBtn.addEventListener("click", () => {
      growFlowerFromMemory(true);
      showToast("✦ Exploring another bloom variation for your memory…");
    });
  }

  // Create Another button
  newBtn.addEventListener("click", () => {
    memoryInput.value = "";
    charCount.textContent = "0";
    lastMemoryText = "";
    memoryVariationIndex = 0;
    flowerSection.hidden = true;
    inputSection.scrollIntoView({ behavior: "smooth", block: "start" });
    memoryInput.focus();
  });

  // Save as image
  saveBtn.addEventListener("click", saveFlowerAsPNG);

  // Save to gallery
  gallerySaveBtn.addEventListener("click", () => {
    const id = addCurrentBloomToGallery();
    if (id) {
      renderGallery();
      showToast("✿ Bloom saved to your gallery!");
      setTimeout(() => {
        const gal = document.getElementById("gallery-section");
        if (gal) gal.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 350);
    }
  });

  // Modal interactions
  modalClose.addEventListener("click", closeBloomModal);
  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) closeBloomModal();
  });

  modalDeleteBtn.addEventListener("click", () => {
    if (!activeModalBloomId) return;
    removeBloomFromGallery(activeModalBloomId);
    closeBloomModal();
    renderGallery();
    showToast("Bloom removed from your gallery.");
  });

  // Keyboard accessibility
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modalBackdrop.hidden) {
      closeBloomModal();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      growBtn.click();
    }
  });
});
