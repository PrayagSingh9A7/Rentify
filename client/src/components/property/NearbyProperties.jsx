import { useEffect } from 'react';
import PropertyCard from './PropertyCard';
import usePropertyStore from '../../store/propertyStore';

export default function NearbyProperties({ propertyId }) {
  const { nearbyProperties, fetchNearbyProperties } = usePropertyStore();

  useEffect(() => {
    if (propertyId) fetchNearbyProperties(propertyId);
  }, [propertyId, fetchNearbyProperties]);

  if (!nearbyProperties?.length) return null;

  return (
    <section className="card p-6">
      <div className="mb-5">
        <h2 className="font-display text-2xl font-bold">Nearby homes</h2>
        <p className="text-sm text-text-muted mt-1">Other available listings around this location.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {nearbyProperties.slice(0, 6).map((property) => (
          <PropertyCard key={property._id} property={property} />
        ))}
      </div>
    </section>
  );
}
