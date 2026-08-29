import React from 'react';
import { Sparkles } from 'lucide-react';

const AIAutoCategoryBadge = ({ category, confidence }) => {
  const percent = confidence ? Math.round(confidence * 100) : 92;

  return (
    <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-300">
      <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
      <span>AI Category: {category}</span>
      <span className="text-[10px] text-purple-400 bg-purple-500/20 px-1.5 py-0.5 rounded">
        {percent}% match
      </span>
    </div>
  );
};

export default AIAutoCategoryBadge;
