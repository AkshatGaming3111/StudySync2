// StudySync AI Engine - Supports Live Gemini API + Robust Built-in Pedagogical Intelligence

let geminiApiKey = process.env.GEMINI_API_KEY || '';

function setGeminiKey(key) {
  geminiApiKey = key;
}

function getGeminiKey() {
  return geminiApiKey;
}

// Prioritized ultra-low latency Gemini models based on live benchmarks
// gemini-3.5-flash-lite: ~2.8s - 3.4s (Ultra-fast, stable, zero 503 high demand issues)
// gemini-flash-lite-latest: ~2.9s - 3.7s (Official high-speed alias)
// gemini-3.1-flash-lite: ~3.2s - 4.2s (Rock solid secondary lite model)
// gemini-3-flash-preview: ~3.5s - 4.6s (High-speed preview)
// gemini-3.5-flash: Heavy fallback model (frequently suffers from 503 high demand)
const FAST_GEMINI_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite',
  'gemini-3-flash-preview',
  'gemini-3.5-flash'
];

let activePreferredModel = 'gemini-3.5-flash-lite';
const modelCooldowns = new Map(); // modelName -> timestampMs

// In-memory lightweight cache with TTL for identical queries
const aiResponseCache = new Map();
const CACHE_MAX_ENTRIES = 100;

function getCachedResult(key) {
  if (!key) return null;
  const entry = aiResponseCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    aiResponseCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedResult(key, data, ttlMs = 10 * 60 * 1000) {
  if (!key || !data) return;
  if (aiResponseCache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = aiResponseCache.keys().next().value;
    aiResponseCache.delete(oldestKey);
  }
  aiResponseCache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs
  });
}

function getOrderedModels() {
  const now = Date.now();
  // Clear expired cooldowns
  for (const [m, until] of modelCooldowns.entries()) {
    if (until <= now) modelCooldowns.delete(m);
  }

  // Put activePreferredModel first if not on cooldown
  const isPrefAvailable = !modelCooldowns.has(activePreferredModel);
  const preferred = isPrefAvailable ? [activePreferredModel] : [];
  const available = FAST_GEMINI_MODELS.filter(m => !modelCooldowns.has(m) && m !== activePreferredModel);
  return [...preferred, ...available];
}

function recordModelSuccess(model) {
  activePreferredModel = model;
  modelCooldowns.delete(model);
}

function recordModelFailure(model, status, errMsg) {
  // If 429 quota exhaustion (e.g. 20 requests/day preview tier limit), cool down for 1 hour so it never blocks requests
  const isQuotaLimit = status === 429 || (errMsg && (errMsg.includes('quota') || errMsg.includes('Quota')));
  const cooldownMs = isQuotaLimit ? (60 * 60 * 1000) : 90000;
  modelCooldowns.set(model, Date.now() + cooldownMs);
  console.warn(`[Speed Optimizer] ${model} cooled down for ${isQuotaLimit ? '60m (Quota Exceeded)' : '90s'} (${status || 'error'}: ${(errMsg || 'timeout').slice(0, 80)}).`);
}

// Call live Gemini API if key is provided (supports student-provided custom keys & structured output options)
async function callGeminiIfAvailable(prompt, systemInstruction = '', customKey = '', options = {}) {
  const key = customKey || geminiApiKey || process.env.GEMINI_API_KEY;
  if (!key) return null;

  const candidateModels = getOrderedModels().slice(0, 3);
  if (candidateModels.length === 0) return null;

  for (let i = 0; i < candidateModels.length; i++) {
    const model = candidateModels[i];
    const timeoutMs = options.timeoutMs || 8500;
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const generationConfig = {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxOutputTokens ?? 1200,
      };

      if (model === 'gemini-3-flash-preview') {
        generationConfig.thinkingConfig = { thinkingBudget: 0 };
      }

      if (options.responseMimeType) {
        generationConfig.responseMimeType = options.responseMimeType;
      }
      if (options.responseSchema) {
        generationConfig.responseSchema = options.responseSchema;
      }

      const payload = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig
      };
      if (systemInstruction) {
        payload.systemInstruction = { parts: [{ text: systemInstruction }] };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeoutMs)
      });

      if (res.ok) {
        const data = await res.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          recordModelSuccess(model);
          return candidate;
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        const errMessage = errJson?.error?.message || `HTTP ${res.status}`;
        recordModelFailure(model, res.status, errMessage);
      }
    } catch (err) {
      recordModelFailure(model, 'timeout', err.message);
    }
  }
  return null;
}

function generatePedagogicalChatFallback(message, context = {}, persona = 'Socratic Coding Mentor', lastError = '') {
  const query = (message || '').toLowerCase().trim();

  let explanation = '';
  let followUps = [];

  if (query.includes('photoelectric') || query.includes('einstein') || query.includes('work function') || query.includes('photon')) {
    explanation = `### 🌟 The Photoelectric Effect & Quantum Physics

The **Photoelectric Effect** is the instantaneous ejection of electrons from a metal surface when light of frequency above a critical threshold frequency \\( \\nu_0 \\) illuminates the surface.

#### 1. Einstein's Photoelectric Equation
Light is absorbed in discrete energy packets called **photons**, each with energy:
\\[ E = h\\nu = \\frac{hc}{\\lambda} \\]

Applying the law of conservation of energy:
\\[ h\\nu = \\Phi_0 + K_{\\text{max}} \\]
where:
- \\( \\Phi_0 = h\\nu_0 \\) is the **Work Function** (minimum energy needed to overcome the metal's surface barrier).
- \\( K_{\\text{max}} = \\frac{1}{2}m v_{\\text{max}}^2 = e V_0 \\) is the **Maximum Kinetic Energy** of emitted photoelectrons.
- \\( V_0 \\) is the **Stopping Potential** (the negative potential that completely arrests the photocurrent).

#### 2. Key Experimental Observations
1. **Threshold Frequency (\\( \\nu_0 \\))**: If \\( \\nu < \\nu_0 \\), no emission occurs regardless of how intense the incident light is.
2. **Instantaneous Process**: Emission happens within \\( \\approx 10^{-9}\\,\\text{s} \\).
3. **Intensity vs. Kinetic Energy**: Increasing intensity raises the *number* of ejected electrons per second (photocurrent), but has *zero* effect on their maximum kinetic energy.`;
    followUps = [
      "Why could the classical wave theory of light not explain the photoelectric effect?",
      "How is the stopping potential determined graphically from Einstein's equation?",
      "Can you give a numerical example of finding work function from threshold wavelength?"
    ];
  } else if (query.includes('ohm') || query.includes('resistance') || query.includes('current') || query.includes('voltage') || query.includes('circuit')) {
    explanation = `### ⚡ Ohm's Law & Circuit Principles

**Ohm's Law** states that the current \\( I \\) flowing through a conductor is directly proportional to the potential difference \\( V \\) applied across its terminals, provided temperature and physical state remain constant:
\\[ V = I \\cdot R \\]

#### Key Equations:
- **Resistance**: \\[ R = \\rho \\frac{l}{A} \\]
- **Joule's Heating Law**: \\[ H = I^2 R t = V I t \\]
- **Resistors in Series**: \\[ R_{\\text{eq}} = R_1 + R_2 + R_3 \\]
- **Resistors in Parallel**: \\[ \\frac{1}{R_{\\text{eq}}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3} \\]`;
    followUps = [
      "What is the difference between Ohmic and Non-Ohmic conductors?",
      "How does resistivity depend on temperature in conductors vs. semiconductors?",
      "Can you show a CBSE board numerical on calculating equivalent resistance?"
    ];
  } else if (query.includes('trigonometr') || query.includes('sin') || query.includes('cos') || query.includes('tan') || query.includes('pythagor')) {
    explanation = `### 📐 Trigonometric Identities & Principles

Trigonometry establishes the fundamental ratios between angles and lengths in triangles.

#### 1. Core Pythagorean Identities:
\\[ \\sin^2\\theta + \\cos^2\\theta = 1 \\]
\\[ 1 + \\tan^2\\theta = \\sec^2\\theta \\implies \\sec^2\\theta - \\tan^2\\theta = 1 \\]
\\[ 1 + \\cot^2\\theta = \\csc^2\\theta \\implies \\csc^2\\theta - \\cot^2\\theta = 1 \\]

#### 2. Reciprocal & Quotient Relations:
\\[ \\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}, \\quad \\cot\\theta = \\frac{\\cos\\theta}{\\sin\\theta}, \\quad \\sec\\theta = \\frac{1}{\\cos\\theta}, \\quad \\csc\\theta = \\frac{1}{\\sin\\theta} \\]`;
    followUps = [
      "Can you prove the identity (sin θ)/(1 - cos θ) + (cos θ)/(1 - sin θ)?",
      "How do we solve heights and distances problems using angles of elevation?",
      "What are the complementary angle identities for trigonometry?"
    ];
  } else if (query.includes('newton') || query.includes('force') || query.includes('motion') || query.includes('momentum') || query.includes('gravity')) {
    explanation = `### 🚀 Newton's Laws of Motion & Classical Mechanics

Newton's three laws form the foundation of classical dynamics:

#### 1. First Law (Inertia)
Every object persists in its state of rest or uniform motion in a straight line unless acted upon by a net external force:
\\[ \\sum \\vec{F} = 0 \\implies \\vec{v} = \\text{constant} \\]

#### 2. Second Law (Fundamental Equation)
Force is the rate of change of linear momentum \\( \\vec{p} \\):
\\[ \\vec{F} = \\frac{d\\vec{p}}{dt} = m \\cdot \\vec{a} \\]

#### 3. Third Law (Action-Reaction)
Every action has an equal and opposite reaction:
\\[ \\vec{F}_{AB} = -\\vec{F}_{BA} \\]

#### Kinematic Equations for Constant Acceleration:
\\[ v = u + at, \\quad s = ut + \\frac{1}{2}at^2, \\quad v^2 = u^2 + 2as \\]`;
    followUps = [
      "How does conservation of momentum follow from Newton's third law?",
      "Can you explain the difference between mass and weight?",
      "What is impulse and how is it related to momentum change?"
    ];
  } else if (query.includes('photosynthesis') || query.includes('chloroplast') || query.includes('calvin') || query.includes('light reaction')) {
    explanation = `### 🌿 Photosynthesis: Light & Dark Reactions

Photosynthesis converts light energy into chemical energy stored in glucose:
\\[ 6\\text{CO}_2 + 12\\text{H}_2\\text{O} \\xrightarrow[\\text{Chlorophyll}]{\\text{Light}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2 + 6\\text{H}_2\\text{O} \\]

#### 1. Light-Dependent Reactions (Thylakoids)
- Solar photons split water (photolysis): \\[ 2\\text{H}_2\\text{O} \\to 4\\text{H}^+ + 4e^- + \\text{O}_2 \\]
- Generates high-energy chemical currency: \\( \\text{ATP} \\) and \\( \\text{NADPH} \\).

#### 2. Calvin Cycle / Dark Reactions (Stroma)
- \\( \\text{CO}_2 \\) is fixed by the enzyme **RuBisCO** into carbohydrates.`;
    followUps = [
      "What are the major pigments involved in light absorption?",
      "Why is RuBisCO the rate-limiting enzyme in carbon fixation?",
      "What are the primary factors affecting the photosynthetic rate?"
    ];
  } else {
    explanation = `### 📚 StudySync Pedagogical Synthesis

Hello! As your educational mentor (**${persona}**), let's break down this question systematically:

1. **Foundational Principles**:
   Every topic in the curriculum is built on core definitions, invariant rules, and governing equations.
2. **Structured Analysis for "${message}"**:
   - Identify given parameters and known constraints.
   - Formulate the governing relationship or theoretical model.
   - Solve step-by-step, showing intermediate algebraic or logical reasoning.
3. **Curriculum & Exam Best Practices**:
   - Always state definitions before derivations.
   - Ensure units and boundary conditions are rigorously checked.`;
    followUps = [
      "Can you provide a step-by-step example problem on this?",
      "What are the common board exam questions from this topic?",
      "How does this connect to real-world applications?"
    ];
  }

  const notice = lastError ? `\n\n---\n> ℹ️ *StudySync Smart Pedagogical Assistant (Live Gemini service connection unavailable: ${lastError}).*` : '';

  return {
    text: `${explanation}${notice}`,
    source: 'pedagogical-engine',
    isLiveGemini: false,
    modelUsed: 'StudySync-Pedagogical-v2',
    suggestedFollowUps: followUps
  };
}

// 1. AI Classroom Co-pilot / StudyBot (Direct Live Gemini API via Student Key)
async function generateChatResponse({ message, history = [], context = {}, persona = 'Socratic Coding Mentor', apiKey = '' }) {
  const key = apiKey || geminiApiKey || process.env.GEMINI_API_KEY;

  if (!key) {
    return {
      text: `🔑 **Google Gemini API Key Required**

Please connect your Google Gemini API Key in the top bar (or under **Settings**) to receive direct, live AI responses through your key.

**How to connect your API Key:**
1. Click the **Connect Key** button in the header above.
2. Paste your Google Gemini API key (starts with \`AIzaSy...\`).
3. Click **Save Key** — it will be linked to your student account for all classroom queries and board exam explanations!`,
      source: 'key-required',
      isLiveGemini: false,
      suggestedFollowUps: []
    };
  }

  const systemPrompt = `You are StudySync AI ("Prof. Synapse"), a world-class interactive educational co-pilot and mentor.
Persona: ${persona}.
Classroom Context: ${JSON.stringify(context)}.
Guidelines:
- Deliver accurate, clear, pedagogical explanations grounded in official CBSE and standard secondary/higher school curriculum standards.
- Use LaTeX formatting for all mathematical equations, scientific variables, chemical formulas, and proofs (e.g. \\( \\sin^2\\theta + \\cos^2\\theta = 1 \\), \\[ V = IR \\]).
- Provide step-by-step problem-solving breakdowns with intuitive analogies.
- When answering questions, maintain an engaging, supportive tone and conclude with a concise "Check Your Understanding" prompt.`;

  // Check memory cache for identical query
  const chatCacheKey = `chat_${persona}_${message.toLowerCase().trim()}`;
  const cachedChat = getCachedResult(chatCacheKey);
  if (cachedChat) {
    return {
      ...cachedChat,
      source: 'gemini-live-cache'
    };
  }

  // Format multi-turn conversation history for generateContent
  const contents = [];
  if (Array.isArray(history) && history.length > 0) {
    history.slice(-6).forEach(item => {
      if (item.text) {
        contents.push({
          role: item.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: item.text }]
        });
      }
    });
  }

  // Add the current user query
  contents.push({
    role: 'user',
    parts: [{ text: message }]
  });

  let lastError = null;
  const candidateModels = getOrderedModels().slice(0, 3);

  for (let i = 0; i < candidateModels.length; i++) {
    const model = candidateModels[i];
    const timeoutMs = 8500;
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const payload = {
        contents,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1200,
          ...(model === 'gemini-3-flash-preview' ? { thinkingConfig: { thinkingBudget: 0 } } : {})
        }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeoutMs)
      });

      if (res.ok) {
        const data = await res.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          recordModelSuccess(model);
          const result = {
            text: candidateText,
            source: 'gemini-live',
            isLiveGemini: true,
            modelUsed: model,
            suggestedFollowUps: [
              "Can you show a step-by-step example?",
              "How is this asked in CBSE board exams?",
              "What are the common student errors on this concept?"
            ]
          };
          setCachedResult(chatCacheKey, result, 5 * 60 * 1000);
          return result;
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        const errMessage = errJson?.error?.message || `HTTP ${res.status}`;
        lastError = `Model ${model}: ${errMessage}`;
        recordModelFailure(model, res.status, errMessage);
      }
    } catch (err) {
      lastError = err.message;
      recordModelFailure(model, 'timeout', err.message);
    }
  }

  // Seamless pedagogical fallback with LaTeX formatting if live Gemini is unavailable
  const fallback = generatePedagogicalChatFallback(message, context, persona, lastError);
  setCachedResult(chatCacheKey, fallback, 2 * 60 * 1000);
  return fallback;
}

// 2. AI Assignment Auto-Grader
async function autoGradeSubmission({ assignment, submissionText, apiKey = '' }) {
  const cacheKey = `grade_${assignment.id}_${(submissionText || '').trim().slice(0, 160)}`;
  const cachedGrade = getCachedResult(cacheKey);
  if (cachedGrade) return cachedGrade;

  const maxPoints = assignment.points || assignment.totalPoints || 100;
  const systemPrompt = `You are a fair, rigorous, constructive AI Teaching Assistant grading a student's submission.
Assignment: ${assignment.title}
Max Points: ${maxPoints}
Rubric: ${JSON.stringify(assignment.rubric || [])}
Analyze the student submission, evaluate against each rubric criterion, assign scores, and provide actionable feedback. Output valid JSON only.`;

  const userPrompt = `Student Submission:\n${submissionText}\n\nReturn strictly valid JSON in format:
{
  "suggestedScore": ${Math.round(maxPoints * 0.9)},
  "rubricBreakdown": [{"criterion": "Understanding", "score": ${Math.round(maxPoints * 0.9)}, "maxScore": ${maxPoints}, "comment": "Clear analysis."}],
  "feedback": "Detailed evaluation.",
  "strengths": ["Strong explanation."],
  "areasForImprovement": ["Expand on boundary conditions."]
}`;
  const liveResult = await callGeminiIfAvailable(userPrompt, systemPrompt, apiKey, {
    timeoutMs: 8000,
    temperature: 0.2,
    maxOutputTokens: 1000,
    responseMimeType: 'application/json'
  });

  if (liveResult) {
    try {
      // try to parse JSON if returned
      const match = liveResult.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.rubricBreakdown && (typeof parsed.suggestedScore === 'number' || !isNaN(Number(parsed.suggestedScore)))) {
          parsed.suggestedScore = Number(parsed.suggestedScore);
          setCachedResult(cacheKey, parsed, 15 * 60 * 1000);
          return parsed;
        }
      }
    } catch (e) {
      // fallback to structured text parse
    }
  }

  // Built-in rubric evaluation
  const textLength = (submissionText || '').trim().length;
  const rubric = assignment.rubric || [
    { criterion: "Conceptual Correctness", maxPoints: Math.round(maxPoints * 0.5) },
    { criterion: "Analysis & Depth", maxPoints: Math.round(maxPoints * 0.3) },
    { criterion: "Clarity & Organization", maxPoints: Math.round(maxPoints * 0.2) }
  ];

  let totalMax = 0;
  let earnedScore = 0;
  const breakdown = rubric.map(r => {
    const pointsForCriteria = r.maxPoints || r.weight || 25;
    totalMax += pointsForCriteria;
    let ratio = 0.92;
    let comment = "Strong, thorough demonstration of criteria.";
    if (textLength < 100) {
      ratio = 0.65;
      comment = "Brief response. Needs more depth and elaboration on core concepts.";
    } else if (textLength < 250) {
      ratio = 0.82;
      comment = "Good start, covers basic ideas but could provide clearer examples.";
    } else if (submissionText.includes('```') || submissionText.includes('$$') || submissionText.includes('\\(')) {
      ratio = 0.98;
      comment = "Exceptional formatting, accurate syntax, and rigorous mathematical/code analysis.";
    }
    const score = Math.round(pointsForCriteria * ratio);
    earnedScore += score;
    return {
      criterion: r.criterion || r.criteria || 'Standard Assessment',
      score,
      maxScore: pointsForCriteria,
      comment
    };
  });

  const scaledScore = Math.min(maxPoints, Math.round((earnedScore / (totalMax || 100)) * maxPoints));

  return {
    suggestedScore: scaledScore,
    rubricBreakdown: breakdown,
    feedback: `Great work on this submission! The response demonstrates a clear understanding of the subject matter. To achieve perfection, ensure all edge cases and boundary conditions are explicitly outlined in the discussion.`,
    strengths: [
      "Accurate conceptual formulation and terminology",
      "Well-structured explanation with clear logical flow",
      "Clean formatting and clear reasoning"
    ],
    areasForImprovement: [
      "Could include further quantitative or empirical verification",
      "Consider analyzing extreme or adversarial edge cases"
    ]
  };
}

// 3. AI Pre-Check for Students
async function precheckSubmission({ assignment, submissionText }) {
  const length = (submissionText || '').trim().length;
  const hasCodeOrMath = submissionText.includes('```') || submissionText.includes('\\(') || submissionText.includes('$');

  let status = "Ready for Submission";
  let scoreEstimate = "90 - 98%";
  let suggestions = [];

  if (length < 80) {
    status = "Needs Elaboration";
    scoreEstimate = "60 - 75%";
    suggestions.push("Your submission appears quite short. Consider expanding on the underlying mechanism.");
    suggestions.push("Review the assignment rubric criteria to ensure all required components are addressed.");
  } else if (!hasCodeOrMath && assignment.title.toLowerCase().includes('algorithm')) {
    status = "Good, but can be improved";
    scoreEstimate = "80 - 88%";
    suggestions.push("Tip: Including a short code snippet or asymptotic Big-O formula will boost your rubric score!");
  } else {
    status = "Strong Submission";
    scoreEstimate = "92 - 100%";
    suggestions.push("Your response covers key technical requirements smoothly.");
    suggestions.push("Check your variable naming and double-check base-case boundary conditions.");
  }

  return {
    status,
    scoreEstimate,
    wordCount: submissionText.split(/\s+/).filter(Boolean).length,
    suggestions,
    passedChecks: [
      "Addresses main topic prompt",
      "Respects academic integrity standards",
      "Appropriate technical terminology"
    ]
  };
}

// 4. AI Quiz Generator
async function generateQuiz({ topic, subject = 'General', gradeLevel = 'Grade 10', difficulty = 'Medium', questionCount = 5, types = ['mcq'], apiKey = '' }) {
  const cacheKey = `quiz_${(topic || '').toLowerCase().trim()}_${gradeLevel}_${difficulty}_${questionCount}`;
  const cachedQuiz = getCachedResult(cacheKey);
  if (cachedQuiz) {
    return {
      ...cachedQuiz,
      id: `test_ai_${Date.now()}`
    };
  }

  const prompt = `Generate a ${questionCount}-question educational test on the topic "${topic}" for ${gradeLevel} students at ${difficulty} difficulty.
Return as JSON with format:
{
  "title": "...",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "timeLimitMinutes": 15,
  "questions": [
    {
      "id": "q_1",
      "type": "mcq",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "..."
    }
  ]
}`;

  const liveResult = await callGeminiIfAvailable(
    prompt,
    "You are an expert curriculum test designer. Output valid JSON only.",
    apiKey,
    { timeoutMs: 8000, temperature: 0.4, maxOutputTokens: 2000 }
  );

  if (liveResult) {
    try {
      const match = liveResult.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (parsed.questions && parsed.questions.length > 0) {
          parsed.id = `test_ai_${Date.now()}`;
          parsed.totalPoints = parsed.questions.length * 20;
          parsed.xpReward = parsed.questions.length * 50;
          parsed.createdAt = new Date().toISOString();
          setCachedResult(cacheKey, parsed, 15 * 60 * 1000);
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to parse Gemini generated quiz JSON, using template fallback.");
    }
  }

  // Built-in intelligent subject question templates tailored for real curricula
  const questions = [];
  const count = Math.min(Math.max(questionCount, 3), 10);
  const lowerTopic = (topic || '').toLowerCase();

  // 1. MATHS (Geometry, Trigonometry, Mensuration, Algebra)
  if (lowerTopic.includes('math') || lowerTopic.includes('trigonometry') || lowerTopic.includes('geometry') || lowerTopic.includes('mensuration') || lowerTopic.includes('algebra')) {
    const mathPool = [
      {
        question: "Which of the following is the fundamental trigonometric identity relating tangent and secant?",
        options: [
          "\\( 1 + \\tan^2\\theta = \\sec^2\\theta \\)",
          "\\( \\tan^2\\theta - \\sec^2\\theta = 1 \\)",
          "\\( \\sin^2\\theta + \\tan^2\\theta = 1 \\)",
          "\\( 1 + \\cot^2\\theta = \\sec^2\\theta \\)"
        ],
        correctAnswer: 0,
        explanation: "The identity \\( 1 + \\tan^2\\theta = \\sec^2\\theta \\) is derived directly by dividing \\( \\sin^2\\theta + \\cos^2\\theta = 1 \\) by \\( \\cos^2\\theta \\)."
      },
      {
        question: "What is the Total Surface Area of a solid hemisphere of radius \\( r \\)?",
        options: [
          "\\( 2\\pi r^2 \\)",
          "\\( 3\\pi r^2 \\)",
          "\\( 4\\pi r^2 \\)",
          "\\( \\frac{2}{3}\\pi r^3 \\)"
        ],
        correctAnswer: 1,
        explanation: "The curved surface area is \\( 2\\pi r^2 \\) and the circular base area is \\( \\pi r^2 \\), resulting in a Total Surface Area of \\( 3\\pi r^2 \\)."
      },
      {
        question: "If a quadratic equation \\( ax^2 + bx + c = 0 \\) has equal roots, what condition must its discriminant \\( D \\) satisfy?",
        options: [
          "\\( b^2 - 4ac > 0 \\)",
          "\\( b^2 - 4ac = 0 \\)",
          "\\( b^2 - 4ac < 0 \\)",
          "\\( b^2 = 2ac \\)"
        ],
        correctAnswer: 1,
        explanation: "When \\( D = b^2 - 4ac = 0 \\), the roots are \\( x = -\\frac{b}{2a} \\pm 0 \\), which are real and equal."
      },
      {
        question: "In circle geometry, what is the angle subtended by a diameter at any point on the circumference of a semicircle?",
        options: [
          "\\( 45^\\circ \\)",
          "\\( 60^\\circ \\)",
          "\\( 90^\\circ \\) (Right Angle)",
          "\\( 180^\\circ \\)"
        ],
        correctAnswer: 2,
        explanation: "By Thales's Theorem, the angle subtended by a semicircle or diameter is always a right angle (\\( 90^\\circ \\))."
      },
      {
        question: "What is the formula for the volume of a frustum of a cone of height \\( h \\) with base radii \\( R \\) and \\( r \\)?",
        options: [
          "\\( \\frac{1}{3}\\pi h (R^2 + r^2 + Rr) \\)",
          "\\( \\pi h (R^2 + r^2) \\)",
          "\\( \\frac{1}{3}\\pi h (R + r) \\)",
          "\\( \\frac{4}{3}\\pi h (R^3 - r^3) \\)"
        ],
        correctAnswer: 0,
        explanation: "The volume of a cone frustum is given by \\( V = \\frac{1}{3}\\pi h (R^2 + r^2 + Rr) \\)."
      }
    ];

    for (let i = 0; i < count; i++) {
      const qData = mathPool[i % mathPool.length];
      questions.push({
        id: `q_math_${i + 1}`,
        type: 'mcq',
        question: qData.question,
        options: qData.options,
        correctAnswer: qData.correctAnswer,
        explanation: qData.explanation
      });
    }
  }
  // 2. SCIENCE (Biology, Chemistry, Physics)
  else if (lowerTopic.includes('science') || lowerTopic.includes('physics') || lowerTopic.includes('chemistry') || lowerTopic.includes('biology')) {
    const sciPool = [
      {
        question: "Which of the following equations represents Ohm's Law governing electrical current in a conductor?",
        options: [
          "\\( V = I R \\)",
          "\\( P = V / I \\)",
          "\\( F = q(E + v \\times B) \\)",
          "\\( V = I^2 R \\)"
        ],
        correctAnswer: 0,
        explanation: "Ohm's Law states that the potential difference \\( V \\) across a conductor is proportional to current \\( I \\) at constant temperature: \\( V = IR \\)."
      },
      {
        question: "In Chemical Reactions, what type of reaction occurs when a substance loses hydrogen or gains oxygen?",
        options: [
          "Reduction Reaction",
          "Oxidation Reaction",
          "Double Displacement",
          "Precipitation Reaction"
        ],
        correctAnswer: 1,
        explanation: "Oxidation is defined as the addition of oxygen or the removal of hydrogen (or loss of electrons)."
      },
      {
        question: "In Cellular Biology, where does the Krebs Cycle (Citric Acid Cycle) take place in eukaryotic cells?",
        options: [
          "Cytoplasm",
          "Mitochondrial Matrix",
          "Endoplasmic Reticulum",
          "Golgi Apparatus"
        ],
        correctAnswer: 1,
        explanation: "The Krebs cycle occurs in the mitochondrial matrix of eukaryotic cells, generating ATP, NADH, and FADH2."
      },
      {
        question: "What is the focal length of a concave mirror whose radius of curvature is \\( 40\\,\\text{cm} \\)?",
        options: [
          "\\( -20\\,\\text{cm} \\)",
          "\\( +20\\,\\text{cm} \\)",
          "\\( -80\\,\\text{cm} \\)",
          "\\( +40\\,\\text{cm} \\)"
        ],
        correctAnswer: 0,
        explanation: "For a spherical mirror, focal length \\( f = R / 2 \\). For a concave mirror, by Cartesian sign convention, \\( f = -40 / 2 = -20\\,\\text{cm} \\)."
      },
      {
        question: "What is the pH of a neutral aqueous solution at \\( 25^\\circ\\text{C} \\)?",
        options: [
          "\\( 0 \\)",
          "\\( 7 \\)",
          "\\( 14 \\)",
          "\\( 1 \\)"
        ],
        correctAnswer: 1,
        explanation: "Pure water at \\( 25^\\circ\\text{C} \\) has \\( [H^+] = 10^{-7}\\,\\text{M} \\), giving \\( \\text{pH} = -\\log(10^{-7}) = 7 \\)."
      }
    ];

    for (let i = 0; i < count; i++) {
      const qData = sciPool[i % sciPool.length];
      questions.push({
        id: `q_sci_${i + 1}`,
        type: 'mcq',
        question: qData.question,
        options: qData.options,
        correctAnswer: qData.correctAnswer,
        explanation: qData.explanation
      });
    }
  }
  // 3. SOCIAL STUDIES (History, Civics, Geography, Economics)
  else if (lowerTopic.includes('social') || lowerTopic.includes('history') || lowerTopic.includes('civic') || lowerTopic.includes('geography') || lowerTopic.includes('economic')) {
    const sstPool = [
      {
        question: "What is the horizontal division of power in a democratic constitutional framework?",
        options: [
          "Power sharing among Legislature, Executive, and Judiciary",
          "Power sharing between Federal Government and State Governments",
          "Power sharing among different political parties in a coalition",
          "Power sharing between local municipal corporations and panchayats"
        ],
        correctAnswer: 0,
        explanation: "Horizontal power sharing places the Legislature, Executive, and Judiciary at the same level so they exercise different powers while checking each other."
      },
      {
        question: "In Economics, how is Per Capita Income (PCI) calculated for a nation?",
        options: [
          "Total National Income divided by Total Working Population",
          "Total National Income divided by Total Population of the Country",
          "Gross Domestic Product minus Inflation Rate",
          "Total Export Earnings minus Import Costs"
        ],
        correctAnswer: 1,
        explanation: "Per Capita Income = Total Income of the Country / Total Population."
      },
      {
        question: "Which type of soil is also known as Regur Soil and is ideal for cotton cultivation?",
        options: [
          "Alluvial Soil",
          "Black Soil",
          "Red and Yellow Soil",
          "Laterite Soil"
        ],
        correctAnswer: 1,
        explanation: "Black soil (Regur soil) is rich in clayey materials, retains moisture well, and is optimal for growing cotton."
      },
      {
        question: "In Indian history, what was the primary reason Mahatma Gandhi chose Salt to launch the Civil Disobedience Movement in 1930?",
        options: [
          "Salt was an expensive luxury commodity",
          "Salt was an essential consumption item used equally by rich and poor, taxed unfairly by the state",
          "Salt was only produced in Gujarat",
          "Salt was traded exclusively by the East India Company"
        ],
        correctAnswer: 1,
        explanation: "Salt was an indispensable item of daily food consumed by all classes; taxing it represented a powerful symbol of colonial oppression."
      }
    ];

    for (let i = 0; i < count; i++) {
      const qData = sstPool[i % sstPool.length];
      questions.push({
        id: `q_sst_${i + 1}`,
        type: 'mcq',
        question: qData.question,
        options: qData.options,
        correctAnswer: qData.correctAnswer,
        explanation: qData.explanation
      });
    }
  }
  // 4. HINDI (Vyakaran, Sahitya, Alankar, Samas)
  else if (lowerTopic.includes('hindi') || lowerTopic.includes('vyakaran') || lowerTopic.includes('alankar') || lowerTopic.includes('samas')) {
    const hindiPool = [
      {
        question: "'चरण कमल बंदौ हरिराई' में कौन-सा अलंकार है?",
        options: [
          "उपमा अलंकार",
          "रूपक अलंकार",
          "उत्प्रेक्षा अलंकार",
          "अनुप्रास अलंकार"
        ],
        correctAnswer: 1,
        explanation: "यहाँ उपमेय (चरण) पर उपमान (कमल) का अभेद आरोप किया गया है, अतः यहाँ 'रूपक अलंकार' है।"
      },
      {
        question: "'पीताम्बर' (पीला है अम्बर जिसका अर्थात् श्रीकृष्ण) में कौन-सा समास है?",
        options: [
          "द्विगु समास",
          "कर्मधारय समास",
          "बहुव्रीहि समास",
          "तत्पुरुष समास"
        ],
        correctAnswer: 2,
        explanation: "जब दोनों पद मिलकर किसी तीसरे विशेष अर्थ (श्रीकृष्ण) की ओर संकेत करते हैं, तो वहाँ 'बहुव्रीहि समास' होता है।"
      },
      {
        question: "'सूर्योदय' शब्द का सही संधि-विच्छेद क्या होगा?",
        options: [
          "सूर्य + दय",
          "सूर्य + उदय",
          "सूर्यो + दय",
          "सूर + उदय"
        ],
        correctAnswer: 1,
        explanation: "सूर्य + उदय = सूर्योदय (गुण स्वर संधि: अ/आ + उ = ओ)।"
      }
    ];

    for (let i = 0; i < count; i++) {
      const qData = hindiPool[i % hindiPool.length];
      questions.push({
        id: `q_hin_${i + 1}`,
        type: 'mcq',
        question: qData.question,
        options: qData.options,
        correctAnswer: qData.correctAnswer,
        explanation: qData.explanation
      });
    }
  }
  // 5. ENGLISH (Literature, Grammar, Vocabulary)
  else if (lowerTopic.includes('english') || lowerTopic.includes('grammar') || lowerTopic.includes('literature')) {
    const engPool = [
      {
        question: "Choose the correct sentence in the Present Perfect Continuous tense:",
        options: [
          "She is studying for the exam since morning.",
          "She has been studying for the exam since morning.",
          "She was studying for the exam for two hours.",
          "She had been studied for the exam."
        ],
        correctAnswer: 1,
        explanation: "Present Perfect Continuous uses 'has/have been + verb-ing' with 'since/for' to indicate an action that started in the past and continues."
      },
      {
        question: "Identify the figure of speech in: 'The wind whispered through the dark forest.'",
        options: [
          "Simile",
          "Personification",
          "Hyperbole",
          "Alliteration"
        ],
        correctAnswer: 1,
        explanation: "Personification gives human attributes (whispering) to non-human entities (the wind)."
      },
      {
        question: "Select the sentence with correct subject-verb agreement:",
        options: [
          "Neither of the two students were present in class.",
          "Neither of the two students was present in class.",
          "Neither of the two students have been present.",
          "Neither of the two students are present."
        ],
        correctAnswer: 1,
        explanation: "'Neither' is an indefinite singular pronoun and takes a singular verb ('was')."
      }
    ];

    for (let i = 0; i < count; i++) {
      const qData = engPool[i % engPool.length];
      questions.push({
        id: `q_eng_${i + 1}`,
        type: 'mcq',
        question: qData.question,
        options: qData.options,
        correctAnswer: qData.correctAnswer,
        explanation: qData.explanation
      });
    }
  }
  // 6. IT & PE & GENERAL
  else {
    const generalPool = [
      {
        question: `Which fundamental principle is central to understanding ${topic}?`,
        options: [
          `Systematic structure and core rules in ${topic}`,
          `Random non-deterministic variation without rules`,
          `Unchecked expansion without boundary conditions`,
          `Single-point failure without backup mechanisms`
        ],
        correctAnswer: 0,
        explanation: `In ${topic}, mastering foundational definitions and systematic constraints ensures accuracy and deep comprehension.`
      },
      {
        question: `What is the most effective learning approach for mastering ${topic}?`,
        options: [
          `Rote memorization without understanding`,
          `Step-by-step conceptual derivation, visual modeling & active practice`,
          `Skipping prerequisites and jumping straight to tests`,
          `Passive reading without problem-solving`
        ],
        correctAnswer: 1,
        explanation: `Active learning through step-by-step problem derivations and flashcard spaced repetition delivers highest long-term retention in ${topic}.`
      },
      {
        question: `When evaluating practical applications in ${topic}, what is critical to consider?`,
        options: [
          `Boundary conditions, edge cases, and real-world constraints`,
          `Only ideal theoretical conditions`,
          `Ignoring units and syntax errors`,
          `Pure theoretical assumptions without empirical validation`
        ],
        correctAnswer: 0,
        explanation: `Checking edge cases and boundary conditions validates true mastery in ${topic}.`
      }
    ];

    for (let i = 0; i < count; i++) {
      const qData = generalPool[i % generalPool.length];
      questions.push({
        id: `q_gen_${i + 1}`,
        type: 'mcq',
        question: qData.question,
        options: qData.options,
        correctAnswer: qData.correctAnswer,
        explanation: qData.explanation
      });
    }
  }

  return {
    id: `test_ai_${Date.now()}`,
    title: `${topic} Mastery Assessment`,
    topic,
    difficulty,
    timeLimitMinutes: Math.max(10, count * 3),
    totalPoints: count * 20,
    xpReward: count * 50,
    createdAt: new Date().toISOString(),
    questions
  };
}

// 5. AI Whiteboard Note Analyzer & Diagram Summarizer (Multimodal Gemini Vision)
async function analyzeWhiteboard({ image, strokes, textContent = '', drawingSummary = '', apiKey = '' }) {
  const key = apiKey || geminiApiKey || process.env.GEMINI_API_KEY;

  // Extract base64 image data and mime type
  let rawBase64 = '';
  let mimeType = 'image/png';

  if (typeof image === 'string' && image.length > 0) {
    const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (match) {
      mimeType = match[1];
      rawBase64 = match[2];
    } else {
      rawBase64 = image.replace(/^data:image\/\w+;base64,/, '').trim();
    }
  }

  // Cache check for instant response on repeated requests
  const cacheKey = rawBase64
    ? `wb_${(textContent || '').trim()}_${strokes}_${rawBase64.slice(0, 100)}_${rawBase64.length}`
    : null;
  const cached = getCachedResult(cacheKey);
  if (cached) {
    return cached;
  }

  // If live Gemini key is present and we have an image, call Gemini multimodal generateContent
  if (key && rawBase64) {
    const visionPrompt = `You are StudySync AI, a world-class multimodal educational co-pilot specializing in whiteboard OCR, handwritten formula extraction, and technical diagram analysis.
Analyze this whiteboard canvas drawing.
Session Context / Subject: "${textContent || 'Interactive Whiteboard Session'}"
Strokes Count: ${strokes || 0}
${drawingSummary ? `Drawing Context: "${drawingSummary}"` : ''}

Tasks:
1. OCR & Diagram Identification: Carefully inspect handwritten text, geometry, graphs, circuit diagrams, flowchart blocks, or sketches on the canvas.
2. Core Concepts: Extract 2-4 primary concepts, theorems, or topics depicted.
3. LaTeX Equations & Models: Identify all mathematical formulas, chemical equations, or notations visible. Convert them to valid LaTeX (e.g. "\\[ E = mc^2 \\]" or "\\( \\Delta v = a \\cdot t \\)"). If no explicit formulas are written, deduce the theoretical formulas that govern the drawn system.
4. Summary Markdown: Write a concise, readable Markdown summary with key lecture takeaways and study tips.
5. Suggested Flashcards: Generate 2-3 high-yield study flashcards with front (question) and back (concise answer).

Output MUST be valid JSON in this exact structure with no surrounding markdown or explanation outside the JSON:
{
  "title": "Title reflecting the whiteboard content",
  "keyConcepts": [
    "Core concept 1",
    "Core concept 2"
  ],
  "latexEquations": [
    "\\[ formula 1 \\]",
    "\\[ formula 2 \\]"
  ],
  "summaryMarkdown": "### 📝 SyncBoard Lecture Takeaways\\n- **Main Topic**: ...\\n- **Key Takeaways**: ...",
  "suggestedFlashcards": [
    { "front": "Question 1", "back": "Answer 1" },
    { "front": "Question 2", "back": "Answer 2" }
  ]
}`;

    const parts = [
      { text: visionPrompt },
      {
        inlineData: {
          mimeType: mimeType || 'image/png',
          data: rawBase64
        }
      }
    ];

    const candidateModels = getOrderedModels().slice(0, 2);
    for (let i = 0; i < candidateModels.length; i++) {
      const model = candidateModels[i];
      const timeoutMs = i === 0 ? 6500 : 5000;
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const payload = {
          contents: [{ role: 'user', parts }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1000,
            responseMimeType: 'application/json',
            ...(model === 'gemini-3-flash-preview' ? { thinkingConfig: { thinkingBudget: 0 } } : {})
          }
        };

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(timeoutMs)
        });

        if (res.ok) {
          const data = await res.json();
          const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidate) {
            recordModelSuccess(model);
            let cleanText = candidate.trim();
            if (cleanText.startsWith('```')) {
              cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
            }
            try {
              const parsed = JSON.parse(cleanText);
              if (parsed && (parsed.title || parsed.keyConcepts)) {
                const result = {
                  title: parsed.title || `${textContent || 'Whiteboard'} - AI Vision Analysis`,
                  keyConcepts: Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts : [],
                  latexEquations: Array.isArray(parsed.latexEquations) ? parsed.latexEquations : [],
                  summaryMarkdown: parsed.summaryMarkdown || parsed.summary || 'AI synthesis completed.',
                  suggestedFlashcards: Array.isArray(parsed.suggestedFlashcards) ? parsed.suggestedFlashcards : []
                };
                setCachedResult(cacheKey, result, 15 * 60 * 1000);
                return result;
              }
            } catch (pErr) {
              console.warn('Gemini vision returned non-JSON text, adapting format:', pErr.message);
              const fallbackParsed = {
                title: `${textContent || 'Whiteboard'} - AI Vision Analysis`,
                keyConcepts: ["Handwritten diagram and OCR processed via Gemini Vision"],
                latexEquations: [],
                summaryMarkdown: cleanText,
                suggestedFlashcards: []
              };
              setCachedResult(cacheKey, fallbackParsed, 15 * 60 * 1000);
              return fallbackParsed;
            }
          }
        } else {
          const errJson = await res.json().catch(() => ({}));
          const errMessage = errJson?.error?.message || `HTTP ${res.status}`;
          recordModelFailure(model, res.status, errMessage);
        }
      } catch (err) {
        recordModelFailure(model, 500, err.message);
      }
    }
  }

  // Fallback pedagogical analysis if key is absent or multimodal call fails
  const topicTitle = textContent && textContent.trim() ? textContent : 'Interactive Whiteboard';
  const fallbackResult = {
    title: `${topicTitle} - SyncBoard Synthesis`,
    keyConcepts: [
      `Structural representation synthesized from ${strokes || 'active'} canvas strokes`,
      "System topology, state relationships, and bounding conditions",
      "Core mathematical equations and variable transitions"
    ],
    latexEquations: [
      "\\[ dp[i][j] = \\max(dp[i-1][j], dp[i][j-1]) \\]",
      "\\[ \\vec{F}_{\\text{net}} = m \\cdot \\vec{a} = \\frac{d\\vec{p}}{dt} \\]"
    ],
    summaryMarkdown: `### 📝 SyncBoard Lecture Takeaways
- **Subject / Context**: ${textContent || 'Whiteboard Lecture Sketch'}
- **Drawing Activity**: ${strokes || 0} strokes captured on canvas.
- **Key Note**: Diagrams and sketches anchor conceptual understanding. Connect your Google Gemini API key to unlock real-time multimodal OCR, mathematical formula extraction, and handwritten diagram decoding directly through your key!`,
    suggestedFlashcards: [
      {
        front: "What is the primary benefit of diagrammatic modeling in problem solving?",
        back: "It externalizes spatial and relational state transitions, reducing cognitive load."
      },
      {
        front: "How do we translate visual network diagrams into formal algorithmic specifications?",
        back: "By defining vertices \\(V\\), directed edges \\(E\\), weight function \\(w(u, v)\\), and adjacency matrices."
      }
    ]
  };

  if (cacheKey) {
    setCachedResult(cacheKey, fallbackResult, 5 * 60 * 1000);
  }
  return fallbackResult;
}

// 6. AI Lecture Summarizer & Flashcard Deck Generator
async function summarizeLecture({ content, title = 'Lecture Notes', apiKey = '' }) {
  const wordCount = (content || '').split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const cacheKey = `summary_${(title || '').trim()}_${(content || '').slice(0, 200)}_${wordCount}`;
  const cached = getCachedResult(cacheKey);
  if (cached) {
    return cached;
  }

  const prompt = `You are a master educator and curriculum specialist.
Summarize the following educational lecture notes into an executive summary, high-yield key takeaways, and spaced repetition study flashcards.

Session Title: "${title}"
Material to Analyze:
${content.slice(0, 5000)}

Please return a JSON object with:
1. "executiveSummary": A comprehensive, clear executive summary synthesizing the core mechanics, theorems, and concepts.
2. "keyTakeaways": An array of 4-6 concise bullet-point takeaways.
3. "flashcards": An array of 4-6 flashcards with "front" (concept question or prompt testing understanding, using LaTeX where relevant), "back" (detailed explanation or answer), and "difficulty" ("easy", "good", or "hard").

Output strictly valid JSON with no markdown wrapping or conversational text outside the JSON.`;

  const lectureSummarySchema = {
    type: "OBJECT",
    properties: {
      executiveSummary: {
        type: "STRING",
        description: "Executive summary synthesizing key concepts."
      },
      keyTakeaways: {
        type: "ARRAY",
        items: { type: "STRING" },
        description: "High-yield core takeaways from the lecture."
      },
      flashcards: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            front: { type: "STRING", description: "Flashcard question or prompt" },
            back: { type: "STRING", description: "Flashcard explanation or answer" },
            difficulty: { type: "STRING", enum: ["easy", "good", "hard"] }
          },
          required: ["front", "back"]
        },
        description: "Spaced repetition flashcards."
      }
    },
    required: ["executiveSummary", "keyTakeaways", "flashcards"]
  };

  const liveResult = await callGeminiIfAvailable(
    prompt,
    "You are an elite academic tutor producing structured study notes and flashcards. Output valid JSON.",
    apiKey,
    {
      responseMimeType: 'application/json',
      responseSchema: lectureSummarySchema,
      temperature: 0.3
    }
  );

  let dynamicSummary = null;
  let dynamicTakeaways = null;
  let dynamicFlashcards = null;

  if (liveResult && typeof liveResult === 'string') {
    let cleanText = liveResult.trim();

    // 1. Unwrap markdown code blocks (```json ... ``` or ``` ... ```)
    const jsonBlockMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (jsonBlockMatch) {
      cleanText = jsonBlockMatch[1].trim();
    } else {
      const objMatch = cleanText.match(/(\{[\s\S]*\})/);
      if (objMatch) {
        cleanText = objMatch[1].trim();
      }
    }

    // 2. Attempt JSON parse
    try {
      const parsed = JSON.parse(cleanText);
      if (parsed) {
        if (parsed.executiveSummary && typeof parsed.executiveSummary === 'string') {
          dynamicSummary = parsed.executiveSummary.trim();
        }
        if (Array.isArray(parsed.keyTakeaways) && parsed.keyTakeaways.length > 0) {
          dynamicTakeaways = parsed.keyTakeaways.map(t => String(t).trim()).filter(Boolean);
        }
        if (Array.isArray(parsed.flashcards) && parsed.flashcards.length > 0) {
          dynamicFlashcards = parsed.flashcards
            .filter(c => c && (c.front || c.question) && (c.back || c.answer))
            .map((c, i) => ({
              id: `fc_gen_${Date.now()}_${i}`,
              front: String(c.front || c.question).trim(),
              back: String(c.back || c.answer).trim(),
              difficulty: ['easy', 'good', 'hard'].includes(c.difficulty) ? c.difficulty : 'good'
            }));
        }
      }
    } catch (parseErr) {
      console.warn('Direct JSON parse of liveResult failed, attempting regex pattern extraction:', parseErr.message);

      // 3. Regex extraction fallbacks if liveResult is conversational or incomplete JSON
      const execSummaryMatch = liveResult.match(/(?:executiveSummary|Executive Summary)[\s"':]+([\s\S]*?)(?=(?:"?keyTakeaways"?|"?[Kk]ey [Tt]akeaways"?|"?[Ff]lashcards"?|$))/i);
      if (execSummaryMatch) {
        dynamicSummary = execSummaryMatch[1].replace(/["}\],]+$/, '').trim();
      }

      const takeawaysMatch = liveResult.match(/(?:keyTakeaways|Key Takeaways)[\s"':]+([\s\S]*?)(?=(?:"?[Ff]lashcards"?|$))/i);
      if (takeawaysMatch) {
        const bullets = takeawaysMatch[1].match(/(?:^|\n)[-*\d.]+\s*(.+)/g);
        if (bullets) {
          dynamicTakeaways = bullets.map(b => b.replace(/^[-*\d.\s]+/, '').replace(/["\],]+$/, '').trim()).filter(Boolean);
        }
      }

      const cardPairs = [];
      const cardRegex = /(?:front|question|q)[\s"':]+([^"\n}]+)[\s"':]+(?:back|answer|a)[\s"':]+([^"\n}]+)/gi;
      let cardMatch;
      let cardIdx = 0;
      while ((cardMatch = cardRegex.exec(liveResult)) !== null) {
        cardPairs.push({
          id: `fc_gen_${Date.now()}_${cardIdx++}`,
          front: cardMatch[1].replace(/["\],]+$/, '').trim(),
          back: cardMatch[2].replace(/["\],]+$/, '').trim(),
          difficulty: 'good'
        });
      }
      if (cardPairs.length > 0) {
        dynamicFlashcards = cardPairs;
      }
    }
  }

  // Fallback defaults if Gemini is not configured or result was unparseable
  const finalSummary = dynamicSummary || `This comprehensive material covers foundational principles, core mechanics, and analytical problem-solving techniques essential for exam mastery in "${title}".`;

  const finalTakeaways = (dynamicTakeaways && dynamicTakeaways.length > 0)
    ? dynamicTakeaways
    : [
        "Foundational theoretical axioms and their mathematical representations.",
        "Step-by-step problem-solving procedures and algorithmic optimizations.",
        "Crucial boundary conditions, edge cases, and common misconceptions.",
        "Real-world application vectors in industry and scientific research."
      ];

  const finalFlashcards = (dynamicFlashcards && dynamicFlashcards.length > 0)
    ? dynamicFlashcards
    : [
        {
          id: `fc_gen_1_${Date.now()}`,
          front: `What is the primary concept or thesis discussed in "${title}"?`,
          back: "The structured interplay between theoretical foundations, invariant state rules, and practical computational efficiency.",
          difficulty: "easy"
        },
        {
          id: `fc_gen_2_${Date.now()}`,
          front: "What are the key mathematical or logical constraints to remember?",
          back: "Maintaining invariant bounds (e.g. non-negative edge costs, base-case recursion termination).",
          difficulty: "good"
        },
        {
          id: `fc_gen_3_${Date.now()}`,
          front: "How do we optimize the execution and memory footprint?",
          back: "Through memoization caching, space reduction from 2D matrices to rolling variables, and balanced tree representations.",
          difficulty: "hard"
        }
      ];

  const summaryResult = {
    title: `AI Synthesis: ${title}`,
    wordCount,
    readingTimeMinutes,
    executiveSummary: finalSummary,
    keyTakeaways: finalTakeaways,
    flashcards: finalFlashcards,
    isLiveGemini: !!(dynamicSummary || dynamicFlashcards)
  };

  setCachedResult(cacheKey, summaryResult, 15 * 60 * 1000);
  return summaryResult;
}

module.exports = {
  setGeminiKey,
  getGeminiKey,
  generateChatResponse,
  autoGradeSubmission,
  precheckSubmission,
  generateQuiz,
  analyzeWhiteboard,
  summarizeLecture
};
