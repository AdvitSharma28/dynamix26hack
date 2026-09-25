const OPENTRIPMAP_API_KEY = process.env.OPENTRIPMAP_API_KEY;

const getCityCoordinates = async (cityName) => {
  if (!OPENTRIPMAP_API_KEY) return null;
  try {
    const res = await fetch(`https://api.opentripmap.com/0.1/en/places/geoname?name=${encodeURIComponent(cityName)}&apikey=${OPENTRIPMAP_API_KEY}`);
    const data = await res.json();
    if (data && data.lat && data.lon) return { lat: data.lat, lon: data.lon };
    return null;
  } catch (e) {
    console.error('Failed to fetch city coords from OpenTripMap', e);
    return null;
  }
};

const getAttractions = async (cityName) => {
  if (!OPENTRIPMAP_API_KEY) {
      console.warn('OpenTripMap API key not set. Returning empty attractions.');
      return [];
  }
  const coords = await getCityCoordinates(cityName);
  if (!coords) return [];

  try {
    const res = await fetch(`https://api.opentripmap.com/0.1/en/places/radius?radius=15000&lon=${coords.lon}&lat=${coords.lat}&kinds=interesting_places&rate=3&limit=10&format=json&apikey=${OPENTRIPMAP_API_KEY}`);
    const data = await res.json();
    return data.map(item => ({
      name: item.name,
      type: item.kinds.split(',')[0].replace(/_/g, ' '),
      cost: 'Variable',
      distance: `${(item.dist / 1000).toFixed(1)} km`
    }));
  } catch (e) {
    console.error('Failed to fetch attractions', e);
    return [];
  }
};

module.exports = { getAttractions };
