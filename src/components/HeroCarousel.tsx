import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const images = [
  "/lovable-uploads/34b3a2f1-c4ed-46e2-bcc2-52ccb30bddae.png",
  "/lovable-uploads/05b8806a-6915-464c-9518-63b9c8007a70.png",
  "/lovable-uploads/0bc3ee17-68a8-49d5-b5c1-1db53b59e416.png",
  "/lovable-uploads/1bd0382b-9245-47d9-9071-9cddd6dbfa66.png",
];

export const HeroCarousel = () => {
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(new Array(images.length).fill(false));
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  useEffect(() => {
    // Preload all images
    const imageObjects = images.map((src, index) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setImagesLoaded(prev => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
      };
      return img;
    });

    // Check if all images are loaded
    const checkAllLoaded = () => {
      if (imagesLoaded.every(loaded => loaded)) {
        setAllImagesLoaded(true);
      }
    };

    checkAllLoaded();
    return () => {
      // Cleanup image objects
      imageObjects.forEach(img => {
        img.onload = null;
      });
    };
  }, [imagesLoaded]);

  return (
    <Carousel className="relative w-full" opts={{ loop: true }}>
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            {!imagesLoaded[index] && (
              <Skeleton className="w-full rounded-3xl aspect-[4/3]" />
            )}
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              className={`rounded-3xl shadow-xl w-full object-cover aspect-[4/3] transition-opacity duration-300 ${
                imagesLoaded[index] ? 'opacity-100' : 'opacity-0'
              }`}
              loading="eager"
              onLoad={() => {
                setImagesLoaded(prev => {
                  const newState = [...prev];
                  newState[index] = true;
                  return newState;
                });
              }}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      {allImagesLoaded && (
        <>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </>
      )}
    </Carousel>
  );
};