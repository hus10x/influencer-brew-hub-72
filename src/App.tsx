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
import { SkeletonLoader } from "@/components/SkeletonLoader"; // Your skeleton loader

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

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <Suspense fallback={<SkeletonLoader />}>
            {isLoggedIn ? (
              <Navigate to={userType === 'influencer' ? '/influencer' : '/client'} replace />
            ) : <Index />}
          </Suspense>
        } 
      />
      <Route 
        path="/influencer" 
        element={
          <ProtectedRoute type="influencer">
            <Suspense fallback={<SkeletonLoader />}>
              <InfluencerDashboard />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/client" 
        element={
          <ProtectedRoute type="business">
            <Suspense fallback={<SkeletonLoader />}>
              <ClientDashboard />
            </Suspense>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/login" 
        element={
          <Suspense fallback={<SkeletonLoader />}>
            {isLoggedIn ? <Navigate to="/" replace /> : <Login />}
          </Suspense>
        } 
      />
      <Route 
        path="/signup" 
        element={
          <Suspense fallback={<SkeletonLoader />}>
            {isLoggedIn ? <Navigate to="/" replace /> : <SignUp />}
          </Suspense>
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
