
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const userSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userName: { type: String, required: true, unique: true },
  accountNumber: { type: Number, required: true, unique: true },
  emailAddress: { type: String, required: true, unique: true },
  identityNumber: { type: Number, required: true, unique: true }
});

module.exports = mongoose.model('User', userSchema);
