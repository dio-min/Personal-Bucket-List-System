import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Navigate from "./User/Navigate"; // your component

import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import DataView from "./Dashboard/DataView";


const auth = getAuth();

function Dashboard() {
 

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
  }, []); // ← Empty dependency array is correct here

  return (
    <div style={{ color: "white" }}>
      <Navigate />

      <div >
        

        <div>
          <DataView />
          

        </div>
        
        
          
          
          
        
      </div>
    </div>
  );
}

export default Dashboard;
