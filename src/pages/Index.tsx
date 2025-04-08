import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/lib/supabase';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user, error } = await getCurrentUser();
        
        if (error) {
          console.error('Error checking auth status:', error);
        }

        // If user is authenticated, navigate to products
        // Otherwise navigate to landing page
        if (user) {
          navigate('/products');
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error('Error in auth check:', err);
        navigate('/');
      }
    };

    checkAuth();
  }, [navigate]);

  // Return a loading state while checking
  return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
};

export default Index;
