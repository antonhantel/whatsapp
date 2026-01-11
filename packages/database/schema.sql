-- User preferences and settings
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    whatsapp_phone TEXT,                -- User's WhatsApp number for self-messaging
    timezone TEXT DEFAULT 'UTC',
    digest_time TIME DEFAULT '09:00',   -- When to send daily digest
    digest_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group settings (user preferences per group)
CREATE TABLE public.group_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    whatsapp_group_jid TEXT NOT NULL,   -- e.g., "123456789@g.us"
    group_name TEXT,                     -- Cached name
    priority TEXT CHECK (priority IN ('high', 'medium', 'low', 'muted')) DEFAULT 'medium',
    include_in_digest BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, whatsapp_group_jid)
);

-- Stored summaries
CREATE TABLE public.summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    group_jid TEXT NOT NULL,
    group_name TEXT,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    message_count INTEGER,
    summary_data JSONB NOT NULL,        -- Structured summary from Claude
    importance_score INTEGER,            -- 0-100
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_summaries_user_group ON public.summaries(user_id, group_jid, period_end DESC);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users own their group settings" ON public.group_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their summaries" ON public.summaries FOR ALL USING (auth.uid() = user_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
