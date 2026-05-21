/**
 * api.js — Backend API calls for Space Intelligence Dashboard
 */

const BASE = window.location.origin;

const API = {
  async get(path) {
    try {
      const res = await fetch(`${BASE}${path}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('[API] Error:', path, e.message);
      return null;
    }
  },

  async post(path, body) {
    try {
      const res = await fetch(`${BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return await res.json();
    } catch (e) {
      console.warn('[API] POST Error:', path, e.message);
      return null;
    }
  },

  dashboard:  () => API.get('/api/nasa/dashboard'),
  flares:     (d=30) => API.get(`/api/nasa/flares?days=${d}`),
  storms:     (d=30) => API.get(`/api/nasa/storms?days=${d}`),
  cme:        (d=30) => API.get(`/api/nasa/cme?days=${d}`),
  asteroids:  (d=7)  => API.get(`/api/nasa/asteroids?days=${d}`),
  insights:   () => API.get('/api/ai/insights'),
  alerts:     () => API.get('/api/alerts'),
  health:     () => API.get('/api/health'),
  chat:       (message) => API.post('/api/ai/chat', { message })
};
