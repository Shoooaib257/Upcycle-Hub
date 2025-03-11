import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function JoinCommunity() {
  return (
    <section className="bg-primary py-16 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="font-heading font-bold text-3xl mb-6">Ready to Give Old Items New Life?</h2>
        <p className="max-w-2xl mx-auto mb-8 text-lg">Join thousands of eco-conscious sellers who are turning trash into treasure while building a more sustainable future.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/sell">
            <Button className="bg-white text-primary px-8 py-3 h-auto rounded-full font-heading font-semibold hover:bg-neutral transition w-full sm:w-auto">
              Start Selling Today
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" className="border-2 border-white text-white px-8 py-3 h-auto rounded-full font-heading font-semibold hover:bg-white hover:text-primary transition w-full sm:w-auto">
              Learn How It Works
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
