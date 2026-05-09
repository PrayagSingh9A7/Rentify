import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import api from '../../services/api';
import usePropertyStore from '../../store/propertyStore';
import toast from 'react-hot-toast';

function StatCard({ icon, label, value, sub, color = 'accent' }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center text-xl`}>{icon}</div>
      </div>
      <p className="font-display text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-sm text-text-secondary mt-0.5">{label}</p>
      {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
    </div>
  );
}

export default function OwnerDashboardPage() {
  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { deleteProperty } = usePropertyStore();

  useEffect(() => {
    Promise.all([
      api.get('/users/dashboard'),
      api.get('/properties/owner/my-listings'),
    ]).then(([statsRes, listRes]) => {
      setStats(statsRes.data.data);
      setListings(listRes.data.data);
    }).catch(() => toast.error('Failed to load dashboard')).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this property?')) return;
    const { success } = await deleteProperty(id);
    if (success) {
      setListings((l) => l.filter((p) => p._id !== id));
      toast.success('Property deleted');
    } else {
      toast.error('Error deleting property');
    }
  };

  const handleToggleAvailability = async (id, current) => {
    try {
      await api.put(`/properties/${id}`, { isAvailable: !current });
      setListings((l) => l.map((p) => p._id === id ? { ...p, isAvailable: !current } : p));
      toast.success(`Marked as ${!current ? 'available' : 'occupied'}`);
    } catch { toast.error('Error updating'); }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-32 rounded-3xl" />)}
        </div>
        <div className="skeleton h-96 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Owner Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1">Manage your listings and track performance</p>
        </div>
        <Link to="/dashboard/add-property" className="btn-primary flex items-center gap-2">
          <span>+</span> Add New Property
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="🏠" label="Total Properties" value={stats?.totalProperties || listings.length} />
        <StatCard icon="✅" label="Active Listings" value={stats?.activeListings || 0} sub="Currently available" />
        <StatCard icon="👁️" label="Total Views" value={stats?.totalViews?.toLocaleString() || 0} />
        <StatCard icon="📩" label="Inquiries" value={stats?.totalInquiries || 0} sub="This month" />
      </div>

      {/* Listings */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-surface-secondary flex items-center justify-between">
          <h2 className="font-semibold text-lg">Your Listings</h2>
          <span className="text-sm text-text-muted">{listings.length} properties</span>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-20 px-4">
            <p className="text-5xl mb-3">🏠</p>
            <h3 className="font-display text-xl font-semibold mb-2">No listings yet</h3>
            <p className="text-text-muted text-sm mb-6">Add your first property to start receiving inquiries</p>
            <Link to="/dashboard/add-property" className="btn-primary">Add Property</Link>
          </div>
        ) : (
          <div className="divide-y divide-surface-secondary">
            {listings.map((property) => (
              <motion.div
                key={property._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-4 p-4 hover:bg-surface-secondary/50 transition-colors"
              >
                {/* Image */}
                <div className="w-20 h-16 rounded-2xl overflow-hidden bg-surface-tertiary shrink-0">
                  {property.images?.[0]?.url
                    ? <img src={property.images[0].url} alt={property.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{property.title}</p>
                  <p className="text-xs text-text-muted">{property.address?.locality}, {property.address?.city}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-medium text-accent">₹{property.rent?.toLocaleString()}/mo</span>
                    <span className={`badge text-xs ${property.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {property.isAvailable ? '● Available' : '● Occupied'}
                    </span>
                    <span className="text-xs text-text-muted">{property.viewCount || 0} views</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleAvailability(property._id, property.isAvailable)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                      property.isAvailable
                        ? 'border-red-200 text-red-600 hover:bg-red-50'
                        : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    {property.isAvailable ? 'Mark Occupied' : 'Mark Available'}
                  </button>
                  <Link to={`/dashboard/edit-property/${property._id}`} className="btn-secondary text-xs py-1.5 px-3">Edit</Link>
                  <button onClick={() => handleDelete(property._id)} className="text-xs px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}