import React, { useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
  useNavigate,
  useLocation
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClassProvider, useClass } from './context/ClassContext';
import { ThemeProvider } from './context/ThemeContext';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/Navigation/MobileBottomNav';
import MobileNavDrawer from './components/Navigation/MobileNavDrawer';
import StudyBotDrawer from './components/AI/StudyBotDrawer';

import DashboardPage from './pages/DashboardPage';
import ClassStream from './components/Classroom/ClassStream';
import AssignmentsPage from './pages/AssignmentsPage';
import TestsPage from './pages/TestsPage';
import LeaderboardTable from './components/Leaderboard/LeaderboardTable';
import BadgeGallery from './components/Leaderboard/BadgeGallery';
import SyncBoard from './components/Whiteboard/SyncBoard';
import LectureSummarizer from './components/AI/LectureSummarizer';
import SettingsPage from './pages/SettingsPage';

import JoinClassModal from './components/Classroom/JoinClassModal';
import CreateClassModal from './components/Classroom/CreateClassModal';
import CreateAssignmentModal from './components/Homework/CreateAssignmentModal';
import QuizGeneratorModal from './components/Testing/QuizGeneratorModal';
import ConfettiCelebration from './components/Common/ConfettiCelebration';
import SlidingBackground from './components/Common/SlidingBackground';

import { Zap, Trophy } from 'lucide-react';

// Redirect helpers
function ClassRedirect() {
  const { activeClass, classes } = useClass();
  const targetId = activeClass?.id || (classes.length > 0 ? classes[0].id : null);
  if (targetId) {
    return <Navigate to={`/classes/${targetId}/stream`} replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

function ClassIdRedirect() {
  const { classId } = useParams();
  return <Navigate to={`/classes/${classId}/stream`} replace />;
}

function TestRedirect() {
  const { testId } = useParams();
  return <Navigate to={testId ? `/arena/${testId}` : '/arena'} replace />;
}

function AppContent() {
  const { isAuthenticated, loading, xpNotification, levelUpModal, closeLevelUpModal } = useAuth();
  const { activeClass } = useClass();
  const navigate = useNavigate();
  const location = useLocation();

  // Modals state
  const [showAI, setShowAI] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [showQuizGenModal, setShowQuizGenModal] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  // Backward compatibility adapter for components invoking setActiveTab
  const setActiveTab = (tab) => {
    const routeMap = {
      dashboard: '/dashboard',
      classroom: activeClass ? `/classes/${activeClass.id}/stream` : '/classes',
      assignments: '/assignments',
      tests: '/arena',
      arena: '/arena',
      leaderboard: '/leaderboard',
      whiteboard: activeClass ? `/classes/${activeClass.id}/whiteboard` : '/whiteboard',
      flashcards: '/flashcards',
      settings: '/settings',
    };
    navigate(routeMap[tab] || `/${tab}`);
  };

  // If initial load in progress
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-400 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/25 animate-pulse">
            <Zap className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-gray-400">Loading StudySync AI Classroom...</p>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated: Show Landing Page or Auth Page via routes
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route
          path="/login"
          element={<AuthPage initialMode="login" onBackToLanding={() => navigate('/')} />}
        />
        <Route
          path="/register"
          element={<AuthPage initialMode="register" onBackToLanding={() => navigate('/')} />}
        />
        <Route
          path="*"
          element={
            <LandingPage
              onOpenAuth={(mode) => navigate(mode === 'register' ? '/register' : '/login')}
              onOpenSignIn={() => navigate('/login')}
              onOpenRegister={() => navigate('/register')}
            />
          }
        />
      </Routes>
    );
  }

  // 2. Authenticated: Render Sophisticated Workspace with Routes
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-base text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200 relative">
      
      {/* Dynamic Sliding Background Matrix & Knowledge Stream */}
      <SlidingBackground />

      {/* Main Navigation Header */}
      <Navbar
        onOpenAI={() => setShowAI(true)}
        onOpenJoinModal={() => setShowJoinModal(true)}
        onOpenCreateModal={() => setShowCreateClassModal(true)}
        onOpenDrawer={() => setShowMobileDrawer(true)}
      />

      {/* Workspace Body (Sidebar + Main View) */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar setActiveTab={setActiveTab} />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-28 lg:pb-8 min-w-0 overflow-y-auto max-h-[calc(100vh-4rem)]">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="/register" element={<Navigate to="/dashboard" replace />} />

            <Route
              path="/dashboard"
              element={
                <DashboardPage
                  setActiveTab={setActiveTab}
                  onOpenJoinModal={() => setShowJoinModal(true)}
                  onOpenCreateClassModal={() => setShowCreateClassModal(true)}
                  onOpenCreateAssignmentModal={() => setShowCreateAssignmentModal(true)}
                  onOpenQuizGenModal={() => setShowQuizGenModal(true)}
                  onOpenAI={() => setShowAI(true)}
                />
              }
            />

            <Route path="/classes" element={<ClassRedirect />} />
            <Route path="/classes/:classId" element={<ClassIdRedirect />} />
            <Route
              path="/classes/:classId/:subtab"
              element={
                <ClassStream
                  onOpenWhiteboard={() => setActiveTab('whiteboard')}
                  onOpenAssignments={() => setActiveTab('assignments')}
                  onOpenTests={() => setActiveTab('tests')}
                  onOpenAI={() => setShowAI(true)}
                />
              }
            />

            <Route path="/assignments" element={<AssignmentsPage />} />
            <Route path="/assignments/:assignmentId" element={<AssignmentsPage />} />

            <Route path="/arena" element={<TestsPage />} />
            <Route path="/arena/:testId" element={<TestsPage />} />
            <Route path="/tests" element={<Navigate to="/arena" replace />} />
            <Route path="/tests/:testId" element={<TestRedirect />} />

            <Route
              path="/leaderboard"
              element={
                <div className="space-y-8">
                  <LeaderboardTable />
                  <BadgeGallery />
                </div>
              }
            />

            <Route path="/whiteboard" element={<SyncBoard />} />
            <Route path="/flashcards" element={<LectureSummarizer />} />
            <Route path="/settings" element={<SettingsPage />} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible < lg) */}
      <MobileBottomNav onOpenDrawer={() => setShowMobileDrawer(true)} />

      {/* Mobile Navigation Drawer / Menu (Visible on mobile toggle) */}
      <MobileNavDrawer
        isOpen={showMobileDrawer}
        onClose={() => setShowMobileDrawer(false)}
        onOpenAI={() => setShowAI(true)}
        onOpenJoinModal={() => setShowJoinModal(true)}
        onOpenCreateModal={() => setShowCreateClassModal(true)}
      />

      {/* AI Co-Pilot Floating Drawer */}
      <StudyBotDrawer isOpen={showAI} onClose={() => setShowAI(false)} />

      {/* Global Modals */}
      <JoinClassModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} />
      <CreateClassModal isOpen={showCreateClassModal} onClose={() => setShowCreateClassModal(false)} />
      <CreateAssignmentModal isOpen={showCreateAssignmentModal} onClose={() => setShowCreateAssignmentModal(false)} />
      <QuizGeneratorModal isOpen={showQuizGenModal} onClose={() => setShowQuizGenModal(false)} />

      {/* Floating XP Gain Notification Toast */}
      {xpNotification && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-gray-900/95 dark:bg-dark-card/95 border border-brand-500/40 text-white shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/30">
            <Zap className="w-5 h-5 fill-white animate-pulse" />
          </div>
          <div>
            <span className="font-black text-sm font-mono text-brand-400">
              +{xpNotification.amount} XP Earned!
            </span>
            <p className="text-xs text-gray-300 mt-0.5">{xpNotification.reason || 'Activity completed'}</p>
          </div>
        </div>
      )}

      {/* Level Up Celebratory Modal */}
      {levelUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in zoom-in-95 duration-200">
          <ConfettiCelebration trigger={true} />
          <div className="w-full max-w-sm bg-white dark:bg-dark-card border border-brand-500/40 rounded-3xl shadow-2xl p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-brand-500 text-white mx-auto flex items-center justify-center shadow-xl shadow-amber-500/30 animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Milestone Reached</span>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                Level Up! Level {levelUpModal.level}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Congratulations! Your class and global standing on StudySync has increased.
              </p>
            </div>

            <button
              onClick={closeLevelUpModal}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20"
            >
              Continue Learning
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ClassProvider>
            <AppContent />
          </ClassProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
