// src/data/placesFromItinerary.js
import { itinerary } from "./itinerary";
import { selectedPlaces } from "./selectedPlaces";

// Step 1: build image lookup from itinerary activities
const itineraryImageMap = (itinerary.days || []).reduce((map, day) => {
  const activities = day.activities || [day];
  activities.forEach(activity => {
    if (activity?.placeKey && activity?.img && !map[activity.placeKey]) {
      map[activity.placeKey] = activity.img;
    }
  });
  return map;
}, {});

// Step 2: merge images into selected places
export const derivedSelectedPlaces = selectedPlaces.map((place) => ({
  ...place,
  img: itineraryImageMap[place.placeKey] ?? "/fallback.jpg",
}));
