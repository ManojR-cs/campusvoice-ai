import React from 'react';
import Link from 'next/link';
import StatusBadge from '../UI/StatusBadge';
import AIAutoCategoryBadge from './AIAutoCategoryBadge';
import { MapPin, Calendar, AlertTriangle, ArrowRight } from 'lucide-react';

const ComplaintCard = ({ complaint }) => {
  const formatLocation = (loc) => {
    if (!loc) return 'Campus';
    const parts = [loc.block, loc.floor, loc.roomNumber].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : loc.customDetails || 'Campus Grounds';
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'Critical':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'High':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition duration-200 flex flex-col justify-between space-y-4">
      <div>
        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold text-blue-400">{complaint.ticketId}</span>
          <StatusBadge status={complaint.status} />
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white line-clamp-1">{complaint.title}</h3>

        {/* Description or AI Summary */}
        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
          {complaint.aiSummary || complaint.description}
        </p>

        {/* AI Category */}
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <AIAutoCategoryBadge category={complaint.category} confidence={complaint.aiCategoryConfidence} />
          {complaint.isEscalated && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-3 h-3 mr-1" /> Auto-Escalated
            </span>
          )}
        </div>
      </div>

      {/* Footer details */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-3">
          <span className="flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
            {formatLocation(complaint.location)}
          </span>
          <span className={`px-2 py-0.5 rounded border text-[10px] font-medium ${getPriorityBadge(complaint.priority)}`}>
            {complaint.priority}
          </span>
        </div>

        <Link
          href={`/student/complaints/${complaint._id}`}
          className="inline-flex items-center text-blue-400 hover:text-blue-300 font-semibold group"
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
};

export default ComplaintCard;
