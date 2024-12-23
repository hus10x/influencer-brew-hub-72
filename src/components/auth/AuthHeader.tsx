import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AuthHeaderProps {
  title: string;
}

export const AuthHeader = ({ title }: AuthHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <Button
        variant="ghost"
        className="mb-6 text-primary hover:text-primary/90"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>
      <h2 className="text-center text-3xl font-extrabold text-gray-900">
        {title}
      </h2>
    </div>
  );
};