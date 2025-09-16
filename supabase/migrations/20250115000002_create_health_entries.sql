-- Create health_entries table
CREATE TABLE IF NOT EXISTS health_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS height INTEGER,
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS pre_pregnancy_weight DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS due_date DATE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_health_entries_user_id ON health_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_health_entries_date ON health_entries(date);

-- Enable RLS
ALTER TABLE health_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for health_entries
CREATE POLICY "Users can view their own health entries" ON health_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health entries" ON health_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health entries" ON health_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health entries" ON health_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger for health_entries
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_health_entries_updated_at 
  BEFORE UPDATE ON health_entries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
