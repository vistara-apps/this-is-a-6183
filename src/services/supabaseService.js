import { supabase, TABLES, dbHelpers } from '../lib/supabase.js'

/**
 * Supabase Service Layer
 * Handles all database operations and provides a clean API for the application
 */

export class SupabaseService {
  // User operations
  static async createUser(userData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .insert([userData])
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating user:', error)
      return { data: null, error }
    }
  }

  static async getUserProfile(userId) {
    try {
      const data = await dbHelpers.getUserProfile(userId)
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return { data: null, error }
    }
  }

  static async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update(updates)
        .eq('id', userId)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating user profile:', error)
      return { data: null, error }
    }
  }

  // Project operations
  static async createProject(projectData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROJECTS)
        .insert([projectData])
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating project:', error)
      return { data: null, error }
    }
  }

  static async getUserProjects(userId) {
    try {
      const data = await dbHelpers.getUserProjects(userId)
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching user projects:', error)
      return { data: null, error }
    }
  }

  static async getProject(projectId, userId) {
    try {
      const data = await dbHelpers.getProjectWithVariations(projectId, userId)
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching project:', error)
      return { data: null, error }
    }
  }

  static async updateProject(projectId, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROJECTS)
        .update(updates)
        .eq('id', projectId)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating project:', error)
      return { data: null, error }
    }
  }

  static async deleteProject(projectId) {
    try {
      const { error } = await supabase
        .from(TABLES.PROJECTS)
        .delete()
        .eq('id', projectId)
      
      if (error) throw error
      return { data: true, error: null }
    } catch (error) {
      console.error('Error deleting project:', error)
      return { data: null, error }
    }
  }

  // Ad Variation operations
  static async createAdVariation(variationData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.AD_VARIATIONS)
        .insert([variationData])
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating ad variation:', error)
      return { data: null, error }
    }
  }

  static async updateAdVariation(variationId, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.AD_VARIATIONS)
        .update(updates)
        .eq('id', variationId)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating ad variation:', error)
      return { data: null, error }
    }
  }

  static async deleteAdVariation(variationId) {
    try {
      const { error } = await supabase
        .from(TABLES.AD_VARIATIONS)
        .delete()
        .eq('id', variationId)
      
      if (error) throw error
      return { data: true, error: null }
    } catch (error) {
      console.error('Error deleting ad variation:', error)
      return { data: null, error }
    }
  }

  // Social Media Account operations
  static async createSocialAccount(accountData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.SOCIAL_ACCOUNTS)
        .insert([accountData])
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating social account:', error)
      return { data: null, error }
    }
  }

  static async getSocialAccounts(userId) {
    try {
      const data = await dbHelpers.getSocialAccounts(userId)
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching social accounts:', error)
      return { data: null, error }
    }
  }

  static async updateSocialAccount(accountId, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.SOCIAL_ACCOUNTS)
        .update(updates)
        .eq('id', accountId)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating social account:', error)
      return { data: null, error }
    }
  }

  static async deleteSocialAccount(accountId) {
    try {
      const { error } = await supabase
        .from(TABLES.SOCIAL_ACCOUNTS)
        .delete()
        .eq('id', accountId)
      
      if (error) throw error
      return { data: true, error: null }
    } catch (error) {
      console.error('Error deleting social account:', error)
      return { data: null, error }
    }
  }

  // Subscription operations
  static async createSubscription(subscriptionData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.SUBSCRIPTIONS)
        .insert([subscriptionData])
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error creating subscription:', error)
      return { data: null, error }
    }
  }

  static async updateSubscription(subscriptionId, updates) {
    try {
      const { data, error } = await supabase
        .from(TABLES.SUBSCRIPTIONS)
        .update(updates)
        .eq('id', subscriptionId)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error updating subscription:', error)
      return { data: null, error }
    }
  }

  static async getSubscriptionByStripeId(stripeSubscriptionId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.SUBSCRIPTIONS)
        .select('*')
        .eq('stripe_subscription_id', stripeSubscriptionId)
        .single()
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching subscription by Stripe ID:', error)
      return { data: null, error }
    }
  }

  // Usage metrics operations
  static async incrementUsageMetric(userId, metricType, increment = 1) {
    try {
      await dbHelpers.updateUsageMetrics(userId, metricType, increment)
      return { data: true, error: null }
    } catch (error) {
      console.error('Error incrementing usage metric:', error)
      return { data: null, error }
    }
  }

  static async checkSubscriptionLimits(userId, actionType) {
    try {
      const data = await dbHelpers.checkSubscriptionLimits(userId, actionType)
      return { data, error: null }
    } catch (error) {
      console.error('Error checking subscription limits:', error)
      return { data: null, error }
    }
  }

  static async getUserUsageMetrics(userId, metricType = null) {
    try {
      let query = supabase
        .from(TABLES.USAGE_METRICS)
        .select('*')
        .eq('user_id', userId)
        .order('period_start', { ascending: false })
      
      if (metricType) {
        query = query.eq('metric_type', metricType)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Error fetching usage metrics:', error)
      return { data: null, error }
    }
  }

  // Analytics operations
  static async getProjectAnalytics(projectId, userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.AD_VARIATIONS)
        .select('impressions, clicks, created_at, style, posted_to_platform')
        .eq('project_id', projectId)
        .not('posted_to_platform', 'is', null)
      
      if (error) throw error
      
      // Calculate analytics
      const totalImpressions = data.reduce((sum, variation) => sum + (variation.impressions || 0), 0)
      const totalClicks = data.reduce((sum, variation) => sum + (variation.clicks || 0), 0)
      const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
      
      const analytics = {
        totalVariations: data.length,
        totalImpressions,
        totalClicks,
        ctr: parseFloat(ctr.toFixed(2)),
        variations: data
      }
      
      return { data: analytics, error: null }
    } catch (error) {
      console.error('Error fetching project analytics:', error)
      return { data: null, error }
    }
  }

  static async getUserAnalytics(userId) {
    try {
      // Get all projects and their analytics
      const { data: projects, error: projectsError } = await supabase
        .from(TABLES.PROJECTS)
        .select(`
          id,
          product_name,
          created_at,
          ad_variations (
            impressions,
            clicks,
            created_at,
            posted_to_platform
          )
        `)
        .eq('user_id', userId)
      
      if (projectsError) throw projectsError
      
      // Calculate overall analytics
      let totalImpressions = 0
      let totalClicks = 0
      let totalVariations = 0
      let totalPosts = 0
      
      projects.forEach(project => {
        project.ad_variations.forEach(variation => {
          totalVariations++
          if (variation.posted_to_platform) {
            totalPosts++
            totalImpressions += variation.impressions || 0
            totalClicks += variation.clicks || 0
          }
        })
      })
      
      const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0
      
      const analytics = {
        totalProjects: projects.length,
        totalVariations,
        totalPosts,
        totalImpressions,
        totalClicks,
        ctr: parseFloat(ctr.toFixed(2)),
        projects
      }
      
      return { data: analytics, error: null }
    } catch (error) {
      console.error('Error fetching user analytics:', error)
      return { data: null, error }
    }
  }
}

export default SupabaseService
