export function getPriceCategory(rent) {
  rent = Number(rent);

  if (rent <= 10000) return "Budget";
  if (rent <= 25000) return "Affordable";
  if (rent <= 50000) return "Premium";
  if (rent <= 100000) return "Luxury";

  return "Ultra Luxury";
}