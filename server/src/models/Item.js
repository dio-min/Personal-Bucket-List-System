const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  firebaseUid: {
    type: String,
    required: [true, 'Firebase UID is required']
  },

  //Dagdag lang pwedeng idelete kung di gumana
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress'
  },
  firestoreDocId: {
    type: String,
    required: [true, 'Firestore Document ID is required']}
    
  

 


  //dito mag eend delete mo kapag
}, { timestamps: true });

// Ensure firebaseUid is indexed for query performance, but not unique (one user can have many items)
itemSchema.index({ firebaseUid: 1 });

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;