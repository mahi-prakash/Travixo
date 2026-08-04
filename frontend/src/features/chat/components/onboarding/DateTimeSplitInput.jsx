import React from "react";
import { Clock, Calendar } from "lucide-react";

// ─── Custom Split Input for Date & Time ─────────────────────────────────────
export default function DateTimeSplitInput({ value, onChange }) {
  const [dateVal, timeVal] = value ? value.split("T") : ["", ""];

  const handleDateChange = (newDate) => {
    const timeToUse = timeVal || "10:00";
    onChange(newDate ? `${newDate}T${timeToUse}` : "");
  };

  const handleTimeChange = (newTime) => {
    const dateToUse = dateVal || new Date().toISOString().split("T")[0];
    onChange(`${dateToUse}T${newTime}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
      <div className="relative flex items-center">
        <div className="absolute left-3.5 flex items-center pointer-events-none text-sky-600">
          <Calendar className="w-4 h-4" />
        </div>
        <input
          type="date"
          value={dateVal || ""}
          onChange={(e) => handleDateChange(e.target.value)}
          className="w-full pl-10 pr-3 py-2.5 bg-slate-100/50 border-2 focus:bg-white focus:border-sky-600 rounded-xl outline-none text-sm text-slate-800 font-semibold transition cursor-pointer"
        />
      </div>
      <div className="relative flex items-center">
        <div className="absolute left-3.5 flex items-center pointer-events-none text-sky-600">
          <Clock className="w-4 h-4" />
        </div>
        <input
          type="time"
          value={timeVal || ""}
          onChange={(e) => handleTimeChange(e.target.value)}
          className="w-full pl-10 pr-3 py-2.5 bg-slate-100/50 border-2 focus:bg-white focus:border-sky-600 rounded-xl outline-none text-sm text-slate-800 font-semibold transition cursor-pointer"
        />
      </div>
    </div>
  );
}
