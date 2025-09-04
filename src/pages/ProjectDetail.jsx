import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjects } from '../contexts/ProjectContext'
import { ArrowLeft, Zap, Palette, Share2, Settings } from 'lucide-react'
import AdVariationCard from '../components/AdVariationCard'
import PlatformSelector from '../components/PlatformSelector'

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProject, addAdVariation, updateProject } = useProjects()
  const [project, setProject] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState('playful')
  const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram'])

  useEffect(() => {
    const projectData = getProject(id)
    if (!projectData) {
      navigate('/app/projects')
      return
    }
    setProject(projectData)
  }, [id, getProject, navigate])

  const styles = [
    { id: 'playful', name: 'Playful', description: 'Fun and energetic vibes' },
    { id: 'professional', name: 'Professional', description: 'Clean and business-focused' },
    { id: 'urgent', name: 'Urgent', description: 'Creates sense of urgency' },
    { id: 'minimalist', name: 'Minimalist', description: 'Simple and elegant' },
    { id: 'bold', name: 'Bold', description: 'Eye-catching and dramatic' }
  ]

  const generateVariations = async () => {
    if (!project) return

    setGenerating(true)
    try {
      // Simulate AI generation delay
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Generate mock variations
      const variations = []
      for (let i = 0; i < 3; i++) {
        const variation = {
          style: selectedStyle,
          textPrompts: generateMockTextPrompt(selectedStyle, project.productName),
          generatedImageUrls: [project.productImageUrl], // In real app, this would be AI-generated
        }
        
        const savedVariation = await addAdVariation(project.id, variation)
        variations.push(savedVariation)
      }

      // Update project in state
      const updatedProject = getProject(project.id)
      setProject(updatedProject)

    } catch (error) {
      console.error('Failed to generate variations:', error)
    } finally {
      setGenerating(false)
    }
  }

  const generateMockTextPrompt = (style, productName) => {
    const prompts = {
      playful: [
        `🎉 Get ready to fall in love with ${productName}! ✨`,
        `This ${productName} is about to become your new obsession! 💖`,
        `Say hello to your new favorite ${productName}! 🌟`
      ],
      professional: [
        `Discover the premium quality of ${productName}`,
        `${productName}: Where excellence meets functionality`,
        `Experience the difference with ${productName}`
      ],
      urgent: [
        `⚡ Limited time: ${productName} won't last long!`,
        `🔥 Only today: Get ${productName} before it's gone!`,
        `⏰ Last chance to get ${productName}!`
      ],
      minimalist: [
        `${productName}. Simple. Perfect.`,
        `${productName}: Less is more.`,
        `${productName}. Refined.`
      ],
      bold: [
        `🚀 ${productName} WILL CHANGE YOUR LIFE!`,
        `💥 The ${productName} everyone's talking about!`,
        `🔥 ${productName}: IMPOSSIBLE TO IGNORE!`
      ]
    }
    
    const stylePrompts = prompts[style] || prompts.playful
    return stylePrompts[Math.floor(Math.random() * stylePrompts.length)]
  }

  const handlePostVariation = async (variationId, platform) => {
    // Simulate posting to social media
    console.log(`Posting variation ${variationId} to ${platform}`)
    
    // In real app, this would call the social media APIs
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Update variation with post info
    const updatedProject = getProject(project.id)
    const variation = updatedProject.adVariations.find(v => v.id === variationId)
    if (variation) {
      // Simulate successful post
      variation.postedToPlatform = platform
      variation.postUrl = `https://${platform}.com/post/${Math.random().toString(36).substr(2, 9)}`
      variation.impressions = Math.floor(Math.random() * 1000) + 100
      variation.clicks = Math.floor(Math.random() * 50) + 5
      
      await updateProject(project.id, { adVariations: updatedProject.adVariations })
      setProject(getProject(project.id))
    }
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/app/projects')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary">{project.productName}</h1>
          <p className="text-text-secondary">Generate and manage ad variations</p>
        </div>
      </div>

      {/* Project Info */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Product Image */}
          <div className="w-full lg:w-1/3">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={project.productImageUrl}
                alt={project.productName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Generation Controls */}
          <div className="flex-1 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">Generate New Variations</h3>
              
              {/* Style Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Choose Style
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {styles.map((style) => (
                    <label
                      key={style.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedStyle === style.id
                          ? 'border-primary bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="style"
                        value={style.id}
                        checked={selectedStyle === style.id}
                        onChange={(e) => setSelectedStyle(e.target.value)}
                        className="sr-only"
                      />
                      <div className="font-medium text-text-primary">{style.name}</div>
                      <div className="text-sm text-text-secondary">{style.description}</div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Platform Selection */}
              <div className="mb-6">
                <PlatformSelector
                  selectedPlatforms={selectedPlatforms}
                  onPlatformChange={setSelectedPlatforms}
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={generateVariations}
                disabled={generating}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating variations...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Generate 3 Variations</span>
                  </>
                )}
              </button>

              {generating && (
                <div className="mt-4 text-sm text-text-secondary">
                  AI is creating unique ad variations with {selectedStyle} style...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Generated Variations */}
      {project.adVariations && project.adVariations.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-text-primary">
              Generated Variations ({project.adVariations.length})
            </h3>
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <Share2 className="w-4 h-4" />
              <span>
                {project.adVariations.filter(v => v.postedToPlatform).length} posted
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {project.adVariations.map((variation) => (
              <AdVariationCard
                key={variation.id}
                variation={variation}
                variant="withActions"
                onPost={handlePostVariation}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!project.adVariations || project.adVariations.length === 0) && !generating && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Palette className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">No variations yet</h3>
          <p className="text-text-secondary mb-4">
            Generate your first set of ad variations to get started
          </p>
        </div>
      )}
    </div>
  )
}

export default ProjectDetail