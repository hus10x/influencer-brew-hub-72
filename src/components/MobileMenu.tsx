import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogIn, UserPlus, Moon, Sun, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";
import { useState } from "react";

export const MobileMenu = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [hasToggledTheme, setHasToggledTheme] = useState(false);

  const handleThemeToggle = () => {
    if (!hasToggledTheme && theme === 'system') {
      setTheme('dark');
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
    setHasToggledTheme(true);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col gap-4">
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => navigate("/login")}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            onClick={() => navigate("/signup")}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Sign Up
          </Button>
          <Button
            variant="ghost"
            className="justify-start"
            onClick={handleThemeToggle}
          >
            {!hasToggledTheme && theme === "system" ? (
              <Monitor className="mr-2 h-4 w-4" />
            ) : theme === "dark" ? (
              <Moon className="mr-2 h-4 w-4" />
            ) : (
              <Sun className="mr-2 h-4 w-4" />
            )}
            {!hasToggledTheme && theme === "system"
              ? "System Theme"
              : theme === "dark"
              ? "Dark Mode"
              : "Light Mode"}
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
};