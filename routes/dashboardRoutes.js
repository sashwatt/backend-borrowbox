const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboardController'); // Import the getStats function from your controller

// Define the route to get stats
router.get('/api/v1/stats', getStats); // Use the route path '/api/v1/stats' to handle the stats request

module.exports = router;
