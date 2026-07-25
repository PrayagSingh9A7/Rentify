const HEADER_MAP = {
  // ===========================
  // House Rent Dataset
  // ===========================
  "Posted On": "postedOn",
  "BHK": "bhk",
  "Rent": "rent",
  "Size": "area",
  "Floor": "floor",
  "Area Type": "areaType",
  "Area Locality": "locality",
  "City": "city",
  "Furnishing Status": "furnishing",
  "Tenant Preferred": "tenantPreference",
  "Bathroom": "bathrooms",
  "Point of Contact": "contactType",

  // ===========================
  // Indian Housing Dataset
  // ===========================
  house_type: "propertyType",
  house_size: "area",
  location: "locality",
  city: "city",
  latitude: "latitude",
  longitude: "longitude",
  price: "rent",
  currency: "currency",

  numBathrooms: "bathrooms",
  numBalconies: "balconies",

  isNegotiable: "negotiable",

  priceSqFt: "pricePerSqFt",

  verificationDate: "verificationDate",

  description: "description",

  SecurityDeposit: "securityDeposit",

  Status: "furnishing",
};

export function mapHeaders(row) {
  const mapped = {};

  for (const [key, value] of Object.entries(row)) {
    mapped[HEADER_MAP[key] || key] = value;
  }

  return mapped;
}