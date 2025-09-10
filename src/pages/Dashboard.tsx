import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressRing } from "@/components/ProgressRing";
import { getPregnancyInfo } from "@/data/pregnancyData";
import { Calendar, Heart, Baby } from "lucide-react";

interface DashboardProps {
  currentWeek: number;
}

export const Dashboard = ({ currentWeek }: DashboardProps) => {
  const pregnancyInfo = getPregnancyInfo(currentWeek);
  
  const formatDate = (date: Date) => {
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
          <Card className="bg-card/80 backdrop-blur shadow-card border-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-primary" />
                Expected Due Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground font-medium">
                {formatDate(pregnancyInfo.dueDate)}
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