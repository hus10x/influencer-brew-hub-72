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
    <section className="py-24 bg-muted/50 dark:bg-background/95 px-6">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-up">
          <span className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full">
            Simple Process
          </span>
          <h2 className="mt-6 text-4xl font-bold text-foreground">How It Works</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Get started in minutes and begin collaborating with influencers
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative p-8 bg-background border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow animate-fade-up dark:shadow-none"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center mb-4">
                <span className="text-4xl font-bold text-primary/20 dark:text-primary/10">
                  {step.number}
                </span>
                <div className="ml-auto bg-primary/10 p-2 rounded-full">
                  <Check className="w-5 h-5 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};