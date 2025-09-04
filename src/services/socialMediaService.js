import { env, integrations } from '../config/env.js'

/**
 * Social Media Service Layer
 * Handles Instagram and TikTok API integrations for posting and analytics
 */

class SocialMediaService {
  constructor() {
    this.rateLimiter = {
      requests: [],
      maxRequests: env.rateLimits.socialPost,
      timeWindow: 60000 // 1 minute
    }
  }

  // Rate limiting helper
  checkRateLimit() {
    const now = Date.now()
    this.rateLimiter.requests = this.rateLimiter.requests.filter(
      timestamp => now - timestamp < this.rateLimiter.timeWindow
    )
    
    if (this.rateLimiter.requests.length >= this.rateLimiter.maxRequests) {
      throw new Error('Social media posting rate limit exceeded. Please try again later.')
    }
    
    this.rateLimiter.requests.push(now)
  }

  // Instagram Business API Integration
  async connectInstagram() {
    if (!integrations.instagram) {
      throw new Error('Instagram integration not configured')
    }

    const scopes = [
      'instagram_basic',
      'instagram_content_publish',
      'pages_show_list',
      'pages_read_engagement'
    ].join(',')

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${env.meta.appId}&` +
      `redirect_uri=${encodeURIComponent(env.meta.redirectUri)}&` +
      `scope=${scopes}&` +
      `response_type=code&` +
      `state=instagram_auth`

    return {
      authUrl,
      platform: 'instagram'
    }
  }

  async handleInstagramCallback(code, state) {
    if (!integrations.instagram) {
      throw new Error('Instagram integration not configured')
    }

    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: env.meta.appId,
          client_secret: env.meta.appSecret,
          redirect_uri: env.meta.redirectUri,
          code: code
        })
      })

      const tokenData = await tokenResponse.json()
      
      if (tokenData.error) {
        throw new Error(tokenData.error.message)
      }

      // Get user's Instagram Business Account
      const accountResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/accounts?access_token=${tokenData.access_token}`
      )
      
      const accountData = await accountResponse.json()
      
      if (accountData.error) {
        throw new Error(accountData.error.message)
      }

      // Find Instagram Business Account
      let instagramAccount = null
      for (const page of accountData.data) {
        const igResponse = await fetch(
          `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${tokenData.access_token}`
        )
        const igData = await igResponse.json()
        
        if (igData.instagram_business_account) {
          instagramAccount = {
            id: igData.instagram_business_account.id,
            name: page.name,
            pageId: page.id,
            accessToken: tokenData.access_token
          }
          break
        }
      }

      if (!instagramAccount) {
        throw new Error('No Instagram Business Account found. Please ensure your Instagram account is connected to a Facebook Page.')
      }

      return {
        platform: 'instagram',
        accountId: instagramAccount.id,
        accountName: instagramAccount.name,
        accessToken: instagramAccount.accessToken,
        refreshToken: null,
        tokenExpiresAt: new Date(Date.now() + (tokenData.expires_in * 1000))
      }

    } catch (error) {
      console.error('Instagram callback error:', error)
      throw error
    }
  }

  async postToInstagram(accountData, imageUrl, caption) {
    if (!integrations.instagram) {
      throw new Error('Instagram integration not configured')
    }

    try {
      this.checkRateLimit()

      // Step 1: Create media container
      const containerResponse = await fetch(
        `https://graph.facebook.com/v18.0/${accountData.accountId}/media`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_url: imageUrl,
            caption: caption,
            access_token: accountData.accessToken
          })
        }
      )

      const containerData = await containerResponse.json()
      
      if (containerData.error) {
        throw new Error(containerData.error.message)
      }

      // Step 2: Publish the media
      const publishResponse = await fetch(
        `https://graph.facebook.com/v18.0/${accountData.accountId}/media_publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            creation_id: containerData.id,
            access_token: accountData.accessToken
          })
        }
      )

      const publishData = await publishResponse.json()
      
      if (publishData.error) {
        throw new Error(publishData.error.message)
      }

      return {
        success: true,
        postId: publishData.id,
        postUrl: `https://www.instagram.com/p/${publishData.id}/`,
        platform: 'instagram'
      }

    } catch (error) {
      console.error('Instagram posting error:', error)
      throw error
    }
  }

  // TikTok API Integration
  async connectTikTok() {
    if (!integrations.tiktok) {
      throw new Error('TikTok integration not configured')
    }

    const scopes = [
      'user.info.basic',
      'video.publish',
      'video.list'
    ].join(',')

    const authUrl = `https://www.tiktok.com/auth/authorize/?` +
      `client_key=${env.tiktok.clientKey}&` +
      `scope=${scopes}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(env.tiktok.redirectUri)}&` +
      `state=tiktok_auth`

    return {
      authUrl,
      platform: 'tiktok'
    }
  }

  async handleTikTokCallback(code, state) {
    if (!integrations.tiktok) {
      throw new Error('TikTok integration not configured')
    }

    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_key: env.tiktok.clientKey,
          client_secret: env.tiktok.clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: env.tiktok.redirectUri
        })
      })

      const tokenData = await tokenResponse.json()
      
      if (tokenData.error) {
        throw new Error(tokenData.error_description || tokenData.error)
      }

      // Get user info
      const userResponse = await fetch(
        `https://open-api.tiktok.com/user/info/?access_token=${tokenData.access_token}`
      )
      
      const userData = await userResponse.json()
      
      if (userData.error) {
        throw new Error(userData.error.message)
      }

      return {
        platform: 'tiktok',
        accountId: userData.data.user.open_id,
        accountName: userData.data.user.display_name,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt: new Date(Date.now() + (tokenData.expires_in * 1000))
      }

    } catch (error) {
      console.error('TikTok callback error:', error)
      throw error
    }
  }

  async postToTikTok(accountData, videoUrl, caption) {
    if (!integrations.tiktok) {
      throw new Error('TikTok integration not configured')
    }

    try {
      this.checkRateLimit()

      // Note: TikTok requires video content, not images
      // This is a simplified implementation
      console.warn('TikTok posting requires video content. Image posting not supported.')
      
      throw new Error('TikTok posting requires video content. Please use video files for TikTok posts.')

    } catch (error) {
      console.error('TikTok posting error:', error)
      throw error
    }
  }

  // Generic posting method
  async postToSocialMedia(platform, accountData, contentUrl, caption) {
    switch (platform) {
      case 'instagram':
        return await this.postToInstagram(accountData, contentUrl, caption)
      case 'tiktok':
        return await this.postToTikTok(accountData, contentUrl, caption)
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  // Get post analytics (simplified)
  async getPostAnalytics(platform, accountData, postId) {
    try {
      switch (platform) {
        case 'instagram':
          return await this.getInstagramAnalytics(accountData, postId)
        case 'tiktok':
          return await this.getTikTokAnalytics(accountData, postId)
        default:
          throw new Error(`Analytics not supported for platform: ${platform}`)
      }
    } catch (error) {
      console.error('Analytics error:', error)
      return {
        impressions: 0,
        clicks: 0,
        engagement: 0
      }
    }
  }

  async getInstagramAnalytics(accountData, postId) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${postId}/insights?metric=impressions,reach,engagement&access_token=${accountData.accessToken}`
      )
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error.message)
      }

      const metrics = {}
      data.data.forEach(metric => {
        metrics[metric.name] = metric.values[0]?.value || 0
      })

      return {
        impressions: metrics.impressions || 0,
        clicks: metrics.reach || 0, // Using reach as proxy for clicks
        engagement: metrics.engagement || 0
      }

    } catch (error) {
      console.error('Instagram analytics error:', error)
      return { impressions: 0, clicks: 0, engagement: 0 }
    }
  }

  async getTikTokAnalytics(accountData, postId) {
    // TikTok analytics implementation would go here
    // For now, return mock data
    return {
      impressions: Math.floor(Math.random() * 1000),
      clicks: Math.floor(Math.random() * 100),
      engagement: Math.floor(Math.random() * 50)
    }
  }

  // Check if platforms are available
  getAvailablePlatforms() {
    return {
      instagram: integrations.instagram,
      tiktok: integrations.tiktok
    }
  }

  // Get rate limit status
  getRateLimitStatus() {
    const now = Date.now()
    const recentRequests = this.rateLimiter.requests.filter(
      timestamp => now - timestamp < this.rateLimiter.timeWindow
    )
    
    return {
      remaining: Math.max(0, this.rateLimiter.maxRequests - recentRequests.length),
      total: this.rateLimiter.maxRequests,
      resetTime: recentRequests.length > 0 
        ? new Date(recentRequests[0] + this.rateLimiter.timeWindow)
        : new Date()
    }
  }

  // Mock posting for development/testing
  async mockPost(platform, contentUrl, caption) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          postId: `mock_${platform}_${Date.now()}`,
          postUrl: `https://mock-${platform}.com/post/123`,
          platform
        })
      }, 2000) // Simulate API delay
    })
  }
}

// Create singleton instance
const socialMediaService = new SocialMediaService()

export default socialMediaService
export { SocialMediaService }
