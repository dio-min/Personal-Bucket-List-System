import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import axios from "axios";
import BorderGlow from "../component/BorderGlow";
import API_BASE_URL from "../lib/config";

const isEmail = (value) => value.includes("@");

function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let emailToUse = identifier.trim();

      if (!isEmail(emailToUse)) {
        const { data } = await axios.post(
          `${API_BASE_URL}/api/user/get-email-by-username`,
          { username: emailToUse },
        );
        if (!data?.email) throw new Error("No account found with that username.");
        emailToUse = data.email;
      }

      const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);
      const firebaseUser = userCredential.user;

      await axios.post(`${API_BASE_URL}/api/user/login`, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
      });

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      alert(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
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
          <form onSubmit={handleLogin} className="flex flex-col gap-3 px-6 py-6">
            <h1 className="text-gray-800 text-lg font-semibold text-center">Login</h1>

            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Email or Username"
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-sm"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition text-sm"
            />

            <Link to="/forgotpassword" className="text-xs text-blue-400 hover:text-blue-600 transition self-end">
              Forgot password
            </Link>

            <button
  type="submit"
  disabled={loading}
  className="w-full py-2 rounded-lg bg-[#96bb7b] hover:bg-[#86ab6f] active:bg-[#789e63] disabled:opacity-50 text-white text-sm font-medium transition"
>
  {loading ? "Logging in..." : "Login"}
</button>

            <Link to="/register" className="w-full">
              <button
                type="button"
                className="w-full py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 active:bg-gray-100 text-sm transition"
              >
                Register
              </button>
            </Link>
          </form>
        </BorderGlow>
      </div>
    </div>
  );
}

export default Login;