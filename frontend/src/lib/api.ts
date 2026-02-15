import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

function fetchPublic(url: string, options: RequestInit = {}) {
  return fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }).then(async (res) => {
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${res.status}`);
    }
    return res.json();
  });
}

export const api = {
  // Books
  getBook: (bookId: string) => fetchWithAuth(`/books/${bookId}`),

  // Flashcards
  getFlashcards: (bookId: string) => fetchWithAuth(`/flashcards/${bookId}`),
  getFlashcardState: (bookId: string) => fetchWithAuth(`/flashcards/${bookId}/state`),
  generateFlashcards: (bookId: string) => fetchWithAuth(`/flashcards/${bookId}/generate`, {
    method: 'POST',
  }),

  // Auth
  signUp: (email: string, password: string) =>
    fetchPublic('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  verifyEmail: (email: string, code: string) =>
    fetchPublic('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),
  resendCode: (email: string) =>
    fetchPublic('/auth/resend-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  verifyAuth: () => fetchWithAuth('/auth/verify'),
};
