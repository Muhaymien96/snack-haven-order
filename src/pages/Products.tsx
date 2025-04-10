import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';  // search input
// ... other imports (if any)

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        setProducts(data || []);
      } catch (error: any) {
        console.error('Error fetching products:', error);
        // Optionally show a toast or alert for error
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = [...new Set(products.map(product => product.category))];
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    // If needed, add additional filtering logic
    return matchesSearch;
  });

  if (loading) {
    return <p className="text-center py-10">Loading products...</p>;
  }

  return (
    <div className="container-custom py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Products</h2>
      {/* Search input */}
      <div className="max-w-sm mx-auto mb-6">
        <Input 
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      {/* Product categories filter (if needed) */}
      {categories.length > 1 && (
        <div className="flex justify-center space-x-4 mb-8">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => {/* handle category filter if implemented */}} 
              className="text-sm px-3 py-1 rounded border">
              {cat}
            </button>
          ))}
        </div>
      )}
      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {filteredProducts.length === 0 && (
        <p className="text-center text-muted-foreground mt-4">No products found.</p>
      )}
    </div>
  );
};

export default Products;
