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
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  duration: {
    type: Number,
    required: true, // Duration in minutes
    min: 1,
  },
  endTime: {
    type: Date,
    default: function () {
      return new Date(this.startTime.getTime() + this.duration * 60000); // Calculate end time
    },
  },
});

module.exports = mongoose.model('Parking', ParkingSchema);
