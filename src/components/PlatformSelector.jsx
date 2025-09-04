import React from 'react'
import { Instagram, Music } from 'lucide-react'

const PlatformSelector = ({ selectedPlatforms, onPlatformChange, variant = 'checkbox' }) => {
  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'from-purple-500 to-pink-500' },
    { id: 'tiktok', name: 'TikTok', icon: Music, color: 'from-black to-gray-800' }
  ]

  if (variant === 'dropdown') {
    return (
      <select
        value={selectedPlatforms[0] || ''}
        onChange={(e) => onPlatformChange([e.target.value])}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">Select platform</option>
        {platforms.map((platform) => (
          <option key={platform.id} value={platform.id}>
            {platform.name}
          </option>
        ))}
      </select>
    )
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-text-primary">Target Platforms</label>
      <div className="grid grid-cols-2 gap-3">
        {platforms.map((platform) => {
          const isSelected = selectedPlatforms.includes(platform.id)
          const Icon = platform.icon
          
          return (
            <label
              key={platform.id}
              className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-primary bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  if (e.target.checked) {
                    onPlatformChange([...selectedPlatforms, platform.id])
                  } else {
                    onPlatformChange(selectedPlatforms.filter(p => p !== platform.id))
                  }
                }}
                className="sr-only"
              />
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${platform.color} flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-text-primary">{platform.name}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

export default PlatformSelector