
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductType } from '@/types';
import { toast } from '@/hooks/use-toast';

export type CartItemType = {
  product: ProductType;
  quantity: number;
  flavor?: string;
  isSpecialOrder?: boolean;
};

type CartContextType = {
  cartItems: CartItemType[];
  addToCart: (product: ProductType, quantity?: number, flavor?: string, isSpecialOrder?: boolean) => void;
  removeFromCart: (productId: string, flavor?: string) => void;
  updateQuantity: (productId: string, quantity: number, flavor?: string) => void;
  updateFlavor: (productId: string, flavor: string, oldFlavor?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse saved cart', error);
      }
    }
  }, []);

  // Update localStorage and totals whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    setCartTotal(total);
    
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    setCartCount(count);
  }, [cartItems]);

  const addToCart = (product: ProductType, quantity = 1, flavor?: string, isSpecialOrder?: boolean) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.product.id === product.id && 
                  (product.flavours ? item.flavor === flavor : true)
      );

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        toast({
          title: "Cart updated",
          description: `${product.name} quantity increased to ${newItems[existingItemIndex].quantity}`,
        });
        return newItems;
      } else {
        // Add new item
        toast({
          title: "Added to cart",
          description: `${quantity} × ${product.name} added to your cart`,
        });
        return [...prevItems, { product, quantity, flavor, isSpecialOrder }];
      }
    });
  };

  const removeFromCart = (productId: string, flavor?: string) => {
    setCartItems((prevItems) => {
      const itemIndex = prevItems.findIndex(
        item => item.product.id === productId && 
        (item.product.flavours ? item.flavor === flavor : true)
      );
      
      if (itemIndex !== -1) {
        const removedItem = prevItems[itemIndex];
        toast({
          title: "Item removed",
          description: `${removedItem.product.name} removed from your cart`,
        });
        
        return prevItems.filter((_, index) => index !== itemIndex);
      }
      
      return prevItems;
    });
  };

  const updateQuantity = (productId: string, quantity: number, flavor?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, flavor);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId && 
        (item.product.flavours ? item.flavor === flavor : true) 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const updateFlavor = (productId: string, flavor: string, oldFlavor?: string) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => 
          item.product.id === productId && 
          (oldFlavor ? item.flavor === oldFlavor : item.flavor === undefined)
      );

      if (existingItemIndex === -1) return prevItems;

      const newItems = [...prevItems];
      newItems[existingItemIndex] = { ...newItems[existingItemIndex], flavor };
      
      return newItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateFlavor,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
