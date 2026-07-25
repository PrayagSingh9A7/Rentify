const FALLBACK_IMAGES = {
  Apartment: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&q=80',
    'https://images.unsplash.com/photo-1560448205-17d3a46c84de?w=900&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=900&q=80',
    'https://images.unsplash.com/photo-1560185009-5bf9f2849488?w=900&q=80',
  ],
  'Independent Floor': [
    'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=900&q=80',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&q=80',
    'https://images.unsplash.com/photo-1560448075-bb485b067938?w=900&q=80',
    'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=900&q=80',
    'https://images.unsplash.com/photo-1560185008-b033106af5c3?w=900&q=80',
    'https://images.unsplash.com/photo-1560185127-2d06c6d08d3c?w=900&q=80',
    'https://images.unsplash.com/photo-1560184897-67f4a3f9a7fa?w=900&q=80',
    'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=900&q=80',
  ],
  'Studio Apartment': [
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=900&q=80',
    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=900&q=80',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80',
    'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=900&q=80',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=80&auto=format',
  ],
  Villa: [
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=900&q=80',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=900&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=900&q=80',
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=900&q=80',
  ],
  'Independent House': [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=80',
    'https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=900&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&q=80',
    'https://images.unsplash.com/photo-1598228723793-52759bba239c?w=900&q=80',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=900&q=80',
    'https://images.unsplash.com/photo-1592595896551-12b371d546d5?w=900&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=900&q=80',
    'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=900&q=80',
  ],
  PG: [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=900&q=80',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=900&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=900&q=80',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=900&q=80',
    'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?w=900&q=80',
    'https://images.unsplash.com/photo-1519974719765-e6559eac2575?w=900&q=80',
    'https://images.unsplash.com/photo-1595526114035-0f6e7df2e390?w=900&q=80',
  ],
};

const hashString = (value = '') =>
  String(value).split('').reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0);

export const getPropertyType = (property = {}) => property.propertyType || property.type || 'Apartment';

export const getFallbackPropertyImage = (property = {}, offset = 0) => {
  const type = getPropertyType(property);
  const normalizedType = /pg|hostel/i.test(type) ? 'PG' : type;
  const collection = FALLBACK_IMAGES[normalizedType] || FALLBACK_IMAGES.Apartment;
  const key = property._id || property.title || `${type}-${property.address?.locality || ''}`;
  const index = Math.abs(hashString(`${key}-${offset}`)) % collection.length;
  return collection[index];
};

export const getPropertyImageUrls = (property = {}, count = 1) => {
  const uploaded = (property.images || []).map((image) => image?.url || image).filter(Boolean);
  if (uploaded.length >= count) return uploaded.slice(0, count);
  const needed = count - uploaded.length;
  return [
    ...uploaded,
    ...Array.from({ length: needed }, (_, index) => getFallbackPropertyImage(property, index)),
  ];
};
