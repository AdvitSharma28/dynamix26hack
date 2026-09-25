const groq = require('../../config/groq');

const generateItinerary = async (inputs, seedData) => {
  if (!groq) {
    throw new Error('Groq API is not configured.');
  }

  const { source, destination, departDate, returnDate, budgetMin, budgetMax, travelers, interests } = inputs;
  const { budgetTier, tripDays, trains, flights, hotels, attractions } = seedData;

  const systemPrompt = `
You are a highly precise travel itinerary generator for Indian tourism.
Given the live destination facts, flight options, and hotel options below, produce ONLY valid JSON matching the exact required schema.
For flights, hotels, and attractions, try to use the provided data. If the data is empty, you MUST estimate highly realistic options using your internal knowledge.
CRITICAL: You MUST use your internal knowledge to generate realistic Train and Bus travel options between the source and destination (including carrier names and fare estimates). Check the geographical distance and estimate realistic travel times for trains and buses.
Keep the total estimated cost between ₹${budgetMin} and ₹${budgetMax}, and try to make the daily activity costs align reasonably with the budget breakdown.
Output MUST be raw JSON without any markdown formatting like \`\`\`json.
  `.trim();

  const userPrompt = `
Trip: ${source} → ${destination}
Dates: ${departDate} → ${returnDate} (${tripDays} days)
Travelers: ${travelers}
Budget: ₹${budgetMin}–₹${budgetMax} (tier: ${budgetTier})
Interests: ${(interests || []).join(', ')}

Live flights data: ${JSON.stringify(flights)}
Live hotels data: ${JSON.stringify(hotels)}
Live attractions data: ${JSON.stringify(attractions)}

Generate the itinerary returning a valid JSON object with the following schema:
{
  "tripId": "random-uuid-or-string",
  "durationDays": number,
  "budgetTier": string,
  "totalEstimatedCost": number,
  "transport": {
    "train": { "options": [{ "trainName": string, "duration": string, "fareEstimate": number, "class": string }] },
    "bus": { "options": [{ "operatorName": string, "busType": string, "duration": string, "fareEstimate": number }] },
    "flight": { "options": [{ "airline": string, "flightNo": string, "duration": string, "fareEstimate": number }] },
    "recommendedMode": "train" | "flight" | "bus"
  },
  "stay": { "hotelSuggestions": [{ "name": string, "pricePerNight": number, "rating": number }] },
  "dailyPlan": [
    {
      "day": number,
      "date": "YYYY-MM-DD",
      "morning": { "activity": string, "cost": number },
      "afternoon": { "activity": string, "cost": number },
      "evening": { "activity": string, "cost": number }
    }
  ],
  "foodRecommendations": [string],
  "budgetBreakdown": { "transport": number, "stay": number, "food": number, "activities": number }
}
  `.trim();

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const text = response.choices[0]?.message?.content;
    const parsedJson = JSON.parse(text);
    return parsedJson;
  } catch (error) {
    console.error('Groq generation failed:', error);
    throw new Error('Failed to generate itinerary with AI');
  }
};

module.exports = { generateItinerary };
