import { Star, StarHalf } from "lucide-react";

interface RatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
}

export default function Rating({ value, max = 5, size = "sm" }: RatingProps) {
  // Round to nearest half
  const roundedValue = Math.round(value * 2) / 2;
  
  const sizeClass = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }[size];
  
  return (
    <div className="flex">
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        
        // Full star
        if (roundedValue >= starValue) {
          return <Star key={i} className={`text-yellow-400 fill-yellow-400 ${sizeClass}`} />;
        }
        // Half star
        else if (roundedValue === starValue - 0.5) {
          return <StarHalf key={i} className={`text-yellow-400 fill-yellow-400 ${sizeClass}`} />;
        }
        // Empty star
        else {
          return <Star key={i} className={`text-yellow-400 ${sizeClass}`} />;
        }
      })}
    </div>
  );
}
