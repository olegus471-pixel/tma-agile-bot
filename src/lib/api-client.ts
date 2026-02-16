// src/lib/api-client.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем Telegram init data в каждый запрос
apiClient.interceptors.request.use((config) => {
  if (window.Telegram?.WebApp?.initData) {
    config.headers['Authorization'] = `tma ${window.Telegram.WebApp.initData}`;
  }
  return config;
});

// Обработка ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Неавторизован - показываем сообщение
      window.Telegram?.WebApp?.showAlert('Ошибка авторизации. Попробуйте перезапустить приложение.');
    } else if (error.response?.status === 500) {
      window.Telegram?.WebApp?.showAlert('Ошибка сервера. Попробуйте позже.');
    }
    return Promise.reject(error);
  }
);

// Типы данных
export interface Client {
  id: number;
  telegramId?: number;
  name: string;
  phone?: string;
  email?: string;
  status: 'new' | 'in_progress' | 'completed' | 'lost';
  source: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  assignedTo?: number;
}

export interface Interaction {
  id: number;
  clientId: number;
  type: 'call' | 'message' | 'meeting' | 'note' | 'email';
  content: string;
  createdAt: string;
  createdBy?: number;
}

export interface CreateClientData {
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  source?: string;
}

export interface UpdateClientData extends Partial<CreateClientData> {
  status?: 'new' | 'in_progress' | 'completed' | 'lost';
}

export interface CreateInteractionData {
  clientId: number;
  type: 'call' | 'message' | 'meeting' | 'note' | 'email';
  content: string;
}

// API методы
export const api = {
  // Клиенты
  getClients: async (params?: { 
    search?: string; 
    status?: string; 
    limit?: number; 
    offset?: number;
  }) => {
    const { data } = await apiClient.get<Client[]>('/clients', { params });
    return data;
  },

  getClient: async (id: number) => {
    const { data } = await apiClient.get<Client>(`/clients/${id}`);
    return data;
  },

  createClient: async (clientData: CreateClientData) => {
    const { data } = await apiClient.post<Client>('/clients', clientData);
    return data;
  },

  updateClient: async (id: number, clientData: UpdateClientData) => {
    const { data } = await apiClient.put<Client>(`/clients/${id}`, clientData);
    return data;
  },

  deleteClient: async (id: number) => {
    await apiClient.delete(`/clients/${id}`);
  },

  // Взаимодействия
  getInteractions: async (clientId: number) => {
    const { data } = await apiClient.get<Interaction[]>(`/interactions/${clientId}`);
    return data;
  },

  createInteraction: async (interactionData: CreateInteractionData) => {
    const { data } = await apiClient.post<Interaction>('/interactions', interactionData);
    return data;
  },

  // Аналитика
  getDashboard: async () => {
    const { data } = await apiClient.get('/analytics/dashboard');
    return data;
  },

  getFunnel: async () => {
    const { data } = await apiClient.get('/analytics/funnel');
    return data;
  },

  getSources: async () => {
    const { data } = await apiClient.get('/analytics/sources');
    return data;
  },

  getTimeline: async (days: number = 30) => {
    const { data } = await apiClient.get('/analytics/timeline', { params: { days } });
    return data;
  },

  // Синхронизация
  syncGoogleSheets: async () => {
    const { data } = await apiClient.post('/sync/google-sheets');
    return data;
  },

  getSyncStatus: async () => {
    const { data } = await apiClient.get('/sync/status');
    return data;
  },
};
