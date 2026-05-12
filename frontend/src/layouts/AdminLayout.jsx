import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, UserCheck, DollarSign, BookOpen, Activity, Shield } from 'lucide-react';
import DashboardSidebar from '../components/layout/DashboardSidebar';

const navItems = [
  { label: 'Dashboard', path: '', icon: LayoutDashboard },
  { label: 'Users', path: '/users', icon: Users },
  { label: 'Tutor Approvals', path: '/approvals', icon: UserCheck },
  { label: 'Exams', path: '/exams', icon: BookOpen },
  { label: 'Revenue', path: '/revenue', icon: DollarSign },
  { label: 'Audit Logs', path: '/logs', icon: Activity },
  { label: 'Security', path: '/security', icon: Shield },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#060d1f] text-white flex">
      <DashboardSidebar navItems={navItems} basePath="/admin" />
      <main className="flex-1 ml-64 min-h-screen overflow-x-hidden">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
