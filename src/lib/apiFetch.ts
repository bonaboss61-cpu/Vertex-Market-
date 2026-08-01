import { auth } from './firebase.ts';

export const apiFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  let config = init || {};
  if (typeof input === 'string' && input.startsWith('/api/')) {
    const token = await auth.currentUser?.getIdToken();
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      };
    }
  }
  return fetch(input, config);
};
