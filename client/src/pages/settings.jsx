import React, { useState } from 'react';
import ProtectedRoute from '../components/Layout/ProtectedRoute';
import Sidebar from '../components/AppShell/Sidebar';
import { useAuthStore } from '../store/authStore';
import { User, Bell, Moon, ShieldCheck, Check } from 'lucide-react';

export default function Settings() {
  const { user } = useAuthStore();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [socketAlerts, setSocketAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6 md:p-8 max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Account & Preference Settings</h1>
            <p className="text-xs text-slate-400 mt-1">Manage profile, notification alerts, and accessibility options</p>
          </div>

          {saved && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center">
              <Check className="w-5 h-5 mr-2" /> Preferences saved successfully.
            </div>
          )}

          <div className="space-y-6">
            {/* User Info */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                <User className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">User Profile Details</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-xs text-slate-400">Full Name</label>
                  <input
                    type="text"
                    readOnly
                    value={user?.name || ''}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400">College Email</label>
                  <input
                    type="email"
                    readOnly
                    value={user?.email || ''}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400">Role</label>
                  <input
                    type="text"
                    readOnly
                    value={user?.role?.toUpperCase() || ''}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-blue-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400">College ID</label>
                  <input
                    type="text"
                    readOnly
                    value={user?.collegeId || 'N/A'}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-800">
                <Bell className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Notification Alert Settings</h3>
              </div>
              <div className="space-y-3 text-sm">
                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/50 border border-slate-800 cursor-pointer">
                  <div>
                    <p className="font-semibold text-white">Transactional Email Notifications</p>
                    <p className="text-xs text-slate-400">Receive emails on submission, assignment, and status updates</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/50 border border-slate-800 cursor-pointer">
                  <div>
                    <p className="font-semibold text-white">Live Socket.IO Dashboard Banners</p>
                    <p className="text-xs text-slate-400">Instant toast alerts when tickets move stage</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={socketAlerts}
                    onChange={(e) => setSocketAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/20 text-sm"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
