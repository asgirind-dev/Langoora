import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, CheckCircle, XCircle, Eye, Download, GraduationCap } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

const applicants = [
  { id: 1, name: 'Akira Yamamoto', email: 'akira@example.com', exam: 'JLPT', university: 'University of Kelaniya', qualifications: 'JLPT N1, M.A. Applied Linguistics', submitted: '2024-06-08', status: 'pending', phone: '+94 77 123 4567' },
  { id: 2, name: 'Soo-Jin Lee', email: 'soojin@example.com', exam: 'TOPIK', university: 'University of Colombo', qualifications: 'TOPIK Level 6, B.Ed Korean', submitted: '2024-06-07', status: 'pending', phone: '+94 71 234 5678' },
  { id: 3, name: 'Emma Thompson', email: 'emma@example.com', exam: 'IELTS', university: 'University of Peradeniya', qualifications: 'IELTS 8.5, CELTA Certified', submitted: '2024-06-06', status: 'pending', phone: '+94 75 345 6789' },
  { id: 4, name: 'Chen Wei', email: 'chen@example.com', exam: 'HSK', university: 'SLIIT', qualifications: 'HSK Level 6, M.A. Chinese', submitted: '2024-06-05', status: 'approved', phone: '+94 76 456 7890' },
  { id: 5, name: 'Maria Santos', email: 'maria@example.com', exam: 'IELTS', university: 'Wayamba University', qualifications: 'IELTS 7.0, B.A. English', submitted: '2024-06-04', status: 'rejected', phone: '+94 70 567 8901' },
];

export default function TutorApprovalsPage() {
  const [filter, setFilter] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [list, setList] = useState(applicants);

  const filtered = filter === 'all' ? list : list.filter(t => t.status === filter);

  const updateStatus = (id, status) => {
    setList(p => p.map(t => t.id === id ? { ...t, status } : t));
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-1">Tutor Approvals</h1>
        <p className="text-gray-400">Review and approve tutor applications</p>
      </motion.div>

      <div className="flex gap-2">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${filter === f ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'}`}>
            {f} ({list.filter(t => f === 'all' ? true : t.status === f).length})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <GlassCard className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {t.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <h3 className="font-semibold text-white">{t.name}</h3>
                      <p className="text-sm text-gray-400">{t.email} · {t.phone}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge color="blue">{t.exam}</Badge>
                        <span className="text-xs text-gray-500 flex items-center gap-1"><GraduationCap size={11} />{t.university}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge color={t.status === 'approved' ? 'green' : t.status === 'rejected' ? 'red' : 'yellow'}>{t.status}</Badge>
                      <span className="text-xs text-gray-500">Submitted {t.submitted}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><GraduationCap size={12} />{t.qualifications}</p>
                  {t.status === 'pending' && (
                    <div className="flex gap-3 mt-4">
                      <Button variant="ghost" size="sm" onClick={() => { setSelected(t); setModalOpen(true); }}>
                        <Eye size={14} /> Review
                      </Button>
                      <Button variant="success" size="sm" onClick={() => updateStatus(t.id, 'approved')}>
                        <CheckCircle size={14} /> Approve
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => updateStatus(t.id, 'rejected')}>
                        <XCircle size={14} /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">No {filter} applications</div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Tutor Application Review" size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-400">Name:</span> <span className="text-white ml-2">{selected.name}</span></div>
              <div><span className="text-gray-400">Email:</span> <span className="text-white ml-2">{selected.email}</span></div>
              <div><span className="text-gray-400">Phone:</span> <span className="text-white ml-2">{selected.phone}</span></div>
              <div><span className="text-gray-400">Exam:</span> <span className="text-white ml-2">{selected.exam}</span></div>
              <div className="col-span-2"><span className="text-gray-400">University:</span> <span className="text-white ml-2">{selected.university}</span></div>
              <div className="col-span-2"><span className="text-gray-400">Qualifications:</span> <span className="text-white ml-2">{selected.qualifications}</span></div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
              <Download size={16} className="text-blue-400" />
              <span className="text-sm text-gray-300">certificate_upload.pdf</span>
              <Button variant="secondary" size="sm" className="ml-auto">View</Button>
            </div>
            <div className="flex gap-3">
              <Button variant="success" fullWidth onClick={() => updateStatus(selected.id, 'approved')}><CheckCircle size={16} /> Approve Tutor</Button>
              <Button variant="danger" fullWidth onClick={() => updateStatus(selected.id, 'rejected')}><XCircle size={16} /> Reject</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
