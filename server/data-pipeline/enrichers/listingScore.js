export function calculateListingScore(property) {
  let score = 0;

  // Amenities (30)
  score += Math.min((property.amenityCount || 0) * 3, 30);

  // Furnishing (15)
  switch ((property.furnishing || "").toLowerCase()) {
    case "furnished":
      score += 15;
      break;
    case "semi-furnished":
      score += 10;
      break;
    case "unfurnished":
      score += 5;
      break;
  }

  // Bathrooms (10)
  score += Math.min((property.bathrooms || 0) * 2, 10);

  // Area (20)
  if (property.area >= 2000) score += 20;
  else if (property.area >= 1500) score += 16;
  else if (property.area >= 1000) score += 12;
  else if (property.area >= 500) score += 8;
  else score += 4;

  // Property Type (10)
  switch ((property.propertyType || "").toLowerCase()) {
    case "villa":
      score += 10;
      break;

    case "independent house":
      score += 8;
      break;

    case "apartment":
      score += 7;
      break;

    case "studio apartment":
      score += 5;
      break;
  }

  // Coordinates (5)
  if (property.latitude && property.longitude) {
    score += 5;
  }

  // Title (5)
  if (property.title) {
    score += 5;
  }

  return Math.min(score, 100);
}