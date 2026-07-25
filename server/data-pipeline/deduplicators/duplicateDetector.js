export function removeDuplicates(properties) {
  const uniqueProperties = [];
  const duplicateProperties = [];

  const seen = new Map();
  let duplicateGroup = 1;

  for (const property of properties) {
    // Normalize values
    const source = normalize(property.source);
    const city = normalize(property.city);
    const locality = normalize(property.locality);
    const propertyType = normalize(property.propertyType);
    const floor = normalize(property.floor);
    const furnishing = normalize(property.furnishing);
    const contactType = normalize(property.contactType);

    const bhk = property.bhk ?? "";
    const rent = Number(property.rent) || 0;
    const area = Number(property.area) || 0;

    const latitude = property.latitude;
    const longitude = property.longitude;

    const hasCoordinates =
      latitude !== null &&
      latitude !== undefined &&
      latitude !== "" &&
      longitude !== null &&
      longitude !== undefined &&
      longitude !== "";

    // Coordinates available → use geo key
    const key = hasCoordinates
      ? [
          source,
          latitude,
          longitude,
          rent,
          area,
          bhk,
          furnishing,
        ].join("|")
      : [
          source,
          city,
          locality,
          propertyType,
          bhk,
          area,
          rent,
          floor,
          furnishing,
          contactType,
        ].join("|");

    if (seen.has(key)) {
      const original = seen.get(key);

      duplicateProperties.push({
        ...property,
        isDuplicate: true,
        duplicateGroup: original.duplicateGroup,
        duplicateKey: key,
      });
    } else {
      const record = {
        ...property,
        isDuplicate: false,
        duplicateGroup: `DUP-${String(duplicateGroup).padStart(6, "0")}`,
      };

      seen.set(key, record);
      uniqueProperties.push(record);
      duplicateGroup++;
    }
  }

  console.log("\n========== DUPLICATE REPORT ==========\n");
  console.table({
    Total: properties.length,
    Unique: uniqueProperties.length,
    Duplicate: duplicateProperties.length,
  });

  return {
    uniqueProperties,
    duplicateProperties,
  };
}

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}