/**
 * @file Bounded Context: Geo-Routing Service
 * Handles external route estimation provider integrations and metrics transformation.
 */

const { ROUTING_CONSTANTS } = require('./geo-routing.types');

class GeoRoutingService {
  /**
   * Calculates driving distances and durations between multiple coordinate landmarks.
   * @param {Array<Array<number>>} coordinates - List of [lng, lat] coordinate pairs.
   * @returns {Promise<Array<{ distance: string, duration: number }>>} Array of route leg metrics.
   */
  async calculateDrivingRoutes(coordinates) {
    // OSRM expects coordinate strings formatted as lng,lat;lng,lat
    const coordString = coordinates.map(c => `${c[0]},${c[1]}`).join(';');
    const url = `${ROUTING_CONSTANTS.OSRM_DRIVING_BASE_URL}${coordString}?overview=false`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`External routing API rejected request with status: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.code !== ROUTING_CONSTANTS.SUCCESS_CODE || !Array.isArray(data.routes) || data.routes.length === 0) {
      throw new Error(`Routing engine calculation failed with code: ${data.code || 'UNKNOWN'}`);
    }

    const primaryRoute = data.routes[0];
    const legs = primaryRoute.legs || [];

    // Transform raw OSRM leg meters and seconds to display-friendly km and minutes
    const results = legs.map(leg => ({
      distance: (leg.distance / 1000).toFixed(1),
      duration: Math.ceil(leg.duration / 60),
    }));

    return results;
  }
}

module.exports = new GeoRoutingService();
