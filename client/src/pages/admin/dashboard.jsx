import React, { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/Layout/ProtectedRoute';
import Sidebar from '../../components/AppShell/Sidebar';
import MetricCard from '../../components/UI/MetricCard';
import ComplaintTable from '../../components/Complaints/ComplaintTable';
import AssignDepartmentModal from '../../components/Complaints/AssignDepartmentModal';
import { useComplaintStore } from '../../store/complaintStore';
import { getSocket } from '../../services/socket';
import { ShieldAlert, ListFilter, Clock, CheckCircle2, AlertTriangle, Search, Filter } from 'lucide-react';

const CATEGORIES = ['All', 'Classroom', 'Laboratory', 'Hostel', 'Wi-Fi', 'Infrastructure', 'Transportation', 'Cleanliness', 'Other'];
const STATUSES = ['All', 'Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

export default function AdminDashboard() {
  const { complaints, fetchComplaints, isLoading, setFilters, statusFilter, categoryFilter, searchQuery } = useComplaintStore();
  const [selectedComplaintForAssign, setSelectedComplaintForAssign] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    fetchComplaints();

    // Connect Socket for Admin real-time alerts
    const socket = getSocket();
    if (socket) {
      socket.emit('join_admin');
      socket.on('new_complaint', () => {
        fetchComplaints();
      });
      socket.on('admin_complaint_updated', () => {
        fetchComplaints();
      });
    }

    return () => {
      if (socket) {
        socket.off('new_complaint');
        socket.off('admin_complaint_updated');
      }
    };
  }, [statusFilter, categoryFilter, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(undefined, undefined, searchInput);
  };

  const openAssignModal = (complaint) => {
    setSelectedComplaintForAssign(complaint);
    setIsAssignModalOpen(true);
  };

  const total = complaints.length;
  const pending = complaints.filter((c) => ['Submitted', 'Under Review'].includes(c.status)).length;
  const inProgress = complaints.filter((c) => ['Assigned', 'In Progress'].includes(c.status)).length;
  const resolved = complaints.filter((c) => ['Resolved', 'Closed'].includes(c.status)).length;
  const duplicates = complaints.filter((c) => c.isDuplicate);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0 p-4 md:p-8 space-y-6 overflow-x-auto">
          {/* Header */}
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2">
              <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Campus Control Tower
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Admin Operations Command Center</h1>
            <p className="text-xs text-slate-400 mt-1">Manage departmental assignments, duplicate warnings, and complaint lifecycles</p>
          </div>

          {/* Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard title="Total Tickets" value={total} icon={ListFilter} color="blue" />
            <MetricCard title="Pending Review" value={pending} icon={Clock} color="purple" />
            <MetricCard title="In Progress" value={inProgress} icon={Clock} color="amber" />
            <MetricCard title="Resolved Issues" value={resolved} icon={CheckCircle2} color="emerald" />
          </div>

          {/* AI Duplicate Warning Banner */}
          {duplicates.length > 0 && (
            <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-300">AI Duplicate Detection Alert</h4>
                  <p className="text-xs text-slate-300">
                    {duplicates.length} open tickets have been flagged as potential duplicates of existing issues.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search ticket ID, title, or student name..."
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

          {/* Interactive Complaint Table */}
          <ComplaintTable
            complaints={complaints}
            onOpenAssignModal={openAssignModal}
            onQuickStatusUpdate={() => fetchComplaints()}
          />

          {/* Assign Department Modal */}
          <AssignDepartmentModal
            complaint={selectedComplaintForAssign}
            isOpen={isAssignModalOpen}
            onClose={() => setIsAssignModalOpen(false)}
            onSuccess={() => fetchComplaints()}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
