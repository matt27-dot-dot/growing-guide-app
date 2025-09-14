import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Baby, Heart, Calendar, TrendingUp, Apple, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface PregnancyWeekData {
  id: string;
  week_number: number;
  baby_size_comparison: string | null;
  baby_size_inches: number | null;
  baby_weight_ounces: number | null;
  development_highlights: string[];
  organ_development: string | null;
  symptoms: string[];
  tips: string[];
  next_week_preview: string | null;
  trimester: number | null;
}

export const YourBaby = () => {
  const [weekData, setWeekData] = useState<PregnancyWeekData | null>(null);
  const [currentWeek, setCurrentWeek] = useState<number>(20); // Default week
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  useEffect(() => {
    if (currentWeek) {
      loadWeekData();
    }
  }, [currentWeek]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('pregnancy_week')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.pregnancy_week) {
        setCurrentWeek(data.pregnancy_week);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadWeekData = async () => {
    try {
      const { data, error } = await supabase
        .from('pregnancy_weeks')
        .select('*')
        .eq('week_number', currentWeek)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setWeekData(data);
    } catch (error) {
      console.error('Error loading week data:', error);
      toast({
        title: "Info",
        description: "Week data not yet available. Please add content in Supabase.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTrimesterProgress = () => {
    if (currentWeek <= 13) return { trimester: 1, progress: (currentWeek / 13) * 100 };
    if (currentWeek <= 27) return { trimester: 2, progress: ((currentWeek - 13) / 14) * 100 };
    return { trimester: 3, progress: ((currentWeek - 27) / 13) * 100 };
  };

  const trimesterInfo = getTrimesterProgress();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="text-4xl mb-4">👶</div>
          <p className="text-muted-foreground">Loading your baby's development...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mr-64 pt-20 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center py-8 lg:py-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Baby className="w-10 h-10 text-primary" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground">
              Your Baby
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover what's happening with your little one this week
          </p>
        </div>

        {/* Week Progress */}
        <div className="mb-8 lg:mb-12">
          <Card className="bg-gradient-primary text-primary-foreground shadow-soft border-0">
            <CardContent className="py-8">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-6 h-6" />
                  <h2 className="text-3xl font-bold">Week {currentWeek}</h2>
                </div>
                <p className="text-lg opacity-90">
                  Trimester {trimesterInfo.trimester} • {40 - currentWeek} weeks to go
                </p>
                <div className="max-w-md mx-auto">
                  <div className="flex justify-between text-sm opacity-80 mb-2">
                    <span>Trimester {trimesterInfo.trimester} Progress</span>
                    <span>{Math.round(trimesterInfo.progress)}%</span>
                  </div>
                  <Progress 
                    value={trimesterInfo.progress} 
                    className="h-3 bg-primary-foreground/20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Baby Size */}
          <Card className="bg-card/80 backdrop-blur shadow-card border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Apple className="w-6 h-6 text-primary" />
                Baby Size
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {weekData?.baby_size_comparison ? (
                <>
                  <div className="text-center py-6 bg-muted/50 rounded-lg">
                    <div className="text-4xl mb-2">🍎</div>
                    <p className="text-lg font-semibold">{weekData.baby_size_comparison}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {weekData.baby_size_inches && (
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <p className="font-semibold text-primary">Length</p>
                        <p>{weekData.baby_size_inches}"</p>
                      </div>
                    )}
                    {weekData.baby_weight_ounces && (
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <p className="font-semibold text-primary">Weight</p>
                        <p>{weekData.baby_weight_ounces} oz</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Apple className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Size data coming soon!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Development This Week */}
          <Card className="bg-card/80 backdrop-blur shadow-card border-0 lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Heart className="w-6 h-6 text-primary" />
                Development This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {weekData?.organ_development && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2 text-primary">Main Development</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {weekData.organ_development}
                  </p>
                </div>
              )}
              
              {weekData?.development_highlights && weekData.development_highlights.length > 0 ? (
                <div>
                  <h4 className="font-semibold mb-3">Key Highlights</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {weekData.development_highlights.map((highlight, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm">{highlight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Development details coming soon!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Symptoms You May Experience */}
          <Card className="bg-card/80 backdrop-blur shadow-card border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <AlertCircle className="w-6 h-6 text-primary" />
                Common Symptoms
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weekData?.symptoms && weekData.symptoms.length > 0 ? (
                <div className="space-y-3">
                  {weekData.symptoms.map((symptom, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Badge variant="outline" className="text-xs">
                        {index + 1}
                      </Badge>
                      <p className="text-sm">{symptom}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Symptom info coming soon!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips & Advice */}
          <Card className="bg-card/80 backdrop-blur shadow-card border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <TrendingUp className="w-6 h-6 text-primary" />
                Tips & Advice
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weekData?.tips && weekData.tips.length > 0 ? (
                <div className="space-y-3">
                  {weekData.tips.map((tip, index) => (
                    <div key={index} className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Tips coming soon!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next Week Preview */}
          <Card className="bg-card/80 backdrop-blur shadow-card border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Clock className="w-6 h-6 text-primary" />
                Coming Next Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weekData?.next_week_preview ? (
                <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg">
                  <p className="text-muted-foreground leading-relaxed">
                    {weekData.next_week_preview}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Preview coming soon!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};