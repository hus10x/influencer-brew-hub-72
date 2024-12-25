import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus, Moon, Sun, LogOut, BookOpen } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { MobileMenu } from "./MobileMenu";

export const Navbar = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
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

  const handleLogout = async () => {
    try {
      // Clear local state first
      setIsLoggedIn(false);
      
      // Attempt to sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        // If it's a session not found error, we can ignore it since the user is already logged out
        if (!error.message.includes('session_not_found')) {
          toast.error("Error during logout");
          return;
        }
      }
      
      // Always navigate and show success message
      navigate("/");
      toast.success("Logged out successfully");
      
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if there's an error, ensure the user is logged out locally
      navigate("/");
      toast.error("Error during logout, but you've been logged out locally");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/90">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="cursor-pointer flex items-center space-x-3" 
            onClick={() => navigate("/")}
          >
            <BookOpen className="h-6 w-6 text-primary drop-shadow-sm" />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-sans text-2xl font-bold tracking-tight lowercase drop-shadow-sm">
              hikayat
            </span>
          </div>
          <div className="flex items-center gap-4">
            {!isLoggedIn ? (
              <>
                <div className="hidden lg:flex items-center gap-4">
                  <Button variant="outline" onClick={() => navigate("/login")}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                  <Button onClick={() => navigate("/signup")} className="bg-primary hover:bg-primary/90">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign Up
                  </Button>
                </div>
                <MobileMenu />
              </>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};