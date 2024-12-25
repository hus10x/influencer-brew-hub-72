import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Logo = () => {
  const navigate = useNavigate();
  
  return (
    <div 
      className="cursor-pointer flex items-center space-x-3" 
      onClick={() => navigate("/")}
    >
      <BookOpen className="h-6 w-6 text-primary drop-shadow-sm" />
      <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-sans text-2xl font-bold tracking-tight lowercase drop-shadow-sm">
        hikayat
      </span>
    </div>
  );
};