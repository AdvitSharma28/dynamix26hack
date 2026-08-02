const express = require('express');
const rateLimit = require('express-rate-limit');
const { getPins, createPin, likePin } = require('./pins.controller');

const router = express.Router();

const createLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many pins created. Please wait a minute.' } }
});

const likeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many actions. Please wait a minute.' } }
});

router.get('/', getPins);
router.post('/', createLimiter, createPin);
router.post('/:id/like', likeLimiter, likePin);

module.exports = router;
