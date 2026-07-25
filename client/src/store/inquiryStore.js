import { create } from 'zustand';
import api from '../services/api';

const useInquiryStore = create((set) => ({
  myInquiries: [],
  ownerInquiries: [],
  loading: false,
  error: null,

  createInquiry: async (inquiryData) => {
    try {
      const { data } = await api.post('/inquiries', inquiryData);
      set((state) => ({ myInquiries: [data.data, ...state.myInquiries] }));
      return { success: true, inquiry: data.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to send inquiry' };
    }
  },

  fetchMyInquiries: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/inquiries/my');
      set({ myInquiries: data.data || [], loading: false });
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'Something went wrong' });
    }
  },

  fetchOwnerInquiries: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/inquiries/owner');
      set({ ownerInquiries: data.data || [], loading: false });
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'Something went wrong' });
    }
  },

  replyInquiry: async (id, reply) => {
    try {
      const body = { reply: typeof reply === 'string' ? reply : reply?.reply };
      const { data } = await api.patch(`/inquiries/${id}/reply`, body);
      set((state) => ({
        ownerInquiries: state.ownerInquiries.map((item) => (item._id === id ? data.data : item)),
      }));
      return { success: true, inquiry: data.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Unable to send reply' };
    }
  },

  deleteInquiry: async (id) => {
    try {
      await api.delete(`/inquiries/${id}`);
      set((state) => ({
        myInquiries: state.myInquiries.filter((item) => item._id !== id),
        ownerInquiries: state.ownerInquiries.filter((item) => item._id !== id),
      }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Unable to delete inquiry' };
    }
  },

  refreshOwnerInquiries: async () => {
    const { data } = await api.get('/inquiries/owner');
    set({ ownerInquiries: data.data || [] });
  },

  refreshMyInquiries: async () => {
    const { data } = await api.get('/inquiries/my');
    set({ myInquiries: data.data || [] });
  },
}));

export default useInquiryStore;
