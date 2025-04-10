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
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '' });
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!user && !authLoading) {
      navigate('/login');
      return;
    }

    if (user && role === 'admin') {
      navigate('/admin');
    }

    const fetchData = async () => {
      try {
        const [{ data: ordersData, error: ordersError }, { data: productsData, error: productsError }] = await Promise.all([
          supabase.from('orders').select('*').order('created_at', { ascending: false }),
          supabase.from('products').select('*').order('created_at', { ascending: false })
        ]);

        if (ordersError || productsError) throw ordersError || productsError;

        setOrders(ordersData || []);
        setProducts(productsData || []);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error('Failed to load admin data');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    if (role === 'admin') {
      fetchData();
    }
  }, [user, role, authLoading, navigate]);

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
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
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

  const handleDeleteProduct = async (id) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Product deleted');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Could not delete product');
    }
  };

  const handleCreateProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast.error('Name and price required');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{ ...newProduct, price: parseFloat(newProduct.price), available: true }])
        .select(); // Ensures `data` is returned
  
      if (error || !data || data.length === 0) throw error || new Error('Insert failed');
  
      setProducts(prev => [data[0], ...prev]);
      setNewProduct({ name: '', price: '', description: '' });
      toast.success('Product created');
    } catch (error) {
      console.error('Create failed:', error);
      toast.error('Could not create product');
    }
  };
  

  const filteredOrders = orders.filter(order =>
    order.status.toLowerCase().includes(filter.toLowerCase()) ||
    order.id.toLowerCase().includes(filter.toLowerCase())
  );

  const handleExportOrders = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' +
      ['ID,Status,Delivery Date']
        .concat(filteredOrders.map(o => `${o.id},${o.status},${o.delivery_date}`))
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'orders.csv');
    document.body.appendChild(link);
    link.click();
  };

  if (authLoading || loading) {
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

  if (role !== 'admin') return null;

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
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Recent Orders</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Filter orders..."
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="max-w-xs"
                    />
                    <Button onClick={handleExportOrders}>Export CSV</Button>
                  </div>
                </div>
                {filteredOrders.length > 0 ? (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
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
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateOrderStatus(order.id, 'approved')}>Approve</Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleUpdateOrderStatus(order.id, 'rejected')}>Reject</Button>
                                </>
                              )}
                              {order.status === 'approved' && (
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleUpdateOrderStatus(order.id, 'completed')}>Mark as Completed</Button>
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
                <div className="mb-6 space-y-2">
                  <Input
                    placeholder="Product Name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    placeholder="Price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                  />
                  <Input
                    placeholder="Description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <Button onClick={handleCreateProduct}>Create Product</Button>
                </div>

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
                        <div className="flex gap-2">
                          <Button onClick={() => handleUpdateProduct(product.id)}>Save Changes</Button>
                          <Button variant="destructive" onClick={() => handleDeleteProduct(product.id)}>Delete</Button>
                        </div>
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
