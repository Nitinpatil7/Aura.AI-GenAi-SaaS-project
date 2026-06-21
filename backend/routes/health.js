const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/', async (req, res) => {
  const healthStatus = {
    server: 'up',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  };

  if (healthStatus.database === 'connected') {
    res.status(200).json(healthStatus);
  } else {
    res.status(503).json(healthStatus);
  }
});

module.exports = router;
