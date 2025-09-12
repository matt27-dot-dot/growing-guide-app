import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface WeekSelectorProps {
  isOpen: boolean;
  onWeekSelect: (weeks: number) => void;
}

export const WeekSelector = ({ isOpen, onWeekSelect }: WeekSelectorProps) => {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const handleConfirm = () => {
    if (selectedWeek !== null) {
      onWeekSelect(selectedWeek);
    }
  };

  const weeks = Array.from({ length: 40 }, (_, i) => i + 1);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl bg-gradient-hero border-0 shadow-soft">
        <DialogHeader className="text-center">
          <DialogTitle className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Welcome to Your Pregnancy Journey! 🤱
          </DialogTitle>
          <p className="text-lg sm:text-xl text-muted-foreground">
            How many weeks along are you?
          </p>
        </DialogHeader>
        
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-80 overflow-y-auto p-4">
          {weeks.map((week) => (
            <Card
              key={week}
              className={`p-4 text-center cursor-pointer transition-all duration-200 hover:shadow-card ${
                selectedWeek === week
                  ? "bg-primary text-primary-foreground shadow-soft scale-105"
                  : "bg-card hover:bg-secondary/50"
              }`}
              onClick={() => setSelectedWeek(week)}
            >
              <span className="text-lg font-medium">{week}</span>
            </Card>
          ))}
        </div>

        <Button
          onClick={handleConfirm}
          disabled={selectedWeek === null}
          className="w-full bg-gradient-primary border-0 shadow-soft hover:shadow-card transition-all duration-200 text-lg py-6"
        >
          Start Tracking
        </Button>
      </DialogContent>
    </Dialog>
  );
};