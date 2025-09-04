import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env.js'

// Create Supabase client
export const supabase = createClient(
  env.supabase.url,
  env.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
)

// Database table names
export const TABLES = {
  USERS: 'users',
  PROJECTS: 'projects', 
  AD_VARIATIONS: 'ad_variations',
  SOCIAL_ACCOUNTS: 'social_accounts',
  SUBSCRIPTIONS: 'subscriptions',
  USAGE_METRICS: 'usage_metrics'
}

// Helper functions for common database operations
export const dbHelpers = {
  // Get current user profile
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Get user profile with subscription info
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select(`
        *,
        subscriptions (
          id,
          subscription_tier,
          status,
          current_period_end
        )
      `)
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  // Get projects for user with ad variations count
  async getUserProjects(userId) {
    const { data, error } = await supabase
      .from(TABLES.PROJECTS)
      .select(`
        *,
        ad_variations (count)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get project with all ad variations
  async getProjectWithVariations(projectId, userId) {
    const { data, error } = await supabase
      .from(TABLES.PROJECTS)
      .select(`
        *,
        ad_variations (*)
      `)
      .eq('id', projectId)
      .eq('user_id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  // Get user's social media accounts
  async getSocialAccounts(userId) {
    const { data, error } = await supabase
      .from(TABLES.SOCIAL_ACCOUNTS)
      .select('*')
      .eq('user_id', userId)
    
    if (error) throw error
    return data
  },

  // Update user usage metrics
  async updateUsageMetrics(userId, metricType, increment = 1) {
    const { data, error } = await supabase.rpc('increment_usage_metric', {
      user_id: userId,
      metric_type: metricType,
      increment_by: increment
    })
    
    if (error) throw error
    return data
  },

  // Check user subscription limits
  async checkSubscriptionLimits(userId, action) {
    const { data, error } = await supabase.rpc('check_subscription_limits', {
      user_id: userId,
      action_type: action
    })
    
    if (error) throw error
    return data
  }
}

// Real-time subscription helpers
export const realtimeHelpers = {
  // Subscribe to project changes
  subscribeToProjects(userId, callback) {
    return supabase
      .channel('projects')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.PROJECTS,
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()
  },

  // Subscribe to ad variation changes
  subscribeToAdVariations(projectId, callback) {
    return supabase
      .channel('ad_variations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.AD_VARIATIONS,
          filter: `project_id=eq.${projectId}`
        },
        callback
      )
      .subscribe()
  },

  // Unsubscribe from channel
  unsubscribe(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription)
    }
  }
}

export default supabase
