// Central API Client for Payflow

const BASE_URL = '/api';

/**
 * Handles HTTP requests and throws meaningful Error objects
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      if (typeof data === 'object' && data !== null) {
        // Spring Boot default error attributes or custom ResponseStatusException
        errorMessage = data.message || data.error || (data.errors && data.errors[0]?.defaultMessage) || JSON.stringify(data);
      } else if (typeof data === 'string' && data.length > 0) {
        errorMessage = data;
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const connErr = new Error('Cannot connect to Payflow backend at localhost:8080. Ensure the Spring Boot server is running.');
      connErr.status = 0;
      throw connErr;
    }
    throw err;
  }
}

export const apiClient = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BASE_URL}/users`, { method: 'GET', signal: AbortSignal.timeout(3000) });
    return res.ok || res.status === 200 || res.status === 404;
  } catch {
    return false;
  }
}
