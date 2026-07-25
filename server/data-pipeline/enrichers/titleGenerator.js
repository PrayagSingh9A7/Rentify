export function generateTitle(property) {
  const parts = [];

  if (property.bhk) {
    parts.push(`${property.bhk} BHK`);
  }

  if (property.propertyType) {
    parts.push(property.propertyType);
  }

  if (property.locality) {
    parts.push(`in ${property.locality}`);
  }

  if (property.city) {
    parts.push(property.city);
  }

  return parts.join(" ");
}