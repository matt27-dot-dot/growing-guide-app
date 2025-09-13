-- Create table for pregnancy week information
CREATE TABLE public.pregnancy_weeks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_number INTEGER NOT NULL UNIQUE,
  baby_size_comparison TEXT,
  baby_size_inches DECIMAL(4,2),
  baby_weight_ounces DECIMAL(6,2),
  development_highlights TEXT[],
  organ_development TEXT,
  symptoms TEXT[],
  tips TEXT[],
  next_week_preview TEXT,
  trimester INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pregnancy_weeks ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Pregnancy weeks are publicly readable" 
ON public.pregnancy_weeks 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pregnancy_weeks_updated_at
BEFORE UPDATE ON public.pregnancy_weeks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_pregnancy_weeks_week_number ON public.pregnancy_weeks(week_number);
CREATE INDEX idx_pregnancy_weeks_trimester ON public.pregnancy_weeks(trimester);