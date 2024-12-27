import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { memo, useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const images = [
  "/lovable-uploads/34b3a2f1-c4ed-46e2-bcc2-52ccb30bddae.png",
  "/lovable-uploads/05b8806a-6915-464c-9518-63b9c8007a70.png",
  "/lovable-uploads/0bc3ee17-68a8-49d5-b5c1-1db53b59e416.png",
  "/lovable-uploads/1bd0382b-9245-47d9-9071-9cddd6dbfa66.png",
] as const;

const CarouselImage = memo(({ src, index, onLoad }: { src: string; index: number; onLoad: () => void }) => (
  <img
    src={src}
    alt={`Slide ${index + 1}`}
    className="rounded-3xl shadow-xl w-full object-cover aspect-[4/3] transition-opacity duration-300"
    loading={index === 0 ? "eager" : "lazy"}
    onLoad={onLoad}
  />
));
CarouselImage.displayName = "CarouselImage";

export const HeroCarousel = () => {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.add(index);
      if (newSet.size === images.length) {
        setAllImagesLoaded(true);
      }
      return newSet;
    });
  }, []);

  return (
    <Carousel className="relative w-full max-w-[800px] mx-auto" opts={{ loop: true }}>
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index} className="relative">
            {!loadedImages.has(index) && (
              <Skeleton className="w-full rounded-3xl aspect-[4/3] absolute inset-0" />
            )}
            <CarouselImage
              src={image}
              index={index}
              onLoad={() => handleImageLoad(index)}
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