import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";

export default function CartPage() {
  const [_, navigate] = useLocation();

  // Fetch cart data
  const { data: cart, isLoading, isError, error } = useQuery({
    queryKey: ['/api/cart'],
    queryFn: ({ queryKey }) => fetch(queryKey[0], { credentials: 'include' })
      .then(res => {
        if (res.status === 401) {
          navigate('/signin');
          throw new Error('Please sign in to view your cart');
        }
        if (!res.ok) throw new Error('Failed to load cart');
        return res.json();
      }),
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-heading font-bold text-3xl mb-8">Your Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-b">
                <div className="flex items-center flex-1">
                  <Skeleton className="h-20 w-20 rounded-md" />
                  <div className="ml-4 flex-1">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
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
            {error instanceof Error ? error.message : "Failed to load cart"}
          </AlertDescription>
        </Alert>
        <div className="mt-6 text-center">
          <Link href="/products">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h1 className="font-heading font-bold text-2xl mb-4">Your Shopping Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Add items to your cart to see them here.</p>
        <Link href="/products">
          <Button className="bg-primary text-white">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-heading font-bold text-3xl mb-8">Your Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          {cart.items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>
        
        {/* Cart Summary */}
        <div>
          <CartSummary items={cart.items} redirectToCheckout={true} />
        </div>
      </div>
    </div>
  );
}
