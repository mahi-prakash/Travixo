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

      // 'res' is an array of clusters. Each cluster has { centroid, cluster, clusterInd }
      // clusterInd is an array of indices of the original 'vectors' array that belong to this cluster
      
      const daysObject = {};
      
      // Sort clusters by centroid longitude or latitude to make a rough geographical sequence
      // Optional, but helps prevent criss-crossing the city day by day
      const sortedClusters = res.sort((a, b) => a.centroid[1] - b.centroid[1]);

      sortedClusters.forEach((cluster, idx) => {
        const dayNumber = idx + 1;
        const dayId = `day-${dayNumber}`;
        
        // Map the indices back to the original place objects with logical sequential schedules
        const timeSlots = ["10:00 AM", "01:30 PM", "04:30 PM", "07:30 PM", "09:00 PM"];
        const dayPlaces = cluster.clusterInd.map((i, placeIdx) => ({
          ...places[i],
          time: places[i].time || timeSlots[placeIdx] || `${9 + placeIdx}:00 AM`
        }));
        
        // Optionally sort dayPlaces to minimize distance within the day (TSP approach)
        // For now, we'll just keep the order they were in

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
