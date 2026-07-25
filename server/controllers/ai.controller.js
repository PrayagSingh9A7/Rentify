import Property from '../models/Property.js';

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const scoreFromListings = (properties = []) => {
  if (!properties.length) return { safetyScore: null, connectivityScore: null };

  const availableRatio = properties.filter((property) => property.isAvailable).length / properties.length;
  const rated = properties.filter((property) => property.averageRating);
  const avgRating = rated.length
    ? rated.reduce((sum, property) => sum + property.averageRating, 0) / rated.length
    : 3.5;
  const amenityDensity = Math.min(
    1,
    properties.reduce((sum, property) => sum + (property.amenities?.length || 0), 0) / (properties.length * 8)
  );

  return {
    safetyScore: Math.max(1, Math.min(5, Math.round((avgRating * 0.75 + amenityDensity * 1.25) * 10) / 10)),
    connectivityScore: Math.max(1, Math.min(5, Math.round((availableRatio * 2 + amenityDensity * 3) * 10) / 10)),
  };
};

export const localityAdvisor = async (req, res) => {
  try {
    const { city, locality, budget, propertyType } = req.body;
    if (!city?.trim()) {
      return res.status(400).json({ success: false, message: 'City is required' });
    }

    const query = {
      'address.city': new RegExp(escapeRegex(city.trim()), 'i'),
    };
    if (locality?.trim()) query['address.locality'] = new RegExp(escapeRegex(locality.trim()), 'i');
    if (propertyType?.trim()) query.propertyType = propertyType.trim();

    const properties = await Property.find(query).lean();

    const avgRent = properties.length
      ? properties.reduce((sum, property) => sum + (property.rent || 0), 0) / properties.length
      : 0;

    const amenitiesCount = {};
    properties.forEach((property) => {
      (property.amenities || []).forEach((amenity) => {
        amenitiesCount[amenity] = (amenitiesCount[amenity] || 0) + 1;
      });
    });
    const topAmenities = Object.entries(amenitiesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    const numericBudget = Number(budget);
    const budgetFit = numericBudget
      ? numericBudget >= avgRent * 0.8
        ? 'Good fit'
        : numericBudget >= avgRent * 0.6
          ? 'Slightly over'
          : 'Over budget'
      : 'N/A';
    const qualityScores = scoreFromListings(properties);

    const insights = {
      locality: locality || city,
      totalListings: properties.length,
      averageRent: Math.round(avgRent),
      budgetFit,
      topAmenities,
      availableNow: properties.filter((property) => property.isAvailable).length,
      popularTypes: [...new Set(properties.map((property) => property.propertyType).filter(Boolean))].slice(0, 3),
      ...qualityScores,
      recommendation: avgRent > 0
        ? `${locality || city} has ${properties.length} listings with avg rent Rs ${Math.round(avgRent).toLocaleString()}. ${topAmenities.length ? `Top amenities include ${topAmenities.slice(0, 3).join(', ')}.` : ''} ${budgetFit === 'Good fit' ? 'Your budget fits well here.' : 'Consider a slightly higher budget for this area.'}`
        : 'Limited data available for this locality. Try a broader search.',
    };

    res.json({ success: true, data: insights });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const expensePredictor = async (req, res) => {
  try {
    const { rent, city, furnishing, occupancy } = req.body;

    const monthlyRent = Number(rent);
    if (!Number.isFinite(monthlyRent) || monthlyRent < 0) {
      return res.status(400).json({ success: false, message: 'Valid rent is required' });
    }

    const baseElectricity = furnishing === 'furnished' ? 1500 : 800;
    const waterBill = 200;
    const internet = 600;
    const cooking = occupancy === 'single' ? 3000 : occupancy === 'double' ? 2000 : 1500;
    const normalizedCity = city?.toLowerCase();
    const transport = normalizedCity === 'mumbai' ? 1500 : normalizedCity === 'delhi' ? 1200 : 800;
    const misc = 1000;

    const monthly = {
      rent: monthlyRent,
      electricity: baseElectricity,
      water: waterBill,
      internet,
      cooking,
      transport,
      misc,
    };

    const total = Object.values(monthly).reduce((sum, value) => sum + value, 0);

    res.json({
      success: true,
      data: {
        breakdown: monthly,
        total,
        tips: [
          'Split internet with roommates to save Rs 300/month',
          'Cook at home to save roughly Rs 2000/month compared with eating out',
          `Metro or bus travel can save Rs 800-1500/month in ${city || 'metro cities'}`,
          'Use LED bulbs and switch off AC when away',
        ],
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const user = req.user;
    const { propertyId } = req.query;

    let query = { isAvailable: true };

    if (propertyId) {
      const ref = await Property.findById(propertyId);
      if (ref) {
        query = {
          isAvailable: true,
          _id: { $ne: ref._id },
          $or: [
            { 'address.city': ref.address.city, propertyType: ref.propertyType },
            { rent: { $gte: ref.rent * 0.7, $lte: ref.rent * 1.3 }, 'address.city': ref.address.city },
          ],
        };
      }
    } else if (user?.preferences) {
      const { budget, propertyType, locations } = user.preferences;
      if (budget?.max) query.rent = { $lte: budget.max };
      if (propertyType?.length) query.propertyType = { $in: propertyType };
      if (locations?.length) query['address.city'] = { $in: locations };
    }

    const recommendations = await Property.find(query)
      .populate('owner', 'name avatar isVerified')
      .sort('-averageRating -viewCount')
      .limit(6)
      .lean();

    res.json({ success: true, data: recommendations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const normalizeAmenities = (amenities) => {
  if (Array.isArray(amenities)) return amenities.map((item) => String(item).toLowerCase().trim()).filter(Boolean);
  if (typeof amenities === 'string') return amenities.split(',').map((item) => item.toLowerCase().trim()).filter(Boolean);
  return [];
};

export const propertyRecommender = async (req, res) => {
  try {
    const {
      budget,
      city,
      propertyType,
      bhk,
      furnishing,
      amenities,
      purpose,
    } = req.body;

    const maxBudget = Number(budget);
    if (!Number.isFinite(maxBudget) || maxBudget <= 0) {
      return res.status(400).json({ success: false, message: 'A valid budget is required' });
    }

    const preferredAmenities = normalizeAmenities(amenities);
    const query = { isAvailable: true, rent: { $lte: Math.round(maxBudget * 1.2) } };
    if (city?.trim()) query['address.city'] = new RegExp(escapeRegex(city.trim()), 'i');
    if (propertyType?.trim()) query.propertyType = propertyType.trim();
    if (bhk) query.bhk = Number(bhk);
    if (furnishing?.trim()) query.furnishing = furnishing.trim();

    const properties = await Property.find(query)
      .populate('owner', 'name avatar isVerified')
      .sort('-averageRating -viewCount -createdAt')
      .limit(40)
      .lean();

    const ranked = properties
      .map((property) => {
        let score = 0;
        const reasons = [];
        const misses = [];
        const propertyAmenities = (property.amenities || []).map((item) => String(item).toLowerCase());

        if (property.rent <= maxBudget) {
          score += 30;
          reasons.push('Fits your budget');
        } else {
          score += 12;
          misses.push('Slightly above budget');
        }

        if (city && property.address?.city?.toLowerCase() === city.toLowerCase()) {
          score += 15;
          reasons.push(`Located in ${property.address.city}`);
        }

        if (propertyType && property.propertyType === propertyType) {
          score += 12;
          reasons.push(`Matches ${propertyType}`);
        }

        if (bhk && Number(property.bhk) === Number(bhk)) {
          score += 10;
          reasons.push(`${bhk} BHK match`);
        }

        if (furnishing && property.furnishing === furnishing) {
          score += 8;
          reasons.push(`${furnishing} furnishing`);
        }

        const matchedAmenities = preferredAmenities.filter((amenity) => propertyAmenities.includes(amenity));
        if (preferredAmenities.length) {
          const amenityScore = Math.round((matchedAmenities.length / preferredAmenities.length) * 15);
          score += amenityScore;
          if (matchedAmenities.length) reasons.push(`Includes ${matchedAmenities.slice(0, 3).join(', ')}`);
          if (matchedAmenities.length < preferredAmenities.length) misses.push('Some preferred amenities are unavailable');
        }

        if (property.averageRating > 0) {
          score += Math.min(10, property.averageRating * 2);
          reasons.push(`Rated ${property.averageRating}/5`);
        }

        if (property.owner?.isVerified || property.isVerified) {
          score += 5;
          reasons.push('Verified listing or owner');
        }

        if (purpose === 'Student' && ['wifi', 'laundry', 'security'].some((amenity) => propertyAmenities.includes(amenity))) {
          score += 5;
          reasons.push('Student-friendly essentials');
        }
        if (purpose === 'Family' && (property.bhk >= 2 || property.propertyType === 'Independent House' || property.propertyType === 'Villa')) {
          score += 5;
          reasons.push('Family-suitable space');
        }
        if (purpose === 'Working Professional' && ['wifi', 'parking', 'security', 'power backup'].some((amenity) => propertyAmenities.includes(amenity))) {
          score += 5;
          reasons.push('Workday-friendly amenities');
        }

        return {
          property,
          score: Math.min(100, Math.round(score)),
          reasons: reasons.slice(0, 6),
          tradeoffs: misses.slice(0, 3),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    res.json({ success: true, data: ranked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
