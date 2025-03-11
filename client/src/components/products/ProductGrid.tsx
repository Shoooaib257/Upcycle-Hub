import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { Product, User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

interface ProductGridProps {
  products: Product[];
  currentUser?: User | null;
}

export default function ProductGrid({ products, currentUser }: ProductGridProps) {
  const [sellerIds, setSellerIds] = useState<number[]>([]);
  
  // Extract unique seller IDs from products
  useEffect(() => {
    const uniqueSellerIds = [...new Set(products.map(product => product.sellerId))];
    setSellerIds(uniqueSellerIds);
  }, [products]);
  
  // Fetch seller information for all products
  const { data: sellers } = useQuery({
    queryKey: ['/api/users/sellers'],
    queryFn: async () => {
      // For now, we're using a mock implementation since we don't have a real endpoint
      // In a real app, we would fetch all sellers at once or implement a batched fetch
      return sellerIds.map(id => ({
        id,
        username: `Seller${id}`,
        avatar: `https://ui-avatars.com/api/?name=Seller${id}&background=random`,
      }));
    },
    enabled: sellerIds.length > 0,
  });
  
  const getSellerInfo = (sellerId: number): User | undefined => {
    return sellers?.find(seller => seller.id === sellerId);
  };
  
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-2xl font-heading font-semibold mb-4">No products found</h3>
        <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product}
          sellerInfo={getSellerInfo(product.sellerId)} 
          currentUser={currentUser}
        />
      ))}
    </div>
  );
}
