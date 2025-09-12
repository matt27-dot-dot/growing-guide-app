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
    <div className="min-h-screen bg-gradient-secondary p-4 sm:p-6 lg:p-8 pb-24">
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
              <div className="flex gap-3">
                <Input
                  placeholder="Enter item name..."
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 text-base py-6"
                />
                <Button 
                  onClick={addCustomItem}
                  size="icon"
                  className="bg-primary hover:bg-primary/90 shadow-soft h-14 w-14"
                >
                  <Plus className="w-5 h-5" />
                </Button>
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