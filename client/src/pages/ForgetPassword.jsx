import { useState } from 'react';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../lib/firebase";   // your firebase config path
import { Link } from 'react-router-dom';
import BorderGlow from "../component/BorderGlow";

function ForgetPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleReset = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("Password reset email sent! Check your inbox (including spam folder).");
            setEmail(""); // clear input

            alert(message)
        } catch (err) {
            console.error("Reset error:", err);
            if (err.code === 'auth/user-not-found') {
                setError("No account found with this email.");
            } else if (err.code === 'auth/invalid-email') {
                setError("Please enter a valid email address.");
            } else {
                setError("Failed to send reset email. Please try again.");
            }

            alert(error)

        }
    }

    
  return (
    <>
    <div className='container'>
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
        <div className='inner-form'>
            <form onSubmit={handleReset} className='style-form'>
                <input type="email" placeholder='Email' value={email} onChange={(e)=>setEmail(e.target.value)}required/>
                <button type='submit'>Send Link</button>
                
            </form>
            <Link to={"/login"}>Go back to login</Link>
        </div>

      </BorderGlow>
        
        

        
    </div>
        
    </>
    
    
  )
}

export default ForgetPassword