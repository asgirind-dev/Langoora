import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, UserCheck, UserX, Mail, Shield, CheckCircle, X, UserPlus, Building, ShieldAlert } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

// Global Privileges Registry for Academic Validators & Staff Personnel
const AVAILABLE_PRIVILEGES = [
  { key: 'verify_tutors', label: 'Verify Institutional Tutors', desc: 'Allows approving or rejecting newly registered tutors from partner academies.' },
  { key: 'audit_exams', label: 'Audit Exam Papers', desc: 'Grants control to inspect question matrix structures and verify content accuracy.' },
  { key: 'resolve_disputes', label: 'Resolve Structural Disputes', desc: 'Allows intervening in user exam answer arguments and grading recheck requests.' },
  { key: 'view_analytics', label: 'View Academic Metrics', desc: 'Exposes student aggregate performance indices belonging to the native institute.' },
];

// Initial Mock Data featuring Academic Validators & Admins
const initialUsers = [
  { id: 1, name: 'Kavindu Perera', email: 'kavindu@gmail.com', role: 'student', status: 'active', joined: '2024-01-15', activityCount: 24, institution: 'LNBTI' },
  { id: 2, name: 'Hiroshi Tanaka', email: 'hiroshi@gmail.com', role: 'tutor', status: 'active', joined: '2023-11-02', activityCount: 8, institution: 'Tokyo Language Academy' },
  { id: 3, name: 'Dilini Rajapaksa', email: 'dilini@gmail.com', role: 'student', status: 'active', joined: '2024-02-20', activityCount: 12, institution: 'LNBTI' },
  { id: 4, name: 'Soo-Jin Lee', email: 'soojin@gmail.com', role: 'tutor', status: 'pending', joined: '2024-06-07', activityCount: 0, institution: 'Private' },
  { id: 5, name: 'Tharaka Fernando', email: 'tharaka@gmail.com', role: 'student', status: 'suspended', joined: '2024-03-10', activityCount: 5, institution: 'LNBTI' },
  { id: 6, name: 'Sarah Williams', email: 'sarah@gmail.com', role: 'tutor', status: 'active', joined: '2023-09-14', activityCount: 15, institution: 'British Council' },
  { 
    id: 7, 
    name: 'Prof. Anura de Silva', 
    email: 'anura.validator@lnbti.lk', 
    role: 'validator', 
    status: 'active', 
    joined: '2025-02-10', 
    activityCount: 42, 
    institution: 'LNBTI',
    privileges: ['verify_tutors', 'audit_exams'] 
  }
];

export default function UserManagementPage() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal Governance States
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPrivilegeModalOpen, setIsPrivilegeModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State for Provisioning New Staff (Validator/Admin)
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    role: 'validator', // Default to validator profile creation
    institution: 'LNBTI',
    privileges: []
  });
  const [formError, setFormError] = useState('');

  const toggleSuspend = (id) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const targetStatus = u.status === 'suspended' ? 'active' : 'suspended';
        return { ...u, status: targetStatus };
      }
      return u;
    }));
  };

  const handleRoleChange = (id, newRole) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        // Automatically attach structural default privileges if promoted to a validator node
        const privileges = newRole === 'validator' ? ['verify_tutors'] : undefined;
        return { ...u, role: newRole, privileges };
      }
      return u;
    }));
  };

  // --- Manage Existing Privileges Logic ---
  const openPrivilegeModal = (user) => {
    setSelectedUser({ ...user, privileges: user.privileges || [] });
    setIsPrivilegeModalOpen(true);
  };

  const handleToggleExistingPrivilege = (privilegeKey) => {
    setSelectedUser(prev => {
      const exists = prev.privileges.includes(privilegeKey);
      const updated = exists 
        ? prev.privileges.filter(p => p !== privilegeKey)
        : [...prev.privileges, privilegeKey];
      return { ...prev, privileges: updated };
    });
  };

  const savePrivileges = () => {
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? selectedUser : u));
    setIsPrivilegeModalOpen(false);
  };

  // --- Provisioning New User Logic ---
  const handleToggleFormPrivilege = (privilegeKey) => {
    setCreateForm(prev => {
      const exists = prev.privileges.includes(privilegeKey);
      const updated = exists
        ? prev.privileges.filter(p => p !== privilegeKey)
        : [...prev.privileges, privilegeKey];
      return { ...prev, privileges: updated };
    });
  };

  const handleProvisionUser = (e) => {
    e.preventDefault();
    setFormError('');

    // Structural Validation
    if (!createForm.name.trim() || !createForm.email.trim()) {
      setFormError('Full Name and Official Email fields are mandatory.');
      return;
    }

    const newUserNode = {
      id: Date.now(), // Generate a unique identifier runtime token
      name: createForm.name,
      email: createForm.email.toLowerCase().trim(),
      role: createForm.role,
      status: 'active', // Immediate active access clearance to bypass router guards
      joined: new Date().toISOString().split('T')[0],
      activityCount: 0,
      institution: createForm.role === 'admin' ? 'System Operations' : createForm.institution,
      privileges: createForm.role === 'student' ? undefined : createForm.privileges
    };

    setUsers(prev => [newUserNode, ...prev]);
    setIsCreateModalOpen(false);
    
    // Clear Form State
    setCreateForm({ name: '', email: '', role: 'validator', institution: 'LNBTI', privileges: [] });
  };

  const filtered = users.filter(u => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase()) && !u.institution.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    return true;
  });

  const getActivityLabel = (role) => {
    if (role === 'tutor') return 'Exams Authored';
    if (role === 'validator') return 'Quality Audits';
    if (role === 'admin') return 'System Changes';
    return 'Exams Bought';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-white mb-1">User Management</h1>
          <p className="text-gray-400">Manage platform users, modify roles, and govern granular administrative access controls</p>
        </motion.div>
        
        {/* Provision Staff Action Button */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Button 
            variant="primary" 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/10 text-xs py-2.5"
          >
            <UserPlus size={15} /> Provision Staff Account
          </Button>
        </motion.div>
      </div>

      {/* Counters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Platform Students', value: '18,920', icon: Users, color: 'text-blue-400' },
          { label: 'Active Tutors & Staff', value: users.filter(u => u.role !== 'student').length, icon: UserCheck, color: 'text-emerald-400' },
          { label: 'Suspended Accounts', value: users.filter(u => u.status === 'suspended').length, icon: UserX, color: 'text-red-400' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <GlassCard className="p-4 flex items-center gap-4 border-white/10">
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

      {/* Filter Options */}
      <GlassCard className="p-6 border-white/10">
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex-1 min-w-48">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" placeholder="Search by name, email or partner institute (e.g., LNBTI)..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pl-9 text-white text-sm focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['all', 'student', 'tutor', 'validator', 'admin'].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${roleFilter === r ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
                {r === 'validator' ? 'Validator' : r}
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

        {/* Data Matrix Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs font-medium text-gray-500">
                <th className="pb-3 pr-4">User Details & Institute</th>
                <th className="pb-3 pr-4">System Role</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Joined</th>
                <th className="pb-3 pr-4 text-center">Metrics Context</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-white/3 transition-colors">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{u.name}</p>
                        <p className="text-[11px] text-gray-400 font-mono">{u.email}</p>
                        <span className="text-[10px] text-indigo-400 font-semibold">{u.institution}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-sm">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="bg-[#0f1629] text-xs border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="student">Student</option>
                      <option value="tutor">Tutor</option>
                      <option value="validator">Academic Validator</option>
                      <option value="admin">System Admin</option>
                    </select>
                  </td>
                  <td className="py-4 pr-4 text-sm">
                    <Badge color={u.status === 'active' ? 'green' : u.status === 'pending' ? 'yellow' : 'red'}>
                      {u.status}
                    </Badge>
                  </td>
                  <td className="py-4 pr-4 text-xs text-gray-500">{u.joined}</td>
                  <td className="py-4 pr-4 text-xs text-center font-mono text-gray-300">
                    <span className="block font-bold">{u.activityCount}</span>
                    <span className="text-[10px] text-gray-500 font-sans">{getActivityLabel(u.role)}</span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Governance Trigger Button */}
                      {(u.role === 'validator' || u.role === 'admin') && (
                        <Button 
                          variant="secondary" 
                          className="px-2.5 py-1.5 text-xs border border-blue-500/30 text-blue-300 flex items-center gap-1 bg-blue-500/5 hover:bg-blue-500/10"
                          onClick={() => openPrivilegeModal(u)}
                        >
                          <Shield size={12} /> Governance
                        </Button>
                      )}
                      
                      <Button variant="ghost" size="sm" className="p-2 border border-white/10 hover:bg-white/5" title="Email User">
                        <Mail size={13} className="text-gray-300" />
                      </Button>
                      <Button 
                        variant={u.status === 'suspended' ? 'success' : 'danger'} 
                        size="sm" 
                        onClick={() => toggleSuspend(u.id)}
                      >
                        {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-gray-500 text-sm py-8">Zero entries matches current system lookup parameters.</p>
          )}
        </div>
      </GlassCard>

      {/* ========================================================
          OPTION 1: PROVISION NEW STAFF USER ACCOUNT MODAL DIALOG
          ======================================================== */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <GlassCard className="w-full max-w-lg p-6 border-white/20 bg-[#0a101f] shadow-2xl overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-md font-bold text-white flex items-center gap-2">
                      <UserPlus className="text-blue-400" size={18} /> Provision Institutional Staff Node
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Initialize authentic internal staff identities into the system repository.</p>
                  </div>
                  <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleProvisionUser} className="space-y-4">
                  {formError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl flex items-center gap-1.5">
                      <ShieldAlert size={14} /> {formError}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Staff Full Name</label>
                    <input 
                      type="text" required placeholder="e.g., Dr. Samantha Silva"
                      value={createForm.name} onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-300">Official Corporate Email</label>
                    <input 
                      type="email" required placeholder="e.g., samantha@lnbti.lk"
                      value={createForm.email} onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-300">Administrative Role</label>
                      <select
                        value={createForm.role} onChange={e => setCreateForm(p => ({ ...p, role: e.target.value, privileges: [] }))}
                        className="w-full bg-[#0f1629] border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50"
                      >
                        <option value="validator">Academic Validator</option>
                        <option value="admin">System Admin</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-300">Affiliated Institution</label>
                      <div className="relative">
                        <Building size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                          type="text" disabled={createForm.role === 'admin'}
                          value={createForm.role === 'admin' ? 'Internal Operations' : createForm.institution}
                          onChange={e => setCreateForm(p => ({ ...p, institution: e.target.value }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 pl-9 text-white text-sm focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Privilege Authorization Section */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <label className="text-xs font-bold text-gray-300 block">Grant Functional Operations Permissions</label>
                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                      {AVAILABLE_PRIVILEGES.map((p) => {
                        const isChecked = createForm.privileges.includes(p.key);
                        return (
                          <div 
                            key={p.key} onClick={() => handleToggleFormPrivilege(p.key)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                              isChecked ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/5 hover:border-white/10'
                            }`}
                          >
                            <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isChecked ? 'bg-blue-500 border-blue-500' : 'border-gray-500'}`}>
                              {isChecked && <CheckCircle size={12} className="text-white" />}
                            </div>
                            <div>
                              <div className={`text-xs font-semibold ${isChecked ? 'text-blue-300' : 'text-gray-200'}`}>{p.label}</div>
                              <div className="text-[10px] text-gray-400 leading-tight mt-0.5">{p.desc}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                    <Button type="submit" variant="success" size="sm" className="bg-emerald-600 hover:bg-emerald-500">Provision Authority</Button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
          OPTION 2: ACCESS GOVERNANCE FOR EXISTING PERSONNEL MODAL DIALOG
          ======================================================== */}
      <AnimatePresence>
        {isPrivilegeModalOpen && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <GlassCard className="w-full max-w-md p-6 border-white/20 bg-[#0a101f] shadow-2xl">
                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-md font-bold text-white flex items-center gap-2">
                      <Shield className="text-indigo-400" size={18} /> Personnel Access Governance
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">{selectedUser.name} • {selectedUser.institution}</p>
                  </div>
                  <button onClick={() => setIsPrivilegeModalOpen(false)} className="text-gray-400 hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                <p className="text-xs text-gray-400 mb-4">
                  Modify dynamic infrastructure capabilities permitted for this active staff node lifecycle.
                </p>

                <div className="space-y-3 mb-6">
                  {AVAILABLE_PRIVILEGES.map((p) => {
                    const isChecked = selectedUser.privileges.includes(p.key);
                    return (
                      <div 
                        key={p.key} onClick={() => handleToggleExistingPrivilege(p.key)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isChecked ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${isChecked ? 'bg-indigo-500 border-indigo-500' : 'border-gray-500'}`}>
                          {isChecked && <CheckCircle size={12} className="text-white" />}
                        </div>
                        <div>
                          <div className={`text-xs font-semibold ${isChecked ? 'text-indigo-300' : 'text-gray-200'}`}>{p.label}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{p.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsPrivilegeModalOpen(false)}>Cancel</Button>
                  <Button variant="success" size="sm" onClick={savePrivileges}>Save Configuration</Button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}