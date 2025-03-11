import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CartItem, Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface CartSummaryProps {
  items: (CartItem & { product: Product })[];
  redirectToCheckout?: boolean;
}

export default function CartSummary({ items, redirectToCheckout = false }: CartSummaryProps) {
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Calculate totals
  const subtotal = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const shipping = items.length > 0 ? 5.99 : 0;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to your cart before checking out",
        variant: "destructive",
      });
      return;
    }
    
    navigate("/checkout");
  };

  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle className="font-heading text-xl">Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium">${shipping.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="font-heading font-semibold">Total</span>
            <span className="font-heading font-semibold text-lg">${total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {redirectToCheckout ? (
          <Button 
            className="w-full bg-primary text-white rounded-full py-2 font-heading font-semibold hover:bg-opacity-90"
            onClick={handleCheckout}
            disabled={items.length === 0}
          >
            Proceed to Checkout
          </Button>
        ) : (
          <Link href="/products">
            <Button 
              variant="outline" 
              className="w-full border-primary text-primary rounded-full py-2 font-heading font-semibold hover:bg-primary hover:text-white"
            >
              Continue Shopping
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
