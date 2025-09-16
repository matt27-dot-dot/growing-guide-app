import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Scale, 
  Ruler, 
  Calendar, 
  Heart, 
  Activity, 
  TrendingUp, 
  Plus,
  Edit,
  Trash2,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HealthEntry {
  id: string;
  date: string;
  weight: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  notes?: string;
  created_at: string;
}

interface PersonalInfo {
  height: number; // in cm
  age: number;
  pre_pregnancy_weight: number;
  due_date: string;
}

export const You = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Personal info state
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    height: 165,
    age: 28,
    pre_pregnancy_weight: 60,
    due_date: ""
  });
  
  // Health entries state
  const [healthEntries, setHealthEntries] = useState<HealthEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state for new entry
  const [newEntry, setNewEntry] = useState({
    weight: "",
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
    notes: ""
  });
  
  const [isAddingEntry, setIsAddingEntry] = useState(false);

  // Load personal info and health entries
  useEffect(() => {
    loadPersonalInfo();
    loadHealthEntries();
  }, [user]);

  const loadPersonalInfo = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('height, age, pre_pregnancy_weight, due_date')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, use defaults
          console.log('No profile found, using defaults');
        } else {
          throw error;
        }
      } else if (data) {
        setPersonalInfo({
          height: data.height || 165,
          age: data.age || 28,
          pre_pregnancy_weight: data.pre_pregnancy_weight || 60,
          due_date: data.due_date || ""
        });
      }
    } catch (error) {
      console.error('Error loading personal info:', error);
    }
  };

  const loadHealthEntries = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('health_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });
      
      if (data) {
        setHealthEntries(data);
      }
    } catch (error) {
      console.error('Error loading health entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePersonalInfo = async () => {
    if (!user) return;
    
    try {
      // Use upsert to handle both insert and update
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          height: personalInfo.height,
          age: personalInfo.age,
          pre_pregnancy_weight: personalInfo.pre_pregnancy_weight,
          due_date: personalInfo.due_date
        }, {
          onConflict: 'user_id'
        });
      
      if (error) throw error;
      
      toast({
        title: "Personal info saved!",
        description: "Your personal information has been updated."
      });
    } catch (error) {
      console.error('Error saving personal info:', error);
      toast({
        title: "Error",
        description: `Failed to save personal information: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const addHealthEntry = async () => {
    if (!user || !newEntry.weight) return;
    
    try {
      const { data, error } = await supabase
        .from('health_entries')
        .insert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          weight: parseFloat(newEntry.weight),
          blood_pressure_systolic: newEntry.blood_pressure_systolic ? parseInt(newEntry.blood_pressure_systolic) : null,
          blood_pressure_diastolic: newEntry.blood_pressure_diastolic ? parseInt(newEntry.blood_pressure_diastolic) : null,
          notes: newEntry.notes || null
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setHealthEntries([...healthEntries, data]);
      setNewEntry({
        weight: "",
        blood_pressure_systolic: "",
        blood_pressure_diastolic: "",
        notes: ""
      });
      setIsAddingEntry(false);
      
      toast({
        title: "Health entry added!",
        description: "Your health data has been recorded."
      });
    } catch (error) {
      console.error('Error adding health entry:', error);
      toast({
        title: "Error",
        description: "Failed to add health entry.",
        variant: "destructive"
      });
    }
  };

  const deleteHealthEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('health_entries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setHealthEntries(healthEntries.filter(entry => entry.id !== id));
      
      toast({
        title: "Entry deleted",
        description: "Health entry has been removed."
      });
    } catch (error) {
      console.error('Error deleting health entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete health entry.",
        variant: "destructive"
      });
    }
  };

  // Calculate BMI
  const calculateBMI = (weight: number) => {
    const heightInMeters = personalInfo.height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  // Calculate weight gain progress
  const getWeightGainProgress = () => {
    if (healthEntries.length === 0) return 0;
    const latestWeight = healthEntries[healthEntries.length - 1].weight;
    const weightGain = latestWeight - personalInfo.pre_pregnancy_weight;
    const recommendedGain = personalInfo.pre_pregnancy_weight < 18.5 ? 12.5 : 
                           personalInfo.pre_pregnancy_weight < 25 ? 11.5 : 
                           personalInfo.pre_pregnancy_weight < 30 ? 7 : 5;
    return Math.min((weightGain / recommendedGain) * 100, 100);
  };

  // Get pregnancy week
  const getPregnancyWeek = () => {
    if (!personalInfo.due_date) return 0;
    const dueDate = new Date(personalInfo.due_date);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    return Math.max(0, 40 - diffWeeks);
  };

  // Get weight gain status and color
  const getWeightGainStatus = () => {
    if (healthEntries.length === 0) return { status: "No data", color: "gray", icon: null };
    
    const latestWeight = healthEntries[healthEntries.length - 1].weight;
    const weightGain = latestWeight - personalInfo.pre_pregnancy_weight;
    const pregnancyWeek = getPregnancyWeek();
    
    // Calculate expected weight gain based on week
    const expectedGainPerWeek = 0.4; // kg per week average
    const expectedGain = pregnancyWeek * expectedGainPerWeek;
    
    const difference = weightGain - expectedGain;
    
    if (difference < -2) {
      return { status: "Underweight gain", color: "red", icon: AlertTriangle };
    } else if (difference > 3) {
      return { status: "Excessive gain", color: "orange", icon: AlertTriangle };
    } else {
      return { status: "Healthy range", color: "green", icon: CheckCircle };
    }
  };

  const pregnancyWeek = getPregnancyWeek();
  const weightGainProgress = getWeightGainProgress();
  const weightGainStatus = getWeightGainStatus();

  return (
    <div className="min-h-screen bg-gray-50 md:mr-64 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Title */}
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-6 md:p-8 shadow-sm">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <User className="w-8 h-8 text-pink-600" />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                You
              </h1>
            </div>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Track your health and wellness throughout your pregnancy journey
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={personalInfo.height}
                    onChange={(e) => setPersonalInfo({...personalInfo, height: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={personalInfo.age}
                    onChange={(e) => setPersonalInfo({...personalInfo, age: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="preWeight">Pre-pregnancy Weight (kg)</Label>
                  <Input
                    id="preWeight"
                    type="number"
                    step="0.1"
                    value={personalInfo.pre_pregnancy_weight}
                    onChange={(e) => setPersonalInfo({...personalInfo, pre_pregnancy_weight: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={personalInfo.due_date}
                    onChange={(e) => setPersonalInfo({...personalInfo, due_date: e.target.value})}
                  />
                </div>
                <Button onClick={savePersonalInfo} className="w-full">
                  Save Information
                </Button>
              </CardContent>
            </Card>

            {/* Pregnancy Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Pregnancy Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">{pregnancyWeek}</div>
                  <div className="text-sm text-gray-600">Weeks Pregnant</div>
                </div>
                
                {/* Weight Gain Status */}
                {healthEntries.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Weight Gain Status</span>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        weightGainStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                        weightGainStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {weightGainStatus.icon && <weightGainStatus.icon className="w-3 h-3" />}
                        {weightGainStatus.status}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current Weight Gain</span>
                        <span className="font-medium">
                          {healthEntries[healthEntries.length - 1].weight - personalInfo.pre_pregnancy_weight > 0 ? '+' : ''}
                          {(healthEntries[healthEntries.length - 1].weight - personalInfo.pre_pregnancy_weight).toFixed(1)} kg
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(Math.max(weightGainProgress, 0), 100)} 
                        className="h-2"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Health Tracking */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Health Tracking
                  </CardTitle>
                  <Button 
                    onClick={() => setIsAddingEntry(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Entry
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isAddingEntry && (
                  <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <h3 className="font-semibold mb-4">Add Health Entry</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="weight">Weight (kg) *</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          value={newEntry.weight}
                          onChange={(e) => setNewEntry({...newEntry, weight: e.target.value})}
                          placeholder="Enter weight"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bpSystolic">Blood Pressure - Systolic</Label>
                        <Input
                          id="bpSystolic"
                          type="number"
                          value={newEntry.blood_pressure_systolic}
                          onChange={(e) => setNewEntry({...newEntry, blood_pressure_systolic: e.target.value})}
                          placeholder="e.g., 120"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bpDiastolic">Blood Pressure - Diastolic</Label>
                        <Input
                          id="bpDiastolic"
                          type="number"
                          value={newEntry.blood_pressure_diastolic}
                          onChange={(e) => setNewEntry({...newEntry, blood_pressure_diastolic: e.target.value})}
                          placeholder="e.g., 80"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={newEntry.notes}
                        onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                        placeholder="Any additional notes..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={addHealthEntry} disabled={!newEntry.weight}>
                        Save Entry
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsAddingEntry(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Health Entries List */}
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">Loading health entries...</div>
                  ) : healthEntries.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No health entries yet. Add your first entry to start tracking!
                    </div>
                  ) : (
                    healthEntries.map((entry) => (
                      <div key={entry.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-4">
                            <div className="text-lg font-semibold">
                              {entry.weight} kg
                            </div>
                            <Badge variant="outline">
                              {new Date(entry.date).toLocaleDateString()}
                            </Badge>
                            <div className="text-sm text-gray-600">
                              BMI: {calculateBMI(entry.weight)}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteHealthEntry(entry.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          {entry.blood_pressure_systolic && entry.blood_pressure_diastolic && (
                            <div>
                              <span className="text-gray-600">Blood Pressure:</span>
                              <div className="font-medium">
                                {entry.blood_pressure_systolic}/{entry.blood_pressure_diastolic}
                              </div>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-600">Weight Gain:</span>
                            <div className="font-medium">
                              {entry.weight - personalInfo.pre_pregnancy_weight > 0 ? '+' : ''}
                              {(entry.weight - personalInfo.pre_pregnancy_weight).toFixed(1)} kg
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">BMI:</span>
                            <div className="font-medium">{calculateBMI(entry.weight)}</div>
                          </div>
                        </div>
                        
                        {entry.notes && (
                          <div className="mt-2 text-sm text-gray-600">
                            <strong>Notes:</strong> {entry.notes}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Health Insights */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Health Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      {healthEntries.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Entries</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      {healthEntries.length > 0 ? 
                        (healthEntries[healthEntries.length - 1].weight - personalInfo.pre_pregnancy_weight).toFixed(1) : 
                        '0.0'
                      } kg
                    </div>
                    <div className="text-sm text-gray-600">Total Weight Gain</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Scale className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">
                      {healthEntries.length > 0 ? 
                        healthEntries[healthEntries.length - 1].weight : 
                        'N/A'
                      } kg
                    </div>
                    <div className="text-sm text-gray-600">Current Weight</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weight Gain Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Understanding Your Weight Gain
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-green-800 mb-1">Healthy Range</h4>
                        <p className="text-sm text-green-700">
                          You're doing wonderfully! Your weight gain is within the recommended range for your stage of pregnancy. 
                          This is great for both you and your baby's health. Keep up the excellent work! 💚
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-orange-800 mb-1">Excessive Gain</h4>
                        <p className="text-sm text-orange-700">
                          You're gaining a bit more weight than recommended. This is completely normal and nothing to worry about! 
                          Every pregnancy is different. Consider speaking with your healthcare provider about gentle ways to 
                          maintain a healthy balance. You're still doing an amazing job! 🌟
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-red-800 mb-1">Underweight Gain</h4>
                        <p className="text-sm text-red-700">
                          You might not be gaining enough weight for your stage of pregnancy. This could be due to morning sickness, 
                          stress, or other factors. Please don't worry - this is manageable! We recommend speaking with your 
                          healthcare provider to ensure you and your baby are getting the nutrition you need. You've got this! 💪
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-1">Remember</h4>
                        <p className="text-sm text-blue-700">
                          Weight gain during pregnancy varies for every woman and every pregnancy. These guidelines are just 
                          suggestions to help you stay healthy. Always consult with your healthcare provider about any 
                          concerns. You're growing a human - that's incredible! 🤱
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default You;