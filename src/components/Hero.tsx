import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary to-white px-6">
      <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 animate-fade-up">
          <div>
            <span className="px-3 py-1 text-sm font-medium bg-secondary/30 rounded-full">
              Launch Your Food Journey
            </span>
            <h1 className="mt-6 text-5xl md:text-6xl font-bold leading-tight">
              Connect Food Influencers with Restaurants Instantly
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              Whether you're a food influencer looking for exciting collaborations or a restaurant wanting to boost your social presence, we've got you covered.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90"
              onClick={() => navigate("/influencer")}
            >
              I'm an Influencer <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/client")}
            >
              I'm a Business
            </Button>
          </div>
        </div>
        <div className="relative animate-fade-in lg:block">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl" />
          <img
            src="https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"
            alt="Food presentation"
            className="rounded-3xl shadow-xl w-full object-cover aspect-[4/3]"
          />
        </div>
      </div>
    </section>
  );
};