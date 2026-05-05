const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true   // allows null/undefined values
  },
  profilePicture: {
    type: String,
   
  }, isDeleted:{
    type: Boolean,
    default: false
  }
}, { timestamps: true });



const User = mongoose.model('User', userSchema);
module.exports = User;