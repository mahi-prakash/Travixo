const express = require('express');
const router = express.Router();

router.post('/calculate', async (req, res) => {
  try {
    const { coordinates } = req.body;
    // coordinates should be an array of [lng, lat]
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 2) {
      return res.status(400).json({ error: 'At least two coordinate pairs are required' });
    }

    // OSRM expects coordinates as lng,lat;lng,lat
    const coordString = coordinates.map(c => `${c[0]},${c[1]}`).join(';');
    const url = `http://router.project-osrm.org/route/v1/driving/${coordString}?overview=false`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error(`OSRM routing failed: ${data.code}`);
    }

    const route = data.routes[0];
    const legs = route.legs;

    // Map each leg to distance (km) and duration (mins)
    const results = legs.map(leg => ({
      distance: (leg.distance / 1000).toFixed(1), 
      duration: Math.ceil(leg.duration / 60) 
    }));

    res.json({ results });

  } catch (error) {
    console.error('Logistics error:', error);
    res.status(500).json({ error: 'Failed to calculate logistics' });
  }
});

module.exports = router;
