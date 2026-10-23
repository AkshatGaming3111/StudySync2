import React from 'react';
import { Sparkles, Atom, Code, Sigma, Binary, Compass, Orbit, Zap } from 'lucide-react';

export default function SlidingBackground({ variant = 'default' }) {
  const isLanding = variant === 'landing';

  // STEM and CS knowledge stream items for infinite marquees
  const streamTop = [
    'E = mc²',
    '∇ × B = μ₀J + μ₀ε₀(∂E/∂t)',
    '∫ eˣ dx = eˣ + C',
    'λ = h / mv',
    'e^{iπ} + 1 = 0',
    'lim_{x→0} (sin x)/x = 1',
    'O(V + E) Dijkstra',
    '∑ 1/n² = π²/6',
    'PV = nRT',
    'ΔS ≥ 0',
    'c = 299,792,458 m/s',
    'F = G(m₁m₂)/r²',
  ];

  const streamBottom = [
    'H₂O + CO₂ ⇌ H₂CO₃',
    'i² = -1',
    'sin²θ + cos²θ = 1',
    'd/dx(ln x) = 1/x',
    'pH = -log[H⁺]',
    'W = ∫ F · dr',
    'binarySearch → O(log n)',
    'τ = r × F',
    'v = f · λ',
    'ℏ = h / (2π)',
    'E_k = ½mv²',
    'Euler: V - E + F = 2',
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      
      {/* 1. Seamless Sliding Technical Grid Layer - Bold and Clearly Visible */}
      <div 
        className="absolute inset-0 bg-sliding-grid opacity-100"
      />

      {/* 2. Complementary Sliding Dot Matrix Grid */}
      <div 
        className="absolute inset-0 bg-sliding-dots opacity-80"
      />

      {/* 3. Sliding Holographic Light Beams (Diagonal Gliding Sheen) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Primary Teal Aurora Beam */}
        <div 
          className="sliding-light-beam absolute -top-1/2 -left-1/2 w-[1100px] h-[300px] bg-gradient-to-r from-transparent via-teal-400/50 via-brand-500/40 to-transparent blur-[50px] rounded-full"
        />
        {/* Secondary Indigo Beam (Offset Timing) */}
        <div 
          className="sliding-light-beam-delayed absolute -top-1/3 -left-1/3 w-[950px] h-[250px] bg-gradient-to-r from-transparent via-indigo-500/45 via-purple-500/35 to-transparent blur-[55px] rounded-full"
        />
      </div>

      {/* 4. Ambient Colored Glow Orbs (Silicon Valley Atmospheric Mesh) */}
      <div className="absolute -top-36 -left-36 w-[620px] h-[620px] bg-gradient-to-tr from-brand-500/30 via-teal-500/20 to-transparent rounded-full blur-[130px] animate-pulse-slow" />
      <div className="absolute top-1/4 -right-40 w-[650px] h-[650px] bg-gradient-to-bl from-indigo-500/28 via-purple-500/20 to-transparent rounded-full blur-[140px]" />
      <div className="absolute -bottom-40 left-1/3 w-[550px] h-[550px] bg-gradient-to-t from-emerald-500/22 via-brand-500/12 to-transparent rounded-full blur-[120px]" />

      {/* 5. Infinite Sliding Formula & Knowledge Streams (Marquees) */}
      {/* Top Stream (Leftwards Slide) */}
      <div className="absolute top-28 sm:top-36 left-0 w-full overflow-hidden opacity-35 dark:opacity-45 rotate-[-2deg] scale-105 pointer-events-none">
        <div className="sliding-marquee-left flex items-center gap-8 text-xs sm:text-sm font-mono tracking-widest text-teal-600 dark:text-teal-300 font-extrabold">
          {streamTop.concat(streamTop).map((item, idx) => (
            <span key={`top-${idx}`} className="flex items-center gap-4 whitespace-nowrap">
              <span>{item}</span>
              <span className="text-teal-400 opacity-90 text-sm">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Stream (Rightwards Slide) */}
      <div className="absolute bottom-28 sm:bottom-40 left-0 w-full overflow-hidden opacity-30 dark:opacity-40 rotate-[1.5deg] scale-105 pointer-events-none">
        <div className="sliding-marquee-right flex items-center gap-8 text-xs sm:text-sm font-mono tracking-widest text-indigo-600 dark:text-indigo-300 font-extrabold">
          {streamBottom.concat(streamBottom).map((item, idx) => (
            <span key={`bot-${idx}`} className="flex items-center gap-4 whitespace-nowrap">
              <span>{item}</span>
              <span className="text-indigo-400 opacity-90 text-sm">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* 6. Floating Drifting Academic & Science Constellation Glyphs */}
      <div className="absolute top-[16%] left-[6%] floating-element-1 text-teal-500/40 dark:text-teal-400/50">
        <Atom className="w-16 h-16 sm:w-20 sm:h-20 animate-spin-slow" />
      </div>

      <div className="absolute top-[42%] right-[8%] floating-element-2 text-indigo-500/40 dark:text-indigo-400/50">
        <Orbit className="w-20 h-20 sm:w-24 sm:h-24" />
      </div>

      <div className="absolute bottom-[20%] left-[10%] floating-element-3 text-brand-500/40 dark:text-brand-400/50">
        <Sigma className="w-14 h-14 sm:w-16 sm:h-16" />
      </div>

      <div className="absolute top-[68%] right-[20%] floating-element-1 text-purple-500/35 dark:text-purple-400/45">
        <Code className="w-12 h-12 sm:w-14 sm:h-14" />
      </div>

      <div className="absolute top-[10%] right-[24%] floating-element-2 text-amber-500/35 dark:text-amber-400/45">
        <Sparkles className="w-12 h-12" />
      </div>

      {/* 7. Tactile 2% SVG Film Grain Noise Overlay */}
      <div className="absolute inset-0 bg-noise mix-blend-overlay opacity-25 dark:opacity-35 pointer-events-none" />

    </div>
  );
}
