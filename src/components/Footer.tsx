// components/Footer.tsx
import { ChefHat } from "lucide-react";

const Footer = ({ className }: { className?: string }) => {
  return (
    <footer className={`w-full border-t border-gray-100 bg-white py-6 ${className}`}>
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-6">
        
        {/* Links */}
        <nav className="flex gap-6 text-sm text-gray-600">
          <a
            href="#"
            className="hover:text-gray-900 transition-colors cursor-pointer"
          >
            Privacidad
          </a>
          <a
            href="#"
            className="hover:text-gray-900 transition-colors cursor-pointer"
          >
            Términos
          </a>
          <a
            href="#"
            className="hover:text-gray-900 transition-colors cursor-pointer"
          >
            Contacto
          </a>
        </nav>

        {/* Copyright */}
        <p className="text-xs text-gray-400 text-center md:text-right">
          © {new Date().getFullYear()} Chefcito AI. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
