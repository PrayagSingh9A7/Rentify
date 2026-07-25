import { create } from 'zustand';
import api from '../services/api';

const updateById = (items, id, replacement) =>
  items.map((item) => (item._id === id ? { ...item, ...replacement } : item));

const useBookingStore = create((set) => ({
  myBookings: [],
  ownerBookings: [],
  loading: false,
  error: null,

  createBooking: async (bookingData) => {
    try {
      const { data } = await api.post('/bookings', bookingData);
      return { success: true, booking: data.data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to create booking' };
    }
  },

  fetchMyBookings: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/bookings/my');
      set({ myBookings: data.data || [], loading: false });
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'Failed to load bookings' });
    }
  },

  fetchOwnerBookings: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/bookings/owner');
      set({ ownerBookings: data.data || [], loading: false });
    } catch (err) {
      set({ loading: false, error: err.response?.data?.message || 'Failed to load owner bookings' });
    }
  },

  approveBooking: async (id) => {
    try {
      const { data } = await api.patch(`/bookings/${id}/approve`);
      set((state) => ({ ownerBookings: updateById(state.ownerBookings, id, data.data || { status: 'approved' }) }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Unable to approve booking' };
    }
  },

  rejectBooking: async (id, reason = '') => {
    try {
      const { data } = await api.patch(`/bookings/${id}/reject`, { reason });
      set((state) => ({ ownerBookings: updateById(state.ownerBookings, id, data.data || { status: 'rejected', cancellationReason: reason }) }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Unable to reject booking' };
    }
  },

  cancelBooking: async (id, reason = '') => {
    try {
      const { data } = await api.patch(`/bookings/${id}/cancel`, { reason });
      set((state) => ({
        myBookings: updateById(state.myBookings, id, data.data || { status: 'cancelled', cancellationReason: reason }),
        ownerBookings: updateById(state.ownerBookings, id, data.data || { status: 'cancelled', cancellationReason: reason }),
      }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Unable to cancel booking' };
    }
  },

  completeBooking: async (id) => {
    try {
      const { data } = await api.patch(`/bookings/${id}/complete`);
      set((state) => ({ ownerBookings: updateById(state.ownerBookings, id, data.data || { status: 'completed' }) }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Unable to complete booking' };
    }
  },

  refreshOwnerBookings: async () => {
    const { data } = await api.get('/bookings/owner');
    set({ ownerBookings: data.data || [] });
  },

  refreshMyBookings: async () => {
    const { data } = await api.get('/bookings/my');
    set({ myBookings: data.data || [] });
  },
}));

export default useBookingStore;
