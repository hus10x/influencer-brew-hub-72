import { Link } from "react-router-dom";
import { NotificationsPopover } from "@/components/notifications/NotificationsPopover";
import { useUser } from "@/hooks/useUser";

export const Navbar = () => {
  const { user } = useUser();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Collab Now
            </span>
          </Link>
          <Link to="/about" className="mr-6">About</Link>
          <Link to="/collaborations" className="mr-6">Collaborations</Link>
          <Link to="/dashboard" className="mr-6">Dashboard</Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <input
              type="text"
              placeholder="Search..."
              className="w-full rounded-md border border-muted p-2"
            />
          </div>
          <div className="flex items-center gap-2">
            {user && <NotificationsPopover />}
            <Link to="/profile" className="flex items-center">
              <span className="hidden md:inline">Profile</span>
            </Link>
            <Link to="/logout" className="flex items-center">
              <span className="hidden md:inline">Logout</span>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};
