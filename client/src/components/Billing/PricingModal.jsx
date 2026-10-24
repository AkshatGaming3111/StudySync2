import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import ConfettiCelebration from '../Common/ConfettiCelebration';
import {
  X,
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Building2,
  Crown,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw
} from 'lucide-react';

export default function PricingModal({ isOpen, onClose }) {
  const { currentUser, refreshUser, triggerXpGain } = useAuth();

  const [currency, setCurrency] = useState('INR'); // 'INR' | 'USD'
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' | 'annual'
  const [selectedPlanId, setSelectedPlanId] = useState('pro');
  const [step, setStep] = useState('plans'); // 'plans' | 'checkout' | 'success'
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [upiId, setUpiId] = useState('student@okaxis');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelMessage, setCancelMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('plans');
      setError(null);
      setCancelMessage('');
    }
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentPlan = currentUser?.plan || 'free';

  const plans = [
    {
      id: 'free',
      name: 'Free Starter',
      badge: '🌱 Free Starter',
      popular: false,
      description: 'Ideal for trying out interactive AI study sessions and basic classes.',
      priceINR: { monthly: 0, annual: 0 },
      priceUSD: { monthly: 0, annual: 0 },
      features: [
        'Join up to 2 active classrooms',
        '10 StudyBot AI tutoring queries / day',
        'Interactive SyncBoard drawing canvas',
        'Participate in classroom streams & discussions',
        'Standard curriculum practice tests'
      ]
    },
    {
      id: 'pro',
      name: 'StudySync Pro',
      badge: '⚡ Pro Scholar',
      popular: true,
      description: 'Supercharge your daily learning with unlimited AI and exam prep.',
      priceINR: { monthly: 399, annual: 3499 },
      priceUSD: { monthly: 9, annual: 79 },
      features: [
        'Unlimited classrooms & room codes',
        'Unlimited StudyBot 3.0 queries across all personas',
        'SyncBoard Multimodal AI OCR & LaTeX formula solver',
        'Infinite AI Practice Arena & mock exam generator',
        'Interactive 3D Spaced-Repetition flashcard decks',
        'Comprehensive Parent Diagnostic Report Card (PDF)',
        'Direct priority Gemini AI streaming engine',
        'Bonus +500 XP on activation'
      ]
    },
    {
      id: 'institute',
      name: 'Institute & Academy',
      badge: '🏛️ Enterprise Partner',
      popular: false,
      description: 'For schools, coaching academies, and educators seeking full customization.',
      priceINR: { monthly: 2999, annual: 24999 },
      priceUSD: { monthly: 49, annual: 399 },
      features: [
        'Full Pro features for all affiliated teachers & classes',
        'White-Label Institute Branding (Custom Logo, Colors, Tagline)',
        'Bulk Student CSV Roster Import with 1-click account creation',
        'Teacher AI Auto-Grading Studio with custom rubric scoring',
        'Parent WhatsApp & Email progress digest dispatch',
        'Custom institute watermarking on exams & report cards',
        'Dedicated onboarding & priority 24/7 support',
        'Bonus +2,000 XP on activation'
      ]
    }
  ];

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'STUDYAI' || code === 'EARLYBIRD' || code === 'WELCOME20') {
      setDiscountPercent(20);
      setPromoMessage('🎉 20% discount applied successfully!');
    } else if (code === 'HALFOFF' || code === 'PROMO50') {
      setDiscountPercent(50);
      setPromoMessage('🔥 50% promotional discount applied!');
    } else {
      setDiscountPercent(0);
      setPromoMessage('❌ Invalid coupon code.');
    }
  };

  const getPrice = (plan) => {
    const table = currency === 'INR' ? plan.priceINR : plan.priceUSD;
    const base = billingCycle === 'annual' ? table.annual : table.monthly;
    if (discountPercent > 0 && base > 0) {
      return Math.round(base * (1 - discountPercent / 100));
    }
    return base;
  };

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[1];
  const finalPrice = getPrice(selectedPlan);
  const currencySymbol = currency === 'INR' ? '₹' : '$';

  const handleProceedToCheckout = (planId) => {
    setSelectedPlanId(planId);
    setError(null);
    setStep('checkout');
  };

  const handleCompletePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.billing.checkout({
        plan: selectedPlanId,
        planId: selectedPlanId,
        billingCycle,
        currency,
        promoCode: discountPercent > 0 ? promoCode : undefined,
        paymentMethod
      });

      if (res.success) {
        setInvoice(res.invoice);
        setStep('success');
        await refreshUser();
        if (res.bonusXp) {
          triggerXpGain({
            xpGained: res.bonusXp,
            reason: `Unlocked ${res.planName} Plan!`
          });
        }
      } else {
        setError(res.error || 'Payment failed to process');
      }
    } catch (err) {
      setError(err.message || 'Payment simulation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('Are you sure you want to turn off auto-renew? You will keep Pro access until your current billing period ends.')) {
      return;
    }
    setCancelLoading(true);
    setCancelMessage('');
    try {
      const res = await api.billing.cancel();
      if (res.success) {
        setCancelMessage('Auto-renew successfully cancelled. Your access remains active until the end of the billing term.');
        await refreshUser();
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel subscription');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl p-5 sm:p-8 my-8 text-gray-900 dark:text-gray-100 animate-in zoom-in-95 duration-200 cursor-default"
      >
        
        {/* Prominent Exit / Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 sm:top-6 right-4 sm:right-6 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs border border-gray-200 dark:border-white/10 z-10"
          title="Exit Pricing & Subscription (Esc)"
        >
          <X className="w-4 h-4" />
          <span>Exit</span>
        </button>

        {/* STEP 1: PLANS CATALOG */}
        {step === 'plans' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                <Sparkles className="w-3.5 h-3.5" /> StudySync Commercial Plans
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                Unlock Intelligent Learning Without Limits
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Choose the best plan for your academic goals or transform your entire institute with white-labeled AI.
              </p>
            </div>

            {/* Toggle Controls: Currency & Billing Interval */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-2">
              
              {/* Monthly / Annual Toggle */}
              <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-bold">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-white dark:bg-brand-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    billingCycle === 'annual'
                      ? 'bg-white dark:bg-brand-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
                  }`}
                >
                  <span>Annual</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold uppercase tracking-tight">
                    Save ~30%
                  </span>
                </button>
              </div>

              {/* Currency Toggle */}
              <div className="flex items-center p-1 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-bold">
                <button
                  onClick={() => setCurrency('INR')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    currency === 'INR'
                      ? 'bg-white dark:bg-brand-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  ₹ INR (India)
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    currency === 'USD'
                      ? 'bg-white dark:bg-brand-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  $ USD (Global)
                </button>
              </div>
            </div>

            {/* Plan Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {plans.map((plan) => {
                const isCurrent = currentPlan === plan.id;
                const price = getPrice(plan);

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 ${
                      plan.popular
                        ? 'bg-gradient-to-b from-brand-500/10 via-indigo-500/5 to-transparent border-2 border-brand-500 shadow-xl shadow-brand-500/10'
                        : 'bg-gray-50/50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-brand-500 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                        Most Popular
                      </span>
                    )}

                    <div className="space-y-4">
                      {/* Title & Badge */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-base text-gray-900 dark:text-white">{plan.name}</h3>
                        <span className="text-xs font-mono font-bold text-brand-500">{plan.badge}</span>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400 min-h-[32px]">
                        {plan.description}
                      </p>

                      {/* Pricing Display */}
                      <div className="pt-2 pb-2">
                        {plan.id === 'free' ? (
                          <div className="text-2xl font-black text-gray-900 dark:text-white">Free Forever</div>
                        ) : (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                              {currencySymbol}{price.toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-400 font-semibold">
                              / {billingCycle === 'annual' ? 'year' : 'month'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Features Checklist */}
                      <div className="space-y-2 border-t border-gray-100 dark:border-white/10 pt-3">
                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Includes:</p>
                        {plan.features.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                            <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-6">
                      {isCurrent ? (
                        <div className="w-full py-2.5 rounded-2xl bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-bold text-center flex items-center justify-center gap-1.5 select-none">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Current Plan
                        </div>
                      ) : (
                        <button
                          onClick={() => handleProceedToCheckout(plan.id)}
                          className={`w-full py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 ${
                            plan.popular
                              ? 'bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white shadow-brand-500/20'
                              : 'bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900'
                          }`}
                        >
                          <span>{plan.id === 'free' ? 'Switch to Starter' : `Upgrade to ${plan.name}`}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Subscription Management */}
            {currentUser?.subscription && (
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-200">
                    Active Subscription: <span className="text-brand-500 uppercase">{currentUser.subscription.planId}</span> ({currentUser.subscription.billingCycle})
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Auto-renew status: {currentUser.subscription.autoRenew ? 'Active' : 'Cancelled at period end'}
                  </p>
                </div>

                {currentUser.subscription.autoRenew && (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={cancelLoading}
                    className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold transition-colors disabled:opacity-50"
                  >
                    {cancelLoading ? 'Cancelling...' : 'Turn off Auto-Renew'}
                  </button>
                )}
              </div>
            )}

            {cancelMessage && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-300 text-xs">
                {cancelMessage}
              </div>
            )}

            {/* Bottom Exit Bar for Plans Step */}
            <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-gray-500 dark:text-gray-400">
                Want to continue with your current plan?
              </span>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-700 dark:text-gray-200 font-bold transition-colors flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>Exit & Return to Classroom</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: INSTANT CHECKOUT PANEL */}
        {step === 'checkout' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-500 font-mono">
                Safe & Instant Checkout Simulation
              </span>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                Confirm {selectedPlan.name}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enjoy immediate activation with sandbox test payment simulation.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Order Summary Box */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Plan & Billing:</span>
                <span className="font-bold text-gray-900 dark:text-white capitalize">
                  {selectedPlan.name} • {billingCycle}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Subtotal:</span>
                <span className="font-mono text-gray-800 dark:text-gray-200">
                  {currencySymbol}{getPrice(selectedPlan).toLocaleString()}
                </span>
              </div>

              {discountPercent > 0 && (
                <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Coupon Discount ({discountPercent}% OFF):</span>
                  <span>-{currencySymbol}{Math.round((getPrice(selectedPlan) * (discountPercent / 100))).toLocaleString()}</span>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-white/10 pt-2 flex items-center justify-between text-sm font-black">
                <span>Total Due Today:</span>
                <span className="text-lg font-mono text-brand-600 dark:text-brand-400">
                  {currencySymbol}{finalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Have a coupon code?</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Try STUDYAI or EARLYBIRD"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-xs font-bold transition-colors"
                >
                  Apply
                </button>
              </div>
              {promoMessage && (
                <p className={`text-[11px] font-semibold ${discountPercent > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {promoMessage}
                </p>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                      : 'border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                      : 'border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>UPI / GPay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400'
                      : 'border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>NetBanking</span>
                </button>
              </div>

              {/* Payment Details Input */}
              {paymentMethod === 'card' && (
                <div className="p-3 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-2 mt-2">
                  <div className="flex items-center justify-between text-xs font-mono text-gray-500">
                    <span>Card Number</span>
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-transparent font-mono text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none"
                  />
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="p-3 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-1 mt-2">
                  <span className="text-[10px] font-bold text-gray-400">Virtual Payment Address (VPA)</span>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-transparent font-mono text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep('plans')}
                  className="w-1/3 py-2.5 rounded-2xl border border-gray-200 dark:border-white/10 text-xs font-bold hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  ← Back to Plans
                </button>
                <button
                  type="button"
                  onClick={handleCompletePayment}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-brand-500 via-teal-500 to-indigo-600 hover:from-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Pay {currencySymbol}{finalPrice.toLocaleString()} & Activate</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors inline-flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel and Exit to Classroom</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS ANIMATION & INVOICE RECEIPT */}
        {step === 'success' && (
          <div className="max-w-md mx-auto text-center space-y-4 py-4 animate-in zoom-in-95 duration-200">
            <ConfettiCelebration trigger={true} />

            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-white mx-auto flex items-center justify-center shadow-xl shadow-emerald-500/30">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Upgrade Complete</span>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                Welcome to {selectedPlan.name}!
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Your account has been upgraded with full access to all commercial tools and pedagogical intelligence.
              </p>
            </div>

            {invoice && (
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 text-left text-xs space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-400">Transaction ID:</span>
                  <span className="font-bold text-brand-500 truncate max-w-[160px]">{invoice.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Plan:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{invoice.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount Paid:</span>
                  <span className="font-bold text-emerald-500">{invoice.currency === 'INR' ? '₹' : '$'}{invoice.amount}</span>
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-transform active:scale-98"
            >
              Start Exploring My New Superpowers 🚀
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
