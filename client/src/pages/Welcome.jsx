import { Link } from "react-router-dom"
import TextType from '../component/TextType';
import BorderGlow from "../component/BorderGlow";
import "../component/BorderGlow.css";
import Logo from '../assets/logo.gif';

function Welcome() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-80 animate-float">
        <BorderGlow
          edgeSensitivity={40}
          glowColor="210 100 80"
          backgroundColor="#ffffff"
          borderRadius={28}
          glowRadius={40}
          glowIntensity={1}
          coneSpread={25}
          animated={true}
          colors={['#ffffff', '#dbeafe', '#bfdbfe']}
          className="pointer-events-auto"
        >
          <div className="flex flex-col items-center gap-3 px-6 py-6">
            <img src={Logo} alt="Logo" className="w-14 h-14 object-contain" />

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
              className="text-gray-800 text-sm font-medium text-center w-full"
            />

            <Link to="/login" className="w-full">
              <button className="w-full py-2 rounded-lg bg-[#96bb7b] hover:bg-[#86ab6f] active:bg-[#789e63] text-white text-sm font-medium transition">
  Login
</button>
            </Link>

            <Link to="/register" className="w-full">
              <button className="w-full py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 active:bg-gray-100 text-sm transition">
                Sign Up
              </button>
            </Link>
          </div>
        </BorderGlow>
      </div>
    </div>
  )
}

export default Welcome