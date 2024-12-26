import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

const Features = lazy(() => import("@/components/Features"));
const HowItWorks = lazy(() => import("@/components/HowItWorks"));
const Footer = lazy(() => import("@/components/Footer"));

// Loading skeleton for Features section
const FeaturesLoadingSkeleton = () => (
  <section className="py-24 bg-muted/50 dark:bg-background/95 px-6">
    <div className="container mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Skeleton className="w-32 h-8 mx-auto" />
        <Skeleton className="h-12 mt-6 w-3/4 mx-auto" />
        <Skeleton className="h-6 mt-4 w-2/3 mx-auto" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 rounded-2xl bg-background border border-border">
            <Skeleton className="w-12 h-12 mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Loading skeleton for HowItWorks section
const HowItWorksLoadingSkeleton = () => (
  <section className="py-24 bg-muted/50 dark:bg-background/95 px-6">
    <div className="container mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Skeleton className="w-32 h-8 mx-auto" />
        <Skeleton className="h-12 mt-6 w-3/4 mx-auto" />
        <Skeleton className="h-6 mt-4 w-2/3 mx-auto" />
      </div>
      <div className="grid lg:grid-cols-3 gap-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-8 rounded-2xl bg-background border border-border">
            <div className="flex items-center mb-4">
              <Skeleton className="w-12 h-12" />
              <Skeleton className="w-10 h-10 ml-auto" />
            </div>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Loading skeleton for Footer
const FooterLoadingSkeleton = () => (
  <footer className="bg-background border-t">
    <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
      <Skeleton className="h-8 w-32 mb-8" />
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-6 w-24" />
            {[...Array(4)].map((_, j) => (
              <Skeleton key={j} className="h-4 w-32" />
            ))}
          </div>
        ))}
      </div>
    </div>
  </footer>
);

const Index = () => {
  const { isLoggedIn, userType, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isLoggedIn) {
    return <Navigate to={userType === 'influencer' ? '/influencer' : '/client'} replace />;
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Hero />
      <Suspense fallback={<FeaturesLoadingSkeleton />}>
        <Features />
      </Suspense>
      <Suspense fallback={<HowItWorksLoadingSkeleton />}>
        <HowItWorks />
      </Suspense>
      <Suspense fallback={<FooterLoadingSkeleton />}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;
