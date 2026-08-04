import React, { useState } from "react";
import { getHaversineDistanceKm } from "../../utils/chatHelpers";

// ─── Smart Hotel Recommendation Engine (When Not Booked Yet) ────────────────
export default function HotelRecommendationEngine({ value, onChange, destination, mustVisitPlaces, arrivalStation }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);
  const [error, setError] = useState(null);
  const [transportMode, setTransportMode] = useState("train");
  const [anchorLabel, setAnchorLabel] = useState("");

  const handleRecommend = async (customQuery) => {
    if (!window.google || (!destination && !customQuery)) {
      setError("Please ensure destination is set in Step 2.");
      return;
    }
    setLoading(true);
    setError(null);
    setShowList(true);

    try {
      if (!window.google.maps.places) throw new Error("Places API missing");
      let PlaceClass = window.google.maps.places.Place;
      if (!PlaceClass && window.google.maps.importLibrary) {
        const lib = await window.google.maps.importLibrary("places");
        PlaceClass = lib.Place;
      }
      if (!PlaceClass) throw new Error("Places API unavailable");

      // 1. Determine logical geographic anchor point
      let anchorText = destination;
      let anchorName = destination;
      if (mustVisitPlaces && mustVisitPlaces.length > 0) {
        anchorText = `${mustVisitPlaces[0]} in ${destination}`;
        anchorName = mustVisitPlaces[0];
      } else if (arrivalStation && arrivalStation.trim()) {
        anchorText = `${arrivalStation} in ${destination}`;
        anchorName = arrivalStation;
      } else {
        anchorText = `${transportMode === 'flight' ? 'airport' : 'railway station'} in ${destination}`;
        anchorName = `${transportMode === 'flight' ? 'Airport' : 'Railway Station'}`;
      }
      setAnchorLabel(anchorName);

      // 2. Locate anchor coordinates for Haversine calculations
      let anchorLat = null;
      let anchorLng = null;
      try {
        const { places: anchorRes } = await PlaceClass.searchByText({
          textQuery: anchorText,
          fields: ['location', 'displayName']
        });
        if (anchorRes && anchorRes.length > 0 && anchorRes[0].location) {
          anchorLat = typeof anchorRes[0].location.lat === 'function' ? anchorRes[0].location.lat() : anchorRes[0].location.lat;
          anchorLng = typeof anchorRes[0].location.lng === 'function' ? anchorRes[0].location.lng() : anchorRes[0].location.lng;
          if (anchorRes[0].displayName) anchorName = anchorRes[0].displayName;
          setAnchorLabel(anchorName);
        }
      } catch (e) {
        console.warn("Could not fetch exact anchor coordinates, defaulting to city bounds:", e);
      }

      // 3. Search for stays near anchor or matching query
      const query = customQuery
        ? `${customQuery} stay hotel in ${destination}`
        : `top rated hotels resorts near ${anchorName} in ${destination}`;

      const { places } = await PlaceClass.searchByText({
        textQuery: query,
        fields: ['displayName', 'formattedAddress', 'id', 'location', 'rating']
      });

      if (places && places.length > 0) {
        const mapped = places.slice(0, 8).map(p => {
          let dist = null;
          if (anchorLat !== null && anchorLng !== null && p.location) {
            const hLat = typeof p.location.lat === 'function' ? p.location.lat() : p.location.lat;
            const hLng = typeof p.location.lng === 'function' ? p.location.lng() : p.location.lng;
            dist = getHaversineDistanceKm(anchorLat, anchorLng, hLat, hLng);
          }
          return {
            name: p.displayName,
            rating: p.rating,
            distance: dist,
            id: p.id
          };
        });
        // Sort mathematically by closest distance!
        mapped.sort((a, b) => {
          if (a.distance && b.distance) return parseFloat(a.distance) - parseFloat(b.distance);
          return 0;
        });
        setSuggestions(mapped);
      } else {
        setError(customQuery ? `No stays found for "${customQuery}".` : "No hotels found near anchor point.");
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Smart recommendation err:", err);
      setError("Could not compute spatial recommendations via Google Maps.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {!arrivalStation && (!mustVisitPlaces || mustVisitPlaces.length === 0) && (
        <div className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <span className="text-slate-600 font-medium">Primary arrival mode?</span>
          <div className="flex gap-1">
            <button type="button" onClick={() => setTransportMode("train")} className={`px-2 py-0.5 rounded-md border font-bold transition text-[11px] ${transportMode === "train" ? "bg-sky-600 text-white border-sky-600" : "bg-white text-slate-600 border-slate-200"}`}>🚆 Train</button>
            <button type="button" onClick={() => setTransportMode("flight")} className={`px-2 py-0.5 rounded-md border font-bold transition text-[11px] ${transportMode === "flight" ? "bg-sky-600 text-white border-sky-600" : "bg-white text-slate-600 border-slate-200"}`}>✈️ Flight</button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-1">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Preferred Area / Stay (Optional)</label>
        <button
          type="button"
          onClick={() => handleRecommend("")}
          className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-2.5 py-0.5 rounded-md hover:bg-emerald-200 transition shadow-sm"
        >
          {loading ? "Computing..." : "✨ Smart Recommend"}
        </button>
      </div>
      <div className="flex gap-1.5">
        <input
          value={value || ""}
          onChange={(e) => {
            onChange(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (value && value.trim()) handleRecommend(value);
            }
          }}
          placeholder="e.g. Near Sea Beach or Hotel Name"
          className="flex-1 px-3.5 py-2 bg-slate-100/50 border-2 focus:bg-white focus:border-sky-600 rounded-xl outline-none text-sm transition font-medium placeholder:font-normal"
        />
        <button
          type="button"
          onClick={() => {
            if (value && value.trim()) {
              handleRecommend(value);
            } else {
              handleRecommend("");
            }
          }}
          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
        >
          Search
        </button>
      </div>
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
      {showList && suggestions.length > 0 && (
        <div className="flex flex-col gap-1 mt-1.5 max-h-28 overflow-y-auto pr-1 border border-slate-200 bg-white rounded-lg p-1.5 shadow-inner">
          {suggestions.map((item) => {
            const isSelected = value === item.name;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onChange(item.name);
                  setShowList(false);
                }}
                className={`w-full text-left text-[12px] px-2.5 py-1.5 rounded-md transition-all flex flex-col justify-center ${isSelected ? 'bg-sky-50 text-sky-800 font-semibold border border-sky-200' : 'text-slate-700 hover:bg-slate-50 border border-transparent'}`}
              >
                <div className="flex justify-between w-full">
                  <span className="truncate pr-2 font-medium">{item.name}</span>
                  {item.rating && <span className="text-[11px] text-amber-600 font-bold flex-shrink-0">⭐ {item.rating}</span>}
                </div>
                {item.distance && (
                  <span className="text-[10px] text-slate-500 font-normal mt-0.5">
                    📍 {item.distance} km from {anchorLabel || "center"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
