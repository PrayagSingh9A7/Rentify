import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';

const Logo = () => (
  <Link to="/" className="flex items-center gap-2 group">
    <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
      <span className="text-white font-bold text-lg">N</span>
    </div>
    <span className="font-display font-bold text-xl text-text-primary">rentify</span>
  </Link>
);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout, isOwner } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/search', label: 'Explore' },
    { to: '/ai-advisor', label: '✨ AI Advisor' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-glass border-b border-white/40' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Logo />

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors ${
                location.pathname === link.to ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {isOwner() && (
                <Link to="/dashboard" className="btn-secondary text-xs py-2">
                  Dashboard
                </Link>
              )}
              <Link to="/chat" className="relative p-2 hover:bg-surface-tertiary rounded-xl transition-colors">
                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </Link>
              <Link to="/saved" className="p-2 hover:bg-surface-tertiary rounded-xl transition-colors">
                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Link>
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-2xl border border-surface-tertiary bg-white hover:shadow-card transition-all"
                >
                  <div className="w-7 h-7 rounded-xl overflow-hidden bg-accent/10">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-accent font-bold text-xs">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-text-primary">{user.name?.split(' ')[0]}</span>
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-card-hover border border-surface-tertiary overflow-hidden"
                    >
                      <div className="p-3 border-b border-surface-secondary">
                        <p className="text-sm font-medium text-text-primary">{user.name}</p>
                        <p className="text-xs text-text-muted">{user.email}</p>
                      </div>
                      {[
                        { to: '/profile', label: 'My Profile' },
                        { to: '/saved', label: 'Saved Homes' },
                        { to: '/chat', label: 'Messages' },
                        { to: '/maintenance', label: 'Maintenance' },
                        ...(isOwner() ? [{ to: '/dashboard', label: 'Owner Dashboard' }] : []),
                      ].map((item) => (
                        <Link key={item.to} to={item.to} className="block px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors">
                          {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-surface-secondary"
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary text-xs py-2">Sign In</Link>
              <Link to="/register" className="btn-primary text-xs py-2">List Your Space</Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-white/40 px-4 pb-4"
          >
            <div className="flex flex-col gap-2 pt-3">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className="block py-2.5 px-3 text-sm font-medium text-text-secondary hover:text-text-primary rounded-xl hover:bg-surface-secondary transition-all">
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link to="/profile" className="block py-2.5 px-3 text-sm text-text-secondary hover:bg-surface-secondary rounded-xl">Profile</Link>
                  <Link to="/saved" className="block py-2.5 px-3 text-sm text-text-secondary hover:bg-surface-secondary rounded-xl">Saved</Link>
                  <Link to="/chat" className="block py-2.5 px-3 text-sm text-text-secondary hover:bg-surface-secondary rounded-xl">Messages</Link>
                  {isOwner() && <Link to="/dashboard" className="block py-2.5 px-3 text-sm text-text-secondary hover:bg-surface-secondary rounded-xl">Dashboard</Link>}
                  <button onClick={handleLogout} className="text-left py-2.5 px-3 text-sm text-red-500 hover:bg-red-50 rounded-xl">Sign Out</button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link to="/login" className="flex-1 btn-secondary text-center text-xs py-2.5">Sign In</Link>
                  <Link to="/register" className="flex-1 btn-primary text-center text-xs py-2.5">Register</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}