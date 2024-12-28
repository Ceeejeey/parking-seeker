const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const keeperSchema = new Schema({
  KID: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  nic: {type: String, required: true, unique: true},
  tpno: {type: String, required: true, unique: true},
  address: {type: String, required: true, unique: true},
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const keeper = mongoose.model('Keeper', keeperSchema);
module.exports = keeper;
