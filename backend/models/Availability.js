const mongoose = require('mongoose');

// Schema for availability
const availabilitySchema = new mongoose.Schema({
  cars: { type: Boolean, default: true }, // Availability of car spaces
  bike: { type: Boolean, default: true }, // Availability of bike spaces
});


// Models
const Availability = mongoose.model('Availability', availabilitySchema);


module.exports = { Availability };
