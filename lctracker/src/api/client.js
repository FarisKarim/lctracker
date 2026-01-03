const API_BASE = 'http://localhost:3001/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Problems API
export const problemsApi = {
  list: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });
    const query = searchParams.toString();
    return request(`/problems${query ? `?${query}` : ''}`);
  },

  get: (id) => request(`/problems/${id}`),

  create: (data) =>
    request('/problems', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    request(`/problems/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    request(`/problems/${id}`, {
      method: 'DELETE',
    }),

  logAttempt: (id, data) =>
    request(`/problems/${id}/attempt`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  postpone: (id) =>
    request(`/problems/${id}/postpone`, {
      method: 'POST',
    }),
};

// Today API
export const todayApi = {
  get: () => request('/today'),
};

// Stats API
export const statsApi = {
  get: () => request('/stats'),
};

// History API
export const historyApi = {
  get: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') searchParams.append(key, value);
    });
    const query = searchParams.toString();
    return request(`/history${query ? `?${query}` : ''}`);
  },
};
