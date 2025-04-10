import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';
import OrderTypeSelector from '@/components/OrderTypeSelector';
import { useOrder } from '@/contexts/OrderContext';

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { cartCount } = useCart();
  const { deliveryDate } = useOrder();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) console.error('Error fetching products:', error);
      else setProducts(data || []);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const categories = [...new Set(products.map(product => product.type))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.flavours?.toLowerCase?.().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory ? product.type === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container-custom py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-earth">Our Products</h1>
          <p className="text-muted-foreground mt-1">Handcrafted with love in Gordons Bay, Cape Town</p>
        </div>

        <Link to="/cart">
          <Button variant="outline" className="mt-4 md:mt-0 relative">
            <ShoppingCart className="h-5 w-5 mr-2" />
            View Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-terracotta text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>
        </Link>
      </div>

      <OrderTypeSelector />

      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedCategory === null ? 'default' : 'outline'}
            className={`cursor-pointer ${selectedCategory === null ? 'bg-terracotta hover:bg-terracotta/90' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Badge>

          {categories.map(category => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className={`cursor-pointer ${selectedCategory === category ? 'bg-terracotta hover:bg-terracotta/90' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Badge>
          ))}
        </div>
      </div>

      {cartCount > 0 && deliveryDate && (
        <div className="mb-8">
          <Link to="/checkout">
            <Button className="w-full bg-terracotta hover:bg-terracotta/90">
              Proceed to Checkout
            </Button>
          </Link>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading products...</div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Products;
