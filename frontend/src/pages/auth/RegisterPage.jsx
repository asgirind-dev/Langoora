import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Phone, Calendar, GraduationCap, Upload, MapPin, ArrowRight, Chrome, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  
  const { register, loginWithGoogle } = useAuth(); // 🔥 Destructured loginWithGoogle
  
  const [role, setRole] = useState(params.get('role') || 'student');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', dob: '',
    qualifications: '', university: '', address: '', certificate: null,
  });

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.type === 'file' ? e.target.files[0] : e.target.value }));

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => resolve(fileReader.result);
      fileReader.onerror = (error) => reject(error);
    });
  };

  const validate = () => {
    const e = {};
    if (!form.name) e.name = 'Full name is required';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.password || form.password.length < 8) e.password = 'Minimum 8 characters';
    if (!form.phone) e.phone = 'Phone number is required';
    if (!form.dob) e.dob = 'Date of birth is required';
    if (role === 'tutor') {
      if (!form.qualifications) e.qualifications = 'Qualifications required';
      if (!form.university) e.university = 'University required';
      if (!form.certificate) e.certificate = 'Certificate file is required';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    
    setLoading(true);
    setErrors({});

    try {
      let certificateBase64 = '';
      if (role === 'tutor' && form.certificate) {
        certificateBase64 = await convertToBase64(form.certificate);
      }

      const userData = {
        name: form.name,
        phone: form.phone,
        dob: form.dob,
        ...(role === 'tutor' && {
          university: form.university,
          qualifications: form.qualifications,
          address: form.address || '',
          certificateData: certificateBase64
        })
      };

      await register(form.email, form.password, userData, role);
      
      if (role === 'tutor') {
        navigate('/auth/under-review');
      } else {
        navigate('/student');
      }
    } catch (err) {
      console.error("Registration workflow failure:", err);
      setErrors({ server: err.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // 🔥 NEW: Google Action Redirect Handler for Registration route
  const handleGoogleClick = async () => {
    setLoading(true);
    setErrors({});
    try {
      // Because backend intercepts missing documents and injects default "student" layout roles
      await loginWithGoogle();
      navigate('/student');
    } catch (err) {
      console.error("Google authentication registration failed:", err);
      setErrors({ server: err.message || "Google single sign-on system breakdown." });
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'student', label: 'Student', icon: BookOpen, desc: 'Prepare for language exams and track your progress' },
    { id: 'tutor', label: 'Tutor', icon: GraduationCap, desc: 'Create and sell exam packs, earn from your expertise' },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-2">Create your account</h2>
      <p className="text-gray-400 mb-8">Join 24,000+ learners on Langoora</p>

      {errors.server && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl text-xs mb-5">
          {errors.server}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-8">
        {roles.map(r => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRole(r.id)}
            className={`p-4 rounded-xl border text-left transition-all ${
              role === r.id
                ? 'border-blue-500/60 bg-blue-500/10 text-white'
                : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
            }`}
          >
            <r.icon size={20} className={`mb-2 ${role === r.id ? 'text-blue-400' : 'text-gray-500'}`} />
            <p className="font-semibold text-sm">{r.label}</p>
            <p className="text-xs mt-0.5 opacity-70">{r.desc}</p>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full Name" placeholder="Kavindu Perera" icon={User} value={form.name} onChange={set('name')} error={errors.name} />
        <Input label="Email Address" type="email" placeholder="you@example.com" icon={Mail} value={form.email} onChange={set('email')} error={errors.email} />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-300">Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={set('password')}
              className={`w-full bg-white/5 border ${errors.password ? 'border-red-500/60' : 'border-white/10'} rounded-xl px-4 py-3 pl-10 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/60 text-sm`}
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Phone Number" type="tel" placeholder="+94 7X XXX XXXX" icon={Phone} value={form.phone} onChange={set('phone')} error={errors.phone} />
          <Input label="Date of Birth" type="date" icon={Calendar} value={form.dob} onChange={set('dob')} error={errors.dob} />
        </div>

        <AnimatePresence>
          {role === 'tutor' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <Input label="Qualifications" placeholder="B.Ed Japanese, MA Linguistics..." icon={GraduationCap} value={form.qualifications} onChange={set('qualifications')} error={errors.qualifications} />
              <Input label="University / Institution" placeholder="University of Colombo" icon={GraduationCap} value={form.university} onChange={set('university')} error={errors.university} />
              <Input label="Address" placeholder="No. 12, Main Street, Colombo 03" icon={MapPin} value={form.address} onChange={set('address')} />
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-300">Certificate Upload</label>
                <label className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-dashed border-white/20 rounded-xl cursor-pointer hover:border-blue-500/40 transition-colors">
                  <Upload size={18} className="text-blue-400" />
                  <span className="text-sm text-gray-400">{form.certificate ? form.certificate.name : 'Upload qualification certificate (PDF/JPG)'}</span>
                  <input type="file" accept=".pdf,.jpg,.png" onChange={set('certificate')} className="hidden" />
                </label>
                {errors.certificate && <p className="text-xs text-red-400 mt-0.5">{errors.certificate}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
          {loading ? 'Creating account...' : <>Create Account <ArrowRight size={18} /></>}
        </Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
          <div className="relative flex justify-center"><span className="bg-[#060d1f] px-3 text-gray-500 text-sm">or</span></div>
        </div>

        {/* 🔥 FIXED: Wired Google Popup interface action */}
        <Button variant="secondary" size="lg" fullWidth type="button" onClick={handleGoogleClick} disabled={loading}>
          <Chrome size={18} className="text-blue-400" /> Continue with Google
        </Button>
      </form>

      <p className="text-center text-gray-400 text-sm mt-6">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
      </p>
    </div>
  );
}