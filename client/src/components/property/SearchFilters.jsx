import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import usePropertyStore from '../../store/propertyStore';

const PROPERTY_TYPES = ['pg', 'flat', 'room', 'villa', 'studio', 'hostel'];
const FURNISHING_OPTS = ['furnished', 'semi-furnished', 'unfurnished'];
const GENDER_OPTS = ['any', 'male', 'female'];
const AMENITIES_LIST = ['wifi', 'ac', 'parking', 'gym', 'pool', 'laundry', 'security', 'elevator', 'cooking', 'tv'];

export default function SearchFilters({ onSearch }) {
  const { filters, setFilters, resetFilters } = usePropertyStore();
  const [expanded, setExpanded] = useState(false);

  const handleChange = (key, value) => {
    setFilters({ [key]: value === filters[key] ? '' : value });
  };

  const handleSearch = () => {
    onSearch?.();
  };

  const toggleAmenity = (a) => {
    const current = filters.amenities ? filters.amenities.split(',') : [];
    const updated = current.includes(a) ? current.filter((x) => x !== a) : [...current, a];
    setFilters({ amenities: updated.join(',') });
  };

  const activeCount = [
    filters.type, filters.furnishing, filters.genderPreference,
    filters.minRent, filters.maxRent, filters.amenities,
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-3xl shadow-card p-5 mb-6">
      {/* Main search row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search city, locality, landmark..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="input-field pl-10"
          />
        </div>
        <input
          type="text"
          placeholder="City"
          value={filters.city}
          onChange={(e) => setFilters({ city: e.target.value })}
          className="input-field w-full sm:w-40"
        />
        <button onClick={handleSearch} className="btn-primary whitespace-nowrap">
          Search
        </button>
      </div>

      {/* Quick type filters */}
      <div className="flex gap-2 flex-wrap mb-4">
        {PROPERTY_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => handleChange('type', t)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filters.type === t
                ? 'bg-accent text-white border-accent'
                : 'bg-surface-secondary text-text-secondary border-surface-tertiary hover:border-accent hover:text-accent'
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all ml-auto flex items-center gap-1 ${
            expanded ? 'bg-accent/10 text-accent border-accent/20' : 'bg-surface-secondary text-text-secondary border-surface-tertiary'
          }`}
        >
          Filters {activeCount > 0 && <span className="bg-accent text-white rounded-full w-4 h-4 inline-flex items-center justify-center text-[10px]">{activeCount}</span>}
          <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Advanced filters */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-surface-secondary pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Budget */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-2">Budget (₹/month)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minRent}
                    onChange={(e) => setFilters({ minRent: e.target.value })}
                    className="input-field py-2 text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxRent}
                    onChange={(e) => setFilters({ maxRent: e.target.value })}
                    className="input-field py-2 text-xs"
                  />
                </div>
              </div>

              {/* Furnishing */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-2">Furnishing</label>
                <div className="flex flex-wrap gap-1.5">
                  {FURNISHING_OPTS.map((f) => (
                    <button
                      key={f}
                      onClick={() => handleChange('furnishing', f)}
                      className={`px-3 py-1.5 rounded-xl text-xs border transition-all capitalize ${
                        filters.furnishing === f ? 'bg-accent text-white border-accent' : 'border-surface-tertiary text-text-secondary hover:border-accent/50'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender preference */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-2">Preferred For</label>
                <div className="flex gap-1.5">
                  {GENDER_OPTS.map((g) => (
                    <button
                      key={g}
                      onClick={() => handleChange('genderPreference', g)}
                      className={`px-3 py-1.5 rounded-xl text-xs border transition-all capitalize ${
                        filters.genderPreference === g ? 'bg-accent text-white border-accent' : 'border-surface-tertiary text-text-secondary hover:border-accent/50'
                      }`}
                    >
                      {g === 'any' ? 'Any' : g === 'male' ? '👨 Boys' : '👩 Girls'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset */}
              <div className="flex items-end">
                <button onClick={resetFilters} className="btn-secondary text-xs py-2 w-full">
                  Clear All Filters
                </button>
              </div>
            </div>

            {/* Amenities */}
            <div className="mt-4">
              <label className="block text-xs font-semibold text-text-secondary mb-2">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_LIST.map((a) => {
                  const isActive = filters.amenities?.split(',').includes(a);
                  return (
                    <button
                      key={a}
                      onClick={() => toggleAmenity(a)}
                      className={`px-3 py-1.5 rounded-xl text-xs border transition-all capitalize ${
                        isActive ? 'bg-accent text-white border-accent' : 'border-surface-tertiary text-text-secondary hover:border-accent/50'
                      }`}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}