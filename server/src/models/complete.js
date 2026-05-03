const mongoose = require('mongoose');

const completeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    minlength: [3, 'Goal title must be at least 3 characters long']
  },
  description: {
    type: String,
    },
    date: {
    type: Date,
    },
    imageUrl: {
    type: String,
    },
    itemID:{
    type: String,
    required: [true, 'Item ID is required']
    },
    rating: {
    type: Number,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating cannot exceed 5']
    },
    firebaseUid: {
    type: String,
    required: [true, 'Firebase UID is required']
    },
  }
    , { timestamps: true });

const Complete = mongoose.model('Complete', completeSchema);
module.exports = Complete;