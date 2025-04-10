
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cake } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const checkIfAdmin = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        // Check if the user is an admin (mobile number check)
        const isAdminUser = data?.mobile === '0662538342';
        setIsAdmin(isAdminUser);

        if (!isAdminUser) {
          toast.error('You do not have permission to access this page');
          navigate('/products');
          return;
        }

        // Fetch orders if user is admin
        fetchOrders();
      } catch (error: any) {
        console.error('Error checking admin status:', error);
        toast.error('Failed to verify admin status');
        navigate('/products');
      }
    };

    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('date', { ascending: false });

        if (error) throw error;

        setOrders(data || []);
      } catch (error: any) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    checkIfAdmin();
  }, [user, navigate]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast.success(`Order status updated to ${newStatus}`);
      
      // Refresh orders after update
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;
      
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Loading...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Navigate happens in useEffect
  }

  return (
    <div className="container-custom py-12">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Cake size={48} className="text-amber-800" />
            </div>
            <CardTitle className="text-2xl text-amber-800">Thaneya's Treats Admin Dashboard</CardTitle>
            <CardDescription>
              Manage orders and products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="orders" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
              </TabsList>
              
              <TabsContent value="orders" className="mt-6">
                <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <Card key={order.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                              <div>
                                <h4 className="font-medium">Order #{order.id.substring(0, 8)}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Date: {new Date(order.date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  order.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                            
                            <div className="mt-4 flex flex-wrap gap-2">
                              {order.status === 'pending' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleUpdateOrderStatus(order.id, 'approved')}
                                  >
                                    Approve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleUpdateOrderStatus(order.id, 'rejected')}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                              {order.status === 'approved' && (
                                <Button 
                                  size="sm" 
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                                >
                                  Mark as Completed
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No orders found</p>
                )}
              </TabsContent>
              
              <TabsContent value="products" className="mt-6">
                <h3 className="text-xl font-semibold mb-4">Products</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        <li>Bollas: R6.00</li>
                        <li>Koeksisters: R6.00</li>
                        <li>Chicken Samoosas: R5.00</li>
                        <li>Mince Samoosas: R5.00</li>
                      </ul>
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground">
                          Contact Info: 072 227 7345 (WhatsApp)
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Email: t.dollie982@gmail.com
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
