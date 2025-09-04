-- AdSpark Database Schema
-- This file contains the complete database schema for the AdSpark application
-- Based on the PRD data model specifications

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'pro');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid');
CREATE TYPE social_platform AS ENUM ('instagram', 'tiktok');
CREATE TYPE ad_style AS ENUM ('playful', 'professional', 'urgent', 'minimalist', 'bold');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    subscription_tier subscription_tier DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    product_image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad Variations table
CREATE TABLE ad_variations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    generated_image_urls TEXT[] NOT NULL DEFAULT '{}',
    text_prompts TEXT NOT NULL,
    style ad_style NOT NULL,
    posted_to_platform social_platform,
    post_url TEXT,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Media Accounts table
CREATE TABLE social_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform social_platform NOT NULL,
    account_id TEXT NOT NULL,
    account_name TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, platform, account_id)
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT NOT NULL,
    subscription_tier subscription_tier NOT NULL,
    status subscription_status NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage Metrics table
CREATE TABLE usage_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL, -- 'ad_generations', 'social_posts', 'api_calls'
    count INTEGER DEFAULT 0,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, metric_type, period_start)
);

-- Create indexes for better performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX idx_ad_variations_project_id ON ad_variations(project_id);
CREATE INDEX idx_ad_variations_created_at ON ad_variations(created_at DESC);
CREATE INDEX idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_usage_metrics_user_id_period ON usage_metrics(user_id, period_start, period_end);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ad_variations_updated_at BEFORE UPDATE ON ad_variations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON social_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usage_metrics_updated_at BEFORE UPDATE ON usage_metrics FOR EACH ROW EXECUTE FUNCTION update_usage_metrics_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Ad variations policies
CREATE POLICY "Users can view ad variations of own projects" ON ad_variations FOR SELECT 
    USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = ad_variations.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create ad variations for own projects" ON ad_variations FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = ad_variations.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can update ad variations of own projects" ON ad_variations FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = ad_variations.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can delete ad variations of own projects" ON ad_variations FOR DELETE 
    USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = ad_variations.project_id AND projects.user_id = auth.uid()));

-- Social accounts policies
CREATE POLICY "Users can view own social accounts" ON social_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own social accounts" ON social_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own social accounts" ON social_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own social accounts" ON social_accounts FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Usage metrics policies
CREATE POLICY "Users can view own usage metrics" ON usage_metrics FOR SELECT USING (auth.uid() = user_id);

-- Database functions
CREATE OR REPLACE FUNCTION increment_usage_metric(
    user_id UUID,
    metric_type TEXT,
    increment_by INTEGER DEFAULT 1
)
RETURNS void AS $$
DECLARE
    current_period_start TIMESTAMP WITH TIME ZONE;
    current_period_end TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate current month period
    current_period_start := date_trunc('month', NOW());
    current_period_end := current_period_start + INTERVAL '1 month';
    
    -- Insert or update usage metric
    INSERT INTO usage_metrics (user_id, metric_type, count, period_start, period_end)
    VALUES (user_id, metric_type, increment_by, current_period_start, current_period_end)
    ON CONFLICT (user_id, metric_type, period_start)
    DO UPDATE SET 
        count = usage_metrics.count + increment_by,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION check_subscription_limits(
    user_id UUID,
    action_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    user_tier subscription_tier;
    current_usage INTEGER;
    tier_limit INTEGER;
    current_period_start TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get user's subscription tier
    SELECT subscription_tier INTO user_tier FROM users WHERE id = user_id;
    
    -- Calculate current month period
    current_period_start := date_trunc('month', NOW());
    
    -- Get current usage for this action type
    SELECT COALESCE(count, 0) INTO current_usage 
    FROM usage_metrics 
    WHERE usage_metrics.user_id = check_subscription_limits.user_id 
        AND metric_type = action_type 
        AND period_start = current_period_start;
    
    -- Set limits based on tier and action type
    CASE 
        WHEN user_tier = 'free' AND action_type = 'ad_generations' THEN tier_limit := 3;
        WHEN user_tier = 'basic' AND action_type = 'ad_generations' THEN tier_limit := 30;
        WHEN user_tier = 'pro' AND action_type = 'ad_generations' THEN tier_limit := -1; -- unlimited
        WHEN user_tier = 'free' AND action_type = 'social_posts' THEN tier_limit := 0;
        WHEN user_tier = 'basic' AND action_type = 'social_posts' THEN tier_limit := 30;
        WHEN user_tier = 'pro' AND action_type = 'social_posts' THEN tier_limit := -1; -- unlimited
        ELSE tier_limit := 0;
    END CASE;
    
    -- Return true if within limits (or unlimited)
    RETURN tier_limit = -1 OR current_usage < tier_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
