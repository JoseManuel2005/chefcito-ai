"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, User, Menu, X, Settings, LogOut } from "lucide-react";
import { auth } from "@/lib/firebaseClient";

interface NavbarProps {
  userPhoto?: string | null;
}

export default function Navbar({ userPhoto }: NavbarProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const navigation = [
    { name: "Inicio", href: "/home" },
    { name: "Crear receta", href: "/ingredients" },
    { name: "Analizar receta", href: "/recipe-analysis" },
    //{ name: "Preferencias", href: "/onboarding" },
  ];

  // Cerrar menú si hacemos clic afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handlePreferences = () => {
    router.push("/onboarding");
    setIsUserMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm mb-5">
        <div className="max-w-430 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => router.push("/home")}
            >
              <div className="w-10 h-10 bg-[#FFCB2B] rounded-xl flex items-center justify-center shadow-sm">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Chefcito AI</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-6">
                {navigation.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.href)}
                    className="text-gray-700 hover:text-yellow-600 font-medium transition-colors duration-200 text-base cursor-pointer"
                  >
                    {item.name}
                  </button>
                ))}
              </div>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 p-1 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm border border-gray-200">
                    {userPhoto ? (
                      <img
                        src={userPhoto}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      onClick={handlePreferences}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                    >
                      <Settings className="w-4 h-4" />
                      Preferencias
                    </button>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-sm">
            <div className="px-4 py-3 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-3 text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg font-medium transition-all duration-200"
                >
                  {item.name}
                </button>
              ))}
              
              {/* Mobile User Section */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm border border-gray-200">
                    {userPhoto ? (
                      <img
                        src={userPhoto}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700">Mi cuenta</span>
                </div>
                
                <button
                  onClick={() => {
                    router.push("/onboarding");
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-3 text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg font-medium transition-all duration-200 flex items-center gap-3"
                >
                  <Settings className="w-4 h-4" />
                  Preferencias
                </button>
                
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-all duration-200 flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}