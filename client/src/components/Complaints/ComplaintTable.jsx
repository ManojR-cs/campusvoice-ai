import React from 'react';
import Link from 'next/link';
import StatusBadge from '../UI/StatusBadge';
import { AlertCircle, UserCheck, ArrowUpRight, Eye } from 'lucide-react';

const ComplaintTable = ({ complaints, onOpenAssignModal, onQuickStatusUpdate }) => {
  if (!complaints || complaints.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center text-slate-400">
        <p className="text-sm font-medium">No complaint tickets match the active filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Ticket ID</th>
              <th className="py-3.5 px-4">Student & Issue Title</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Location</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Assigned To</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {complaints.map((item) => (
              <tr key={item._id} className="hover:bg-slate-800/40 transition">
                <td className="py-3.5 px-4 font-mono font-bold text-blue-400 whitespace-nowrap">
                  {item.ticketId}
                  {item.isDuplicate && (
                    <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-sans">
                      Dup
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 max-w-xs">
                  <p className="font-semibold text-white truncate">{item.title}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {item.studentId?.name} ({item.studentId?.collegeId || 'Student'})
                  </p>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="px-2.5 py-1 rounded-full text-xs bg-slate-800 border border-slate-700 text-slate-300">
                    {item.category}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                  {item.location?.block || 'Campus'} {item.location?.roomNumber ? `- ${item.location.roomNumber}` : ''}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <StatusBadge status={item.status} />
                </td>
                <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                  {item.assignedDepartment ? (
                    <span className="text-emerald-400 font-medium">{item.assignedDepartment.name}</span>
                  ) : (
                    <span className="text-slate-500 italic">Unassigned</span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                  <button
                    onClick={() => onOpenAssignModal(item)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition border border-blue-500/30 inline-flex items-center"
                  >
                    <UserCheck className="w-3.5 h-3.5 mr-1" /> Assign
                  </button>
                  <Link
                    href={`/student/complaints/${item._id}`}
                    className="px-2 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition inline-flex items-center"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" /> View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComplaintTable;
