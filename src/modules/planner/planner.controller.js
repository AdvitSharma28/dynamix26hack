const { z } = require('zod');
const { getBudgetTier } = require('./budget.service');
const { getRecommendedTransportMode } = require('./transport.service');
const { getCacheKey, getFromCache, setInCache } = require('./cache.service');
const { generateItinerary } = require('./groq.service');
const { searchFlights, searchHotels } = require('./amadeus.service');
const { getAttractions } = require('./places.service');

const planSchema = z.object({
  source: z.string().min(2),
  destination: z.string().min(2),
  departDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD"),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format. Use YYYY-MM-DD"),
  budgetMin: z.number().min(0),
  budgetMax: z.number().min(0),
  travelers: z.number().min(1),
  interests: z.array(z.string()).optional(),
  preferredTransport: z.enum(["flight", "train", "bus", "any"]).optional().default("any")
});

const generatePlan = async (req, res, next) => {
  try {
    const validatedData = planSchema.parse(req.body);
    const { source, destination, departDate, returnDate, budgetMin, budgetMax, travelers, interests, preferredTransport } = validatedData;

    if (source.toLowerCase() === destination.toLowerCase()) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Source and destination cannot be the same.' } });
    }

    if (budgetMin > budgetMax) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'budgetMin cannot be greater than budgetMax.' } });
    }

    if (new Date(returnDate) <= new Date(departDate)) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Return date must be after depart date.' } });
    }

    const tripDays = Math.ceil((new Date(returnDate) - new Date(departDate)) / (1000 * 60 * 60 * 24));

    const cacheKey = getCacheKey(validatedData);
    const cachedPlan = getFromCache(cacheKey);
    if (cachedPlan) {
      return res.success(cachedPlan, "Plan retrieved from cache.");
    }

    const budgetTier = getBudgetTier(budgetMin, budgetMax, tripDays);

    const [flights, hotels, attractions] = await Promise.all([
      preferredTransport !== 'train' ? searchFlights(source, destination, departDate) : Promise.resolve([]),
      searchHotels(destination),
      getAttractions(destination)
    ]);

    const trains = [];

    const seedData = { budgetTier, tripDays, trains, flights, hotels, attractions };

    let itinerary;
    try {
      itinerary = await generateItinerary(validatedData, seedData);
    } catch (aiError) {

      console.error("AI Generation failed, attempting fallback.", aiError);
      return res.status(503).json({ success: false, error: { code: 'AI_SERVICE_ERROR', message: 'Failed to generate itinerary. Please try again.' } });
    }

    if (preferredTransport !== 'any') {
      itinerary.transport.recommendedMode = preferredTransport;
    } else {
      itinerary.transport.recommendedMode = getRecommendedTransportMode(trains, flights, budgetTier, tripDays);
    }

    setInCache(cacheKey, itinerary);

    return res.success(itinerary, "Plan generated successfully.");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.issues[0].message } });
    }
    next(error);
  }
};

module.exports = {
  generatePlan
};
