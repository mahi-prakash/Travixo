// src/data/mockTrips.js
export const mockTrips = [
  {
    id: "1",
    title: "Paris + London chaotic culture run",
    dates: "Oct 12 - Oct 20",
    summary: "2 flights · 2 stays · 8 activities",
    locations: ["Paris", "London"],
    vibeTag: "The Explorer",
    budgetHint: "Budget rough cut ready",
    itinerary: [
      {
        label: "Day 1 · Paris arrival",
        items: [
          {
            type: "flight",
            time: "09:40",
            title: "BLR → CDG · AF1234 · Economy",
            meta: "Non‑stop · Terminal 2",
          },
          {
            type: "stay",
            time: "14:00",
            title: "Check‑in · Le Meurice, Paris",
            meta: "3 nights · Deluxe garden view",
          },
        ],
      },
      {
        label: "Day 2 · Paris culture crawl",
        items: [
          {
            type: "activity",
            time: "10:00",
            title: "Louvre + Left Bank wander",
            meta: "Private guide · 6 hours",
          },
          {
            type: "activity",
            time: "18:30",
            title: "Seine sunset cruise",
            meta: "Golden hour views",
          },
        ],
      },
    ],
    budget: {
      currency: "EUR",
      roughTotal: 2100,
    },
  },
];
