const Item = require('../models/Item');
const asyncHandler = require("express-async-handler");

const addItem = asyncHandler(async (req, res) => {
    const { title, description, date, category, firebaseUid, status, firestoreDocId } = req.body;

    if (!title || !description || !date || !category || !firebaseUid) {
      return res.status(400).json({ message: 'All fields are required (title, description, date, category, firebaseUid).' });
    }

    console.log("🔹 Add item request received:", { title, description, date, category, firebaseUid, status, firestoreDocId });

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format.' });
    }

    try {
      const newItem = new Item({
        title,
        description,
        date: parsedDate,
        category,
        firebaseUid,
        status,
        firestoreDocId

      });

      await newItem.save();

      console.log("✅ Item saved to MongoDB:", newItem._id);
      res.status(201).json({
        message: 'Item added successfully',
        item: {
          id: newItem._id,
          title: newItem.title,
          description: newItem.description,
          date: newItem.date,
          category: newItem.category,
          firebaseUid: newItem.firebaseUid,
          status: newItem.status,
          firestoreDocId: newItem.firestoreDocId
        }
      });
    } catch (error) {
      console.error('Error saving Item:', error);
      if (error.code === 11000) {
        return res.status(409).json({
          message: 'Invalid Title.'
        });
      }
      throw error; // Let express error handler deal with all other errors
    }
});


//get items by firestoreDocId
const getbyTitle = asyncHandler(async (req, res) => {
  const { title } = req.body;

  let items = await Item.find({ title: title });

  if (items.length === 0) {
    return res.status(404).json({ message: 'No items found with the given title.' });
  }

  if (!title) {
    return res.status(400).json({ message: 'Title is required.' });
  }

  res.status(200).json({
    message: "Items retrieved successfully",
    items: items.map(item => ({
      title: item.title,
      firestoreDocId: item.firestoreDocId,
      firebaseUid: item.firebaseUid,
      description: item.description,
      date: item.date,
      category: item.category,
      status: item.status,
      id: item._id
      
  })) });

});

// update item by firestoreDocId
const updateDocument = asyncHandler(async (req, res) => {
const {documentID, title, category} = req.body;

  console.log("Incoming:", req.body);

  if (!documentID) {
    return res.status(400).json({ message: "documentID is required" });
  }

  try {
    const updatedItem = await Item.findByIdAndUpdate(
      documentID, // ✅ correct ID
      { title, category }, // ✅ direct fields
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    console.log("✅ Updated:", updatedItem._id);

    res.json(updatedItem); // ✅ SEND RESPONSE

  } catch (error) {
    console.error("❌ Update error:", error);
    res.status(500).json({ message: error.message });
  }
});

const getItembyID = asyncHandler(async (req, res) => {
  const { dbid } = req.body;

  let items = await Item.find({ _id: dbid });

  if (items.length === 0) {
    return res.status(404).json({ message: 'No items found with the given ID.' });
  }

  if (!dbid) {
    return res.status(400).json({ message: 'ID is required.' });
  }

  res.status(200).json({
    message: "Items retrieved successfully",
    items: items.map(item => ({
      title: item.title,
      
      status: item.status,
      
      
  })) });


  

});

const updateStatus = asyncHandler(async (req, res) => {
const {dbid, status} = req.body;

  console.log("Incoming:", req.body);

  if (!dbid) {
    return res.status(400).json({ message: "dbid is required" });
  }

  try {
    const updatedItem = await Item.findByIdAndUpdate(
      dbid, // ✅ correct ID
      { status }, // ✅ direct fields
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    console.log("✅ Updated:", updatedItem._id);

    res.json(updatedItem); // ✅ SEND RESPONSE

  } catch (error) {
    console.error("❌ Update error:", error);
    res.status(500).json({ message: error.message });
  }
});



module.exports = {
    addItem, getbyTitle, updateDocument, getItembyID, updateStatus
};
