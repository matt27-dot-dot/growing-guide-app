import { NavLink } from "react-router-dom";
import { Home, CheckSquare, User, Calendar, BookOpen, Baby, LogOut, Plus, BookOpen as DiaryIcon, Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";

const sidebarColors = {
  purple: 'from-purple-600 to-pink-600',
  blue: 'from-blue-600 to-cyan-600',
  green: 'from-green-600 to-emerald-600',
  orange: 'from-orange-600 to-red-600',
  pink: 'from-pink-600 to-rose-600',
  indigo: 'from-indigo-600 to-purple-600',
  teal: 'from-teal-600 to-blue-600',
  emerald: 'from-emerald-600 to-green-600',
};

export const RightSidebar = () => {
  const { user, signOut } = useAuth();
  const { sidebarColor } = useTheme();
  
  // Don't render navigation if user is not authenticated
  if (!user) return null;

  const navItems = [
    { to: "/", icon: Home, label: "Dashboard" },
    { to: "/checklist", icon: CheckSquare, label: "Checklist" },
    { to: "/your-baby", icon: Baby, label: "Your Baby" },
    { to: "/diary", icon: DiaryIcon, label: "Diary" },
    { to: "/you", icon: Activity, label: "You" },
    { to: "/knowledge", icon: BookOpen, label: "Knowledge" },
    { to: "/appointments", icon: Calendar, label: "Appointments" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className={`hidden md:flex fixed right-0 top-0 h-full w-64 bg-gradient-to-b ${sidebarColors[sidebarColor as keyof typeof sidebarColors]} text-white z-40`}>
      <div className="flex flex-col h-full">
        {/* Logo/Title */}
        <div className="p-6 border-b border-white/20">
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
                    ? "bg-white/20 text-white shadow-lg"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`
              }
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="p-4 border-t border-white/20 space-y-2">
          <Button 
            variant="secondary" 
            className="w-full justify-start gap-3 bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <Plus size={20} />
            Add Appointment
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleSignOut}
            className="w-full justify-start gap-3 text-white/80 hover:text-white hover:bg-white/10"
          >
            <LogOut size={20} />
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
};
