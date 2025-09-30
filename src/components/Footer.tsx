// components/Footer.tsx - Versión simple
import { ChefHat } from "lucide-react";

const Footer = ({ className }: { className?: string }) => {
  return (
    <footer className={`w-full border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 py-6 transition-colors duration-300 ${className}`}>
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-6">
        
        {/* Links */}
        <nav className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
          <a
            href="#"
            className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200 cursor-pointer"
          >
            Privacidad
          </a>
          <a
            href="#"
            className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200 cursor-pointer"
          >
            Términos
          </a>
          <a
            href="#"
            className="hover:text-gray-900 dark:hover:text-white transition-colors duration-200 cursor-pointer"
          >
            Contacto
          </a>
        </nav>

        {/* Copyright */}
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center md:text-right">
          © {new Date().getFullYear()} Chefcito AI. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;