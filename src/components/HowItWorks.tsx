import { Check } from "lucide-react";
import { memo } from "react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const steps = [
  {
    number: "01",
    title: "Create Your Profile",
    description: "Set up your restaurant profile with photos, menu highlights, and preferences.",
  },
  {
    number: "02",
    title: "Get Matched",
    description: "Our AI finds the perfect influencers based on your cuisine and target audience.",
  },
  {
    number: "03",
    title: "Collaborate",
    description: "Accept collaborations and manage the entire process through our platform.",
  },
] as const;

const StepCard = memo(({ step, index, isInView }: { step: typeof steps[number]; index: number; isInView: boolean }) => (
  <div
    className={`relative p-8 bg-background border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow dark:shadow-none ${isInView ? 'animate-fade-up' : 'opacity-0'}`}
    style={{ animationDelay: `${index * 150}ms` }}
  >
    <div className="flex items-center mb-4">
      <span className="text-4xl font-bold text-purple-500/20 dark:text-purple-500/10">
        {step.number}
      </span>
      <div 
        className={`ml-auto bg-purple-500/10 p-2 rounded-full ${isInView ? 'animate-fade-in' : 'opacity-0'}`}
        style={{ animationDelay: `${(index * 150) + 300}ms` }}
      >
        <Check className="w-5 h-5 text-purple-500" />
      </div>
    </div>
    <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
    <p className="text-muted-foreground">{step.description}</p>
  </div>
));
StepCard.displayName = "StepCard";

const HowItWorks = () => {
  const { ref, isInView } = useScrollAnimation();

  return (
    <section className="py-24 bg-purple-100/80 dark:bg-background px-6">
      <div className="container mx-auto" ref={ref}>
        <div className={`text-center max-w-3xl mx-auto mb-16 ${isInView ? 'animate-fade-up' : 'opacity-0'}`}>
          <span className="px-3 py-1 text-sm font-medium bg-purple-500/10 text-purple-500 rounded-full">
            Simple Process
          </span>
          <h2 className="mt-6 text-4xl font-bold text-foreground">How It Works</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Get started in minutes and begin collaborating with influencers
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;