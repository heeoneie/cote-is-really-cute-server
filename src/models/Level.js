const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  level: {
    type: Number,
    required: true,
    unique: true,
  },
  requiredExperience: {
    type: Number,
    required: true,
  },
});

const Level = mongoose.model('Level', levelSchema);

module.exports = Level;
