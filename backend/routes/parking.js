const express = require('express');
const router = express.Router();
const Parking = require('../models/Parking'); // Import the Parking model
const Booking = require('../models/Booking'); // Import the Booking model
const ParkingLog = require('../models/parkingLog'); // Import the ParkingLog model

// POST route to park a vehicle
router.post('/park', async (req, res) => {
  try {
    const { _id, username, vehicleType, startTime, price, duration } = req.body;

    // Validate request data
    if (!username || !vehicleType || !startTime || !_id) {
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
// GET request to fetch all parking details
router.get('/park', async (req, res) => {
  try {
    // Fetch all parking records from the database
    const parkingDetails = await Parking.find();

    // If no parking details are found, return an empty array
    if (!parkingDetails || parkingDetails.length === 0) {
      return res.status(200).json([]); // Respond with an empty array
    }

    // Respond with the parking details
    res.status(200).json(parkingDetails);
  } catch (error) {
    console.error('Error fetching parking details:', error);
    res.status(500).json({ message: 'Failed to fetch parking details.', error: error.message });
  }
});

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
        const activeParking = await Parking.findOne({ username: sanitizedUsername });
  
        // Log details if activeParking is null
        if (!activeParking) {
          console.warn('No active booking found for username:', sanitizedUsername);
          // Return an empty array if no active booking is found
          return res.status(200).json([]);
        }
  
        // Respond with the active booking
        res.status(200).json(activeParking);
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
  //route for post parking records
  router.post('/archive', async (req, res) => {
    try {
      const { username, vehicleType, startTime, stopTime, duration, price } = req.body;
  
      // Validate required fields
      if (!username || !vehicleType || !startTime || !stopTime || !duration || !price) {
        return res.status(400).json({ message: 'All fields are required.' });
      }
  
      // Create and save the parking log
      const parkingLog = new ParkingLog({
        username,
        vehicleType,
        startTime,
        stopTime,
        duration,
        price,
      });
  
      await parkingLog.save();
      res.status(201).json({ message: 'Parking log saved successfully.', parkingLog });
    } catch (error) {
      console.error('Error saving parking log:', error);
      res.status(500).json({ message: 'An error occurred while saving the parking log.' });
    }
  });
  
  // Fetch all parking logs
  router.get('/logs', async (req, res) => {
    try {
      const logs = await ParkingLog.find().sort({ createdAt: -1 }); // Fetch logs in descending order of creation
      res.status(200).json(logs);
    } catch (error) {
      console.error('Error fetching parking logs:', error);
      res.status(500).json({ message: 'An error occurred while fetching the parking logs.' });
    }
  });
  // DELETE /api/parking/park/:id
router.delete('/park/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Find and delete the record by ID
    const deletedRecord = await Parking.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res.status(404).json({ message: 'Parking record not found.' });
    }

    res.status(200).json({ message: 'Parking record deleted successfully.' });
  } catch (error) {
    console.error('Error deleting parking record:', error);
    res.status(500).json({ message: 'Failed to delete parking record.', error: error.message });
  }
});
router.get('/all', async (req, res) => {
  try {
    const parkingSpaces = await ParkingSpace.find({});
    res.json(parkingSpaces);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.put('/park/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { stopTime, duration, price } = req.body;

    console.log('Request Params:', id);
    console.log('Request Body:', { stopTime, duration, price });

    const updatedRecord = await Parking.findByIdAndUpdate(
      id,
      { stopTime, duration, price },
      { new: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({ error: 'Parking record not found.' });
    }

    res.status(200).json(updatedRecord);
  } catch (err) {
    console.error('Error updating parking record:', err);
    res.status(500).json({ error: 'Failed to update parking record.' });
  }
});

module.exports = router;

