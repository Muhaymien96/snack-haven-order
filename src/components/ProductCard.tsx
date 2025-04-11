import { ProductType } from '@/types';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useState } from 'react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Minus, Plus, ShoppingCart } from 'lucide-react';

type ProductCardProps = {
  product: ProductType;
  showActions?: boolean;
};

const ProductCard = ({ product, showActions = true }: ProductCardProps) => {
  const { addToCart } = useCart();

  const parsedFlavours = Array.isArray(product.flavours)
    ? product.flavours.map(f => f.trim()).filter(Boolean)
    : [];

  const [selectedFlavor, setSelectedFlavor] = useState<string | undefined>(
    parsedFlavours.length > 0 ? parsedFlavours[0] : undefined
  );

  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedFlavor);
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={product.image_url || '/placeholder.svg'}
          alt={product.name || 'Product'}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      <CardHeader className="flex-grow">
        <CardTitle className="text-xl text-earth">{product.name}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {parsedFlavours.length > 0 && (
            <span>Available in: {parsedFlavours.join(', ')}</span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <p className="text-lg font-semibold text-terracotta">
          R{(product.price ?? 0).toFixed(2)}
        </p>
      </CardContent>

      {showActions && (
        <CardFooter className="flex flex-col gap-2">
          {parsedFlavours.length > 0 && (
            <Select value={selectedFlavor} onValueChange={setSelectedFlavor}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select flavor" />
              </SelectTrigger>
              <SelectContent>
                {parsedFlavours.map((flavor) => (
                  <SelectItem key={flavor} value={flavor}>
                    {flavor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="flex items-center justify-between w-full border rounded-md overflow-hidden">
            <Button variant="ghost" size="icon" className="rounded-none" onClick={decrementQuantity}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-center flex-grow">{quantity}</span>
            <Button variant="ghost" size="icon" className="rounded-none" onClick={incrementQuantity}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

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
    </Card>
  );
};

export default ProductCard;
