import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/hooks/use-auth";
import { useCart } from "@/lib/hooks/use-cart";
import { 
  Search, 
  User, 
  ShoppingBag, 
  Menu,
  X,
  RefreshCw,
  Facebook,
  Instagram,
  Twitter,
  Github
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      navigate(`/products?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const totalItems = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <RefreshCw className="h-7 w-7 text-primary" />
              <span className="ml-2 text-2xl font-heading font-bold text-primary">EcoRevive</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/products" className="font-heading font-medium text-neutral-dark hover:text-primary transition">
                Shop
              </Link>
              <Link href="/sell" className="font-heading font-medium text-neutral-dark hover:text-primary transition">
                Sell
              </Link>
              <Link href="/about" className="font-heading font-medium text-neutral-dark hover:text-primary transition">
                About
              </Link>
              <Link href="/contact" className="font-heading font-medium text-neutral-dark hover:text-primary transition">
                Contact
              </Link>
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block">
                <form className="relative" onSubmit={handleSearch}>
                  <Input 
                    type="text"
                    placeholder="Search products..." 
                    className="bg-neutral-50 pr-10 rounded-full text-sm focus:ring-2 focus:ring-primary w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="absolute right-0 top-0 mt-2 mr-3 text-gray-500">
                    <Search className="h-5 w-5" />
                  </button>
                </form>
              </div>

              {user ? (
                <Link href="/profile" className="text-neutral-dark hover:text-primary transition">
                  <User className="h-6 w-6" />
                </Link>
              ) : (
                <Link href="/login" className="text-neutral-dark hover:text-primary transition">
                  <User className="h-6 w-6" />
                </Link>
              )}

              <Link href="/cart" className="relative text-neutral-dark hover:text-primary transition">
                <ShoppingBag className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#D17A50] text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                      <Link href="/" className="flex items-center">
                        <RefreshCw className="h-6 w-6 text-primary" />
                        <span className="ml-2 text-xl font-heading font-bold text-primary">EcoRevive</span>
                      </Link>
                    </div>
                    <div className="flex flex-col space-y-4">
                      <Link href="/products" className="font-heading font-medium text-neutral-dark hover:text-primary transition">
                        Shop
                      </Link>
                      <Link href="/sell" className="font-heading font-medium text-neutral-dark hover:text-primary transition">
                        Sell
                      </Link>
                      <Link href="/about" className="font-heading font-medium text-neutral-dark hover:text-primary transition">
                        About
                      </Link>
                      <Link href="/contact" className="font-heading font-medium text-neutral-dark hover:text-primary transition">
                        Contact
                      </Link>
                      {user ? (
                        <>
                          <Link href="/profile" className="font-heading font-medium text-neutral-dark hover:text-primary transition">
                            My Profile
                          </Link>
                          <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => {
                              logout();
                              navigate("/");
                            }}
                          >
                            Logout
                          </Button>
                        </>
                      ) : (
                        <div className="flex flex-col space-y-2 mt-4">
                          <Link href="/login">
                            <Button variant="default" className="w-full">
                              Log in
                            </Button>
                          </Link>
                          <Link href="/register">
                            <Button variant="outline" className="w-full">
                              Register
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Mobile Search (visible on smaller screens) */}
          <div className="mt-3 md:hidden">
            <form className="relative" onSubmit={handleSearch}>
              <Input 
                type="text"
                placeholder="Search products..." 
                className="bg-neutral-50 w-full pr-10 rounded-full text-sm focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-0 top-0 mt-2 mr-3 text-gray-500">
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#433422] text-white pt-12 pb-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-heading font-bold text-lg mb-4">EcoRevive</h3>
              <p className="text-gray-300 mb-4">Your marketplace for sustainable, upcycled goods that reduce waste and support eco-conscious creators.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white transition">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-heading font-bold text-lg mb-4">Explore</h3>
              <ul className="space-y-2">
                <li><Link href="/products" className="text-gray-300 hover:text-white transition">Shop All</Link></li>
                <li><Link href="/products?category=Home+Decor" className="text-gray-300 hover:text-white transition">Home Decor</Link></li>
                <li><Link href="/products?category=Furniture" className="text-gray-300 hover:text-white transition">Furniture</Link></li>
                <li><Link href="/products?category=Fashion" className="text-gray-300 hover:text-white transition">Fashion</Link></li>
                <li><Link href="/products?category=Art+%26+Crafts" className="text-gray-300 hover:text-white transition">Art & Crafts</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-bold text-lg mb-4">Sell</h3>
              <ul className="space-y-2">
                <li><Link href="/sell" className="text-gray-300 hover:text-white transition">Start Selling</Link></li>
                <li><Link href="/about" className="text-gray-300 hover:text-white transition">Seller Guidelines</Link></li>
                <li><Link href="/profile" className="text-gray-300 hover:text-white transition">Seller Dashboard</Link></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">Seller Resources</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">Success Stories</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-heading font-bold text-lg mb-4">Help</h3>
              <ul className="space-y-2">
                <li><Link href="/contact" className="text-gray-300 hover:text-white transition">Contact Us</Link></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">FAQs</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">Shipping & Returns</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">Terms & Conditions</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">© {new Date().getFullYear()} EcoRevive. All rights reserved.</p>
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="40" height="25">
                  <path fill="#1565C0" d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z"/>
                  <path fill="#FFF" d="M15.186 19l-2.626 7.832c0 0-.667-3.313-.733-3.729-1.495-3.411-3.701-3.221-3.701-3.221L10.726 30v-.002h3.161L18.258 19H15.186zM17.689 30L20.56 30 22.296 19 19.389 19zM38.008 19h-3.021l-4.71 11h2.852l.588-1.571h3.596L37.619 30h2.613L38.008 19zM34.513 26.328l1.563-4.157.818 4.157H34.513zM26.369 22.206c0-.606.498-1.057 1.926-1.057.928 0 1.991.674 1.991.674l.466-2.309c0 0-1.358-.515-2.691-.515-3.019 0-4.576 1.444-4.576 3.272 0 3.306 3.979 2.853 3.979 4.551 0 .291-.231.964-1.888.964-1.662 0-2.759-.609-2.759-.609l-.495 2.216c0 0 1.063.606 3.117.606 2.059 0 4.915-1.54 4.915-3.752C30.354 23.586 26.369 23.394 26.369 22.206z"/>
                  <path fill="#FFC107" d="M12.212,24.945l-0.966-4.748c0,0-0.437-1.029-1.573-1.029c-1.136,0-4.44,0-4.44,0S10.894,20.84,12.212,24.945z"/>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="40" height="25">
                  <path fill="#3F51B5" d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z"/>
                  <path fill="#FFC107" d="M30,24c0,3.314-2.686,6-6,6s-6-2.686-6-6s2.686-6,6-6S30,20.686,30,24z"/>
                  <path fill="#FF3D00" d="M22.014,30.972C21.998,31.015,22,31.021,22,31.021l-2.404,0.042L19.012,31c-0.21-0.014-0.406-0.119-0.53-0.283c-1.594-2.709-2.063-5.643-2.063-5.643c0.017-0.18,0.079-0.34,0.18-0.469c0,0,1.197-1.388,2.334-2.692C18.97,21.512,19,21.047,19,21.047v-3.205c0,0,0.019-0.519,0.813-0.826C20.064,17.007,20.478,17,20.478,17h0.084H24h3.438h0.083c0,0,0.415,0.007,0.667,0.016c0.793,0.307,0.813,0.826,0.813,0.826v3.205c0,0,0.03,0.465,0.067,0.866c1.137,1.304,2.334,2.692,2.334,2.692c0.101,0.129,0.162,0.289,0.18,0.469c0,0-0.47,2.934-2.063,5.643c-0.124,0.164-0.32,0.27-0.53,0.283l-0.584,0.063L25.86,31.021c0,0,0.002-0.006-0.014-0.049C24.143,29.156,23.95,26.711,24,26.5c0.019-0.076,0.053-0.151,0.113-0.212l2.646-2.708c0.092-0.094,0.139-0.222,0.129-0.354l-0.18-2.427h-0.287H20.33h-0.287l-0.18,2.427c-0.01,0.132,0.037,0.26,0.129,0.354l2.646,2.708c0.06,0.061,0.095,0.136,0.113,0.212C22.8,26.711,22.607,29.156,22.014,30.972z"/>
                  <path fill="#E0E0E0" d="M24 19.01A4.995 4.995 0 1 0 24 29 4.995 4.995 0 1 0 24 19.01z"/>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="40" height="25">
                  <path fill="#0078D7" d="M45,35c0,2.2-1.8,4-4,4H7c-2.2,0-4-1.8-4-4V13c0-2.2,1.8-4,4-4h34c2.2,0,4,1.8,4,4V35z"/>
                  <path fill="#FFFFFF" d="M30,21.6v-2.2c0-0.5-0.4-1-1-1h-5.8c-3.4,0-6.2,2.6-6.2,5.8v4.4c0,3.2,2.8,5.8,6.2,5.8H30c0.5,0,1-0.4,1-1v-2.2c0-0.5-0.4-1-1-1h-5.8c-1.4,0-2.5-1-2.5-2.3v-3.9c0-1.3,1.1-2.3,2.5-2.3H29C29.6,22.6,30,22.2,30,21.6z M40,21.6v-2.2c0-0.5-0.4-1-1-1h-5.8c-3.4,0-6.2,2.6-6.2,5.8v4.4c0,3.2,2.8,5.8,6.2,5.8H39c0.5,0,1-0.4,1-1v-2.2c0-0.5-0.4-1-1-1h-5.8c-1.4,0-2.5-1-2.5-2.3v-3.9c0-1.3,1.1-2.3,2.5-2.3H39C39.6,22.6,40,22.2,40,21.6z M32,28.2c0,0.3-0.3,0.6-0.6,0.6h-8.8c-0.3,0-0.6-0.3-0.6-0.6v-4.4c0-0.3,0.3-0.6,0.6-0.6h8.8c0.3,0,0.6,0.3,0.6,0.6V28.2z"/>
                  <path fill="#FFFFFF" d="M12,31c0,0.5,0.4,1,1,1h3c0.6,0,1-0.5,1-1V13c0-0.5-0.4-1-1-1h-3c-0.6,0-1,0.5-1,1V31z"/>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="40" height="25">
                  <path fill="#000000" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z"/>
                  <path fill="#FFFFFF" d="M33 21.001L33 13 15 13 15 35 33 35 33 26.999 27 27 27 31 21 31 21 17 27 17 27 21.001z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
