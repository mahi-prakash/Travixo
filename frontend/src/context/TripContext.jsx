import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchPhoto } from "../utils/unsplash";
import { supabase } from "../utils/supabase";
import { useUser } from "./UserContext";

const TripContext = createContext(null);

export const TripProvider = ({ children }) => {
  const { user } = useUser();
  const [trips, setTrips] = useState([]);
  const [activeTripId, setActiveTripId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [itineraryCache, setItineraryCache] = useState({});

  // 🔄 Fetch Trip from Supabase on Login
  useEffect(() => {
    if (user) {
      fetchTrips();
    } else {
      setTrips([]);
      setActiveTripId(null);
      setItineraryCache({});
    }
  }, [user]);

  const fetchTrips = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching trips:", error);
    } else {
      setTrips(data || []);
      if (data && data.length > 0) {
        setActiveTripId(data[0].id);
        const cache = {};
        data.forEach(t => {
          if (t.itinerary) cache[t.id] = t.itinerary;
        });
        setItineraryCache(cache);
      }
    }
    setLoading(false);
  };

  const enhanceItineraryWithImages = async (itineraryData) => {
    if (!itineraryData?.days) return itineraryData;

    const dayEntries = Array.isArray(itineraryData.days)
      ? itineraryData.days.map((d, i) => [`day-${i + 1}`, d])
      : Object.entries(itineraryData.days);

    const enhancedDaysArray = await Promise.all(
      dayEntries.map(async ([dayId, day]) => {
        const activities = day.activities || day.items || [];
        const enhancedActivities = await Promise.all(
          activities.map(async (activity) => {
            if (activity.img) return activity;
            const query = `${activity.title || activity.name} ${activity.location || ""}`.trim();
            const imageUrl = await fetchPhoto(query);
            return {
              ...activity,
              img: imageUrl || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=600&auto=format&fit=crop",
            };
          }),
        );
        return [dayId, { ...day, activities: enhancedActivities }];
      }),
    );

    if (!Array.isArray(itineraryData.days)) {
      return { ...itineraryData, days: Object.fromEntries(enhancedDaysArray) };
    }

    return { ...itineraryData, days: enhancedDaysArray.map(pair => pair[1]) };
  };

  const createTrip = async (payload) => {
    if (!user) return null;

    try {
      // 1. Delete existing trip for this user (will cascade delete messages)
      await supabase
        .from('trips')
        .delete()
        .eq('user_id', user.id);

      // 2. Insert brand new trip
      const tripPayload = {
        user_id: user.id,
        title: payload.title,
        destination: payload.destination,
        start_date: payload.start_date,
        end_date: payload.end_date,
        image: payload.image,
        itinerary: payload.itinerary || null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('trips')
        .insert(tripPayload)
        .select()
        .single();

      if (error) throw error;

      setTrips([data]);
      setActiveTripId(data.id);
      if (data.itinerary) {
        setItineraryCache(prev => ({ ...prev, [data.id]: data.itinerary }));
      }
      return data;
    } catch (error) {
      console.error("Error creating fresh trip:", error);
      return null;
    }
  };

  const updateTrip = async (id, payload) => {
    const { data, error } = await supabase
      .from('trips')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating trip:", error);
      return;
    }

    setTrips(prev => prev.map(t => t.id === id ? data : t));
    if (data.itinerary) {
      setItineraryCache(prev => ({ ...prev, [id]: data.itinerary }));
    }
  };

  const addItemToTrip = async (tripId, dayId, item) => {
    const itinerary = itineraryCache[tripId] || { days: {} };
    const newItinerary = JSON.parse(JSON.stringify(itinerary));

    if (!newItinerary.days) newItinerary.days = {};
    if (!newItinerary.days[dayId]) {
      newItinerary.days[dayId] = {
        id: dayId,
        title: dayId.replace("day-", "Day "),
        activities: []
      };
    }

    const activities = newItinerary.days[dayId].activities || newItinerary.days[dayId].items || [];
    const newItem = {
      ...item,
      id: `item-${Date.now()}`,
      time: item.time
    };

    newItinerary.days[dayId].activities = [...activities, newItem];
    
    await updateTrip(tripId, { itinerary: newItinerary });
  };

  const saveItineraryToCache = (id, itinerary) => {
    if (!id) return;
    setItineraryCache(prev => ({ ...prev, [id]: itinerary }));
    updateTrip(id, { itinerary });
  };

  const setActiveTrip = (tripId) => {
    setActiveTripId(tripId || null);
  };

  const deleteTrip = async (tripId) => {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripId);

    if (error) {
      console.error("Error deleting trip:", error);
      return;
    }

    setTrips(prev => prev.filter(t => t.id !== tripId));
    setItineraryCache(prev => {
      const newCache = { ...prev };
      delete newCache[tripId];
      return newCache;
    });
    if (activeTripId === tripId) {
      setActiveTripId(null);
    }
  };

  const activeTrip = trips.find((t) => t.id === activeTripId) || null;

  return (
    <TripContext.Provider
      value={{
        trips,
        activeTripId,
        activeTrip,
        loading,
        createTrip,
        setActiveTrip,
        fetchTrips,
        itineraryCache,
        saveItineraryToCache,
        addItemToTrip,
        deleteTrip,
        updateTrip,
        updateTripItinerary: (id, itin) => updateTrip(id, { itinerary: itin }),
        updateAiItinerary: (id, itin) => updateTrip(id, { itinerary: itin }),
        isGenerating,
        setIsGenerating,
        enhanceItineraryWithImages
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => useContext(TripContext);
