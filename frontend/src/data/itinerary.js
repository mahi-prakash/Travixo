// src/data/itinerary.js
import { Plane, MapPin, Clock, Camera, Utensils } from "lucide-react";

export const itinerary = {
  title: "Paris & London",
  dates: "Oct 12 – Oct 20",
  days: [
    {
      id: "day-1",
      dayNumber: 1,
      title: "Paris – Arrival & Classics",
      date: "Oct 12",
      activities: [
        {
          id: "item-1",
          placeKey: "cdg",
          time: "10:00 AM",
          type: "Transit",
          title: "Landing at CDG",
          place: "Charles de Gaulle Airport",
          icon: Plane,
          img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=600",
        },
        {
          id: "item-2",
          placeKey: "lelittre",
          time: "12:00 PM",
          type: "Stay",
          title: "Check-in at Le Littré",
          place: "Hotel Le Littré",
          icon: MapPin,
          img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600",
        },
        {
          id: "item-3",
          placeKey: "angelina",
          time: "01:30 PM",
          type: "Food",
          title: "Lunch at Angelina",
          place: "Angelina Paris",
          icon: Utensils,
          img: "https://images.unsplash.com/photo-1554679665-f5537f187268?q=80&w=600",
        },
        {
          id: "item-4",
          placeKey: "louvre",
          time: "03:00 PM",
          type: "Landmark",
          title: "Louvre Museum",
          place: "Musée du Louvre",
          icon: Camera,
          img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=900&auto=format&fit=crop",
        }
      ]
    },
    {
      id: "day-2",
      dayNumber: 2,
      title: "Paris – Bohemian Vibes",
      date: "Oct 13",
      activities: [
        {
          id: "item-5",
          placeKey: "carette",
          time: "10:00 AM",
          type: "Food",
          title: "Brunch at Carette",
          place: "Carette Paris",
          icon: Utensils,
          img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600",
        },
        {
          id: "item-6",
          placeKey: "montmartre",
          time: "11:30 AM",
          type: "Adventure",
          title: "Montmartre Walk",
          place: "Montmartre District",
          icon: MapPin,
          img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600",
        }
      ]
    },
    {
      id: "day-3",
      dayNumber: 3,
      title: "Paris – Iconic Sights",
      date: "Oct 14",
      activities: [
        {
          id: 3,
          placeKey: "eiffel",
          time: "07:00 PM",
          type: "Evening Walk",
          title: "Eiffel Tower Sunset",
          place: "Eiffel Tower",
          icon: MapPin,
          img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600",
        }
      ]
    },
    {
      id: "day-4",
      dayNumber: 5,
      title: "London – Arrival",
      date: "Oct 16",
      activities: [
        {
          id: 4,
          placeKey: "coventgarden",
          time: "01:00 PM",
          type: "Hotel Check-in",
          title: "Check-in at Covent Garden",
          place: "Covent Garden",
          icon: MapPin,
          img: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?q=80&w=900&auto=format&fit=crop",
        }
      ]
    },
    {
      id: "day-5",
      dayNumber: 6,
      title: "London – Landmarks",
      date: "Oct 17",
      activities: [
        {
          id: 5,
          placeKey: "bigben",
          time: "05:00 PM",
          type: "City Walk",
          title: "Big Ben & Westminster",
          place: "Big Ben & Westminster",
          icon: MapPin,
          img: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?q=80&w=900&auto=format&fit=crop",
        }
      ]
    },
    {
      id: "day-6",
      dayNumber: 7,
      title: "London – History & Culture",
      date: "Oct 18",
      activities: [
        {
          id: 6,
          placeKey: "britishmuseum",
          time: "11:00 AM",
          type: "Museum Visit",
          title: "British Museum Exploration",
          place: "British Museum",
          icon: Camera,
          img: "https://images.unsplash.com/photo-1518991033221-399a0914c69d?q=80&w=900&auto=format&fit=crop",
        }
      ]
    },
  ],
};
