import { useState, useEffect } from "react";
import { WeekSelector } from "@/components/WeekSelector";
import { Dashboard } from "@/pages/Dashboard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);
  const [showWeekSelector, setShowWeekSelector] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

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

      if (data && data.pregnancy_week) {
        setCurrentWeek(data.pregnancy_week);
      } else {
        setShowWeekSelector(true);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setShowWeekSelector(true);
    } finally {
      setLoading(false);
    }
  };

  const handleWeekSelect = async (weeks: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          pregnancy_week: weeks,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setCurrentWeek(weeks);
      setShowWeekSelector(false);
    } catch (error) {
      console.error('Error saving pregnancy week:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🤱</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentWeek === null) {
    return (
      <>
        <WeekSelector 
          isOpen={showWeekSelector} 
          onWeekSelect={handleWeekSelect} 
        />
        <div className="min-h-screen bg-gradient-secondary flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">🤱</div>
            <h1 className="text-2xl font-bold text-foreground">Welcome!</h1>
            <p className="text-muted-foreground">Let's set up your pregnancy tracker</p>
          </div>
        </div>
      </>
    );
  }

  return <Dashboard currentWeek={currentWeek} />;
};

export default Index;