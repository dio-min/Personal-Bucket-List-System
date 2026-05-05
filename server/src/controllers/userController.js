const User = require('../models/User');
const asyncHandler = require("express-async-handler");

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, uid, profilePicture } = req.body;   // uid from Firebase

  console.log("🔹 Registration request received:", { username, email, hasUid: !!uid });

  // Validation
  if (!username || !email) {
    return res.status(400).json({ error: 'Username and email are required' });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ 
    $or: [{ email }, { username }] 
  });

  if (existingUser) {
    return res.status(400).json({ error: 'Username or email already exists' });
  }

  // Create user in MongoDB (NO password, since Firebase handles auth)
  const newUser = new User({
    username,
    email,
    firebaseUid: uid || null,   // Link to Firebase user
    profilePicture: profilePicture || null   // Use provided profile picture or default
  });

  await newUser.save();

  console.log("✅ User saved to MongoDB:", newUser._id);

  res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      profilePicture: newUser.profilePicture
    }
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { uid, email } = req.body;

  // Optional: Find user in MongoDB
  let user = await User.findOne({ firebaseUid: uid });

  if (!user) {
    // First time login after register → create profile if needed
    user = new User({
      username: email.split('@')[0], // temporary username
      email,
      firebaseUid: uid
    });
    await user.save();
  }

  res.status(200).json({
    message: "Login successful",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      firebaseUid: user.firebaseUid
    }
  });
});


const getUserProfile = asyncHandler(async (req, res) => {
  const { uid } = req.body;
  const user = await User.findOne({ firebaseUid: uid });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.status(200).json({
    user: {
      profilePicture: user.profilePicture
    }
  });
});


const updateUserProfile = asyncHandler(async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ error: 'User UID is required' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Avatar file is required' });
  }

  const imageUrl = req.file.path || req.file.secure_url || null;

  if (!imageUrl) {
    return res.status(500).json({ error: 'Failed to determine avatar URL' });
  }

  const user = await User.findOneAndUpdate(
    { firebaseUid: uid },
    { profilePicture: imageUrl },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.status(200).json({
    message: 'Avatar uploaded successfully',
    profilePicture: user.profilePicture,
  });
});



module.exports = { loginUser, registerUser, getUserProfile, updateUserProfile };   // or module.exports = registerUser;