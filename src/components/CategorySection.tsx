import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  isCustom: boolean;
}

interface CategorySectionProps {
  title: string;
  items: ChecklistItem[];
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  defaultOpen?: boolean;
}

export const CategorySection = ({ 
  title, 
  items, 
  onToggleItem, 
  onRemoveItem,
  defaultOpen = true 
}: CategorySectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  
  if (totalCount === 0) return null;

  return (
    <Card className="bg-card/80 backdrop-blur shadow-card border-0">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-secondary/30 transition-colors rounded-lg">
            <CardTitle className="flex items-center justify-between text-lg">
              <span>{title}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-normal">
                  {completedCount}/{totalCount}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-3 pt-0">
            {items.map((item) => (
              <div 
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                  item.completed 
                    ? "bg-success/10 border border-success/20" 
                    : "bg-secondary/30 hover:bg-secondary/50"
                }`}
              >
                <Checkbox
                  id={item.id}
                  checked={item.completed}
                  onCheckedChange={() => onToggleItem(item.id)}
                  className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                />
                <label 
                  htmlFor={item.id}
                  className={`flex-1 cursor-pointer transition-all duration-200 ${
                    item.completed 
                      ? "line-through text-muted-foreground" 
                      : "text-foreground"
                  }`}
                >
                  {item.text}
                </label>
                {item.isCustom && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveItem(item.id)}
                    className="w-8 h-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};