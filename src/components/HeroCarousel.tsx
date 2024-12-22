import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const images = [
  "/lovable-uploads/34b3a2f1-c4ed-46e2-bcc2-52ccb30bddae.png",
  "/lovable-uploads/05b8806a-6915-464c-9518-63b9c8007a70.png",
  "/lovable-uploads/0bc3ee17-68a8-49d5-b5c1-1db53b59e416.png",
  "/lovable-uploads/1bd0382b-9245-47d9-9071-9cddd6dbfa66.png",
];

export const HeroCarousel = () => {
  return (
    <Carousel className="relative w-full">
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={index}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl z-10" />
              <img
                src={image}
                alt={`Slide ${index + 1}`}
                className="rounded-3xl shadow-xl w-full object-cover aspect-[4/3]"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  );
};