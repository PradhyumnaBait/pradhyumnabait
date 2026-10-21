CREATE TABLE public.notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 60),
  company text CHECK (char_length(company) <= 60),
  role text CHECK (char_length(role) <= 60),
  email text NOT NULL CHECK (char_length(email) <= 255),
  avatar_url text,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 300),
  color text NOT NULL DEFAULT 'yellow',
  rotation real NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT (id, name, company, role, avatar_url, body, color, rotation, created_at) ON public.notes TO anon, authenticated;
GRANT ALL ON public.notes TO service_role;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes are public" ON public.notes FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.note_rate (
  ip_hash text PRIMARY KEY,
  last_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.note_rate TO service_role;
ALTER TABLE public.note_rate ENABLE ROW LEVEL SECURITY;

INSERT INTO public.notes (name, company, role, email, body, color, rotation, created_at) VALUES
('Placeholder Pal', 'Your Company', 'Visitor', 'demo@example.com', 'This is a sample note — replace me! Loved the robotic arm intro.', 'yellow', -2.5, now() - interval '8 days'),
('Demo Dev', 'Somewhere', 'Engineer', 'demo@example.com', 'The drone flying around the hero is such a fun touch ✈️', 'pink', 1.8, now() - interval '7 days'),
('Sample Sam', NULL, 'Student', 'demo@example.com', 'That heart-shaped journey map is adorable. Great work!', 'mint', -1.2, now() - interval '6 days'),
('Test Tara', 'Startup', 'Designer', 'demo@example.com', 'Clean, playful and still super readable. Bookmarked.', 'lilac', 2.4, now() - interval '5 days'),
('Example Eli', NULL, 'Recruiter', 'demo@example.com', 'MOKSHA sounds seriously impressive. Let''s talk!', 'blue', -2, now() - interval '4 days'),
('Mock Maya', 'Lab', 'ML Researcher', 'demo@example.com', 'Booped the desk GPU way too many times 😄', 'peach', 1.4, now() - interval '3 days'),
('Draft Dan', NULL, 'Founder', 'demo@example.com', 'Deepfake forensics + C2PA? Respect.', 'yellow', -1.6, now() - interval '2 days'),
('Filler Fin', 'College', 'Friend', 'demo@example.com', 'Sample note #8 — this wall is waiting for real ones!', 'mint', 2.1, now() - interval '1 day');