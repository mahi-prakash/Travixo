import { useUser } from "../../../context/UserContext";

export default function useProfileData() {
  const { user, profile } = useUser();
  const userAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (user?.email || "adventurer");

  const mockUser = {
    navName: user?.user_metadata?.full_name || "Guest Explorer",
    navAvatar: userAvatar,
    coverImage: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=1200&auto=format&fit=crop",
    avatarImage: userAvatar,
    profileName: user?.user_metadata?.full_name || "Guest Explorer",
    location: "Global Nomad",
    joinedDate: "Joined April 2026",
    email: user?.email || "guest@example.com",
    vibe: "Modern Nomad",
    stats: {
      tripsPlanned: 12,
      placesSaved: 48,
      milesTraveled: "14.2k",
      countriesVisited: 8
    },
    badges: [
      { id: 1, name: "Early Bird" },
      { id: 2, name: "Foodie" },
      { id: 3, name: "Explorer" }
    ],
    bucketList: [
      { id: 1, place: "See Northern Lights in Iceland", completed: true },
      { id: 2, place: "Hike Mount Fuji, Japan", completed: false },
      { id: 3, place: "Eat pizza in Naples, Italy", completed: false }
    ],
    upcomingTrips: [
      { id: 1, destination: "Tokyo, Japan", date: "Nov 12 - Nov 20, 2026", image: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?fm=jpg&q=60&w=3000&auto=format&fit=crop", status: "READY", daysUntil: 45, weather: "18°C" }
    ],
    visitedPins: [
      { id: 1, name: "Paris", lat: 48.8566, lng: 2.3522 },
      { id: 2, name: "New York", lat: 40.7128, lng: -74.0060 },
      { id: 3, name: "Tokyo", lat: 35.6762, lng: 139.6503 }
    ],
    recentMemories: [
      { id: 1, title: "Sunset at Eiffel", location: "Paris, France", date: "Oct 2025", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600", likes: 124 },
      { id: 2, title: "Central Park Stroll", location: "NYC, USA", date: "Dec 2025", image: "https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?q=80&w=600", likes: 89 },
      { id: 3, title: "Sushi Night", location: "Tokyo, Japan", date: "Mar 2026", image: "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=600", likes: 210 }
    ]
  };

  return { user: mockUser, authUser: user };
}
