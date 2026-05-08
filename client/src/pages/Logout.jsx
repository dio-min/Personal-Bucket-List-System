import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase"; 
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";

function Logout({ onSuccess }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log("user logged out");
            
            if (onSuccess) onSuccess();
            navigate("/");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };
    
    return (
      <Button 
        variant="destructive"
        onPress={handleLogout}           // ← Changed to onPress
        style={{ backgroundColor: "#f1f995", color: "#111" }}
        className="font-medium"
      >
        Yes, Log Out
      </Button>
    );
}

export default Logout;