
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Cake } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Check if user is admin
        const checkIfAdmin = async () => {
          try {
            const { data } = await supabase
              .from('profiles')
              .select('mobile')
              .eq('id', user.id)
              .single();
            
            // If mobile number matches admin number, redirect to admin dashboard
            if (data && data.mobile === '0662538342') {
              navigate('/admin');
            } else {
              navigate('/products');
            }
          } catch (error) {
            console.error('Error checking admin status:', error);
            navigate('/products'); // Default to products if there's an error
          }
        };
        
        checkIfAdmin();
      } else {
        navigate('/');
      }
    }
  }, [user, loading, navigate]);

  // Return a loading state while checking
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Cake size={48} className="text-amber-800 mx-auto mb-4" />
        <p className="text-lg text-amber-800">Loading Thaneya's Treats...</p>
      </div>
    </div>
  );
};

export default Index;
