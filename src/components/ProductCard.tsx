
import { ProductType } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, ShoppingCart } from 'lucide-react';

type ProductCardProps = {
  product: ProductType;
  showActions?: boolean;
};

const ProductCard = ({ product, showActions = true }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [selectedFlavor, setSelectedFlavor] = useState<string | undefined>(
    product.flavors && product.flavors.length > 0 ? product.flavors[0] : undefined
  );

  const handleAddToCart = () => {
    addToCart(product, 1, selectedFlavor);
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="aspect-square overflow-hidden bg-muted">
        <img 
          src={product.image || '/placeholder.svg'} 
          alt={product.name} 
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardHeader className="flex-grow">
        <CardTitle className="text-xl text-earth">{product.name}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {product.flavors && product.flavors.length > 0 ? (
            <span>Available in: {product.flavors.join(', ')}</span>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold text-terracotta">R{product.price.toFixed(2)}</p>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{product.description}</p>
      </CardContent>
      {showActions && product.available && (
        <CardFooter className="flex flex-col gap-2">
          {product.flavors && product.flavors.length > 0 && (
            <Select
              value={selectedFlavor}
              onValueChange={setSelectedFlavor}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select flavor" />
              </SelectTrigger>
              <SelectContent>
                {product.flavors.map((flavor) => (
                  <SelectItem key={flavor} value={flavor}>
                    {flavor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button 
            variant="default" 
            className="w-full bg-terracotta hover:bg-terracotta/90"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </CardFooter>
      )}
      {!product.available && (
        <CardFooter>
          <p className="w-full text-center text-muted-foreground">Currently unavailable</p>
        </CardFooter>
      )}
    </Card>
  );
};

export default ProductCard;
