const BASE = '';  // Uses vite proxy — /api goes to backend

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw Object.assign(new Error(body.error || res.statusText), { status: res.status, body });
  }
  return res.json();
}

// ─── Auth ────────────────────────────────────────────────────
export const api = {
  login: (email: string, password: string) =>
    request<{ user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),

  me: () =>
    request<{ user: any }>('/api/auth/me'),

  // ─── Tenants ─────────────────────────────────────────────
  getTenants: () =>
    request<any[]>('/api/tenants'),

  getTenant: (id: string) =>
    request<any>(`/api/tenants/${id}`),

  createTenant: (data: { name: string; vdc: string; cpuLimit: number; ramLimit: number; diskLimit: number; vmLimit: number }) =>
    request<any>('/api/tenants', { method: 'POST', body: JSON.stringify(data) }),

  updateTenant: (id: string, data: any) =>
    request<any>(`/api/tenants/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // ─── VMs ─────────────────────────────────────────────────
  createVM: (data: { name: string; templateId: string; cpu: number; ramGb: number; diskGb: number }) =>
    request<any>('/api/vms', { method: 'POST', body: JSON.stringify(data) }),

  startVM: (id: string) =>
    request<any>(`/api/vms/${id}/start`, { method: 'POST' }),

  stopVM: (id: string) =>
    request<any>(`/api/vms/${id}/stop`, { method: 'POST' }),

  resizeVM: (id: string, data: { cpu?: number; ramGb?: number; diskGb?: number }) =>
    request<any>(`/api/vms/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteVM: (id: string) =>
    request<{ ok: boolean }>(`/api/vms/${id}`, { method: 'DELETE' }),

  getVMMetrics: (id: string) =>
    request<any[]>(`/api/vms/${id}/metrics`),

  // ─── Templates ───────────────────────────────────────────
  getTemplates: () =>
    request<any[]>('/api/templates'),

  // ─── Audit ───────────────────────────────────────────────
  getAuditLog: () =>
    request<any[]>('/api/audit'),
};
