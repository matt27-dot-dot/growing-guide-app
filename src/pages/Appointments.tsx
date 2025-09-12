import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  notes?: string;
}

export const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const loadAppointments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) throw error;

      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addAppointment = async () => {
    if (!user || !selectedDate || !time || !location || !title) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          title,
          date: format(selectedDate, 'yyyy-MM-dd'),
          time,
          location,
          notes: notes || null,
        });

      if (error) throw error;

      // Reset form
      setSelectedDate(undefined);
      setTitle("");
      setTime("");
      setLocation("");
      setNotes("");

      toast({
        title: "Appointment Added",
        description: "Your appointment has been saved successfully.",
      });

      // Reload appointments
      loadAppointments();
    } catch (error) {
      console.error('Error adding appointment:', error);
      toast({
        title: "Error",
        description: "Failed to add appointment",
        variant: "destructive"
      });
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Appointment Deleted",
        description: "The appointment has been removed.",
      });

      // Reload appointments
      loadAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📅</div>
          <p className="text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-secondary p-4 sm:p-6 lg:p-8 pb-24">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center py-8 lg:py-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4">Appointments</h1>
          <p className="text-lg sm:text-xl text-muted-foreground">Keep track of your prenatal appointments</p>
        </div>

        {/* Add New Appointment */}
        <div className="flex justify-center mb-8 lg:mb-12">
          <Card className="p-8 space-y-6 w-full max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Plus className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold">Add New Appointment</h2>
            </div>

            <div className="grid gap-6">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-base">Appointment Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Routine Checkup, Ultrasound..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-base py-6"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="date" className="text-base">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal text-base py-6",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-5 w-5" />
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

              <div className="space-y-3">
                <Label htmlFor="time" className="text-base">Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="pl-12 text-base py-6"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="location" className="text-base">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    id="location"
                    placeholder="Doctor's office, hospital, clinic..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-12 text-base py-6"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="notes" className="text-base">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="text-base"
                />
              </div>

              <Button onClick={addAppointment} className="w-full text-lg py-6">
                <Plus className="w-5 h-5 mr-2" />
                Add Appointment
              </Button>
            </div>
          </Card>
        </div>

        {/* Appointments List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">Upcoming Appointments</h2>
          {appointments.length === 0 ? (
            <div className="flex justify-center">
              <Card className="p-12 text-center w-full max-w-md">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
                <p className="text-lg text-muted-foreground">No appointments scheduled yet</p>
                <p className="text-base text-muted-foreground mt-2">Add your first appointment above</p>
              </Card>
            </div>
          ) : (
            <div className="grid gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-1">
                      <h3 className="font-semibold text-xl">{appointment.title}</h3>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span className="font-medium text-base">
                          {format(new Date(appointment.date), "EEEE, MMMM do, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-muted-foreground" />
                        <span className="text-base text-muted-foreground">{appointment.time}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                        <span className="text-base text-muted-foreground">{appointment.location}</span>
                      </div>
                      {appointment.notes && (
                        <p className="text-base text-muted-foreground mt-3">{appointment.notes}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAppointment(appointment.id)}
                      className="text-destructive hover:text-destructive ml-4"
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};