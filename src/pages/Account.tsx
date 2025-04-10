import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type ProfileType = {
  name: string;
  surname: string;
  block_number: number;
  unit_number: number;
  mobile_number: string;
};

const Account = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (loading) return;  // wait for auth to be determined
    if (!user) {
      navigate('/login');
      return;
    }
    const loadAccountData = async () => {
      try {
        // Fetch profile and orders in parallel
        const [{ data: profileData, error: profileErr }, { data: ordersData, error: ordersErr }] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          supabase.from('orders')
            .select(`id, date, status, order_items(quantity, products(name))`)
            .eq('user_id', user.id)
            .order('date', { ascending: false })
        ]);
        if (profileErr) throw profileErr;
        if (ordersErr) throw ordersErr;
        if (profileData) {
          setProfile({
            name: profileData.name || '',
            surname: profileData.surname || '',
            block_number: profileData.block_number || 0,
            unit_number: profileData.unit_number || 0,
            mobile_number: profileData.mobile || ''  // DB column 'mobile' into state
          });
        }
        setOrders(ordersData || []);
      } catch (error: any) {
        console.error('Error loading account data:', error);
        toast.error('Failed to load account information');
      } finally {
        setLoadingData(false);
      }
    };
    loadAccountData();
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  if (loadingData) {
    return (
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Loading...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;  // if profile failed to load, already handled by toast
  }

  return (
    <div className="container-custom py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">My Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-lg font-medium">{profile.name} {profile.surname}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mobile Number</p>
              <p className="text-lg font-medium">{profile.mobile_number}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="text-lg font-medium">
                Block {profile.block_number}, Unit {profile.unit_number}
              </p>
            </div>
            <Button variant="destructive" className="w-full mt-4" onClick={handleSignOut}>
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* My Orders Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl">My Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="border rounded-md p-3 text-sm">
                    <p><strong>Order:</strong> #{order.id.substring(0, 8)}</p>
                    <p><strong>Date:</strong> {new Date(order.date).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> {order.status}</p>
                    {order.order_items && order.order_items.length > 0 && (
                      <ul className="mt-1 pl-5 list-disc">
                        {order.order_items.map((item: any, idx: number) => (
                          <li key={idx}>{item.quantity} × {item.products.name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">You have no orders yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account;
