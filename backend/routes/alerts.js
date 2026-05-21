/**
 * Alerts Routes
 * Smart alert system for dangerous space events
 */

const express = require('express');
const router = express.Router();
const nasa = require('../services/nasa');
const { scoreToRisk, analyzeSolarRisk, analyzeAsteroidRisk } = require('../ai/analyzer');

// GET /api/alerts - Get all current alerts
router.get('/', async (req, res) => {
  try {
    const [flares, storms, cmes, asteroids] = await Promise.allSettled([
      nasa.getSolarFlares(7),
      nasa.getGeoStorms(7),
      nasa.getCMEs(7),
      nasa.getAsteroids(7)
    ]);

    const alerts = [];
    const now = new Date();

    // ── Solar Flare Alerts ──────────────────────────────────────────────────
    const recentFlares = (flares.value || []).filter(f => f.classType?.match(/^[XM]/));
    recentFlares.forEach(f => {
      const severity = f.classType.startsWith('X') ? 'HIGH' : 'MEDIUM';
      alerts.push({
        id: `flare_${f.flrID || Date.now()}`,
        type: 'SOLAR_FLARE',
        severity,
        title: `${f.classType} Solar Flare Detected`,
        description: `A ${f.classType}-class solar flare was recorded. ${
          severity === 'HIGH'
            ? 'Potential radio blackouts on sunlit side of Earth.'
            : 'Minor radio interference possible.'
        }`,
        timestamp: f.beginTime,
        icon: '☀️',
        color: severity === 'HIGH' ? '#ff4757' : '#ffa502'
      });
    });

    // ── Geomagnetic Storm Alerts ────────────────────────────────────────────
    (storms.value || []).forEach(s => {
      const kp = parseFloat(s.allKpIndex?.[0]?.kpIndex || 0);
      if (kp >= 5) {
        const severity = kp >= 7 ? 'HIGH' : 'MEDIUM';
        alerts.push({
          id: `storm_${s.gstID || Date.now()}`,
          type: 'GEO_STORM',
          severity,
          title: `Geomagnetic Storm (Kp=${kp})`,
          description: `${severity === 'HIGH' ? 'Severe' : 'Moderate'} geomagnetic storm. ${
            kp >= 7
              ? 'GPS disruptions and power grid fluctuations possible. Aurora visible at lower latitudes.'
              : 'Satellite orientation irregularities possible. Aurora may be visible.'
          }`,
          timestamp: s.startTime,
          icon: '🌍',
          color: severity === 'HIGH' ? '#ff4757' : '#ffa502'
        });
      }
    });

    // ── Asteroid Alerts ─────────────────────────────────────────────────────
    if (asteroids.value?.near_earth_objects) {
      Object.values(asteroids.value.near_earth_objects).forEach(dayNeos => {
        dayNeos.forEach(neo => {
          const lunarDist = parseFloat(
            neo.close_approach_data?.[0]?.miss_distance?.lunar || 999
          );
          if (neo.is_potentially_hazardous_asteroid || lunarDist < 10) {
            const severity = lunarDist < 2 ? 'HIGH' : neo.is_potentially_hazardous_asteroid ? 'MEDIUM' : 'LOW';
            const diameter = neo.estimated_diameter?.meters?.estimated_diameter_max?.toFixed(0);
            alerts.push({
              id: `neo_${neo.id}`,
              type: 'ASTEROID',
              severity,
              title: `Asteroid ${neo.name} Close Approach`,
              description: `Asteroid passing at ${parseFloat(lunarDist).toFixed(2)} lunar distances (~${
                parseFloat(neo.close_approach_data?.[0]?.miss_distance?.kilometers || 0).toLocaleString()
              } km). Estimated diameter: ${diameter}m.`,
              timestamp: neo.close_approach_data?.[0]?.close_approach_date_full,
              icon: '☄️',
              color: severity === 'HIGH' ? '#ff4757' : severity === 'MEDIUM' ? '#ffa502' : '#2ed573'
            });
          }
        });
      });
    }

    // ── CME Alerts ──────────────────────────────────────────────────────────
    (cmes.value || []).slice(-3).forEach(cme => {
      alerts.push({
        id: `cme_${cme.activityID || Date.now()}`,
        type: 'CME',
        severity: 'MEDIUM',
        title: 'Coronal Mass Ejection',
        description: `CME event recorded. Solar plasma cloud may cause geomagnetic disturbances in 1-3 days. Aurora activity likely.`,
        timestamp: cme.startTime,
        icon: '💫',
        color: '#a29bfe'
      });
    });

    // Sort by severity and timestamp
    const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    alerts.sort((a, b) => {
      const sevDiff = (severityOrder[a.severity] || 2) - (severityOrder[b.severity] || 2);
      if (sevDiff !== 0) return sevDiff;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    res.json({
      success: true,
      count: alerts.length,
      hasHighSeverity: alerts.some(a => a.severity === 'HIGH'),
      alerts
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
