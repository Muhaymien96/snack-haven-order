
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from '@/components/ui/input';
import { ShoppingCart, Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOrder } from '@/contexts/OrderContext';

type ProductCardProps = {
  product: ProductType;
  showActions?: boolean;
};

const ProductCard = ({ product, showActions = true }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isSpecialOrder } = useOrder();
  const isMobile = useIsMobile();

  const parsedFlavours = Array.isArray(product.flavours)
    ? product.flavours.map(f => f.trim()).filter(Boolean)
    : [];

  const [selectedFlavor, setSelectedFlavor] = useState<string | undefined>(
    parsedFlavours.length > 0 ? parsedFlavours[0] : undefined
  );

  const [quantity, setQuantity] = useState(1);
  const [customQuantity, setCustomQuantity] = useState("");

  const handleAddToCart = () => {
    const finalQuantity = customQuantity ? parseInt(customQuantity, 10) : quantity;
    if (finalQuantity > 0 && !isNaN(finalQuantity)) {
      // Use the product name with flavor for "Bolla" products if coconut is selected
      let productToAdd = {...product};
      if (selectedFlavor === 'Coconut' && product.name.toLowerCase().includes('bolla')) {
        productToAdd = {
          ...product,
          name: 'Coconut Bolla'
        };
      }
      
      addToCart(productToAdd, finalQuantity, selectedFlavor);
    }
  };

  const bulkOptions = isSpecialOrder ? [10, 20, 30, 40, 50] : [1, 2, 3, 4, 5];
  const displayQuantity = customQuantity ? parseInt(customQuantity, 10) : quantity;

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 border-transparent hover:border-terracotta/20">
      <div className="aspect-square overflow-hidden bg-gradient-to-b from-muted/50 to-muted">
        <img
          src={product.image_url || '/placeholder.svg'}
          alt={product.name || 'Product'}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      <CardHeader className="flex-grow space-y-2 pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl text-earth">{product.name}</CardTitle>
          <span className="text-lg font-semibold text-terracotta">
            R{(product.price ?? 0).toFixed(2)}
          </span>
        </div>
        {parsedFlavours.length > 0 && (
          <CardDescription className="text-muted-foreground">
            Available in {parsedFlavours.length} flavors
          </CardDescription>
        )}
      </CardHeader>

      {showActions && (
        <CardContent className="pt-0">
          {parsedFlavours.length > 0 && (
            <Select value={selectedFlavor} onValueChange={setSelectedFlavor}>
              <SelectTrigger className="w-full mb-3">
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

          {isSpecialOrder ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {bulkOptions.map((option) => (
                  <Button
                    key={option}
                    variant={quantity === option ? "default" : "outline"}
                    className={`${quantity === option ? "bg-terracotta hover:bg-terracotta/90" : ""}`}
                    onClick={() => {
                      setQuantity(option);
                      setCustomQuantity("");
                    }}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  placeholder="Custom quantity"
                  value={customQuantity}
                  onChange={(e) => {
                    setCustomQuantity(e.target.value);
                    setQuantity(0);
                  }}
                  className="flex-1"
                />
                <Button
                  variant="default"
                  className="bg-terracotta hover:bg-terracotta/90 flex-shrink-0"
                  onClick={handleAddToCart}
                  title="Add to Cart"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="ml-1">{displayQuantity}</span>
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="default"
              className="w-full bg-terracotta hover:bg-terracotta/90"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart ({displayQuantity})
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ProductCard;
