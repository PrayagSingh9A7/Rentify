import fs from "fs-extra";
import path from "path";

const outputDir = path.resolve("data-pipeline/output");

export async function writeJson(fileName, data) {
  await fs.ensureDir(outputDir);

  await fs.writeJson(
    path.join(outputDir, fileName),
    data,
    {
      spaces: 2,
    }
  );
}