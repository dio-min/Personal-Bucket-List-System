import { Link } from "react-router-dom";

function Navigate() {
  return (
    <div className="sticky top-0 z-50 bg-black border-b border-white/20 backdrop-blur-md">
      <div className="flex items-center justify-between px-8 py-5">
        
        {/* Logo / Brand */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">HeyBuck</h1>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-8 text-sm">
          <p>Home</p>
          <Link to="/add-item" className="text-gray-300 hover:text-white transition-colors">
            Log out
          </Link>
          <Link to="/album" className="text-gray-300 hover:text-white transition-colors">
            Album
          </Link>
          <Link to="/list" className="text-gray-300 hover:text-white transition-colors">
            List
          </Link>
        </div>

        {/* Right side (optional - you can add user avatar/logout later) */}
        
      </div>
    </div>
  );
}

export default Navigate;