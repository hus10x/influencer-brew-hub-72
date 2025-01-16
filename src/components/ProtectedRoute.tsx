import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";

// Utility function to prevent iOS zoom on input focus
const preventInputZoom = () => {
  // Add event listeners to all input fields and textareas
  const addZoomPreventionToInputs = () => {
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      if (input instanceof HTMLElement) {
        input.style.fontSize = '16px'; // Minimum font size to prevent zoom
        
        // Prevent zoom on focus
        input.addEventListener('focus', () => {
          // Set viewport to prevent zoom
          const viewport = document.querySelector('meta[name="viewport"]');
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0');
          }
        });
        
        // Reset viewport on blur
        input.addEventListener('blur', () => {
          const viewport = document.querySelector('meta[name="viewport"]');
          if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
          }
        });
      }
    });
  };

  // Initial setup
  addZoomPreventionToInputs();

  // Setup a mutation observer to handle dynamically added inputs
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        addZoomPreventionToInputs();
      }
    });
  });

  // Start observing the document with the configured parameters
  observer.observe(document.body, { childList: true, subtree: true });

  // Return cleanup function
  return () => observer.disconnect();
};

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);

  const location = useLocation();

const navigate = useNavigate();

useEffect(() => {

const checkAuth = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();
    if (profile) {
      setUserType(profile.user_type);
      setIsAuthenticated(true);
      // Check if user is trying to access the wrong dashboard
      const path = location.pathname;
      if (path.includes('/client') && profile.user_type !== 'business') {
        navigate('/influencer');
        toast.error("Access denied. Redirecting to influencer dashboard.");
        return;
      }
      if (path.includes('/influencer') && profile.user_type !== 'influencer') {
        navigate('/client');
        toast.error("Access denied. Redirecting to client dashboard.");
        return;
      }
    }
    setIsLoading(false);
  } catch (error) {
    console.error('Auth check error:', error);
    toast.error('Authentication error');
    setIsAuthenticated(false);
    setIsLoading(false);
  }
};
checkAuth();

  useEffect(() => {
    // Apply zoom prevention after component mounts
    const cleanup = preventInputZoom();
    return cleanup;
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type, email')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserType(profile.user_type);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // If no profile exists, do not create one here
        // This is now handled by signup.tsx
        setIsAuthenticated(false);
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        toast.error('Authentication error');
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};
