import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import usePropertyStore from '../../store/propertyStore';
import toast from 'react-hot-toast';

const AMENITY_ICONS = {
  wifi: '📶', ac: '❄️', parking: '🅿️', gym: '🏋️', pool: '🏊', laundry: '🧺',
  security: '🔐', elevator: '🛗', power: '⚡', water: '💧', cooking: '🍳', tv: '📺',
};

export default function PropertyCard({ property, className = '' }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuthStore();
  const { toggleSave } = usePropertyStore();

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Sign in to save properties'); return; }
    setSaving(true);
    const { success, isSaved } = await toggleSave(property._id);
    if (success) {
      setSaved(isSaved);
      toast.success(isSaved ? 'Saved to wishlist ❤️' : 'Removed from wishlist');
    }
    setSaving(false);
  };

  const images = property.images?.length ? property.images.map((i) => i.url) : [
    `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80`,
  ];

  const typeColors = {
    pg: 'bg-purple-100 text-purple-700',
    flat: 'bg-blue-100 text-blue-700',
    room: 'bg-green-100 text-green-700',
    villa: 'bg-amber-100 text-amber-700',
    studio: 'bg-pink-100 text-pink-700',
    hostel: 'bg-orange-100 text-orange-700',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`card overflow-hidden group ${className}`}
    >
      <Link to={`/property/${property._id}`} className="block">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-tertiary">
          <img
            src={images[imgIdx]}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80'; }}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
            <span className={`badge text-xs font-semibold ${typeColors[property.type] || 'bg-gray-100 text-gray-700'}`}>
              {property.type?.toUpperCase()}
            </span>
            {property.isVerified && (
              <span className="badge bg-emerald-100 text-emerald-700">✓ Verified</span>
            )}
            {property.isFeatured && (
              <span className="badge bg-amber-100 text-amber-700">⭐ Featured</span>
            )}
            {!property.isAvailable && (
              <span className="badge bg-red-100 text-red-700">Occupied</span>
            )}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="absolute top-3 right-3 w-9 h-9 glass rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          >
            <svg className={`w-4.5 h-4.5 transition-colors ${saved ? 'text-red-500 fill-red-500' : 'text-white'}`} fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Image dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {images.slice(0, 4).map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); setImgIdx(i); }}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          )}

          {/* Gender pref badge */}
          {property.genderPreference !== 'any' && (
            <div className="absolute bottom-3 left-3">
              <span className="badge glass text-white text-xs">
                {property.genderPreference === 'male' ? '👨 Boys' : '👩 Girls'}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-text-primary text-sm line-clamp-2 leading-snug">{property.title}</h3>
            <div className="text-right shrink-0">
              <p className="font-bold text-accent text-base">₹{property.rent?.toLocaleString()}</p>
              <p className="text-xs text-text-muted">/month</p>
            </div>
          </div>

          <p className="text-xs text-text-muted flex items-center gap-1 mb-3">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {property.address?.locality}, {property.address?.city}
          </p>

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <div className="flex gap-1 flex-wrap mb-3">
              {property.amenities.slice(0, 4).map((a) => (
                <span key={a} className="text-xs bg-surface-secondary px-2 py-0.5 rounded-lg text-text-muted">
                  {AMENITY_ICONS[a.toLowerCase()] || '•'} {a}
                </span>
              ))}
              {property.amenities.length > 4 && (
                <span className="text-xs text-text-muted">+{property.amenities.length - 4}</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-accent/10 shrink-0">
                {property.owner?.avatar ? (
                  <img src={property.owner.avatar} alt={property.owner.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-accent text-xs font-bold">
                    {property.owner?.name?.charAt(0)}
                  </span>
                )}
              </div>
              <span className="text-xs text-text-muted">{property.owner?.name}</span>
              {property.owner?.isVerified && <span className="text-blue-500 text-xs">✓</span>}
            </div>

            {property.averageRating > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-amber-400 text-xs">★</span>
                <span className="text-xs font-medium text-text-primary">{property.averageRating}</span>
                <span className="text-xs text-text-muted">({property.reviewCount})</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}