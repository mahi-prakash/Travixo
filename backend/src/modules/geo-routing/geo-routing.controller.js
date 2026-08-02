/**
 * @file Bounded Context: Geo-Routing Controller
 * Presentation layer responsible for handling HTTP requests for travel route calculations.
 */

const geoRoutingService = require('./geo-routing.service');
const { isValidCoordinatesArray } = require('./geo-routing.types');

class GeoRoutingController {
  /**
   * POST /calculate
   * Handler for calculating logistics distance and duration between geographic points.
   */
  async calculateRoutes(req, res, next) {
    try {
      const { coordinates } = req.body;

      if (!isValidCoordinatesArray(coordinates)) {
        return res.status(400).json({
          error: 'Invalid coordinates format. At least two numeric [longitude, latitude] coordinate pairs are required.'
        });
      }

      const results = await geoRoutingService.calculateDrivingRoutes(coordinates);
      return res.status(200).json({ results });

    } catch (error) {
      console.error('Geo-Routing domain error:', error);
      return res.status(500).json({ error: 'Failed to calculate travel routing logistics.' });
    }
  }
}

module.exports = new GeoRoutingController();
