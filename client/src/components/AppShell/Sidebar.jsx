import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  FilePlus,
  ListFilter,
  BarChart3,
  Building2,
  Settings,
  ShieldAlert,
} from 'lucide-react';

const Sidebar = () => {
  const router = useRouter();
  const { user } = useAuthStore();

  if (!user) return null;

  const studentLinks = [
    { label: 'Overview Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Submit Complaint', href: '/student/complaints/new', icon: FilePlus },
    { label: 'My Complaints', href: '/student/complaints', icon: ListFilter },
    { label: 'Account Settings', href: '/settings', icon: Settings },
  ];

  const adminLinks = [
    { label: 'Admin Command Center', href: '/admin/dashboard', icon: ShieldAlert },
    { label: 'Department Management', href: '/admin/departments', icon: Building2 },
    { label: 'Analytics & Reports', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const staffLinks = [
    { label: 'Assigned Work Queue', href: '/student/complaints', icon: ListFilter },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const links = user.role === 'admin' ? adminLinks : user.role === 'staff' ? staffLinks : studentLinks;

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 min-h-[calc(100vh-4rem)] p-4 hidden md:block">
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          {user.role} Navigation
        </p>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = router.pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
