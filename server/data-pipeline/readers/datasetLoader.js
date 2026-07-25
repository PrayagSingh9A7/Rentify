import { DATASETS } from "../config.js";
import { readCSV } from "./csvReader.js";

export async function loadDatasets() {
  console.log("\n📂 Loading datasets...\n");

  const [houseRent, delhi, mumbai, pune] = await Promise.all([
    readCSV(DATASETS.HOUSE_RENT),
    readCSV(DATASETS.DELHI),
    readCSV(DATASETS.MUMBAI),
    readCSV(DATASETS.PUNE),
  ]);

  console.log("\n✅ All datasets loaded successfully.\n");

  return {
    houseRent,
    delhi,
    mumbai,
    pune,
  };
}