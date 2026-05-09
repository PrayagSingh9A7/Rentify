import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import usePropertyStore from '../store/propertyStore';
import PropertyCard from '../components/property/PropertyCard';
import SearchFilters from '../components/property/SearchFilters';
import { PageSkeleton } from '../components/common/Skeletons';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const { properties, loading, pagination, filters, setFilters, setPage, fetchProperties } = usePropertyStore();

  // Sync URL params to filters on mount
  useEffect(() => {
    const updates = {};
    ['search', 'city', 'type', 'minRent', 'maxRent', 'furnishing', 'genderPreference'].forEach((k) => {
      const v = searchParams.get(k);
      if (v) updates[k] = v;
    });
    if (Object.keys(updates).length) setFilters(updates);
    else fetchProperties();
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 min-h-screen">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1">Find Your Home</h1>
        <p className="text-text-secondary text-sm">
          {pagination.total ? `${pagination.total} properties found` : 'Search and filter to find your perfect match'}
        </p>
      </div>

      <SearchFilters onSearch={fetchProperties} />

      {loading ? (
        <PageSkeleton count={6} />
      ) : properties.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <PropertyCard property={p} />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                onClick={() => setPage(filters.page - 1)}
                disabled={filters.page <= 1}
                className="btn-secondary text-sm py-2 px-4 disabled:opacity-40"
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                    filters.page === p ? 'bg-accent text-white' : 'bg-white text-text-secondary hover:bg-surface-tertiary'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(filters.page + 1)}
                disabled={filters.page >= pagination.pages}
                className="btn-secondary text-sm py-2 px-4 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">🔍</p>
          <h3 className="font-display text-xl font-semibold mb-2">No properties found</h3>
          <p className="text-text-muted text-sm mb-6">Try adjusting your filters or searching a different area</p>
          <button onClick={() => { usePropertyStore.getState().resetFilters(); }} className="btn-primary">
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}