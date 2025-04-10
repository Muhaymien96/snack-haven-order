import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import OrderTypeSelector from '@/components/OrderTypeSelector';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useOrder } from '@/contexts/OrderContext';
import { Link } from 'react-router-dom';

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const { cartCount } = useCart();
  const { deliveryDate } = useOrder();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        setProducts(data || []);
      } catch (error: any) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = [...new Set(products.map(product => product.category))];
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return <p className="text-center py-10">Loading products...</p>;
  }

  return (
    <div className="container-custom py-10 space-y-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-earth mb-2">Place Your Order</h2>
        <p className="text-muted-foreground">Select a delivery date and order type before browsing products</p>
      </div>

      {/* Order Type Selector */}
      <div className="max-w-2xl mx-auto">
        <OrderTypeSelector />
      </div>

      {/* Search input */}
      <div className="max-w-sm mx-auto">
        <Input 
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category filter (optional) */}
      {categories.length > 1 && (
        <div className="flex justify-center flex-wrap gap-2 mb-2">
          {categories.map(cat => (
            <button 
              key={cat}
              className="px-3 py-1 text-sm border rounded hover:bg-muted-foreground/10 transition"
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Proceed to Checkout button */}
      {cartCount > 0 && deliveryDate && (
        <div className="max-w-md mx-auto">
          <Link to="/checkout">
            <Button className="w-full bg-terracotta hover:bg-terracotta/90">
              Proceed to Checkout
            </Button>
          </Link>
        </div>
      )}

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p className="text-center text-muted-foreground mt-6">No products found.</p>
      )}
    </div>
  );
};

export default Products;
