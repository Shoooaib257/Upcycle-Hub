import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import Testimonials from "@/components/home/Testimonials";
import JoinCommunity from "@/components/home/JoinCommunity";
import Newsletter from "@/components/home/Newsletter";
import ProductGrid from "@/components/products/ProductGrid";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { User } from "@shared/schema";

export default function HomePage() {
  // Get current user
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: ({ queryKey }) => fetch(queryKey[0], { credentials: 'include' })
      .then(res => res.ok ? res.json() : null) as Promise<User | null>,
  });

  // Fetch featured products
  const { data: featuredProducts, isLoading, isError, error } = useQuery({
    queryKey: ['/api/products/featured'],
    queryFn: ({ queryKey }) => fetch(queryKey[0]).then(res => {
      if (!res.ok) throw new Error('Failed to load featured products');
      return res.json();
    }),
  });

  return (
    <div>
      <Hero />
      <Features />
      
      <section className="bg-neutral py-12">
        <div className="container mx-auto px-4">
          <h2 className="font-heading font-bold text-3xl text-center mb-8">Featured Products</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md">
                  <Skeleton className="w-full h-64" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error instanceof Error ? error.message : "Failed to load featured products"}
              </AlertDescription>
            </Alert>
          ) : (
            <ProductGrid products={featuredProducts} currentUser={user} />
          )}
        </div>
      </section>
      
      <Testimonials />
      <JoinCommunity />
      <Newsletter />
    </div>
  );
}
