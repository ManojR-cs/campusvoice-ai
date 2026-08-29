import { create } from 'zustand';
import api from '../services/api';

export const useComplaintStore = create((set, get) => ({
  complaints: [],
  selectedComplaint: null,
  timelineLogs: [],
  feedback: null,
  isLoading: false,
  statusFilter: 'All',
  categoryFilter: 'All',
  searchQuery: '',

  setFilters: (status, category, search) => {
    set({
      statusFilter: status !== undefined ? status : get().statusFilter,
      categoryFilter: category !== undefined ? category : get().categoryFilter,
      searchQuery: search !== undefined ? search : get().searchQuery,
    });
  },

  fetchComplaints: async () => {
    set({ isLoading: true });
    try {
      const { statusFilter, categoryFilter, searchQuery } = get();
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/complaints', { params });
      if (res.data.success) {
        set({ complaints: res.data.complaints, isLoading: false });
      }
    } catch (err) {
      console.error('Fetch complaints error:', err);
      set({ isLoading: false });
    }
  },

  fetchComplaintById: async (id) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/complaints/${id}`);
      if (res.data.success) {
        set({
          selectedComplaint: res.data.complaint,
          timelineLogs: res.data.timelineLogs,
          feedback: res.data.feedback,
          isLoading: false,
        });
      }
    } catch (err) {
      console.error('Fetch complaint by id error:', err);
      set({ isLoading: false });
    }
  },
}));
