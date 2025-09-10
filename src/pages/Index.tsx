import { useState, useEffect } from "react";
import { WeekSelector } from "@/components/WeekSelector";
import { Dashboard } from "@/pages/Dashboard";
import { Navigation } from "@/components/Navigation";

const Index = () => {
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);
  const [showWeekSelector, setShowWeekSelector] = useState(false);

  useEffect(() => {
    // Check if user has already set their pregnancy week
    const savedWeek = localStorage.getItem("pregnancyWeek");
    if (savedWeek) {
      setCurrentWeek(parseInt(savedWeek));
    } else {
      setShowWeekSelector(true);
    }
  }, []);

  const handleWeekSelect = (weeks: number) => {
    setCurrentWeek(weeks);
    localStorage.setItem("pregnancyWeek", weeks.toString());
    setShowWeekSelector(false);
  };

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

  return (
    <>
      <Dashboard currentWeek={currentWeek} />
      <Navigation />
    </>
  );
};

export default Index;
