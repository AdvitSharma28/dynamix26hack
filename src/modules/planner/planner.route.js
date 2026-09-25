const express = require('express');
const { generatePlan } = require('./planner.controller');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const planLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests. Please try again in a minute.' } }
});

router.post('/', planLimiter, generatePlan);
router.post('/regenerate', planLimiter, generatePlan);

module.exports = router;
