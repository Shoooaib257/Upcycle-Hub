import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Successfully subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section className="bg-neutral py-12">
      <div className="container mx-auto px-4">
        <Card className="bg-white p-8 md:p-12 rounded-lg shadow-md max-w-4xl mx-auto">
          <CardContent className="p-0">
            <div className="text-center mb-8">
              <h2 className="font-heading font-bold text-2xl md:text-3xl mb-3">Stay Updated on New Upcycled Treasures</h2>
              <p className="text-gray-600">Join our newsletter to receive updates on new products, creative ideas, and sustainable living tips.</p>
            </div>
            
            <form className="flex flex-col md:flex-row gap-4" onSubmit={handleSubmit}>
              <Input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-3 h-auto border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button 
                type="submit" 
                className="bg-primary text-white px-6 py-3 h-auto rounded-full font-heading font-semibold hover:bg-opacity-90 transition"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
            
            <p className="text-xs text-gray-500 mt-4 text-center">By subscribing, you agree to our privacy policy and consent to receive updates from EcoRevive.</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
