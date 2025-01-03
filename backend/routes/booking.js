const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// POST route to save booking details
router.post('/booking', async (req, res) => {
    
  try {
    const { username, vehicleType, duration, price } = req.body;

    // Validate the input
    if (!username || !vehicleType || !duration || !price) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Create a new booking
    const booking = new Booking({
      username,
      vehicleType,
      duration,
      price,
    });

    // Save the booking to the database
    await booking.save();
    res.status(201).json({ message: 'Booking saved successfully', booking });
  } catch (error) {
    console.error('Error saving booking:', error);
    res.status(500).json({ message: 'An error occurred while saving the booking' });
  }
});
//route for get booking details
router.get('/booking', async (req, res) => {
    try {
      const bookings = await Booking.find(); // Fetch all bookings
      res.status(200).json(bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({ message: 'An error occurred while fetching bookings.' });
    }
  });

  //Fetch active booking details for a user
  router.get('/details', async (req, res) => {
    const { username } = req.query;
  
    if (!username) {
      return res.status(400).json({ error: 'Username is required to fetch booking details.' });
    }
  
    try {
      // Find active booking for the user
      const activeBooking = await Booking.findOne({ username, isActive: true });
  
      if (!activeBooking) {
        return res.status(404).json({ message: 'No active bookings found for this user.' });
      }
  
      // Return the booking details
      res.status(200).json(activeBooking);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      res.status(500).json({ error: 'An error occurred while fetching booking details.' });
    }
  });
  

// DELETE route to cancel a booking
router.delete('/booking/:id', async (req, res) => {
    try {
      const { id } = req.params;
  
      // Delete the booking by ID
      const deletedBooking = await Booking.findByIdAndDelete(id);
  
      if (!deletedBooking) {
        return res.status(404).json({ message: 'Booking not found.' });
      }
  
      res.status(200).json({ message: 'Booking canceled successfully.', deletedBooking });
    } catch (error) {
      console.error('Error canceling booking:', error);
      res.status(500).json({ message: 'An error occurred while canceling the booking.' });
    }
  });
  
module.exports = router;
