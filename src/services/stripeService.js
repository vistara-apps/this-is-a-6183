import { env, integrations } from '../config/env.js'

/**
 * Stripe Service Layer
 * Handles subscription billing and payment processing
 */

class StripeService {
  constructor() {
    this.stripe = null
    this.initialized = false
    
    if (integrations.stripe && typeof window !== 'undefined') {
      this.initializeStripe()
    }
  }

  async initializeStripe() {
    try {
      // Dynamically import Stripe
      const { loadStripe } = await import('@stripe/stripe-js')
      this.stripe = await loadStripe(env.stripe.publishableKey)
      this.initialized = true
    } catch (error) {
      console.error('Failed to initialize Stripe:', error)
    }
  }

  // Subscription plans configuration
  getSubscriptionPlans() {
    return {
      free: {
        id: 'free',
        name: 'Free',
        price: 0,
        interval: 'month',
        features: [
          '3 ad variations per month',
          'Basic analytics',
          'Email support'
        ],
        limits: {
          adGenerations: 3,
          socialPosts: 0,
          projects: 1
        }
      },
      basic: {
        id: 'basic',
        name: 'Basic',
        price: 19,
        interval: 'month',
        stripePriceId: 'price_basic_monthly', // Replace with actual Stripe price ID
        features: [
          '30 ad variations per month',
          'Social media posting',
          'Advanced analytics',
          'Priority email support'
        ],
        limits: {
          adGenerations: 30,
          socialPosts: 30,
          projects: 5
        }
      },
      pro: {
        id: 'pro',
        name: 'Pro',
        price: 49,
        interval: 'month',
        stripePriceId: 'price_pro_monthly', // Replace with actual Stripe price ID
        features: [
          'Unlimited ad variations',
          'Unlimited social media posting',
          'Advanced analytics & reporting',
          'Priority support',
          'Custom integrations'
        ],
        limits: {
          adGenerations: -1, // unlimited
          socialPosts: -1, // unlimited
          projects: -1 // unlimited
        }
      }
    }
  }

  // Create checkout session for subscription
  async createCheckoutSession(planId, userId, userEmail) {
    if (!this.initialized) {
      throw new Error('Stripe not initialized')
    }

    const plans = this.getSubscriptionPlans()
    const plan = plans[planId]
    
    if (!plan || !plan.stripePriceId) {
      throw new Error('Invalid subscription plan')
    }

    try {
      // This would typically be done on your backend
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          userId,
          userEmail,
          successUrl: `${env.app.url}/app/settings?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${env.app.url}/app/settings`
        })
      })

      const session = await response.json()
      
      if (session.error) {
        throw new Error(session.error)
      }

      // Redirect to Stripe Checkout
      const { error } = await this.stripe.redirectToCheckout({
        sessionId: session.id
      })

      if (error) {
        throw error
      }

      return { success: true, sessionId: session.id }

    } catch (error) {
      console.error('Checkout session error:', error)
      throw error
    }
  }

  // Create customer portal session
  async createPortalSession(customerId) {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl: `${env.app.url}/app/settings`
        })
      })

      const session = await response.json()
      
      if (session.error) {
        throw new Error(session.error)
      }

      // Redirect to customer portal
      window.location.href = session.url

      return { success: true, url: session.url }

    } catch (error) {
      console.error('Portal session error:', error)
      throw error
    }
  }

  // Handle successful checkout
  async handleCheckoutSuccess(sessionId) {
    try {
      const response = await fetch(`/api/checkout-session/${sessionId}`)
      const session = await response.json()
      
      if (session.error) {
        throw new Error(session.error)
      }

      return {
        success: true,
        subscription: session.subscription,
        customer: session.customer
      }

    } catch (error) {
      console.error('Checkout success handling error:', error)
      throw error
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId
        })
      })

      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      return { success: true, subscription: result.subscription }

    } catch (error) {
      console.error('Subscription cancellation error:', error)
      throw error
    }
  }

  // Update subscription
  async updateSubscription(subscriptionId, newPriceId) {
    try {
      const response = await fetch('/api/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          newPriceId
        })
      })

      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      return { success: true, subscription: result.subscription }

    } catch (error) {
      console.error('Subscription update error:', error)
      throw error
    }
  }

  // Get subscription status
  async getSubscriptionStatus(subscriptionId) {
    try {
      const response = await fetch(`/api/subscription/${subscriptionId}`)
      const subscription = await response.json()
      
      if (subscription.error) {
        throw new Error(subscription.error)
      }

      return {
        success: true,
        subscription
      }

    } catch (error) {
      console.error('Subscription status error:', error)
      throw error
    }
  }

  // Check if user can perform action based on subscription
  checkSubscriptionLimits(userSubscription, action, currentUsage) {
    const plans = this.getSubscriptionPlans()
    const plan = plans[userSubscription.tier] || plans.free
    
    if (!plan.limits[action]) {
      return { allowed: false, reason: 'Action not supported in current plan' }
    }

    const limit = plan.limits[action]
    
    // Unlimited access
    if (limit === -1) {
      return { allowed: true }
    }

    // Check if within limits
    if (currentUsage < limit) {
      return { 
        allowed: true, 
        remaining: limit - currentUsage 
      }
    }

    return { 
      allowed: false, 
      reason: `Monthly limit of ${limit} ${action} reached`,
      upgradeRequired: true
    }
  }

  // Get upgrade recommendations
  getUpgradeRecommendation(currentTier, requiredAction) {
    const plans = this.getSubscriptionPlans()
    
    for (const [planId, plan] of Object.entries(plans)) {
      if (planId === currentTier) continue
      
      if (plan.limits[requiredAction] === -1 || plan.limits[requiredAction] > 0) {
        return {
          recommendedPlan: planId,
          plan: plan,
          benefits: plan.features
        }
      }
    }

    return null
  }

  // Mock payment for development
  async mockPayment(planId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          subscriptionId: `mock_sub_${Date.now()}`,
          customerId: `mock_cus_${Date.now()}`,
          status: 'active'
        })
      }, 2000)
    })
  }

  // Check if Stripe is available
  isAvailable() {
    return integrations.stripe && this.initialized
  }
}

// Create singleton instance
const stripeService = new StripeService()

export default stripeService
export { StripeService }
