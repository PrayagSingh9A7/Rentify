import { extractAmenities } from "./amenityExtractor.js";
import { generateTitle } from "./titleGenerator.js";
import { generateSearchTokens } from "./searchTokenGenerator.js";
import { generateSlug } from "./slugGenerator.js";
import { getPriceCategory } from "./priceCategory.js";
import { calculateListingScore } from "./listingScore.js";

export function enrichProperty(property) {
  // Amenities
  const { amenities, amenityCount } = extractAmenities(
    property.description
  );

  property.amenities = amenities;
  property.amenityCount = amenityCount;

  // Title
  property.title = generateTitle(property);

  // Slug
  property.slug = generateSlug(property);

  // Search Tokens
  property.searchTokens = generateSearchTokens(property);

  // Price Category
  property.priceCategory = getPriceCategory(property.rent);

  // Listing Score
  property.listingScore = calculateListingScore(property);

  return property;
}