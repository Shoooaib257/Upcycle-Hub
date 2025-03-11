import { useState } from "react";
import { Link } from "wouter";
import { Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useCart } from "@/lib/hooks/use-cart";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAddingToCart(true);
    try {
      await addToCart({
        productId: product.id,
        quantity: 1
      });
      toast({
        title: "Added to cart",
        description: `${product.title} has been added to your cart.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to cart. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-xl transition duration-300 h-full">
      <div className="relative">
        <Link href={`/products/${product.id}`}>
          <img 
            src={product.images[0]} 
            alt={product.title} 
            className="w-full h-64 object-cover"
          />
        </Link>
        {product.featured && (
          <div className="absolute top-0 left-0 m-2">
            <Badge className="bg-[#D17A50] hover:bg-[#B4683F]">Featured</Badge>
          </div>
        )}
        <button 
          className="absolute top-0 right-0 m-2 bg-white bg-opacity-80 p-2 rounded-full text-neutral-dark hover:text-[#D17A50] transition"
          aria-label="Add to favorites"
        >
          <Heart className="h-5 w-5" />
        </button>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/products/${product.id}`}>
            <h3 className="font-heading font-semibold text-lg leading-tight hover:text-primary transition">
              {product.title}
            </h3>
          </Link>
          <span className="font-heading font-bold text-[#D17A50]">${product.price}</span>
        </div>
        <p className="text-gray-600 text-sm mb-3">{product.description}</p>
        <div className="flex items-center mb-3 flex-wrap gap-2">
          <Badge variant="secondary" className="bg-secondary bg-opacity-30 text-primary rounded-full">
            {product.condition}
          </Badge>
          <Badge variant="secondary" className="bg-secondary bg-opacity-30 text-primary rounded-full">
            {product.category}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-1" />
            {product.location}
          </div>
          <Button 
            size="sm"
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="bg-primary hover:bg-primary-600 text-white font-medium px-4 py-1.5 rounded-full text-sm transition"
          >
            {isAddingToCart ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
