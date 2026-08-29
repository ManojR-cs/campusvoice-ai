import React, { useState, useEffect } from 'react';
import { X, Building2, UserCheck, Check } from 'lucide-react';
import api from '../../services/api';

const AssignDepartmentModal = ({ complaint, isOpen, onClose, onSuccess }) => {
  const [departments, setDepartments] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      fetchStaff();
      if (complaint?.assignedDepartment) {
        setSelectedDept(complaint.assignedDepartment._id || complaint.assignedDepartment);
      }
    }
  }, [isOpen, complaint]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.data.success) setDepartments(res.data.departments);
    } catch (err) {
      console.error('Fetch departments error:', err);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await api.get('/departments/staff');
      if (res.data.success) setStaffMembers(res.data.staff);
    } catch (err) {
      console.error('Fetch staff error:', err);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedDept) return;
    setIsSubmitting(true);
    try {
      const res = await api.put(`/complaints/${complaint._id}/assign`, {
        departmentId: selectedDept,
        staffId: selectedStaff || undefined,
      });
      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Assign error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !complaint) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-slate-700 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Assign Department</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleAssign} className="mt-4 space-y-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">Ticket ID:</p>
            <p className="text-sm font-mono font-bold text-blue-400">{complaint.ticketId}</p>
            <p className="text-sm font-semibold text-white mt-1">{complaint.title}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Select Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              required
              className="w-full rounded-xl bg-slate-900 border border-slate-700 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Select College Department --</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Assign Staff Member (Optional)</label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Select Staff Officer --</option>
              {staffMembers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.department || 'Staff'})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedDept}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center space-x-1"
            >
              <UserCheck className="w-4 h-4 mr-1" />
              <span>{isSubmitting ? 'Assigning...' : 'Confirm Assignment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignDepartmentModal;
