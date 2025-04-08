
import { useCart, CartItemType } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash, ShoppingCart, ArrowRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CartItem = ({ item }: { item: CartItemType }) => {
  const { updateQuantity, removeFromCart, updateFlavor } = useCart();
  const { product, quantity, flavor } = item;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center py-4 border-b">
      <div className="w-full sm:w-20 h-20 mr-4 mb-4 sm:mb-0 overflow-hidden rounded-md bg-muted">
        <img 
          src={product.image || '/placeholder.svg'} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-grow mr-4">
        <h3 className="font-medium">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{product.description.substring(0, 60)}...</p>
        {product.flavors && product.flavors.length > 0 && (
          <div className="mt-2">
            <Select
              value={flavor}
              onValueChange={(value) => updateFlavor(product.id, value)}
            >
              <SelectTrigger className="w-full max-w-[180px]">
                <SelectValue placeholder="Select flavor" />
              </SelectTrigger>
              <SelectContent>
                {product.flavors.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="flex items-center space-x-2 mt-4 sm:mt-0">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => updateQuantity(product.id, quantity - 1)}
          disabled={quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-8 text-center">{quantity}</span>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => updateQuantity(product.id, quantity + 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center mt-4 sm:mt-0 ml-0 sm:ml-6">
        <p className="font-medium mr-4">R{(product.price * quantity).toFixed(2)}</p>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => removeFromCart(product.id)}
          className="text-destructive"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const Cart = () => {
  const { cartItems, cartTotal, clearCart, cartCount } = useCart();

  if (cartCount === 0) {
    return (
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold text-earth mb-8">Your Cart</h1>
        <div className="text-center py-12">
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
    <div className="container-custom py-12">
      <h1 className="text-3xl font-bold text-earth mb-8">Your Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-4">
            <p className="text-muted-foreground">
              {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
            </p>
            <Button 
              variant="ghost" 
              onClick={clearCart}
              className="text-destructive"
            >
              <Trash className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          </div>
          
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <div className="p-6">
              {cartItems.map((item) => (
                <CartItem key={`${item.product.id}-${item.flavor || 'default'}`} item={item} />
              ))}
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-80">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
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
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>R{cartTotal.toFixed(2)}</span>
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
  );
};

export default Cart;
