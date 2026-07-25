import { DATASETS } from "./config.js";
import { readCSV } from "./readers/csvReader.js";

async function test() {
  try {
    const data = await readCSV(DATASETS.HOUSE_RENT);

    console.log("Total:", data.length);
    console.log(data[0]);
  } catch (err) {
    console.error(err);
  }
}

test();