const express = require('express');
const router = express.Router();
const ParkingSpace = require('../models/ParkingSpace');

// GET all parking spaces
router.get('/all', async (req, res) => {
  try {
    const parkingSpaces = await ParkingSpace.find({});
    res.json(parkingSpaces);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET available parking spaces
router.get('/available', async (req, res) => {
  try {
    const availableSpaces = await ParkingSpace.find({ available: true });
    res.json(availableSpaces);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new parking space
router.post('/add', async (req, res) => {
  const { location, address, available, price } = req.body;
  try {
    const newSpace = new ParkingSpace({
      location,
      address,
      available,
      price,
    });
    await newSpace.save();
    res.status(201).json({ message: 'Parking space added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update parking space availability
router.put('/:id/availability', async (req, res) => {
  try {
    const parkingSpace = await ParkingSpace.findById(req.params.id);
    if (!parkingSpace) {
      return res.status(404).json({ message: 'Parking space not found' });
    }

    parkingSpace.available = req.body.available;
    await parkingSpace.save();
    res.json({ message: 'Parking space availability updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST to book a parking space and update remaining counts
router.post('/book', async (req, res) => {
  const { parkingSpaceId, type } = req.body; // type: 'car' or 'bike'

  try {
    const parkingSpace = await ParkingSpace.findById(parkingSpaceId);

    if (!parkingSpace) {
      return res.status(404).json({ message: 'Parking space not found' });
    }

    if (type === 'car') {
      if (parkingSpace.carSpaces.remaining > 0) {
        parkingSpace.carSpaces.remaining -= 1;
      } else {
        return res.status(400).json({ message: 'No available car spaces' });
      }
    } else if (type === 'bike') {
      if (parkingSpace.bikeSpaces.remaining > 0) {
        parkingSpace.bikeSpaces.remaining -= 1;
      } else {
        return res.status(400).json({ message: 'No available bike spaces' });
      }
    }

    await parkingSpace.save();
    res.json({ message: 'Booking successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// In-memory storage for real-time availability status
let currentAvailability = {
  Car: [
    { coordinates: [81.213795, 8.6546], available: true },
    { coordinates: [81.213795, 8.6546], available: true }
  ],
  Motorcycle: [
    { coordinates: [81.213795, 8.6546], available: true },
    { coordinates: [81.213795, 8.6546], available: true }
  ]
};

// POST to check remaining spaces for availability and update in-memory data
router.post('/check-availability', async (req, res) => {
  const { remain } = req.body;

  try {
    // Update availability status based on remain values
    currentAvailability.Car = currentAvailability.Car.map(location => ({
      ...location,
      available: remain.cars > 0
    }));

    currentAvailability.Motorcycle = currentAvailability.Motorcycle.map(location => ({
      ...location,
      available: remain.bikes > 0
    }));

    const availabilityStatus = {
      carsAvailable: remain.cars > 0,
      bikesAvailable: remain.bikes > 0
    };

    res.json(availabilityStatus);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET route to provide updated parking availability for the map markers
router.get('/parking-availability', (req, res) => {
  res.json(currentAvailability);
});

module.exports = router;
