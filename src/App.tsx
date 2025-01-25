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

// Lazy load dashboard components (they already have their own skeleton loaders)
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

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isLoggedIn ? (
            <Navigate to={userType === 'influencer' ? '/influencer' : '/client'} replace />
          ) : <Index />
        } 
      />
      <Route 
        path="/influencer" 
        element={
          <ProtectedRoute type="influencer">
            <InfluencerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/client" 
        element={
          <ProtectedRoute type="business">
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
  );
};

const ProtectedRoute = ({ children, type }: { children: React.ReactNode; type: 'influencer' | 'business' }) => {
  const { isLoggedIn, userType } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (userType !== type) {
    return <Navigate to={type === 'influencer' ? '/client' : '/influencer'} replace />;
  }

  return <>{children}</>;
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
