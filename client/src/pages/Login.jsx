import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import axios from "axios";
import BorderGlow from "../component/BorderGlow";
import API_BASE_URL from "../lib/config";

// Simple check: if the input contains "@" treat it as an email, otherwise a username
const isEmail = (value) => value.includes("@");

function Login() {
  const [identifier, setIdentifier] = useState(""); // email or username
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let emailToUse = identifier.trim();

      // If the user typed a username, resolve it to an email via the backend
      if (!isEmail(emailToUse)) {
        const { data } = await axios.post(
          `${API_BASE_URL}/api/user/get-email-by-username`,
          { username: emailToUse },
        );

        if (!data?.email) {
          throw new Error("No account found with that username.");
        }

        emailToUse = data.email;
      }

      // Sign in with Firebase using the resolved email
      const userCredential = await signInWithEmailAndPassword(
        auth,
        emailToUse,
        password,
      );
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
    <>
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
            <form onSubmit={handleLogin} className="style-form">
              <h1>Login</h1>

              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Email or Username"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <Link to={"/forgotpassword"}>Forgot password</Link>
              <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>

              <Link to="/register">
                <button>Register</button>
              </Link>
            </form>
          </div>
        </BorderGlow>
      </div>
    </>
  );
}

export default Login;