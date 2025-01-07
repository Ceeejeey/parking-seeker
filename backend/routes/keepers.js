// routes/keepers.js
const express = require('express');
const router = express.Router();
const Keeper = require('../models/keeper'); // Assuming your keeper model
const { Availability } = require('../models/Availability');

router.get('/availability', async (req, res) => {
  try {
    const keeperData = await Keeper.find(); // Modify based on your data structure
    res.json(keeperData); // Send back the keeper data as JSON
  } catch (error) {
    res.status(500).json({ error: 'Error fetching availability data' });
  }
});
// PUT /api/availability/update
router.put('/update', async (req, res) => {
  try {
    const { cars, bike } = req.body;

    // Validate input
    if (typeof cars !== 'boolean' || typeof bike !== 'boolean') {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    // Update availability in the database
    const updatedAvailability = await Availability.findOneAndUpdate(
      {}, // Assuming a single document
      { cars, bike },
      { new: true, upsert: true } // Create if not exists
    );

    res.status(200).json(updatedAvailability);
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/update', async (req, res) => {
  try {
    // Fetch availability data from the database
    const availability = await Availability.findOne();
    if (!availability) {
      return res.status(404).json({ message: 'Availability data not found' });
    }

    res.status(200).json(availability);
  } catch (error) {
    console.error('Error fetching availability data:', error);
    res.status(500).json({ message: 'Failed to fetch availability data' });
  }
});
module.exports = router;
