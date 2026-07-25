import { toNumber } from "../utils/helpers.js";
import { normalizePropertyType } from "../cleaners/normalizePropertyType.js";
import { extractBHK } from "../cleaners/bhkExtractor.js";
export function mapHouseRentProperty(row) {
  return {
    source: {
  type: String,
  enum: [
    "house-rent",
    "indian-housing",
  ],
},

    postedOn: row.postedOn,

    propertyType: "Apartment",

    bhk: toNumber(row.bhk),

    rent: toNumber(row.rent),

    area: toNumber(row.area),

    floor: row.floor,

    areaType: row.areaType,

    locality: row.locality,

    city: row.city,

    furnishing: row.furnishing,

    tenantPreference: row.tenantPreference,

    bathrooms: toNumber(row.bathrooms),

    contactType: row.contactType,

    latitude: null,

    longitude: null,

    balconies: null,

    securityDeposit: null,

    negotiable: null,

    description: null,

    verificationDate: null,

    pricePerSqFt: null,
  };
}
export function mapIndianHousingProperty(row) {
  const parsed = normalizePropertyType(row.propertyType);

  const propertyType = parsed.propertyType;

  const bhk =
    parsed.bhk ??
    extractBHK(row.description);

  return {
    source: "indian-housing",

    postedOn: null,

    propertyType,

    bhk,

    rent: toNumber(row.rent),

    area: toNumber(row.area),

    floor: null,

    areaType: null,

    locality: row.locality,

    city: row.city,

    furnishing: row.furnishing,

    tenantPreference: null,

    bathrooms: toNumber(row.bathrooms),

    balconies: toNumber(row.balconies),

    contactType: null,

    latitude: row.latitude,

    longitude: row.longitude,

    securityDeposit: toNumber(row.securityDeposit),

    negotiable: row.negotiable,

    description: row.description,

    verificationDate: row.verificationDate,

    pricePerSqFt: toNumber(row.pricePerSqFt),
  };
}