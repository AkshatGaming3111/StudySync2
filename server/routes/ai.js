const express = require('express');
const router = express.Router();
const aiEngine = require('../services/aiEngine');
const store = require('../data/store');

// Helper to get student or custom API key
function resolveApiKey(req, userId) {
  let key = req.headers['x-gemini-key'] || req.body.apiKey;
  if (!key && userId) {
    const user = store.findById('users', userId);
    if (user && user.geminiApiKey) {
      key = user.geminiApiKey;
    }
  }
  return key || '';
}

// AI Chat / Co-Pilot (Connected to Student's Saved API Key)
router.post('/chat', async (req, res) => {
  const { message, history = [], context = {}, persona, userId } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: 'Message is required.' });
  }

  const apiKey = resolveApiKey(req, userId);

  try {
    const response = await aiEngine.generateChatResponse({
      message,
      history,
      context,
      persona: persona || 'Socratic Coding Mentor',
      apiKey
    });

    // Award minor XP for asking insightful study questions
    if (userId) {
      store.awardXP(userId, 10, 'Consulted StudySync AI Co-Pilot');
    }

    res.json({
      success: true,
      response,
      usingStudentKey: !!apiKey
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI Whiteboard Analysis
router.post('/whiteboard/analyze', async (req, res) => {
  const { image, imageBase64, strokes, textContent, drawingSummary, userId, classId } = req.body;
  const apiKey = resolveApiKey(req, userId);

  try {
    const analysis = await aiEngine.analyzeWhiteboard({
      image: image || imageBase64,
      strokes,
      textContent,
      drawingSummary,
      apiKey
    });

    if (userId) {
      store.awardXP(userId, 20, 'Synthesized SyncBoard Whiteboard notes with AI');
    }

    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI Lecture Summarizer & Flashcards
router.post('/summarize', async (req, res) => {
  const { content, title, userId } = req.body;
  const apiKey = resolveApiKey(req, userId);

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Content is required for summarization.' });
  }

  try {
    const summary = await aiEngine.summarizeLecture({
      content,
      title: title || 'Lecture Notes',
      apiKey
    });

    // Auto-save generated flashcard deck to store if requested
    if (summary.flashcards && summary.flashcards.length > 0) {
      const newDeck = {
        id: `deck_gen_${Date.now()}`,
        title: `Deck: ${title || 'AI Generated Notes'}`,
        subject: 'General Study',
        cardsCount: summary.flashcards.length,
        cards: summary.flashcards,
        createdAt: new Date().toISOString()
      };
      store.insert('flashcardDecks', newDeck);
      summary.savedDeckId = newDeck.id;
    }

    if (userId) {
      store.awardXP(userId, 30, 'Generated AI Lecture Summary & Flashcards');
    }

    res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Flashcard decks endpoint
router.get('/flashcards', (req, res) => {
  const decks = store.get('flashcardDecks');
  res.json({ success: true, decks });
});

// Save / Update flashcard card rating (spaced repetition)
router.post('/flashcards/:deckId/card/:cardId/rate', (req, res) => {
  const { rating, userId } = req.body; // easy, good, hard, again
  const decks = store.get('flashcardDecks');
  const deck = decks.find(d => d.id === req.params.deckId);

  if (!deck) {
    return res.status(404).json({ success: false, error: 'Deck not found' });
  }

  const card = deck.cards.find(c => c.id === req.params.cardId);
  if (card) {
    card.difficulty = rating;
    card.lastReviewed = new Date().toISOString();
    store.update('flashcardDecks', deck.id, { cards: deck.cards });
  }

  if (userId) {
    store.awardXP(userId, 5, 'Reviewed study flashcard');
  }

  res.json({ success: true, deck });
});

// Configure Gemini API Key
router.post('/config/key', (req, res) => {
  const { key } = req.body;
  aiEngine.setGeminiKey(key || '');
  res.json({
    success: true,
    hasKey: !!aiEngine.getGeminiKey(),
    message: key ? 'Gemini API key updated successfully.' : 'Using built-in pedagogical intelligence engine.'
  });
});

router.get('/config/key', (req, res) => {
  res.json({
    success: true,
    hasKey: !!aiEngine.getGeminiKey()
  });
});

module.exports = router;
