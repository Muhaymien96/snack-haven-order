
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, Cake, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CartIcon from './CartIcon';
import { toast } from '@/hooks/use-toast';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [role, setRole] = useState<string | null>(null);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!error && data?.role) {
          setRole(data.role);
        }
      }
    };

    fetchUserRole();
  }, [user]);

  const accountPath = role === 'admin' ? '/admin' : '/account';

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account"
      });
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Sign out failed",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <nav className="bg-cream shadow-sm">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-amber-800 font-bold text-2xl">
            <Cake size={28} />
            <span>Thaneya's Treats</span>
          </Link>

          {/* Mobile menu toggle */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className={`text-amber-800 hover:text-amber-600 transition-colors ${isActive('/') ? 'font-medium' : ''}`}>
              Home
            </Link>
            <Link to="/products" className={`text-amber-800 hover:text-amber-600 transition-colors ${isActive('/products') ? 'font-medium' : ''}`}>
              Products
            </Link>
            <Link to="/contact" className={`text-amber-800 hover:text-amber-600 transition-colors ${isActive('/contact') ? 'font-medium' : ''}`}>
              Contact
            </Link>
            <CartIcon />
            {user ? (
              <div className="flex items-center space-x-2">
                <Link to={accountPath}>
                  <Button variant="ghost" size="icon">
                    <User size={24} className="text-amber-800" />
                  </Button>
                </Link>
                {role === 'admin' && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleSignOut}
                    title="Sign Out"
                  >
                    <LogOut size={20} className="text-amber-800" />
                  </Button>
                )}
              </div>
            ) : (
              <Link to="/login" className={`text-amber-800 hover:text-amber-600 transition-colors ${isActive('/login') ? 'font-medium' : ''}`}>
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-cream shadow-lg absolute top-16 inset-x-0 z-50">
          <div className="container-custom py-4 flex flex-col space-y-4">
            <Link to="/" onClick={closeMenu} className={`text-amber-800 hover:text-amber-600 py-2 ${isActive('/') ? 'font-medium' : ''}`}>
              Home
            </Link>
            <Link to="/products" onClick={closeMenu} className={`text-amber-800 hover:text-amber-600 py-2 ${isActive('/products') ? 'font-medium' : ''}`}>
              Products
            </Link>
            <Link to="/contact" onClick={closeMenu} className={`text-amber-800 hover:text-amber-600 py-2 ${isActive('/contact') ? 'font-medium' : ''}`}>
              Contact
            </Link>
            {user ? (
              <>
                <Link to={accountPath} onClick={closeMenu} className="text-amber-800 hover:text-amber-600 py-2">
                  My Account
                </Link>
                {role === 'admin' && (
                  <button 
                    onClick={() => {
                      handleSignOut();
                      closeMenu();
                    }} 
                    className="flex items-center text-amber-800 hover:text-amber-600 py-2"
                  >
                    <LogOut size={18} className="mr-2" />
                    Sign Out
                  </button>
                )}
              </>
            ) : (
              <Link to="/login" onClick={closeMenu} className={`text-amber-800 hover:text-amber-600 py-2 ${isActive('/login') ? 'font-medium' : ''}`}>
                Login
              </Link>
            )}
            <div onClick={closeMenu}>
              <CartIcon />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
