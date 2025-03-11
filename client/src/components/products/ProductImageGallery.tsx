import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductImageGalleryProps {
  mainImage: string;
  additionalImages?: string[];
}

export default function ProductImageGallery({ mainImage, additionalImages = [] }: ProductImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const allImages = [mainImage, ...additionalImages];
  
  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentImageIndex((prev) => 
        prev === 0 ? allImages.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === allImages.length - 1 ? 0 : prev + 1
      );
    }
  };
  
  return (
    <div className="relative">
      <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-lg bg-gray-100">
        <img 
          src={allImages[currentImageIndex]} 
          alt="Product image" 
          className="w-full h-full object-cover"
        />
        
        {allImages.length > 1 && (
          <>
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute left-2 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-full bg-white opacity-75 hover:opacity-100"
              onClick={() => navigateImage('prev')}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-full bg-white opacity-75 hover:opacity-100"
              onClick={() => navigateImage('next')}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>
      
      {/* Thumbnail Navigation */}
      {allImages.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {allImages.map((image, index) => (
            <button
              key={index}
              className={`h-16 w-16 rounded-md overflow-hidden border-2 ${
                index === currentImageIndex ? 'border-primary' : 'border-transparent'
              }`}
              onClick={() => setCurrentImageIndex(index)}
            >
              <img 
                src={image} 
                alt={`Thumbnail ${index + 1}`} 
                className="w-full h-full object-cover" 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
