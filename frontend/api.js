// Dies ist die einzige Datei mit fetch(). Vertrag: ../docs/API.md und openapi.yaml.
const base = window.LERNRAUM_API;

export class ApiError extends Error {
  constructor(status, message, errors = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export async function request(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (method !== 'GET') headers['X-Requested-With'] = 'Lernraum';
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  let response;
  try {
    response = await fetch(base + path, {
      method,
      headers,
      credentials: 'include', // Browser sendet das HttpOnly-Session-Cookie mit.
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch {
    throw new ApiError(0, 'Das Backend ist nicht erreichbar. Läuft Spring Boot auf Port 8080?');
  }
  if (response.status === 204) return undefined;
  const data = await response.json();
  if (!response.ok) throw new ApiError(response.status, data.message || 'Die Anfrage ist fehlgeschlagen.', data.errors);
  return data;
}

export const api = {
  me: () => request('/auth/me'),
  login: body => request('/auth/login', { method: 'POST', body }),
  register: body => request('/auth/register', { method: 'POST', body }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  profile: body => request('/profile', { method: 'PUT', body }),
  dashboard: () => request('/dashboard'),
  subjects: () => request('/subjects'),
  topics: () => request('/topics'),
  tags: () => request('/tags'),
  tasks: (filters = {}) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) if (value !== '' && value != null) query.set(key, value);
    return request('/tasks' + (query.size ? '?' + query : ''));
  },
  save: (resource, id, body) => request(`/${resource}${id ? '/' + id : ''}`, { method: id ? 'PUT' : 'POST', body }),
  remove: (resource, id) => request(`/${resource}/${id}`, { method: 'DELETE' })
};
