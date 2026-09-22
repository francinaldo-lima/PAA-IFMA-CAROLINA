import {
  Action,
  Axis,
  PAA,
  Sector,
  User,
  AuditLog,
  Notification,
  ActionTemplate,
  InstitutionSettings,
  DocumentConfiguration,
  DashboardStats,
  ManagementMember,
  FacultyMember,
  StaffMember
} from '../types';

let currentUserId: string = localStorage.getItem('paa_user_id') || 'usr-admin';

export function setApiUserId(id: string) {
  currentUserId = id;
  localStorage.setItem('paa_user_id', id);
}

export function getApiUserId(): string {
  return currentUserId;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (currentUserId) {
    headers.set('x-user-id', currentUserId);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = 'Erro na requisição ao servidor.';
    try {
      const json = await response.json();
      if (json.error) errorMsg = json.error;
    } catch {
      errorMsg = `Erro HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password?: string): Promise<{ user: User }> {
    const res = await request<{ user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.user?.id) {
      setApiUserId(res.user.id);
    }
    return res;
  },

  async getMe(): Promise<{ user: User | null }> {
    return request<{ user: User | null }>('/api/auth/me');
  },

  // PAAs
  async getPAAs(): Promise<PAA[]> {
    return request<PAA[]>('/api/paa');
  },

  async getPAA(id: string): Promise<PAA> {
    return request<PAA>(`/api/paa/${id}`);
  },

  async createPAA(data: Partial<PAA>): Promise<PAA> {
    return request<PAA>('/api/paa', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updatePAA(id: string, data: Partial<PAA>): Promise<PAA> {
    return request<PAA>(`/api/paa/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deletePAA(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/paa/${id}`, {
      method: 'DELETE'
    });
  },

  async checkAccess(email: string): Promise<{
    allowed: boolean;
    isAdmin: boolean;
    isChefia: boolean;
    role?: string;
    user?: User;
    chefiaNome?: string;
    funcao?: string;
    sectorId?: string;
    sectorName?: string;
    sectorSigla?: string;
    message?: string;
  }> {
    return request('/api/auth/check-access', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  // Sectors
  async getSectors(): Promise<Sector[]> {
    return request<Sector[]>('/api/sectors');
  },

  async createSector(data: Partial<Sector>): Promise<Sector> {
    return request<Sector>('/api/sectors', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateSector(id: string, data: Partial<Sector>): Promise<Sector> {
    return request<Sector>(`/api/sectors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteSector(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/sectors/${id}`, {
      method: 'DELETE'
    });
  },

  // Axes
  async getAxes(paaId?: string): Promise<Axis[]> {
    const q = paaId ? `?paa_id=${paaId}` : '';
    return request<Axis[]>(`/api/axes${q}`);
  },

  async createAxis(data: Partial<Axis>): Promise<Axis> {
    return request<Axis>('/api/axes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateAxis(id: string, data: Partial<Axis>): Promise<Axis> {
    return request<Axis>(`/api/axes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteAxis(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/axes/${id}`, {
      method: 'DELETE'
    });
  },

  async reorderAxes(order: { id: string; ordem: number }[]): Promise<Axis[]> {
    return request<Axis[]>('/api/axes/reorder', {
      method: 'POST',
      body: JSON.stringify(order)
    });
  },

  // Users
  async getUsers(): Promise<User[]> {
    return request<User[]>('/api/users');
  },

  async createUser(data: Partial<User>): Promise<User> {
    return request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return request<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteUser(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/users/${id}`, {
      method: 'DELETE'
    });
  },

  // Actions
  async getActions(filters?: Record<string, string>): Promise<Action[]> {
    const params = new URLSearchParams(filters || {});
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<Action[]>(`/api/actions${query}`);
  },

  async getAction(id: string): Promise<Action> {
    return request<Action>(`/api/actions/${id}`);
  },

  async createAction(data: Partial<Action>): Promise<Action> {
    return request<Action>('/api/actions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateAction(id: string, data: Partial<Action>): Promise<Action> {
    return request<Action>(`/api/actions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteAction(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/actions/${id}`, {
      method: 'DELETE'
    });
  },

  async submitAction(id: string): Promise<Action> {
    return request<Action>(`/api/actions/${id}/submit`, { method: 'POST' });
  },

  async approveAction(id: string, motivo?: string): Promise<Action> {
    return request<Action>(`/api/actions/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ motivo })
    });
  },

  async returnAction(id: string, motivo: string): Promise<Action> {
    return request<Action>(`/api/actions/${id}/return`, {
      method: 'POST',
      body: JSON.stringify({ motivo })
    });
  },

  async consolidateAction(id: string): Promise<Action> {
    return request<Action>(`/api/actions/${id}/consolidate`, { method: 'POST' });
  },

  async duplicateAction(id: string): Promise<Action> {
    return request<Action>(`/api/actions/${id}/duplicate`, { method: 'POST' });
  },

  async updateExecution(id: string, data: any): Promise<Action> {
    return request<Action>(`/api/actions/${id}/execution`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async addAttachment(actionId: string, att: any): Promise<any> {
    return request<any>(`/api/actions/${actionId}/attachments`, {
      method: 'POST',
      body: JSON.stringify(att)
    });
  },

  async deleteAttachment(actionId: string, attId: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/actions/${actionId}/attachments/${attId}`, {
      method: 'DELETE'
    });
  },

  async importFromPrevious(sourcePaaId: string, targetPaaId: string, actionIds: string[]): Promise<{ count: number; actions: Action[] }> {
    return request<{ count: number; actions: Action[] }>('/api/actions/import-previous', {
      method: 'POST',
      body: JSON.stringify({
        source_paa_id: sourcePaaId,
        target_paa_id: targetPaaId,
        action_ids: actionIds
      })
    });
  },

  // Demo clean
  async cleanDemoData(): Promise<{ removed: number }> {
    return request<{ removed: number }>('/api/demo/clean', { method: 'POST' });
  },

  // Dashboard stats
  async getDashboardStats(paaId?: string, sectorId?: string): Promise<DashboardStats> {
    const params = new URLSearchParams();
    if (paaId) params.set('paa_id', paaId);
    if (sectorId) params.set('sector_id', sectorId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<DashboardStats>(`/api/dashboard/stats${query}`);
  },

  // Audit
  async getAuditLogs(): Promise<AuditLog[]> {
    return request<AuditLog[]>('/api/audit');
  },

  // Notifications
  async getNotifications(userId?: string): Promise<Notification[]> {
    const q = userId ? `?user_id=${userId}` : '';
    return request<Notification[]>(`/api/notifications${q}`);
  },

  async markNotificationAsRead(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'PUT'
    });
  },

  // Templates
  async getTemplates(): Promise<ActionTemplate[]> {
    return request<ActionTemplate[]>('/api/templates');
  },

  async createTemplate(data: Partial<ActionTemplate>): Promise<ActionTemplate> {
    return request<ActionTemplate>('/api/templates', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Settings & DocConfig
  async getSettings(): Promise<InstitutionSettings> {
    return request<InstitutionSettings>('/api/settings');
  },

  async updateSettings(data: Partial<InstitutionSettings>): Promise<InstitutionSettings> {
    return request<InstitutionSettings>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async getDocConfig(): Promise<DocumentConfiguration> {
    return request<DocumentConfiguration>('/api/doc-config');
  },

  async updateDocConfig(data: Partial<DocumentConfiguration>): Promise<DocumentConfiguration> {
    return request<DocumentConfiguration>('/api/doc-config', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Equipe de Gestão
  async getManagementTeam(): Promise<ManagementMember[]> {
    return request<ManagementMember[]>('/api/management');
  },

  async createManagementMember(data: Partial<ManagementMember>): Promise<ManagementMember> {
    return request<ManagementMember>('/api/management', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateManagementMember(id: string, data: Partial<ManagementMember>): Promise<ManagementMember> {
    return request<ManagementMember>(`/api/management/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteManagementMember(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/management/${id}`, {
      method: 'DELETE'
    });
  },

  // Corpo Docente
  async getFaculty(): Promise<FacultyMember[]> {
    return request<FacultyMember[]>('/api/faculty');
  },

  async createFacultyMember(data: Partial<FacultyMember>): Promise<FacultyMember> {
    return request<FacultyMember>('/api/faculty', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateFacultyMember(id: string, data: Partial<FacultyMember>): Promise<FacultyMember> {
    return request<FacultyMember>(`/api/faculty/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteFacultyMember(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/faculty/${id}`, {
      method: 'DELETE'
    });
  },

  // Técnicos Administrativos (TAEs)
  async getStaff(): Promise<StaffMember[]> {
    return request<StaffMember[]>('/api/staff');
  },

  async createStaffMember(data: Partial<StaffMember>): Promise<StaffMember> {
    return request<StaffMember>('/api/staff', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateStaffMember(id: string, data: Partial<StaffMember>): Promise<StaffMember> {
    return request<StaffMember>(`/api/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteStaffMember(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/api/staff/${id}`, {
      method: 'DELETE'
    });
  },

  // AI
  async suggestAction(prompt: string): Promise<any> {
    return request<any>('/api/ai/suggest', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    });
  },

  async analyzeAction(action: any): Promise<any> {
    return request<any>('/api/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({ action })
    });
  },

  async improveText(text: string, fieldName?: string): Promise<{ improvedText: string }> {
    return request<{ improvedText: string }>('/api/ai/improve-text', {
      method: 'POST',
      body: JSON.stringify({ text, fieldName })
    });
  }
};
