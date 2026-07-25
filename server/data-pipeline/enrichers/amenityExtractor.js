// enrichers/amenityExtractor.js

const AMENITY_PATTERNS = {
  Parking: [
    "parking",
    "car parking",
    "covered parking",
    "open parking",
    "visitor parking",
  ],

  Lift: [
    "lift",
    "elevator",
  ],

  Gym: [
    "gym",
    "fitness center",
    "fitness centre",
    "gymnasium",
  ],

  SwimmingPool: [
    "swimming pool",
    "pool",
  ],

  PowerBackup: [
    "power backup",
    "powerbackup",
    "generator backup",
    "dg backup",
  ],

  Security: [
    "security",
    "24x7 security",
    "24 hour security",
    "guard",
    "gated community",
    "security guard",
  ],

  CCTV: [
    "cctv",
    "camera surveillance",
  ],

  Garden: [
    "garden",
    "landscaped garden",
    "park",
    "green area",
  ],

  Balcony: [
    "balcony",
    "private balcony",
  ],

  ClubHouse: [
    "club house",
    "clubhouse",
  ],

  MetroNearby: [
    "metro",
    "near metro",
    "metro station",
  ],

  WiFi: [
    "wifi",
    "wi-fi",
    "internet",
  ],

  AC: [
    "ac",
    "air conditioner",
    "air conditioning",
  ],

  ModularKitchen: [
    "modular kitchen",
  ],

  Furnished: [
    "fully furnished",
    "furnished",
  ],

  SemiFurnished: [
    "semi furnished",
    "semi-furnished",
  ],

  PetFriendly: [
    "pet friendly",
    "pets allowed",
  ],

  ChildrenPlayArea: [
    "children play area",
    "kids play area",
    "playground",
  ],

  JoggingTrack: [
    "jogging track",
    "walking track",
  ],

  FireSafety: [
    "fire safety",
    "fire alarm",
    "fire extinguisher",
  ],

  Intercom: [
    "intercom",
  ],

  WaterSupply: [
    "24x7 water",
    "water supply",
    "continuous water",
  ],
};

export function extractAmenities(description) {
  if (!description) {
    return {
      amenities: [],
      amenityCount: 0,
    };
  }

  const text = description.toLowerCase();

  const amenities = [];

  for (const [amenity, keywords] of Object.entries(AMENITY_PATTERNS)) {
    const found = keywords.some((keyword) => text.includes(keyword));

    if (found) {
      amenities.push(amenity);
    }
  }

  return {
    amenities,
    amenityCount: amenities.length,
  };
}