// routes/keepers.js
const express = require('express');
const router = express.Router();
const Keeper = require('../models/keeper'); // Assuming your keeper model

router.get('/availability', async (req, res) => {
  try {
    const keeperData = await Keeper.find(); // Modify based on your data structure
    res.json(keeperData); // Send back the keeper data as JSON
  } catch (error) {
    res.status(500).json({ error: 'Error fetching availability data' });
  }
});

module.exports = router;
