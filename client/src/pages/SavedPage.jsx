import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import PropertyCard from '../components/property/PropertyCard';
import { PageSkeleton } from '../components/common/Skeletons';

export default function SavedPage() {
  const [saved, setSaved] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('saved');

  useEffect(() => {
    Promise.all([
      api.get('/users/saved'),
      api.get('/users/recently-viewed'),
    ]).then(([savedRes, recentRes]) => {
      setSaved(savedRes.data.data);
      setRecent(recentRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const list = tab === 'saved' ? saved : recent;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 min-h-screen">
      <h1 className="font-display text-3xl font-bold mb-2">My Homes</h1>
      <p className="text-text-secondary text-sm mb-8">Your saved and recently viewed properties</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {[
          { key: 'saved', label: `❤️ Saved (${saved.length})` },
          { key: 'recent', label: `🕐 Recently Viewed (${recent.length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 rounded-2xl text-sm font-medium border transition-all ${
              tab === t.key ? 'bg-accent text-white border-accent' : 'bg-white border-surface-tertiary text-text-secondary hover:border-accent/50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <PageSkeleton count={6} />
      ) : list.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">{tab === 'saved' ? '❤️' : '🕐'}</p>
          <h3 className="font-display text-xl font-semibold mb-2">
            {tab === 'saved' ? 'No saved properties yet' : 'No recently viewed properties'}
          </h3>
          <p className="text-text-muted text-sm mb-6">
            {tab === 'saved' ? 'Browse and save properties you like' : 'Properties you view will appear here'}
          </p>
          <Link to="/search" className="btn-primary">Explore Properties</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((p, i) => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <PropertyCard property={p} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}