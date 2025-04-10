
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Cake } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-amber-800 text-cream mt-auto">
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <Cake size={24} className="text-cream" />
              <h3 className="text-xl font-semibold">Thaneya's Treats</h3>
            </div>
            <p className="mb-4 mt-2">Authentic South African snacks delivered to your doorstep.</p>
            <div className="flex items-center space-x-4">
              {/* Social media icons would go here */}
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-amber-200 transition-colors">Home</Link></li>
              <li><Link to="/products" className="hover:text-amber-200 transition-colors">Products</Link></li>
              <li><Link to="/order" className="hover:text-amber-200 transition-colors">Order</Link></li>
              <li><Link to="/contact" className="hover:text-amber-200 transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Phone size={18} className="mr-2" />
                <span>+27 72 227 7345</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2" />
                <span>t.dollie982@gmail.com</span>
              </li>
              <li className="flex items-center">
                <MapPin size={18} className="mr-2" />
                <span>Pretoria, South Africa</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-cream/20 mt-8 pt-6 text-center">
          <p>&copy; {new Date().getFullYear()} Thaneya's Treats. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
