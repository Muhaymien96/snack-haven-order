import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      // If user is authenticated, navigate to products
      // Otherwise navigate to landing page
      if (user) {
        navigate('/products');
      } else {
        navigate('/');
      }
    }
  }, [user, loading, navigate]);

  // Return a loading state while checking
  return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
};

export default Index;
