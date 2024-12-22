import { Camera, Users, Zap, Trophy } from "lucide-react";

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
];

export const Features = () => {
  return (
    <section className="py-24 bg-gray-50 px-6">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-up">
          <span className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full">
            Why Choose Us
          </span>
          <h2 className="mt-6 text-4xl font-bold text-gray-900">
            Everything You Need to Grow Your Restaurant
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Simple tools to manage your influencer collaborations and grow your social presence
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <feature.icon className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};