const kmeans = require('node-kmeans');

/**
 * Clusters a list of places into geographical groups (days).
 * @param {Array} places - Array of verified places (each must have coords: [lat, lng])
 * @param {Number} requestedDays - How many days the user requested (if any).
 * @returns {Promise<Object>} - The days object structured for the Planner UI
 */
const clusterPlacesIntoDays = (places, requestedDays) => {
  return new Promise((resolve, reject) => {
    if (!places || places.length === 0) {
      return resolve({});
    }

    // Determine the number of clusters (k)
    // If user asked for specific days, use that. Otherwise, assume ~3 places per day.
    let k = requestedDays ? parseInt(requestedDays, 10) : Math.ceil(places.length / 3);
    
    // Safety check: You can't have more clusters than places
    if (k > places.length) {
      k = places.length;
    }
    
    if (k < 1) k = 1;

    // Create a vectors array for kmeans [[lat, lng], [lat, lng]]
    const vectors = places.map(p => p.coords);

    // Run k-means
    kmeans.clusterize(vectors, { k }, (err, res) => {
      if (err) {
        console.error("K-Means Error:", err);
        return reject(err);
      }

      const daysObject = {};
      
      // Sort clusters by centroid longitude or latitude to make a rough geographical sequence
      const sortedClusters = res.sort((a, b) => a.centroid[1] - b.centroid[1]);

      sortedClusters.forEach((cluster, idx) => {
        const dayNumber = idx + 1;
        const dayId = `day-${dayNumber}`;
        
        const timeSlots = ["10:00 AM", "01:30 PM", "04:30 PM", "07:30 PM", "09:00 PM"];
        const dayPlaces = cluster.clusterInd.map((i, placeIdx) => ({
          ...places[i],
          time: places[i].time || timeSlots[placeIdx] || `${9 + placeIdx}:00 AM`
        }));
        
        daysObject[dayId] = {
          day: dayNumber,
          id: dayId,
          items: dayPlaces,
          activities: dayPlaces
        };
      });

      resolve(daysObject);
    });
  });
};

module.exports = {
  clusterPlacesIntoDays
};
