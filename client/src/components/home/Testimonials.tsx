import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Testimonial {
  content: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      content: "I've been able to turn my passion for repurposing furniture into a small business. The platform makes it easy to reach customers who appreciate handcrafted, sustainable items.",
      author: {
        name: "Sarah L.",
        role: "Furniture Upcycler",
        avatar: "https://randomuser.me/api/portraits/women/33.jpg"
      }
    },
    {
      content: "As a buyer, I love that I can find unique items that have stories behind them. Every purchase feels like I'm making a positive impact on the environment.",
      author: {
        name: "Michael T.",
        role: "Sustainable Living Advocate",
        avatar: "https://randomuser.me/api/portraits/men/47.jpg"
      }
    },
    {
      content: "The community here is amazing! I've connected with other creators who share tips and inspiration. My bottle lamp business has grown beyond what I ever imagined.",
      author: {
        name: "Jessica M.",
        role: "Glass Artisan",
        avatar: "https://randomuser.me/api/portraits/women/62.jpg"
      }
    }
  ];

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-heading font-bold text-3xl text-center mb-12">What Our Community Says</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-neutral p-6 rounded-lg relative border-none">
              <div className="text-accent absolute -top-5 left-6 text-4xl">"</div>
              <CardContent className="p-0 pt-4">
                <p className="text-gray-700 mb-4">{testimonial.content}</p>
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={testimonial.author.avatar} alt={testimonial.author.name} />
                    <AvatarFallback>{testimonial.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-heading font-semibold">{testimonial.author.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.author.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
