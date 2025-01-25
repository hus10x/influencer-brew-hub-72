import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider, useAuth } from "@/hooks/AuthProvider";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";

// Lazy load dashboard components
const InfluencerDashboard = lazy(() => import("./pages/InfluencerDashboard"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const AppRoutes = () => {
  const { isLoggedIn, userType } = useAuth();

  // Show loading state while checking auth
  if (isLoggedIn === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={isLoggedIn ? <Navigate to={userType === 'influencer' ? '/influencer' : '/client'} replace /> : <Index />} 
      />
      <Route 
        path="/influencer" 
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <InfluencerDashboard />
          </Suspense>
        } 
      />
      <Route 
        path="/client" 
        element={
          <Suspense fallback={<div>Loading...</div>}>
            <ClientDashboard />
          </Suspense>
        } 
      />
      <Route 
        path="/login" 
        element={
          isLoggedIn ? <Navigate to="/" replace /> : <Login />
        } 
      />
      <Route 
        path="/signup" 
        element={
          isLoggedIn ? <Navigate to="/" replace /> : <SignUp />
        } 
      />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="hikayat-theme">
        <TooltipProvider>
          <AuthProvider>
            <BrowserRouter>
              <Toaster />
              <Sonner />
              <AppRoutes />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
