export function extractBHK(description) {
  if (!description) return null;

  const patterns = [
    /(\d+)\s*bhk/i,
    /(\d+)\s*bed(room)?/i,
    /(\d+)\s*br/i,
  ];

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) {
      return Number(match[1]);
    }
  }

  return null;
}