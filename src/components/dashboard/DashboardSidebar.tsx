import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, LogOut, Sun, Moon } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  sidebarItems: SidebarItem[];
}

export const DashboardSidebar = ({ activeTab, onTabChange, sidebarItems }: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out");
    }
  };

  return (
    <aside className="w-64 border-r border-border/90 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 min-h-screen fixed top-0 left-0 flex flex-col h-screen overflow-y-auto">
      <div className="p-6 border-b border-border/90 flex items-center space-x-3">
        <BookOpen className="h-6 w-6 text-primary drop-shadow-sm" />
        <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-sans text-2xl font-bold tracking-tight lowercase drop-shadow-sm">
          hikayat
        </span>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors border-l-2 ${
              activeTab === item.id
                ? "bg-primary/10 text-primary font-medium border-primary"
                : "text-foreground/70 hover:bg-primary/5 hover:text-foreground border-transparent hover:border-primary/50"
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-border/90 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="hover:bg-primary/10"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
        <Button 
          variant="ghost" 
          className="flex-1 flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-all duration-200 ease-in-out transform hover:scale-[1.02]"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
};