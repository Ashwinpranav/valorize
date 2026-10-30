import axios from 'axios';
import {
  User,
  WasteListing,
  MaterialCategory,
  BuyerRequirement,
  BuyerMatch,
  Enquiry,
  Transaction,
  PlatformImpactReport,
  NotificationItem,
  AuditLogItem
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('valorize_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: async (credentials: any) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (data: any) => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// Listings API
export const listingsApi = {
  getCategories: async (): Promise<MaterialCategory[]> => {
    const res = await api.get('/categories');
    return res.data;
  },
  getListings: async (params?: any): Promise<WasteListing[]> => {
    const res = await api.get('/listings', { params });
    return res.data;
  },
  getListing: async (id: number): Promise<WasteListing> => {
    const res = await api.get(`/listings/${id}`);
    return res.data;
  },
  createListing: async (data: any): Promise<WasteListing> => {
    const res = await api.post('/listings', data);
    return res.data;
  },
  updateListing: async (id: number, data: any): Promise<WasteListing> => {
    const res = await api.patch(`/listings/${id}`, data);
    return res.data;
  },
  deleteListing: async (id: number) => {
    const res = await api.delete(`/listings/${id}`);
    return res.data;
  },
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/listings/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getMapListings: async () => {
    const res = await api.get('/listings/map');
    return res.data;
  },
  toggleSaveListing: async (id: number) => {
    const res = await api.post(`/listings/${id}/save`);
    return res.data;
  },
  getSavedListings: async (): Promise<WasteListing[]> => {
    const res = await api.get('/saved-listings');
    return res.data;
  },
};

// AI Services API
export const aiApi = {
  classifyImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/ai/classify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  estimatePrice: async (data: {
    category_name: string;
    quantity: number;
    condition: string;
    region?: string;
  }) => {
    const res = await api.post('/ai/estimate-price', data);
    return res.data;
  },
  getHealth: async () => {
    const res = await api.get('/ai/health');
    return res.data;
  },
};

// Buyer Requirements & Matching API
export const requirementsApi = {
  getRequirements: async (myRequirements: boolean = true): Promise<BuyerRequirement[]> => {
    const res = await api.get('/requirements', { params: { my_requirements: myRequirements } });
    return res.data;
  },
  createRequirement: async (data: any): Promise<BuyerRequirement> => {
    const res = await api.post('/requirements', data);
    return res.data;
  },
  updateRequirement: async (id: number, data: any): Promise<BuyerRequirement> => {
    const res = await api.patch(`/requirements/${id}`, data);
    return res.data;
  },
  deleteRequirement: async (id: number) => {
    const res = await api.delete(`/requirements/${id}`);
    return res.data;
  },
  getMatches: async (params?: any): Promise<BuyerMatch[]> => {
    const res = await api.get('/matches', { params });
    return res.data;
  },
};

// Enquiries & Negotiation API
export const enquiriesApi = {
  getEnquiries: async (roleView?: string): Promise<Enquiry[]> => {
    const res = await api.get('/enquiries', { params: { role_view: roleView } });
    return res.data;
  },
  getEnquiry: async (id: number): Promise<Enquiry> => {
    const res = await api.get(`/enquiries/${id}`);
    return res.data;
  },
  createEnquiry: async (data: any): Promise<Enquiry> => {
    const res = await api.post('/enquiries', data);
    return res.data;
  },
  sendMessage: async (enquiryId: number, data: { message_text: string }) => {
    const res = await api.post(`/enquiries/${enquiryId}/messages`, data);
    return res.data;
  },
  submitOffer: async (enquiryId: number, data: any) => {
    const res = await api.post(`/enquiries/${enquiryId}/offers`, data);
    return res.data;
  },
  acceptOffer: async (enquiryId: number, offerId: number) => {
    const res = await api.post(`/enquiries/${enquiryId}/offers/${offerId}/accept`);
    return res.data;
  },
};

// Transactions API
export const transactionsApi = {
  getTransactions: async (roleView?: string): Promise<Transaction[]> => {
    const res = await api.get('/transactions', { params: { role_view: roleView } });
    return res.data;
  },
  getTransaction: async (id: number): Promise<Transaction> => {
    const res = await api.get(`/transactions/${id}`);
    return res.data;
  },
  addEvent: async (transactionId: number, data: { event_type: string; description: string }) => {
    const res = await api.post(`/transactions/${transactionId}/events`, data);
    return res.data;
  },
};

// Reports API
export const reportsApi = {
  getImpact: async (): Promise<PlatformImpactReport> => {
    const res = await api.get('/reports/impact');
    return res.data;
  },
  getOverview: async () => {
    const res = await api.get('/reports/overview');
    return res.data;
  },
  getCompanyImpact: async () => {
    const res = await api.get('/reports/company');
    return res.data;
  },
  getFinancialAnalysis: async () => {
    const res = await api.get('/reports/financial-analysis');
    return res.data;
  },
};

// Notifications API
export const notificationsApi = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    const res = await api.get('/notifications');
    return res.data;
  },
  markRead: async (id: number) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await api.post('/notifications/read-all');
    return res.data;
  },
};

// Admin API
export const adminApi = {
  getUsers: async (role?: string) => {
    const res = await api.get('/admin/users', { params: { role } });
    return res.data;
  },
  toggleUserStatus: async (id: number) => {
    const res = await api.patch(`/admin/users/${id}/toggle-status`);
    return res.data;
  },
  getListings: async (statusFilter?: string) => {
    const res = await api.get('/admin/listings', { params: { status_filter: statusFilter } });
    return res.data;
  },
  moderateListing: async (id: number, action: string, reason?: string) => {
    const res = await api.patch(`/admin/listings/${id}/moderate`, null, {
      params: { action, reason },
    });
    return res.data;
  },
  getCategories: async () => {
    const res = await api.get('/admin/categories');
    return res.data;
  },
  createCategory: async (data: any) => {
    const res = await api.post('/admin/categories', data);
    return res.data;
  },
  updateCategory: async (id: number, data: any) => {
    const res = await api.patch(`/admin/categories/${id}`, data);
    return res.data;
  },
  getExchanges: async () => {
    const res = await api.get('/admin/exchanges');
    return res.data;
  },
  getSettings: async () => {
    const res = await api.get('/admin/settings');
    return res.data;
  },
  updateSettings: async (data: any) => {
    const res = await api.post('/admin/settings', data);
    return res.data;
  },
  getAuditLogs: async (limit: number = 50): Promise<AuditLogItem[]> => {
    const res = await api.get('/admin/audit', { params: { limit } });
    return res.data;
  },
};

export default api;
