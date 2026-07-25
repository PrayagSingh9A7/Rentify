import fs from "fs";
import csv from "csv-parser";

export function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", () => {
        console.log(`✅ Loaded ${rows.length} records`);
        resolve(rows);
      })
      .on("error", reject);
  });
}