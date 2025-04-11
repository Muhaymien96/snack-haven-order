
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import OrderTypeSelector from '@/components/OrderTypeSelector';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useOrder } from '@/contexts/OrderContext';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Filter, Search, Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { cartCount } = useCart();
  const { deliveryDate, isSpecialOrder } = useOrder();
  const isMobile = useIsMobile();

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

  const categories = [...new Set(products.map(product => product.type))];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !activeCategory || product.type === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="container-custom py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-48 bg-muted rounded mb-4"></div>
            <div className="h-4 w-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-6 md:py-10 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-earth mb-2">Place Your Order</h2>
        <p className="text-muted-foreground">
          Order delicious treats in {isSpecialOrder ? 'special bulk' : 'regular'} quantities 
          for delivery in Gordons Bay, Cape Town
        </p>
      </div>

      {/* Order Type Selector */}
      <div className="max-w-2xl mx-auto bg-card rounded-lg border p-4 shadow-sm">
        <OrderTypeSelector />
      </div>

      {/* Search and filter section */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Categories on desktop */}
        {!isMobile && categories.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant={!activeCategory ? "default" : "outline"}
              className={!activeCategory ? "bg-terracotta hover:bg-terracotta/90" : ""}
              onClick={() => setActiveCategory(null)}
            >
              All
            </Button>
            {categories.map(cat => (
              <Button 
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                className={activeCategory === cat ? "bg-terracotta hover:bg-terracotta/90" : ""}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        )}
      </div>
      
      {/* Mobile categories tabs */}
      {isMobile && categories.length > 1 && (
        <Tabs defaultValue={activeCategory || "all"} className="w-full" onValueChange={(value) => setActiveCategory(value === "all" ? null : value)}>
          <TabsList className="w-full overflow-x-auto flex flex-nowrap justify-start px-1">
            <TabsTrigger value="all" className="flex-shrink-0">All</TabsTrigger>
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat} className="flex-shrink-0">{cat}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Proceed to Checkout button */}
      {cartCount > 0 && deliveryDate && (
        <div className="sticky top-4 z-10 max-w-md mx-auto">
          <Link to="/checkout" className="block">
            <Button className="w-full bg-terracotta hover:bg-terracotta/90 shadow-md">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Proceed to Checkout
              <Badge variant="outline" className="ml-2 bg-white text-terracotta">
                {cartCount}
              </Badge>
            </Button>
          </Link>
        </div>
      )}

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
        
        {/* Coming Soon Card for Cake */}
        <Card className="h-full flex flex-col overflow-hidden bg-gradient-to-b from-sage/10 to-sage/20 border-dashed border-sage">
          <div className="aspect-square overflow-hidden bg-gradient-to-b from-muted/30 to-muted/10 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-sage/20 flex items-center justify-center">
                <Plus className="h-8 w-8 text-sage" />
              </div>
              <h3 className="text-xl font-semibold text-sage">Cake</h3>
              <p className="text-muted-foreground mt-2">Coming Soon</p>
            </div>
          </div>
          <CardHeader className="flex-grow">
            <CardTitle className="text-xl text-sage">Delicious Cakes</CardTitle>
            <CardDescription>
              Our new cake selection will be available soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full border-sage text-sage" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-muted/20 rounded-lg">
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default Products;
