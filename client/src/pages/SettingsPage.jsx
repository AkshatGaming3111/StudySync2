import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCommercial } from '../context/CommercialContext';
import { api } from '../services/api';
import {
  Settings,
  Key,
  Database,
  User,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCcw,
  Shield,
  Bot,
  Trash2,
  Building2,
  CreditCard,
  FileText,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function SettingsPage() {
  const { currentUser, isTeacher, updateProfile, deleteAccount, triggerXpGain, refreshUser } = useAuth();
  const { openPricing, openReport } = useCommercial();

  const [apiKey, setApiKey] = useState(currentUser?.geminiApiKey || localStorage.getItem('studysync_gemini_key') || '');
  const [hasKey, setHasKey] = useState(!!(currentUser?.geminiApiKey || localStorage.getItem('studysync_gemini_key')));
  const [keyStatusMsg, setKeyStatusMsg] = useState('');
  const [savingKey, setSavingKey] = useState(false);

  const [name, setName] = useState(currentUser?.name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Institute White-Labeling state
  const [instituteName, setInstituteName] = useState(currentUser?.institute?.name || '');
  const [logoUrl, setLogoUrl] = useState(currentUser?.institute?.logoUrl || '');
  const [brandColor, setBrandColor] = useState(currentUser?.institute?.brandColor || '#4F46E5');
  const [tagline, setTagline] = useState(currentUser?.institute?.tagline || '');
  const [website, setWebsite] = useState(currentUser?.institute?.website || '');
  const [contactEmail, setContactEmail] = useState(currentUser?.institute?.contactEmail || currentUser?.email || '');
  const [savingBranding, setSavingBranding] = useState(false);
  const [brandingMsg, setBrandingMsg] = useState('');

  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    async function checkKey() {
      try {
        const res = await api.ai.getApiKeyStatus();
        if (res.success && res.hasKey) {
          setHasKey(true);
        } else if (currentUser?.geminiApiKey || localStorage.getItem('studysync_gemini_key')) {
          setHasKey(true);
        }
      } catch (e) {
        console.error('Failed to get key status:', e);
      }
    }
    checkKey();
  }, [currentUser]);

  const handleSaveKey = async (e) => {
    e.preventDefault();
    setSavingKey(true);
    try {
      const cleanKey = apiKey.trim();
      localStorage.setItem('studysync_gemini_key', cleanKey);
      
      // Save to student profile in database
      if (currentUser?.id) {
        await updateProfile({
          geminiApiKey: cleanKey
        });
      }

      // Also notify backend AI engine
      const res = await api.ai.setApiKey(cleanKey);
      setHasKey(!!cleanKey);
      setKeyStatusMsg(cleanKey ? 'Google Gemini API Key securely linked to your account!' : 'API key cleared. Using built-in pedagogical engine.');
      
      if (cleanKey) {
        triggerXpGain({
          xpGained: 50,
          reason: 'Connected personal Google Gemini API Key'
        });
      }

      setTimeout(() => setKeyStatusMsg(''), 4000);
    } catch (err) {
      console.error('Save key error:', err);
    } finally {
      setSavingKey(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        name: name.trim(),
        bio: bio.trim()
      });
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => setProfileMsg(''), 3500);
    } catch (err) {
      console.error('Save profile error:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveBranding = async (e) => {
    e.preventDefault();
    setSavingBranding(true);
    setBrandingMsg('');
    try {
      const res = await api.billing.updateInstituteBranding({
        instituteName,
        logoUrl,
        brandColor,
        tagline,
        website,
        contactEmail
      });
      if (res.success) {
        setBrandingMsg('Institute branding saved and propagated across all classrooms!');
        await refreshUser();
        setTimeout(() => setBrandingMsg(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update institute branding');
    } finally {
      setSavingBranding(false);
    }
  };

  const handleResetDatabase = async () => {
    if (!isTeacher) {
      alert('Database reset is restricted to teacher accounts only.');
      return;
    }
    if (!window.confirm('Reset all demo data (classes, assignments, quizzes, XP) back to clean initial state?')) {
      return;
    }
    setResetting(true);
    try {
      const res = await api.leaderboards.resetDB();
      if (res.success) {
        setResetMsg('Database reset to initial demo seeds. Refreshing page...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (e) {
      console.error('Reset error:', e);
      setResetMsg(e.message || 'Failed to reset database.');
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;

    const confirmed = window.confirm(
      `⚠️ PERMANENT ACCOUNT DELETION\n\nAre you sure you want to delete your account (${currentUser.name})?\n\nThis will permanently delete your account, enrolled classrooms, homework submissions, test histories, and all accumulated XP. This action CANNOT be undone.\n\nClick OK to permanently delete your account.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setDeleteError('');

    try {
      await deleteAccount();
    } catch (err) {
      console.error('Failed to delete account:', err);
      setDeleteError(err.message || 'Failed to delete account. Please try again.');
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-xs">
      
      {/* Header */}
      <div className="p-5 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm">
        <h3 className="font-extrabold text-base text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-500" /> Platform Settings & AI Engine Configuration
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mt-0.5">
          Configure AI intelligence providers and manage user profile data{isTeacher ? ', and reset mock seeds' : ''}
        </p>
      </div>

      {/* Gemini API Key Configuration Box */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-brand-500/10 via-indigo-500/5 to-white dark:to-dark-card border border-brand-500/30 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                Google Gemini API Key
                {hasKey ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    Live Gemini Active
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                    Built-in AI Engine Active
                  </span>
                )}
              </h4>
              <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">
                Optional: Provide your Google Gemini API key to enable live cloud model generation, or rely on the built-in pedagogical engine.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveKey} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              disabled={savingKey}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-md shadow-brand-500/20 active:scale-95 disabled:opacity-50"
            >
              {savingKey ? 'Saving...' : 'Update Key'}
            </button>
          </div>
          {keyStatusMsg && (
            <p className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> {keyStatusMsg}
            </p>
          )}
        </form>
      </div>

      {/* User Profile Box */}
      <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm space-y-4">
        <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-brand-500" /> Active Profile Customization
        </h4>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-brand-500 shadow-md"
            />
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-sm">{currentUser?.name}</p>
              <p className="text-gray-400 text-xs">{currentUser?.email} • {currentUser?.role}</p>
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Bio / Specialty</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-gray-900 dark:text-white leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            {profileMsg ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{profileMsg}</span>
            ) : <span />}

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20 active:scale-95"
            >
              {savingProfile ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Commercial Subscription & Billing Management */}
      <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-brand-500" /> Commercial Subscription & Quota
          </h4>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 font-mono">
            Current: {currentUser?.plan || 'Free Starter'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
          <div>
            <span className="text-gray-400">Plan Tier:</span>
            <p className="font-bold text-gray-900 dark:text-white text-sm capitalize">
              {currentUser?.plan === 'pro' ? '⚡ StudySync Pro Scholar' : currentUser?.plan === 'institute' ? '🏛️ Institute Enterprise' : '🌱 Free Starter'}
            </p>
          </div>
          <div>
            <span className="text-gray-400">Daily AI Queries:</span>
            <p className="font-bold text-brand-600 dark:text-brand-400 text-sm">
              {currentUser?.plan === 'pro' || currentUser?.plan === 'institute' ? 'Unlimited' : `${currentUser?.usage?.aiQueriesToday || 0} / 10 used today`}
            </p>
          </div>
          <div>
            <span className="text-gray-400">Auto-Renewal:</span>
            <p className="font-bold text-gray-700 dark:text-gray-300 text-sm">
              {currentUser?.subscription?.autoRenew ? 'Active' : 'N/A or Cancelled'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => openReport(currentUser.id)}
            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 text-gray-800 dark:text-gray-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-4 h-4 text-brand-500" />
            <span>View Diagnostic Report Card</span>
          </button>

          <button
            type="button"
            onClick={openPricing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-2 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>{currentUser?.plan === 'free' ? 'Upgrade to Pro' : 'Change Plan / Manage Billing'}</span>
          </button>
        </div>
      </div>

      {/* Institute White-Labeling Branding Configuration (Teachers & Institute Admins) */}
      {(isTeacher || currentUser?.plan === 'institute') && (
        <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-indigo-200 dark:border-indigo-900/40 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" /> White-Label Institute Branding
            </h4>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-mono">
              Academy Feature
            </span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Customize your school or coaching academy branding. Your logo, name, tagline, and theme color will automatically appear on report cards, navigation bars, and all classroom feeds you direct.
          </p>

          <form onSubmit={handleSaveBranding} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-xs text-gray-700 dark:text-gray-300 mb-1">
                  Institute / School Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apex Global Science Academy"
                  value={instituteName}
                  onChange={(e) => setInstituteName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-xs text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-xs text-gray-700 dark:text-gray-300 mb-1">
                  Logo Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-xs text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-xs text-gray-700 dark:text-gray-300 mb-1">
                  Academy Tagline / Motto
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fostering Intellectual Rigor & STEM Discovery"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-xs text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-xs text-gray-700 dark:text-gray-300 mb-1">
                  Brand Theme Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-9 h-9 p-0.5 rounded-lg border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-xs text-gray-700 dark:text-gray-300 mb-1">
                  Official Website
                </label>
                <input
                  type="url"
                  placeholder="https://academy.edu"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-xs text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-xs text-gray-700 dark:text-gray-300 mb-1">
                  Contact / Admissions Email
                </label>
                <input
                  type="email"
                  placeholder="contact@academy.edu"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-300 dark:border-dark-border text-xs text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              {brandingMsg ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> {brandingMsg}
                </span>
              ) : <span />}

              <button
                type="submit"
                disabled={savingBranding || !instituteName.trim()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                <span>{savingBranding ? 'Saving Branding...' : 'Update Institute Branding'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Database Management & Seed Reset (Restricted to Teachers Only) */}
      {isTeacher && (
        <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-rose-200 dark:border-rose-900/30 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-rose-500" /> Database & Mock State Management
            </h4>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-mono">
              Teacher Only
            </span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
            Reset all classrooms, assignments, test results, submissions, and XP rankings back to default demonstration seeds.
          </p>

          <div className="flex items-center justify-between pt-2">
            {resetMsg && <span className="text-rose-500 font-semibold">{resetMsg}</span>}
            <button
              onClick={handleResetDatabase}
              disabled={resetting}
              className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 font-bold hover:bg-rose-100 flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{resetting ? 'Resetting...' : 'Reset Database to Seed State'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Danger Zone: Delete Account (Available to Every Type of Account) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-rose-300 dark:border-rose-900/60 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-500" /> Danger Zone: Delete Account
          </h4>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-mono">
            Irreversible
          </span>
        </div>

        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
          Permanently delete your StudySync account, class enrollments, assignments, test history, and all earned XP. Once deleted, this account and its data cannot be recovered.
        </p>

        {deleteError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{deleteError}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-dark-border">
          <span className="text-[11px] text-gray-400">
            Current Account: <strong className="text-gray-700 dark:text-gray-300">{currentUser?.name}</strong> ({currentUser?.role})
          </span>

          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-rose-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>{deleting ? 'Deleting Account...' : 'Delete Account'}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
