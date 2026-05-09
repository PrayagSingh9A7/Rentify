import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Property from './models/Property.js';
import User from './models/User.js';

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);


let owner = await User.findOne({ email: 'owner@test.com' });

if (!owner) {
  owner = await User.create({
    name: 'Demo Owner',
    email: 'owner@test.com',
    password: '12345678',
    role: 'owner',
  });
}

// Dummy datasets
const cities = [
  'Delhi',
  'Noida',
  'Ghaziabad',
  'Mumbai',
  'Pune',
  'Bangalore',
  'Hyderabad',
];

const localities = [
  'Sector 62',
  'Rajouri Garden',
  'Indirapuram',
  'Koramangala',
  'Andheri',
  'Hinjewadi',
  'Banjara Hills',
];

const propertyTypes = [
  'pg',
  'flat',
  'room',
  'studio',
];

const furnishingTypes = [
  'furnished',
  'semi-furnished',
  'unfurnished',
];

const genderPrefs = [
  'male',
  'female',
  'any',
];

const amenitiesPool = [
  'wifi',
  'ac',
  'parking',
  'gym',
  'pool',
  'laundry',
  'security',
  'elevator',
  'cooking',
  'tv',
];

const images = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
];

// Generate 60 properties
const properties = Array.from({ length: 60 }, (_, i) => ({
  title: `Premium ${
    propertyTypes[i % propertyTypes.length]
  } in ${
    localities[i % localities.length]
  }`,

  description:
    'Modern property with premium amenities, spacious rooms, excellent connectivity and peaceful environment.',

  owner: owner._id,

  type: propertyTypes[i % propertyTypes.length],

  rent: Math.floor(Math.random() * 20000) + 5000,

  furnishing: furnishingTypes[i % furnishingTypes.length],

  genderPreference: genderPrefs[i % genderPrefs.length],

  isAvailable: true,

  isFeatured: i % 4 === 0,

  isVerified: true,

  amenities: amenitiesPool.slice(
    0,
    Math.floor(Math.random() * 5) + 2
  ),

  address: {
    city: cities[i % cities.length],

    locality: localities[i % localities.length],

    fullAddress: `${
      localities[i % localities.length]
    }, ${
      cities[i % cities.length]
    }`,
  },

  images: [
    {
      url: images[i % images.length],
    },
  ],

  averageRating: (
    Math.random() * 2 +
    3
  ).toFixed(1),

  reviewCount: Math.floor(
    Math.random() * 200
  ),

  viewCount: Math.floor(
    Math.random() * 5000
  ),
}));

try {
  await Property.deleteMany();

  await Property.insertMany(properties);

  console.log('✅ 60 properties seeded successfully');

  process.exit();
} catch (err) {
  console.error(err);

  process.exit(1);
}