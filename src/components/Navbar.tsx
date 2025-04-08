
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-cream shadow-sm">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-earth font-bold text-2xl">Snack Haven</Link>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMenu}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`text-earth hover:text-terracotta transition-colors ${isActive('/') ? 'font-medium' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className={`text-earth hover:text-terracotta transition-colors ${isActive('/products') ? 'font-medium' : ''}`}
            >
              Products
            </Link>
            <Link 
              to="/contact" 
              className={`text-earth hover:text-terracotta transition-colors ${isActive('/contact') ? 'font-medium' : ''}`}
            >
              Contact
            </Link>
            <Link to="/cart">
              <Button variant="ghost" size="icon" aria-label="Shopping cart">
                <ShoppingBag size={24} />
              </Button>
            </Link>
            {user ? (
              <Link to="/account">
                <Button variant="ghost" size="icon" aria-label="Account">
                  <User size={24} />
                </Button>
              </Link>
            ) : (
              <Link 
                to="/login" 
                className={`text-earth hover:text-terracotta transition-colors ${isActive('/login') ? 'font-medium' : ''}`}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-cream shadow-lg absolute top-16 inset-x-0 z-50">
          <div className="container-custom py-4 flex flex-col space-y-4">
            <Link 
              to="/" 
              className={`text-earth hover:text-terracotta transition-colors py-2 ${isActive('/') ? 'font-medium' : ''}`}
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link 
              to="/products" 
              className={`text-earth hover:text-terracotta transition-colors py-2 ${isActive('/products') ? 'font-medium' : ''}`}
              onClick={closeMenu}
            >
              Products
            </Link>
            <Link 
              to="/contact" 
              className={`text-earth hover:text-terracotta transition-colors py-2 ${isActive('/contact') ? 'font-medium' : ''}`}
              onClick={closeMenu}
            >
              Contact
            </Link>
            {user ? (
              <Link 
                to="/account" 
                className={`text-earth hover:text-terracotta transition-colors py-2 ${isActive('/account') ? 'font-medium' : ''}`}
                onClick={closeMenu}
              >
                My Account
              </Link>
            ) : (
              <Link 
                to="/login" 
                className={`text-earth hover:text-terracotta transition-colors py-2 ${isActive('/login') ? 'font-medium' : ''}`}
                onClick={closeMenu}
              >
                Login
              </Link>
            )}
            <div className="flex space-x-4 py-2">
              <Link to="/cart" onClick={closeMenu}>
                <Button variant="ghost" size="icon" aria-label="Shopping cart">
                  <ShoppingBag size={24} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
