import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import ProductFilters from "@/components/products/ProductFilters";
import ProductGrid from "@/components/products/ProductGrid";
import SearchBar from "@/components/products/SearchBar";
import { useQuery } from "@tanstack/react-query";
import { ProductSearchFilters, User } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export default function ProductsPage() {
  const [location] = useLocation();
  const [filters, setFilters] = useState<ProductSearchFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;
  
  // Parse URL parameters for filters
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    
    const newFilters: ProductSearchFilters = {};
    
    if (params.has('query')) newFilters.query = params.get('query') || undefined;
    if (params.has('category')) newFilters.category = params.get('category') || undefined;
    if (params.has('priceMin')) newFilters.priceMin = parseFloat(params.get('priceMin') || '0');
    if (params.has('priceMax')) newFilters.priceMax = parseFloat(params.get('priceMax') || '0');
    if (params.has('sortBy')) newFilters.sortBy = params.get('sortBy') as any;
    if (params.has('featured')) newFilters.featured = params.get('featured') === 'true';
    if (params.has('isNew')) newFilters.isNew = params.get('isNew') === 'true';
    
    setFilters(newFilters);
    setCurrentPage(1); // Reset page when filters change
  }, [location]);
  
  // Get current user
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: ({ queryKey }) => fetch(queryKey[0], { credentials: 'include' })
      .then(res => res.ok ? res.json() : null) as Promise<User | null>,
  });
  
  // Build query string from filters
  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    if (filters.query) params.append('query', filters.query);
    if (filters.category) params.append('category', filters.category);
    if (filters.priceMin !== undefined) params.append('priceMin', filters.priceMin.toString());
    if (filters.priceMax !== undefined) params.append('priceMax', filters.priceMax.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
    if (filters.isNew !== undefined) params.append('isNew', filters.isNew.toString());
    
    return params.toString();
  };
  
  // Fetch products based on filters
  const { data: products = [], isLoading, isError, error } = useQuery<any[]>({
    queryKey: [`/api/products?${buildQueryString()}`],
  });
  
  // Handle filter changes
  const handleFilterChange = (newFilters: ProductSearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset page when filters change
  };
  
  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);
  
  // Handle search
  const handleSearch = (query: string) => {
    setFilters({ ...filters, query });
    setCurrentPage(1); // Reset to first page on new search
  };

  return (
    <section className="bg-neutral py-12">
      <div className="container mx-auto px-4">
        <ProductFilters filters={filters} onFilterChange={handleFilterChange} />
        <SearchBar 
          initialQuery={filters.query || ""} 
          onSearch={handleSearch} 
        />
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
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
              {error instanceof Error ? error.message : "Failed to load products"}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <ProductGrid products={currentProducts} currentUser={user} />
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => setCurrentPage(i + 1)}
                          isActive={currentPage === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
