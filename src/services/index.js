/**
 * Services Index
 * Central export point for all service modules
 */

import supabaseServiceInstance from './supabaseService.js'
import openaiServiceInstance from './openaiService.js'
import socialMediaServiceInstance from './socialMediaService.js'
import stripeServiceInstance from './stripeService.js'

export { default as supabaseService } from './supabaseService.js'
export { default as openaiService } from './openaiService.js'
export { default as socialMediaService } from './socialMediaService.js'
export { default as stripeService } from './stripeService.js'

// Re-export service classes for direct instantiation if needed
export { SupabaseService } from './supabaseService.js'
export { OpenAIService } from './openaiService.js'
export { SocialMediaService } from './socialMediaService.js'
export { StripeService } from './stripeService.js'

// Service availability checker
export const checkServiceAvailability = () => {
  return {
    supabase: true, // Always available as it's required
    openai: openaiServiceInstance.isAvailable(),
    socialMedia: {
      instagram: socialMediaServiceInstance.getAvailablePlatforms().instagram,
      tiktok: socialMediaServiceInstance.getAvailablePlatforms().tiktok
    },
    stripe: stripeServiceInstance.isAvailable()
  }
}

// Service health checker
export const checkServiceHealth = async () => {
  const health = {
    supabase: { status: 'unknown', error: null },
    openai: { status: 'unknown', error: null },
    socialMedia: { status: 'unknown', error: null },
    stripe: { status: 'unknown', error: null }
  }

  // Check Supabase connection
  try {
    const { data, error } = await supabaseServiceInstance.getCurrentUser()
    health.supabase.status = error ? 'error' : 'healthy'
    health.supabase.error = error?.message || null
  } catch (error) {
    health.supabase.status = 'error'
    health.supabase.error = error.message
  }

  // Check OpenAI availability
  try {
    health.openai.status = openaiServiceInstance.isAvailable() ? 'healthy' : 'disabled'
    if (!openaiServiceInstance.isAvailable()) {
      health.openai.error = 'OpenAI API key not configured'
    }
  } catch (error) {
    health.openai.status = 'error'
    health.openai.error = error.message
  }

  // Check Social Media services
  try {
    const platforms = socialMediaServiceInstance.getAvailablePlatforms()
    health.socialMedia.status = (platforms.instagram || platforms.tiktok) ? 'healthy' : 'disabled'
    if (!platforms.instagram && !platforms.tiktok) {
      health.socialMedia.error = 'No social media platforms configured'
    }
  } catch (error) {
    health.socialMedia.status = 'error'
    health.socialMedia.error = error.message
  }

  // Check Stripe availability
  try {
    health.stripe.status = stripeServiceInstance.isAvailable() ? 'healthy' : 'disabled'
    if (!stripeServiceInstance.isAvailable()) {
      health.stripe.error = 'Stripe not configured or not initialized'
    }
  } catch (error) {
    health.stripe.status = 'error'
    health.stripe.error = error.message
  }

  return health
}
