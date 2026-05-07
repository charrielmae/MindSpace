-- MindSpace Database Schema
-- Daily Moods Table for AI Insights

-- Create daily_moods table
CREATE TABLE IF NOT EXISTS daily_moods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mood VARCHAR(20) NOT NULL CHECK (mood IN ('great', 'good', 'okay', 'bad', 'terrible')),
    mood_score INTEGER NOT NULL CHECK (mood_score BETWEEN 1 AND 5),
    notes TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_moods_user_date ON daily_moods(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_moods_user_created ON daily_moods(user_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE daily_moods ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access their own mood data
CREATE POLICY "Users can view own moods" ON daily_moods
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own moods" ON daily_moods
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own moods" ON daily_moods
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own moods" ON daily_moods
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update mood_score based on mood
CREATE OR REPLACE FUNCTION set_mood_score()
RETURNS TRIGGER AS $$
BEGIN
    CASE NEW.mood
        WHEN 'great' THEN NEW.mood_score := 5;
        WHEN 'good' THEN NEW.mood_score := 4;
        WHEN 'okay' THEN NEW.mood_score := 3;
        WHEN 'bad' THEN NEW.mood_score := 2;
        WHEN 'terrible' THEN NEW.mood_score := 1;
    END CASE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set mood_score
CREATE TRIGGER trigger_set_mood_score
    BEFORE INSERT OR UPDATE ON daily_moods
    FOR EACH ROW
    EXECUTE FUNCTION set_mood_score();

-- Create function to get mood insights
CREATE OR REPLACE FUNCTION get_mood_insights(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    total_entries INTEGER,
    average_mood_score DECIMAL,
    most_common_mood VARCHAR,
    mood_trend VARCHAR,
    improvement_percentage DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH mood_data AS (
        SELECT 
            mood,
            mood_score,
            date,
            LAG(mood_score) OVER (ORDER BY date) as previous_score
        FROM daily_moods 
        WHERE user_id = p_user_id 
            AND date >= CURRENT_DATE - INTERVAL '1 day' * p_days
    ),
    mood_stats AS (
        SELECT 
            COUNT(*) as total_entries,
            AVG(mood_score) as avg_score,
            MODE() WITHIN GROUP (ORDER BY mood) as most_common
        FROM mood_data
    ),
    trend_data AS (
        SELECT 
            CASE 
                WHEN AVG(mood_score - previous_score) > 0.1 THEN 'improving'
                WHEN AVG(mood_score - previous_score) < -0.1 THEN 'declining'
                ELSE 'stable'
            END as trend
        FROM mood_data 
        WHERE previous_score IS NOT NULL
    )
    SELECT 
        ms.total_entries,
        ms.avg_score,
        ms.most_common,
        COALESCE(td.trend, 'stable') as mood_trend,
        CASE 
            WHEN ms.avg_score >= 4 THEN 85
            WHEN ms.avg_score >= 3 THEN 60
            WHEN ms.avg_score >= 2 THEN 35
            ELSE 15
        END as improvement_percentage
    FROM mood_stats ms
    CROSS JOIN trend_data td;
END;
$$ LANGUAGE plpgsql;

-- Create table for AI insights cache
CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    insight_text TEXT NOT NULL,
    insight_type VARCHAR(50) NOT NULL DEFAULT 'mood_analysis',
    mood_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Enable RLS for ai_insights
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights" ON ai_insights
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights" ON ai_insights
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create index for ai_insights
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_created ON ai_insights(user_id, created_at DESC);

-- Function to clean expired insights
CREATE OR REPLACE FUNCTION cleanup_expired_insights()
RETURNS void AS $$
BEGIN
    DELETE FROM ai_insights WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-insights', '0 2 * * *', 'SELECT cleanup_expired_insights();');

-- Sample data for testing (optional)
-- INSERT INTO daily_moods (user_id, mood, notes, date) VALUES
-- ('your-user-id-here', 'good', 'Feeling productive today', CURRENT_DATE - INTERVAL '1 day'),
-- ('your-user-id-here', 'great', 'Had a great workout', CURRENT_DATE - INTERVAL '2 days'),
-- ('your-user-id-here', 'okay', 'Just a normal day', CURRENT_DATE - INTERVAL '3 days');
