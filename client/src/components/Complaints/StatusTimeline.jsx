import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

const STAGES = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

const StatusTimeline = ({ currentStatus, timelineLogs = [] }) => {
  const currentIndex = STAGES.indexOf(currentStatus);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${(Math.max(0, currentIndex) / (STAGES.length - 1)) * 100}%` }}
        />

        {/* Step Nodes */}
        {STAGES.map((stage, idx) => {
          const isCompleted = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={stage} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? 'bg-slate-900 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                } ${isCurrent ? 'ring-4 ring-blue-500/30 scale-110' : ''}`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span className="text-xs font-bold">{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-[11px] font-semibold mt-2 whitespace-nowrap ${
                  isCurrent ? 'text-blue-400' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {stage}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTimeline;
