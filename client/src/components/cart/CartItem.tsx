import { useState } from "react";
import { Link } from "wouter";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartItem as CartItemType, Product } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CartItemProps {
  item: CartItemType & { product: Product };
}

export default function CartItem({ item }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const { toast } = useToast();
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value);
    if (newQuantity > 0) {
      setQuantity(newQuantity);
    }
  };
  
  const updateQuantity = async () => {
    if (quantity === item.quantity) return;
    
    setIsUpdating(true);
    try {
      await apiRequest("PUT", `/api/cart/items/${item.id}`, { quantity });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Cart updated",
        description: `Updated quantity of ${item.product.name}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update cart",
        variant: "destructive",
      });
      setQuantity(item.quantity); // Reset to original quantity on error
    } finally {
      setIsUpdating(false);
    }
  };
  
  const removeItem = async () => {
    setIsRemoving(true);
    try {
      await apiRequest("DELETE", `/api/cart/items/${item.id}`, {});
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Item removed",
        description: `${item.product.name} has been removed from your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };
  
  return (
    <div className="flex items-center justify-between py-4 border-b">
      <div className="flex items-center flex-1">
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
          <Link href={`/products/${item.product.id}`}>
            <img
              src={item.product.imageUrl}
              alt={item.product.name}
              className="h-full w-full object-cover object-center"
            />
          </Link>
        </div>
        
        <div className="ml-4 flex-1">
          <Link href={`/products/${item.product.id}`}>
            <h3 className="font-heading font-semibold text-gray-900 hover:text-primary">
              {item.product.name}
            </h3>
          </Link>
          <p className="mt-1 text-sm text-gray-500 line-clamp-1">{item.product.description}</p>
          <p className="mt-1 text-sm font-medium text-accent">${item.product.price.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            onBlur={updateQuantity}
            min="1"
            className="w-16 h-8"
          />
          
          {isUpdating && (
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">${(item.product.price * quantity).toFixed(2)}</p>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={removeItem}
            disabled={isRemoving}
            className="text-gray-500 hover:text-red-500"
          >
            {isRemoving ? (
              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Trash2 size={18} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
