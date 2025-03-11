import { useState, FormEvent } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
}

export default function SearchBar({ initialQuery = "", onSearch }: SearchBarProps) {
  const [_, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      
      // Update URL with search query
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("query", searchQuery.trim());
      navigate(`/products?${searchParams.toString()}`);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative mb-8">
      <div className="flex w-full max-w-lg mx-auto">
        <Input
          type="text"
          placeholder="Search for upcycled products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-l-full py-6 pl-5 pr-10 border-r-0"
        />
        <Button 
          type="submit" 
          className="rounded-r-full px-6 bg-primary text-white"
        >
          <Search className="h-5 w-5" />
          <span className="ml-2 hidden sm:inline">Search</span>
        </Button>
      </div>
    </form>
  );
}