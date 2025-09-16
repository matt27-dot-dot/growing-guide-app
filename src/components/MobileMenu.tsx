import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Home, CheckSquare, User, Calendar, BookOpen, Baby, LogOut, Plus, BookOpen as DiaryIcon, Menu, X, Activity, HelpCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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

export const MobileMenu = () => {
  const { user, signOut } = useAuth();
  const { sidebarColor } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const navItems = [
    { to: "/", icon: Home, label: "Dashboard" },
    { to: "/checklist", icon: CheckSquare, label: "Checklist" },
    { to: "/your-baby", icon: Baby, label: "Your Baby" },
    { to: "/diary", icon: DiaryIcon, label: "Diary" },
    { to: "/you", icon: Activity, label: "You" },
    { to: "/knowledge", icon: HelpCircle, label: "Knowledge" },
    { to: "/appointments", icon: Calendar, label: "Appointments" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden fixed top-4 right-4 z-50 bg-white shadow-lg"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className={`w-64 bg-gradient-to-b ${sidebarColors[sidebarColor as keyof typeof sidebarColors]} text-white p-0`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <h2 className="text-2xl font-bold">Baby Journey</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-white text-purple-600 shadow-md"
                      : "text-white hover:bg-white/20"
                  }`
                }
              >
                <Icon size={20} />
                <span className="font-medium">{label}</span>
              </NavLink>
            ))}
          </nav>
          
          <div className="p-4 space-y-4 border-t border-white/20">
            <Button className="w-full bg-white text-purple-600 hover:bg-gray-100 shadow-md flex items-center gap-2">
              <Plus size={20} />
              Add Appointment
            </Button>
            <Button
              onClick={handleSignOut}
              className="w-full bg-transparent border border-white hover:bg-white/20 text-white flex items-center gap-2"
            >
              <LogOut size={20} />
              Log out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
