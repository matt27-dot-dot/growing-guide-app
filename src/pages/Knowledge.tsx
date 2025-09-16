import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, BookOpen, Baby } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  order_index: number;
}

export const Knowledge = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFaqs();
  }, []);

  useEffect(() => {
    filterFaqs();
  }, [searchQuery, selectedCategory, faqs]);

  const loadFaqs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_published', true)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;

      setFaqs(data || []);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(
        (data || [])
          .map(faq => faq.category)
          .filter(Boolean)
      )] as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error loading FAQs:', error);
      toast({
        title: "Error",
        description: "Failed to load knowledge base",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterFaqs = () => {
    let filtered = faqs;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(faq => faq.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(faq => 
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      );
    }

    setFilteredFaqs(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-muted-foreground">Loading knowledge base...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mr-64 pt-20 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Page Title */}
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-6 md:p-8 shadow-sm mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="w-8 h-8 text-pink-600" />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                Knowledge Base
              </h1>
            </div>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about pregnancy, childbirth, and early motherhood
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 lg:mb-12 space-y-6">
          <Card className="bg-card/80 backdrop-blur shadow-card border-0">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 text-base py-6"
                />
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          {categories.length > 0 && (
            <Card className="bg-card/80 backdrop-blur shadow-card border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Browse by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant={selectedCategory === null ? "default" : "outline"}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedCategory(null)}
                  >
                    All Topics
                  </Badge>
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* FAQs */}
        {filteredFaqs.length === 0 ? (
          <Card className="bg-card/80 backdrop-blur shadow-card border-0">
            <CardContent className="py-12">
              <div className="text-center">
                <Baby className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {faqs.length === 0 ? "No FAQs Available" : "No Results Found"}
                </h3>
                <p className="text-muted-foreground">
                  {faqs.length === 0 
                    ? "The knowledge base is being updated. Please check back soon!"
                    : "Try adjusting your search or browse different categories."
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card/80 backdrop-blur shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Baby className="w-6 h-6 text-primary" />
                Frequently Asked Questions
                <Badge variant="secondary" className="ml-2">
                  {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full space-y-2">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem 
                    key={faq.id} 
                    value={`item-${index}`}
                    className="border border-border/50 rounded-lg px-4"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-4">
                      <div className="flex items-start gap-3 w-full">
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">
                            {faq.question}
                          </h3>
                          {faq.category && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              {faq.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="prose prose-sm max-w-none text-muted-foreground">
                        <p className="whitespace-pre-wrap leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};