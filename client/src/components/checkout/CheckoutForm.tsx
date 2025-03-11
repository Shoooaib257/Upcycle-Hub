import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useStripe, Elements, PaymentElement, useElements, AddressElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CartItem, Product } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51OZIBnQWr0fF1SuQ8y7vOeWH99ECmx2gGS5Qd7YYg4XQc6s5PyeUxHGhbzKglG3aDRbpGvWgfiQjXHzA6OLpIzwF00uRPGGcjl';
const stripePromise = loadStripe(stripeKey);

interface CheckoutFormComponentProps {
  clientSecret: string;
  totalAmount: number;
  shippingAddress: string;
  setShippingAddress: (address: string) => void;
}

function CheckoutFormComponent({ 
  clientSecret, 
  totalAmount,
  shippingAddress,
  setShippingAddress 
}: CheckoutFormComponentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create order in our system first
      await apiRequest("POST", "/api/orders", { 
        shippingAddress 
      });
      
      // Then confirm payment with Stripe
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message);
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Payment succeeded
        queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
        toast({
          title: "Payment Successful",
          description: "Thank you for your purchase!",
        });
        navigate("/");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddressChange = (event: any) => {
    const addressValues = event.value;
    if (addressValues.address) {
      const { line1, line2, city, state, postal_code, country } = addressValues.address;
      const formattedAddress = `${line1}${line2 ? `, ${line2}` : ''}, ${city}, ${state} ${postal_code}, ${country}`;
      setShippingAddress(formattedAddress);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Shipping Information</CardTitle>
          </CardHeader>
          <CardContent>
            <AddressElement 
              options={{
                mode: 'shipping',
                allowedCountries: ['US', 'CA', 'GB'],
              }}
              onChange={handleAddressChange}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentElement />
          </CardContent>
        </Card>

        {errorMessage && (
          <div className="text-red-500 text-sm mt-2">
            {errorMessage}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-primary text-white rounded-full py-3 font-heading font-semibold hover:bg-opacity-90"
          disabled={isProcessing || !stripe || !elements}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </div>
          ) : (
            `Pay $${totalAmount.toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  );
}

interface CheckoutFormProps {
  items: (CartItem & { product: Product })[];
}

export default function CheckoutForm({ items }: CheckoutFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState("");
  const { toast } = useToast();

  // Calculate total amount
  const subtotal = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const shipping = items.length > 0 ? 5.99 : 0;
  const total = subtotal + shipping;

  // Create PaymentIntent as soon as the component loads
  useState(() => {
    const createPaymentIntent = async () => {
      setIsLoading(true);
      try {
        const response = await apiRequest("POST", "/api/create-payment-intent", {
          amount: total,
        });
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error: any) {
        setErrorMessage(error.message || "Failed to load payment processing");
        toast({
          title: "Error",
          description: error.message || "Failed to load payment processing",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (items.length > 0) {
      createPaymentIntent();
    } else {
      setIsLoading(false);
      setErrorMessage("Your cart is empty");
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-heading font-semibold text-red-500 mb-2">
          {errorMessage}
        </h3>
        <p className="text-gray-600 mb-4">Please try again or contact customer support.</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-heading font-semibold mb-2">
          Your cart is empty
        </h3>
        <p className="text-gray-600 mb-4">Add items to your cart before proceeding to checkout.</p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-heading font-semibold text-red-500 mb-2">
          Payment processing unavailable
        </h3>
        <p className="text-gray-600 mb-4">Please try again later or contact customer support.</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutFormComponent 
        clientSecret={clientSecret} 
        totalAmount={total} 
        shippingAddress={shippingAddress}
        setShippingAddress={setShippingAddress}
      />
    </Elements>
  );
}
