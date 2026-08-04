// ─── Dynamic Nearby places from Google ──────────────────────────────────────
export const googleLibraries = ['places'];

// ─── Haversine Distance Helper ──────────────────────────────────────────────
export function getHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

// ─── Day Number Parsing Helper ──────────────────────────────────────────────
export function getDayNumber(day, index) {
  return day?.dayNumber ?? day?.day ?? day?.day_index ?? day?.dayId ?? index + 1;
}

// ─── Markdown Styles String ──────────────────────────────────────────────────
export const MARKDOWN_STYLES = `
  .prose p { margin-bottom: 0.75rem; }
  .prose p:last-child { margin-bottom: 0; }
  .prose ul, .prose ol { margin-left: 1.25rem; margin-bottom: 0.75rem; list-style-type: disc; }
  .prose ol { list-style-type: decimal; }
  .prose li { margin-bottom: 0.35rem; }
  .prose strong { font-weight: 700; color: inherit; }
  .prose h1, .prose h2, .prose h3 { font-weight: 800; margin-top: 1rem; margin-bottom: 0.5rem; }
`;
