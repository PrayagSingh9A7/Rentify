import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success('Welcome back! 🏠');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-dark relative overflow-hidden items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80"
          alt="home"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark/70 to-accent/20" />
        <div className="relative z-10 max-w-sm text-center px-8">
          <Link to="/" className="flex items-center gap-2 justify-center mb-10">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <span className="font-display font-bold text-2xl text-white">rentify</span>
          </Link>
          <h2 className="font-display text-3xl font-bold text-white mb-4 leading-snug">
            "Found my dream PG within 2 days!"
          </h2>
          <p className="text-white/50 text-sm">— Priya Sharma, Software Engineer, Bangalore</p>
          <div className="flex justify-center gap-1 mt-4">
            {[1,2,3,4,5].map(i => <span key={i} className="text-amber-400 text-lg">★</span>)}
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
              <span className="font-display font-bold text-xl text-text-primary">rentify</span>
            </Link>
            <h1 className="font-display text-3xl font-bold text-text-primary mb-1">Welcome back</h1>
            <p className="text-text-secondary text-sm">Sign in to find your perfect home</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
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
                    placeholder="••••••••"
                    className="input-field pr-10"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
                <div className="text-right mt-1">
                  <Link to="/forgot-password" className="text-xs text-accent hover:underline">Forgot password?</Link>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mt-2">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-text-muted">
                Don't have an account?{' '}
                <Link to="/register" className="text-accent font-medium hover:underline">Create one free</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}