export function generateDatasetAnalytics(properties) {
  const analytics = {
    totalProperties: properties.length,

    cities: {},
    propertyTypes: {},
    bhkDistribution: {},
    furnishingDistribution: {},
    priceCategories: {},
    topAmenities: {},
    averageRentByCity: {},

    rent: {
      min: Infinity,
      max: 0,
      average: 0,
    },

    area: {
      min: Infinity,
      max: 0,
      average: 0,
    },
  };

  let totalRent = 0;
  let totalArea = 0;

  const cityRent = {};
  const cityCount = {};

  for (const property of properties) {
    // ------------------------
    // City Distribution
    // ------------------------
    increment(analytics.cities, property.city);

    // ------------------------
    // Property Type
    // ------------------------
    increment(
      analytics.propertyTypes,
      property.propertyType
    );

   // ------------------------
// BHK Distribution
// ------------------------
const bhkLabel =
  property.bhk !== null &&
  property.bhk !== undefined
    ? `${property.bhk} BHK`
    : "Unknown";

increment(
  analytics.bhkDistribution,
  bhkLabel
);

    // ------------------------
    // Furnishing
    // ------------------------
    increment(
      analytics.furnishingDistribution,
      property.furnishing
    );

    // ------------------------
    // Price Category
    // ------------------------
    increment(
      analytics.priceCategories,
      property.priceCategory
    );

    // ------------------------
    // Amenities
    // ------------------------
    if (Array.isArray(property.amenities)) {
      for (const amenity of property.amenities) {
        increment(
          analytics.topAmenities,
          amenity
        );
      }
    }

    // ------------------------
    // Rent Stats
    // ------------------------
    const rent = Number(property.rent) || 0;

    totalRent += rent;

    analytics.rent.min = Math.min(
      analytics.rent.min,
      rent
    );

    analytics.rent.max = Math.max(
      analytics.rent.max,
      rent
    );

    // ------------------------
    // Area Stats
    // ------------------------
    const area = Number(property.area) || 0;

    totalArea += area;

    analytics.area.min = Math.min(
      analytics.area.min,
      area
    );

    analytics.area.max = Math.max(
      analytics.area.max,
      area
    );

    // ------------------------
    // Average Rent by City
    // ------------------------
    if (property.city) {
      cityRent[property.city] =
        (cityRent[property.city] || 0) + rent;

      cityCount[property.city] =
        (cityCount[property.city] || 0) + 1;
    }
  }

  analytics.rent.average = Math.round(
    totalRent / properties.length
  );

  analytics.area.average = Math.round(
    totalArea / properties.length
  );

  for (const city in cityRent) {
    analytics.averageRentByCity[city] = Math.round(
      cityRent[city] / cityCount[city]
    );
  }

  // Sort maps in descending order
  analytics.cities = sortObject(analytics.cities);

  analytics.propertyTypes = sortObject(
    analytics.propertyTypes
  );

  analytics.bhkDistribution = sortObject(
    analytics.bhkDistribution
  );

  analytics.furnishingDistribution = sortObject(
    analytics.furnishingDistribution
  );

  analytics.priceCategories = sortObject(
    analytics.priceCategories
  );

  analytics.topAmenities = sortObject(
    analytics.topAmenities
  );

  analytics.averageRentByCity = sortObject(
    analytics.averageRentByCity
  );

  return analytics;
}

function increment(obj, key) {
  if (!key) return;

  obj[key] = (obj[key] || 0) + 1;
}

function sortObject(obj) {
  return Object.fromEntries(
    Object.entries(obj).sort(
      (a, b) => b[1] - a[1]
    )
  );
}