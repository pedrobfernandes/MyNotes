CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL
    REFERENCES auth.users(id)
    ON DELETE CASCADE,

  title TEXT NOT NULL,
  
  title_normalized TEXT NOT NULL,

  content TEXT NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notes"
ON notes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes"
ON notes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
ON notes
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
ON notes
FOR DELETE
USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notes TO authenticated;
