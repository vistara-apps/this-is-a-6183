import React, { useState } from 'react'
import { Share2, BarChart, Eye, MousePointer, Instagram, Music } from 'lucide-react'

const AdVariationCard = ({ variation, onPost, variant = 'default' }) => {
  const [isPosting, setIsPosting] = useState(false)

  const handlePost = async (platform) => {
    setIsPosting(true)
    try {
      await onPost(variation.id, platform)
    } catch (error) {
      console.error('Failed to post:', error)
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="card p-4">
      {/* Generated Image */}
      <div className="aspect-square bg-gray-100 rounded-md mb-4 overflow-hidden">
        {variation.generatedImageUrls?.[0] ? (
          <img
            src={variation.generatedImageUrls[0]}
            alt="Generated ad variation"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Eye className="w-12 h-12" />
          </div>
        )}
      </div>

      {/* Style Badge */}
      <div className="mb-3">
        <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
          {variation.style || 'Default'}
        </span>
      </div>

      {/* Text Prompts */}
      {variation.textPrompts && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-text-primary mb-2">Generated Text:</h4>
          <p className="text-sm text-text-secondary bg-gray-50 p-2 rounded-md">
            {variation.textPrompts}
          </p>
        </div>
      )}

      {/* Analytics */}
      {variation.impressions > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-text-secondary mb-1">
              <Eye className="w-4 h-4" />
              <span className="text-xs">Impressions</span>
            </div>
            <div className="text-lg font-semibold text-text-primary">
              {variation.impressions.toLocaleString()}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-text-secondary mb-1">
              <MousePointer className="w-4 h-4" />
              <span className="text-xs">Clicks</span>
            </div>
            <div className="text-lg font-semibold text-text-primary">
              {variation.clicks.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {variant === 'withActions' && (
        <div className="space-y-2">
          {!variation.postedToPlatform ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handlePost('instagram')}
                disabled={isPosting}
                className="flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md text-sm font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
              >
                <Instagram className="w-4 h-4" />
                <span>{isPosting ? 'Posting...' : 'Instagram'}</span>
              </button>
              <button
                onClick={() => handlePost('tiktok')}
                disabled={isPosting}
                className="flex items-center justify-center space-x-2 px-3 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                <Music className="w-4 h-4" />
                <span>{isPosting ? 'Posting...' : 'TikTok'}</span>
              </button>
            </div>
          ) : (
            <div className="text-center">
              <span className="inline-flex items-center space-x-1 text-sm text-accent font-medium">
                <Share2 className="w-4 h-4" />
                <span>Posted to {variation.postedToPlatform}</span>
              </span>
              {variation.postUrl && (
                <a
                  href={variation.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-1 text-xs text-primary hover:underline"
                >
                  View Post
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdVariationCard