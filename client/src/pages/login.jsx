import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import { Shield, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') router.push('/admin/dashboard');
      else router.push('/student/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white">Sign In to CampusVoice</h2>
          <p className="text-xs text-slate-400 mt-1">Access your complaint operations workspace</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">College Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@college.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 disabled:opacity-50 transition flex items-center justify-center space-x-2"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Login Quick Fill */}
        <div className="pt-4 border-t border-slate-800">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-purple-400 mr-1" /> Quick Demo Login Fill
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => fillDemo('student@college.edu', 'StudentPass123!')}
              className="px-2 py-1.5 rounded-lg bg-slate-800/80 text-blue-400 hover:bg-slate-700 font-medium transition text-center border border-slate-700"
            >
              Student
            </button>
            <button
              onClick={() => fillDemo('admin@college.edu', 'AdminPass123!')}
              className="px-2 py-1.5 rounded-lg bg-slate-800/80 text-purple-400 hover:bg-slate-700 font-medium transition text-center border border-slate-700"
            >
              Admin
            </button>
            <button
              onClick={() => fillDemo('staff.it@college.edu', 'StaffPass123!')}
              className="px-2 py-1.5 rounded-lg bg-slate-800/80 text-emerald-400 hover:bg-slate-700 font-medium transition text-center border border-slate-700"
            >
              IT Staff
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          Don't have a student account?{' '}
          <Link href="/register" className="text-blue-400 hover:underline font-semibold">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
