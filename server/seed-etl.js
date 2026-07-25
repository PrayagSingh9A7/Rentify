import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import Property from "./models/Property.js";
import User from "./models/User.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await mongoose.connect(process.env.MONGO_URI);

try {
  console.log("📦 Connected to MongoDB");

  // Find or create seed owner
  let owner = await User.findOne({ email: "owner@test.com" });

  if (!owner) {
    owner = await User.create({
      name: "Rentify Seed Owner",
      email: "owner@test.com",
      password: "12345678",
      role: "owner",
    });
  }

  // Read ETL output
  const filePath = path.join(
    __dirname,
    "data-pipeline",
    "output",
    "clean-properties.json"
  );

  const rawData = fs.readFileSync(filePath, "utf-8");
  const etlProperties = JSON.parse(rawData);

  console.log(`📄 Loaded ${etlProperties.length} properties`);

  const properties = etlProperties.map((property) => ({
    owner: owner._id,

    title:
      property.title ||
      `${property.propertyType} in ${property.locality}, ${property.city}`,

    description:
      property.description ||
      `${property.propertyType} available for rent in ${property.locality}, ${property.city}.`,

    propertyType: property.propertyType,

    rent: Number(property.rent) || 0,

    deposit: Number(property.securityDeposit) || 0,

    securityDeposit: Number(property.securityDeposit) || 0,

    maintenanceCharges: 0,

    pricePerSqFt: Number(property.pricePerSqFt) || 0,

    source: property.source,

    postedOn: property.postedOn || null,

    verificationDate:
  property.verificationDate &&
  !isNaN(new Date(property.verificationDate))
    ? new Date(property.verificationDate)
    : null,

    furnishing:
      property.furnishing?.toLowerCase() || "unfurnished",

    bhk: property.bhk ?? null,

    bathrooms: Number(property.bathrooms) || 0,

    balconies: Number(property.balconies) || 0,

    area: Number(property.area) || 50,

    floorNumber: 0,

    totalFloors: 1,

    isAvailable: true,

    isVerified: true,

    isFeatured: false,

    isPremium: false,

    amenities: property.amenities || [],

    images: [],

    address: {
      street: "",

      locality: property.locality,

      city: property.city,

      state: "",

      pincode: "",

      coordinates: {
        lat: Number(property.latitude) || 0,
        lng: Number(property.longitude) || 0,
      },
    },

    location: {
      type: "Point",
      coordinates: [
        Number(property.longitude) || 0,
        Number(property.latitude) || 0,
      ],
    },

    averageRating: 0,

    reviewCount: 0,

    viewCount: 0,

    inquiryCount: 0,

    rules: [],

    tags: [],

    availabilityCalendar: [],
  }));

  console.log("🗑 Removing existing properties...");

  await Property.deleteMany({});

  console.log("📥 Inserting properties...");

  await Property.insertMany(properties);

  console.log(`✅ Successfully seeded ${properties.length} properties`);

  process.exit(0);
} catch (error) {
  console.error("❌ Seeder Failed");
  console.error(error);
  process.exit(1);
}
