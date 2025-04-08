
import { ProductType } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type ProductCardProps = {
  product: ProductType;
  onAddToCart?: (product: ProductType) => void;
  showActions?: boolean;
};

const ProductCard = ({ product, onAddToCart, showActions = true }: ProductCardProps) => {
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
    }
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
      {showActions && (
        <CardFooter>
          <Button 
            variant="default" 
            className="w-full bg-terracotta hover:bg-terracotta/90"
            onClick={handleAddToCart}
          >
            Add to Order
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ProductCard;
