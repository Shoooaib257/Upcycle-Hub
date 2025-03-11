import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { User } from "@shared/schema";
import { RecycleIcon, ShoppingCart, Menu, Search, User as UserIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface NavbarProps {
  user: User | null | undefined;
}

export default function Navbar({ user }: NavbarProps) {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get cart item count
  const { data: cart } = useQuery({
    queryKey: ['/api/cart'],
    queryFn: ({ queryKey }) => fetch(queryKey[0], { credentials: 'include' }).then(r => r.ok ? r.json() : { items: [] }),
    enabled: !!user,
  });
  
  const cartItemCount = cart?.items?.length || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      // Invalidate user query to update UI
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <RecycleIcon className="text-primary h-8 w-8 mr-2" />
              <span className="text-primary font-heading font-bold text-2xl">Upcycle Hub</span>
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 px-6 max-w-xl">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="text"
                placeholder="Search for upcycled products..."
                className="w-full py-2 px-4 border border-secondary rounded-full bg-neutral focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit"
                variant="ghost" 
                size="icon"
                className="absolute right-0 top-0 h-full px-4 text-primary"
              >
                <Search size={18} />
              </Button>
            </form>
          </div>

          {/* Navigation (Desktop) */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/products" className="text-gray-700 hover:text-primary transition">
              Shop
            </Link>
            <Link href="/sell" className="text-gray-700 hover:text-primary transition">
              Sell
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-primary transition">
              About Us
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-primary transition">
              Contact
            </Link>
            
            {user ? (
              <>
                <Link href="/cart" className="relative">
                  <ShoppingCart className="text-gray-700 hover:text-primary h-5 w-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
                {user.isSeller && (
                  <Link href="/business-details" className="text-gray-700 hover:text-primary transition">
                    Business Details
                  </Link>
                )}
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2"
                    onClick={handleLogout}
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>{user.username}</span>
                  </Button>
                </div>
              </>
            ) : (
              <Link href="/signin">
                <Button className="bg-primary text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition">
                  Sign In
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-gray-700">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 mt-8">
                <Link 
                  href="/products" 
                  className="text-lg font-medium hover:text-primary transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Shop
                </Link>
                <Link 
                  href="/sell" 
                  className="text-lg font-medium hover:text-primary transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sell
                </Link>
                <Link 
                  href="/about" 
                  className="text-lg font-medium hover:text-primary transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About Us
                </Link>
                <Link 
                  href="/contact" 
                  className="text-lg font-medium hover:text-primary transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link 
                  href="/cart" 
                  className="text-lg font-medium hover:text-primary transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Cart {cartItemCount > 0 && `(${cartItemCount})`}
                </Link>
                {user && user.isSeller && (
                  <Link 
                    href="/business-details" 
                    className="text-lg font-medium hover:text-primary transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Business Details
                  </Link>
                )}
                {user ? (
                  <Button
                    variant="default"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign Out
                  </Button>
                ) : (
                  <Link href="/signin" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-primary">Sign In</Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Search Bar (Mobile) */}
        <div className="pb-4 md:hidden">
          <form onSubmit={handleSearch} className="relative w-full">
            <Input
              type="text"
              placeholder="Search for upcycled products..."
              className="w-full py-2 px-4 border border-secondary rounded-full bg-neutral focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit"
              variant="ghost" 
              size="icon"
              className="absolute right-0 top-0 h-full px-4 text-primary"
            >
              <Search size={18} />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
