import { Leaf, HandHeart, Recycle } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Leaf className="text-primary text-4xl" />,
      title: "Eco-Friendly Products",
      description: "Every purchase helps reduce waste and supports sustainable consumption."
    },
    {
      icon: <HandHeart className="text-primary text-4xl" />,
      title: "Support Creators",
      description: "Connect directly with artisans who transform discarded items into treasures."
    },
    {
      icon: <Recycle className="text-primary text-4xl" />,
      title: "Circular Economy",
      description: "Be part of a movement that extends product lifecycles and saves resources."
    }
  ];

  return (
    <section className="bg-white py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6">
              <div className="inline-block p-4 bg-neutral rounded-full mb-4">
                {feature.icon}
              </div>
              <h3 className="font-heading font-bold text-xl mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
