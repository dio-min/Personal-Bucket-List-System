import { Link } from "react-router-dom"
import './style.css'
import TextType from '../component/TextType';
import BorderGlow from "../component/BorderGlow";   // Adjust path if needed
import "../component/BorderGlow.css";
import Logo from '../assets/logo.gif';
import ExclamationMark from '../assets/ExclamationMark.gif';
function Welcome() {
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
                    colors={['#ffffff', '#ffffff', '#38bdf8']}
                    className="pointer-events-auto"
                >
                    
                    <div className="inner-form">
                        <div style={{display:'flex'}}>
                            
                            <img src={Logo} alt="Logo" style={{width: '60px', margin: '5px auto'}}/>
                            
                        </div>
                        
                        <TextType 
                        text={["Welcome to your BucketList App", "Build some amazing experiences!"]}
                        typingSpeed={75}
                        pauseDuration={1500}
                        showCursor
                        cursorCharacter="|"
                        deletingSpeed={50}
                        variableSpeedEnabled={false}
                        variableSpeedMin={60}
                        variableSpeedMax={120}
                        cursorBlinkDuration={0.5}
                        
                        />
                        <Link to={'/login'}>
                            <button>Login</button>
                        </Link>
                        <Link to={'/register'}>
                            <button>Sign Up</button>
                        </Link>
                    </div>

                    

                </BorderGlow>
                
                
            
        </div>
    </>
    
  )
}

export default Welcome