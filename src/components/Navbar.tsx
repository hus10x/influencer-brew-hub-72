import { Logo } from "./navbar/Logo";
import { AuthButtons } from "./navbar/AuthButtons";
import { ThemeToggle } from "./navbar/ThemeToggle";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/90">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <AuthButtons />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};