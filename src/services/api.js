const BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('eduai_token');
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const api = {
  auth: {
    login: (email, password) => request('POST', '/auth/login', { email, password }),
    register: (name, email, password) => request('POST', '/auth/register', { name, email, password }),
    me: () => request('GET', '/auth/me'),
    updateSettings: (settings) => request('PUT', '/auth/settings', settings),
    forgotPassword: (email) => request('POST', '/auth/forgot-password', { email }),
    resetPassword: (token, password) => request('POST', `/auth/reset-password/${token}`, { password }),
  },

  // ─── Chat ──────────────────────────────────────────────────────────────────
  chat: {
    getSessions: () => request('GET', '/chat/sessions'),
    createSession: (title) => request('POST', '/chat/sessions', { title }),
    getMessages: (sessionId) => request('GET', `/chat/sessions/${sessionId}/messages`),
    sendMessage: (sessionId, content) =>
      request('POST', `/chat/sessions/${sessionId}/message`, { content }),
    deleteSession: (sessionId) => request('DELETE', `/chat/sessions/${sessionId}`),
  },

  // ─── Planner ───────────────────────────────────────────────────────────────
  planner: {
    getPlans: () => request('GET', '/planner'),
    generatePlan: (topic, difficulty, duration) =>
      request('POST', '/planner/generate', { topic, difficulty, duration }),
    updateModule: (planId, moduleId, status) =>
      request('PUT', `/planner/${planId}/modules/${moduleId}`, { status }),
    saveNotes: (planId, moduleId, notes) =>
      request('PUT', `/planner/${planId}/modules/${moduleId}/notes`, { notes }),
    deletePlan: (planId) => request('DELETE', `/planner/${planId}`),
  },

  // ─── Analytics ─────────────────────────────────────────────────────────────
  analytics: {
    getStats: () => request('GET', '/analytics/stats'),
    logSession: (hours) => request('POST', '/analytics/log-session', { hours }),
  },

  // ─── Quiz / Leaderboard ────────────────────────────────────────────────────
  quiz: {
    saveResult: (data) => request('POST', '/quiz/result', data),
    getLeaderboard: (subject) => request('GET', `/quiz/leaderboard${subject ? `?subject=${subject}` : ''}`),
    getMyResults: () => request('GET', '/quiz/my-results'),
  },
};

export default api;
