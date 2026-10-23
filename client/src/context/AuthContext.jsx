import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('studysync_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      // If it's an old demo user id (e.g. u_student_1 or u_teacher_1), clear it immediately
      if (parsed?.id?.startsWith('u_student_') || parsed?.id?.startsWith('u_teacher_')) {
        localStorage.removeItem('studysync_user');
        localStorage.removeItem('studysync_token');
        return null;
      }
      return parsed;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('studysync_token') || null;
  });

  const [loading, setLoading] = useState(true);
  const [xpNotification, setXpNotification] = useState(null);
  const [levelUpModal, setLevelUpModal] = useState(null);

  // Verify session on initial load
  useEffect(() => {
    async function verifySession() {
      if (currentUser?.id) {
        try {
          const res = await api.auth.getProfile(currentUser.id);
          if (res.success && res.user) {
            setCurrentUser(res.user);
            localStorage.setItem('studysync_user', JSON.stringify(res.user));
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session verification failed, logging out:', err);
          logout();
        }
      } else {
        // Clear any old keys
        localStorage.removeItem('studysync_user_id');
      }
      setLoading(false);
    }
    verifySession();
  }, []);

  const login = async ({ email, password, gradeClass, section }) => {
    const res = await api.auth.login({ email, password, gradeClass, section });
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setToken(res.token);
      localStorage.setItem('studysync_user', JSON.stringify(res.user));
      localStorage.setItem('studysync_token', res.token);
      return res.user;
    }
    throw new Error(res.error || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setToken(res.token);
      localStorage.setItem('studysync_user', JSON.stringify(res.user));
      localStorage.setItem('studysync_token', res.token);
      return res.user;
    }
    throw new Error(res.error || 'Registration failed');
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('studysync_user');
    localStorage.removeItem('studysync_token');
    localStorage.removeItem('studysync_user_id');
  };

  const updateProfile = async (updates) => {
    if (!currentUser) return;
    const res = await api.auth.updateProfile(currentUser.id, updates);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      localStorage.setItem('studysync_user', JSON.stringify(res.user));
      return res.user;
    }
    throw new Error(res.error || 'Profile update failed');
  };

  const triggerXpGain = (award) => {
    if (!award) return;
    if (award.user) {
      setCurrentUser(award.user);
      localStorage.setItem('studysync_user', JSON.stringify(award.user));
    }
    setXpNotification({
      amount: award.xpGained || award.xp || 10,
      reason: award.reason || 'Activity Completed',
      id: Date.now()
    });

    if (award.levelUp) {
      setLevelUpModal({
        level: award.newLevel,
        badges: award.newlyUnlockedBadges || []
      });
    }

    setTimeout(() => {
      setXpNotification(null);
    }, 4000);
  };

  const refreshUser = async () => {
    if (!currentUser) return;
    try {
      const res = await api.auth.getProfile(currentUser.id);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        localStorage.setItem('studysync_user', JSON.stringify(res.user));
      }
    } catch (e) {
      console.warn('Failed to refresh user profile:', e);
    }
  };

  const deleteAccount = async () => {
    if (!currentUser?.id) return { success: false, error: 'No user logged in' };
    try {
      const res = await api.auth.deleteAccount(currentUser.id);
      if (res.success) {
        logout();
      }
      return res;
    } catch (err) {
      console.error('Delete account error:', err);
      throw err;
    }
  };

  const isAuthenticated = !!currentUser;
  const isTeacher = currentUser?.role === 'teacher';
  const isStudent = currentUser?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        loading,
        isTeacher,
        isStudent,
        login,
        register,
        logout,
        deleteAccount,
        updateProfile,
        triggerXpGain,
        refreshUser,
        xpNotification,
        levelUpModal,
        closeLevelUpModal: () => setLevelUpModal(null)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
