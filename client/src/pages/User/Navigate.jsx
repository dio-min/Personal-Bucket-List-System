import { Link } from "react-router-dom";
import { useState } from "react";
import Logout from "../Logout";
import { Button } from "@heroui/react";

function Navigate() {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div 
      className="sticky top-0 z-50 border-b border-slate-200 backdrop-blur-md"
      style={{ backgroundColor: "#96bb7b" }}
    >
      <div className="max-w-5xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Left Side */}
          <div className="flex items-center gap-3">
            <img 
              src="/logos1.png" 
              alt="Avatar" 
              className="w-10 h-10 rounded-full object-cover" 
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">HeyBuck</h1>
              
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center gap-8">
            <Link to="/dashboard" className="text-slate-800 hover:text-slate-900 font-medium transition-colors">
              Home
            </Link>
            <Link to="/album" className="text-slate-800 hover:text-slate-900 font-medium transition-colors">
              Album
            </Link>

            <Button 
              variant="primary" 
              className="px-6 py-2.5 text-sm font-semibold rounded-xl"
              style={{ backgroundColor: "#0f172b", color: "white" }}
              onPress={() => setIsOpen(true)}
            >
              Log Out
            </Button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-slate-800 hover:text-slate-900 rounded-lg hover:bg-white/30"
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-4 flex flex-col gap-2 border-t border-white/30 pt-4">
            <Link 
              to="/dashboard" 
              className="px-4 py-3 text-slate-800 hover:bg-white/30 rounded-xl font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/album" 
              className="px-4 py-3 text-slate-800 hover:bg-white/30 rounded-xl font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Album
            </Link>

            <Button 
              variant="primary" 
              className="mx-4 mt-2 py-3 text-sm font-semibold rounded-xl"
              style={{ backgroundColor: "#0f172b", color: "white" }}
              onPress={() => {
                setIsOpen(true);
                setMobileMenuOpen(false);
              }}
            >
              Log Out
            </Button>
          </div>
        )}
      </div>

      {/* ====================== MODAL ====================== */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-slate-900">Confirm Logout</h2>
            </div>
            
            <div className="mb-6">
              <p className="text-slate-600">
                Are you sure you want to log out? You will need to log in again to access your bucket list.
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 font-medium transition-colors"
              >
                Cancel
              </button>
              <Logout onSuccess={() => setIsOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navigate;