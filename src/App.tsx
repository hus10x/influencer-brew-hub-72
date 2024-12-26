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
import { toast } from "sonner";

const queryClient = new QueryClient();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          if (error.message.includes('refresh_token_not_found')) {
            await supabase.auth.signOut();
            toast.error("Session expired. Please login again.");
          }
          setIsLoggedIn(false);
          return;
        }

        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .maybeSingle();

          setUserType(profile?.user_type || null);
        }
        
        setIsLoggedIn(!!session);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsLoggedIn(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        setIsLoggedIn(true);
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setUserType(null);
      } else {
        setIsLoggedIn(!!session);
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .maybeSingle();
          setUserType(profile?.user_type || null);
        }
      }
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
              <Route 
                path="/" 
                element={
                  isLoggedIn ? (
                    userType === 'influencer' ? (
                      <Navigate to="/influencer" replace />
                    ) : (
                      <Navigate to="/client" replace />
                    )
                  ) : (
                    <Index />
                  )
                } 
              />
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
                  isLoggedIn ? (
                    userType === 'influencer' ? (
                      <Navigate to="/influencer" replace />
                    ) : (
                      <Navigate to="/client" replace />
                    )
                  ) : (
                    <Login />
                  )
                } 
              />
              <Route 
                path="/signup" 
                element={
                  isLoggedIn ? (
                    userType === 'influencer' ? (
                      <Navigate to="/influencer" replace />
                    ) : (
                      <Navigate to="/client" replace />
                    )
                  ) : (
                    <SignUp />
                  )
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