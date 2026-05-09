const properties = [
  {
    _id: '1',
    title: 'Modern PG Near Metro Station',
    type: 'pg',
    rent: 8500,
    isVerified: true,
    isFeatured: true,
    isAvailable: true,
    genderPreference: 'male',

    images: [
      {
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
      },
    ],

    address: {
      locality: 'Sector 62',
      city: 'Noida',
    },

    amenities: ['Wifi', 'AC', 'Parking', 'Laundry'],

    owner: {
      name: 'Rahul Sharma',
      avatar: 'https://i.pravatar.cc/150?img=12',
      isVerified: true,
    },

    averageRating: 4.7,
    reviewCount: 124,
  },

  {
    _id: '2',
    title: 'Luxury Studio Apartment',
    type: 'studio',
    rent: 18000,

    isVerified: true,
    isFeatured: false,
    isAvailable: true,
    genderPreference: 'any',

    images: [
      {
        url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&q=80',
      },
    ],

    address: {
      locality: 'Indirapuram',
      city: 'Ghaziabad',
    },

    amenities: ['Wifi', 'AC', 'Pool'],

    owner: {
      name: 'Aman Verma',
      avatar: 'https://i.pravatar.cc/150?img=15',
      isVerified: false,
    },

    averageRating: 4.5,
    reviewCount: 67,
  },
];

export default properties;