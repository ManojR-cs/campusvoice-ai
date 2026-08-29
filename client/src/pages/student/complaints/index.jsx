import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../../components/Layout/ProtectedRoute';
import Sidebar from '../../../components/AppShell/Sidebar';
import ComplaintCard from '../../../components/Complaints/ComplaintCard';
import { useComplaintStore } from '../../../store/complaintStore';
import { Search, Filter, FilePlus } from 'lucide-react';

const CATEGORIES = ['All', 'Classroom', 'Laboratory', 'Hostel', 'Wi-Fi', 'Infrastructure', 'Transportation', 'Cleanliness', 'Other'];
const STATUSES = ['All', 'Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

export default function StudentComplaintsList() {
  const { complaints, fetchComplaints, isLoading, setFilters, statusFilter, categoryFilter, searchQuery } = useComplaintStore();
  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(undefined, undefined, searchInput);
  };

  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Campus Complaints Directory</h1>
              <p className="text-xs text-slate-400 mt-1">Search and manage tracked complaint tickets</p>
            </div>

            <Link
              href="/student/complaints/new"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center space-x-1 shadow-lg shadow-blue-500/20"
            >
              <FilePlus className="w-4 h-4 mr-1" /> Log Complaint
            </Link>
          </div>

          {/* Search & Filter Controls Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 mb-6 space-y-3 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search ticket ID, title, or description..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </form>

            <div className="flex flex-wrap gap-2 text-xs">
              <select
                value={statusFilter}
                onChange={(e) => setFilters(e.target.value, undefined, undefined)}
                className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    Status: {s}
                  </option>
                ))}
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setFilters(undefined, e.target.value, undefined)}
                className="bg-slate-900 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    Category: {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Complaints Grid */}
          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading complaints...</div>
          ) : complaints.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 text-sm">
              No complaint tickets match the current filter options.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {complaints.map((c) => (
                <ComplaintCard key={c._id} complaint={c} />
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
