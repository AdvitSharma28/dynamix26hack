const getRecommendedTransportMode = (trains, flights, budgetTier, tripDays) => {
  const hasTrains = trains && trains.length > 0;
  const hasFlights = flights && flights.length > 0 && flights[0].fareEstimate > 0;

  if (hasFlights && !hasTrains) return 'flight';
  if (hasTrains && !hasFlights) return 'train';
  if (!hasTrains && !hasFlights) return 'none';

  if (budgetTier === 'luxury' || tripDays <= 3) {
    return hasFlights ? 'flight' : 'train';
  }

  return 'train';
};

module.exports = { getRecommendedTransportMode };
