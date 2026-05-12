import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Users, UserCheck, UserX, MoreHorizontal, Mail, Shield } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';

const mockUsers = [
  { id: 1, name: 'Kavindu Perera', email: 'kavindu@gmail.com', role: 'student', status: 'active', joined: '2024-01-15', exams: 24 },
  { id: 2, name: 'Hiroshi Tanaka', email: 'hiroshi@gmail.com', role: 'tutor', status: 'active', joined: '2023-11-02', exams: 8 },
  { id: 3, name: 'Dilini Rajapaksa', email: 'dilini@gmail.com', role: 'student', status: 'active', joined: '2024-02-20', exams: 12 },
  { id: 4, name: 'Soo-Jin Lee', email: 'soojin@gmail.com', role: 'tutor', status: 'pending', joined: '2024-06-07', exams: 0 },
  { id: 5, name: 'Tharaka Fernando', email: 'tharaka@gmail.com', role: 'student', status: 'suspended', joined: '2024-03-10', exams: 5 },
  { id: 6, name: 'Sarah Williams', email: 'sarah@gmail.com', role: 'tutor', status: 'active', joined: '2023-09-14', exams: 15 },
];

export default function UserManagementPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = mockUsers.filter(u => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-1">User Management</h1>
        <p className="text-gray-400">Manage all platform users and their access</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Students', value: '18,920', icon: Users, color: 'text-blue-400' },
          { label: 'Active Tutors', value: '342', icon: UserCheck, color: 'text-emerald-400' },
          { label: 'Suspended', value: '28', icon: UserX, color: 'text-red-400' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <GlassCard className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                <s.icon size={18} className={s.color} />
              </div>
              <div>
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <GlassCard className="p-6">
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex-1 min-w-48">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" placeholder="Search users..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pl-9 text-white text-sm focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['all', 'student', 'tutor'].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${roleFilter === r ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
                {r}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'pending', 'suspended'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${statusFilter === s ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {['User', 'Role', 'Status', 'Joined', 'Exams', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-white/3 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <Badge color={u.role === 'tutor' ? 'cyan' : 'blue'}>{u.role}</Badge>
                  </td>
                  <td className="py-3 pr-4">
                    <Badge color={u.status === 'active' ? 'green' : u.status === 'pending' ? 'yellow' : 'red'}>{u.status}</Badge>
                  </td>
                  <td className="py-3 pr-4 text-xs text-gray-500">{u.joined}</td>
                  <td className="py-3 pr-4 text-sm text-gray-300">{u.exams}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"><Mail size={14} /></button>
                      {u.status === 'active' ? (
                        <button className="px-2 py-1 text-xs bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors">Suspend</button>
                      ) : u.status === 'suspended' ? (
                        <button className="px-2 py-1 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-colors">Unsuspend</button>
                      ) : (
                        <button className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors">Approve</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
