
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import ProductManager from '../components/ProductManager';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  X, 
  Clock, 
  Package, 
  CreditCard, 
  Calendar, 
  User, 
  ShoppingBag,
  Phone
} from 'lucide-react';

export const ORDER_STATUSES = ['pending', 'processing', 'approved', 'rejected', 'completed'] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

type OrderItem = {
  id: string;
  quantity: number;
  flavor?: string;
  price: number;
  product_name: string;
};

type Order = {
  id: string;
  order_date: string;
  status: OrderStatus;
  delivery_date: string;
  total: number;
  is_special_order: boolean;
  special_instructions?: string;
  payment_method?: string;
  user_id: {
    name: string;
    surname: string;
    mobile: string;
    block_number: number;
    unit_number: number;
  };
  order_items: OrderItem[];
};

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

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
          .select(`
            id, 
            order_date, 
            status, 
            delivery_date,
            total,
            is_special_order,
            special_instructions,
            payment_method,
            user_id(name, surname, mobile, block_number, unit_number), 
            order_items(id, quantity, flavor, price, product_name)
          `)
          .order('order_date', { ascending: false });

        if (ordersError) {
          console.error('Error fetching orders:', ordersError);
          toast.error('Failed to load orders');
          return;
        }

        // Only set orders if data was returned and is not an error
        if (ordersData) {
          setOrders(ordersData as Order[]);
        }
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

  const getStatusBadge = (status: OrderStatus) => {
    switch(status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      case 'completed':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
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
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-terracotta" />
                        <p className="font-medium">Order #{order.id.substring(0, 8)}</p>
                        {getStatusBadge(order.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Order Date: {new Date(order.order_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Delivery Date: {new Date(order.delivery_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-4 w-4 mr-2" />
                          <span>
                            {order.user_id?.name} {order.user_id?.surname}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{order.user_id?.mobile}</span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Package className="h-4 w-4 mr-2" />
                          <span>
                            Block {order.user_id?.block_number}, Unit {order.user_id?.unit_number}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CreditCard className="h-4 w-4 mr-2" />
                          <span>
                            Payment: {order.payment_method === 'cod' ? 'Cash on Delivery' : 'EFT'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-lg font-semibold text-terracotta">
                        R{order.total?.toFixed(2)}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleOrderExpand(order.id)}
                        className="text-xs"
                      >
                        {expandedOrderId === order.id ? 'Hide Details' : 'View Details'}
                      </Button>
                    </div>
                  </div>

                  {expandedOrderId === order.id && (
                    <div className="mt-4 border-t pt-4">
                      <h3 className="font-medium mb-2">Order Items</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          {order.order_items?.map((item) => (
                            <div key={item.id} className="flex justify-between border-b pb-2">
                              <div>
                                <span className="font-medium">{item.product_name}</span>
                                {item.flavor && (
                                  <span className="text-sm text-muted-foreground ml-2">
                                    ({item.flavor})
                                  </span>
                                )}
                                <div className="text-sm text-muted-foreground">
                                  {item.quantity} × R{item.price?.toFixed(2)}
                                </div>
                              </div>
                              <div className="font-medium">
                                R{(item.quantity * (item.price || 0)).toFixed(2)}
                              </div>
                            </div>
                          ))}
                          <div className="flex justify-between pt-2 font-medium">
                            <span>Total</span>
                            <span>R{order.total?.toFixed(2)}</span>
                          </div>
                        </div>
                        <div>
                          {order.is_special_order && (
                            <div className="mb-3">
                              <h4 className="text-sm font-medium mb-1">Special Order</h4>
                              {order.special_instructions ? (
                                <p className="text-sm p-2 bg-gray-50 rounded border">
                                  {order.special_instructions}
                                </p>
                              ) : (
                                <p className="text-sm text-muted-foreground italic">
                                  No special instructions provided
                                </p>
                              )}
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-2 mt-4">
                            {order.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleUpdateOrderStatus(order.id, 'approved')}
                                >
                                  <Check className="mr-1 h-4 w-4" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleUpdateOrderStatus(order.id, 'rejected')}
                                >
                                  <X className="mr-1 h-4 w-4" />
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
                                <Check className="mr-1 h-4 w-4" />
                                Mark as Completed
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
