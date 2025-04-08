import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '@/lib/supabase';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
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
    };

    checkAuth();
  }, [navigate]);

  return null;
};

export default Index;
