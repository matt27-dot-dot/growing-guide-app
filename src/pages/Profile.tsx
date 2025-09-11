import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User, Baby, Save, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
    <div className="min-h-screen bg-gradient-secondary p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Your Profile
          </h1>
          <p className="text-muted-foreground">
            Personalize your pregnancy journey
          </p>
        </div>

        {/* Profile Picture */}
        <Card className="bg-card/80 backdrop-blur shadow-card border-0">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  <AvatarImage src={profileData.profile_picture} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {profileData.name ? getInitials(profileData.name) : <User className="w-8 h-8" />}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <label className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors shadow-soft">
                    <Camera className="w-4 h-4" />
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
                  <h2 className="text-xl font-semibold text-foreground">
                    {profileData.name}
                  </h2>
                  {profileData.baby_name && (
                    <p className="text-muted-foreground">
                      Expecting {profileData.baby_name} 💕
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="bg-card/80 backdrop-blur shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your name..."
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="baby_name" className="flex items-center gap-1">
                <Baby className="w-4 h-4" />
                Baby Name (Optional)
              </Label>
              <Input
                id="baby_name"
                placeholder="Have you chosen a name?"
                value={profileData.baby_name}
                onChange={(e) => setProfileData({ ...profileData, baby_name: e.target.value })}
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pregnancy_week">Pregnancy Week</Label>
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
                className={!isEditing ? "bg-muted" : ""}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {isEditing ? (
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-primary border-0 shadow-soft hover:shadow-card transition-all duration-200"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </Button>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="flex-1"
            >
              Edit Profile
            </Button>
          )}
        </div>

        {/* Pregnancy Week Info */}
        {profileData.pregnancy_week && (
          <Card className="bg-gradient-primary text-primary-foreground shadow-soft border-0">
            <CardContent className="py-4">
              <div className="text-center">
                <p className="text-sm opacity-90">Currently at</p>
                <p className="text-2xl font-bold">Week {profileData.pregnancy_week}</p>
                <p className="text-sm opacity-90">of your pregnancy journey</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sign Out Button */}
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};