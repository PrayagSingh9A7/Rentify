import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import usePropertyStore from '../store/propertyStore';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const AMENITY_ICONS = {
  wifi: '📶', ac: '❄️', parking: '🅿️', gym: '🏋️', pool: '🏊', laundry: '🧺',
  security: '🔐', elevator: '🛗', power: '⚡', water: '💧', cooking: '🍳', tv: '📺',
  balcony: '🌅', garden: '🌿', cctv: '📹',
};

function ImageGallery({ images }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const imgs = images?.length
    ? images.map((i) => i.url)
    : Array(4).fill('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80');

  return (
    <>
      <div className="rounded-3xl overflow-hidden mb-4">
        <div className="relative aspect-video cursor-pointer" onClick={() => setLightbox(true)}>
          <img src={imgs[active]} alt="property" className="w-full h-full object-cover" />
          <div className="absolute bottom-4 right-4 glass rounded-xl px-3 py-1.5 text-xs text-white font-medium">
            {active + 1} / {imgs.length} photos
          </div>
          {imgs.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setActive((a) => (a - 1 + imgs.length) % imgs.length); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 glass w-9 h-9 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">‹</button>
              <button onClick={(e) => { e.stopPropagation(); setActive((a) => (a + 1) % imgs.length); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 glass w-9 h-9 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">›</button>
            </>
          )}
        </div>
      </div>
      {imgs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {imgs.map((img, i) => (
            <button key={i} onClick={() => setActive(i)}
              className={`shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${active === i ? 'border-accent' : 'border-transparent'}`}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}>
            <button className="absolute top-4 right-4 text-white text-2xl hover:opacity-70">✕</button>
            <img src={imgs[active]} alt="" className="max-w-full max-h-full rounded-2xl" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ReviewSection({ propertyId }) {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: '', content: '', isAnonymous: false });
  const { user } = useAuthStore();

  useEffect(() => {
    api.get(`/reviews/${propertyId}`).then(({ data }) => setReviews(data.data)).catch(() => {});
  }, [propertyId]);

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/reviews/${propertyId}`, form);
      setReviews([data.data, ...reviews]);
      setShowForm(false);
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-xl font-bold">Reviews ({reviews.length})</h3>
        {user && !showForm && (
          <button onClick={() => setShowForm(true)} className="btn-outline text-xs py-2">Write Review</button>
        )}
      </div>

      {showForm && (
        <form onSubmit={submitReview} className="bg-surface-secondary rounded-2xl p-4 mb-5 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Rating</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map((s) => (
                <button key={s} type="button" onClick={() => setForm({ ...form, rating: s })}
                  className={`text-2xl transition-transform hover:scale-110 ${s <= form.rating ? 'text-amber-400' : 'text-gray-300'}`}>★</button>
              ))}
            </div>
          </div>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Review title" className="input-field" />
          <textarea required rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Share your experience..." className="input-field resize-none" />
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input type="checkbox" checked={form.isAnonymous} onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })} className="rounded" />
            Post anonymously
          </label>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-xs py-2">Submit Review</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-xs py-2">Cancel</button>
          </div>
        </form>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-8 text-text-muted">
          <p className="text-3xl mb-2">💬</p>
          <p className="text-sm">No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="border-b border-surface-secondary pb-4 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm overflow-hidden">
                    {r.reviewer?.avatar ? <img src={r.reviewer.avatar} className="w-full h-full object-cover" alt="" /> : r.reviewer?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.reviewer?.name || 'Anonymous'}</p>
                    <p className="text-xs text-text-muted">{new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => <span key={s} className={`text-sm ${s <= r.rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>)}
                </div>
              </div>
              <h4 className="text-sm font-semibold mb-1">{r.title}</h4>
              <p className="text-sm text-text-secondary">{r.content}</p>
              {r.ownerResponse && (
                <div className="mt-3 bg-blue-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-blue-700 mb-1">Owner Response:</p>
                  <p className="text-xs text-blue-600">{r.ownerResponse.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProperty: property, fetchProperty, loading, toggleSave } = usePropertyStore();
  const { user } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    fetchProperty(id);
    window.scrollTo(0, 0);
  }, [id]);

  const handleSave = async () => {
    if (!user) { toast.error('Sign in to save'); return; }
    const { success, isSaved } = await toggleSave(id);
    if (success) { setSaved(isSaved); toast.success(isSaved ? 'Saved! ❤️' : 'Removed'); }
  };

  const handleContact = async () => {
    if (!user) { toast.error('Sign in to contact owner'); navigate('/login'); return; }
    try {
      const { data } = await api.post('/chat/conversations', { recipientId: property.owner._id, propertyId: id });
      navigate(`/chat/${data.data._id}`);
    } catch { toast.error('Could not start chat'); }
  };

  if (loading || !property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="skeleton aspect-video rounded-3xl" />
            <div className="skeleton h-8 w-2/3 rounded-xl" />
            <div className="skeleton h-4 w-1/3 rounded-xl" />
          </div>
          <div className="skeleton h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  const images = property.images?.length ? property.images : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-text-muted mb-6">
        <Link to="/" className="hover:text-accent">Home</Link>
        <span>/</span>
        <Link to="/search" className="hover:text-accent">Search</Link>
        <span>/</span>
        <span className="text-text-secondary">{property.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Main content */}
        <div className="lg:col-span-2 space-y-6">
          <ImageGallery images={images} />

          {/* Title & info */}
          <div className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="badge bg-accent/10 text-accent">{property.type?.toUpperCase()}</span>
                  {property.isVerified && <span className="badge bg-emerald-100 text-emerald-700">✓ Verified</span>}
                  {!property.isAvailable && <span className="badge bg-red-100 text-red-700">Occupied</span>}
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary mb-2">{property.title}</h1>
                <p className="text-text-secondary flex items-center gap-1.5 text-sm">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {property.address?.street && `${property.address.street}, `}
                  {property.address?.locality}, {property.address?.city}
                  {property.address?.pincode && ` - ${property.address.pincode}`}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display text-3xl font-bold text-accent">₹{property.rent?.toLocaleString()}</p>
                <p className="text-xs text-text-muted">per month</p>
                {property.deposit > 0 && (
                  <p className="text-xs text-text-muted mt-0.5">₹{property.deposit?.toLocaleString()} deposit</p>
                )}
              </div>
            </div>

            {/* Quick facts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-surface-secondary">
              {[
                { label: 'Type', value: property.type?.charAt(0).toUpperCase() + property.type?.slice(1) },
                { label: 'Furnishing', value: property.furnishing },
                { label: 'For', value: property.genderPreference === 'any' ? 'Anyone' : property.genderPreference === 'male' ? 'Boys' : 'Girls' },
                { label: 'BHK', value: `${property.bhk} BHK` },
                { label: 'Area', value: property.area ? `${property.area} sq.ft` : 'N/A' },
                { label: 'Floor', value: property.floorNumber ? `${property.floorNumber}/${property.totalFloors}` : 'N/A' },
                { label: 'Available', value: property.isAvailable ? 'Now' : 'Occupied' },
                { label: 'Notice', value: `${property.noticePeriod || 30} days` },
              ].map((item) => (
                <div key={item.label} className="bg-surface-secondary rounded-2xl p-3">
                  <p className="text-xs text-text-muted mb-0.5">{item.label}</p>
                  <p className="text-sm font-semibold capitalize">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="card p-6">
            <h3 className="font-display text-xl font-bold mb-3">About this place</h3>
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{property.description}</p>
          </div>

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-display text-xl font-bold mb-4">Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2.5 bg-surface-secondary rounded-2xl px-4 py-3">
                    <span className="text-lg">{AMENITY_ICONS[a.toLowerCase()] || '✓'}</span>
                    <span className="text-sm font-medium capitalize">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules */}
          {property.rules?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-display text-xl font-bold mb-3">House Rules</h3>
              <ul className="space-y-2">
                {property.rules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="text-accent mt-0.5">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Virtual Tour */}
          {property.virtualTourUrl && (
            <div className="card p-6">
              <h3 className="font-display text-xl font-bold mb-3">360° Virtual Tour</h3>
              <iframe
                src={property.virtualTourUrl}
                className="w-full aspect-video rounded-2xl border-0"
                allowFullScreen
                title="Virtual Tour"
              />
            </div>
          )}

          {/* Reviews */}
          <ReviewSection propertyId={id} />
        </div>

        {/* Right: Sticky sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* Contact card */}
            <div className="card p-5">
              <h3 className="font-semibold text-base mb-4">Contact Owner</h3>
              <div className="flex items-center gap-3 mb-5 p-3 bg-surface-secondary rounded-2xl">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-accent/10 shrink-0">
                  {property.owner?.avatar
                    ? <img src={property.owner.avatar} alt={property.owner.name} className="w-full h-full object-cover" />
                    : <span className="w-full h-full flex items-center justify-center text-accent font-bold text-lg">{property.owner?.name?.charAt(0)}</span>
                  }
                </div>
                <div>
                  <p className="font-semibold text-sm">{property.owner?.name}</p>
                  <p className="text-xs text-text-muted">
                    {property.owner?.isVerified ? '✓ Verified Owner' : 'Property Owner'}
                  </p>
                  <p className="text-xs text-text-muted">
                    Member since {new Date(property.owner?.createdAt).getFullYear()}
                  </p>
                </div>
              </div>

              <button onClick={handleContact} className="btn-primary w-full py-3 mb-3 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Message Owner
              </button>

              <button onClick={handleSave} className={`btn-secondary w-full py-3 flex items-center justify-center gap-2 ${saved ? 'border-red-300 text-red-500' : ''}`}>
                <svg className={`w-4 h-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {saved ? 'Saved' : 'Save Property'}
              </button>

              {property.owner?.phone && (
                <a href={`tel:${property.owner.phone}`} className="btn-secondary w-full py-3 mt-3 flex items-center justify-center gap-2 text-sm">
                  📞 Call Owner
                </a>
              )}
            </div>

            {/* Cost summary */}
            <div className="card p-5">
              <h3 className="font-semibold text-sm mb-3">Monthly Cost Estimate</h3>
              <div className="space-y-2">
                {[
                  { label: 'Rent', value: property.rent },
                  { label: 'Maintenance', value: property.maintenanceCharges || 0 },
                  { label: 'Est. Electricity', value: 1000 },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-text-secondary">{item.label}</span>
                    <span className="font-medium">₹{item.value?.toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-surface-secondary pt-2 flex justify-between font-bold">
                  <span className="text-sm">Total Est.</span>
                  <span className="text-accent">₹{((property.rent || 0) + (property.maintenanceCharges || 0) + 1000).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="card p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-secondary rounded-2xl p-3 text-center">
                  <p className="font-bold text-lg">{property.viewCount || 0}</p>
                  <p className="text-xs text-text-muted">Views</p>
                </div>
                <div className="bg-surface-secondary rounded-2xl p-3 text-center">
                  <p className="font-bold text-lg">{property.averageRating || '-'}</p>
                  <p className="text-xs text-text-muted">Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}