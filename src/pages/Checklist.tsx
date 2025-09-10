import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, CheckCircle2 } from "lucide-react";
import { CategorySection } from "@/components/CategorySection";
import { babyEssentialsByCategory } from "@/data/pregnancyData";

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

  useEffect(() => {
    // Initialize with categorized baby essentials
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
    
    setItems(initialItems);
  }, []);

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const addCustomItem = () => {
    if (newItem.trim()) {
      const customItem: ChecklistItem = {
        id: `custom-${Date.now()}`,
        text: newItem.trim(),
        completed: false,
        isCustom: true,
        category: "Custom Items",
      };
      setItems([...items, customItem]);
      setNewItem("");
    }
  };

  const removeCustomItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
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

  return (
    <div className="min-h-screen bg-gradient-secondary p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Baby Checklist
          </h1>
          <p className="text-muted-foreground">
            {completedCount} of {totalCount} items completed
          </p>
        </div>

        {/* Progress Card */}
        <Card className="bg-card/80 backdrop-blur shadow-card border-0">
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">Progress</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full bg-border rounded-full h-3">
              <div 
                className="bg-gradient-primary h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            {completedCount === totalCount && totalCount > 0 && (
              <div className="flex items-center gap-2 mt-3 text-success">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">All items completed! 🎉</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Custom Item */}
        <Card className="bg-card/80 backdrop-blur shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Add Custom Item</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter item name..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button 
                onClick={addCustomItem}
                size="icon"
                className="bg-primary hover:bg-primary/90 shadow-soft"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Categorized Items */}
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
  );
};