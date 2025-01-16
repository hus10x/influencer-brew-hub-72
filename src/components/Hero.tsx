import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Navbar } from "./Navbar";
import { HeroCarousel } from "./HeroCarousel";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Hero = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const checkUserType = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserType(profile.user_type);
        }
      }
    };

    checkUserType();
  }, []);

  const handleNavigation = async (type: 'influencer' | 'business') => {
    if (!userType) {
      navigate(`/${type}`);
      return;
    }

    if (type === 'influencer' && userType === 'business') {
      toast.error("You have a business profile. Redirecting to client dashboard.");
      navigate('/client');
      return;
    }

    if (type === 'business' && userType === 'influencer') {
      toast.error("You have an influencer profile. Redirecting to influencer dashboard.");
      navigate('/influencer');
      return;
    }

    navigate(`/${type}`);
  };

  return (
    <>
      <Navbar />
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background text-foreground px-6 pt-20 pb-12 md:pb-16 lg:pb-24">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-up">
            <div>
              <span className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full">
                Launch Your Social Journey
              </span>
              <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-foreground">
                Connect Food Influencers with Restaurants Instantly
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Whether you're a food influencer looking for exciting collaborations or a restaurant wanting to boost your social presence, we've got you covered.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => handleNavigation('influencer')}
              >
                I'm an Influencer <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                onClick={() => handleNavigation('business')}
              >
                I'm a Business <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative animate-fade-in lg:block">
            <HeroCarousel />
          </div>
        </div>
      </section>
    </>
  );
};