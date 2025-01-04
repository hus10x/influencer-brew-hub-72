import { memo } from "react";
import { Camera, Users, Zap, Trophy } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const features = [
  {
    icon: Camera,
    title: "Quality Content",
    description: "Get professional food photography and authentic reviews from trusted influencers.",
  },
  {
    icon: Users,
    title: "Targeted Reach",
    description: "Connect with influencers whose audience matches your restaurant's ideal customers.",
  },
  {
    icon: Zap,
    title: "Quick Matching",
    description: "Our AI matches you with the perfect influencers in minutes, not days.",
  },
  {
    icon: Trophy,
    title: "Proven Results",
    description: "Track your success with detailed analytics and performance metrics.",
  },
] as const;

const FeatureCard = memo(({ feature, index, isInView }: { feature: typeof features[number]; index: number; isInView: boolean }) => (
  <div
    className={`p-6 rounded-2xl bg-background border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 ${
      isInView ? 'animate-fade-up opacity-100' : 'opacity-0'
    }`}
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <feature.icon className="w-12 h-12 text-primary mb-4" />
    <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
    <p className="text-muted-foreground">{feature.description}</p>
  </div>
));
FeatureCard.displayName = "FeatureCard";

const Features = () => {
  const { ref, isInView } = useScrollAnimation();

  return (
    <section className="py-24 bg-purple-50/80 dark:bg-background px-6">
      <div className="container mx-auto" ref={ref}>
        <div className={`text-center max-w-3xl mx-auto mb-16 ${isInView ? 'animate-fade-up' : 'opacity-0'}`}>
          <span className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full">
            Why Choose Us
          </span>
          <h2 className="mt-6 text-4xl font-bold text-foreground">
            Everything You Need to Grow Your Restaurant
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Simple tools to manage your influencer collaborations and grow your social presence
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;