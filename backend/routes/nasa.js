/**
 * NASA Data Routes
 * Exposes endpoints for solar events, asteroids, and dashboard aggregation
 */

const express = require('express');
const router = express.Router();
const nasa = require('../services/nasa');

// GET /api/nasa/dashboard - All data in one call
router.get('/dashboard', async (req, res) => {
  try {
    const data = await nasa.getDashboardData();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/nasa/flares?days=30
router.get('/flares', async (req, res) => {
  const days = Math.min(parseInt(req.query.days) || 30, 90);
  const data = await nasa.getSolarFlares(days);
  res.json({ success: true, data: data || [], count: (data || []).length });
});

// GET /api/nasa/storms?days=30
router.get('/storms', async (req, res) => {
  const days = Math.min(parseInt(req.query.days) || 30, 90);
  const data = await nasa.getGeoStorms(days);
  res.json({ success: true, data: data || [], count: (data || []).length });
});

// GET /api/nasa/cme?days=30
router.get('/cme', async (req, res) => {
  const days = Math.min(parseInt(req.query.days) || 30, 90);
  const data = await nasa.getCMEs(days);
  res.json({ success: true, data: data || [], count: (data || []).length });
});

// GET /api/nasa/asteroids?days=7
router.get('/asteroids', async (req, res) => {
  const days = Math.min(parseInt(req.query.days) || 7, 7); // NeoWs max 7 days
  const data = await nasa.getAsteroids(days);
  if (!data) return res.json({ success: false, data: null });

  // Flatten and enrich asteroid data
  const flat = [];
  if (data.near_earth_objects) {
    Object.entries(data.near_earth_objects).forEach(([date, asteroids]) => {
      asteroids.forEach(neo => {
        flat.push({
          id: neo.id,
          name: neo.name,
          date,
          isHazardous: neo.is_potentially_hazardous_asteroid,
          diameter: {
            min: neo.estimated_diameter?.meters?.estimated_diameter_min?.toFixed(1),
            max: neo.estimated_diameter?.meters?.estimated_diameter_max?.toFixed(1)
          },
          velocity: neo.close_approach_data?.[0]?.relative_velocity?.kilometers_per_hour,
          missDistance: {
            km: neo.close_approach_data?.[0]?.miss_distance?.kilometers,
            lunar: neo.close_approach_data?.[0]?.miss_distance?.lunar
          },
          absoluteMagnitude: neo.absolute_magnitude_h
        });
      });
    });
  }

  res.json({
    success: true,
    count: data.element_count,
    data: flat,
    raw: data.near_earth_objects
  });
});

// GET /api/nasa/asteroid/:id
router.get('/asteroid/:id', async (req, res) => {
  const data = await nasa.getAsteroidById(req.params.id);
  res.json({ success: true, data });
});

// GET /api/nasa/cache-stats
router.get('/cache-stats', (req, res) => {
  const { getCacheStats } = require('../services/cache');
  res.json({ success: true, stats: getCacheStats() });
});

module.exports = router;
