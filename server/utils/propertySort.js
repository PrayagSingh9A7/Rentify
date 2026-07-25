export const propertySort = (sort = "newest") => {
  switch (sort) {

    case "rentAsc":
      return { rent: 1 };

    case "rentDesc":
      return { rent: -1 };

    case "areaAsc":
      return { area: 1 };

    case "areaDesc":
      return { area: -1 };

    case "rating":
      return { averageRating: -1 };

    case "popular":
      return { viewCount: -1 };

    case "oldest":
      return { createdAt: 1 };

    case "newest":
    default:
      return { createdAt: -1 };
  }
};