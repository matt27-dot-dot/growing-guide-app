import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Appointment {
  id: string;
  date: Date;
  time: string;
  location: string;
  notes?: string;
}

export const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const savedAppointments = localStorage.getItem("pregnancyAppointments");
    if (savedAppointments) {
      const parsed = JSON.parse(savedAppointments);
      setAppointments(parsed.map((apt: any) => ({ ...apt, date: new Date(apt.date) })));
    }
  }, []);

  const saveAppointments = (newAppointments: Appointment[]) => {
    localStorage.setItem("pregnancyAppointments", JSON.stringify(newAppointments));
    setAppointments(newAppointments);
  };

  const addAppointment = () => {
    if (!selectedDate || !time || !location) {
      toast({
        title: "Missing Information",
        description: "Please fill in date, time, and location.",
        variant: "destructive",
      });
      return;
    }

    const newAppointment: Appointment = {
      id: Date.now().toString(),
      date: selectedDate,
      time,
      location,
      notes,
    };

    const updatedAppointments = [...appointments, newAppointment].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
    
    saveAppointments(updatedAppointments);
    
    // Reset form
    setSelectedDate(undefined);
    setTime("");
    setLocation("");
    setNotes("");

    toast({
      title: "Appointment Added",
      description: "Your appointment has been saved successfully.",
    });
  };

  const deleteAppointment = (id: string) => {
    const updatedAppointments = appointments.filter(apt => apt.id !== id);
    saveAppointments(updatedAppointments);
    
    toast({
      title: "Appointment Deleted",
      description: "The appointment has been removed.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 pb-24">
      <div className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground">Keep track of your prenatal appointments</p>
        </div>

        {/* Add New Appointment */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Add New Appointment</h2>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="location"
                  placeholder="Doctor's office, hospital, clinic..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input
                id="notes"
                placeholder="Any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button onClick={addAppointment} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Appointment
            </Button>
          </div>
        </Card>

        {/* Appointments List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
          {appointments.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No appointments scheduled yet</p>
              <p className="text-sm text-muted-foreground mt-1">Add your first appointment above</p>
            </Card>
          ) : (
            appointments.map((appointment) => (
              <Card key={appointment.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="font-medium">
                        {format(appointment.date, "EEEE, MMMM do, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{appointment.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{appointment.location}</span>
                    </div>
                    {appointment.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{appointment.notes}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAppointment(appointment.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};