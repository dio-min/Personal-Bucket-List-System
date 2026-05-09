import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import Logout from "./Logout";
import { Button } from "@heroui/react";
import { Home, Images, Menu, X } from "lucide-react";
import logo from "../assets/logos1.png";

function Navigate() {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();

  const navLinks = [
    {
      name: "Home",
      path: "/dashboard",
      icon: <Home size={18} />,
    },
    {
      name: "Album",
      path: "/album",
      icon: <Images size={18} />,
    },
  ];

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-50 border-b border-black/5 backdrop-blur-xl bg-[#96bb7b]/90">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="h-20 flex items-center justify-between">

            {/* LEFT */}
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Logo"
                className="w-11 h-11 rounded-full object-cover border border-white/30 shadow-sm"
              />

              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Laya
              </h1>
            </div>

            {/* DESKTOP NAV */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = location.pathname === link.path;

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`
                      relative flex items-center gap-2 px-4 py-2.5 rounded-xl
                      text-sm font-semibold transition-all duration-200
                      ${
                        active
                          ? "text-slate-900 bg-white/30"
                          : "text-slate-800 hover:bg-white/40 hover:text-slate-900"
                      }
                    `}
                  >
                    {link.icon}
                    {link.name}

                    {/* underline */}
                    <span
                      className={`
                        absolute left-3 right-3 -bottom-1 h-[2px] rounded-full bg-[#0f172b]
                        transition-all duration-300 origin-left
                        ${active ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}
                      `}
                    />
                  </Link>
                );
              })}

              <Button
                className="ml-2 px-5 py-2.5 rounded-xl bg-[#0f172b] text-white font-semibold shadow-md hover:opacity-90"
                onPress={() => setIsOpen(true)}
              >
                Log Out
              </Button>
            </nav>

            {/* MOBILE BUTTON */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-11 h-11 rounded-xl bg-[#0f172b] text-white flex items-center justify-center"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ================= MOBILE MENU ================= */}
        <div
          className={`
            md:hidden overflow-hidden transition-all duration-300
            ${
              mobileMenuOpen
                ? "max-h-96 opacity-100 border-t border-black/5"
                : "max-h-0 opacity-0"
            }
          `}
        >
          <div className="px-4 pb-5 pt-4 flex flex-col gap-2 bg-[#96bb7b]/95 backdrop-blur-xl">

            {navLinks.map((link) => {
              const active = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-2xl
                    font-semibold text-sm transition-all
                    ${
                      active
                        ? "bg-white/80 text-[#0f172b] shadow-sm"
                        : "text-slate-800 hover:bg-white/40"
                    }
                  `}
                >
                  {link.icon}
                  {link.name}
                </Link>
              );
            })}

            <Button
              className="mt-2 h-12 rounded-2xl bg-[#0f172b] text-white font-semibold"
              onPress={() => {
                setIsOpen(true);
                setMobileMenuOpen(false);
              }}
            >
              Log Out
            </Button>
          </div>
        </div>
      </header>

      {/* ================= LOGOUT MODAL ================= */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-black/5 overflow-hidden">

            <div className="px-6 pt-6">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
                <span className="text-2xl">👋</span>
              </div>

              <h2 className="text-2xl font-bold text-slate-900">
                Confirm Logout
              </h2>

              <p className="text-slate-500 mt-2 text-sm">
                Are you sure you want to log out? You can always log back in anytime.
              </p>
            </div>

            <div className="flex justify-end gap-3 px-6 py-6">
              <button
                onClick={() => setIsOpen(false)}
                className="px-5 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
              >
                Cancel
              </button>

              <Logout onSuccess={() => setIsOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navigate;