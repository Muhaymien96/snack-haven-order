import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Calendar, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProductType } from '@/types';

const Landing = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check current session on load
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data?.session);
    };

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    checkSession();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, type, flavours, image_url')
        .limit(4);

      if (error) {
        console.error('Failed to load products:', error);
        toast.error('Failed to load products');
      } else {
        setProducts(data || []);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-cream py-16">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-earth mb-6">
            Authentic South African Snacks
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
            Delicious homemade treats delivered to your doorstep. From sweet Bollas to savory Samoosas.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-terracotta hover:bg-terracotta/90 text-white"
            >
              <Link to="/products">
                Browse Products <ShoppingBag className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-terracotta text-terracotta hover:bg-terracotta/10"
            >
              <Link to="/contact">
                Contact Us <MessageSquare className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-earth">Our Products</h2>
              <p className="text-muted-foreground mt-2">
                Traditional South African snacks made with love
              </p>
            </div>
            <Button
              asChild
              variant="link"
              className="text-terracotta"
            >
              <Link to="/products">
                View all products <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-sage/10">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-earth text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="text-center">
                <div className="mx-auto rounded-full w-12 h-12 flex items-center justify-center bg-terracotta/10 text-terracotta mb-4">
                  <ShoppingBag size={24} />
                </div>
                <CardTitle>1. Browse Products</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>
                  Explore our selection of authentic South African snacks and choose your favorites.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="text-center">
                <div className="mx-auto rounded-full w-12 h-12 flex items-center justify-center bg-terracotta/10 text-terracotta mb-4">
                  <Calendar size={24} />
                </div>
                <CardTitle>2. Select Delivery Date</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>
                  Regular orders are for Sundays. Special orders can be requested with advance notice.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader className="text-center">
                <div className="mx-auto rounded-full w-12 h-12 flex items-center justify-center bg-terracotta/10 text-terracotta mb-4">
                  <div className="font-bold text-xl">✓</div>
                </div>
                <CardTitle>3. Enjoy Your Treats</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>
                  Receive your freshly made South African delicacies and enjoy!
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {!isAuthenticated && (
        <section className="py-16 bg-sage text-white">
          <div className="container-custom text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Place an Order?</h2>
            <p className="mb-8 max-w-2xl mx-auto">
              Create an account to start ordering our delicious South African treats for delivery.
            </p>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-cream text-sage hover:bg-cream/10"
            >
              <Link to="/register">
                Register Now
              </Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};

export default Landing;
