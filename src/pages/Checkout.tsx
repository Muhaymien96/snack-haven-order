
import { useEffect, useState } from 'react';
import { sendAdminSmsNotification } from '@/lib/twilio';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { createOrder, getCurrentUser } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Check, ShoppingCart, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOrder } from '@/contexts/OrderContext';

const formSchema = z.object({
  specialInstructions: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const Checkout = () => {
  const { cartItems, cartTotal, clearCart, cartCount } = useCart();
  const { isSpecialOrder, deliveryDate } = useOrder();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      specialInstructions: '',
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { user, error } = await getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
        setUserId(user.id);
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const onSubmit = async (values: FormValues) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to complete your order",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
  
    if (cartItems.length === 0) {
      toast({
        title: "Empty cart",
        description: "Your cart is empty. Please add some items before checkout.",
        variant: "destructive",
      });
      return;
    }
  
    if (!deliveryDate) {
      toast({
        title: "Delivery date required",
        description: "Please select a delivery date for your order.",
        variant: "destructive",
      });
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const formattedDeliveryDate = new Date(deliveryDate).toISOString().split('T')[0]; // yyyy-mm-dd
  
      const orderData = {
        user_id: userId!,
        order_date: new Date().toISOString(),
        delivery_date: formattedDeliveryDate,
        is_special_order: isSpecialOrder,
        special_instructions: values.specialInstructions,
        total: cartTotal,
        items: cartItems.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          flavor: item.flavor,
          price: item.product.price,
        })),
      };
  
      console.log("Submitting order:", orderData);
  
      const { data, error } = await createOrder(orderData);

      if (error) {
        throw new Error(error.message);
      }
      
      // 🔁 Fetch user's block/unit number from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('block_number, unit_number')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('Failed to fetch user profile for Twilio:', profileError);
      } else {
        // ✅ Send WhatsApp notification using frontend logic
        const { block_number, unit_number } = profile;
        await sendAdminSmsNotification({
          message: `New order placed! Block: ${block_number}, Unit: ${unit_number}, Delivery: ${deliveryDate}`,
        });
      
      }
      // ✅ Send order confirmation to the user      
  
      clearCart();
  
      toast({
        title: "Order placed!",
        description: `Your order #${data.id} has been placed successfully`,
      });
  
      navigate('/');
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast({
        title: "Order failed",
        description: error.message || "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  

  if (cartCount === 0) {
    return (
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold text-earth mb-8">Checkout</h1>
        <div className="text-center py-12">
          <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            You need to add some items to your cart before checking out.
          </p>
          <Link to="/products">
            <Button className="bg-terracotta hover:bg-terracotta/90">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold text-earth mb-8">Checkout</h1>
        <div className="text-center py-12 bg-card rounded-lg border shadow-sm">
          <AlertCircle className="mx-auto h-16 w-16 text-terracotta mb-4" />
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-6 mx-auto max-w-md">
            You need to be logged in to complete your purchase. Please log in or register to continue.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login">
              <Button className="bg-terracotta hover:bg-terracotta/90 w-full sm:w-auto">
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" className="w-full sm:w-auto">
                Register
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!deliveryDate) {
    return (
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold text-earth mb-8">Checkout</h1>
        <div className="text-center py-12 bg-card rounded-lg border shadow-sm">
          <AlertCircle className="mx-auto h-16 w-16 text-terracotta mb-4" />
          <h2 className="text-xl font-semibold mb-2">Delivery Date Required</h2>
          <p className="text-muted-foreground mb-6 mx-auto max-w-md">
            Please select a delivery date for your order on the products page.
          </p>
          <Link to="/products">
            <Button className="bg-terracotta hover:bg-terracotta/90">
              Go to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-bold text-earth mb-8">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-grow">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-card rounded-lg border shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
                
                <div className="mb-4">
                  <h3 className="font-medium">Order Type</h3>
                  <p className="text-sm text-muted-foreground">
                    {isSpecialOrder ? 'Special Order' : 'Regular Sunday Order'}
                  </p>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-medium">Delivery Date</h3>
                  <p className="text-sm">
                    {new Date(deliveryDate).toLocaleDateString('en-ZA', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                
                {isSpecialOrder && (
                  <FormField
                    control={form.control}
                    name="specialInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Instructions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter any special instructions for your order"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              <div className="bg-card rounded-lg border shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Order Review</h2>
                
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={`${item.product.id}-${item.flavor || 'default'}`} className="flex justify-between pb-2 border-b">
                      <div>
                        <p className="font-medium">{item.product.name} × {item.quantity}</p>
                        {item.flavor && <p className="text-sm text-muted-foreground">Flavor: {item.flavor}</p>}
                      </div>
                      <p className="font-medium">R{(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>R{cartTotal.toFixed(2)}</span>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-terracotta hover:bg-terracotta/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Place Order'}
                {!isSubmitting && <Check className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </Form>
        </div>
        
        <div className="w-full lg:w-80">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items ({cartCount})</span>
                  <span>R{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <Badge variant="outline" className="text-terracotta">Free</Badge>
                </div>
              </div>
              
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>R{cartTotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  By placing your order, you agree to our terms and conditions.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 pt-0">
              <div className="flex items-center text-sm">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>Free delivery within the security complex</span>
              </div>
              <div className="flex items-center text-sm">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span>Fresh, homemade products</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
