const express = require('express');
const cors = require('cors');
const path = require('path');
const { errorHandler } = require('./shared/middlewares/error.middleware');
const { formatResponse } = require('./shared/middlewares/response.middleware');
const plannerRoutes = require('./modules/planner/planner.route');
const pinsRoutes = require('./modules/pins/pins.route');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static(path.join(__dirname, '../../frontend'), { index: false }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

app.get('/travel', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/travel.html'));
});

app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/game.html'));
});

app.get('/museum', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

app.get('/map', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/map.html'));
});

app.get('/connect', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/map.html'));
});

app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/gallery.html'));
});

app.use(formatResponse);

app.use('/api/plan', plannerRoutes);
app.use('/api', plannerRoutes);
app.use('/api/pins', pinsRoutes);

app.get('/api/geocode/forward', async (req, res, next) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ success: false, error: 'Query parameter q is required.' });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=in&limit=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BharatOdysseyTravelPlanner/1.0 (contact@bharatodyssey.in)',
        'Accept': 'application/json'
      }
    });
    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('json')) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return res.json(data);
        }
      }
    }
  } catch (err) {
    console.warn("Nominatim proxy forward failed, attempting Photon fallback:", err.message);
  }

  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=1`;
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.features && data.features.length > 0) {
      const feat = data.features[0];
      const lng = feat.geometry.coordinates[0];
      const lat = feat.geometry.coordinates[1];
      const props = feat.properties;

      const display_parts = [props.name, props.city, props.state, props.country].filter(Boolean);
      const display_name = display_parts.join(', ');

      const nominatimFormat = [{
        lat: String(lat),
        lon: String(lng),
        display_name: display_name
      }];
      return res.json(nominatimFormat);
    }
    return res.json([]);
  } catch (err) {
    console.error("Photon fallback forward failed:", err);
    return res.status(500).json({ success: false, error: 'Failed to look up address coordinates.' });
  }
});

app.get('/api/geocode/reverse', async (req, res, next) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ success: false, error: 'Parameters lat and lng are required.' });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=12`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BharatOdysseyTravelPlanner/1.0 (contact@bharatodyssey.in)',
        'Accept': 'application/json'
      }
    });
    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('json')) {
        const data = await response.json();
        return res.json(data);
      }
    }
  } catch (err) {
    console.warn("Nominatim proxy reverse failed, attempting Photon fallback:", err.message);
  }

  try {
    const url = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.features && data.features.length > 0) {
      const feat = data.features[0];
      const props = feat.properties;
      const display_parts = [props.name, props.locality || props.district, props.city || props.town, props.state, props.country].filter(Boolean);
      const display_name = display_parts.join(', ');

      const nominatimFormat = {
        display_name: display_name,
        address: {
          city: props.city || props.town || props.village || props.locality,
          state: props.state,
          country: props.country
        }
      };
      return res.json(nominatimFormat);
    }
    return res.json({});
  } catch (err) {
    console.error("Photon fallback reverse failed:", err);
    return res.status(500).json({ success: false, error: 'Failed to look up location details.' });
  }
});

app.use(errorHandler);

module.exports = app;
