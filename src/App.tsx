import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import InfluencerDashboard from "./pages/InfluencerDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsLoggedIn(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Show loading state while checking auth
  if (isLoggedIn === null) {
    return <div>Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="app-theme">
        <TooltipProvider>
          <BrowserRouter>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route 
                path="/influencer" 
                element={
                  <ProtectedRoute>
                    <InfluencerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/client" 
                element={
                  <ProtectedRoute>
                    <ClientDashboard />
                  </ProtectedRoute>
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
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;