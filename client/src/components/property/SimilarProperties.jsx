import { useEffect } from 'react';
import PropertyCard from './PropertyCard';
import usePropertyStore from '../../store/propertyStore';

export default function SimilarProperties({ propertyId }) {
  const { similarProperties, fetchSimilarProperties } = usePropertyStore();

  useEffect(() => {
    if (propertyId) fetchSimilarProperties(propertyId);
  }, [propertyId, fetchSimilarProperties]);

  if (!similarProperties?.length) return null;

  return (
    <section className="card p-6">
      <div className="mb-5">
        <h2 className="font-display text-2xl font-bold">Similar homes</h2>
        <p className="text-sm text-text-muted mt-1">Same city, layout, and property type.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {similarProperties.slice(0, 6).map((property) => (
          <PropertyCard key={property._id} property={property} />
        ))}
      </div>
    </section>
  );
}
