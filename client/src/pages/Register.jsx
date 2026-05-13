import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../lib/firebase";
import axios from "axios";
import BorderGlow from "../component/BorderGlow";
import API_BASE_URL from "../lib/config";

const firebaseErrors = {
  "auth/email-already-in-use": "Email is already registered.",
  "auth/invalid-email": "Invalid email format.",
  "auth/weak-password": "Password is too weak.",
  "auth/network-request-failed": "Network error, please try again.",
};

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // TC-07: Minimum password length
    if (password.length < 8) {
      alert("Minimum of 8 characters.");
      setLoading(false);
      return;
    }

    // TC-04: Password must contain at least one number
    if (!/[0-9]/.test(password)) {
      alert("Password must contain at least one number.");
      setLoading(false);
      return;
    }

    // TC-06: Password confirmation mismatch
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      setLoading(false);
      return;
    }

    // TC-08: Maximum username length
    if (username.length > 30) {
      alert("Username must not exceed 30 characters.");
      setLoading(false);
      return;
    }

    // TC-09: Special characters in username (letters, numbers, underscores only)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      alert("Username can only contain letters, numbers, and underscores.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName: username });

      const response = await axios.post(`${API_BASE_URL}/api/user/register`, {
        username,
        email: email.toLowerCase(), // TC-13: normalize email to lowercase
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
      // TC-11: setLoading(false) on error so button is re-enabled
      setLoading(false);
      console.error("Registration error:", err);
      // TC-03 / TC-05: friendly Firebase error messages
      alert(firebaseErrors[err.code] || err.response?.data?.error || err.message || "Registration failed.");
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-sm";

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-80 animate-float">
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
              maxLength={254}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              maxLength={30}
              className={inputClass}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              maxLength={64}
              className={inputClass}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              maxLength={64}
              className={inputClass}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-[#96bb7b] hover:bg-[#86ab6f] active:bg-[#789e63] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors duration-200"
            >
              {loading ? "Registering..." : "Register"}
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