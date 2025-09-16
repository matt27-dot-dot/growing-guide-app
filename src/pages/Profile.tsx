import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Camera, User, Baby, Save, LogOut, Palette, Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { supabase } from "@/integrations/supabase/client";

const sidebarColors = [
  { value: 'purple', label: 'Purple', preview: 'bg-gradient-to-r from-purple-600 to-pink-600' },
  { value: 'blue', label: 'Blue', preview: 'bg-gradient-to-r from-blue-600 to-cyan-600' },
  { value: 'green', label: 'Green', preview: 'bg-gradient-to-r from-green-600 to-emerald-600' },
  { value: 'orange', label: 'Orange', preview: 'bg-gradient-to-r from-orange-600 to-red-600' },
  { value: 'pink', label: 'Pink', preview: 'bg-gradient-to-r from-pink-600 to-rose-600' },
  { value: 'indigo', label: 'Indigo', preview: 'bg-gradient-to-r from-indigo-600 to-purple-600' },
  { value: 'teal', label: 'Teal', preview: 'bg-gradient-to-r from-teal-600 to-blue-600' },
  { value: 'emerald', label: 'Emerald', preview: 'bg-gradient-to-r from-emerald-600 to-green-600' },
];

interface ProfileData {
  name: string;
  baby_name: string;
  profile_picture: string;
  pregnancy_week: number | null;
}

export const Profile = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    baby_name: "",
    profile_picture: "",
    pregnancy_week: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const { isDarkMode, sidebarColor, toggleDarkMode, setSidebarColor } = useTheme();

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfileData({
          name: data.name || "",
          baby_name: data.baby_name || "",
          profile_picture: data.profile_picture || "",
          pregnancy_week: data.pregnancy_week,
        });
      } else {
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          name: profileData.name,
          baby_name: profileData.baby_name,
          profile_picture: profileData.profile_picture,
          pregnancy_week: profileData.pregnancy_week,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: "Profile saved! ✨",
        description: "Your information has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData({
          ...profileData,
          profile_picture: e.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🤱</div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mr-64 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Title */}
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-6 md:p-8 shadow-sm mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <User className="w-8 h-8 text-pink-600" />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                Your Profile
              </h1>
            </div>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Personalize your pregnancy journey
            </p>
          </div>
        </div>

        {/* Profile Picture */}
        <div className="flex justify-center mb-8 lg:mb-12">
          <Card className="bg-card/80 backdrop-blur shadow-card border-0 w-full max-w-md">
            <CardContent className="pt-8">
              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-primary/20">
                    <AvatarImage src={profileData.profile_picture} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                      {profileData.name ? getInitials(profileData.name) : <User className="w-12 h-12" />}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <label className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-3 cursor-pointer hover:bg-primary/90 transition-colors shadow-soft">
                      <Camera className="w-5 h-5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
                
                {!isEditing && profileData.name && (
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold text-foreground">
                      {profileData.name}
                    </h2>
                    {profileData.baby_name && (
                      <p className="text-lg text-muted-foreground">
                        Expecting {profileData.baby_name} 💕
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="flex justify-center">
          <Card className="bg-card/80 backdrop-blur shadow-card border-0 w-full max-w-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="w-6 h-6 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-base">Your Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your name..."
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  disabled={!isEditing}
                  className={`text-base py-6 ${!isEditing ? "bg-muted" : ""}`}
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="baby_name" className="flex items-center gap-2 text-base">
                  <Baby className="w-5 h-5" />
                  Baby Name (Optional)
                </Label>
                <Input
                  id="baby_name"
                  placeholder="Have you chosen a name?"
                  value={profileData.baby_name}
                  onChange={(e) => setProfileData({ ...profileData, baby_name: e.target.value })}
                  disabled={!isEditing}
                  className={`text-base py-6 ${!isEditing ? "bg-muted" : ""}`}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="pregnancy_week" className="text-base">Pregnancy Week</Label>
                <Input
                  id="pregnancy_week"
                  type="number"
                  min="1"
                  max="42"
                  placeholder="Current week..."
                  value={profileData.pregnancy_week || ""}
                  onChange={(e) => setProfileData({ 
                    ...profileData, 
                    pregnancy_week: e.target.value ? parseInt(e.target.value) : null 
                  })}
                  disabled={!isEditing}
                  className={`text-base py-6 ${!isEditing ? "bg-muted" : ""}`}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center">
          <div className="flex gap-4 w-full max-w-md">
            {isEditing ? (
              <Button
                onClick={handleSave}
                className="flex-1 bg-gradient-primary border-0 shadow-soft hover:shadow-card transition-all duration-200 text-lg py-6"
              >
                <Save className="w-5 h-5 mr-2" />
                Save Profile
              </Button>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="flex-1 text-lg py-6"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Pregnancy Week Info */}
        {profileData.pregnancy_week && (
          <div className="flex justify-center">
            <Card className="bg-gradient-primary text-primary-foreground shadow-soft border-0 w-full max-w-md">
              <CardContent className="py-6">
                <div className="text-center">
                  <p className="text-base opacity-90">Currently at</p>
                  <p className="text-3xl font-bold">Week {profileData.pregnancy_week}</p>
                  <p className="text-base opacity-90">of your pregnancy journey</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Theme Customization */}
        <div className="flex justify-center">
          <Card className="bg-card/80 backdrop-blur shadow-card border-0 w-full max-w-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Palette className="w-6 h-6 text-primary" />
                Theme Customization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <div>
                    <Label htmlFor="darkMode" className="text-base font-medium">
                      Dark Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark themes
                    </p>
                  </div>
                </div>
                <Switch
                  id="darkMode"
                  checked={isDarkMode}
                  onCheckedChange={toggleDarkMode}
                />
              </div>

              {/* Sidebar Color Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Sidebar Color</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred sidebar color scheme
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {sidebarColors.map((color) => (
                    <div
                      key={color.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        sidebarColor === color.value
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSidebarColor(color.value)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full ${color.preview}`} />
                        <span className="text-sm font-medium">{color.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Preview</Label>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className={`h-16 rounded-lg ${sidebarColors.find(c => c.value === sidebarColor)?.preview} flex items-center justify-center`}>
                    <span className="text-white font-medium">Sidebar Preview</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sign Out Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full max-w-md text-lg py-6"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};