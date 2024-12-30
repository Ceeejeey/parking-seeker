const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  vehicleType: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Booking', BookingSchema);
