import { NavLink } from "react-router-dom";
import { Home, CheckSquare, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";

export const Navigation = () => {
  const navItems = [
    { to: "/", icon: Home, label: "Dashboard" },
    { to: "/checklist", icon: CheckSquare, label: "Checklist" },
  ];

  return (
    <Card className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-card/95 backdrop-blur shadow-soft border-0 z-50">
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