import Login from "./pages/Login.jsx";
import Register from "./pages/Register";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ForgetPassword from "./pages/ForgetPassword.jsx";
import Welcome from "./pages/Welcome.jsx";
import Dashboard from "./pages/Dashboard.jsx";

import "./App.css";



import Particles from "./component/Particles/Particles.jsx";
import "./component/Particles/Particles.css";



function App() {
  return (
    
    <div className="fixed inset-0 w-full h-screen overflow-hidden bg-black">
      <Particles
          particleColors={["#ffffff"]}
          particleCount={300}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover
          alphaParticles={false}
          disableRotation={false}
          pixelRatio={1}
      />
      <div className="absolute inset-0 z-10">
        
        <Router>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgotpassword" element={<ForgetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            
          </Routes>
          
        </Router>
      </div>
    
    
      
      
      
    </div>

   
  );
}

export default App;
