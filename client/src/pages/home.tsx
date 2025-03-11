import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  RefreshCw,
  ArrowRight,
  Plus,
  ExternalLink,
  Sun
} from "lucide-react";
import ProductCard from "@/components/ui/product-card";
import CategoryCard from "@/components/CategoryCard";
import { Product, CATEGORIES } from "@shared/schema";

const HomePage = () => {
  const { data: featuredProducts, isLoading: isFeaturedLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/featured", 4],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const categoryImages = [
    { name: "Home Decor", image: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80", link: "/products?category=Home+Decor" },
    { name: "Furniture", image: "https://images.unsplash.com/photo-1475180098017-f91177fb635f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80", link: "/products?category=Furniture" },
    { name: "Fashion", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80", link: "/products?category=Fashion" },
    { name: "Art & Crafts", image: "https://images.unsplash.com/photo-1456948927036-ad533e53865c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80", link: "/products?category=Art+%26+Crafts" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-primary text-white">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Give Products a Second Life</h1>
            <p className="text-lg mb-8">Discover unique upcycled items that reduce waste while adding character to your life.</p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/products">
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-heading font-medium px-8 py-3 rounded-full shadow-lg transition transform hover:-translate-y-1 w-full sm:w-auto">
                  Shop Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/sell">
                <Button variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary font-heading font-medium px-8 py-3 rounded-full shadow-lg transition transform hover:-translate-y-1 w-full sm:w-auto">
                  Sell Your Items
                  <Plus className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60">
            <path fill="#F8F4E9" fillOpacity="1" d="M0,32L60,37.3C120,43,240,53,360,53.3C480,53,600,43,720,32C840,21,960,11,1080,16C1200,21,1320,43,1380,53.3L1440,64L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"></path>
          </svg>
        </div>
      </section>

      {/* Category Highlights */}
      <section className="bg-[#F8F4E9] container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-[#433422] mb-2">Browse by Category</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">Discover upcycled products across a variety of categories</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categoryImages.map((category, index) => (
            <CategoryCard 
              key={index}
              name={category.name}
              image={category.image}
              link={category.link}
            />
          ))}
        </div>
      </section>

      {/* Sustainability Message */}
      <section className="bg-[#8BAA8B] bg-opacity-20 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-4">
              <Sun className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-3xl font-heading font-bold text-primary mb-4">Reducing Waste, One Product at a Time</h2>
            <p className="text-lg mb-6">Every purchase on Upcycle Hub helps divert products from landfills and reduces the demand for new production.</p>
            <p className="font-['Caveat'] text-2xl text-[#D17A50] mb-8">Together, we've saved over 15,000 items from ending up in landfills!</p>
            <Link href="/about">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-heading font-medium px-8 py-3 rounded-full shadow-lg transition">
                Learn About Our Mission
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-12 md:py-16 bg-[#F8F4E9]">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <div>
            <h2 className="text-3xl font-heading font-bold text-[#433422] mb-2">Featured Products</h2>
            <p className="text-gray-600">Handpicked upcycled items that stand out</p>
          </div>
        </div>
        
        {isFeaturedLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        <div className="mt-10 text-center">
          <Link href="/products">
            <Button variant="outline" className="bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white font-heading font-medium px-8 py-3 rounded-full shadow-md transition inline-flex items-center">
              View All Products
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-neutral-50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-[#433422] mb-2">How Upcycle Hub Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Join our community of eco-conscious buyers and sellers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 text-center shadow-md">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary bg-opacity-20 text-primary mb-4">
                <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-bold mb-2">1. List Your Items</h3>
              <p className="text-gray-600">Take photos of your items, set a price, and create a listing in minutes. It's completely free to list!</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center shadow-md">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary bg-opacity-20 text-primary mb-4">
                <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-bold mb-2">2. Connect & Sell</h3>
              <p className="text-gray-600">Connect with buyers, answer questions, and finalize sales. Choose local pickup or shipping options.</p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center shadow-md">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary bg-opacity-20 text-primary mb-4">
                <svg className="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-bold mb-2">3. Get Paid Securely</h3>
              <p className="text-gray-600">Receive payments securely through our platform with buyer protection and seller guarantees.</p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/sell">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-heading font-medium px-8 py-3 rounded-full shadow-lg transition">
                Start Selling Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="bg-primary py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl font-heading font-bold mb-4">Join Our Community</h2>
            <p className="text-lg mb-6 opacity-90">Get inspiration, special offers, and updates on new upcycled products.</p>
            
            <form className="max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <div className="flex flex-col sm:flex-row">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="flex-grow px-4 py-2 rounded-full sm:rounded-r-none text-gray-800 focus:outline-none"
                  required
                />
                <Button 
                  type="submit" 
                  className="mt-2 sm:mt-0 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-full sm:rounded-l-none font-medium transition"
                >
                  Subscribe
                </Button>
              </div>
              <p className="text-sm mt-2 opacity-80">By subscribing you agree to our Privacy Policy. We'll never share your information.</p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
