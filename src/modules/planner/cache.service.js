const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 86400 });

const getCacheKey = (data) => {

  const { source, destination, departDate, returnDate, budgetMin, budgetMax, travelers, interests } = data;
  return `${source}_${destination}_${departDate}_${returnDate}_${budgetMin}_${budgetMax}_${travelers}_${(interests || []).sort().join(',')}`;
};

const getFromCache = (key) => {
  return cache.get(key);
};

const setInCache = (key, data) => {
  cache.set(key, data);
};

module.exports = {
  getCacheKey,
  getFromCache,
  setInCache,
  cache
};
