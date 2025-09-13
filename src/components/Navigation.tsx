import { NavLink } from "react-router-dom";
import { Home, CheckSquare, User, Calendar, BookOpen, Baby } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export const Navigation = () => {
  const { user } = useAuth();
  
  // Don't render navigation if user is not authenticated
  if (!user) return null;

  const navItems = [
    { to: "/", icon: Home, label: "Dashboard" },
    { to: "/checklist", icon: CheckSquare, label: "Checklist" },
    { to: "/your-baby", icon: Baby, label: "Your Baby" },
    { to: "/knowledge", icon: BookOpen, label: "Knowledge" },
    { to: "/appointments", icon: Calendar, label: "Appointments" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <Card className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-card/95 backdrop-blur shadow-soft border-0 z-50">
      <nav className="flex gap-1 p-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-6 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`
            }
          >
            <Icon size={20} />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
    </Card>
  );
};