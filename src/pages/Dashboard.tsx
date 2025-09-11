import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressRing } from "@/components/ProgressRing";
import { getPregnancyInfo } from "@/data/pregnancyData";
import { Calendar, Heart, Baby, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface DashboardProps {
  currentWeek: number;
}

export const Dashboard = ({ currentWeek }: DashboardProps) => {
  const pregnancyInfo = getPregnancyInfo(currentWeek);
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadNextAppointment();
  }, [user]);

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
    <div className="min-h-screen bg-gradient-secondary p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Your Journey
          </h1>
          <p className="text-muted-foreground">
            Week {currentWeek} of 40
          </p>
        </div>

        {/* Progress Ring */}
        <Card className="bg-card/80 backdrop-blur shadow-card border-0">
          <CardContent className="flex flex-col items-center py-8">
            <ProgressRing progress={pregnancyInfo.progress} size={140}>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {pregnancyInfo.weeksRemaining}
                </div>
                <div className="text-sm text-muted-foreground">
                  weeks left
                </div>
              </div>
            </ProgressRing>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid gap-4">
          {nextAppointment && (
            <Card className="bg-card/80 backdrop-blur shadow-card border-0">
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

          <Card className="bg-card/80 backdrop-blur shadow-card border-0">
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

          <Card className="bg-card/80 backdrop-blur shadow-card border-0">
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

          <Card className="bg-gradient-primary text-primary-foreground shadow-soft border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="w-5 h-5" />
                You're Doing Amazing!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed opacity-90">
                Take care of yourself and enjoy this special time. Your baby is growing strong! 💕
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};