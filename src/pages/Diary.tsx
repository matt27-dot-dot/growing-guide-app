import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Plus, 
  Image as ImageIcon, 
  Save, 
  Edit, 
  Trash2, 
  Calendar,
  Heart,
  Smile,
  Frown,
  Meh,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  images: string[];
  mood: string | null;
  pregnancy_week: number | null;
  created_at: string;
  updated_at: string;
}

const moodOptions = [
  { value: "happy", label: "Happy", icon: <Smile className="w-4 h-4" />, color: "text-green-600" },
  { value: "excited", label: "Excited", icon: <Heart className="w-4 h-4" />, color: "text-pink-600" },
  { value: "tired", label: "Tired", icon: <Meh className="w-4 h-4" />, color: "text-yellow-600" },
  { value: "anxious", label: "Anxious", icon: <Frown className="w-4 h-4" />, color: "text-red-600" },
  { value: "grateful", label: "Grateful", icon: <Heart className="w-4 h-4" />, color: "text-purple-600" },
];

export const Diary = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    mood: "",
    pregnancy_week: currentWeek,
  });
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadDiaryEntries();
      loadCurrentWeek();
    }
  }, [user]);

  const loadCurrentWeek = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('pregnancy_week')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data && data.pregnancy_week) {
        setCurrentWeek(data.pregnancy_week);
        setNewEntry(prev => ({ ...prev, pregnancy_week: data.pregnancy_week }));
      }
    } catch (error) {
      console.error('Error loading current week:', error);
    }
  };

  const loadDiaryEntries = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEntries(data || []);
    } catch (error) {
      console.error('Error loading diary entries:', error);
      toast({
        title: "Error",
        description: "Failed to load diary entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (!user) return [];

    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('diary-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('diary-images')
        .getPublicUrl(fileName);

      return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const saveEntry = async () => {
    if (!user || !newEntry.title.trim() || !newEntry.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and content",
        variant: "destructive",
      });
      return;
    }

    try {
      let uploadedImageUrls: string[] = [];
      
      if (images.length > 0) {
        uploadedImageUrls = await uploadImages(images);
      }

      const entryData = {
        user_id: user.id,
        title: newEntry.title.trim(),
        content: newEntry.content.trim(),
        images: uploadedImageUrls,
        mood: newEntry.mood || null,
        pregnancy_week: newEntry.pregnancy_week,
      };

      if (editingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('diary_entries')
          .update(entryData)
          .eq('id', editingEntry.id)
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Diary entry updated successfully",
        });
      } else {
        // Create new entry
        const { error } = await supabase
          .from('diary_entries')
          .insert(entryData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Diary entry saved successfully",
        });
      }

      // Reset form
      setNewEntry({
        title: "",
        content: "",
        mood: "",
        pregnancy_week: currentWeek,
      });
      setImages([]);
      setImageUrls([]);
      setIsCreating(false);
      setEditingEntry(null);
      
      // Reload entries
      loadDiaryEntries();
    } catch (error) {
      console.error('Error saving diary entry:', error);
      toast({
        title: "Error",
        description: "Failed to save diary entry",
        variant: "destructive",
      });
    }
  };

  const deleteEntry = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Diary entry deleted successfully",
      });

      loadDiaryEntries();
    } catch (error) {
      console.error('Error deleting diary entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete diary entry",
        variant: "destructive",
      });
    }
  };

  const startEditing = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setNewEntry({
      title: entry.title,
      content: entry.content,
      mood: entry.mood || "",
      pregnancy_week: entry.pregnancy_week || currentWeek,
    });
    setImageUrls(entry.images || []);
    setIsCreating(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    
    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setImageUrls(prev => [...prev, ...urls]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMoodIcon = (mood: string | null) => {
    const moodOption = moodOptions.find(option => option.value === mood);
    return moodOption ? moodOption.icon : null;
  };

  const getMoodColor = (mood: string | null) => {
    const moodOption = moodOptions.find(option => option.value === mood);
    return moodOption ? moodOption.color : "text-gray-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 md:mr-64 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📖</div>
          <p className="text-muted-foreground">Loading your diary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 md:mr-64 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center py-8 lg:py-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <BookOpen className="w-10 h-10 text-primary" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900">
              My Diary
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-600 mb-8">
            Document your pregnancy journey with photos and memories
          </p>
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Entry
          </Button>
        </div>

        {/* Create/Edit Entry Form */}
        {isCreating && (
          <Card className="mb-8 bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                {editingEntry ? 'Edit Entry' : 'New Diary Entry'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="What's on your mind today?"
                    value={newEntry.title}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="mood">How are you feeling?</Label>
                  <Select
                    value={newEntry.mood}
                    onValueChange={(value) => setNewEntry(prev => ({ ...prev, mood: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select your mood" />
                    </SelectTrigger>
                    <SelectContent>
                      {moodOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <span className={option.color}>{option.icon}</span>
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="content">Your thoughts</Label>
                <Textarea
                  id="content"
                  placeholder="Write about your day, how you're feeling, what you're excited about..."
                  value={newEntry.content}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                  className="mt-1 min-h-[200px]"
                />
              </div>

              <div>
                <Label>Add Photos</Label>
                <div className="mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Add Photos
                  </Button>
                </div>
                
                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingEntry(null);
                    setNewEntry({
                      title: "",
                      content: "",
                      mood: "",
                      pregnancy_week: currentWeek,
                    });
                    setImages([]);
                    setImageUrls([]);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={saveEntry} className="bg-primary hover:bg-primary/90">
                  <Save className="w-4 h-4 mr-2" />
                  {editingEntry ? 'Update Entry' : 'Save Entry'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Diary Entries */}
        <div className="space-y-6">
          {entries.length === 0 ? (
            <Card className="bg-white shadow-sm border-0 p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No entries yet</h3>
              <p className="text-gray-600 mb-6">Start documenting your pregnancy journey today!</p>
              <Button
                onClick={() => setIsCreating(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Write Your First Entry
              </Button>
            </Card>
          ) : (
            entries.map((entry) => (
              <Card key={entry.id} className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{entry.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(entry.created_at)}
                        </div>
                        {entry.pregnancy_week && (
                          <Badge variant="outline">
                            Week {entry.pregnancy_week}
                          </Badge>
                        )}
                        {entry.mood && (
                          <div className={`flex items-center gap-1 ${getMoodColor(entry.mood)}`}>
                            {getMoodIcon(entry.mood)}
                            <span className="capitalize">{entry.mood}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditing(entry)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteEntry(entry.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">
                    {entry.content}
                  </p>
                  
                  {entry.images && entry.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {entry.images.map((imageUrl, index) => (
                        <img
                          key={index}
                          src={imageUrl}
                          alt={`Diary entry ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
