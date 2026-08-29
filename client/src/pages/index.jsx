import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Sparkles, Zap, Clock, Building2, CheckCircle2, ArrowRight, Activity } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[250px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full glass-panel text-xs font-semibold text-blue-400 border border-blue-500/20 mb-8 animate-pulse">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>CampusVoice AI Engine 2.0 Enabled</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
          AI-Powered Campus Operations & <span className="gradient-text">Complaint Resolution</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
          Digitizing and automating the college grievance lifecycle. Report Wi-Fi, classroom, laboratory, and infrastructure issues in seconds with instant AI categorization and real-time status tracking.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/student/complaints/new"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-base shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition duration-300 flex items-center justify-center space-x-2 group"
          >
            <span>Submit Quick Report</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel text-slate-200 font-semibold text-base border border-slate-700 hover:border-slate-500 transition duration-300 text-center"
          >
            Staff & Admin Sign In
          </Link>
        </div>

        {/* Live Resolution Stats Ticker */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-400 uppercase font-semibold">Resolved Tickets</p>
            <p className="text-3xl font-extrabold text-white mt-1">1,240+</p>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" /> 98.4% success rate
            </p>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-400 uppercase font-semibold">Avg. Resolution Speed</p>
            <p className="text-3xl font-extrabold text-white mt-1">14.5 hrs</p>
            <p className="text-[11px] text-blue-400 mt-1 flex items-center">
              <Clock className="w-3 h-3 mr-1" /> 4x faster turnaround
            </p>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-400 uppercase font-semibold">Active Departments</p>
            <p className="text-3xl font-extrabold text-white mt-1">12 Depts</p>
            <p className="text-[11px] text-purple-400 mt-1 flex items-center">
              <Building2 className="w-3 h-3 mr-1" /> IT, Hostels, Cleanliness
            </p>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <p className="text-xs text-slate-400 uppercase font-semibold">Student Satisfaction</p>
            <p className="text-3xl font-extrabold text-white mt-1">4.8 / 5.0</p>
            <p className="text-[11px] text-amber-400 mt-1">★ ★ ★ ★ ★ (890 reviews)</p>
          </div>
        </div>
      </div>

      {/* Feature Showcase Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Intelligent Campus Automation</h2>
          <p className="text-sm text-slate-400 mt-2">Powered by Google Gemini AI & Real-Time Socket Synchronization</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-blue-500/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Auto-Categorization</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Analyzes student issue description and automatically assigns appropriate category tags and priority confidence scores.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-purple-500/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Auto-Escalation Engine</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Stagnant tickets exceeding 48 hours without progress are automatically escalated to High/Critical priority with admin notifications.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-emerald-500/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Live Socket.IO Updates</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Students and admins receive instantaneous timeline updates without refreshing screens as staff work on tickets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
