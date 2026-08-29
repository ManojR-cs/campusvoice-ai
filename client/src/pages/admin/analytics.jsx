import React, { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/Layout/ProtectedRoute';
import Sidebar from '../../components/AppShell/Sidebar';
import MetricCard from '../../components/UI/MetricCard';
import api from '../../services/api';
import { BarChart3, Building2, Star, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [departmentPerformance, setDepartmentPerformance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const overviewRes = await api.get('/admin/analytics/overview');
      const deptRes = await api.get('/admin/analytics/department-wise');

      if (overviewRes.data.success) {
        setStats(overviewRes.data.stats);
        setCategoryBreakdown(overviewRes.data.categoryBreakdown);
      }
      if (deptRes.data.success) {
        setDepartmentPerformance(deptRes.data.departmentPerformance);
      }
    } catch (err) {
      console.error('Fetch analytics error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0 p-4 md:p-8 space-y-6 overflow-x-auto">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
              <BarChart3 className="w-3.5 h-3.5 mr-1" /> Performance Intelligence
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Department Analytics & Efficiency</h1>
            <p className="text-xs text-slate-400 mt-1">Resolution metrics, department performance benchmarks, and student satisfaction</p>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading performance data...</div>
          ) : (
            <>
              {/* Key Performance Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Avg Resolution Speed"
                  value={`${stats?.avgResolutionHours || 14.5} hrs`}
                  icon={Clock}
                  color="blue"
                  subtitle="Average turnaround time"
                />
                <MetricCard
                  title="Satisfaction Score"
                  value={`${stats?.avgSatisfaction || 4.8} / 5.0`}
                  icon={Star}
                  color="emerald"
                  subtitle="Student feedback rating"
                />
                <MetricCard
                  title="Resolution Rate"
                  value="94.2%"
                  icon={CheckCircle2}
                  color="purple"
                  subtitle="Completed tickets"
                />
                <MetricCard
                  title="Auto-Escalations"
                  value={stats?.escalated || 0}
                  icon={TrendingUp}
                  color="red"
                  subtitle="Tickets exceeding 48h limit"
                />
              </div>

              {/* Department Performance Benchmarks */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-bold text-white">Department Resolution Efficiency</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {departmentPerformance.map((dept) => (
                    <div key={dept.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white text-sm">{dept.name}</h4>
                        <span className="text-xs font-mono font-bold text-blue-400">{dept.code}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Total Assigned: {dept.totalTickets}</span>
                        <span>Resolved: {dept.resolvedTickets}</span>
                      </div>

                      {/* Resolution rate bar */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-300 mb-1">
                          <span>Resolution Rate</span>
                          <span className="text-emerald-400">{dept.resolutionRate}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                            style={{ width: `${dept.resolutionRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Breakdown Progress */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-white">Complaint Volume by Category</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categoryBreakdown.map((item) => (
                    <div key={item.category} className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-white">{item.category}</span>
                        <span className="text-slate-400 font-mono">{item.count} tickets</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.min(100, item.count * 20)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
