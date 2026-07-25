export function generateSlug(property) {
  const parts = [];

  if (property.bhk) {
    parts.push(`${property.bhk}bhk`);
  }

  if (property.propertyType) {
    parts.push(property.propertyType);
  }

  if (property.locality) {
    parts.push(property.locality);
  }

  if (property.city) {
    parts.push(property.city);
  }

  return parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}