import { useState } from 'react';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase";
import { Link } from 'react-router-dom';
import BorderGlow from "../component/BorderGlow";

function ForgetPassword() {
  const [email, setEmail] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Check your inbox (including spam folder).");
      setEmail("");
    } catch (err) {
      console.error("Reset error:", err);
      if (err.code === 'auth/user-not-found') {
        alert("No account found with this email.");
      } else if (err.code === 'auth/invalid-email') {
        alert("Please enter a valid email address.");
      } else {
        alert("Failed to send reset email. Please try again.");
      }
    }
  };

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
          <form onSubmit={handleReset} className="flex flex-col gap-3 px-6 py-6">
            <h1 className="text-gray-800 text-lg font-semibold text-center">Reset Password</h1>
            <p className="text-gray-400 text-xs text-center">
              Enter your email and we'll send you a reset link.
            </p>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-sm"
            />

            <button
  type="submit"
  className="w-full py-2 rounded-lg bg-[#96bb7b] hover:bg-[#86ab6f] active:bg-[#789e63] text-white text-sm font-medium transition"
>
  Send Link
</button>
            <Link
              to="/login"
              className="text-xs text-blue-400 hover:text-blue-600 transition text-center"
            >
              Go back to login
            </Link>
          </form>
        </BorderGlow>
      </div>
    </div>
  );
}

export default ForgetPassword;