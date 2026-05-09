import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import PropertyCard from '../components/property/PropertyCard';
import { PropertyCardSkeleton } from '../components/common/Skeletons';

import properties from '../data/properties';

const HERO_CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata'];

const STATS = [
  { value: '50,000+', label: 'Verified Listings' },
  { value: '2L+', label: 'Happy Tenants' },
  { value: '25+', label: 'Cities' },
  { value: '4.8★', label: 'App Rating' },
];

const CATEGORIES = [
  { type: 'pg', label: 'PG / Hostel', icon: '🏠', desc: 'All-inclusive stays', color: 'from-purple-400 to-purple-600' },
  { type: 'flat', label: 'Full Flat', icon: '🏢', desc: '1BHK, 2BHK, 3BHK', color: 'from-blue-400 to-blue-600' },
  { type: 'room', label: 'Single Room', icon: '🛏️', desc: 'Private rooms', color: 'from-green-400 to-green-600' },
  { type: 'studio', label: 'Studio', icon: '🏙️', desc: 'Compact & cozy', color: 'from-pink-400 to-pink-600' },
  { type: 'villa', label: 'Villa', icon: '🏡', desc: 'Premium spaces', color: 'from-amber-400 to-amber-600' },
];

const FEATURES = [
  { icon: '🔐', title: 'Zero Brokerage', desc: 'Connect directly with owners. No hidden fees or middlemen.' },
  { icon: '✅', title: 'Verified Properties', desc: 'Every listing is physically verified by our team.' },
  { icon: '🤖', title: 'AI-Powered Search', desc: 'Smart recommendations based on your preferences and budget.' },
  { icon: '💬', title: 'Realtime Chat', desc: 'Chat instantly with owners. Schedule visits seamlessly.' },
  { icon: '🗺️', title: 'Nearby Essentials', desc: 'Metro, grocery, gym, cafes — all mapped out for you.' },
  { icon: '💰', title: 'Expense Predictor', desc: 'Know your total monthly cost before you move in.' },
];

export default function HomePage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Dummy data for now
  const featured = properties;
  const loading = false;

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?search=${encodeURIComponent(search)}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center bg-dark overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&q=80"
            alt="bg"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark/60 via-dark/40 to-dark" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs px-4 py-1.5 rounded-full mb-6 border border-white/20">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              50,000+ verified listings across 25 cities
            </span>

            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              Find your perfect
              <span className="block text-accent italic">home away</span>
              from home
            </h1>

            <p className="text-white/60 text-base sm:text-lg max-w-xl mx-auto mb-10">
              PGs, flats, rooms — verified & zero brokerage. For students, professionals and families.
            </p>
          </motion.div>

          {/* Search */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-10"
          >
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by city, locality or landmark..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl text-sm bg-white text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>

            <button
              type="submit"
              className="bg-accent text-white px-8 py-4 rounded-2xl font-semibold text-sm hover:bg-accent-dark transition-all active:scale-95"
            >
              Search Homes
            </button>
          </motion.form>

          {/* Cities */}
          <div className="flex flex-wrap justify-center gap-2 mb-16">
            <span className="text-white/40 text-xs pt-1">Popular:</span>

            {HERO_CITIES.map((city) => (
              <Link
                key={city}
                to={`/search?city=${city}`}
                className="text-xs text-white/60 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-full border border-white/10 transition-all"
              >
                {city}
              </Link>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/40 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold mb-2">
            Browse by Type
          </h2>

          <p className="text-text-secondary text-sm">
            Find exactly what suits your lifestyle
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.type}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={`/search?type=${cat.type}`}
                className="block card p-5 text-center"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-xl mb-3 mx-auto`}>
                  {cat.icon}
                </div>

                <h3 className="font-semibold text-sm text-text-primary">
                  {cat.label}
                </h3>

                <p className="text-xs text-text-muted mt-0.5">
                  {cat.desc}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-3xl font-bold mb-2">
              Featured Homes
            </h2>

            <p className="text-text-secondary text-sm">
              Hand-picked premium properties
            </p>
          </div>

          <Link
            to="/search"
            className="btn-outline text-xs py-2"
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured?.map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}