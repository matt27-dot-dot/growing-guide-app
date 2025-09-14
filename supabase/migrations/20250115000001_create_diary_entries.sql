-- Create table for diary entries
CREATE TABLE public.diary_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT[], -- Array of image URLs
  mood TEXT, -- Optional mood field
  pregnancy_week INTEGER, -- Week when entry was written
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.diary_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for diary entries
CREATE POLICY "Users can view their own diary entries" 
ON public.diary_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own diary entries" 
ON public.diary_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diary entries" 
ON public.diary_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diary entries" 
ON public.diary_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_diary_entries_updated_at
BEFORE UPDATE ON public.diary_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_diary_entries_user_id ON public.diary_entries(user_id);
CREATE INDEX idx_diary_entries_created_at ON public.diary_entries(created_at DESC);
CREATE INDEX idx_diary_entries_pregnancy_week ON public.diary_entries(pregnancy_week);

-- Create storage bucket for diary images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('diary-images', 'diary-images', true);

-- Create policy for diary images
CREATE POLICY "Users can upload their own diary images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'diary-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own diary images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'diary-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own diary images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'diary-images' AND auth.uid()::text = (storage.foldername(name))[1]);
