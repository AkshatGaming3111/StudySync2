import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LaTeXRenderer from '../Common/LaTeXRenderer';
import {
  isSpeechSynthesisSupported,
  cleanTextForSpeech,
  getPedagogicalVoice,
  splitIntoSpokenSentences
} from '../../services/speechUtils';
import {
  Sparkles,
  Layers,
  BookOpen,
  RotateCw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  FileText,
  Copy,
  Plus,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Headphones,
  Radio,
  Gauge,
  Clock,
  Sparkle
} from 'lucide-react';

export default function LectureSummarizer() {
  const { currentUser, triggerXpGain } = useAuth();

  const [inputContent, setInputContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  // Flashcards deck & review state
  const [decks, setDecks] = useState([]);
  const [activeDeck, setActiveDeck] = useState(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Podcast-Style "Listen to Lesson" Player state
  const [isPlayingPodcast, setIsPlayingPodcast] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0); // 0.8x, 1.0x, 1.25x, 1.5x, 2.0x
  const [audioSentences, setAudioSentences] = useState([]);
  const [audioMode, setAudioMode] = useState('summary'); // 'summary' (all notes + takeaways) or 'flashcards'

  const currentUtteranceRef = useRef(null);
  const sentenceRefs = useRef({});
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  const currentSentenceIndexRef = useRef(0);
  const playbackSpeedRef = useRef(1.0);

  // Sync ref values for callbacks
  useEffect(() => {
    isPlayingRef.current = isPlayingPodcast;
  }, [isPlayingPodcast]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    currentSentenceIndexRef.current = currentSentenceIndex;
  }, [currentSentenceIndex]);

  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    async function loadDecks() {
      try {
        const res = await api.ai.getFlashcardDecks();
        if (res.success && res.decks && res.decks.length > 0) {
          setDecks(res.decks);
          setActiveDeck(res.decks[0]);
        }
      } catch (e) {
        console.error('Failed to load flashcards:', e);
      }
    }
    loadDecks();
  }, []);

  // Prepare audio sentences whenever summaryData changes
  useEffect(() => {
    if (!summaryData) {
      setAudioSentences([]);
      return;
    }

    const sentences = [];
    let idCounter = 0;

    // 1. Session Intro
    sentences.push({
      id: idCounter++,
      type: 'intro',
      title: 'Introduction',
      rawText: `Welcome to the StudySync podcast lesson on: ${summaryData.title}. Here is your executive summary and high yield concepts.`,
      spokenText: `Welcome to the StudySync podcast lesson on: ${summaryData.title}. Here is your executive summary and high yield concepts.`
    });

    // 2. Executive summary sentences
    if (summaryData.executiveSummary) {
      const execSentences = splitIntoSpokenSentences(summaryData.executiveSummary);
      execSentences.forEach((s) => {
        sentences.push({
          id: idCounter++,
          type: 'executive',
          title: 'Executive Summary',
          rawText: s.rawText,
          spokenText: s.spokenText
        });
      });
    }

    // 3. Takeaway sentences
    if (summaryData.keyTakeaways && summaryData.keyTakeaways.length > 0) {
      sentences.push({
        id: idCounter++,
        type: 'takeaways_intro',
        title: 'Key Takeaways',
        rawText: 'Now, let us review the key high-yield takeaways for your exams.',
        spokenText: 'Now, let us review the key high-yield takeaways for your exams.'
      });

      summaryData.keyTakeaways.forEach((takeaway, tIndex) => {
        sentences.push({
          id: idCounter++,
          type: 'takeaway_item',
          takeawayIndex: tIndex,
          title: `Takeaway #${tIndex + 1}`,
          rawText: takeaway,
          spokenText: `Point ${tIndex + 1}: ${cleanTextForSpeech(takeaway)}`
        });
      });
    }

    // 4. Outro
    sentences.push({
      id: idCounter++,
      type: 'outro',
      title: 'Conclusion',
      rawText: 'That concludes this audio study brief. Next, test your memory with the flashcard deck on your right!',
      spokenText: 'That concludes this audio study brief. Next, test your memory with the flashcard deck on your right!'
    });

    setAudioSentences(sentences);
    setCurrentSentenceIndex(0);
  }, [summaryData]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      stopPodcastAudio();
    };
  }, []);

  // Stop audio playback
  const stopPodcastAudio = () => {
    if (isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
    currentUtteranceRef.current = null;
    setIsPlayingPodcast(false);
    setIsPaused(false);
    setCurrentSentenceIndex(0);
  };

  // Play a specific sentence in the sequence
  const playSentenceAtIndex = (index, speed = playbackSpeedRef.current) => {
    if (!isSpeechSynthesisSupported() || !audioSentences.length) return;

    if (index >= audioSentences.length) {
      // Completed all sentences in the lesson
      stopPodcastAudio();
      triggerXpGain({
        xpGained: 25,
        reason: 'Completed Audio Podcast Lecture Lesson'
      });
      return;
    }

    if (index < 0) index = 0;

    window.speechSynthesis.cancel();

    const sentenceObj = audioSentences[index];
    if (!sentenceObj) return;

    const utterance = new SpeechSynthesisUtterance(sentenceObj.spokenText);
    const voice = getPedagogicalVoice();
    if (voice) utterance.voice = voice;
    utterance.rate = speed;
    utterance.pitch = 1.02; // Warm pedagogical inflection

    utterance.onstart = () => {
      setIsPlayingPodcast(true);
      setIsPaused(false);
      setCurrentSentenceIndex(index);

      // Scroll synchronous highlight into view
      if (sentenceRefs.current[index]) {
        sentenceRefs.current[index].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    };

    utterance.onend = () => {
      currentUtteranceRef.current = null;
      // Seamlessly advance to next sentence if still playing
      if (isPlayingRef.current && !isPausedRef.current) {
        playSentenceAtIndex(index + 1, playbackSpeedRef.current);
      }
    };

    utterance.onerror = (e) => {
      console.warn('Podcast speech error:', e);
      if (isPlayingRef.current && !isPausedRef.current && index + 1 < audioSentences.length) {
        playSentenceAtIndex(index + 1, playbackSpeedRef.current);
      } else {
        stopPodcastAudio();
      }
    };

    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Play / Pause Toggle
  const handleTogglePlayPause = () => {
    if (!isSpeechSynthesisSupported()) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (!audioSentences.length) {
      // If no AI summary generated yet, allow generating a sample or playing current input
      if (inputContent.trim()) {
        const customSentences = splitIntoSpokenSentences(inputContent).map((s, idx) => ({
          id: idx,
          type: 'custom',
          title: 'Notes',
          rawText: s.rawText,
          spokenText: s.spokenText
        }));
        if (customSentences.length > 0) {
          setAudioSentences(customSentences);
          setTimeout(() => {
            playSentenceAtIndex(0, playbackSpeed);
          }, 100);
          return;
        }
      }
      alert('Please enter lecture notes or generate a summary first to start the Podcast Player.');
      return;
    }

    if (isPlayingPodcast && !isPaused) {
      // Pause
      window.speechSynthesis.pause();
      setIsPaused(true);
    } else if (isPlayingPodcast && isPaused) {
      // Resume
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      // Start from current or beginning
      playSentenceAtIndex(currentSentenceIndex, playbackSpeed);
    }
  };

  // Skip forward or backward by delta
  const handleSkipSentence = (delta) => {
    if (!audioSentences.length) return;
    const target = Math.max(0, Math.min(audioSentences.length - 1, currentSentenceIndex + delta));
    playSentenceAtIndex(target, playbackSpeed);
  };

  // Speed changer
  const handleSetSpeed = (newSpeed) => {
    setPlaybackSpeed(newSpeed);
    playbackSpeedRef.current = newSpeed;
    if (isPlayingPodcast && !isPaused) {
      // Re-trigger current sentence with new rate
      playSentenceAtIndex(currentSentenceIndex, newSpeed);
    }
  };

  // Click on any sentence directly in text
  const handleSentenceClick = (sentenceId) => {
    const targetIdx = audioSentences.findIndex(s => s.id === sentenceId);
    if (targetIdx !== -1) {
      playSentenceAtIndex(targetIdx, playbackSpeed);
    }
  };

  const handleSummarize = async (e) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    stopPodcastAudio();
    setLoading(true);
    try {
      const res = await api.ai.summarize({
        content: inputContent.trim(),
        title: title.trim() || 'Classroom Study Session',
        userId: currentUser?.id
      });

      if (res.success && res.summary) {
        setSummaryData(res.summary);
        triggerXpGain({
          xpGained: 30,
          reason: 'Generated AI Notes & Flashcards'
        });

        // reload decks
        const dRes = await api.ai.getFlashcardDecks();
        if (dRes.success) {
          setDecks(dRes.decks);
          if (res.summary.savedDeckId) {
            const found = dRes.decks.find(d => d.id === res.summary.savedDeckId);
            if (found) {
              setActiveDeck(found);
              setCardIndex(0);
              setIsFlipped(false);
            }
          }
        }
      }
    } catch (err) {
      console.error('Summarize error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRateCard = async (rating) => {
    if (!activeDeck || !activeDeck.cards?.[cardIndex]) return;
    const card = activeDeck.cards[cardIndex];

    try {
      await api.ai.rateFlashcard(activeDeck.id, card.id, rating, currentUser?.id);
      triggerXpGain({
        xpGained: 5,
        reason: 'Spaced repetition flashcard practice'
      });
    } catch (e) {
      console.error('Rating failed:', e);
    }

    // Move to next card
    setIsFlipped(false);
    if (cardIndex < activeDeck.cards.length - 1) {
      setCardIndex(prev => prev + 1);
    } else {
      setCardIndex(0); // loop
    }
  };

  const currentCard = activeDeck?.cards?.[cardIndex];

  // Helper to determine if a specific raw text matches the currently spoken sentence
  const isSentenceActive = (sentenceId) => {
    return isPlayingPodcast && audioSentences[currentSentenceIndex]?.id === sentenceId;
  };

  const isTakeawayActive = (takeawayIndex) => {
    if (!isPlayingPodcast) return false;
    const current = audioSentences[currentSentenceIndex];
    return current?.type === 'takeaway_item' && current?.takeawayIndex === takeawayIndex;
  };

  const totalSentences = audioSentences.length || 1;
  const progressPercent = Math.min(100, Math.round(((currentSentenceIndex + 1) / totalSentences) * 100));

  return (
    <div className="space-y-6 text-xs">
      
      {/* Top Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-teal-500/10 via-brand-500/10 to-indigo-500/10 border border-brand-500/20 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-500" /> AI Lecture Summarizer & Flashcards
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5">
            Convert long study materials, lecture transcripts, and textbook notes into high-yield summaries, 3D flashcards & audio lessons
          </p>
        </div>

        {/* Quick Podcast Status Pill */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-2xl bg-white dark:bg-dark-card border border-brand-500/30 flex items-center gap-2 shadow-sm">
            <Headphones className="w-4 h-4 text-brand-500" />
            <span className="font-bold text-gray-700 dark:text-gray-200">
              {isPlayingPodcast ? (isPaused ? 'Podcast Paused' : 'Playing Podcast Lesson') : 'Podcast Ready'}
            </span>
            {isPlayingPodcast && !isPaused && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* PODCAST AUDIO PLAYER BAR (Always Available or Prominent When Summary Exists) */}
      {(summaryData || audioSentences.length > 0) && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 text-white shadow-xl border border-indigo-500/30 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 flex-shrink-0">
                <Headphones className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                    🎙️ Podcast Study Lesson
                  </span>
                  {isPlayingPodcast && !isPaused && (
                    <div className="flex items-end gap-0.5 h-3">
                      <span className="w-0.5 bg-teal-400 rounded-full animate-bounce h-2" />
                      <span className="w-0.5 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.2s] h-3" />
                      <span className="w-0.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.4s] h-2.5" />
                    </div>
                  )}
                </div>
                <h4 className="font-extrabold text-sm sm:text-base text-white mt-0.5 line-clamp-1">
                  {summaryData?.title || 'Interactive Spoken Lecture'}
                </h4>
                <p className="text-[11px] text-gray-300">
                  {audioSentences[currentSentenceIndex]?.title || 'Lesson Overview'} • Sentence {currentSentenceIndex + 1} of {totalSentences}
                </p>
              </div>
            </div>

            {/* Variable Speed Selector */}
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-2xl border border-white/10 backdrop-blur-md self-end sm:self-center">
              {[0.8, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handleSetSpeed(rate)}
                  className={`px-2 py-1 rounded-xl text-[10px] font-bold transition-all ${
                    playbackSpeed === rate
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Scrubber & Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-white/15 h-2 rounded-full overflow-hidden relative cursor-pointer group">
              <div
                className="bg-gradient-to-r from-teal-400 via-brand-500 to-indigo-500 h-full rounded-full transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 font-mono">
              <span>Section {currentSentenceIndex + 1}</span>
              <span className="text-teal-400 font-bold">{progressPercent}% Completed</span>
              <span>{totalSentences} Sections</span>
            </div>
          </div>

          {/* Player Action Buttons */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSkipSentence(-1)}
                disabled={currentSentenceIndex <= 0}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition-all active:scale-95"
                title="Previous Sentence"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={handleTogglePlayPause}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-teal-400 via-brand-500 to-indigo-500 hover:from-teal-500 hover:to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-brand-500/30 flex items-center gap-2 active:scale-95 transition-all"
              >
                {isPlayingPodcast && !isPaused ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" /> Pause Lesson
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" /> {isPaused ? 'Resume Lesson' : 'Listen to Lesson'}
                  </>
                )}
              </button>

              <button
                onClick={() => handleSkipSentence(1)}
                disabled={currentSentenceIndex >= totalSentences - 1}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white transition-all active:scale-95"
                title="Next Sentence"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {isPlayingPodcast && (
                <button
                  onClick={stopPodcastAudio}
                  className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 transition-all active:scale-95"
                  title="Stop Lesson"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
              )}
            </div>

            <p className="text-[11px] text-gray-400 hidden sm:block italic">
              💡 Tip: Click on any sentence in the notes below to jump audio playback directly to it!
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Input Form & Summarizer with Synchronous Highlight */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-500" /> Input Lecture Transcript or Notes
              </h4>
              <button
                type="button"
                onClick={() => {
                  setTitle('Ray Optics & Reflection of Light');
                  setInputContent(`Light travels in straight lines in a homogeneous medium. When light encounters a boundary between two different media, it undergoes reflection and refraction. 

According to the Law of Reflection, the angle of incidence equals the angle of reflection: \\( \\theta_i = \\theta_r \\). Furthermore, the incident ray, reflected ray, and the normal all lie in the same plane.

Spherical mirrors are of two primary kinds: concave and convex. The mirror formula relating focal length f, object distance u, and image distance v is given by:
\\[ \\frac{1}{f} = \\frac{1}{v} + \\frac{1}{u} \\]

Linear magnification m produced by a spherical mirror is defined as the ratio of height of the image to the height of the object:
\\[ m = \\frac{h'}{h} = -\\frac{v}{u} \\]

In concave mirrors, a real and inverted image is formed for objects placed beyond the principal focus. In contrast, convex mirrors always produce virtual, erect, and diminished images regardless of object position.`);
                }}
                className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Insert Sample CBSE Notes
              </button>
            </div>

            <form onSubmit={handleSummarize} className="space-y-3">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Session Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Graph Algorithms & Space Complexity"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Lecture Text / Study Material</label>
                <textarea
                  rows={8}
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  placeholder="Paste your lecture notes, transcript, chapter excerpt, or formulas here..."
                  required
                  className="w-full p-3.5 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-brand-500 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !inputContent.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold shadow-md shadow-brand-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Synthesizing Summary, Audio & Flashcards...' : 'Generate AI Summary & Audio Lesson'}</span>
              </button>
            </form>
          </div>

          {/* Render Summary with Synchronous Real-Time Highlighting */}
          {summaryData && (
            <div className="p-5 rounded-3xl bg-white dark:bg-dark-card border border-brand-500/30 shadow-md space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-500" /> {summaryData.title}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-400 font-mono">
                    {summaryData.readingTimeMinutes} min read • {summaryData.wordCount} words
                  </span>
                  <button
                    onClick={handleTogglePlayPause}
                    className="p-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-300 dark:border-brand-800 hover:bg-brand-100 flex items-center gap-1 font-bold text-[10px]"
                    title="Listen to this summary"
                  >
                    {isPlayingPodcast && !isPaused ? <Pause className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                    <span>{isPlayingPodcast && !isPaused ? 'Pause' : 'Listen'}</span>
                  </button>
                </div>
              </div>

              {/* Executive Summary Section with Interactive Sentences */}
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 leading-relaxed">
                <p className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-500" /> Executive Summary:
                </p>

                {/* Split and render interactive sentences for real-time highlighting */}
                <div className="space-y-1.5 text-xs">
                  {audioSentences
                    .filter(s => s.type === 'executive')
                    .map((s, idx) => {
                      const active = isSentenceActive(s.id);

                      return (
                        <div
                          key={s.id}
                          ref={el => sentenceRefs.current[s.id] = el}
                          onClick={() => handleSentenceClick(s.id)}
                          className={`p-2 rounded-xl transition-all cursor-pointer ${
                            active
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-100 border-l-4 border-amber-500 font-semibold shadow-md ring-2 ring-amber-400/40 pl-3'
                              : 'hover:bg-gray-100/80 dark:hover:bg-dark-card border-l-2 border-transparent pl-2 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {active && (
                              <Volume2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <LaTeXRenderer content={s.rawText} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Key Takeaways Section with Synchronous Highlight */}
              <div>
                <p className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <Sparkle className="w-3.5 h-3.5 text-amber-500" /> Key High-Yield Takeaways:
                </p>

                <div className="space-y-2">
                  {summaryData.keyTakeaways?.map((takeaway, tIndex) => {
                    const active = isTakeawayActive(tIndex);
                    const matchedSentence = audioSentences.find(s => s.type === 'takeaway_item' && s.takeawayIndex === tIndex);

                    return (
                      <div
                        key={tIndex}
                        ref={el => {
                          if (matchedSentence) {
                            sentenceRefs.current[matchedSentence.id] = el;
                          }
                        }}
                        onClick={() => {
                          if (matchedSentence) handleSentenceClick(matchedSentence.id);
                        }}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                          active
                            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-100 font-semibold shadow-md ring-2 ring-amber-400/40'
                            : 'bg-gray-50/70 dark:bg-dark-surface border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:border-brand-400'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 ${
                          active
                            ? 'bg-amber-500 text-white'
                            : 'bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400'
                        }`}>
                          {active ? <Volume2 className="w-3 h-3 animate-pulse" /> : tIndex + 1}
                        </div>
                        <div className="flex-1">
                          <LaTeXRenderer content={takeaway} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: 3D Interactive Flashcard Practice Studio */}
        <div className="space-y-4">
          
          {/* Deck Selector Header */}
          <div className="p-4 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <RotateCw className="w-4 h-4 text-indigo-500" /> Spaced Repetition Flashcard Studio
              </h4>
              <p className="text-[11px] text-gray-500">
                Deck: <strong>{activeDeck?.title || 'General Essentials'}</strong> ({activeDeck?.cards?.length || 0} Cards)
              </p>
            </div>

            <div className="flex gap-1 flex-wrap">
              {decks.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setActiveDeck(d);
                    setCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                    activeDeck?.id === d.id
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  {d.subject || d.title.split(':')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* 3D Flip Card Container */}
          {currentCard ? (
            <div className="space-y-4">
              
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="perspective-1000 w-full h-72 cursor-pointer select-none"
              >
                <div
                  className={`relative w-full h-full duration-500 transform-style-preserve-3d rounded-3xl shadow-lg border border-gray-200 dark:border-dark-border transition-transform ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* Front of Card */}
                  <div className="absolute inset-0 backface-hidden p-6 rounded-3xl bg-gradient-to-br from-white via-gray-50 to-teal-50/20 dark:from-dark-card dark:via-dark-surface dark:to-dark-card flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                      <span>Card {cardIndex + 1} of {activeDeck?.cards?.length}</span>
                      <span className="flex items-center gap-1 text-brand-500">
                        <RotateCw className="w-3 h-3" /> Click anywhere to Flip
                      </span>
                    </div>

                    <div className="text-center my-auto px-4">
                      <p className="text-xs text-brand-500 font-bold uppercase tracking-wider mb-2">Question / Concept</p>
                      <div className="text-base font-bold text-gray-900 dark:text-white leading-relaxed">
                        <LaTeXRenderer content={currentCard.front} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>Spaced Repetition Active</span>
                      {/* Audio recitation for flashcard question */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isSpeechSynthesisSupported()) {
                            window.speechSynthesis.cancel();
                            const u = new SpeechSynthesisUtterance(cleanTextForSpeech(currentCard.front));
                            const v = getPedagogicalVoice();
                            if (v) u.voice = v;
                            u.rate = playbackSpeed;
                            window.speechSynthesis.speak(u);
                          }
                        }}
                        className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-hover text-brand-500 font-bold flex items-center gap-1"
                        title="Listen to question"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Read Question
                      </button>
                    </div>
                  </div>

                  {/* Back of Card */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 p-6 rounded-3xl bg-gradient-to-br from-indigo-950/20 via-white to-gray-50 dark:from-dark-card dark:via-dark-surface dark:to-indigo-950/30 flex flex-col justify-between border-2 border-indigo-500/40">
                    <div className="flex items-center justify-between text-[11px] text-indigo-500 font-bold uppercase tracking-wider">
                      <span>Explanation / Answer</span>
                      <span>Card {cardIndex + 1} of {activeDeck?.cards?.length}</span>
                    </div>

                    <div className="my-auto px-4 text-center">
                      <div className="text-sm text-gray-800 dark:text-gray-100 leading-relaxed">
                        <LaTeXRenderer content={currentCard.back} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>Rate difficulty below</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isSpeechSynthesisSupported()) {
                            window.speechSynthesis.cancel();
                            const u = new SpeechSynthesisUtterance(cleanTextForSpeech(currentCard.back));
                            const v = getPedagogicalVoice();
                            if (v) u.voice = v;
                            u.rate = playbackSpeed;
                            window.speechSynthesis.speak(u);
                          }
                        }}
                        className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-hover text-indigo-500 font-bold flex items-center gap-1"
                        title="Listen to answer"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Read Answer
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation & Spaced Repetition Buttons */}
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleRateCard('again')}
                    className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-bold text-center hover:bg-rose-100 transition-colors"
                  >
                    <p className="text-xs">Again</p>
                    <span className="text-[10px] text-gray-400 font-normal">&lt; 1 min</span>
                  </button>
                  <button
                    onClick={() => handleRateCard('hard')}
                    className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400 font-bold text-center hover:bg-amber-100 transition-colors"
                  >
                    <p className="text-xs">Hard</p>
                    <span className="text-[10px] text-gray-400 font-normal">2 days</span>
                  </button>
                  <button
                    onClick={() => handleRateCard('good')}
                    className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 font-bold text-center hover:bg-blue-100 transition-colors"
                  >
                    <p className="text-xs">Good</p>
                    <span className="text-[10px] text-gray-400 font-normal">4 days</span>
                  </button>
                  <button
                    onClick={() => handleRateCard('easy')}
                    className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 font-bold text-center hover:bg-emerald-100 transition-colors"
                  >
                    <p className="text-xs">Easy</p>
                    <span className="text-[10px] text-gray-400 font-normal">7 days</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCardIndex(prev => Math.max(0, prev - 1));
                    }}
                    disabled={cardIndex === 0}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 font-semibold flex items-center gap-1 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev Card
                  </button>

                  <span className="font-mono text-gray-400 font-bold">
                    {cardIndex + 1} / {activeDeck?.cards?.length}
                  </span>

                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCardIndex(prev => Math.min((activeDeck?.cards?.length || 1) - 1, prev + 1));
                    }}
                    disabled={cardIndex === (activeDeck?.cards?.length || 1) - 1}
                    className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 font-semibold flex items-center gap-1 disabled:opacity-30"
                  >
                    Next Card <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-gray-400 border border-dashed border-gray-300 dark:border-dark-border rounded-3xl">
              No cards in this deck yet. Generate a deck from lecture notes on the left!
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
