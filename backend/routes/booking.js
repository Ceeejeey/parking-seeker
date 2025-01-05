const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// POST route to save booking details
router.post('/booking', async (req, res) => {
    
  try {
    const { username, vehicleType } = req.body;

    // Validate the input
    if (!username || !vehicleType ) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Create a new booking
    const booking = new Booking({
      username,
      vehicleType,
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
  // GET route to fetch booking details by username
  router.get('/details', async (req, res) => {
    try {
      const { username } = req.query;
  
      // Log the initial value of username from the request
      console.log('Initial Username from Query:', username);
  
      // Validate the username parameter
      if (!username) {
        console.error('Error: Username is missing in the query.');
        return res.status(400).json({ message: 'Username is required.' });
      }
  
      // Sanitize and log the sanitized username
      const sanitizedUsername = String(username).trim();
      console.log('Sanitized Username:', sanitizedUsername);
  
      try {
        // Log the start of the query
        console.log('Querying database for username:', sanitizedUsername);
  
        // Fetch the booking record from the database
        const activeBooking = await Booking.findOne({ username: sanitizedUsername });
  
        // Log details if activeBooking is null
        if (!activeBooking) {
          console.warn('No active booking found for username:', sanitizedUsername);
          // Return an empty array if no active booking is found
          return res.status(200).json([]);
        }
  
        // Respond with the active booking
        res.status(200).json(activeBooking);
      } catch (dbError) {
        console.error('MongoDB Query Error:', dbError.message);
        res.status(500).json({ message: 'Database query failed.', error: dbError.message });
      }
    } catch (error) {
      // Log any other unexpected error
      console.error('Error fetching booking details:', error);
      res.status(500).json({ message: 'Failed to fetch booking details.', error: error.message });
    }
  });
  
  
  
  

// DELETE route to cancel a booking
router.delete('/booking/:id', async (req, res) => {
    try {
      const { id } = req.params;
  
      // Delete the booking by ID
      const deletedBooking = await Booking.findByIdAndDelete(id);
  
      if (!deletedBooking) {
        return res.status(200).json([]);
      }
  
      res.status(200).json({ message: 'Booking canceled successfully.', deletedBooking });
    } catch (error) {
      console.error('Error canceling booking:', error);
      res.status(500).json({ message: 'An error occurred while canceling the booking.' });
    }
  });
  
module.exports = router;
