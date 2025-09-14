import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressRing } from "@/components/ProgressRing";
import { getPregnancyInfo } from "@/data/pregnancyData";
import { Calendar, Heart, Baby, Clock, Search, Bell, HelpCircle, User, Eye, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface DashboardProps {
  currentWeek: number;
}

export const Dashboard = ({ currentWeek }: DashboardProps) => {
  const pregnancyInfo = getPregnancyInfo(currentWeek);
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [userName, setUserName] = useState<string>("");
  const [checklistStats, setChecklistStats] = useState({ completed: 0, total: 0 });
  const { user } = useAuth();
  const navigate = useNavigate();

  const positiveMessages = [
    "Take care of yourself and enjoy this special time. Your baby is growing strong! 💕",
    "You're creating life and doing something truly incredible. Keep going! ✨",
    "Every day brings you closer to meeting your little one. You've got this! 🌟",
    "Your body is doing something amazing right now. Trust the process! 💪",
    "You're already being the best parent by taking such good care of yourself! 🥰",
    "This journey is unique and beautiful. Embrace every moment! 🦋",
    "Your strength and love are already nurturing your baby. Amazing! 💖"
  ];

  useEffect(() => {
    loadNextAppointment();
    loadUserName();
    loadChecklistStats();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => 
        (prevIndex + 1) % positiveMessages.length
      );
    }, 4000); // Change message every 4 seconds

    return () => clearInterval(interval);
  }, [positiveMessages.length]);

  const loadNextAppointment = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .order('time', { ascending: true })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setNextAppointment(data[0]);
      }
    } catch (error) {
      console.error('Error loading next appointment:', error);
    }
  };

  const loadUserName = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data && data.name) {
        setUserName(data.name);
      }
    } catch (error) {
      console.error('Error loading user name:', error);
    }
  };

  const loadChecklistStats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('checklist_items')
        .select('completed')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        const total = data.length;
        const completed = data.filter(item => item.completed).length;
        setChecklistStats({ completed, total });
      }
    } catch (error) {
      console.error('Error loading checklist stats:', error);
    }
  };

  const getChecklistColorScheme = (percentage: number) => {
    if (percentage <= 30) {
      return {
        strokeColor: "#ef4444", // red-500
        backgroundColor: "#fef2f2", // red-50
        textColor: "text-red-600"
      };
    } else if (percentage <= 70) {
      return {
        strokeColor: "#f97316", // orange-500
        backgroundColor: "#fff7ed", // orange-50
        textColor: "text-orange-600"
      };
    } else {
      return {
        strokeColor: "#ec4899", // pink-500 (matching site theme)
        backgroundColor: "#fdf2f8", // pink-50
        textColor: "text-pink-600"
      };
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 md:mr-64">
      {/* Main Content Area */}
      <div className="flex-1">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search" 
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:flex items-center gap-4">
              <User className="w-5 h-5 text-gray-600" />
              <Bell className="w-5 h-5 text-gray-600" />
              <HelpCircle className="w-5 h-5 text-gray-600" />
            </div>
            <Badge 
              className="bg-blue-600 text-white px-3 py-1 cursor-pointer hover:bg-blue-700 transition-colors"
              onClick={() => navigate('/pricing')}
            >
              Get premium
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 md:p-6 space-y-8">
          {/* Welcome Message */}
          <div className="bg-white rounded-lg shadow-sm border-0 p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Hi {userName || "there"}! 👋
            </h1>
            <p className="text-lg text-gray-600">
              Welcome to your pregnancy journey dashboard
            </p>
          </div>

          {/* Progress Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Progress</h2>
            <div className="flex flex-col md:flex-row justify-center gap-6">
              {/* Weeks Remaining */}
              <Card className="bg-white shadow-sm border-0 w-full max-w-sm transition-transform duration-300 hover:scale-105">
                <CardContent className="flex flex-col items-center py-12">
                  <ProgressRing progress={pregnancyInfo.progress} size={160}>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        {pregnancyInfo.weeksRemaining}
                      </div>
                      <div className="text-base text-muted-foreground">
                        weeks left
                      </div>
                    </div>
                  </ProgressRing>
                </CardContent>
              </Card>

              {/* Checklist Progress */}
              <Card 
                className="bg-white shadow-sm border-0 w-full max-w-sm transition-transform duration-300 hover:scale-105 cursor-pointer"
                onClick={() => navigate('/checklist')}
              >
                <CardContent className="flex flex-col items-center py-12">
                  {(() => {
                    const percentage = checklistStats.total > 0 ? (checklistStats.completed / checklistStats.total) * 100 : 0;
                    const colors = getChecklistColorScheme(percentage);
                    return (
                      <ProgressRing 
                        progress={percentage} 
                        size={160}
                        strokeColor={colors.strokeColor}
                        backgroundColor={colors.backgroundColor}
                      >
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${colors.textColor}`}>
                            {Math.round(percentage)}%
                          </div>
                          <div className="text-base text-muted-foreground">
                            checklist done
                          </div>
                        </div>
                      </ProgressRing>
                    );
                  })()}
                  <div className="mt-4 text-center">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-gray-600" />
                      <span>{checklistStats.completed} of {checklistStats.total} items</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Next Appointment */}
            {nextAppointment && (
              <Card 
                className="bg-white shadow-sm border-0 transition-transform duration-300 hover:scale-105 cursor-pointer"
                onClick={() => navigate('/appointments')}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5 text-accent" />
                    Next Appointment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground font-medium mb-1">
                    {nextAppointment.title}
                  </p>
                  <p className="text-foreground font-medium">
                    {formatDate(nextAppointment.date)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {nextAppointment.time} • {nextAppointment.location}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Due Date */}
            <Card 
              className="bg-white shadow-sm border-0 transition-transform duration-300 hover:scale-105 cursor-pointer"
              onClick={() => navigate('/your-baby')}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  Expected Due Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground font-medium">
                  {pregnancyInfo.dueDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </CardContent>
            </Card>

            {/* Baby Development */}
            <Card 
              className="bg-white shadow-sm border-0 transition-transform duration-300 hover:scale-105 cursor-pointer"
              onClick={() => navigate('/your-baby')}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Baby className="w-5 h-5 text-accent" />
                  Baby Development
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  {pregnancyInfo.milestone}
                </p>
              </CardContent>
            </Card>

            {/* Motivational Message */}
            <Card className="bg-gradient-primary text-primary-foreground shadow-soft border-0 transition-transform duration-300 hover:scale-105 col-span-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="w-5 h-5" />
                  You're Doing Amazing!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed opacity-90 transition-all duration-500 animate-fade-in">
                  {positiveMessages[currentMessageIndex]}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};