import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register";
import ForgetPassword from "./pages/ForgetPassword.jsx";
import Welcome from "./pages/Welcome.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ViewList from "./pages/User/ViewList.jsx";
import Album from "./pages/User/Album.jsx";
import "./App.css";




import Particles from "./component/Particles/Particles.jsx";
import "./component/Particles/Particles.css";



function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });

    return unsubscribe;
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-800">
  <div className="flex flex-col items-center gap-3">
    <svg
      className="animate-spin size-6"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12" cy="12" r="10"
        stroke="#96bb7b"
        strokeWidth="3"
        strokeOpacity="0.25"
      />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="#96bb7b"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
    <p className="text-sm font-medium">Checking authentication status…</p>
  </div>
</div>
    );
  }

  return (
    <div
      className="relative min-h-screen w-full overflow-auto"
      style={{
        backgroundImage:
          "url('https://i.pinimg.com/1200x/4a/6b/13/4a6b1378c92f3823732908508f1fd9b1.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 z-10">
        
        <Router>
          <Routes>
            <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Welcome />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
            <Route path="/forgotpassword" element={user ? <Navigate to="/dashboard" replace /> : <ForgetPassword />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
            <Route path="/viewlist" element={user ? <ViewList /> : <Navigate to="/login" replace />} />
            <Route path="/album" element={user ? <Album /> : <Navigate to="/login" replace />} />
            <Route path="*" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
            
          </Routes>
          
        </Router>
        
        
      </div>
      

    </div>
  );
}

export default App;
