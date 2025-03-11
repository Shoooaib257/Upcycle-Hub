import { Link } from "wouter";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface CategoryCardProps {
  name: string;
  image: string;
  link: string;
}

const CategoryCard = ({ name, image, link }: CategoryCardProps) => {
  return (
    <Link href={link}>
      <a className="group relative rounded-lg overflow-hidden bg-white shadow-md hover:shadow-lg transition block">
        <AspectRatio ratio={1 / 1}>
          <img 
            src={image} 
            alt={name} 
            className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-heading font-medium text-lg">{name}</h3>
          </div>
        </AspectRatio>
      </a>
    </Link>
  );
};

export default CategoryCard;
