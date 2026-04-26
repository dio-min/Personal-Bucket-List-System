const User = require('../models/User');
const asyncHandler = require("express-async-handler");

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, uid } = req.body;   // uid from Firebase

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
  });

  await newUser.save();

  console.log("✅ User saved to MongoDB:", newUser._id);

  res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email
    }
  });
});

// const loginUser = asyncHandler(async (req, res) => {
//   const { uid, email } = req.body;

//   // Optional: Find user in MongoDB
//   let user = await User.findOne({ firebaseUid: uid });

//   if (!user) {
//     // First time login after register → create profile if needed
//     user = new User({
//       username: email.split('@')[0], // temporary username
//       email,
//       firebaseUid: uid
//     });
//     await user.save();
//   }

//   res.status(200).json({
//     message: "Login successful",
//     user: {
//       id: user._id,
//       username: user.username,
//       email: user.email,
//       firebaseUid: user.firebaseUid
//     }
//   });
// });

const loginUser = asyncHandler(async (req, res) => {
  const { uid, email } = req.body;

  console.log("=== LOGIN REQUEST RECEIVED ===");
  console.log("UID:", uid);
  console.log("Email:", email);

  if (!uid || !email) {
    return res.status(400).json({ message: "UID and email are required" });
  }

  try {
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      console.log("→ Creating NEW user...");
      user = new User({
        username: email.split('@')[0], 
        email,
        firebaseUid: uid
      });

      const savedUser = await user.save();
      console.log("✅ NEW USER SAVED SUCCESSFULLY:", savedUser._id);
    } else {
      console.log("→ Existing user found:", user._id);
      // Update email if it changed
      if (user.email !== email) {
        user.email = email;
        await user.save();
        console.log("✅ User email updated");
      }
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
  } catch (err) {
    console.error("❌ LOGIN / SAVE ERROR:", err.message);
    console.error("Full error:", err);
    res.status(500).json({ 
      message: "Database error during login", 
      error: err.message 
    });
  }
});









module.exports = { loginUser, registerUser };   // or module.exports = registerUser;