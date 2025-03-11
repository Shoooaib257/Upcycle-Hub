import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger 
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CONDITIONS, CATEGORIES } from "@shared/schema";

interface SearchFiltersProps {
  onFilterChange?: (filterQuery: string) => void;
}

const SearchFilters = ({ onFilterChange }: SearchFiltersProps) => {
  const [location, setLocation] = useLocation();
  const urlSearchParams = new URLSearchParams(window.location.search);
  
  // Initialize filter states from URL parameters
  const [category, setCategory] = useState<string | undefined>(
    urlSearchParams.get("category") || undefined
  );
  const [minPrice, setMinPrice] = useState<number | undefined>(
    urlSearchParams.get("minPrice") ? Number(urlSearchParams.get("minPrice")) : undefined
  );
  const [maxPrice, setMaxPrice] = useState<number | undefined>(
    urlSearchParams.get("maxPrice") ? Number(urlSearchParams.get("maxPrice")) : undefined
  );
  const [condition, setCondition] = useState<string | undefined>(
    urlSearchParams.get("condition") || undefined
  );
  const [locationFilter, setLocationFilter] = useState<string | undefined>(
    urlSearchParams.get("location") || undefined
  );
  const [sortBy, setSortBy] = useState<string>(
    urlSearchParams.get("sortBy") || "newest"
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([
    minPrice || 0, 
    maxPrice || 500
  ]);
  const [searchQuery, setSearchQuery] = useState<string | undefined>(
    urlSearchParams.get("query") || undefined
  );

  // Apply filters and update URL
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set("query", searchQuery);
    if (category) params.set("category", category);
    if (minPrice !== undefined) params.set("minPrice", minPrice.toString());
    if (maxPrice !== undefined) params.set("maxPrice", maxPrice.toString());
    if (condition) params.set("condition", condition);
    if (locationFilter) params.set("location", locationFilter);
    if (sortBy) params.set("sortBy", sortBy);
    
    const queryString = params.toString();
    const newPath = `/products${queryString ? `?${queryString}` : ''}`;
    
    if (onFilterChange) {
      onFilterChange(queryString);
    } else {
      setLocation(newPath);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setCategory(undefined);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setCondition(undefined);
    setLocationFilter(undefined);
    setSortBy("newest");
    setPriceRange([0, 500]);
    setSearchQuery(undefined);
    
    if (onFilterChange) {
      onFilterChange("");
    } else {
      setLocation("/products");
    }
  };

  // Update price range state when slider changes
  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
    setMinPrice(values[0]);
    setMaxPrice(values[1]);
  };

  // Apply filters when form is submitted
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 relative">
        <Input
          type="text"
          placeholder="Search products..."
          value={searchQuery || ""}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>
      
      <Accordion type="multiple" defaultValue={["category", "price", "condition"]}>
        <AccordionItem value="category">
          <AccordionTrigger className="font-heading font-medium">Category</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <div key={cat} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`category-${cat}`} 
                    checked={category === cat}
                    onCheckedChange={(checked) => {
                      setCategory(checked ? cat : undefined);
                    }}
                  />
                  <label 
                    htmlFor={`category-${cat}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {cat}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="price">
          <AccordionTrigger className="font-heading font-medium">Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                defaultValue={[priceRange[0], priceRange[1]]}
                min={0}
                max={500}
                step={10}
                value={[priceRange[0], priceRange[1]]}
                onValueChange={handlePriceRangeChange}
                className="py-4"
              />
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  ${priceRange[0]}
                </div>
                <div className="text-sm">
                  ${priceRange[1]}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="condition">
          <AccordionTrigger className="font-heading font-medium">Condition</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {CONDITIONS.map((cond) => (
                <div key={cond} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`condition-${cond}`} 
                    checked={condition === cond}
                    onCheckedChange={(checked) => {
                      setCondition(checked ? cond : undefined);
                    }}
                  />
                  <label 
                    htmlFor={`condition-${cond}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {cond}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="location">
          <AccordionTrigger className="font-heading font-medium">Location</AccordionTrigger>
          <AccordionContent>
            <Input
              type="text"
              placeholder="Enter city or region"
              value={locationFilter || ""}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="pt-4">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Sort By</label>
          <Select
            value={sortBy}
            onValueChange={setSortBy}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex space-x-2">
          <Button type="submit" className="flex-1">Apply Filters</Button>
          <Button type="button" variant="outline" onClick={resetFilters}>Reset</Button>
        </div>
      </div>
    </form>
  );
};

export default SearchFilters;
