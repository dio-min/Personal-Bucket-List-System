import { useState } from "react";
import { Link , useNavigate} from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase"; // your firebase config
import axios from "axios";
import BorderGlow from "../component/BorderGlow";
import API_BASE_URL from "../lib/config";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = userCredential.user;


      const response = await axios.post(`https://personal-bucket-list-system-a.onrender.com/api/user/login`,
        {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        },
      );
      if (response.data.success) {
      // Save user data for later use (recommended)
      localStorage.setItem("currentUser", JSON.stringify(response.data.user));

      alert("Login successful!");
      navigate("/dashboard");
    } else {
      alert(response.data.message || "Login failed");
    }
    } catch (err) {
      console.error("Login error:", err);
      alert(err.message || "Invalid email or password");
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
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
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
              <button type="submit">Login</button>
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
