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
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="app-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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