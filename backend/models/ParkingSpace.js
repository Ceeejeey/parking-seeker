// models/ParkingSpace.js
const mongoose = require('mongoose');

const parkingSpaceSchema = new mongoose.Schema({
  location: {
    type: { type: String, default: 'Point' },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  address: {
    type: String,
    required: true,
  },
  available: {
    type: Boolean,
    default: true,
  },
  price: {
    type: Number,
    required: true,
  },
  carSpaces: {
    total: { type: Number, required: true }, // Total car spaces available
    remaining: { type: Number, required: true }, // Car spaces remaining
  },
  bikeSpaces: {
    total: { type: Number, required: true }, // Total bike spaces available
    remaining: { type: Number, required: true }, // Bike spaces remaining
  },
});

parkingSpaceSchema.index({ location: '2dsphere' }); // Geospatial index

const ParkingSpace = mongoose.model('ParkingSpace', parkingSpaceSchema);

module.exports = ParkingSpace;
