import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Navigate from "./User/Navigate";   // your component
import ViewList from "./User/ViewList";   // your component
import { useNavigate } from "react-router-dom";

const auth = getAuth();

function Dashboard() {
  const [username, setUsername] = useState("");
 const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Use displayName, fallback to email if displayName is null
        const name = user.displayName || user.email?.split("@")[0] || "User";
        setUsername(name);
      } else {
        navigate("/"); // Not logged in
      }
    });

    // Cleanup on unmount
    return () => unsubscribe();
  }, []);   // ← Empty dependency array is correct here

  

  return (
    <div style={{ color: "white" }}>
      <Navigate />

      <div className="container">
        <p>Welcome, {username } </p>

        <ViewList />
      </div>
    </div>
  );
}

export default Dashboard;