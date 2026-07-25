import { create } from 'zustand';
import api from '../services/api';

const defaultFilters = {
  search: '',
  city: '',
  propertyType: '',
  minRent: '',
  maxRent: '',
  furnishing: '',
  genderPreference: '',
  amenities: '',
  page: 1,
};

const usePropertyStore = create((set, get) => ({
  properties: [],
  featured: [],
  nearbyProperties: [],
  similarProperties: [],
  myProperties: [],
  currentProperty: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pages: 1,
    total: 0,
  },
  filters: defaultFilters,

  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters, page: 1 } })),
  setPage: (page) => set((state) => ({ filters: { ...state.filters, page } })),
  resetFilters: () => set({ filters: defaultFilters }),

  fetchProperties: async () => {
    set({ loading: true, error: null });
    try {
      const params = Object.fromEntries(
        Object.entries(get().filters).filter(([, value]) => value !== '' && value !== null && value !== undefined)
      );
      const { data } = await api.get('/properties', { params });
      set({
        properties: data.data || [],
        pagination: data.pagination || { page: data.page || 1, pages: data.pages || data.totalPages || 1, total: data.total || 0 },
        loading: false,
      });
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'Failed to load properties' });
    }
  },

  fetchFeatured: async () => {
    try {
      const { data } = await api.get('/properties/featured');
      set({ featured: data.data || [] });
    } catch (err) {
      console.error(err);
    }
  },

  fetchProperty: async (id) => {
    set({ loading: true, currentProperty: null, error: null });
    try {
      const { data } = await api.get(`/properties/${id}`);
      set({ currentProperty: data.data, loading: false });
      return data.data;
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'Failed to load property' });
      return null;
    }
  },

  fetchMyProperties: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/properties/my');
      set({ myProperties: data.data || [], loading: false });
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'Failed to load your properties' });
    }
  },

  fetchNearbyProperties: async (id) => {
    try {
      const { data } = await api.get(`/properties/${id}/nearby`);
      set({ nearbyProperties: data.data || [] });
    } catch (err) {
      console.error(err);
      set({ nearbyProperties: [] });
    }
  },

  fetchSimilarProperties: async (id) => {
    try {
      const { data } = await api.get(`/properties/${id}/similar`);
      set({ similarProperties: data.data || [] });
    } catch (err) {
      console.error(err);
      set({ similarProperties: [] });
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
      set((state) => ({
        properties: state.properties.filter((property) => property._id !== id),
        myProperties: state.myProperties.filter((property) => property._id !== id),
      }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Error deleting property' };
    }
  },

  toggleSave: async (id) => {
    try {
      const { data } = await api.post(`/properties/${id}/save`);
      return { success: true, isSaved: data.isSaved };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Unable to update saved property' };
    }
  },
}));

export default usePropertyStore;
