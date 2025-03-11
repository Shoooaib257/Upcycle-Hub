import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ProductSearchFilters } from "@shared/schema";

interface ProductFiltersProps {
  filters: ProductSearchFilters;
  onFilterChange: (filters: ProductSearchFilters) => void;
}

export default function ProductFilters({ filters, onFilterChange }: ProductFiltersProps) {
  const [_, navigate] = useLocation();
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);

  useEffect(() => {
    const newAppliedFilters: string[] = [];
    
    if (filters.category) {
      newAppliedFilters.push(getCategoryLabel(filters.category));
    }
    
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      let priceLabel = "Price: ";
      if (filters.priceMin !== undefined && filters.priceMax !== undefined) {
        priceLabel += `$${filters.priceMin} - $${filters.priceMax}`;
      } else if (filters.priceMin !== undefined) {
        priceLabel += `>$${filters.priceMin}`;
      } else if (filters.priceMax !== undefined) {
        priceLabel += `<$${filters.priceMax}`;
      }
      newAppliedFilters.push(priceLabel);
    }
    
    if (filters.featured) {
      newAppliedFilters.push("Featured");
    }
    
    if (filters.isNew) {
      newAppliedFilters.push("New Arrivals");
    }
    
    setAppliedFilters(newAppliedFilters);
  }, [filters]);

  const handleCategoryChange = (value: string) => {
    onFilterChange({ ...filters, category: value !== "all" ? value : undefined });
    updateQueryString({ ...filters, category: value !== "all" ? value : undefined });
  };

  const handlePriceChange = (value: string) => {
    let priceMin, priceMax;
    
    switch (value) {
      case "under25":
        priceMax = 25;
        break;
      case "25to50":
        priceMin = 25;
        priceMax = 50;
        break;
      case "50to100":
        priceMin = 50;
        priceMax = 100;
        break;
      case "over100":
        priceMin = 100;
        break;
      default:
        priceMin = undefined;
        priceMax = undefined;
    }
    
    onFilterChange({ ...filters, priceMin, priceMax });
    updateQueryString({ ...filters, priceMin, priceMax });
  };

  const handleSortChange = (value: string) => {
    onFilterChange({ ...filters, sortBy: value as any });
    updateQueryString({ ...filters, sortBy: value as any });
  };

  const removeFilter = (filter: string) => {
    const updatedFilters = { ...filters };
    
    if (filter.startsWith("Price:")) {
      updatedFilters.priceMin = undefined;
      updatedFilters.priceMax = undefined;
    } else if (filter === "Featured") {
      updatedFilters.featured = undefined;
    } else if (filter === "New Arrivals") {
      updatedFilters.isNew = undefined;
    } else if (Object.values(categoryLabels).includes(filter)) {
      updatedFilters.category = undefined;
    }
    
    onFilterChange(updatedFilters);
    updateQueryString(updatedFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters: ProductSearchFilters = {
      query: filters.query,
    };
    onFilterChange(clearedFilters);
    updateQueryString(clearedFilters);
  };

  const updateQueryString = (filters: ProductSearchFilters) => {
    const params = new URLSearchParams();
    
    if (filters.query) params.set('query', filters.query);
    if (filters.category) params.set('category', filters.category);
    if (filters.priceMin !== undefined) params.set('priceMin', filters.priceMin.toString());
    if (filters.priceMax !== undefined) params.set('priceMax', filters.priceMax.toString());
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.featured !== undefined) params.set('featured', filters.featured.toString());
    if (filters.isNew !== undefined) params.set('isNew', filters.isNew.toString());
    
    navigate(`/products?${params.toString()}`);
  };

  // Helper function to get category label
  const categoryLabels: Record<string, string> = {
    'furniture': 'Furniture',
    'home_decor': 'Home Decor',
    'fashion': 'Fashion',
    'jewelry': 'Jewelry',
    'garden': 'Garden',
    'art': 'Art',
    'other': 'Other',
  };

  const getCategoryLabel = (category: string): string => {
    return categoryLabels[category] || category;
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h2 className="font-heading font-bold text-3xl mb-4 md:mb-0">Browse Upcycled Products</h2>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Select value={filters.category || "all"} onValueChange={handleCategoryChange}>
              <SelectTrigger className="h-auto py-2 px-4 rounded-full">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="furniture">Furniture</SelectItem>
                <SelectItem value="home_decor">Home Decor</SelectItem>
                <SelectItem value="fashion">Fashion</SelectItem>
                <SelectItem value="jewelry">Jewelry</SelectItem>
                <SelectItem value="garden">Garden</SelectItem>
                <SelectItem value="art">Art</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative">
            <Select value={
              filters.priceMax === 25 ? "under25" :
              filters.priceMin === 25 && filters.priceMax === 50 ? "25to50" :
              filters.priceMin === 50 && filters.priceMax === 100 ? "50to100" :
              filters.priceMin === 100 ? "over100" : "any"
            } onValueChange={handlePriceChange}>
              <SelectTrigger className="h-auto py-2 px-4 rounded-full">
                <SelectValue placeholder="Price: Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Price: Any</SelectItem>
                <SelectItem value="under25">Under $25</SelectItem>
                <SelectItem value="25to50">$25 to $50</SelectItem>
                <SelectItem value="50to100">$50 to $100</SelectItem>
                <SelectItem value="over100">$100+</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative">
            <Select value={filters.sortBy || "newest"} onValueChange={handleSortChange}>
              <SelectTrigger className="h-auto py-2 px-4 rounded-full">
                <SelectValue placeholder="Sort By: Newest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Sort By: Newest</SelectItem>
                <SelectItem value="price_low_high">Price: Low to High</SelectItem>
                <SelectItem value="price_high_low">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Additional filter toggles */}
      <div className="flex flex-wrap gap-6 mb-8">
        <div className="flex items-center space-x-2">
          <Switch 
            id="featured" 
            checked={filters.featured === true}
            onCheckedChange={(checked) => {
              const updatedFilters = { ...filters, featured: checked ? true : undefined };
              onFilterChange(updatedFilters);
              updateQueryString(updatedFilters);
            }}
          />
          <label htmlFor="featured" className="flex items-center cursor-pointer">
            <Star className="mr-2 h-4 w-4 text-yellow-500" />
            Featured Items
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="newArrivals" 
            checked={filters.isNew === true}
            onCheckedChange={(checked) => {
              const updatedFilters = { ...filters, isNew: checked ? true : undefined };
              onFilterChange(updatedFilters);
              updateQueryString(updatedFilters);
            }}
          />
          <label htmlFor="newArrivals" className="flex items-center cursor-pointer">
            <Sparkles className="mr-2 h-4 w-4 text-blue-500" />
            New Arrivals
          </label>
        </div>
      </div>
      
      {/* Filter Tags */}
      {appliedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {appliedFilters.map((filter, index) => (
            <Badge key={index} variant="outline" className="bg-white px-3 py-1 rounded-full text-sm flex items-center">
              {filter}
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 h-auto p-0 text-gray-500 hover:text-gray-700"
                onClick={() => removeFilter(filter)}
              >
                <X size={14} />
              </Button>
            </Badge>
          ))}
          {appliedFilters.length > 0 && (
            <Badge 
              className="bg-primary text-white px-3 py-1 rounded-full text-sm flex items-center cursor-pointer"
              onClick={clearAllFilters}
            >
              Clear All
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 h-auto p-0 text-white"
                onClick={clearAllFilters}
              >
                <X size={14} />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
