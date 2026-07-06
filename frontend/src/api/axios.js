import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('nexaUser') || 'null');
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

// ── Simple GET cache (TTL: 30s) ──
const cache = new Map();
const TTL = 30_000;

const originalGet = api.get.bind(api);
api.get = (url, config) => {
  const key = url + JSON.stringify(config?.params || {});
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < TTL) return Promise.resolve(hit.res);
  return originalGet(url, config).then((res) => {
    cache.set(key, { res, ts: Date.now() });
    return res;
  });
};

['post', 'put', 'patch', 'delete'].forEach((method) => {
  const orig = api[method].bind(api);
  api[method] = (...args) => { cache.clear(); return orig(...args); };
});

export default api;
