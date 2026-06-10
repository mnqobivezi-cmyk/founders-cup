-- ============================================================
--  FOUNDERS CUP — ADD PLAYER ROLE COLUMN + UPDATE CHOIR ORDERS
--  Run in Supabase SQL Editor
-- ============================================================

-- Add player_role column to fc_players
ALTER TABLE fc_players
  ADD COLUMN IF NOT EXISTS player_role text DEFAULT 'Player';

-- Update choir song performance orders on the event
UPDATE fc_events
SET choir_songs = '[
  "African Piece: Ruri by Mosoeu Moerane",
  "Western Piece: Blessed Are The Men Who Fear Him by F Mendelssohn",
  "Own Choice"
]'::jsonb
WHERE is_active = true;

-- Verify
SELECT 'player_role column' as check, column_name, data_type
FROM information_schema.columns
WHERE table_name='fc_players' AND column_name='player_role';

SELECT 'choir songs' as check, choir_songs
FROM fc_events WHERE is_active=true;

-- ── UPDATE CHOIR SCORING CATEGORIES TO OFFICIAL CHG MODEL ────────────────────
UPDATE fc_events
SET choir_categories = '[
  "Sound Quality",
  "Diction",
  "Technical Correctness",
  "Pitch",
  "Interpretation & Musicianship",
  "Stage Deportment"
]'::jsonb
WHERE is_active = true;

-- Verify
SELECT choir_categories FROM fc_events WHERE is_active = true;

-- ── CREATE fc_users TABLE FOR JUDGES AND TEAM ADMINS ─────────────────────────
CREATE TABLE IF NOT EXISTS fc_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES fc_events(id) ON DELETE CASCADE,
  role text NOT NULL, -- 'judge' or 'teamadmin'
  name text NOT NULL,
  pin text NOT NULL,
  tablet text,
  team_id text, -- team name for team admins
  created_at timestamptz DEFAULT now()
);

-- RLS policies
ALTER TABLE fc_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read fc_users"   ON fc_users FOR SELECT USING (true);
CREATE POLICY "Public insert fc_users" ON fc_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete fc_users" ON fc_users FOR DELETE USING (true);
CREATE POLICY "Public update fc_users" ON fc_users FOR UPDATE USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE fc_users;

SELECT 'fc_users table created' as status;

-- ── ADD EDITABLE SONG ORDERS COLUMN ──────────────────────────────────────────
ALTER TABLE fc_events
  ADD COLUMN IF NOT EXISTS choir_song_orders jsonb DEFAULT '{
    "0": ["Durban North","Zululand","Durban South","Othandweni"],
    "1": ["Othandweni","Zululand","Durban South","Durban North"],
    "2": ["Zululand","Durban South","Othandweni","Durban North"]
  }'::jsonb;

-- Set the confirmed orders on the active event
UPDATE fc_events SET choir_song_orders = '{
  "0": ["Durban North","Zululand","Durban South","Othandweni"],
  "1": ["Othandweni","Zululand","Durban South","Durban North"],
  "2": ["Zululand","Durban South","Othandweni","Durban North"]
}'::jsonb
WHERE is_active = true;

SELECT 'song orders set' as status, choir_song_orders FROM fc_events WHERE is_active=true;
