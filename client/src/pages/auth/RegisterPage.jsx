import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: searchParams.get('role') || 'tenant',
  });
  const [showPass, setShowPass] = useState(false);
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    const result = await register(form.name, form.email, form.password, form.role);
    if (result.success) {
      toast.success('Account created! Welcome to rentify 🏠');
      navigate(form.role === 'owner' ? '/dashboard' : '/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-dark relative overflow-hidden items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80"
          alt="home"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark/60 to-accent/15" />
        <div className="relative z-10 max-w-sm text-center px-8">
          <Link to="/" className="flex items-center gap-2 justify-center mb-10">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <span className="font-display font-bold text-2xl text-white">rentify</span>
          </Link>
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Join 2 lakh+ tenants finding great homes
          </h2>
          <div className="grid grid-cols-2 gap-3 mt-8">
            {['Zero Brokerage', 'Verified Owners', 'Instant Chat', 'AI Advisor'].map((f) => (
              <div key={f} className="glass-dark rounded-2xl px-4 py-2.5 text-sm text-white/70 text-center">{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-20 bg-surface-secondary">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link to="/" className="lg:hidden flex items-center gap-2 justify-center mb-6">
              <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="font-display font-bold text-xl">rentify</span>
            </Link>
            <h1 className="font-display text-3xl font-bold mb-1">Create Account</h1>
            <p className="text-text-secondary text-sm">Free forever. No credit card needed.</p>
          </div>

          <div className="card p-8">
            {/* Role selector */}
            <div className="flex gap-2 p-1 bg-surface-secondary rounded-2xl mb-5">
              {[
                { value: 'tenant', label: '🔍 I\'m Looking' },
                { value: 'owner', label: '🏠 I\'m an Owner' },
              ].map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    form.role === r.value ? 'bg-white shadow-card text-text-primary' : 'text-text-muted hover:text-text-secondary'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Rahul Sharma"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="rahul@example.com"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="input-field pr-10"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  className="input-field"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Creating account...
                  </span>
                ) : `Create ${form.role === 'owner' ? 'Owner' : 'Tenant'} Account`}
              </button>
            </form>

            <p className="text-xs text-text-muted text-center mt-4">
              By signing up, you agree to our{' '}
              <span className="text-accent cursor-pointer hover:underline">Terms</span> &{' '}
              <span className="text-accent cursor-pointer hover:underline">Privacy Policy</span>
            </p>

            <div className="mt-5 text-center">
              <p className="text-sm text-text-muted">
                Already have an account?{' '}
                <Link to="/login" className="text-accent font-medium hover:underline">Sign in</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}