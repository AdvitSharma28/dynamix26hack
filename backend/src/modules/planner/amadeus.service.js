const Amadeus = require('amadeus');

let amadeus;
if (process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET) {
  amadeus = new Amadeus({
    clientId: process.env.AMADEUS_CLIENT_ID,
    clientSecret: process.env.AMADEUS_CLIENT_SECRET
  });
} else {
  console.warn('Amadeus API keys not set. Flight & Hotel searches will return empty.');
}

const searchFlights = async (source, destination, departDate) => {
  if (!amadeus) return [];
  try {
    const originCity = await amadeus.referenceData.locations.get({
      keyword: source,
      subType: Amadeus.location.any
    });
    const destCity = await amadeus.referenceData.locations.get({
      keyword: destination,
      subType: Amadeus.location.any
    });

    if (!originCity.data.length || !destCity.data.length) return [];

    const originCode = originCity.data[0].iataCode;
    const destCode = destCity.data[0].iataCode;

    const response = await amadeus.shopping.flightOffersSearch.get({
        originLocationCode: originCode,
        destinationLocationCode: destCode,
        departureDate: departDate,
        adults: '2',
        max: 3
    });

    return response.data.map(flight => {
        const itinerary = flight.itineraries[0];
        const segment = itinerary.segments[0];
        return {
            airline: segment.carrierCode,
            flightNo: segment.number,
            duration: itinerary.duration,
            fareEstimate: parseFloat(flight.price.total)
        };
    });
  } catch (error) {
    console.error('Amadeus Flight Error:', error.message || error);
    return [];
  }
};

const searchHotels = async (destination) => {
  if (!amadeus) return [];
  try {
    const destCity = await amadeus.referenceData.locations.get({
      keyword: destination,
      subType: Amadeus.location.any
    });

    if (!destCity.data.length) return [];
    const destCode = destCity.data[0].iataCode;

    const response = await amadeus.referenceData.locations.hotels.byCity.get({
      cityCode: destCode,
      radius: 5,
      radiusUnit: 'KM'
    });

    return response.data.slice(0, 5).map(hotel => ({
      name: hotel.name,
      tier: "variable",
      pricePerNight: "Ask AI to estimate based on budget",
      rating: "Variable"
    }));
  } catch (error) {
    console.error('Amadeus Hotel Error:', error.message || error);
    return [];
  }
}

module.exports = { searchFlights, searchHotels };
