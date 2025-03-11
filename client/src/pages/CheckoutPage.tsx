import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import CartSummary from "@/components/cart/CartSummary";

export default function CheckoutPage() {
  const [_, navigate] = useLocation();
  
  // Fetch cart data
  const { data: cart, isLoading, isError, error } = useQuery({
    queryKey: ['/api/cart'],
    queryFn: ({ queryKey }) => fetch(queryKey[0], { credentials: 'include' })
      .then(res => {
        if (res.status === 401) {
          navigate('/signin');
          throw new Error('Please sign in to continue checkout');
        }
        if (!res.ok) throw new Error('Failed to load cart');
        return res.json();
      }),
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-heading font-bold text-3xl mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load checkout information"}
          </AlertDescription>
        </Alert>
        <div className="mt-6 text-center">
          <Link href="/cart">
            <Button variant="outline">Return to Cart</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h1 className="font-heading font-bold text-2xl mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Add items to your cart before checking out.</p>
        <Link href="/products">
          <Button className="bg-primary text-white">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-heading font-bold text-3xl mb-2">Checkout</h1>
      <p className="text-gray-600 mb-8">Complete your purchase by providing payment and shipping details</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment and Shipping Form */}
        <div className="lg:col-span-2">
          <CheckoutForm items={cart.items} />
        </div>
        
        {/* Order Summary */}
        <div className="space-y-6">
          <CartSummary items={cart.items} />
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-heading font-semibold mb-4">Order Items ({cart.items.length})</h3>
            
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            <div className="text-sm text-gray-600">
              <p>Your purchase contributes to a more sustainable future!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
