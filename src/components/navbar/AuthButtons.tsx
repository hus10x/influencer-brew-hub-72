import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { MobileMenu } from "../MobileMenu";

export const AuthButtons = () => {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();

  if (!isLoggedIn) {
    return (
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
    );
  }

  return (
    <Button 
      variant="outline" 
      onClick={logout}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
};