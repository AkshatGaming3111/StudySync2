import React from 'react';
import {
  Sparkles,
  GraduationCap,
  Brain,
  Bot,
  FileCheck2,
  PenTool,
  Trophy,
  Timer,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Zap,
  Flame,
  ShieldCheck,
  Users,
  Layers,
  Code,
  Sigma,
  ChevronRight,
  Mic,
  Headphones,
  Building2,
  Check,
  CreditCard
} from 'lucide-react';
import LaTeXRenderer from '../components/Common/LaTeXRenderer';
import SlidingBackground from '../components/Common/SlidingBackground';

export default function LandingPage({ onOpenAuth, onOpenSignIn, onOpenRegister }) {
  React.useEffect(() => {
    if (window.location.hash === '#pricing' || window.location.pathname === '/pricing') {
      const el = document.getElementById('pricing');
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 150);
      }
    }
  }, []);

  // Flagship live capabilities sliding showcase
  const slidingHighlights = [
    {
      icon: Mic,
      title: 'Socratic AI Voice Tutor',
      tag: 'Web Speech API',
      desc: 'Spoken interactive pedagogical dialogue with Prof. Synapse',
      color: 'from-teal-500 to-emerald-500'
    },
    {
      icon: PenTool,
      title: 'SyncBoard Smart Canvas',
      tag: 'AI Vision Board',
      desc: 'Real-time collaborative whiteboard with sketch-to-notes AI conversion',
      color: 'from-amber-500 to-orange-500'
    },
    {
      icon: FileCheck2,
      title: 'AI Rubric Auto-Grading',
      tag: 'Instant Feedback',
      desc: 'Evaluates homework against criteria with pre-submission hint checks',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Timer,
      title: 'Timed Exam Arena',
      tag: 'Diagnostic Testing',
      desc: 'Simulated examination environments with instant question reviews',
      color: 'from-rose-500 to-pink-500'
    },
    {
      icon: Headphones,
      title: 'Podcast-Style Audio Notes',
      tag: '0.8x - 1.5x Speeds',
      desc: 'Synchronous highlighted speech for revision on the go',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Trophy,
      title: 'Dynamic Leaderboards',
      tag: 'Daily Streaks & XP',
      desc: 'Class, cohort & global rankings with 12+ achievement badges',
      color: 'from-yellow-400 to-amber-500'
    },
    {
      icon: Sigma,
      title: 'KaTeX Mathematical Proofs',
      tag: 'LaTeX Engine',
      desc: 'Renders complex calculus, algebra, and physics derivations flawlessly',
      color: 'from-teal-400 to-indigo-500'
    },
    {
      icon: GraduationCap,
      title: 'Teacher & Student Portals',
      tag: 'Role Verification',
      desc: 'Secure room codes, instant roster management, and gradebooks',
      color: 'from-indigo-500 to-violet-500'
    }
  ];

  // Top continuous knowledge and feature marquee
  const tickerItems = [
    '🎙️ Multimodal AI Voice Tutor Live',
    '📐 SyncBoard Smart Whiteboard with AI Vision',
    '⚡ KaTeX Math & Science Formula Rendering',
    '📝 1-Click Rubric Homework Auto-Grading',
    '🎧 Podcast-Style Audio Lecture Summarizer',
    '⏱️ Timed Examination Simulator Arena',
    '🏆 Real-Time Global, Cohort & Class Leaderboards',
    '🔒 Strict Class & Section Account Security'
  ];

  const features = [
    {
      icon: GraduationCap,
      color: 'from-blue-500 to-indigo-600',
      title: 'Virtual Classrooms & Stream',
      description: 'Create and join rooms with simple 6-character codes. Broadcast announcements, engage in discussions with LaTeX math, and share resources.'
    },
    {
      icon: Bot,
      color: 'from-teal-500 to-brand-600',
      title: 'StudyBot 3.0 (AI Co-Pilot)',
      description: 'In-class multi-persona AI tutor offering Socratic step-by-step derivations, code analysis, and real-world intuitive analogies.'
    },
    {
      icon: PenTool,
      color: 'from-amber-500 to-orange-600',
      title: 'SyncBoard Smart Whiteboard',
      description: 'Interactive digital canvas with shapes, ink, and instant AI Vision analysis that converts your sketches into structured lecture notes.'
    },
    {
      icon: FileCheck2,
      color: 'from-purple-500 to-indigo-600',
      title: 'Homework Studio & AI Grading',
      description: 'Teachers auto-grade assignments against rubrics in seconds. Students run AI Pre-checks for clarity hints before submission.'
    },
    {
      icon: Brain,
      color: 'from-pink-500 to-rose-600',
      title: 'AI Examination Arena',
      description: 'Generate comprehensive timed tests on any curriculum. Focus exam simulator with instant question-by-question diagnostic review.'
    },
    {
      icon: Trophy,
      color: 'from-yellow-400 to-amber-600',
      title: 'Dynamic Leaderboards & Badges',
      description: 'Gamify education with real-time class rankings, XP progression, daily streak multipliers, and 12+ unlockable achievement badges.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-brand-500 selection:text-white relative">
      
      {/* Dynamic Sliding Background Matrix & Knowledge Stream */}
      <SlidingBackground variant="landing" />

      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-400 via-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-teal-400 via-brand-400 to-indigo-400 bg-clip-text text-transparent">
                StudySync
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-brand-950 text-brand-400 border border-brand-800/60">
                AI Interactive Classroom
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="#pricing"
              className="hidden sm:inline-block px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
            >
              Pricing & Plans
            </a>
            <button
              onClick={() => onOpenSignIn ? onOpenSignIn() : onOpenAuth('login')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-white/5 border border-white/10 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenRegister ? onOpenRegister() : onOpenAuth('register')}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 shadow-md shadow-brand-500/20 active:scale-95 transition-all"
            >
              Create Account
            </button>
          </div>
        </div>
      </nav>

      {/* Live Curriculum & Capabilities Sliding Announcement Ticker */}
      <div className="relative border-b border-white/10 bg-brand-950/30 backdrop-blur-md overflow-hidden py-2.5 pause-on-hover">
        <div className="sliding-marquee-left flex items-center gap-10 text-[11px] font-mono tracking-wider text-teal-300 font-bold uppercase select-none">
          {tickerItems.concat(tickerItems).map((item, i) => (
            <span key={i} className="flex items-center gap-4 whitespace-nowrap">
              <span className="text-teal-400">⚡</span>
              <span>{item}</span>
              <span className="text-indigo-400">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-8 max-w-7xl mx-auto text-center space-y-8">
        
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-brand-400 backdrop-blur-md shadow-inner">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>Next-Generation Virtual Learning Platform • Powered by AI</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-5xl mx-auto leading-[1.15]">
          Empowering Teachers.{' '}
          <span className="bg-gradient-to-r from-teal-400 via-brand-400 to-indigo-400 bg-clip-text text-transparent">
            Accelerating Students.
          </span>{' '}
          Inside One Intelligent Classroom.
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-normal">
          StudySync unites virtual classrooms, smart AI whiteboards, instant rubric auto-grading, timed examination arenas, and real-time leaderboards into one seamless, sophisticated experience.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onOpenRegister ? onOpenRegister() : onOpenAuth('register')}
            className="px-8 py-4 rounded-2xl text-sm font-extrabold text-white bg-gradient-to-r from-teal-500 via-brand-500 to-indigo-600 hover:opacity-95 shadow-xl shadow-brand-500/30 active:scale-95 transition-transform flex items-center gap-2"
          >
            <span>Create Your Account Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenSignIn ? onOpenSignIn() : onOpenAuth('login')}
            className="px-8 py-4 rounded-2xl text-sm font-extrabold text-gray-200 bg-white/5 hover:bg-white/10 border border-white/15 active:scale-95 transition-all flex items-center gap-2"
          >
            <span>Sign In to Classroom</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Quick Credentials Info Box */}
        <div className="pt-6 max-w-lg mx-auto">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-300 flex items-center justify-center gap-2 text-center">
            <ShieldCheck className="w-4 h-4 text-brand-400 flex-shrink-0" />
            <span>Sign in is strictly verified using your <strong>Registered Email, Password, Class, and Section</strong>.</span>
          </div>
        </div>

        {/* Infinite Sliding Flagship Capabilities Showcase */}
        <div className="pt-8 pb-2 w-full overflow-hidden pause-on-hover relative">
          {/* Subtle side fade masks for smooth infinity edges */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-r from-gray-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-l from-gray-900 to-transparent z-10 pointer-events-none" />

          <div className="sliding-showcase-track flex items-center gap-4 py-2">
            {slidingHighlights.concat(slidingHighlights).map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="w-72 sm:w-80 flex-shrink-0 p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-brand-500/50 backdrop-blur-xl transition-all duration-300 text-left space-y-2.5 group specular-card"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-brand-300">
                      {card.tag}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hero Interactive Workspace Preview Card */}
        <div className="pt-10 max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-gradient-to-b from-gray-800/80 to-gray-900/90 backdrop-blur-2xl p-6 sm:p-8 text-left space-y-6">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono text-gray-400">StudySync AI Virtual Classroom</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-brand-400 bg-brand-950/60 px-3 py-1 rounded-xl border border-brand-800/50">
                <Sparkles className="w-3 h-3" /> Live Pedagogical Engine
              </div>
            </div>

            {/* Mock classroom preview grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              {/* Card 1 */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">AI Co-Pilot In-Class</span>
                <h4 className="font-bold text-sm text-white">Socratic Math & Science Solver</h4>
                <div className="text-gray-400 text-[11px] leading-relaxed font-mono">
                  <LaTeXRenderer content="\\( \\mathcal{O}((V + E) \\log V) \\) step-by-step proofs rendered with KaTeX." />
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Homework Studio</span>
                <h4 className="font-bold text-sm text-white">AI Rubric Auto-Grading</h4>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Evaluates state transitions, Big-O proofs, and assigns scores with constructive feedback.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">SyncBoard Canvas</span>
                <h4 className="font-bold text-sm text-white">Smart Vision Board</h4>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  Extracts formulas and creates flashcards directly from digital whiteboard drawings.
                </p>
              </div>

            </div>

          </div>
        </div>

      </section>

      {/* Core Features Grid */}
      <section className="py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-400">Everything You Need</span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Built for Modern Virtual Learning
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            A comprehensive suite of tools designed to make online and hybrid education engaging, rigorous, and rewarding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-brand-500/40 transition-all duration-200 space-y-4 group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white pt-1">{feat.title}</h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Teachers vs Students Dual Section */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto border-t border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* For Teachers */}
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-gray-900 to-gray-900 border border-indigo-500/30 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-600 text-white shadow-md">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">For Educators & Instructors</span>
                <h3 className="text-2xl font-black text-white">Teach Smarter, Not Harder</h3>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs sm:text-sm text-gray-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span><strong>Instant Classroom Creation:</strong> Generate 6-character room codes and manage your student roster effortlessly.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span><strong>AI Rubric Auto-Grading:</strong> Cut grading time by 80% while providing personalized, criterion-based feedback.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span><strong>AI Test Generator:</strong> Create balanced multiple-choice and short-answer exams on any subject in seconds.</span>
              </li>
            </ul>

            <button
              onClick={() => onOpenRegister ? onOpenRegister() : onOpenAuth('register')}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
            >
              Sign Up as Teacher
            </button>
          </div>

          {/* For Students */}
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-teal-950/40 via-gray-900 to-gray-900 border border-brand-500/30 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-brand-500 text-white shadow-md">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-brand-400 uppercase tracking-wider">For Students & Learners</span>
                <h3 className="text-2xl font-black text-white">Master Concepts with Confidence</h3>
              </div>
            </div>

            <ul className="space-y-3.5 text-xs sm:text-sm text-gray-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                <span><strong>24/7 Socratic AI Co-Pilot:</strong> Ask StudyBot to solve problems step-by-step or simplify difficult theories.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                <span><strong>Gamified Motivation:</strong> Earn XP, level up, maintain daily study streaks, and unlock achievement badges.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                <span><strong>AI Exam Arena & Flashcards:</strong> Test yourself in timed exam simulations with detailed diagnostic explanations.</span>
              </li>
            </ul>

            <button
              onClick={() => onOpenRegister ? onOpenRegister() : onOpenAuth('register')}
              className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-white font-bold text-xs shadow-md shadow-brand-500/20 active:scale-95 transition-all"
            >
              Sign Up as Student
            </button>
          </div>

        </div>
      </section>

      {/* Commercial Pricing Plans Section */}
      <section id="pricing" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-white/10 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-400">
            Commercial Tier Plans
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Predictable, Transparent Academic Pricing
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            Start free or empower your entire coaching institute with full white-labeled branding and unlimited intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Plan 1: Free Starter */}
          <div className="p-8 rounded-3xl bg-gray-900/60 border border-white/10 flex flex-col justify-between space-y-6 hover:border-white/20 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white">Free Starter</h3>
                <span className="text-xs font-mono font-bold text-gray-400">🌱 Free</span>
              </div>
              <p className="text-xs text-gray-400">
                Ideal for exploring smart classrooms and participating in live lectures.
              </p>
              <div className="pt-2">
                <span className="text-3xl font-black text-white">₹0</span>
                <span className="text-xs text-gray-500 font-semibold"> / forever</span>
              </div>
              <ul className="space-y-2.5 border-t border-white/10 pt-4 text-xs text-gray-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Join up to 2 active classrooms</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> 10 StudyBot AI queries / day</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Interactive SyncBoard drawing canvas</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Class streams, homework & exams</li>
              </ul>
            </div>
            <button
              onClick={() => onOpenRegister ? onOpenRegister() : onOpenAuth('register')}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
            >
              Get Started Free
            </button>
          </div>

          {/* Plan 2: Pro Scholar */}
          <div className="relative p-8 rounded-3xl bg-gradient-to-b from-brand-500/20 via-indigo-500/10 to-gray-900 border-2 border-brand-500 shadow-2xl shadow-brand-500/20 flex flex-col justify-between space-y-6">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-brand-500 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
              Most Popular
            </span>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white">StudySync Pro</h3>
                <span className="text-xs font-mono font-bold text-amber-400">⚡ Pro Scholar</span>
              </div>
              <p className="text-xs text-gray-400">
                Unlimited AI tutoring, LaTeX formula solving, and certified parent diagnostic cards.
              </p>
              <div className="pt-2">
                <span className="text-3xl font-black text-white">₹399</span>
                <span className="text-xs text-gray-400 font-semibold"> / month</span>
                <span className="block text-[11px] text-emerald-400 font-bold mt-0.5">₹3,499 / year (Save 27%)</span>
              </div>
              <ul className="space-y-2.5 border-t border-white/10 pt-4 text-xs text-gray-200">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Unlimited virtual classrooms</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Unlimited StudyBot AI 24/7</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> SyncBoard Multimodal AI OCR & LaTeX</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Infinite AI Exam Arena mock tests</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Parent Diagnostic Report Card (PDF)</li>
              </ul>
            </div>
            <button
              onClick={() => onOpenRegister ? onOpenRegister() : onOpenAuth('register')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 active:scale-95 transition-all"
            >
              Start Pro Experience
            </button>
          </div>

          {/* Plan 3: Institute & Academy */}
          <div className="p-8 rounded-3xl bg-gray-900/60 border border-white/10 flex flex-col justify-between space-y-6 hover:border-white/20 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white">Institute & Academy</h3>
                <span className="text-xs font-mono font-bold text-indigo-400">🏛️ Enterprise</span>
              </div>
              <p className="text-xs text-gray-400">
                Complete white-label solution with custom academy logo, branding, and CSV student onboarding.
              </p>
              <div className="pt-2">
                <span className="text-3xl font-black text-white">₹2,999</span>
                <span className="text-xs text-gray-400 font-semibold"> / month</span>
                <span className="block text-[11px] text-emerald-400 font-bold mt-0.5">₹24,999 / year (Save ~30%)</span>
              </div>
              <ul className="space-y-2.5 border-t border-white/10 pt-4 text-xs text-gray-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Full Pro features for all faculty</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> White-Label Institute Branding (Logo, Colors)</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> 1-Click CSV Bulk Student Roster Import</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Automated Parent WhatsApp Progress Alert</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Official Certified Report Watermarking</li>
              </ul>
            </div>
            <button
              onClick={() => onOpenRegister ? onOpenRegister() : onOpenAuth('register')}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-colors"
            >
              Get Institute License
            </button>
          </div>

        </div>
      </section>

      {/* Footer Banner */}
      <footer className="border-t border-white/10 py-12 px-4 sm:px-8 text-center text-xs text-gray-500 space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-gray-300">StudySync – AI Interactive Classroom</span>
        </div>
        <p className="max-w-md mx-auto text-gray-400">
          The all-in-one educational platform engineered for virtual classrooms, smart whiteboard collaboration, AI grading, and gamified academic excellence.
        </p>
        <p>© 2026 StudySync. All rights reserved.</p>
      </footer>

    </div>
  );
}
