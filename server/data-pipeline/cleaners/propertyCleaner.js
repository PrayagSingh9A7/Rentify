import { capitalize, toNumber } from "../utils/helpers.js";

export function cleanHouseRent(row) {
  return {
    ...row,

    city: capitalize(row.city),
    locality: capitalize(row.locality),
    furnishing: capitalize(row.furnishing),

    rent: toNumber(row.rent),
    area: toNumber(row.area),
    bhk: toNumber(row.bhk),
    bathrooms: parseNullableNumber(row.bathrooms),
  };
}

export function cleanIndianHousing(row) {
  return {
    ...row,

    city: capitalize(row.city),
    locality: capitalize(row.locality),

    propertyType: cleanPropertyType(row.propertyType),

    furnishing: capitalize(row.furnishing),

    rent: toNumber(row.rent),
    area: toNumber(row.area),

    bathrooms: parseNullableNumber(row.bathrooms),
    balconies: parseNullableNumber(row.balconies),

    latitude: parseNullableNumber(row.latitude),
    longitude: parseNullableNumber(row.longitude),

    securityDeposit: parseDeposit(row.securityDeposit),

    negotiable: parseBoolean(row.negotiable),

    pricePerSqFt: parseNullableNumber(row.pricePerSqFt),
  };
}

/* ---------------- Helper Functions ---------------- */

function parseNullableNumber(value) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    String(value).trim().toLowerCase() === "null" ||
    String(value).trim().toLowerCase() === "na" ||
    String(value).trim().toLowerCase() === "n/a"
  ) {
    return null;
  }

  return toNumber(value);
}

function parseDeposit(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const text = String(value).trim().toLowerCase();

  if (
    text === "no deposit" ||
    text === "nil" ||
    text === "none"
  ) {
    return 0;
  }

  return toNumber(value);
}

function parseBoolean(value) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    String(value).trim().toLowerCase() === "null"
  ) {
    return null;
  }

  const text = String(value).trim().toLowerCase();

  if (text === "true" || text === "yes" || text === "1")
    return true;

  if (text === "false" || text === "no" || text === "0")
    return false;

  return null;
}

function cleanPropertyType(type = "") {
  const text = String(type).trim();

  if (/studio/i.test(text)) return "Studio Apartment";
  if (/independent floor/i.test(text)) return "Independent Floor";
  if (/builder floor/i.test(text)) return "Builder Floor";
  if (/villa/i.test(text)) return "Villa";
  if (/penthouse/i.test(text)) return "Penthouse";
  if (/apartment/i.test(text)) return "Apartment";

  return capitalize(text);
}