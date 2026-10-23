const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { verifyToken, optionalAuth } = require('../middleware/auth');
const { sanitizeUser } = require('../services/authHelper');

// Commercial Tier Plans Catalog
const PLANS = {
  free: {
    id: 'free',
    name: 'Free Starter',
    badge: '🌱 Free',
    priceINR: { monthly: 0, annual: 0 },
    priceUSD: { monthly: 0, annual: 0 },
    limits: {
      maxClasses: 2,
      aiQueriesPerDay: 10,
      aiWhiteboardOCR: false,
      aiQuizGenerator: true, // basic templates
      aiAutoGradingStudio: false,
      instituteBranding: false,
      bulkStudentImport: false,
      parentDigestReports: false
    },
    features: [
      'Join up to 2 active classrooms',
      '10 StudyBot AI tutoring queries / day',
      'Interactive SyncBoard drawing canvas',
      'Participate in classroom streams & discussions',
      'Standard curriculum practice tests'
    ]
  },
  pro: {
    id: 'pro',
    name: 'StudySync Pro',
    badge: '⚡ Pro Scholar',
    popular: true,
    priceINR: { monthly: 399, annual: 3499 }, // ~27% off annual
    priceUSD: { monthly: 9, annual: 79 },
    limits: {
      maxClasses: Infinity,
      aiQueriesPerDay: Infinity,
      aiWhiteboardOCR: true,
      aiQuizGenerator: true,
      aiAutoGradingStudio: true,
      instituteBranding: false,
      bulkStudentImport: false,
      parentDigestReports: true
    },
    features: [
      'Unlimited virtual classrooms & room codes',
      'Unlimited StudyBot 3.0 queries across all personas',
      'Full SyncBoard Multimodal AI OCR & LaTeX extraction',
      'Infinite AI Practice Arena & mock exam generator',
      'Interactive 3D Spaced-Repetition flashcard decks',
      'Comprehensive Parent Diagnostic Report Card (Print/PDF)',
      'Direct priority Gemini AI streaming engine'
    ]
  },
  institute: {
    id: 'institute',
    name: 'Institute & Academy License',
    badge: '🏛️ Enterprise',
    priceINR: { monthly: 2999, annual: 24999 }, // ~30% off annual
    priceUSD: { monthly: 49, annual: 399 },
    limits: {
      maxClasses: Infinity,
      aiQueriesPerDay: Infinity,
      aiWhiteboardOCR: true,
      aiQuizGenerator: true,
      aiAutoGradingStudio: true,
      instituteBranding: true,
      bulkStudentImport: true,
      parentDigestReports: true
    },
    features: [
      'Full Pro features for all affiliated teachers & classes',
      'White-Label Institute Branding (Custom Logo, Colors, Tagline)',
      'Bulk Student CSV Roster Import with 1-click account creation',
      'Teacher AI Auto-Grading Studio with custom rubric scoring',
      'Automated Parent WhatsApp & Email progress digest alerts',
      'Custom institute watermarking on report cards & exams',
      'Dedicated enterprise onboarding & priority support'
    ]
  }
};

// 1. Get Subscription Plans & Pricing Catalog (Public)
router.get('/plans', (req, res) => {
  res.json({
    success: true,
    plans: PLANS,
    currencyDefaults: {
      domestic: 'INR',
      international: 'USD'
    }
  });
});

// 2. Get User Subscription Status & Daily Usage (Authenticated)
router.get('/status', verifyToken, (req, res) => {
  const user = store.findById('users', req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  const currentPlan = user.plan || 'free';
  const planDetails = PLANS[currentPlan] || PLANS.free;

  // Check and reset daily AI queries count if date changed
  const today = new Date().toISOString().slice(0, 10);
  const usage = user.usage || { aiQueriesToday: 0, lastResetDate: today };
  if (usage.lastResetDate !== today) {
    usage.aiQueriesToday = 0;
    usage.lastResetDate = today;
    store.update('users', user.id, { usage });
  }

  res.json({
    success: true,
    plan: currentPlan,
    planDetails,
    subscription: user.subscription || {
      plan: currentPlan,
      status: 'active',
      billingCycle: 'monthly',
      expiresAt: null
    },
    institute: user.institute || null,
    usage: {
      aiQueriesToday: usage.aiQueriesToday,
      aiQueriesLimit: planDetails.limits.aiQueriesPerDay,
      remainingQueries: planDetails.limits.aiQueriesPerDay === Infinity 
        ? 'Unlimited' 
        : Math.max(0, planDetails.limits.aiQueriesPerDay - usage.aiQueriesToday)
    }
  });
});

// 3. Process Checkout & Upgrade Subscription (Authenticated)
router.post('/checkout', verifyToken, (req, res) => {
  const { plan, billingCycle = 'monthly', currency = 'INR', paymentMethod = 'card' } = req.body;

  if (!plan || !PLANS[plan]) {
    return res.status(400).json({ success: false, error: 'Valid plan (pro, institute) is required.' });
  }

  const user = store.findById('users', req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  const selectedPlan = PLANS[plan];
  const amount = currency === 'USD' 
    ? selectedPlan.priceUSD[billingCycle] 
    : selectedPlan.priceINR[billingCycle];

  const now = new Date();
  const expiresAt = new Date();
  if (billingCycle === 'annual') {
    expiresAt.setFullYear(now.getFullYear() + 1);
  } else {
    expiresAt.setMonth(now.getMonth() + 1);
  }

  const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const subscription = {
    plan,
    status: 'active',
    billingCycle,
    currency,
    amount,
    paymentMethod,
    transactionId,
    startedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    renewsAt: expiresAt.toISOString()
  };

  // Bonus XP on upgrading
  const bonusXP = plan === 'institute' ? 500 : 250;
  store.awardXP(user.id, bonusXP, `Upgraded to ${selectedPlan.name}!`);

  // Award Founder or Sponsor badge
  const badges = new Set(user.badges || []);
  if (plan === 'pro') badges.add('b_pro_scholar');
  if (plan === 'institute') badges.add('b_institute_leader');

  const updatedUser = store.update('users', user.id, {
    plan,
    subscription,
    badges: Array.from(badges)
  });

  res.json({
    success: true,
    message: `Congratulations! You have upgraded to ${selectedPlan.name}.`,
    plan,
    subscription,
    user: sanitizeUser(updatedUser, true),
    invoice: {
      transactionId,
      amount,
      currency,
      date: now.toISOString(),
      planName: selectedPlan.name,
      billingCycle
    }
  });
});

// 4. Cancel / Manage Subscription Auto-renew
router.post('/cancel', verifyToken, (req, res) => {
  const user = store.findById('users', req.user.id);
  if (!user || !user.subscription) {
    return res.status(400).json({ success: false, error: 'No active subscription found.' });
  }

  const updatedSubscription = {
    ...user.subscription,
    status: 'cancelled_at_period_end',
    autoRenew: false
  };

  store.update('users', user.id, { subscription: updatedSubscription });

  res.json({
    success: true,
    message: 'Subscription auto-renew cancelled. Your Pro benefits remain active until the end of your billing cycle.',
    subscription: updatedSubscription
  });
});

// 5. Update Institute White-Labeling Branding (Institute Tier Teachers / Admins)
router.post('/institute/branding', verifyToken, (req, res) => {
  const user = store.findById('users', req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  // Verify institute tier or permit custom teacher branding
  const { instituteName, logoUrl, brandColor, tagline, website, contactEmail } = req.body;

  if (!instituteName || !instituteName.trim()) {
    return res.status(400).json({ success: false, error: 'Institute name is required.' });
  }

  const instituteConfig = {
    id: user.institute?.id || `inst_${Date.now()}`,
    name: instituteName.trim(),
    logoUrl: logoUrl ? logoUrl.trim() : (user.institute?.logoUrl || ''),
    brandColor: brandColor || user.institute?.brandColor || '#4F46E5', // Indigo default
    tagline: tagline ? tagline.trim() : '',
    website: website ? website.trim() : '',
    contactEmail: contactEmail ? contactEmail.trim() : user.email,
    updatedAt: new Date().toISOString()
  };

  // Update user with institute configuration
  const updatedUser = store.update('users', user.id, {
    institute: instituteConfig
  });

  // Automatically propagate branding to all classes created by this instructor
  const classes = store.get('classes');
  classes.forEach(c => {
    if (c.teacherId === user.id) {
      store.update('classes', c.id, {
        institute: instituteConfig
      });
    }
  });

  res.json({
    success: true,
    message: 'Institute white-label branding updated successfully!',
    institute: instituteConfig,
    user: sanitizeUser(updatedUser, true)
  });
});

module.exports = router;
module.exports.PLANS = PLANS;
