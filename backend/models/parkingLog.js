const mongoose = require('mongoose');

const parkingLogSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  vehicleType: {
    type: String,
    enum: ['car', 'bike'], // Only allow these two types
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  stopTime: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number, // Duration in hours
    required: true,
  },
  price: {
    type: Number, // Total price
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set to the current date
  },
});

module.exports = mongoose.model('ParkingLog', parkingLogSchema);
