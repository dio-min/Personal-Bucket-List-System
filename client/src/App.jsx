import Login from "./pages/Login.jsx";
import Register from "./pages/Register";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ForgetPassword from "./pages/ForgetPassword.jsx";
import Welcome from "./pages/Welcome.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ViewList from "./pages/User/ViewList.jsx";
import Album from "./pages/User/Album.jsx";
import "./App.css";



import Particles from "./component/Particles/Particles.jsx";
import "./component/Particles/Particles.css";



function App() {
  return (
    
    <div className="relative min-h-screen w-full overflow-auto "  
    style={{
  backgroundImage:
    "url('https://i.pinimg.com/1200x/4a/6b/13/4a6b1378c92f3823732908508f1fd9b1.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
}}>
     
      <div className="absolute inset-0 z-10">
        
        <Router>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgotpassword" element={<ForgetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/viewlist" element={<ViewList />} />
            <Route path="/album" element={<Album />} />
          </Routes>
          
        </Router>
      </div>
    
    
      
      
      
    </div>

   
  );
}

export default App;
