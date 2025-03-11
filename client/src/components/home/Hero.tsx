import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative bg-primary text-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl">
          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl mb-6">Give Products a Second Life</h1>
          <p className="text-lg md:text-xl mb-8">Join our community of eco-conscious buyers and sellers dedicated to reducing waste through creative upcycling.</p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/products">
              <Button className="bg-emerald-500 text-white px-8 py-3 h-auto rounded-full font-heading font-bold text-center hover:bg-emerald-600 transition w-full sm:w-auto">
                Shop Now
              </Button>
            </Link>
            <Link href="/sell">
              <Button variant="outline" className="bg-transparent border-2 border-white text-white px-8 py-3 h-auto rounded-full font-heading font-bold text-center hover:bg-white hover:text-primary transition w-full sm:w-auto">
                Start Selling
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 w-full h-24 bg-white bg-opacity-10" style={{ 
        clipPath: "polygon(100% 0, 0% 100%, 100% 100%)" 
      }}></div>
    </section>
  );
}
