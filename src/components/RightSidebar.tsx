import { NavLink } from "react-router-dom";
import { Home, CheckSquare, User, Calendar, BookOpen, Baby, LogOut, Plus, BookOpen as DiaryIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export const RightSidebar = () => {
  const { user, signOut } = useAuth();
  
  // Don't render navigation if user is not authenticated
  if (!user) return null;

  const navItems = [
    { to: "/", icon: Home, label: "Dashboard" },
    { to: "/checklist", icon: CheckSquare, label: "Checklist" },
    { to: "/your-baby", icon: Baby, label: "Your Baby" },
    { to: "/diary", icon: DiaryIcon, label: "Diary" },
    { to: "/knowledge", icon: BookOpen, label: "Knowledge" },
    { to: "/appointments", icon: Calendar, label: "Appointments" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="hidden md:flex fixed right-0 top-0 h-full w-64 bg-gradient-to-b from-primary to-primary/90 text-primary-foreground z-40">
      <div className="flex flex-col h-full">
        {/* Logo/Title */}
        <div className="p-6 border-b border-primary-foreground/20">
          <h1 className="text-2xl font-bold">Baby Journey</h1>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground shadow-lg"
                    : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                }`
              }
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="p-4 border-t border-primary-foreground/20 space-y-2">
          <Button 
            variant="secondary" 
            className="w-full justify-start gap-3 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20"
          >
            <Plus size={20} />
            Add Appointment
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleSignOut}
            className="w-full justify-start gap-3 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <LogOut size={20} />
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
};
