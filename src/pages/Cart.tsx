
import { useEffect, useState } from 'react';
import { useCart, CartItemType } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash, ShoppingCart, ArrowRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { ProductType } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOrder } from '@/contexts/OrderContext';

const CartItem = ({ item }: { item: CartItemType }) => {
  const { updateQuantity, removeFromCart, updateFlavor } = useCart();
  const { product, quantity, flavor } = item;
  const { isSpecialOrder } = useOrder();
  const isMobile = useIsMobile();

  const parsedFlavours = Array.isArray(product.flavours)
    ? product.flavours.map(f => f.trim()).filter(Boolean)
    : [];

  const bulkOptions = isSpecialOrder ? [10, 20, 30, 40, 50] : [1, 2, 3, 4, 5];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center py-4 border-b gap-4">
      <div className="w-full sm:w-20 h-20 overflow-hidden rounded-md bg-muted shrink-0">
        <img 
          src={product.image_url || '/placeholder.svg'} 
          alt={product.name || 'Product'} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-grow">
        <h3 className="font-medium text-earth">{product.name}</h3>
        {flavor && <Badge variant="outline" className="mt-1">{flavor}</Badge>}
        
        {parsedFlavours.length > 0 && (
          <div className="mt-2 max-w-[180px]">
            <Select
              value={flavor}
              onValueChange={(value) => updateFlavor(product.id, value, flavor)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select flavor" />
              </SelectTrigger>
              <SelectContent>
                {parsedFlavours.map((f) => (
                  <SelectItem key={f} value={f} className="text-sm">
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <div className={`flex items-center ${isMobile ? 'mt-2 w-full justify-between' : 'ml-auto'}`}>
        <div className="flex items-center space-x-1">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => updateQuantity(product.id, quantity - 1, flavor)}
            disabled={quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          {isSpecialOrder ? (
            <Input 
              type="number" 
              min="1" 
              value={quantity} 
              onChange={e => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val > 0) {
                  updateQuantity(product.id, val, flavor);
                }
              }}
              className="w-16 h-8 text-center"
            />
          ) : (
            <span className="w-8 text-center">{quantity}</span>
          )}
          
          <Button 
            variant="outline" 
            size="icon"
            className="h-8 w-8" 
            onClick={() => updateQuantity(product.id, quantity + 1, flavor)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="flex items-center ml-4">
          <p className="font-medium text-terracotta mr-4">
            R{((product.price ?? 0) * quantity).toFixed(2)}
          </p>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive/80"
            onClick={() => removeFromCart(product.id, flavor)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const Cart = () => {
  const { cartItems, cartTotal, clearCart, cartCount } = useCart();
  const [productsData, setProductsData] = useState<ProductType[]>([]);
  const { isSpecialOrder } = useOrder();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, type, flavours, image_url');
    
      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProductsData(data as ProductType[]);
      }
    };

    fetchProducts();
  }, []);

  const enrichedCartItems = cartItems.map((item) => {
    const updatedProduct = productsData.find(p => p.id === item.product.id);
    return updatedProduct ? { ...item, product: updatedProduct } : item;
  });

  if (cartCount === 0) {
    return (
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold text-earth mb-8">Your Cart</h1>
        <div className="text-center py-12 bg-card rounded-lg border shadow-sm">
          <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added any items to your cart yet.
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

  return (
    <div className="container-custom py-8 md:py-12">
      <h1 className="text-3xl font-bold text-earth mb-4">Your Cart</h1>
      
      {isSpecialOrder && (
        <div className="mb-6 p-4 bg-sage/10 rounded-lg border border-sage/20">
          <h2 className="text-lg font-medium text-sage mb-1">Special Bulk Order</h2>
          <p className="text-sm text-muted-foreground">
            You're placing a special bulk order. Minimum quantities may apply.
          </p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-4">
            <p className="text-muted-foreground">
              {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
            </p>
            <Button 
              variant="ghost" 
              onClick={clearCart}
              className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
              size="sm"
            >
              <Trash className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          </div>

          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y">
                {enrichedCartItems.map((item, index) => (
                  <CartItem 
                    key={`${item.product.id}-${item.flavor || 'default'}-${index}`} 
                    item={item} 
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6">
            <Link to="/products">
              <Button variant="outline" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        <div className={`${isMobile ? 'w-full' : 'w-80'}`}>
          <div className="sticky top-4">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>R{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <Badge variant="outline" className="text-terracotta">Free</Badge>
                  </div>
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-terracotta">R{cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Link to="/checkout">
                  <Button className="w-full bg-terracotta hover:bg-terracotta/90">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
