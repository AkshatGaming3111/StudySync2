// StudySync Centralized API Client

const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  // Retrieve token and saved student Gemini API Key from localStorage
  const token = localStorage.getItem('studysync_token') || '';
  const storedUser = JSON.parse(localStorage.getItem('studysync_user') || '{}');
  const savedApiKey = localStorage.getItem('studysync_gemini_key') || storedUser?.geminiApiKey || '';

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(savedApiKey ? { 'x-gemini-key': savedApiKey } : {}),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    return data;
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Auth & Profile
  auth: {
    getDemoUsers: () => request('/auth/demo-users'),
    login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
    register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
    getProfile: (userId) => request(`/auth/profile/${userId}`),
    updateProfile: (userId, updates) => request(`/auth/profile/${userId}`, { method: 'PUT', body: updates }),
    saveApiKey: (userId, geminiApiKey) => request(`/auth/profile/${userId}`, { method: 'PUT', body: { geminiApiKey } }),
    deleteAccount: (userId) => request(`/auth/profile/${userId}`, { method: 'DELETE' }),
  },

  // Classrooms & Streams
  classes: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/classes${query ? `?${query}` : ''}`);
    },
    getById: (id) => request(`/classes/${id}`),
    create: (classData) => request('/classes', { method: 'POST', body: classData }),
    join: (code, studentId) => request('/classes/join', { method: 'POST', body: { code, studentId } }),
    bulkEnroll: (classId, students) => request(`/classes/${classId}/bulk-enroll`, { method: 'POST', body: { students } }),
    postStream: (classId, postData) => request(`/classes/${classId}/stream`, { method: 'POST', body: postData }),
    addComment: (classId, postId, commentData) => request(`/classes/${classId}/stream/${postId}/comments`, { method: 'POST', body: commentData }),
    react: (classId, postId, emoji) => request(`/classes/${classId}/stream/${postId}/react`, { method: 'POST', body: { emoji } }),
  },

  // Homework & Assignments
  assignments: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/assignments${query ? `?${query}` : ''}`);
    },
    getById: (id) => request(`/assignments/${id}`),
    create: (assignmentData) => request('/assignments', { method: 'POST', body: assignmentData }),
    submit: (id, submissionData) => request(`/assignments/${id}/submit`, { method: 'POST', body: submissionData }),
    precheck: (assignmentId, submissionText) => request('/assignments/precheck', { method: 'POST', body: { assignmentId, submissionText } }),
    aiGradeSubmission: (submissionId) => request(`/assignments/submissions/${submissionId}/ai-grade`, { method: 'POST' }),
    finalizeGrade: (submissionId, gradeData) => request(`/assignments/submissions/${submissionId}/grade`, { method: 'POST', body: gradeData }),
  },

  // Tests & Quizzes
  tests: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/tests${query ? `?${query}` : ''}`);
    },
    getById: (id) => request(`/tests/${id}`),
    generate: (params) => request('/tests/generate', { method: 'POST', body: params }),
    submit: (id, submissionData) => request(`/tests/${id}/submit`, { method: 'POST', body: submissionData }),
    getStudentResults: (studentId) => request(`/tests/results/student/${studentId}`),
    getTestResults: (testId) => request(`/tests/${testId}/results`),
  },

  // Leaderboards & Badges
  leaderboards: {
    getGlobal: () => request('/leaderboards/global'),
    getCohort: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/leaderboards/cohort${query ? `?${query}` : ''}`);
    },
    getClass: (classId) => request(`/leaderboards/class/${classId}`),
    getBadges: () => request('/leaderboards/badges'),
    resetDB: () => request('/leaderboards/reset', { method: 'POST' }),
  },

  // AI Co-pilot, Whiteboard, Flashcards, Summarizer
  ai: {
    chat: (chatData) => request('/ai/chat', { method: 'POST', body: chatData }),
    analyzeWhiteboard: (data) => request('/ai/whiteboard/analyze', { method: 'POST', body: data }),
    summarize: (data) => request('/ai/summarize', { method: 'POST', body: data }),
    getFlashcardDecks: () => request('/ai/flashcards'),
    rateFlashcard: (deckId, cardId, rating, userId) => request(`/ai/flashcards/${deckId}/card/${cardId}/rate`, { method: 'POST', body: { rating, userId } }),
    getApiKeyStatus: () => request('/ai/config/key'),
    setApiKey: (key) => request('/ai/config/key', { method: 'POST', body: { key } }),
  },

  // Commercial Billing & Subscriptions
  billing: {
    getPlans: () => request('/billing/plans'),
    getStatus: () => request('/billing/status'),
    checkout: (data) => request('/billing/checkout', { method: 'POST', body: data }),
    cancel: () => request('/billing/cancel', { method: 'POST' }),
    updateInstituteBranding: (branding) => request('/billing/institute/branding', { method: 'POST', body: branding }),
  },

  // Diagnostic Parent Reports & Transcripts
  reports: {
    getStudentReport: (studentId) => request(`/reports/student/${studentId}`),
    shareStudentReport: (studentId, shareData) => request(`/reports/student/${studentId}/share`, { method: 'POST', body: shareData }),
  }
};
