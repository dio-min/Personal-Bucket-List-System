const Complete = require("../models/complete");
const asyncHandler = require("express-async-handler");



const addComplete = asyncHandler(async (req, res) => {
  const { title, description, date, itemID, rating } = req.body;

  console.log("📥 Received Body:", req.body);     // ← Add this
  console.log("📸 Received File:", req.file);     // ← Add this

  const missing = [];
  if (!title) missing.push("title");
  if (!description) missing.push("description");
  if (!date) missing.push("date");
  if (!itemID) missing.push("itemID");
  if (rating === undefined || rating === null) missing.push("rating");

  if (missing.length > 0) {
    return res.status(400).json({
      message: "Missing fields",
      missingFields: missing,
      received: { title, description, date, itemID, rating }
    });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Image file is required" });
  }

  const imageUrl = req.file.path;
  const parsedDate = new Date(date);

  if (isNaN(parsedDate.getTime())) {
    return res.status(400).json({ message: "Invalid date format." });
  }

  try {
    const newComplete = new Complete({
      title,
      description,
      date: parsedDate,
      imageUrl,
      itemID,
      rating: Number(rating),        // Ensure it's a number
    });

    await newComplete.save();

    return res.status(201).json({
      message: "Complete added successfully",
      complete: newComplete,
    });
  } catch (error) {
    console.error("❌ Error saving Complete:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = {
  addComplete,
};