const mongoose = require('mongoose');

const ParkingSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['car', 'bike'], // Example vehicle types
  },
  startTime: {
    type: Date,
    required: true,
  },
  stopTime: {
    type: Date, // Store the time when the parking session was stopped
    default: null, // Default to null if not stopped yet
  },
  duration: {
    type: Number, // Duration of the parking session in hours
    default: null, // Default to null if not calculated yet
  },
  price: {
    type: Number, // Total price for the parking session
    default: null, // Default to null if not calculated yet
  },
});

module.exports = mongoose.model('Parking', ParkingSchema);
