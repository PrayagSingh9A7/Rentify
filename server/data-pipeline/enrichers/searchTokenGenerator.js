export function generateSearchTokens(property) {
  const tokens = new Set();

  add(tokens, property.city);
  add(tokens, property.locality);
  add(tokens, property.propertyType);
  add(tokens, property.furnishing);

  if (property.bhk) {
    add(tokens, `${property.bhk} BHK`);
    add(tokens, `${property.bhk}bhk`);
  }

  if (Array.isArray(property.amenities)) {
    property.amenities.forEach((amenity) => add(tokens, amenity));
  }

  return [...tokens];
}

function add(set, value) {
  if (!value) return;

  set.add(
    String(value)
      .trim()
      .toLowerCase()
  );
}