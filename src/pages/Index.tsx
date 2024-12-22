import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Hero />
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Index;