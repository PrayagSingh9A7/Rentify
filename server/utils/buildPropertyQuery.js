export const buildPropertyQuery = (queryParams = {}) => {
  const {
    city,
    locality,
    propertyType,
    type,
    bhk,
    bathrooms,
    furnishing,
    occupancy,
    genderPreference,
    isAvailable,
    amenities,
    minRent,
    maxRent,
    minArea,
    maxArea,
    search,
  } = queryParams;

  const query = {};

  // ----------------------------
  // Text Search
  // ----------------------------
  if (search) {
    query.$text = {
      $search: search,
    };
  }

  // ----------------------------
  // Location
  // ----------------------------
  if (city)
    query["address.city"] = {
      $regex: city,
      $options: "i",
    };

  if (locality)
    query["address.locality"] = {
      $regex: locality,
      $options: "i",
    };

  // ----------------------------
  // Property Type
  // ----------------------------
  if (propertyType)
    query.propertyType = propertyType;

  // Backward Compatibility
  else if (type)
    query.type = type;

  // ----------------------------
  // BHK
  // ----------------------------
  if (bhk)
    query.bhk = Number(bhk);

  // ----------------------------
  // Bathrooms
  // ----------------------------
  if (bathrooms)
    query.bathrooms = {
      $gte: Number(bathrooms),
    };

  // ----------------------------
  // Furnishing
  // ----------------------------
  if (furnishing)
    query.furnishing = furnishing;

  // ----------------------------
  // Occupancy
  // ----------------------------
  if (occupancy)
    query.occupancy = occupancy;

  // ----------------------------
  // Gender
  // ----------------------------
  if (genderPreference)
    query.genderPreference = genderPreference;

  // ----------------------------
  // Availability
  // ----------------------------
  if (isAvailable !== undefined)
    query.isAvailable = isAvailable === "true";

  // ----------------------------
  // Amenities
  // ----------------------------
  if (amenities) {
    query.amenities = {
      $all: amenities.split(","),
    };
  }

  // ----------------------------
  // Rent Range
  // ----------------------------
  if (minRent || maxRent) {
    query.rent = {};

    if (minRent)
      query.rent.$gte = Number(minRent);

    if (maxRent)
      query.rent.$lte = Number(maxRent);
  }

  // ----------------------------
  // Area Range
  // ----------------------------
  if (minArea || maxArea) {
    query.area = {};

    if (minArea)
      query.area.$gte = Number(minArea);

    if (maxArea)
      query.area.$lte = Number(maxArea);
  }

  return query;
};