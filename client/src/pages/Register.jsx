import { useState } from "react";
import { Link } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

import { auth } from "../lib/firebase";

import axios from "axios";
import BorderGlow from "../component/BorderGlow";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // 1. Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = userCredential.user; // ← This line is correct

      await updateProfile(firebaseUser, {
      displayName: username
    });
      const response = await axios.post(
        "http://localhost:5050/api/user/register",
        {
          username,
          email,
          uid: firebaseUser.uid, // ← correct
        },
      );

      console.log("Backend response:", response.data);
      alert("User registered successfully!");

      // Optional: redirect
      // navigate('/login');
    } catch (err) {
      console.error("Registration error:", err);
      alert(err.response?.data?.error || err.message || "Registration failed");
    }
  };

  return (
    <div className="container">
      <BorderGlow
        edgeSensitivity={40}
        glowColor="240 80 80"
        backgroundColor="#000000"
        borderRadius={28}
        glowRadius={40}
        glowIntensity={1}
        coneSpread={25}
        animated={true}
        colors={["#ffffff", "#ffffff", "#6795ff"]}
        className="pointer-events-auto"
      >
        <div className="inner-form">
          <form onSubmit={handleRegister} className="style-form">
            <div className="title">
              <h1>Register</h1>
            </div>

            <div className="email">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="username">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="password">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="con-password">
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="button-container">
              <button className="signup-btn" onSubmit={handleRegister}>
                Register
              </button>
              <Link to="/login">
                <button className="login-btn">Login</button>
              </Link>
            </div>
          </form>
        </div>
      </BorderGlow>
    </div>
  );
}

export default Register;
