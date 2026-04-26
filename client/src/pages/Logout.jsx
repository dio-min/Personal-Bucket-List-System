import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase"; 
// adjust path to your config
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";

function Logout() {
    const navigate = useNavigate();
    const handleLogout = async () =>{
        try{
            await signOut(auth);
            
            navigate("/");
            console.log("user logged out");
        }
        catch(error){
            console.error("Logout error:", error);

        }
    }
    
  return (
    <div>
        <Button onClick={handleLogout}>Log out</Button>
    </div>
  )
}

export default Logout;