import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import PropertyCard from '../components/property/PropertyCard';
import { PropertyCardSkeleton } from '../components/common/Skeletons';

const formatNumber = (value) =>
  typeof value === 'number' ? new Intl.NumberFormat('en-IN').format(value) : value;

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">{title}</h2>
        {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function PropertyGrid({ properties, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((item) => <PropertyCardSkeleton key={item} />)}
      </div>
    );
  }

  if (!properties?.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property, index) => (
        <motion.div key={property._id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
          <PropertyCard property={property} />
        </motion.div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    api.get('/properties/home-data')
      .then(({ data }) => {
        if (mounted) setHomeData(data.data);
      })
      .catch(() => {
        if (mounted) setHomeData(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/search?search=${encodeURIComponent(query)}` : '/search');
  };

  const featured = homeData?.featured || [];
  const recentlyAdded = homeData?.recentlyAdded || [];
  const popularCities = homeData?.popularCities || [];
  const trendingLocations = homeData?.trendingLocations || [];
  const popularTypes = homeData?.popularTypes || [];
  const stats = homeData?.stats || [];
  const heroCity = popularCities[0]?.city || 'your city';

  return (
    <div className="bg-surface-secondary">
      <section className="relative min-h-[92vh] flex items-center bg-dark overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1800&q=80"
            alt="Premium rental apartment interior"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-dark" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12 w-full">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs px-4 py-1.5 rounded-full mb-6 border border-white/20">
                Live rental inventory from Rentify
              </span>
              <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold text-white leading-tight mb-6">
                Find a home that fits your life.
              </h1>
              <p className="text-white/70 text-base sm:text-lg max-w-2xl mb-8">
                Search real listings, compare localities, schedule visits, message owners, and manage the rental journey in one place.
              </p>
            </motion.div>

            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-3 max-w-2xl mb-6"
            >
              <input
                type="text"
                placeholder={`Search ${heroCity}, locality, or landmark`}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="flex-1 px-5 py-4 rounded-2xl text-sm bg-white text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
              <button type="submit" className="btn-primary px-8 py-4 rounded-2xl">
                Search Homes
              </button>
            </motion.form>

            {popularCities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {popularCities.slice(0, 6).map((city) => (
                  <Link
                    key={city.city}
                    to={`/search?city=${encodeURIComponent(city.city)}`}
                    className="text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-full border border-white/10 transition-all"
                  >
                    {city.city} · {city.listings}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {stats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mt-12">
              {stats.slice(0, 4).map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3">
                  <p className="font-display text-2xl font-bold text-white">
                    {formatNumber(stat.value)}{stat.suffix || ''}
                  </p>
                  <p className="text-xs text-white/50 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-14 space-y-16">
        {popularTypes.length > 0 && (
          <section>
            <SectionHeader title="Browse by real demand" subtitle="Property categories currently available on Rentify." />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularTypes.map((type) => (
                <Link key={type.propertyType} to={`/search?propertyType=${encodeURIComponent(type.propertyType)}`} className="bg-white rounded-3xl p-5 shadow-card hover:shadow-card-hover transition-all">
                  <p className="text-xs font-semibold text-accent mb-3">{type.listings} listings</p>
                  <h3 className="font-display text-xl font-bold">{type.propertyType}</h3>
                  <p className="text-sm text-text-muted mt-2">Avg rent Rs {formatNumber(type.averageRent)}/month</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {featured.length > 0 && (
          <section>
            <SectionHeader
              title="Featured homes"
              subtitle="Owner-highlighted listings available right now."
              action={<Link to="/search?sort=featured" className="btn-outline text-xs py-2">View all</Link>}
            />
            <PropertyGrid properties={featured} loading={loading} />
          </section>
        )}

        {trendingLocations.length > 0 && (
          <section>
            <SectionHeader title="Trending locations" subtitle="Localities with the strongest listing activity and views." />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {trendingLocations.map((location) => (
                <Link
                  key={`${location.locality}-${location.city}`}
                  to={`/search?city=${encodeURIComponent(location.city)}&search=${encodeURIComponent(location.locality)}`}
                  className="bg-white rounded-3xl p-5 shadow-card hover:shadow-card-hover transition-all"
                >
                  <h3 className="font-semibold text-lg">{location.locality}</h3>
                  <p className="text-sm text-text-muted">{location.city}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-text-muted">
                    <span>{location.listings} listings</span>
                    <span>Rs {formatNumber(location.averageRent)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {recentlyAdded.length > 0 && (
          <section>
            <SectionHeader
              title="Recently added"
              subtitle="Fresh listings from the database."
              action={<Link to="/search?sort=newest" className="btn-outline text-xs py-2">Explore latest</Link>}
            />
            <PropertyGrid properties={recentlyAdded} loading={loading} />
          </section>
        )}

        {!loading && !featured.length && !recentlyAdded.length && (
          <section className="bg-white rounded-3xl p-10 text-center shadow-card">
            <h2 className="font-display text-2xl font-bold mb-2">No active listings yet</h2>
            <p className="text-sm text-text-muted">Once owners publish properties, Rentify will build this page from live inventory.</p>
          </section>
        )}
      </main>
    </div>
  );
}
