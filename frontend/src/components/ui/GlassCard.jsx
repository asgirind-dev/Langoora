import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', hover = false, onClick }) {
  const base = 'bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl';
  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
        className={`${base} cursor-pointer ${className}`}
      >
        {children}
      </motion.div>
    );
  }
  return (
    <div className={`${base} ${className}`}>
      {children}
    </div>
  );
}
