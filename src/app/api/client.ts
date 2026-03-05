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

  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: 'platform_admin' | 'tenant_admin' | 'user';
    tenantId?: string;
    organizationName?: string;
    organizationVdc?: string;
  }) =>
    request<{ user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),

  me: () =>
    request<{ user: any }>('/api/auth/me'),

  getPublicTenants: () =>
    request<Array<{ id: string; name: string }>>('/api/auth/tenants-list'),

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

  getVMLiveMetrics: (id: string) =>
    request<{ cpuPercent: number; ramUsedMb: number; ramLimitMb: number }>(`/api/vms/${id}/metrics/live`),

  // ─── Templates ───────────────────────────────────────────
  getTemplates: () =>
    request<any[]>('/api/templates'),

  // ─── Users ───────────────────────────────────────────────
  getUsers: () =>
    request<any[]>('/api/users'),

  createUser: (data: { name: string; email: string; password: string; role: 'tenant_admin' | 'user'; tenantId?: string }) =>
    request<any>('/api/users', { method: 'POST', body: JSON.stringify(data) }),

  updateUser: (id: string, data: { name?: string; role?: 'tenant_admin' | 'user' }) =>
    request<any>(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteUser: (id: string) =>
    request<{ ok: boolean }>(`/api/users/${id}`, { method: 'DELETE' }),

  // ─── Billing ─────────────────────────────────────────────
  getBillingSummary: (tenantId?: string) =>
    request<{ total: number; breakdown: any[] }>(`/api/billing/summary${tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : ''}`),

  getPricing: () =>
    request<{ cpu: number; ram: number; disk: number; bandwidth: number }>('/api/billing/pricing'),

  // ─── Infrastructure ──────────────────────────────────────
  getDockerInfo: () =>
    request<any>('/api/infrastructure/docker'),

  // ─── Audit ───────────────────────────────────────────────
  getAuditLog: () =>
    request<any[]>('/api/audit'),
};
