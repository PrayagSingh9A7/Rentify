export function normalizePropertyType(value) {
  if (!value) {
    return {
      propertyType: "Apartment",
      bhk: null,
    };
  }

  const text = value.trim();

  // Extract BHK
  const bhkMatch = text.match(/(\d+)\s*BHK/i);
  const bhk = bhkMatch ? Number(bhkMatch[1]) : null;

  // Remove BHK from string
  let propertyType = text.replace(/\d+\s*BHK/i, "").trim();

  propertyType = propertyType
    .replace(/\s+/g, " ")
    .toLowerCase();

  const map = {
    apartment: "Apartment",
    flat: "Apartment",

    "independent house": "Independent House",
    house: "Independent House",

    "independent floor": "Independent Floor",
    "builder floor": "Builder Floor",

    villa: "Villa",

    penthouse: "Penthouse",

    "studio apartment": "Studio Apartment",
    studio: "Studio Apartment",
  };

  propertyType =
    map[propertyType] ||
    propertyType
      .split(" ")
      .map(
        word =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");

  return {
    propertyType,
    bhk,
  };
}