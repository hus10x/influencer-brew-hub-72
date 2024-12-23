import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export const MobileMenu = () => {
  const navigate = useNavigate();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col gap-4 mt-8">
          <Button 
            className="w-full bg-primary hover:bg-primary/90" 
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
          <Button 
            className="w-full bg-primary hover:bg-primary/90" 
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};