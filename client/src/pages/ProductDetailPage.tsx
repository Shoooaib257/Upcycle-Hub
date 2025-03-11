import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Product, User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, ShoppingCart, Tag, Truck, Award } from "lucide-react";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import Rating from "@/components/ui/rating";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();

  // Fetch product data
  const { data: product, isLoading: isProductLoading, isError: isProductError, error: productError } = useQuery({
    queryKey: [`/api/products/${id}`],
  });

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: ({ queryKey }) => fetch(queryKey[0], { credentials: 'include' }).then(r => r.ok ? r.json() : null),
  });

  // Fetch seller info (simplified for now)
  const { data: seller, isLoading: isSellerLoading } = useQuery({
    queryKey: [`/api/users/${product?.sellerId}`],
    queryFn: () => {
      // In a full implementation, we would fetch from an actual endpoint
      // For now, create a simple placeholder
      return Promise.resolve({
        id: product?.sellerId,
        username: `Seller${product?.sellerId}`,
        avatar: `https://ui-avatars.com/api/?name=S${product?.sellerId}&background=random`
      });
    },
    enabled: !!product?.sellerId,
  });

  // Handle quantity changes
  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to your cart",
        variant: "destructive",
      });
      navigate("/signin");
      return;
    }

    try {
      await apiRequest("POST", "/api/cart/items", {
        productId: product.id,
        quantity,
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

  // Handle Buy Now
  const handleBuyNow = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to buy this item",
        variant: "destructive",
      });
      navigate("/signin");
      return;
    }

    try {
      await apiRequest("POST", "/api/cart/items", {
        productId: product.id,
        quantity,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      navigate("/checkout");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your request",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (isProductLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="w-full h-[500px] rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-32 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isProductError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {productError instanceof Error ? productError.message : "Failed to load product details"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <ProductImageGallery 
          mainImage={product.imageUrl} 
          additionalImages={product.additionalImages} 
        />

        {/* Product Details */}
        <div>
          <h1 className="font-heading font-bold text-3xl mb-2">{product.name}</h1>
          
          <div className="flex items-center gap-2 mb-4">
            <Rating value={product.rating} size="md" />
            <span className="text-sm text-gray-500">({product.reviewCount} reviews)</span>
          </div>
          
          <div className="text-2xl font-heading font-bold text-accent mb-6">
            ${product.price.toFixed(2)}
          </div>
          
          <p className="text-gray-700 mb-6">{product.description}</p>

          <div className="flex items-center gap-2 mb-8">
            <div className="border border-gray-300 rounded-md flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="h-10 w-10"
              >
                -
              </Button>
              <span className="w-10 text-center">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={incrementQuantity}
                className="h-10 w-10"
              >
                +
              </Button>
            </div>
            
            <Button
              onClick={handleAddToCart}
              className="flex items-center gap-2"
            >
              <ShoppingCart size={18} />
              Add to Cart
            </Button>
            
            <Button
              onClick={handleBuyNow}
              className="bg-accent text-white hover:bg-opacity-90"
            >
              Buy Now
            </Button>
          </div>

          <Separator className="my-6" />

          {/* Product Attributes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Tag size={18} className="text-primary" />
              <span className="text-sm">Category: {getCategoryLabel(product.category)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-primary" />
              <span className="text-sm">Free Shipping</span>
            </div>
            {product.featured && (
              <div className="flex items-center gap-2">
                <Award size={18} className="text-accent" />
                <span className="text-sm">Featured Product</span>
              </div>
            )}
          </div>

          {/* Seller Information */}
          <Card className="bg-neutral border-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {isSellerLoading ? (
                  <Skeleton className="h-12 w-12 rounded-full" />
                ) : (
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={seller?.avatar} alt={seller?.username} />
                    <AvatarFallback>{seller?.username?.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <h3 className="font-heading font-semibold">
                    {isSellerLoading ? <Skeleton className="h-5 w-24" /> : seller?.username}
                  </h3>
                  <p className="text-sm text-gray-500">Upcycling Artist</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Environmental Impact Section */}
      <div className="mt-16">
        <h2 className="font-heading font-bold text-2xl mb-6 text-center">Environmental Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white shadow-md">
            <CardContent className="p-6 text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading font-semibold mb-2">Reduced Carbon Footprint</h3>
              <p className="text-gray-600 text-sm">
                This upcycled product helps reduce landfill waste and minimizes the need for new raw materials.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-md">
            <CardContent className="p-6 text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                <RecycleIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading font-semibold mb-2">Materials Given New Life</h3>
              <p className="text-gray-600 text-sm">
                By purchasing this item, you're extending the lifecycle of materials that would otherwise be discarded.
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-md">
            <CardContent className="p-6 text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                <HeartIcon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading font-semibold mb-2">Supporting Sustainable Creators</h3>
              <p className="text-gray-600 text-sm">
                Your purchase directly supports artisans committed to sustainable practices and creativity.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper components
function RecycleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
      <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" />
      <path d="m14 16-3 3 3 3" />
      <path d="M8.293 13.596 7.196 9.5 3.1 10.598" />
      <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843" />
      <path d="m13.378 9.633 4.096 1.098 1.097-4.096" />
    </svg>
  );
}

function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

// Helper function to get category label
function getCategoryLabel(category: string): string {
  const categoryLabels: Record<string, string> = {
    'furniture': 'Furniture',
    'home_decor': 'Home Decor',
    'fashion': 'Fashion',
    'jewelry': 'Jewelry',
    'garden': 'Garden',
    'art': 'Art',
    'other': 'Other',
  };

  return categoryLabels[category] || category;
}
