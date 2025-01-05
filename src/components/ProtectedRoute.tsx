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
      input.style.fontSize = '16px'; // Minimum font size to prevent zoom
      
      // Prevent zoom on focus
      input.addEventListener('focus', (e) => {
        // Set viewport to prevent zoom
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0');
        }
      });
      
      // Reset viewport on blur
      input.addEventListener('blur', (e) => {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
        }
      });
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
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserType(profile.user_type);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .insert({ id: user.id, user_type: 'user' })
          .single();

        if (error) {
          throw error;
        }

        setUserType(data.user_type);
        setIsAuthenticated(true);
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
