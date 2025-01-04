const express = require('express');
const router = express.Router();
const Parking = require('../models/Parking'); // Import the Parking model
const Booking = require('../models/Booking'); // Import the Booking model

// POST route to park a vehicle
router.post('/park', async (req, res) => {
  try {
    const { _id, username, vehicleType, startTime, price, duration } = req.body;

    // Validate request data
    if (!username || !vehicleType || !startTime || !price || !duration || !_id) {
      return res.status(400).json({ message: 'All fields are required, including _id.' });
    }

    // Check if the booking exists in the database
    const existingBooking = await Booking.findById(_id);
    if (!existingBooking) {
      return res.status(404).json({ message: 'No active booking found. Parking record cannot be created without a valid booking.' });
    }

    // Create a new parking record
    const newParking = new Parking({
      username,
      vehicleType,
      startTime: new Date(startTime), // Ensure the start time is stored as a Date object
      price,
      duration,
    });

    // Save the parking record to the database
    const savedParking = await newParking.save();

    // Delete the booking from the database
    const deletedBooking = await Booking.findByIdAndDelete(_id);

    res.status(201).json({
      message: 'Parking record created successfully and booking deleted.',
      parking: savedParking,
      deletedBooking,
    });
  } catch (error) {
    console.error('Error processing parking:', error);
    res.status(500).json({ message: 'Failed to process parking request.', error });
  }
});


module.exports = router;
