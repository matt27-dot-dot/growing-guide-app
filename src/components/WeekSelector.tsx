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
      <DialogContent className="max-w-md bg-gradient-hero border-0 shadow-soft">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold text-foreground mb-2">
            Welcome to Your Pregnancy Journey! 🤱
          </DialogTitle>
          <p className="text-muted-foreground">
            How many weeks along are you?
          </p>
        </DialogHeader>
        
        <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto p-2">
          {weeks.map((week) => (
            <Card
              key={week}
              className={`p-3 text-center cursor-pointer transition-all duration-200 hover:shadow-card ${
                selectedWeek === week
                  ? "bg-primary text-primary-foreground shadow-soft scale-105"
                  : "bg-card hover:bg-secondary/50"
              }`}
              onClick={() => setSelectedWeek(week)}
            >
              <span className="font-medium">{week}</span>
            </Card>
          ))}
        </div>

        <Button
          onClick={handleConfirm}
          disabled={selectedWeek === null}
          className="w-full bg-gradient-primary border-0 shadow-soft hover:shadow-card transition-all duration-200"
        >
          Start Tracking
        </Button>
      </DialogContent>
    </Dialog>
  );
};