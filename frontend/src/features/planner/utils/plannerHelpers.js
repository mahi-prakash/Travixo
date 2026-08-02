import {
  Plane,
  Hotel,
  Utensils,
  Camera,
  MapPin
} from 'lucide-react';

export const googleLibraries = ['places'];
export const LIBRARIES = ['places'];

export const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "1.5rem",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  overflow: "hidden"
};

export const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  mapTypeControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]
};

export const initialDays = {
  "day-1": {
    id: "day-1",
    title: "Day 1: Arrival & Classics",
    date: "Oct 12",
    color: "#0284c7",
    items: [
      {
        id: "item-1",
        type: "flight",
        title: "Landing at CDG",
        time: "10:00 AM",
        location: "Charles de Gaulle Airport",
        coords: [49.0097, 2.5479],
        img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=600",
        category: "Transit",
        cost: "N/A",
        duration: "1h 30m",
        bestTime: "Morning",
        tags: ["Travel", "Airport"],
        desc: "Arrival at Paris Charles de Gaulle. Proceed to baggage claim and take the RER B train to the city center."
      },
      {
        id: "item-2",
        type: "hotel",
        title: "Check-in at Le Littré",
        time: "12:00 PM",
        location: "Hotel Le Littré",
        coords: [48.8431, 2.3248],
        img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600",
        category: "Stay",
        cost: "€250/night",
        duration: "Check-in",
        bestTime: "After 2 PM",
        tags: ["Luxury", "Comfort"],
        desc: "A charming 4-star hotel located in the 6th arrondissement, between Saint-Germain-des-Prés and Montparnasse."
      },
      {
        id: "item-3",
        type: "food",
        title: "Lunch at Angelina",
        time: "01:30 PM",
        location: "Angelina Paris",
        coords: [48.8653, 2.3292],
        img: "https://images.unsplash.com/photo-1554679665-f5537f187268?q=80&w=600",
        category: "Food",
        cost: "€40-60",
        duration: "1h 30m",
        bestTime: "Lunch",
        tags: ["Famous", "Hot Chocolate", "Pastry"],
        desc: "Famous tearoom known for its signature hot chocolate 'L'Africain' and Mont-Blanc pastry. A must-visit classic."
      },
      {
        id: "item-4",
        type: "activity",
        title: "Louvre Museum",
        time: "03:00 PM",
        location: "Musée du Louvre",
        coords: [48.8606, 2.3376],
        img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=900&auto=format&fit=crop",
        category: "Landmark",
        cost: "€17",
        duration: "3h+",
        bestTime: "Early Morning or Late Night",
        tags: ["Art", "History", "Museum"],
        desc: "The world's largest art museum and a historic monument in Paris. Home to the Mona Lisa and thousands of other masterpieces."
      },
    ],
  },
  "day-2": {
    id: "day-2",
    title: "Day 2: Bohemian Vibes",
    date: "Oct 13",
    color: "#0284c7",
    items: [
      {
        id: "item-5",
        type: "food",
        title: "Brunch at Carette",
        time: "10:00 AM",
        location: "Carette",
        coords: [48.8637, 2.2872],
        img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600",
        category: "Food",
        cost: "€30-50",
        duration: "1h 30m",
        bestTime: "Morning",
        tags: ["Brunch", "Macarons", "View"],
        desc: "Elegant café serving delicious brunch and pastries. Great view of Trocadéro."
      },
      {
        id: "item-6",
        type: "activity",
        title: "Montmartre Walk",
        time: "11:30 AM",
        location: "Montmartre",
        coords: [48.8867, 2.3431],
        img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=60",
        category: "Adventure",
        cost: "Free",
        duration: "2h",
        bestTime: "Anytime",
        tags: ["Walking", "Views", "Art"],
        desc: "Explore the artistic hilltop district of Montmartre, famous for its cobbled streets, artists, and the Sacré-Cœur."
      },
    ],
  },
  "day-3": {
    id: "day-3",
    title: "Day 3: Shopping & Seine",
    date: "Oct 14",
    color: "#0284c7",
    items: [],
  },
};

export const getItemIcon = (type) => {
  switch (type) {
    case "flight": return Plane;
    case "hotel": return Hotel;
    case "food": return Utensils;
    case "activity": return Camera;
    default: return MapPin;
  }
};

export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return 1440;
  if (timeStr.toLowerCase() === "tbd") return 1440;

  const match = timeStr.match(/(\d+):?(\d+)?\s*(AM|PM)/i);
  if (!match) {
    const lower = timeStr.toLowerCase();
    if (lower.includes("morning")) return 480;
    if (lower.includes("noon")) return 720;
    if (lower.includes("afternoon")) return 840;
    if (lower.includes("evening")) return 1080;
    if (lower.includes("night")) return 1260;
    return 1441;
  }

  let [_, hours, minutes, period] = match;
  hours = parseInt(hours);
  minutes = parseInt(minutes || 0);

  if (period.toUpperCase() === "PM" && hours < 12) hours += 12;
  if (period.toUpperCase() === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
};
