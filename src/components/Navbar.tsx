import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus, Moon, Sun, LogOut, BookOpen, Monitor } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { MobileMenu } from "./MobileMenu";

export const Navbar = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [hasToggledTheme, setHasToggledTheme] = useState(false);

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
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        toast.error("There was an issue with the logout");
      } else {
        setIsLoggedIn(false);
        toast.success("Logged out successfully");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("There was an issue with the logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleThemeToggle = () => {
    if (!hasToggledTheme && theme === 'system') {
      setTheme('dark');
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
    setHasToggledTheme(true);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm dark:shadow-none">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="cursor-pointer flex items-center space-x-3" 
            onClick={() => navigate("/")}
          >
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-sans text-2xl font-bold tracking-tight text-primary">
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
                  <Button onClick={() => navigate("/signup")}>
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
                disabled={isLoggingOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleThemeToggle}
            >
              {!hasToggledTheme && theme === "system" ? (
                <Monitor className="h-5 w-5" />
              ) : theme === "dark" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};