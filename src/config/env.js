/**
 * Environment configuration and validation
 * Centralizes all environment variable access and provides validation
 */

// Environment variable validation
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
]

const optionalEnvVars = [
  'VITE_OPENAI_API_KEY',
  'VITE_META_APP_ID',
  'VITE_TIKTOK_CLIENT_KEY',
  'VITE_STRIPE_PUBLISHABLE_KEY',
]

// Validate required environment variables
const validateEnv = () => {
  const missing = requiredEnvVars.filter(envVar => !import.meta.env[envVar])
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing)
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// Environment configuration object
export const env = {
  // Supabase
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  
  // OpenAI
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    rateLimit: parseInt(import.meta.env.VITE_OPENAI_RATE_LIMIT) || 10,
  },
  
  // Meta/Instagram
  meta: {
    appId: import.meta.env.VITE_META_APP_ID,
    appSecret: import.meta.env.VITE_META_APP_SECRET,
    redirectUri: import.meta.env.VITE_INSTAGRAM_REDIRECT_URI,
  },
  
  // TikTok
  tiktok: {
    clientKey: import.meta.env.VITE_TIKTOK_CLIENT_KEY,
    clientSecret: import.meta.env.VITE_TIKTOK_CLIENT_SECRET,
    redirectUri: import.meta.env.VITE_TIKTOK_REDIRECT_URI,
  },
  
  // Stripe
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  },
  
  // Application
  app: {
    url: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5173/api',
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
  },
  
  // Feature flags
  features: {
    socialPosting: import.meta.env.VITE_ENABLE_SOCIAL_POSTING === 'true',
    payments: import.meta.env.VITE_ENABLE_PAYMENTS === 'true',
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  },
  
  // Rate limiting
  rateLimits: {
    openai: parseInt(import.meta.env.VITE_OPENAI_RATE_LIMIT) || 10,
    socialPost: parseInt(import.meta.env.VITE_SOCIAL_POST_RATE_LIMIT) || 5,
  },
}

// Check if specific integrations are available
export const integrations = {
  openai: Boolean(env.openai.apiKey),
  instagram: Boolean(env.meta.appId),
  tiktok: Boolean(env.tiktok.clientKey),
  stripe: Boolean(env.stripe.publishableKey),
}

// Initialize environment validation
try {
  validateEnv()
} catch (error) {
  console.error('Environment validation failed:', error.message)
  // In development, we can continue with warnings
  if (env.app.isProduction) {
    throw error
  }
}

export default env
