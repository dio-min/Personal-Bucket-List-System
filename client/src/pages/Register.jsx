import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../lib/firebase";
import axios from "axios";
import BorderGlow from "../component/BorderGlow";
import API_BASE_URL from "../lib/config";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password.length < 8) {
      alert("Minimum of 8 characters");
      return;
    }
    if (!/[0-9]/.test(password)) {
      alert("Password must contain at least one number.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName: username });

      const response = await axios.post(`${API_BASE_URL}/api/user/register`, {
        username,
        email,
        uid: firebaseUser.uid,
        profilePicture: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
        isdeleted: false,
      });

      setEmail("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");

      console.log("Backend response:", response.data);
      alert("User registered successfully!");
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      alert(err.response?.data?.error || err.message || "Registration failed");
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-sm";

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-80">
        <BorderGlow
          edgeSensitivity={40}
          glowColor="240 80 80"
          backgroundColor="#ffffff"
          borderRadius={28}
          glowRadius={40}
          glowIntensity={1}
          coneSpread={25}
          animated={true}
          colors={["#ffffff", "#ffffff", "#6795ff"]}
          className="pointer-events-auto"
        >
          <form onSubmit={handleRegister} className="flex flex-col gap-3 px-6 py-6">
            <h1 className="text-gray-800 text-lg font-semibold text-center">Register</h1>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={inputClass}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClass}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={inputClass}
            />

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-medium transition"
            >
              Register
            </button>

            <Link to="/login" className="w-full">
              <button
                type="button"
                className="w-full py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 active:bg-gray-100 text-sm transition"
              >
                Login
              </button>
            </Link>
          </form>
        </BorderGlow>
      </div>
    </div>
  );
}

export default Register;