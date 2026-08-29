import React, { useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/Layout/ProtectedRoute';
import Sidebar from '../../components/AppShell/Sidebar';
import MetricCard from '../../components/UI/MetricCard';
import ComplaintCard from '../../components/Complaints/ComplaintCard';
import { useAuthStore } from '../../store/authStore';
import { useComplaintStore } from '../../store/complaintStore';
import { FilePlus, ListFilter, CheckCircle2, Clock, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { complaints, fetchComplaints, isLoading } = useComplaintStore();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const total = complaints.length;
  const inProgress = complaints.filter((c) => ['Under Review', 'Assigned', 'In Progress'].includes(c.status)).length;
  const resolved = complaints.filter((c) => ['Resolved', 'Closed'].includes(c.status)).length;

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0 p-4 md:p-8 space-y-6 overflow-x-auto">
          {/* Welcome Banner */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 mb-8 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-400" /> Student Portal
                </span>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white">Welcome back, {user?.name}!</h1>
                <p className="text-xs text-slate-400 mt-1">Track active tickets or log campus issues instantly.</p>
              </div>

              <Link
                href="/student/complaints/new"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center justify-center space-x-2 transition group"
              >
                <FilePlus className="w-4 h-4" />
                <span>Submit New Complaint</span>
              </Link>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <MetricCard title="Total Submitted" value={total} icon={ListFilter} color="blue" subtitle="Lifetime complaints" />
            <MetricCard title="In Progress" value={inProgress} icon={Clock} color="amber" subtitle="Currently active tickets" />
            <MetricCard title="Resolved Issues" value={resolved} icon={CheckCircle2} color="emerald" subtitle="Completed & verified" />
          </div>

          {/* Recent Active Complaints Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Recent Complaints Overview</h2>
              <Link href="/student/complaints" className="text-xs text-blue-400 hover:underline flex items-center font-semibold">
                View all tickets <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-slate-400 text-xs">Loading complaints...</div>
            ) : complaints.length === 0 ? (
              <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 space-y-3">
                <p className="text-sm font-semibold text-slate-300">You haven't logged any complaints yet.</p>
                <Link
                  href="/student/complaints/new"
                  className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                >
                  <FilePlus className="w-3.5 h-3.5 mr-1" /> Log First Complaint
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {complaints.slice(0, 6).map((c) => (
                  <ComplaintCard key={c._id} complaint={c} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
