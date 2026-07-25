import { useEffect, useState } from 'react';
import { Heart } from "lucide-react";
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import usePropertyStore from '../store/propertyStore';
import BookingButton from '../components/booking/BookingButton';
import BookingModal from '../components/booking/BookingModal';
import InquiryModal from '../components/inquiry/InquiryModal';
import SimilarProperties from '../components/property/SimilarProperties';
import NearbyProperties from '../components/property/NearbyProperties';
import { getPropertyImageUrls, getPropertyType } from '../utils/propertyImages';

const AMENITY_ICONS = {
  wifi: 'WiFi',
  ac: 'AC',
  parking: 'Parking',
  gym: 'Gym',
  pool: 'Pool',
  laundry: 'Laundry',
  security: 'Security',
  elevator: 'Elevator',
  power: 'Power',
  water: 'Water',
  cooking: 'Cooking',
  tv: 'TV',
  balcony: 'Balcony',
  garden: 'Garden',
  cctv: 'CCTV',
};

function ImageGallery({ property }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const images = getPropertyImageUrls(property, 4);

  return (
    <>
      <div className="rounded-3xl overflow-hidden mb-3 bg-surface-tertiary">
        <button type="button" className="relative aspect-video w-full block" onClick={() => setLightbox(true)}>
          <img src={images[active]} alt={property.title} className="w-full h-full object-cover" />
          <span className="absolute bottom-4 right-4 glass rounded-xl px-3 py-1.5 text-xs text-white font-medium">
            {active + 1} / {images.length} photos
          </span>
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActive(index)}
            className={`aspect-[4/3] rounded-2xl overflow-hidden border-2 ${active === index ? 'border-accent' : 'border-transparent'}`}
          >
            <img src={image} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            <button type="button" className="absolute top-4 right-4 text-white text-xl" onClick={() => setLightbox(false)}>Close</button>
            <img src={images[active]} alt="" className="max-w-full max-h-full rounded-2xl" onClick={(event) => event.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ReviewSection({ propertyId, reviewCount }) {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: '', content: '', isAnonymous: false });
  const { user } = useAuthStore();

  useEffect(() => {
    let mounted = true;
    api.get(`/reviews/${propertyId}`)
      .then(({ data }) => {
        if (mounted) setReviews(data.data || []);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [propertyId]);

  const submitReview = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.post(`/reviews/${propertyId}`, form);
      setReviews((current) => [data.data, ...current]);
      setShowForm(false);
      setForm({ rating: 5, title: '', content: '', isAnonymous: false });
      toast.success('Review submitted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to submit review');
    }
  };

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="font-display text-xl font-bold">Reviews</h3>
          <p className="text-sm text-text-muted">{reviews.length || reviewCount || 0} tenant reviews</p>
        </div>
        {user && !showForm && <button onClick={() => setShowForm(true)} className="btn-outline text-xs py-2">Write Review</button>}
      </div>

      {showForm && (
        <form onSubmit={submitReview} className="bg-surface-secondary rounded-2xl p-4 mb-5 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setForm({ ...form, rating: star })} className={`text-2xl ${star <= form.rating ? 'text-amber-400' : 'text-gray-300'}`}>★</button>
              ))}
            </div>
          </div>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Review title" className="input-field" />
          <textarea required rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Share your experience" className="input-field resize-none" />
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input type="checkbox" checked={form.isAnonymous} onChange={(e) => setForm({ ...form, isAnonymous: e.target.checked })} />
            Post anonymously
          </label>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-xs py-2">Submit</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-xs py-2">Cancel</button>
          </div>
        </form>
      )}

      {!reviews.length ? (
        <div className="bg-surface-secondary rounded-2xl p-8 text-center">
          <p className="font-semibold text-text-primary mb-1">No tenant reviews yet</p>
          <p className="text-sm text-text-muted">Verified tenant feedback will appear here after visits or stays.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-surface-secondary pb-4 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold overflow-hidden">
                    {review.reviewer?.avatar ? <img src={review.reviewer.avatar} alt="" className="w-full h-full object-cover" /> : review.reviewer?.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{review.reviewer?.name || 'Anonymous'}</p>
                    <p className="text-xs text-text-muted">{new Date(review.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
                <span className="text-sm text-amber-500">{review.rating}/5</span>
              </div>
              <h4 className="text-sm font-semibold mb-1">{review.title}</h4>
              <p className="text-sm text-text-secondary">{review.content}</p>
              {review.ownerResponse?.content && (
                <div className="mt-3 bg-blue-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-blue-700 mb-1">Owner response</p>
                  <p className="text-xs text-blue-700">{review.ownerResponse.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentProperty: property, fetchProperty, loading, toggleSave } = usePropertyStore();
  const { user } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);

  useEffect(() => {
    fetchProperty(id);
    window.scrollTo(0, 0);
  }, [id, fetchProperty]);

  const requireLogin = () => {
    if (!user) {
      toast.error('Please login first');
      navigate('/login');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!requireLogin()) return;
    const { success, isSaved, message } = await toggleSave(id);
    if (success) {
      setSaved(isSaved);
      toast.success(isSaved ? 'Saved' : 'Removed from saved');
    } else {
      toast.error(message || 'Unable to update saved property');
    }
  };

  const handleMessage = async () => {
    if (!requireLogin()) return;
    try {
      const { data } = await api.post('/chat/conversations', { recipientId: property.owner._id, propertyId: id });
      navigate(`/chat/${data.data._id}`);
    } catch {
      toast.error('Could not start chat');
    }
  };

  if (loading || !property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="skeleton aspect-video rounded-3xl" />
            <div className="skeleton h-8 w-2/3 rounded-xl" />
            <div className="skeleton h-4 w-1/3 rounded-xl" />
            <div className="skeleton h-48 rounded-3xl" />
          </div>
          <div className="skeleton h-96 rounded-3xl" />
        </div>
      </div>
    );
  }

  const propertyType = getPropertyType(property);
  const ownerInitial = property.owner?.name?.charAt(0) || 'O';
  const totalMonthly = (property.rent || 0) + (property.maintenanceCharges || 0) + 1000;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 min-h-screen">
      <div className="flex items-center gap-2 text-xs text-text-muted mb-6">
        <Link to="/" className="hover:text-accent">Home</Link>
        <span>/</span>
        <Link to="/search" className="hover:text-accent">Search</Link>
        <span>/</span>
        <span className="text-text-secondary line-clamp-1">{property.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <ImageGallery property={property} />

          <section className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="badge bg-accent/10 text-accent">{propertyType}</span>
                  {property.isVerified && <span className="badge bg-emerald-100 text-emerald-700">Verified</span>}
                  {!property.isAvailable && <span className="badge bg-red-100 text-red-700">Occupied</span>}
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary mb-2">{property.title}</h1>
                <p className="text-sm text-text-secondary">
                  {[property.address?.street, property.address?.locality, property.address?.city, property.address?.pincode].filter(Boolean).join(', ')}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-display text-3xl font-bold text-accent">Rs {property.rent?.toLocaleString()}</p>
                <p className="text-xs text-text-muted">per month</p>
                {property.deposit > 0 && <p className="text-xs text-text-muted mt-0.5">Rs {property.deposit?.toLocaleString()} deposit</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-surface-secondary">
              {[
                ['Type', propertyType],
                ['Furnishing', property.furnishing],
                ['Preferred for', property.genderPreference === 'any' ? 'Anyone' : property.genderPreference],
                ['BHK', `${property.bhk || '-'} BHK`],
                ['Area', property.area ? `${property.area} sq.ft` : 'Not listed'],
                ['Floor', property.floorNumber ? `${property.floorNumber}/${property.totalFloors || '-'}` : 'Not listed'],
                ['Availability', property.isAvailable ? 'Available now' : 'Occupied'],
                ['Notice', `${property.noticePeriod || 30} days`],
              ].map(([label, value]) => (
                <div key={label} className="bg-surface-secondary rounded-2xl p-3">
                  <p className="text-xs text-text-muted mb-0.5">{label}</p>
                  <p className="text-sm font-semibold capitalize">{value}</p>
                </div>
              ))}
            </div>
          </section>

          {property.description && (
            <section className="card p-6">
              <h3 className="font-display text-xl font-bold mb-3">About this place</h3>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{property.description}</p>
            </section>
          )}

          {property.amenities?.length > 0 && (
            <section className="card p-6">
              <h3 className="font-display text-xl font-bold mb-4">Amenities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2.5 bg-surface-secondary rounded-2xl px-4 py-3">
                    <span className="text-xs font-bold text-accent">{AMENITY_ICONS[amenity.toLowerCase()] || 'OK'}</span>
                    <span className="text-sm font-medium capitalize">{amenity}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {property.rules?.length > 0 && (
            <section className="card p-6">
              <h3 className="font-display text-xl font-bold mb-3">House rules</h3>
              <ul className="space-y-2">
                {property.rules.map((rule) => (
                  <li key={rule} className="text-sm text-text-secondary">{rule}</li>
                ))}
              </ul>
            </section>
          )}

          {showBooking && <BookingModal propertyId={property._id} property={property} onClose={() => setShowBooking(false)} />}
          {showInquiry && <InquiryModal propertyId={property._id} onClose={() => setShowInquiry(false)} />}

          <ReviewSection propertyId={id} reviewCount={property.reviewCount} />
          <SimilarProperties propertyId={property._id} />
          <NearbyProperties propertyId={property._id} />
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <section className="card p-5">
              <h3 className="font-display text-xl font-bold mb-4">Owner</h3>
              <div className="flex items-center gap-3 mb-5 p-3 bg-surface-secondary rounded-2xl">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-accent/10 shrink-0">
                  {property.owner?.avatar ? (
                    <img src={property.owner.avatar} alt={property.owner.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-accent font-bold text-lg">{ownerInitial}</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm">{property.owner?.name || 'Property Owner'}</p>
                  <p className="text-xs text-text-muted">{property.owner?.isVerified ? 'Verified owner' : 'Owner account'}</p>
                  {property.owner?.createdAt && <p className="text-xs text-text-muted">Since {new Date(property.owner.createdAt).getFullYear()}</p>}
                </div>
              </div>

              <BookingButton onClick={() => requireLogin() && setShowBooking(true)} />
              <div className="mt-3 grid grid-cols-1 gap-3">
                <button onClick={handleMessage} className="btn-secondary w-full py-3">Message Owner</button>
                
                <button
  onClick={handleSave}
  className={`btn-secondary w-full py-3 flex items-center justify-center gap-2 ${
    saved ? "border-red-300 text-red-500" : ""
  }`}
>
  <Heart
    size={18}
    className={saved ? "fill-current text-red-500" : ""}
  />
  {saved ? "Saved" : "Save Property"}
</button>
              </div>
              {property.owner?.phone && <a href={`tel:${property.owner.phone}`} className="btn-outline w-full py-3 mt-3 text-center block">Call Owner</a>}
            </section>

            <section className="card p-5">
              <h3 className="font-semibold text-sm mb-3">Monthly cost estimate</h3>
              <div className="space-y-2">
                {[
                  ['Rent', property.rent || 0],
                  ['Maintenance', property.maintenanceCharges || 0],
                  ['Estimated utilities', 1000],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-text-secondary">{label}</span>
                    <span className="font-medium">Rs {value.toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-surface-secondary pt-2 flex justify-between font-bold">
                  <span className="text-sm">Estimated total</span>
                  <span className="text-accent">Rs {totalMonthly.toLocaleString()}</span>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3">
              {[
                ['Views', property.viewCount || 0],
                ['Rating', property.averageRating || '-'],
                ['Reviews', property.reviewCount || 0],
                ['Saved', property.saveCount || 0],
              ].map(([label, value]) => (
                <div key={label} className="bg-white rounded-2xl p-3 text-center shadow-card">
                  <p className="font-bold text-lg">{value}</p>
                  <p className="text-xs text-text-muted">{label}</p>
                </div>
              ))}
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
