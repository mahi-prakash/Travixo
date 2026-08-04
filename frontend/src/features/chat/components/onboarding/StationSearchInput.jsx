import React, { useState } from "react";

// ─── Station / Airport Google Search Input ──────────────────────────────────
export default function StationSearchInput({ value, onChange, placeholder, destination, label }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);
  const [error, setError] = useState(null);

  const fetchStations = async (customQuery) => {
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

      const query = customQuery
        ? `${customQuery} in or near ${destination}`
        : `top railway station airport transport in ${destination}`;

      const { places } = await PlaceClass.searchByText({
        textQuery: query,
        fields: ['displayName', 'formattedAddress', 'id']
      });

      if (places && places.length > 0) {
        setSuggestions(places.slice(0, 8).map(p => ({ name: p.displayName, id: p.id })));
      } else {
        setError(customQuery ? `No stations found matching "${customQuery}".` : "No stations or airports found.");
        setSuggestions([]);
      }
    } catch (err) {
      console.error("Station search err:", err);
      setError("Could not reach Google Maps.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</label>
        <button
          type="button"
          onClick={() => fetchStations("")}
          className="text-[10px] text-sky-600 font-bold bg-sky-100 px-2.5 py-0.5 rounded-md hover:bg-sky-200 transition"
        >
          {loading ? "Loading..." : "Fetch Top"}
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
              if (value && value.trim()) fetchStations(value);
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3.5 py-2 bg-slate-100/50 border-2 focus:bg-white focus:border-sky-600 rounded-xl outline-none text-sm transition font-medium placeholder:font-normal"
        />
        <button
          type="button"
          onClick={() => {
            if (value && value.trim()) {
              fetchStations(value);
            } else {
              fetchStations("");
            }
          }}
          className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
        >
          Search
        </button>
      </div>
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
      {showList && suggestions.length > 0 && (
        <div className="flex flex-col gap-1 mt-1.5 max-h-24 overflow-y-auto pr-1 border border-slate-200 bg-white rounded-lg p-1.5 shadow-inner">
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
                className={`w-full text-left text-[12px] px-2.5 py-1.5 rounded-md transition-all flex items-center justify-between ${isSelected ? 'bg-sky-50 text-sky-700 font-semibold border border-sky-200' : 'text-slate-700 hover:bg-slate-50 border border-transparent'}`}
              >
                <span className="truncate pr-2">{item.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
