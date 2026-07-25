import { create } from 'zustand';
import api from '../services/api';

const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  pagination: { page: 1, pages: 1, total: 0 },
  loading: false,

  fetchNotifications: async (page = 1) => {
    set({ loading: true });
    try {
      const { data } = await api.get('/notifications', { params: { page } });
      set({
        notifications: data.data || data.notifications || [],
        pagination: data.pagination || { page: data.page || page, pages: data.totalPages || 1, total: data.total || 0 },
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      set({ unreadCount: data.count || 0 });
    } catch (err) {
      console.error(err);
    }
  },

  markAsRead: async (id) => {
    try {
      const { data } = await api.patch(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((item) => (item._id === id ? data.data || { ...item, isRead: true } : item)),
        unreadCount: Math.max(state.unreadCount - 1, 0),
      }));
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  },

  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((item) => ({ ...item, isRead: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error(err);
    }
  },

  deleteNotification: async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      set((state) => {
        const deleted = state.notifications.find((item) => item._id === id);
        return {
          notifications: state.notifications.filter((item) => item._id !== id),
          unreadCount: deleted && !deleted.isRead ? Math.max(state.unreadCount - 1, 0) : state.unreadCount,
        };
      });
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  },

  clearNotifications: async () => {
    try {
      await api.delete('/notifications');
      set({ notifications: [], unreadCount: 0 });
    } catch (err) {
      console.error(err);
    }
  },
}));

export default useNotificationStore;
