/**
 * @file Bounded Context: Geo-Routing Routes
 * Router binding for logistics and routing API endpoints.
 */

const express = require('express');
const router = express.Router();
const geoRoutingController = require('./geo-routing.controller');

// Mount route for calculating route logistics
router.post('/calculate', (req, res, next) => geoRoutingController.calculateRoutes(req, res, next));

module.exports = router;
