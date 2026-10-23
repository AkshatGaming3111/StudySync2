// StudySync Pedagogical Speech & Voice Synthesis Utility
// Supports Web Speech API (SpeechRecognition + SpeechSynthesis)

/**
 * Checks if browser supports Speech Recognition
 */
export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && (
    'SpeechRecognition' in window ||
    'webkitSpeechRecognition' in window
  );
}

/**
 * Checks if browser supports Speech Synthesis
 */
export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Transforms LaTeX math notation into natural spoken English words
 */
export function convertLatexToSpokenText(latex) {
  if (!latex) return '';

  return latex
    // Common fractions: \frac{a}{b} -> "a over b"
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 over $2')
    // Square roots: \sqrt{x} -> "square root of x"
    .replace(/\\sqrt\{([^}]+)\}/g, 'square root of $1')
    .replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, '$1th root of $2')
    // Exponents
    .replace(/([a-zA-Z0-9]+)\^2\b/g, '$1 squared')
    .replace(/([a-zA-Z0-9]+)\^3\b/g, '$1 cubed')
    .replace(/([a-zA-Z0-9]+)\^\{([^}]+)\}/g, '$1 to the power of $2')
    .replace(/([a-zA-Z0-9]+)\^([0-9a-zA-Z])/g, '$1 to the power of $2')
    // Subscripts
    .replace(/_\{([^}]+)\}/g, ' sub $1')
    .replace(/_([0-9a-zA-Z])/g, ' sub $1')
    // Greek letters & symbols
    .replace(/\\theta/gi, 'theta')
    .replace(/\\pi/gi, 'pi')
    .replace(/\\alpha/gi, 'alpha')
    .replace(/\\beta/gi, 'beta')
    .replace(/\\gamma/gi, 'gamma')
    .replace(/\\delta/gi, 'delta')
    .replace(/\\Delta/gi, 'delta')
    .replace(/\\lambda/gi, 'lambda')
    .replace(/\\sigma/gi, 'sigma')
    .replace(/\\omega/gi, 'omega')
    .replace(/\\infty/gi, 'infinity')
    // Math operators
    .replace(/\\pm/g, 'plus or minus')
    .replace(/\\times/g, ' multiplied by ')
    .replace(/\\div/g, ' divided by ')
    .replace(/\\cdot/g, ' times ')
    .replace(/\\leq/g, ' is less than or equal to ')
    .replace(/\\geq/g, ' is greater than or equal to ')
    .replace(/\\neq/g, ' is not equal to ')
    .replace(/\\approx/g, ' is approximately ')
    .replace(/\\sim/g, ' is similar to ')
    .replace(/\\equiv/g, ' is equivalent to ')
    .replace(/\\degree/g, ' degrees')
    .replace(/\\rightarrow/g, ' yields ')
    .replace(/\\Rightarrow/g, ' implies ')
    .replace(/\\sum/g, 'sum of ')
    .replace(/\\int/g, 'integral of ')
    // Trigonometry
    .replace(/\\sin/gi, 'sine')
    .replace(/\\cos/gi, 'cosine')
    .replace(/\\tan/gi, 'tangent')
    .replace(/\\csc/gi, 'cosecant')
    .replace(/\\sec/gi, 'secant')
    .replace(/\\cot/gi, 'cotangent')
    // Remaining LaTeX backslashes or braces
    .replace(/\\([a-zA-Z]+)/g, '$1')
    .replace(/[{}]/g, '');
}

/**
 * Cleans full markdown and mathematical text into clear, fluent spoken English
 */
export function cleanTextForSpeech(text) {
  if (!text) return '';

  let cleaned = text;

  // Convert inline and block LaTeX: \( ... \) or \[ ... \] or $$ ... $$ or $ ... $
  cleaned = cleaned.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => ` ${convertLatexToSpokenText(math)} `);
  cleaned = cleaned.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => ` ${convertLatexToSpokenText(math)} `);
  cleaned = cleaned.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => ` ${convertLatexToSpokenText(math)} `);
  cleaned = cleaned.replace(/\$([^$\n]+)\$/g, (_, math) => ` ${convertLatexToSpokenText(math)} `);

  // Strip code blocks with a brief spoken indicator
  cleaned = cleaned.replace(/```[a-zA-Z]*\n([\s\S]*?)```/g, ' here is a code snippet. ');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

  // Strip Markdown links: [text](url) -> text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Strip Markdown headers: ### Header -> Header.
  cleaned = cleaned.replace(/^#{1,6}\s+(.+)$/gm, '$1.');

  // Strip markdown formatting characters
  cleaned = cleaned.replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, '$1');

  // Clean bullet list markers
  cleaned = cleaned.replace(/^[\s]*[-*+]\s+/gm, '. ');
  cleaned = cleaned.replace(/^[\s]*\d+\.\s+/gm, '. ');

  // Clean emojis & decorative symbols for cleaner speech
  cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '');

  // Normalize quotes and dashes
  cleaned = cleaned.replace(/[—–]/g, ', ');
  cleaned = cleaned.replace(/[""]/g, '"');
  cleaned = cleaned.replace(/['']/g, "'");

  // Collapse multiple spaces & newlines
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Splits educational text or lecture notes into distinct sentences for
 * synchronous audio playback and real-time visual highlighting.
 */
export function splitIntoSpokenSentences(text) {
  if (!text) return [];

  // Break by paragraphs and bullet points first
  const rawParagraphs = text.split(/\n+/);
  const sentences = [];
  let idCounter = 0;

  for (const para of rawParagraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;

    // Match sentences (ending with . ! ? or bullet points)
    // Avoid splitting on common abbreviations like Dr., Prof., e.g., i.e., vs.
    const rawMatches = trimmedPara.match(/[^.!?]+(?:[.!?]+|$)/g) || [trimmedPara];

    for (let rawSentence of rawMatches) {
      const sentenceText = rawSentence.trim();
      if (!sentenceText) continue;

      const spoken = cleanTextForSpeech(sentenceText);
      if (spoken.length > 0) {
        sentences.push({
          id: idCounter++,
          rawText: sentenceText,
          spokenText: spoken
        });
      }
    }
  }

  return sentences;
}

/**
 * Finds the most natural, pedagogical voice available on the user's browser
 */
export function getPedagogicalVoice(preferredVoiceName = '') {
  if (!isSpeechSynthesisSupported()) return null;

  const voices = window.speechSynthesis.getVoices() || [];
  if (!voices.length) return null;

  if (preferredVoiceName) {
    const match = voices.find(v => v.name === preferredVoiceName);
    if (match) return match;
  }

  // Priority order for natural-sounding English voices across browsers/OS
  const naturalKeywords = [
    'Google US English',
    'Google UK English Female',
    'Microsoft Jenny Online (Natural)',
    'Microsoft Guy Online (Natural)',
    'Microsoft Christopher Online (Natural)',
    'Microsoft Aria Online (Natural)',
    'Samantha',
    'Daniel',
    'Karen',
    'Victoria',
    'Alex',
    'David',
    'Zira'
  ];

  for (const kw of naturalKeywords) {
    const found = voices.find(v => v.name.includes(kw));
    if (found) return found;
  }

  // Fallback to any en-US or en-* voice
  const enVoice = voices.find(v => v.lang.startsWith('en-US')) ||
                  voices.find(v => v.lang.startsWith('en'));

  return enVoice || voices[0] || null;
}

/**
 * Creates an instance of SpeechRecognition with standard configuration
 */
export function initSpeechRecognition({
  onResult,
  onError,
  onEnd,
  onStart,
  continuous = false
}) {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = continuous;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    if (onStart) onStart();
  };

  recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    if (onResult) {
      onResult({
        finalTranscript,
        interimTranscript,
        rawEvent: event
      });
    }
  };

  recognition.onerror = (event) => {
    if (onError) onError(event);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
}
