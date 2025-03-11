import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RecycleIcon, Leaf, HandHeart, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-neutral">
      {/* Hero Section */}
      <section className="bg-primary text-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading font-bold text-4xl md:text-5xl mb-6">Our Mission</h1>
            <p className="text-lg md:text-xl mb-0">
              At EcoRevive, we're dedicated to creating a marketplace where creativity meets sustainability, giving new life to items that would otherwise end up in landfills.
            </p>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading font-bold text-3xl mb-6">Our Vision</h2>
              <p className="text-gray-700 mb-4">
                We envision a world where consumption is mindful, waste is minimized, and creativity transforms discarded items into valuable, beautiful products.
              </p>
              <p className="text-gray-700 mb-6">
                By connecting eco-conscious buyers with innovative upcycling artists and craftspeople, we're building a community that values sustainability, craftsmanship, and the stories behind each unique creation.
              </p>
              <Link href="/products">
                <Button className="bg-primary text-white">Explore Products</Button>
              </Link>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=2874&ixlib=rb-4.0.3" 
                alt="Upcycling workshop" 
                className="rounded-lg shadow-md w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-heading font-bold text-3xl text-center mb-12">Our Core Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-none">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 bg-neutral rounded-full w-16 h-16 flex items-center justify-center">
                  <RecycleIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2">Sustainability</h3>
                <p className="text-gray-600">
                  We prioritize environmental impact in everything we do, from the products we feature to our operations.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 bg-neutral rounded-full w-16 h-16 flex items-center justify-center">
                  <Leaf className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2">Creativity</h3>
                <p className="text-gray-600">
                  We celebrate innovative thinking that transforms waste into wonderful, useful products.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 bg-neutral rounded-full w-16 h-16 flex items-center justify-center">
                  <HandHeart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2">Community</h3>
                <p className="text-gray-600">
                  We foster connections between creators and buyers who share a passion for sustainable living.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 bg-neutral rounded-full w-16 h-16 flex items-center justify-center">
                  <Globe className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2">Transparency</h3>
                <p className="text-gray-600">
                  We believe in honest communication about the origins and impact of every item sold.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-heading font-bold text-3xl text-center mb-12">How Upcycling Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="font-heading font-semibold text-xl mb-2">Collection</h3>
              <p className="text-gray-700">
                Materials that would otherwise be discarded are collected and sorted based on their potential.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="font-heading font-semibold text-xl mb-2">Transformation</h3>
              <p className="text-gray-700">
                Creative artisans reimagine and reconstruct these materials into beautiful, functional products.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="font-heading font-semibold text-xl mb-2">New Life</h3>
              <p className="text-gray-700">
                The revived products find new homes with conscious consumers who value sustainability and uniqueness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Environmental Impact Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading font-bold text-3xl mb-8">Our Environmental Impact</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div>
              <div className="text-4xl font-heading font-bold mb-2">1,250+</div>
              <p>Upcycled products sold</p>
            </div>
            
            <div>
              <div className="text-4xl font-heading font-bold mb-2">8,500 kg</div>
              <p>Waste diverted from landfills</p>
            </div>
            
            <div>
              <div className="text-4xl font-heading font-bold mb-2">120+</div>
              <p>Artisans supported</p>
            </div>
          </div>
          
          <p className="max-w-2xl mx-auto">
            Every purchase on EcoRevive contributes to reducing waste, supporting sustainable practices, and building a circular economy where resources are valued and reused.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-heading font-bold text-3xl mb-4">Join Our Sustainable Journey</h2>
          <p className="text-gray-700 max-w-2xl mx-auto mb-8">
            Whether you're a creator with a passion for upcycling or a conscious consumer looking for unique, eco-friendly products, there's a place for you in our community.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/products">
              <Button className="bg-primary text-white px-8">Shop Now</Button>
            </Link>
            <Link href="/sell">
              <Button variant="outline" className="border-primary text-primary px-8">Become a Seller</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
