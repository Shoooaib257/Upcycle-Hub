import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Heart, 
  Share2, 
  MapPin, 
  ChevronLeft,
  Truck,
  ShieldCheck,
  CircleUser
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useCart } from "@/lib/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Product } from "@shared/schema";

const ProductDetailPage = () => {
  const [match, params] = useRoute("/products/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const { data: product, isLoading, isError } = useQuery<Product>({
    queryKey: [`/api/products/${params?.id}`],
    enabled: Boolean(params?.id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (!match) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-96 rounded"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-10 bg-gray-200 rounded w-1/2 mt-8"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-heading font-bold mb-4">Product Not Found</h2>
        <p className="mb-8">Sorry, we couldn't find the product you're looking for.</p>
        <Button onClick={() => navigate("/products")}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </div>
    );
  }

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      await addToCart({
        productId: product.id,
        quantity
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
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <button onClick={() => navigate("/products")} className="flex items-center hover:text-primary transition">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Products
        </button>
        <span className="mx-2">/</span>
        <span>{product.category}</span>
        <span className="mx-2">/</span>
        <span className="text-gray-700 font-medium">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <Carousel className="w-full">
            <CarouselContent>
              {product.images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="rounded-lg overflow-hidden bg-white">
                    <img 
                      src={image} 
                      alt={`${product.title} - image ${index + 1}`} 
                      className="w-full h-[400px] object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        {/* Product Details */}
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-heading font-bold text-[#433422] mb-2">{product.title}</h1>
              <p className="text-2xl font-heading font-bold text-[#D17A50] mb-4">${product.price}</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" className="rounded-full" aria-label="Add to favorites">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full" aria-label="Share product">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex items-center mb-6">
            <Badge className="mr-2 bg-secondary bg-opacity-30 text-primary rounded-full">
              {product.condition}
            </Badge>
            <Badge className="bg-secondary bg-opacity-30 text-primary rounded-full">
              {product.category}
            </Badge>
          </div>

          <div className="flex items-center mb-4 text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {product.location}
          </div>

          <p className="text-gray-700 mb-6">{product.description}</p>

          <Separator className="my-6" />

          {/* Quantity Selector */}
          <div className="mb-6">
            <label htmlFor="quantity" className="block text-sm font-medium mb-2">Quantity</label>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="mx-4 font-medium w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button 
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="w-full mb-4 bg-primary hover:bg-primary-600 text-white py-3 rounded-full font-heading font-medium"
          >
            {isAddingToCart ? "Adding to Cart..." : "Add to Cart"}
          </Button>

          {/* Shipping & Returns */}
          <div className="mt-8 space-y-4 text-sm">
            <div className="flex items-start">
              <Truck className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Shipping</h4>
                <p className="text-gray-600">Usually ships within 2-3 business days</p>
              </div>
            </div>
            <div className="flex items-start">
              <ShieldCheck className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Returns</h4>
                <p className="text-gray-600">30-day returns for most items</p>
              </div>
            </div>
            <div className="flex items-start">
              <CircleUser className="h-5 w-5 mr-3 text-gray-500 mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Seller</h4>
                <p className="text-gray-600">John Doe (5.0 ★)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
