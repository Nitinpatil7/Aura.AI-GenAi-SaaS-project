const rateLimit = require('express-rate-limit');

const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per `window` (here, per 1 minute)
  message: { message: 'Too many AI requests from this IP, please try again after a minute' },
  standardHeaders: true, 
  legacyHeaders: false, 
});

module.exports = { aiRateLimiter };
