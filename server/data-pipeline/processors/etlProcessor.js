import { mapHeaders } from "../mappers/headerMapper.js";

import {
  cleanHouseRent,
  cleanIndianHousing,
} from "../cleaners/propertyCleaner.js";

import {
  mapHouseRentProperty,
  mapIndianHousingProperty,
} from "../mappers/propertyMapper.js";

import { validateProperty } from "../validators/propertyValidator.js";
import { enrichProperty } from "../enrichers/enrichmentPipeline.js";

export function processDataset(records, source) {
  const validRecords = [];
  const invalidRecords = [];

  for (const record of records) {
    try {
      // Header Mapping
      const normalized = mapHeaders(record);

      // Cleaning
      const cleaned =
        source === "house-rent"
          ? cleanHouseRent(normalized)
          : cleanIndianHousing(normalized);

      // Property Mapping
      const property =
        source === "house-rent"
          ? mapHouseRentProperty(cleaned)
          : mapIndianHousingProperty(cleaned);

      // Data Enrichment
      enrichProperty(property);

      // Validation
      const validation = validateProperty(property);

      if (validation.valid) {
        validRecords.push(property);
      } else {
        invalidRecords.push({
          property,
          errors: validation.errors,
        });
      }
    } catch (err) {
      invalidRecords.push({
        property: record,
        errors: [err.message],
      });
    }
  }

  return {
    validRecords,
    invalidRecords,
  };
}