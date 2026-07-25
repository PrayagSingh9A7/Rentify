import { isEmpty, toNumber } from "../utils/helpers.js";

export function validateProperty(property) {
  const errors = [];

  // Rent
  const rent = toNumber(property.rent);
  if (rent === null || rent <= 0) {
    errors.push("Invalid rent");
  }

  // City
  if (isEmpty(property.city)) {
    errors.push("City is missing");
  }

  // Locality
  if (isEmpty(property.locality)) {
    errors.push("Locality is missing");
  }

  // Area
  const area = toNumber(property.area);
  if (area === null || area <= 0) {
    errors.push("Invalid area");
  }

  // Bathrooms (optional)
  if (!isEmpty(property.bathrooms)) {
    const bathrooms = toNumber(property.bathrooms);

    if (bathrooms === null || bathrooms < 0) {
      errors.push("Invalid bathrooms");
    }
  }

  // Coordinates (optional)
  if (
    property.latitude !== null &&
    property.latitude !== undefined &&
    property.longitude !== null &&
    property.longitude !== undefined
  ) {
    const lat = Number(property.latitude);
    const lng = Number(property.longitude);

    if (lat < -90 || lat > 90) {
      errors.push("Invalid latitude");
    }

    if (lng < -180 || lng > 180) {
      errors.push("Invalid longitude");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}