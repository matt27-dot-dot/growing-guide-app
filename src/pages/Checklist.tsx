import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, CheckCircle2 } from "lucide-react";
import { CategorySection } from "@/components/CategorySection";
import { babyEssentialsByCategory } from "@/data/pregnancyData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  isCustom: boolean;
  category?: string;
}

export const Checklist = () => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Custom Items");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadChecklistItems();
    }
  }, [user]);

  const loadChecklistItems = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load user's checklist items from Supabase
      const { data: userItems, error: userError } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (userError) throw userError;

      // If user has no items, initialize with default baby essentials
      if (!userItems || userItems.length === 0) {
        await initializeDefaultItems();
      } else {
        // Convert Supabase data to ChecklistItem format
        const formattedItems: ChecklistItem[] = userItems.map(item => ({
          id: item.id,
          text: item.text,
          completed: item.completed,
          isCustom: item.is_custom,
          category: item.category || undefined,
        }));
        setItems(formattedItems);
      }
    } catch (error) {
      console.error('Error loading checklist items:', error);
      toast({
        title: "Error",
        description: "Failed to load checklist items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultItems = async () => {
    if (!user) return;

    try {
      const initialItems: ChecklistItem[] = [];
      
      Object.entries(babyEssentialsByCategory).forEach(([category, categoryItems]) => {
        categoryItems.forEach((item, index) => {
          initialItems.push({
            id: `${category.toLowerCase()}-${index}`,
            text: item,
            completed: false,
            isCustom: false,
            category: category,
          });
        });
      });

      // Save default items to Supabase
      const itemsToInsert = initialItems.map(item => ({
        user_id: user.id,
        text: item.text,
        completed: item.completed,
        is_custom: item.isCustom,
        category: item.category,
      }));

      const { error } = await supabase
        .from('checklist_items')
        .insert(itemsToInsert);

      if (error) throw error;

      setItems(initialItems);
    } catch (error) {
      console.error('Error initializing default items:', error);
      toast({
        title: "Error",
        description: "Failed to initialize checklist",
        variant: "destructive",
      });
    }
  };

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const toggleItem = async (id: string) => {
    const item = items.find(item => item.id === id);
    if (!item || !user) return;

    const newCompleted = !item.completed;
    
    // Optimistically update UI
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: newCompleted } : item
    ));

    try {
      // Update in Supabase
      const { error } = await supabase
        .from('checklist_items')
        .update({ completed: newCompleted })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating item:', error);
      // Revert optimistic update
      setItems(items.map(item => 
        item.id === id ? { ...item, completed: !newCompleted } : item
      ));
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    }
  };

  const addCustomItem = async () => {
    if (!newItem.trim() || !user) return;

    try {
      // Insert into Supabase
      const { data, error } = await supabase
        .from('checklist_items')
        .insert({
          user_id: user.id,
          text: newItem.trim(),
          completed: false,
          is_custom: selectedCategory === "Custom Items",
          category: selectedCategory,
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const newChecklistItem: ChecklistItem = {
        id: data.id,
        text: data.text,
        completed: data.completed,
        isCustom: data.is_custom,
        category: data.category || undefined,
      };

      setItems([...items, newChecklistItem]);
      setNewItem("");
      setSelectedCategory("Custom Items"); // Reset to default
      setIsDialogOpen(false);

      toast({
        title: "Success",
        description: "Item added to checklist",
      });
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    }
  };

  const removeCustomItem = async (id: string) => {
    if (!user) return;

    try {
      // Remove from Supabase
      const { error } = await supabase
        .from('checklist_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Remove from local state
      setItems(items.filter(item => item.id !== id));

      toast({
        title: "Success",
        description: "Item removed from checklist",
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addCustomItem();
    }
  };

  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    const category = item.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  // Define category order
  const categoryOrder = [
    "Feeding",
    "Clothing", 
    "Diaper Care",
    "Sleep & Safety",
    "Bathing & Grooming",
    "Health & Safety",
    "Transportation",
    "Custom Items"
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 mr-64 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-muted-foreground">Loading checklist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mr-64 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center py-8 lg:py-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Baby Checklist
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            {completedCount} of {totalCount} items completed
          </p>
        </div>

        {/* Progress Card */}
        <div className="flex justify-center mb-8 lg:mb-12">
          <Card className="bg-card/80 backdrop-blur shadow-card border-0 w-full max-w-2xl">
            <CardContent className="py-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-medium text-foreground">Progress</span>
                <span className="text-lg text-muted-foreground">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <div className="w-full bg-border rounded-full h-4">
                <div 
                  className="bg-gradient-primary h-4 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              {completedCount === totalCount && totalCount > 0 && (
                <div className="flex items-center gap-2 mt-4 text-success">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-base font-medium">All items completed! 🎉</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add Custom Item */}
        <div className="flex justify-center mb-8">
          <Card className="bg-card/80 backdrop-blur shadow-card border-0 w-full max-w-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Add Custom Item</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter item name..."
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 text-base py-6"
                  />
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => setIsDialogOpen(true)}
                        size="icon"
                        className="bg-primary hover:bg-primary/90 shadow-soft h-14 w-14"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Choose Category</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Select where to add this item:
                          </label>
                          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Custom Items">Custom Items (Keep as custom)</SelectItem>
                              <SelectItem value="Feeding">Feeding</SelectItem>
                              <SelectItem value="Clothing">Clothing</SelectItem>
                              <SelectItem value="Diaper Care">Diaper Care</SelectItem>
                              <SelectItem value="Sleep & Safety">Sleep & Safety</SelectItem>
                              <SelectItem value="Bathing & Grooming">Bathing & Grooming</SelectItem>
                              <SelectItem value="Health & Safety">Health & Safety</SelectItem>
                              <SelectItem value="Transportation">Transportation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="outline" 
                            onClick={() => setIsDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={addCustomItem}
                            disabled={!newItem.trim()}
                          >
                            Add Item
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Click the + button to choose which category to add your item to
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categorized Items */}
        <div className="grid gap-8 lg:gap-12 grid-cols-1 md:grid-cols-2">
          {categoryOrder.map((category) => {
            const categoryItems = itemsByCategory[category];
            if (!categoryItems || categoryItems.length === 0) return null;
            
            return (
              <CategorySection
                key={category}
                title={category}
                items={categoryItems}
                onToggleItem={toggleItem}
                onRemoveItem={removeCustomItem}
                defaultOpen={category !== "Custom Items"}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};