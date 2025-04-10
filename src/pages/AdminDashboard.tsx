import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import ProductManager from '../components/ProductManager';

export const ORDER_STATUSES = ['pending', 'processing', 'approved', 'rejected', 'completed'] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

type OrderItem = {
  quantity: number;
  products: {
    name: string;
  };
};

type Order = {
  id: string;
  order_date: string;
  status: OrderStatus;
  user_id: {
    name: string;
    surname: string;
    mobile: string;
  };
  order_items: OrderItem[];
};

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const checkAdminAndFetch = async () => {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('mobile')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) throw profileError;
        const isAdminUser = profile.mobile === '0662538342';
        setIsAdmin(isAdminUser);

        if (!isAdminUser) {
          toast.error('You do not have permission to access this page');
          navigate('/products');
          return;
        }

        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`id, order_date, status, user_id(name, surname, mobile), order_items(quantity, products(name))`)
          .order('order_date', { ascending: false });

        if (ordersError) throw ordersError;

        setOrders((ordersData as Order[]) || []);
      } catch (error: any) {
        console.error('Error checking admin or fetching orders:', error);
        toast.error('Failed to load admin data');
        navigate('/products');
      } finally {
        setLoadingOrders(false);
      }
    };

    checkAdminAndFetch();
  }, [user, loading, navigate]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast.success(`Order marked as ${newStatus}`);

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Failed to update order status');
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="products">Manage Products</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          {loadingOrders ? (
            <p>Loading orders...</p>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border rounded-lg p-4 bg-white shadow">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">Order #{order.id.substring(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        Date: {new Date(order.order_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Customer: {order.user_id?.name} {order.user_id?.surname} ({order.user_id?.mobile})
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'approved' ? 'bg-green-100 text-green-800' :
                      order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  {order.order_items?.length > 0 && (
                    <ul className="mt-2 text-sm list-disc pl-5">
                      {order.order_items.map((item, idx) => (
                        <li key={idx}>
                          {item.quantity} × {item.products.name}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-3 space-x-2">
                    {order.status === 'pending' && (
                      <>
                        <button
                          className="px-3 py-1 text-sm font-medium bg-green-600 text-white rounded"
                          onClick={() => handleUpdateOrderStatus(order.id, 'approved')}
                        >
                          Approve
                        </button>
                        <button
                          className="px-3 py-1 text-sm font-medium bg-red-600 text-white rounded"
                          onClick={() => handleUpdateOrderStatus(order.id, 'rejected')}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {order.status === 'approved' && (
                      <button
                        className="px-3 py-1 text-sm font-medium bg-blue-600 text-white rounded"
                        onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                      >
                        Mark as Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No orders found.</p>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <p className="text-muted-foreground">Coming soon: Sales data, total revenue, and more analytics.</p>
        </TabsContent>

        <TabsContent value="products">
          <ProductManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
