import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Cake } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAccessAndLoad = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('mobile')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        const isAdminUser = data?.mobile === '0662538342';
        setIsAdmin(isAdminUser);

        if (!isAdminUser) {
          toast.error('You do not have permission to access this page');
          navigate('/products');
          return;
        }

        const [{ data: ordersData, error: ordersError }, { data: productsData, error: productsError }] = await Promise.all([
          supabase.from('orders').select('*').order('created_at', { ascending: false }),
          supabase.from('products').select('*').order('created_at', { ascending: false })
        ]);

        if (ordersError || productsError) throw ordersError || productsError;

        setOrders(ordersData || []);
        setProducts(productsData || []);
      } catch (error) {
        console.error('Admin check or fetch failed:', error);
        toast.error('Failed to verify admin or load data');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    checkAccessAndLoad();
  }, [user, navigate]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast.success(`Order status updated to ${newStatus}`);

      const { data: updatedOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      setOrders(updatedOrders || []);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleProductChange = (id, field, value) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleUpdateProduct = async (id) => {
    const product = products.find(p => p.id === id);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: product.name,
          price: product.price,
          description: product.description,
          available: product.available
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Product updated successfully');
    } catch (error) {
      console.error('Product update failed:', error);
      toast.error('Failed to update product');
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

  if (!isAdmin) return null;

  return (
    <div className="container-custom py-12">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Cake size={48} className="text-amber-800" />
            </div>
            <CardTitle className="text-2xl text-amber-800">Thaneya's Treats Admin Dashboard</CardTitle>
            <CardDescription>Manage orders and products</CardDescription>
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
                    {orders.map((order) => (
                      <Card key={order.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                              <div>
                                <h4 className="font-medium">Order #{order.id.substring(0, 8)}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Delivery: {new Date(order.delivery_date).toLocaleDateString()}
                                </p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'approved' ? 'bg-green-100 text-green-800' :
                                order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {order.status}
                              </span>
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
                <h3 className="text-xl font-semibold mb-4">Manage Products</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <Card key={product.id}>
                      <CardHeader>
                        <CardTitle>{product.name}</CardTitle>
                        <CardDescription>ID: {product.id}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Input
                          type="text"
                          value={product.name}
                          onChange={(e) => handleProductChange(product.id, 'name', e.target.value)}
                          placeholder="Product Name"
                        />
                        <Input
                          type="number"
                          value={product.price}
                          onChange={(e) => handleProductChange(product.id, 'price', parseFloat(e.target.value))}
                          placeholder="Price"
                        />
                        <Input
                          type="text"
                          value={product.description || ''}
                          onChange={(e) => handleProductChange(product.id, 'description', e.target.value)}
                          placeholder="Description"
                        />
                        <Button onClick={() => handleUpdateProduct(product.id)}>
                          Save Changes
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
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