import { Check } from "lucide-react";

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
];

export const HowItWorks = () => {
  return (
    <section className="py-24 bg-muted px-6">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-up">
          <span className="px-3 py-1 text-sm font-medium bg-secondary/30 rounded-full">
            Simple Process
          </span>
          <h2 className="mt-6 text-4xl font-bold">How It Works</h2>
          <p className="mt-4 text-lg text-gray-600">
            Get started in minutes and begin collaborating with influencers
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative p-8 bg-white rounded-2xl shadow-sm animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center mb-4">
                <span className="text-4xl font-bold text-accent/20">
                  {step.number}
                </span>
                <div className="ml-auto bg-accent/10 p-2 rounded-full">
                  <Check className="w-5 h-5 text-accent" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};