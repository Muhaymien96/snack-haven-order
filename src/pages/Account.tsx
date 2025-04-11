
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Package, Clock } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
            .select(`
              id, 
              order_date, 
              delivery_date,
              status, 
              total,
              payment_method,
              is_special_order,
              special_instructions,
              order_items(
                id, 
                quantity, 
                price, 
                flavor,
                products(
                  id, 
                  name, 
                  image_url
                )
              )
            `)
            .eq('user_id', user.id)
            .order('order_date', { ascending: false })
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return `R${amount.toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loadingData) {
    return (
      <div className="container-custom py-12">
        <div className="max-w-3xl mx-auto">
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
      <div className="max-w-3xl mx-auto">
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
            <CardTitle className="flex items-center text-xl">
              <ShoppingBag className="mr-2 h-5 w-5" />
              My Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <div className="space-y-8">
                {orders.map(order => (
                  <Card key={order.id} className="border shadow-sm">
                    <CardHeader className="bg-muted/50 pb-2">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Order #{order.id.substring(0, 8)}</span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-2 h-3 w-3" />
                            <span>Placed on {formatDate(order.order_date)}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            order.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : order.status === 'pending' 
                                ? 'bg-amber-100 text-amber-800' 
                                : order.status === 'approved' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                          <div>
                            <p className="text-muted-foreground">Delivery Date:</p>
                            <p className="font-medium">{formatDate(order.delivery_date)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Payment Method:</p>
                            <p className="font-medium">{order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}</p>
                          </div>
                        </div>
                        {order.is_special_order && (
                          <div className="mt-2 text-sm">
                            <p className="text-muted-foreground">Special Order Instructions:</p>
                            <p className="italic">{order.special_instructions || 'None provided'}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item</TableHead>
                              <TableHead>Flavor</TableHead>
                              <TableHead className="text-right">Qty</TableHead>
                              <TableHead className="text-right">Price</TableHead>
                              <TableHead className="text-right">Subtotal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {order.order_items.map((item: any) => (
                              <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                  {item.products?.name || 'Unknown Product'}
                                </TableCell>
                                <TableCell>{item.flavor || '-'}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatCurrency(item.price * item.quantity)}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={4} className="text-right font-bold">Total:</TableCell>
                              <TableCell className="text-right font-bold">{formatCurrency(order.total)}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">You have no orders yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account;
