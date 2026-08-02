const getBudgetTier = (min, max, days) => {
  const dailyBudget = (min + max) / 2 / days;
  if (dailyBudget < 1500) return "budget";
  if (dailyBudget < 4000) return "mid";
  return "luxury";
};

module.exports = { getBudgetTier };
