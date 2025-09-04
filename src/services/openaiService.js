import OpenAI from 'openai'
import { env, integrations } from '../config/env.js'

/**
 * OpenAI Service Layer
 * Handles AI-powered ad generation using OpenAI API
 */

class OpenAIService {
  constructor() {
    if (!integrations.openai) {
      console.warn('OpenAI API key not configured. AI features will be disabled.')
      this.client = null
      return
    }

    this.client = new OpenAI({
      apiKey: env.openai.apiKey,
      dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
    })
    
    this.rateLimiter = {
      requests: [],
      maxRequests: env.rateLimits.openai,
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
      throw new Error('Rate limit exceeded. Please try again later.')
    }
    
    this.rateLimiter.requests.push(now)
  }

  // Generate text prompts for ad variations
  async generateAdPrompts(productName, style, count = 3) {
    if (!this.client) {
      return this.generateMockPrompts(productName, style, count)
    }

    try {
      this.checkRateLimit()

      const stylePrompts = {
        playful: 'Create fun, energetic, and engaging ad copy with emojis and excitement',
        professional: 'Create clean, business-focused, and trustworthy ad copy',
        urgent: 'Create compelling ad copy that creates a sense of urgency and scarcity',
        minimalist: 'Create simple, elegant, and refined ad copy with minimal words',
        bold: 'Create eye-catching, dramatic, and impossible-to-ignore ad copy'
      }

      const systemPrompt = `You are an expert copywriter specializing in social media advertising. ${stylePrompts[style] || stylePrompts.playful}. 

Guidelines:
- Keep each ad copy under 150 characters for social media
- Focus on benefits and emotional appeal
- Include a clear call-to-action when appropriate
- Make it platform-appropriate for Instagram and TikTok
- Avoid overly salesy language
- Be authentic and engaging`

      const userPrompt = `Generate ${count} different ad copy variations for a product called "${productName}". Each variation should be unique and compelling, following the ${style} style. Return only the ad copy text, one per line.`

      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.8,
        n: 1
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('No response from OpenAI')
      }

      // Parse the response into individual prompts
      const prompts = response
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .slice(0, count)

      return {
        success: true,
        prompts,
        usage: completion.usage
      }

    } catch (error) {
      console.error('Error generating ad prompts:', error)
      
      // Fallback to mock prompts if API fails
      if (error.message.includes('Rate limit')) {
        throw error
      }
      
      return this.generateMockPrompts(productName, style, count)
    }
  }

  // Generate image variations using DALL-E (if available)
  async generateImageVariations(imageUrl, count = 3) {
    if (!this.client) {
      return {
        success: false,
        error: 'OpenAI not configured',
        images: []
      }
    }

    try {
      this.checkRateLimit()

      // Note: DALL-E image variations require the image to be uploaded as a file
      // For now, we'll return the original image as this requires more complex implementation
      console.warn('Image variation generation not fully implemented. Returning original image.')
      
      return {
        success: true,
        images: Array(count).fill(imageUrl),
        usage: { total_tokens: 0 }
      }

    } catch (error) {
      console.error('Error generating image variations:', error)
      return {
        success: false,
        error: error.message,
        images: []
      }
    }
  }

  // Generate complete ad variations (text + image)
  async generateAdVariations(productName, imageUrl, style, count = 3) {
    try {
      // Generate text prompts
      const textResult = await this.generateAdPrompts(productName, style, count)
      
      if (!textResult.success) {
        throw new Error('Failed to generate text prompts')
      }

      // For now, use the original image for all variations
      // In a full implementation, you would generate image variations here
      const variations = textResult.prompts.map((prompt, index) => ({
        id: `temp_${Date.now()}_${index}`,
        textPrompts: prompt,
        generatedImageUrls: [imageUrl],
        style,
        impressions: 0,
        clicks: 0,
        postedToPlatform: null,
        postUrl: null
      }))

      return {
        success: true,
        variations,
        usage: textResult.usage
      }

    } catch (error) {
      console.error('Error generating ad variations:', error)
      throw error
    }
  }

  // Mock prompt generation for fallback
  generateMockPrompts(productName, style, count = 3) {
    const mockPrompts = {
      playful: [
        `🎉 Get ready to fall in love with ${productName}! ✨`,
        `This ${productName} is about to become your new obsession! 💖`,
        `Say hello to your new favorite ${productName}! 🌟`,
        `${productName} just hit different! Who else is obsessed? 🔥`,
        `Plot twist: ${productName} is actually life-changing ✨`
      ],
      professional: [
        `Discover the premium quality of ${productName}`,
        `${productName}: Where excellence meets functionality`,
        `Experience the difference with ${productName}`,
        `Elevate your standards with ${productName}`,
        `Professional-grade ${productName} for discerning customers`
      ],
      urgent: [
        `⚡ Limited time: ${productName} won't last long!`,
        `🔥 Only today: Get ${productName} before it's gone!`,
        `⏰ Last chance to get ${productName}!`,
        `🚨 ${productName} selling out fast - don't miss out!`,
        `⚡ 24 hours left: Secure your ${productName} now!`
      ],
      minimalist: [
        `${productName}. Simple. Perfect.`,
        `${productName}: Less is more.`,
        `${productName}. Refined.`,
        `Pure ${productName}.`,
        `${productName}. Essential.`
      ],
      bold: [
        `🚀 ${productName} WILL CHANGE YOUR LIFE!`,
        `💥 The ${productName} everyone's talking about!`,
        `🔥 ${productName}: IMPOSSIBLE TO IGNORE!`,
        `⚡ ${productName} is REVOLUTIONARY!`,
        `💯 ${productName}: THE GAME CHANGER!`
      ]
    }

    const stylePrompts = mockPrompts[style] || mockPrompts.playful
    const selectedPrompts = []
    
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * stylePrompts.length)
      selectedPrompts.push(stylePrompts[randomIndex])
    }

    return {
      success: true,
      prompts: selectedPrompts,
      usage: { total_tokens: 0 }
    }
  }

  // Check if OpenAI is available
  isAvailable() {
    return Boolean(this.client)
  }

  // Get current rate limit status
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
}

// Create singleton instance
const openaiService = new OpenAIService()

export default openaiService
export { OpenAIService }
