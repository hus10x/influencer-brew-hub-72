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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          if (error.message.includes('refresh_token_not_found')) {
            await supabase.auth.signOut();
            toast.error("Session expired. Please login again.");
          }
          if (mounted) {
            setIsLoggedIn(false);
            setIsLoading(false);
          }
          return;
        }

        if (session) {
          console.log('Session found, fetching profile...');
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error('Profile error:', profileError);
            if (mounted) {
              setIsLoggedIn(false);
              setIsLoading(false);
            }
            return;
          }

          if (mounted) {
            console.log('Setting user type:', profile?.user_type);
            setUserType(profile?.user_type || null);
            setIsLoggedIn(true);
          }
        } else {
          console.log('No session found');
          if (mounted) {
            setIsLoggedIn(false);
          }
        }
        
        if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        if (mounted) {
          setIsLoggedIn(false);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event);
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
          
          if (mounted) {
            setUserType(profile?.user_type || null);
          }
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
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