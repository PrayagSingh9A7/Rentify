import { loadDatasets } from "./readers/datasetLoader.js";
import { processDataset } from "./processors/etlProcessor.js";
import { writeJson } from "./output/jsonWriter.js";
import { removeDuplicates } from "./deduplicators/duplicateDetector.js";
import { generateDatasetAnalytics } from "./analytics/datasetAnalytics.js";

async function main() {
  try {
    // Load datasets
    const datasets = await loadDatasets();

    console.log("\n📊 Dataset Summary\n");

    console.table({
      HouseRent: datasets.houseRent.length,
      Delhi: datasets.delhi.length,
      Mumbai: datasets.mumbai.length,
      Pune: datasets.pune.length,
      Total:
        datasets.houseRent.length +
        datasets.delhi.length +
        datasets.mumbai.length +
        datasets.pune.length,
    });

    console.log("\n🚀 Processing datasets...\n");

    // Process datasets
    const houseResult = processDataset(
      datasets.houseRent,
      "house-rent"
    );

    const delhiResult = processDataset(
      datasets.delhi,
      "delhi"
    );

    const mumbaiResult = processDataset(
      datasets.mumbai,
      "mumbai"
    );

    const puneResult = processDataset(
      datasets.pune,
      "pune"
    );

    // Merge valid records
    const validProperties = [
      ...houseResult.validRecords,
      ...delhiResult.validRecords,
      ...mumbaiResult.validRecords,
      ...puneResult.validRecords,
    ];

    // Merge invalid records
    const invalidProperties = [
      ...houseResult.invalidRecords,
      ...delhiResult.invalidRecords,
      ...mumbaiResult.invalidRecords,
      ...puneResult.invalidRecords,
    ];

    // Remove duplicates
    const {
      uniqueProperties,
      duplicateProperties,
    } = removeDuplicates(validProperties);

    // Generate analytics
    const analytics = generateDatasetAnalytics(uniqueProperties);

    // Generate summary
    const summary = {
      total:
        uniqueProperties.length +
        duplicateProperties.length +
        invalidProperties.length,

      valid: uniqueProperties.length,

      duplicate: duplicateProperties.length,

      invalid: invalidProperties.length,
    };

    // Write output files
    await writeJson(
      "clean-properties.json",
      uniqueProperties
    );

    await writeJson(
      "duplicate-properties.json",
      duplicateProperties
    );

    await writeJson(
      "invalid-properties.json",
      invalidProperties
    );

    await writeJson(
      "summary.json",
      summary
    );

    await writeJson(
      "analytics.json",
      analytics
    );

    // Console Summary
    console.log("\n========== ETL SUMMARY ==========\n");

    console.table({
      Total: summary.total,
      Valid: summary.valid,
      Duplicate: summary.duplicate,
      Invalid: summary.invalid,
    });

    console.log("\n📊 Analytics Generated");

    console.table({
      Cities: Object.keys(analytics.cities).length,
      PropertyTypes: Object.keys(analytics.propertyTypes).length,
      Amenities: Object.keys(analytics.topAmenities).length,
      PriceCategories: Object.keys(analytics.priceCategories).length,
      AvgRent: analytics.rent.average,
      AvgArea: analytics.area.average,
    });

    console.log("\n📁 Files Generated:");
    console.log("✔ clean-properties.json");
    console.log("✔ duplicate-properties.json");
    console.log("✔ invalid-properties.json");
    console.log("✔ summary.json");
    console.log("✔ analytics.json");

    console.log("\n🎉 ETL Pipeline Completed Successfully!");
  } catch (err) {
    console.error("\n❌ Pipeline Error:");
    console.error(err);
  }
}

main();