import Property from '../models/Property.js';

// AI Locality Advisor - analyzes locality based on available data
export const localityAdvisor = async (req, res) => {
  try {
    const { city, locality, budget, propertyType } = req.body;

    const properties = await Property.find({
      'address.city': new RegExp(city, 'i'),
      ...(locality && { 'address.locality': new RegExp(locality, 'i') }),
    }).lean();

    const avgRent = properties.length
      ? properties.reduce((s, p) => s + p.rent, 0) / properties.length
      : 0;

    const amenitiesCount = {};
    properties.forEach((p) => p.amenities.forEach((a) => { amenitiesCount[a] = (amenitiesCount[a] || 0) + 1; }));
    const topAmenities = Object.entries(amenitiesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    const budgetFit = budget ? (budget >= avgRent * 0.8 ? 'Good fit' : budget >= avgRent * 0.6 ? 'Slightly over' : 'Over budget') : 'N/A';

    const insights = {
      locality: locality || city,
      totalListings: properties.length,
      averageRent: Math.round(avgRent),
      budgetFit,
      topAmenities,
      availableNow: properties.filter((p) => p.isAvailable).length,
      popularTypes: [...new Set(properties.map((p) => p.type))].slice(0, 3),
      safetyScore: Math.floor(Math.random() * 2) + 4, // placeholder
      connectivityScore: Math.floor(Math.random() * 2) + 3,
      recommendation: avgRent > 0
        ? `${locality || city} has ${properties.length} listings with avg rent ₹${Math.round(avgRent).toLocaleString()}. ${topAmenities.length ? `Top amenities include ${topAmenities.slice(0, 3).join(', ')}.` : ''} ${budgetFit === 'Good fit' ? '✅ Your budget fits well here.' : '⚠️ Consider a slightly higher budget for this area.'}`
        : 'Limited data available for this locality. Try a broader search.',
    };

    res.json({ success: true, data: insights });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// AI Expense Predictor
export const expensePredictor = async (req, res) => {
  try {
    const { rent, city, furnishing, occupancy } = req.body;

    const baseElectricity = furnishing === 'furnished' ? 1500 : 800;
    const waterBill = 200;
    const internet = 600;
    const cooking = occupancy === 'single' ? 3000 : occupancy === 'double' ? 2000 : 1500;
    const transport = city?.toLowerCase() === 'mumbai' ? 1500 : city?.toLowerCase() === 'delhi' ? 1200 : 800;
    const misc = 1000;

    const monthly = {
      rent: Number(rent) || 0,
      electricity: baseElectricity,
      water: waterBill,
      internet,
      cooking,
      transport,
      misc,
    };

    const total = Object.values(monthly).reduce((s, v) => s + v, 0);

    res.json({
      success: true,
      data: {
        breakdown: monthly,
        total,
        tips: [
          'Split internet with roommates to save ₹300/month',
          `Cook at home — saves ~₹2000/month vs eating out`,
          `Metro/bus over auto saves ₹800-1500/month in ${city || 'metro cities'}`,
          'Use LED bulbs and switch off AC when away',
        ],
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Smart Recommendations
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
          _id: { $ne: propertyId },
          $or: [
            { 'address.city': ref.address.city, type: ref.type },
            { rent: { $gte: ref.rent * 0.7, $lte: ref.rent * 1.3 }, 'address.city': ref.address.city },
          ],
        };
      }
    } else if (user?.preferences) {
      const { budget, propertyType, locations } = user.preferences;
      if (budget?.max) query.rent = { $lte: budget.max };
      if (propertyType?.length) query.type = { $in: propertyType };
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