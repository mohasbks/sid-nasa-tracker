/**
 * map.js — Leaflet.js World Map for space event impact regions
 * Premium minimalist theme with calm matching color variables.
 */

let leafletMap = null;
const mapMarkers = [];

const REGION_IMPACTS = {
  SOLAR_FLARE: [
    { lat: 90,  lng: 0,   label: 'North Pole (Aurora Zone)',   severity: 'HIGH'   },
    { lat: -90, lng: 0,   label: 'South Pole (Aurora Zone)',   severity: 'HIGH'   },
    { lat: 60,  lng: 0,   label: 'Northern Europe',            severity: 'MEDIUM' },
    { lat: 55,  lng: 83,  label: 'Western Siberia',            severity: 'MEDIUM' },
    { lat: 65,  lng: -17, label: 'Iceland',                    severity: 'HIGH'   }
  ],
  GEO_STORM: [
    { lat: 51,  lng: -0.1, label: 'UK / Northern Europe',     severity: 'MEDIUM' },
    { lat: 64,  lng: 26,   label: 'Finland / Scandinavia',    severity: 'HIGH'   },
    { lat: 56,  lng: -3,   label: 'Scotland',                  severity: 'MEDIUM' },
    { lat: 60,  lng: 30,   label: 'Russia (NW)',               severity: 'MEDIUM' }
  ],
  CME: [
    { lat: 45,  lng: -93,  label: 'North America Grid',        severity: 'MEDIUM' },
    { lat: 55,  lng: 37,   label: 'Moscow / Eastern Europe',   severity: 'MEDIUM' },
    { lat: 35,  lng: 139,  label: 'Japan (Satellite Zone)',    severity: 'LOW'    }
  ]
};

const SEVERITY_COLORS = { HIGH: '#EF4444', MEDIUM: '#F59E0B', LOW: '#10B981' };

function initMap() {
  const container = document.getElementById('map');
  if (!container || !window.L || leafletMap) return;

  leafletMap = L.map('map', {
    center: [20, 0],
    zoom: 2,
    zoomControl: true,
    scrollWheelZoom: false
  });

  // Dark tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap © CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(leafletMap);
}

function updateMap(alerts) {
  if (!leafletMap) return;

  // Clear old markers
  mapMarkers.forEach(m => m.remove());
  mapMarkers.length = 0;

  const activeTypes = new Set((alerts || []).map(a => a.type));

  // Add impact markers based on active alert types
  activeTypes.forEach(type => {
    const regions = REGION_IMPACTS[type] || [];
    regions.forEach(r => {
      const color = SEVERITY_COLORS[r.severity] || '#9CA3AF';

      // Pulsing circle
      const circle = L.circleMarker([r.lat, r.lng], {
        radius: r.severity === 'HIGH' ? 14 : 10,
        fillColor: color,
        color: color,
        weight: 1.5,
        opacity: 0.8,
        fillOpacity: 0.15
      }).addTo(leafletMap);

      circle.bindPopup(`
        <div style="background:#0B0E17;color:#F3F4F6;padding:10px;border-radius:6px;font-family:Outfit,sans-serif;border:1px solid rgba(255,255,255,0.05)">
          <strong style="color:${color}">${r.label}</strong><br>
          <span style="color:#9CA3AF;font-size:11px">Event: ${type.replace('_',' ')}</span><br>
          <span style="color:${color};font-weight:600;font-size:11px">${r.severity} RISK</span>
        </div>
      `, { className: 'dark-popup' });

      mapMarkers.push(circle);
    });
  });

  // Aurora visibility ring
  if (activeTypes.has('GEO_STORM') || activeTypes.has('SOLAR_FLARE')) {
    const auroraColor = '#3b82f6';
    const aurora = L.circle([90, 0], {
      radius: 3500000,
      fillColor: auroraColor,
      color: auroraColor,
      weight: 1,
      opacity: 0.4,
      fillOpacity: 0.04
    }).addTo(leafletMap);
    aurora.bindPopup(`<div style="background:#0B0E17;color:#3b82f6;padding:8px;border-radius:6px;font-size:12px;font-family:Outfit,sans-serif">🌌 Aurora Borealis Zone</div>`);
    mapMarkers.push(aurora);

    const aurora2 = L.circle([-90, 0], {
      radius: 3500000,
      fillColor: auroraColor,
      color: auroraColor,
      weight: 1,
      opacity: 0.4,
      fillOpacity: 0.04
    }).addTo(leafletMap);
    mapMarkers.push(aurora2);
  }

  // Update legend
  const legend = document.getElementById('map-legend');
  if (legend) {
    legend.innerHTML = `
      <div class="legend-item"><div class="legend-dot" style="background:#EF4444"></div> High Risk Region</div>
      <div class="legend-item"><div class="legend-dot" style="background:#F59E0B"></div> Medium Risk Region</div>
      <div class="legend-item"><div class="legend-dot" style="background:#10B981"></div> Low Risk Region</div>
      <div class="legend-item"><div class="legend-dot" style="background:#3b82f6"></div> Aurora Visibility Zone</div>
      <div class="legend-item" style="margin-left:auto;color:#9CA3AF;font-size:11px">${mapMarkers.length} active impact zones</div>
    `;
  }
}
