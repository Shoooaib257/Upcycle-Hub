import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product, User } from "@shared/schema";
import Rating from "@/components/ui/rating";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface ProductCardProps {
  product: Product;
  sellerInfo?: User;
  currentUser?: User | null;
}

export default function ProductCard({ product, sellerInfo, currentUser }: ProductCardProps) {
  const { toast } = useToast();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUser) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your cart",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await apiRequest("POST", "/api/cart/items", {
        productId: product.id,
        quantity: 1,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };
  
  const sellerName = sellerInfo ? sellerInfo.username : "Eco Seller";
  const sellerAvatar = sellerInfo?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sellerName)}&background=random`;

  return (
    <Card className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition group">
      <Link href={`/products/${product.id}`}>
        <div className="relative">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-64 object-cover"
          />
          {product.featured && (
            <div className="absolute top-0 right-0 bg-accent text-white m-2 px-2 py-1 text-xs rounded-full">
              Featured
            </div>
          )}
          {product.isNew && (
            <div className="absolute top-0 right-0 bg-secondary text-white m-2 px-2 py-1 text-xs rounded-full">
              New
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button 
              variant="outline" 
              size="icon" 
              className="bg-white text-primary p-2 rounded-full mx-1 hover:bg-primary hover:text-white transition"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toast({
                  title: "Added to wishlist",
                  description: `${product.name} has been added to your wishlist.`,
                });
              }}
            >
              <Heart size={18} />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="bg-white text-primary p-2 rounded-full mx-1 hover:bg-primary hover:text-white transition"
              onClick={handleAddToCart}
            >
              <ShoppingCart size={18} />
            </Button>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-heading font-semibold text-lg">{product.name}</h3>
            <span className="font-heading font-bold text-accent">${product.price.toFixed(2)}</span>
          </div>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={sellerAvatar} alt={sellerName} />
                <AvatarFallback>{sellerName.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-500">{sellerName}</span>
            </div>
            <div className="flex items-center">
              <Rating value={product.rating} />
              <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
