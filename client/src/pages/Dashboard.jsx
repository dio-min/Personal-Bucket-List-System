import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import Navigate from "./Navigate"; // your component

import { useNavigate } from "react-router-dom";
import DataView from "./Dashboard/DataView";

function Dashboard() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const name = user.displayName || user.email?.split("@")[0] || "User";
        setUsername(name);
      } else {
        navigate("/login", { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div style={{ color: "white" }}>
      <Navigate />

      <div>
        <div>
          <DataView />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
