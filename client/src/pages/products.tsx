import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import ProductCard from "@/components/ui/product-card";
import SearchFilters from "@/components/SearchFilters";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Product } from "@shared/schema";

const ProductsPage = () => {
  const [search] = useSearch();
  const [filterQuery, setFilterQuery] = useState(search);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products based on filters
  const { data: products, isLoading, isError } = useQuery<Product[]>({
    queryKey: [`/api/products${filterQuery}`],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Update filter query when URL changes
  useEffect(() => {
    setFilterQuery(search);
  }, [search]);

  // Get filter summary
  const getFilterSummary = () => {
    const params = new URLSearchParams(filterQuery);
    const summary = [];
    
    if (params.get('query')) summary.push(`Search: "${params.get('query')}"`);
    if (params.get('category')) summary.push(`Category: ${params.get('category')}`);
    if (params.get('condition')) summary.push(`Condition: ${params.get('condition')}`);
    if (params.get('minPrice') && params.get('maxPrice')) {
      summary.push(`Price: $${params.get('minPrice')} - $${params.get('maxPrice')}`);
    }
    if (params.get('location')) summary.push(`Location: ${params.get('location')}`);
    
    return summary;
  };

  const filterSummary = getFilterSummary();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        {/* Desktop Filters Sidebar */}
        <div className="hidden md:block w-64 bg-white p-4 rounded-lg shadow-md">
          <h2 className="font-heading font-bold text-xl mb-4">Filters</h2>
          <SearchFilters />
        </div>

        {/* Mobile Filter Button */}
        <div className="md:hidden w-full mb-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="w-full" variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:max-w-md overflow-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <SearchFilters />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="font-heading font-bold text-3xl text-[#433422] mb-2">Products</h1>
              {filterSummary.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {filterSummary.map((filter, index) => (
                    <div key={index} className="bg-primary-100 text-primary px-3 py-1 rounded-full text-sm flex items-center">
                      {filter}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 md:mt-0 text-sm text-gray-500">
              {products ? `${products.length} products found` : ''}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md p-4 h-[400px]">
                  <div className="animate-pulse flex flex-col h-full">
                    <div className="bg-gray-200 h-64 w-full mb-4 rounded"></div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/5 mb-3"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3 mt-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">Error loading products. Please try again later.</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && products?.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                <X className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters or search criteria</p>
              <Button variant="outline" onClick={() => window.location.href = '/products'}>
                Clear All Filters
              </Button>
            </div>
          )}

          {/* Products Grid */}
          {!isLoading && !isError && products && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
