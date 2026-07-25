import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DATASETS = {
  HOUSE_RENT: path.join(__dirname, "datasets", "House_Rent_Dataset.csv"),
  DELHI: path.join(__dirname, "datasets", "Indian_housing_Delhi_data.csv"),
  MUMBAI: path.join(__dirname, "datasets", "Indian_housing_Mumbai_data.csv"),
  PUNE: path.join(__dirname, "datasets", "Indian_housing_Pune_data.csv"),
};

export const OUTPUT = {
  CLEANED: path.join(__dirname, "output", "cleaned_properties.json"),
  FAILED: path.join(__dirname, "output", "failed_records.json"),
};