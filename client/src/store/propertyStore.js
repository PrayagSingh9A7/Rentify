import { create } from 'zustand';
import api from '../services/api';

const usePropertyStore = create((set, get) => ({
  properties: [],
  featured: [],
  currentProperty: null,
  loading: false,
  pagination: {},
  filters: {
    search: '',
    city: '',
    type: '',
    minRent: '',
    maxRent: '',
    furnishing: '',
    genderPreference: '',
    amenities: '',
    page: 1,
  },

  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters, page: 1 } })),
  setPage: (page) => set((s) => ({ filters: { ...s.filters, page } })),
  resetFilters: () => set({ filters: { search: '', city: '', type: '', minRent: '', maxRent: '', furnishing: '', genderPreference: '', amenities: '', page: 1 } }),

  fetchProperties: async () => {
    set({ loading: true });
    try {
      const params = Object.fromEntries(Object.entries(get().filters).filter(([, v]) => v !== ''));
      const { data } = await api.get('/properties', { params });
      set({ properties: data.data, pagination: data.pagination, loading: false });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  fetchFeatured: async () => {
    try {
      const { data } = await api.get('/properties/featured');
      set({ featured: data.data });
    } catch (err) {
      console.error(err);
    }
  },

  fetchProperty: async (id) => {
    set({ loading: true, currentProperty: null });
    try {
      const { data } = await api.get(`/properties/${id}`);
      set({ currentProperty: data.data, loading: false });
      return data.data;
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  createProperty: async (propertyData) => {
    try {
      const { data } = await api.post('/properties', propertyData);
      return { success: true, data: data.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error creating property' };
    }
  },

  updateProperty: async (id, propertyData) => {
    try {
      const { data } = await api.put(`/properties/${id}`, propertyData);
      return { success: true, data: data.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error updating property' };
    }
  },

  deleteProperty: async (id) => {
    try {
      await api.delete(`/properties/${id}`);
      set((s) => ({ properties: s.properties.filter((p) => p._id !== id) }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error deleting property' };
    }
  },

  toggleSave: async (id) => {
    try {
      const { data } = await api.post(`/properties/${id}/save`);
      return { success: true, isSaved: data.isSaved };
    } catch {
      return { success: false };
    }
  },
}));

export default usePropertyStore;