import Property from "../models/Property.js";
import { buildPropertyQuery } from "../utils/buildPropertyQuery.js";
import { propertySort } from "../utils/propertySort.js";

export const getAllProperties = async (queryParams) => {

  const page = Number(queryParams.page) || 1;
  const limit = Number(queryParams.limit) || 12;

  const skip = (page - 1) * limit;

  const query = buildPropertyQuery(queryParams);

  const sort = propertySort(queryParams.sort);

  const projection = {
    title: 1,
    rent: 1,
    propertyType: 1,
    type: 1,
    bhk: 1,
    bathrooms: 1,
    area: 1,
    furnishing: 1,
    images: 1,
    address: 1,
    averageRating: 1,
    reviewCount: 1,
    viewCount: 1,
    isFeatured: 1,
    createdAt: 1,
    owner: 1,
  };

  const [properties, total] = await Promise.all([

    Property.find(query)
      .select(projection)
      .populate("owner", "name avatar isVerified")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),

    Property.countDocuments(query),
  ]);

  return {

    properties,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};