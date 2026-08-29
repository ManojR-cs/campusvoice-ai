import React, { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/Layout/ProtectedRoute';
import Sidebar from '../../components/AppShell/Sidebar';
import api from '../../services/api';
import { Building2, Plus, Users, Shield, Check } from 'lucide-react';

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.data.success) {
        setDepartments(res.data.departments);
      }
    } catch (err) {
      console.error('Fetch departments error:', err);
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsCreating(true);
    try {
      const res = await api.post('/departments', { name, code });
      if (res.data.success) {
        setName('');
        setCode('');
        setSuccess(`Department ${res.data.department.name} created!`);
        fetchDepartments();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Creation failed');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6 md:p-8 space-y-6">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
              <Building2 className="w-3.5 h-3.5 mr-1" /> Campus Department Registry
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">Department Management Portal</h1>
            <p className="text-xs text-slate-400 mt-1">Configure campus operational units and assign lead managers</p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center">
              <Check className="w-4 h-4 mr-2" /> {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Department Creation Form */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 h-fit">
              <h3 className="text-lg font-bold text-white flex items-center">
                <Plus className="w-5 h-5 mr-2 text-blue-400" /> Create New Department
              </h3>

              <form onSubmit={handleCreateDepartment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. IT & Network Support"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. IT"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 uppercase"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Register Department'}
                </button>
              </form>
            </div>

            {/* Existing Departments List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-white">Active College Departments ({departments.length})</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {departments.map((dept) => (
                  <div key={dept._id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-base">{dept.name}</h4>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {dept.code}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1">
                      <p className="flex items-center">
                        <Shield className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                        Lead: {dept.headId ? dept.headId.name : 'Unassigned'}
                      </p>
                      <p className="flex items-center">
                        <Users className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                        Staff Members: {dept.staffCount || 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
