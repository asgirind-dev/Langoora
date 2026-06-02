import { Outlet } from 'react-router-dom';
import { LayoutDashboard, UserCheck, ShieldAlert, FileText, AlertTriangle } from 'lucide-react';
import DashboardSidebar from '../components/layout/DashboardSidebar'; 


const navItems = [
  { label: 'Overview', path: '', icon: LayoutDashboard },
  { label: 'Tutor Verifications', path: '/tutors', icon: UserCheck },
  { label: 'Quality Audits', path: '/audits', icon: ShieldAlert },
  { label: 'Content Disputes', path: '/disputes', icon: AlertTriangle },
];

export default function AcademicValidatorLayout() {
  return (
    <div className="min-h-screen bg-[#060d1f] text-white flex">
      <DashboardSidebar navItems={navItems} basePath="/validator" />
      <main className="flex-1 ml-64 min-h-screen overflow-x-hidden">
    <div className="p-8">

          <Outlet />
        </div>
      </main>
    </div>
  );
}