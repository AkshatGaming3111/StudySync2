import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useClass } from '../../context/ClassContext';
import { api } from '../../services/api';
import LaTeXRenderer from '../Common/LaTeXRenderer';
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  cleanTextForSpeech,
  getPedagogicalVoice,
  initSpeechRecognition
} from '../../services/speechUtils';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Zap,
  BookOpen,
  HelpCircle,
  Code,
  Sigma,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  Key,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Trash2,
  AlertCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Square,
  Play,
  Pause
} from 'lucide-react';

export default function StudyBotDrawer({ isOpen, onClose }) {
  const { currentUser, updateProfile, triggerXpGain } = useAuth();
  const { activeClass } = useClass();

  const [apiKey, setApiKey] = useState(currentUser?.geminiApiKey || localStorage.getItem('studysync_gemini_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keySavedMsg, setKeySavedMsg] = useState('');
  const [savingKey, setSavingKey] = useState(false);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [persona, setPersona] = useState('CBSE Board Exam Coach');
  const messagesEndRef = useRef(null);

  // Voice tutor & speech states
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(() => {
    return localStorage.getItem('studysync_voice_mode') === 'true';
  });
  const [voiceRate, setVoiceRate] = useState(1.0); // 0.8x, 1.0x, 1.2x
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const [interimText, setInterimText] = useState('');
  const speechRecognizerRef = useRef(null);
  const currentUtteranceRef = useRef(null);

  const loadingPhrases = [
    "Cooking the answers...",
    "Preparing solutions...",
    "Formulating step-by-step breakdown...",
    "Brewing curriculum insights...",
    "Synthesizing LaTeX equations..."
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingTextIndex(0);
      interval = setInterval(() => {
        setLoadingTextIndex(prev => (prev + 1) % loadingPhrases.length);
      }, 1600);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Clean up any ongoing speech synthesis or recognition when unmounting or closing drawer
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      stopListening();
    }
  }, [isOpen]);

  const personas = [
    { id: 'CBSE Board Exam Coach', label: '🏛️ CBSE Board Coach', desc: 'NCERT & Board exam high-yield tips' },
    { id: 'Socratic Coding Mentor', label: '👨‍🏫 Socratic Mentor', desc: 'Guided inquiry & algorithmic logic' },
    { id: 'Visual Science Explainer', label: '🧬 Science Guru', desc: 'Intuitive analogies & mechanisms' },
    { id: 'Math Derivation Master', label: '📐 Math Master', desc: 'Step-by-step geometric & algebraic proofs' },
    { id: 'ELI5 Simplifier', label: '🌱 ELI5 Tutor', desc: 'Simplified first-principles breakdowns' }
  ];

  // Quick subject chat starters that directly query the live Gemini API
  const quickChatStarters = [
    {
      label: "📐 Trigonometric Proof",
      query: "Prove that (sin θ)/(1 - cos θ) + (cos θ)/(1 - sin θ) with step-by-step LaTeX formulas for CBSE Class 10 Maths."
    },
    {
      label: "⚡ Ohm's & Joule's Law",
      query: "Explain Ohm's Law (V=IR) and derive Joule's Law of Heating (H=I²Rt) with circuit analysis."
    },
    {
      label: "🇮🇳 Nationalism in India",
      query: "Explain the causes and significance of Mahatma Gandhi's 1930 Dandi Salt March for CBSE Class 10 History."
    },
    {
      label: "💻 SQL Primary vs Foreign Key",
      query: "Explain the difference between Primary Key and Foreign Key in RDBMS SQL with a student-class example for IT 402."
    },
    {
      label: "🧪 Redox Reactions",
      query: "Explain Oxidation and Reduction in terms of electron and oxygen transfer with a chemical reaction example."
    },
    {
      label: "📝 English Active-Passive",
      query: "Explain the rules of converting active to passive voice with 3 CBSE exam examples."
    }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const hasConnectedKey = !!(apiKey.trim() || currentUser?.geminiApiKey);

  // If no key is set when opened, prompt the user
  useEffect(() => {
    if (isOpen && !hasConnectedKey) {
      setShowKeyInput(true);
    }
  }, [isOpen, hasConnectedKey]);

  // Voice Mode toggle handler
  const handleToggleVoiceMode = () => {
    const nextVal = !voiceModeEnabled;
    setVoiceModeEnabled(nextVal);
    localStorage.setItem('studysync_voice_mode', nextVal ? 'true' : 'false');
    if (!nextVal) {
      stopSpeaking();
    }
  };

  // Speech Synthesis Control
  const stopSpeaking = () => {
    if (isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
    currentUtteranceRef.current = null;
    setIsSpeaking(false);
    setSpeakingMsgId(null);
  };

  const handleSpeakMessage = (msgId, rawText) => {
    if (!isSpeechSynthesisSupported()) {
      setSpeechError('Speech synthesis is not supported on this device/browser.');
      setTimeout(() => setSpeechError(null), 3000);
      return;
    }

    // Toggle off if already speaking this message
    if (isSpeaking && speakingMsgId === msgId) {
      stopSpeaking();
      return;
    }

    stopSpeaking();
    const spokenText = cleanTextForSpeech(rawText);
    if (!spokenText) return;

    try {
      const utterance = new SpeechSynthesisUtterance(spokenText);
      const voice = getPedagogicalVoice();
      if (voice) utterance.voice = voice;
      utterance.rate = voiceRate;
      utterance.pitch = 1.05; // Slightly lively, encouraging pitch

      utterance.onstart = () => {
        setIsSpeaking(true);
        setSpeakingMsgId(msgId);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingMsgId(null);
        currentUtteranceRef.current = null;
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
        setIsSpeaking(false);
        setSpeakingMsgId(null);
        currentUtteranceRef.current = null;
      };

      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Failed to trigger speech synthesis:', err);
      setIsSpeaking(false);
      setSpeakingMsgId(null);
    }
  };

  // Speech Recognition (Microphone) Control
  const stopListening = () => {
    if (speechRecognizerRef.current) {
      try {
        speechRecognizerRef.current.abort();
      } catch (e) {}
      speechRecognizerRef.current = null;
    }
    setIsListening(false);
    setInterimText('');
  };

  const handleToggleMic = () => {
    if (!isSpeechRecognitionSupported()) {
      setSpeechError('Speech recognition is not supported in this browser. Please use Chrome, Edge, Safari, or Brave.');
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    // Stop bot speech before student speaks
    stopSpeaking();
    setSpeechError(null);
    setInterimText('');

    try {
      const recognition = initSpeechRecognition({
        continuous: false,
        onStart: () => {
          setIsListening(true);
        },
        onResult: ({ finalTranscript, interimTranscript }) => {
          if (finalTranscript) {
            setInput(prev => (prev ? `${prev} ${finalTranscript}` : finalTranscript));
            setInterimText('');
          } else if (interimTranscript) {
            setInterimText(interimTranscript);
          }
        },
        onError: (event) => {
          console.warn('SpeechRecognition error:', event.error);
          if (event.error === 'not-allowed') {
            setSpeechError('Microphone access blocked. Please enable microphone permissions in browser settings.');
          } else if (event.error === 'no-speech') {
            // benign
          } else {
            setSpeechError(`Microphone issue: ${event.error}`);
          }
          setIsListening(false);
          setInterimText('');
          setTimeout(() => setSpeechError(null), 4500);
        },
        onEnd: () => {
          setIsListening(false);
          setInterimText('');
        }
      });

      if (recognition) {
        speechRecognizerRef.current = recognition;
        recognition.start();
      }
    } catch (err) {
      console.error('Speech recognition initiation error:', err);
      setIsListening(false);
      setSpeechError('Could not start microphone. Please check permissions.');
      setTimeout(() => setSpeechError(null), 4000);
    }
  };

  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setSavingKey(true);
    try {
      const cleanKey = apiKey.trim();
      localStorage.setItem('studysync_gemini_key', cleanKey);
      if (currentUser?.id) {
        await updateProfile({
          geminiApiKey: cleanKey
        });
      }
      setKeySavedMsg('Gemini API Key saved to your account!');
      triggerXpGain({
        xpGained: 50,
        reason: 'Connected personal Google Gemini API key'
      });
      setTimeout(() => {
        setKeySavedMsg('');
        setShowKeyInput(false);
      }, 2500);
    } catch (err) {
      console.error('Failed to save API key:', err);
    } finally {
      setSavingKey(false);
    }
  };

  const handleClearChat = () => {
    stopSpeaking();
    setMessages([]);
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text || !text.trim() || loading) return;

    // Stop student mic and ongoing speech before new query
    stopListening();
    stopSpeaking();

    const userMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setInterimText('');
    setLoading(true);

    try {
      const activeKey = apiKey.trim() || currentUser?.geminiApiKey || localStorage.getItem('studysync_gemini_key') || '';

      const res = await api.ai.chat({
        message: text.trim(),
        history: messages.slice(-6).map(m => ({ role: m.role, text: m.text })),
        context: {
          activeClass: activeClass ? { title: activeClass.title, subject: activeClass.subject, gradeLevel: activeClass.gradeLevel } : null,
          user: { name: currentUser?.name, role: currentUser?.role, gradeClass: currentUser?.gradeClass, section: currentUser?.section }
        },
        persona,
        userId: currentUser?.id,
        apiKey: activeKey
      });

      if (res.success && res.response) {
        const botMessage = {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          text: res.response.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isLiveGemini: !!(res.response.isLiveGemini || res.usingStudentKey),
          suggestedFollowUps: res.response.suggestedFollowUps || []
        };
        setMessages(prev => [...prev, botMessage]);

        triggerXpGain({
          xpGained: 15,
          reason: 'StudyBot AI consultation & derivation'
        });

        // If Voice Mode is enabled, automatically speak Prof. Synapse's response!
        if (voiceModeEnabled && isSpeechSynthesisSupported()) {
          setTimeout(() => {
            handleSpeakMessage(botMessage.id, botMessage.text);
          }, 300);
        }
      }
    } catch (err) {
      console.error('Failed to get AI response:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          text: `⚠️ **API Error**: Could not connect to Google Gemini. Please ensure your API key is valid and has active quota.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isLiveGemini: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[540px] bg-white dark:bg-dark-surface shadow-2xl border-l border-gray-200 dark:border-dark-border flex flex-col animate-in slide-in-from-right duration-200">
      
      {/* Drawer Header */}
      <div className="p-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between bg-gray-50/90 dark:bg-dark-card/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">StudyBot AI 3.0</h3>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                hasConnectedKey
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
              }`}>
                {hasConnectedKey ? '🟢 Gemini API Active' : '⚡ Key Required'}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {activeClass ? `${activeClass.title}` : `Live AI Co-Pilot (${currentUser?.gradeClass || 'Grade 10'})`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Spoken Voice Mode Auto-Speak Toggle */}
          <button
            onClick={handleToggleVoiceMode}
            title={voiceModeEnabled ? "Voice Mode ON: Prof. Synapse reads answers automatically (Click to turn OFF)" : "Voice Mode OFF: Click to enable spoken AI responses"}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
              voiceModeEnabled
                ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border-teal-500/40 shadow-sm'
                : 'bg-gray-100 dark:bg-dark-surface text-gray-500 dark:text-gray-400 border-gray-200 dark:border-dark-border hover:text-gray-900'
            }`}
          >
            {voiceModeEnabled ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                <Volume2 className="w-3.5 h-3.5 text-teal-500" />
                <span className="hidden sm:inline">Voice ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Voice OFF</span>
              </>
            )}
          </button>

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              title="Clear conversation"
              className="p-1.5 rounded-xl text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className={`p-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
              hasConnectedKey
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse'
            }`}
            title="Manage your Google Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" />
            {showKeyInput ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Live Speaking Indicator Banner */}
      {isSpeaking && (
        <div className="px-4 py-2.5 bg-gradient-to-r from-teal-500/15 via-brand-500/15 to-indigo-500/15 border-b border-teal-500/30 flex items-center justify-between animate-in slide-in-from-top-1 text-xs">
          <div className="flex items-center gap-2">
            {/* Animated Audio Equalizer Bars */}
            <div className="flex items-end gap-0.5 h-4">
              <span className="w-1 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
              <span className="w-1 bg-teal-400 rounded-full animate-bounce [animation-delay:-0.15s] h-4" />
              <span className="w-1 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.4s] h-2.5" />
              <span className="w-1 bg-indigo-500 rounded-full animate-bounce h-3.5" />
            </div>
            <span className="font-bold text-teal-700 dark:text-teal-300">
              Prof. Synapse is speaking...
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed toggle */}
            <button
              onClick={() => {
                const nextRate = voiceRate === 1.0 ? 1.25 : voiceRate === 1.25 ? 1.5 : 1.0;
                setVoiceRate(nextRate);
                if (currentUtteranceRef.current) {
                  // restart current speech with new rate
                  const currentId = speakingMsgId;
                  const activeMsg = messages.find(m => m.id === currentId);
                  if (activeMsg) handleSpeakMessage(currentId, activeMsg.text);
                }
              }}
              className="px-2 py-0.5 rounded-lg bg-white/70 dark:bg-dark-card border border-teal-500/30 text-[10px] font-bold text-teal-700 dark:text-teal-300 hover:bg-white"
              title="Adjust speech playback speed"
            >
              {voiceRate}x Speed
            </button>

            <button
              onClick={stopSpeaking}
              className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] flex items-center gap-1 shadow-sm active:scale-95 transition-all"
            >
              <Square className="w-2.5 h-2.5 fill-current" /> Stop
            </button>
          </div>
        </div>
      )}

      {/* API Key Inline Config Dropdown */}
      {showKeyInput && (
        <div className="p-4 bg-gradient-to-br from-brand-500/10 via-indigo-500/5 to-transparent border-b border-gray-200 dark:border-dark-border text-xs space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-500" /> Connect Your Google Gemini API Key
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                All responses will be generated in real-time through your API Key with LaTeX math & CBSE curriculum grounding.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveApiKey} className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your Gemini API Key (AIzaSy...)"
              className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={savingKey || !apiKey.trim()}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-brand-500/20 active:scale-95"
            >
              {savingKey ? 'Saving...' : 'Save Key'}
            </button>
          </form>

          {keySavedMsg && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {keySavedMsg}
            </p>
          )}
        </div>
      )}

      {/* Persona Selection Strip */}
      <div className="px-4 py-2 bg-gray-100/60 dark:bg-dark-card/40 border-b border-gray-200 dark:border-dark-border flex items-center gap-1.5 overflow-x-auto">
        {personas.map(p => (
          <button
            key={p.id}
            onClick={() => setPersona(p.id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              persona === p.id
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-white dark:bg-dark-card text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-dark-border'
            }`}
            title={p.desc}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-center p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
              <Bot className="w-6 h-6" />
            </div>
            
            <div className="max-w-sm space-y-1">
              <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                How can I assist your study session?
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ask any question verbally by tapping the 🎙️ mic button, or tap a quick topic below:
              </p>
            </div>

            {/* Quick Chat Options that query API Key */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2">
              {quickChatStarters.map((starter, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(starter.query)}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-dark-card hover:bg-brand-50 dark:hover:bg-brand-950/40 border border-gray-200 dark:border-dark-border hover:border-brand-300 dark:hover:border-brand-800 transition-all text-xs group"
                >
                  <p className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                    {starter.label}
                  </p>
                  <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                    {starter.query}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isBot = msg.role === 'assistant';
            const isThisMsgSpeaking = isSpeaking && speakingMsgId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                {isBot ? (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-500 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white mt-1 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                ) : (
                  <img
                    src={currentUser?.avatar}
                    alt={currentUser?.name}
                    className="w-7 h-7 rounded-lg object-cover flex-shrink-0 mt-1 border border-brand-500"
                  />
                )}

                <div className={`max-w-[88%] space-y-2`}>
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed transition-all ${
                      isBot
                        ? isThisMsgSpeaking
                          ? 'bg-teal-50 dark:bg-teal-950/40 text-gray-900 dark:text-gray-100 border-2 border-teal-500/60 shadow-md ring-2 ring-teal-500/20'
                          : 'bg-gray-100 dark:bg-dark-card text-gray-900 dark:text-gray-100 border border-gray-200/80 dark:border-dark-border shadow-sm'
                        : 'bg-gradient-to-r from-brand-500 to-teal-600 text-white shadow-md'
                    }`}
                  >
                    <LaTeXRenderer content={msg.text} />
                  </div>

                  <div className={`flex items-center gap-2 text-[10px] text-gray-400 px-1 ${isBot ? 'justify-between' : 'justify-end'}`}>
                    <div className="flex items-center gap-2">
                      <span>{msg.timestamp}</span>
                      {isBot && (
                        <span className="flex items-center gap-1 font-semibold text-brand-600 dark:text-brand-400">
                          <Sparkles className="w-3 h-3 text-brand-500" />
                          Live Gemini AI Response
                        </span>
                      )}
                    </div>

                    {/* Listen / Stop audio button on every Bot message */}
                    {isBot && (
                      <button
                        onClick={() => handleSpeakMessage(msg.id, msg.text)}
                        className={`px-2 py-0.5 rounded-lg border font-bold text-[10px] flex items-center gap-1 transition-all ${
                          isThisMsgSpeaking
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-800 animate-pulse'
                            : 'bg-gray-50 dark:bg-dark-card hover:bg-teal-50 dark:hover:bg-teal-950/40 text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 border-gray-200 dark:border-dark-border'
                        }`}
                        title={isThisMsgSpeaking ? "Stop listening" : "Listen to Prof. Synapse speak this explanation"}
                      >
                        {isThisMsgSpeaking ? (
                          <>
                            <Square className="w-2.5 h-2.5 fill-current" /> Stop Audio
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 text-teal-500" /> Listen
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Suggested follow-up quick buttons */}
                  {isBot && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedFollowUps.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(chip)}
                          className="px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900/80 border border-brand-200 dark:border-brand-800/60 text-brand-700 dark:text-brand-300 text-[11px] font-medium text-left flex items-center gap-1 transition-colors"
                        >
                          <Sparkles className="w-3 h-3 text-brand-500 flex-shrink-0" />
                          <span>{chip}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {loading && (
          <div className="flex items-center gap-3 animate-in fade-in duration-200">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-dark-card border border-gray-200 dark:border-dark-border text-xs text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <span className="animate-in fade-in duration-150">{loadingPhrases[loadingTextIndex]}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Live Voice Recording Status Overlay */}
      {isListening && (
        <div className="px-4 py-3 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-teal-500/10 border-t border-rose-500/30 flex items-center justify-between animate-in slide-in-from-bottom-2 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-rose-400 opacity-75"></span>
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
            </div>
            <div>
              <p className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                Listening to your voice...
              </p>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 italic">
                {interimText || 'Speak your concept or question clearly into your microphone...'}
              </p>
            </div>
          </div>

          <button
            onClick={stopListening}
            className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 active:scale-95"
          >
            Done Speaking
          </button>
        </div>
      )}

      {/* Speech Error Banner */}
      {speechError && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/60 border-t border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[11px] flex items-center gap-1.5 animate-in fade-in">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{speechError}</span>
        </div>
      )}

      {/* Input Box & Quick Toolbar */}
      <div className="p-3 pb-6 sm:pb-3 border-t border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-dark-card/50">
        
        {/* Quick prompt suggestions */}
        <div className="flex items-center gap-1.5 pb-2 overflow-x-auto text-[11px]">
          <button
            onClick={() => handleSendMessage("Can you give me an intuitive analogy for this?")}
            className="px-2 py-0.5 rounded-lg bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:text-brand-500 whitespace-nowrap flex items-center gap-1"
          >
            <Lightbulb className="w-3 h-3" /> Analogy
          </button>
          <button
            onClick={() => handleSendMessage("Show me step-by-step mathematical proof / LaTeX equations")}
            className="px-2 py-0.5 rounded-lg bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:text-brand-500 whitespace-nowrap flex items-center gap-1"
          >
            <Sigma className="w-3 h-3" /> LaTeX Proof
          </button>
          <button
            onClick={() => handleSendMessage("What are the most common mistakes students make on this in CBSE exams?")}
            className="px-2 py-0.5 rounded-lg bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:text-brand-500 whitespace-nowrap flex items-center gap-1"
          >
            <HelpCircle className="w-3 h-3" /> CBSE Mistakes
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Spoken Voice Microphone Button */}
          <button
            type="button"
            onClick={handleToggleMic}
            title={isListening ? "Stop listening" : "Speak your query out loud with microphone"}
            className={`p-2.5 rounded-xl border transition-all flex-shrink-0 active:scale-95 ${
              isListening
                ? 'bg-rose-500 text-white border-rose-600 shadow-lg shadow-rose-500/30 animate-pulse'
                : 'bg-white dark:bg-dark-surface text-gray-600 dark:text-gray-300 hover:text-brand-500 border-gray-300 dark:border-dark-border shadow-sm'
            }`}
          >
            {isListening ? (
              <MicOff className="w-4 h-4 animate-bounce" />
            ) : (
              <Mic className="w-4 h-4 text-brand-500" />
            )}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening
                ? "Listening... Speak now!"
                : `Ask StudyBot about ${activeClass?.subject || 'any CBSE concept'}...`
            }
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white shadow-md shadow-brand-500/20 transition-transform active:scale-95 flex-shrink-0"
            title="Send query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
