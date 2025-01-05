const mongoose = require('mongoose');

const ParkingSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  vehicleType: {
    type: String,
    required: true,
    enum: ['car', 'motorcycle'], // Example vehicle types
  },
  startTime: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model('Parking', ParkingSchema);
