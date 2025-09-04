import React, { useState } from 'react'
import { useProjects } from '../contexts/ProjectContext'
import { TrendingUp, Eye, MousePointer, Share2, Calendar } from 'lucide-react'
import AnalyticsChart from '../components/AnalyticsChart'

const Analytics = () => {
  const { projects } = useProjects()
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedProject, setSelectedProject] = useState('all')

  // Calculate analytics data
  const allVariations = projects.flatMap(project => 
    project.adVariations?.map(variation => ({
      ...variation,
      projectName: project.productName
    })) || []
  )

  const filteredVariations = selectedProject === 'all' 
    ? allVariations 
    : allVariations.filter(v => v.projectId === selectedProject)

  const totalImpressions = filteredVariations.reduce((acc, v) => acc + (v.impressions || 0), 0)
  const totalClicks = filteredVariations.reduce((acc, v) => acc + (v.clicks || 0), 0)
  const totalPosts = filteredVariations.filter(v => v.postedToPlatform).length
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0

  const performanceData = [
    { name: 'Mon', impressions: 1200, clicks: 48 },
    { name: 'Tue', impressions: 900, clicks: 36 },
    { name: 'Wed', impressions: 1600, clicks: 72 },
    { name: 'Thu', impressions: 1800, clicks: 90 },
    { name: 'Fri', impressions: 1400, clicks: 63 },
    { name: 'Sat', impressions: 2100, clicks: 105 },
    { name: 'Sun', impressions: 1700, clicks: 85 }
  ]

  const platformData = [
    { name: 'Instagram', value: 65 },
    { name: 'TikTok', value: 45 },
    { name: 'Stories', value: 30 },
    { name: 'Reels', value: 80 }
  ]

  const topPerformers = filteredVariations
    .filter(v => v.impressions > 0)
    .sort((a, b) => (b.clicks / (b.impressions || 1)) - (a.clicks / (a.impressions || 1)))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
          <p className="text-text-secondary">Track your ad performance and insights</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Project Filter */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.productName}
              </option>
            ))}
          </select>

          {/* Time Range Filter */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Total Impressions</p>
              <p className="text-2xl font-bold text-text-primary mt-1">
                {totalImpressions.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <Eye className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Total Clicks</p>
              <p className="text-2xl font-bold text-text-primary mt-1">
                {totalClicks.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <MousePointer className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Click-Through Rate</p>
              <p className="text-2xl font-bold text-text-primary mt-1">{avgCTR}%</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Posts Published</p>
              <p className="text-2xl font-bold text-text-primary mt-1">{totalPosts}</p>
            </div>
            <div className="p-3 rounded-lg bg-pink-50 text-pink-600">
              <Share2 className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Performance Over Time"
          variant="line"
          color="#667eea"
          data={performanceData.map(d => ({ name: d.name, value: d.impressions }))}
        />
        <AnalyticsChart
          title="Platform Performance"
          variant="bar"
          color="#10B981"
          data={platformData}
        />
      </div>

      {/* Top Performers */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Top Performing Variations</h3>
        
        {topPerformers.length > 0 ? (
          <div className="space-y-4">
            {topPerformers.map((variation, index) => {
              const ctr = ((variation.clicks / (variation.impressions || 1)) * 100).toFixed(2)
              
              return (
                <div key={variation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary">{variation.projectName}</h4>
                      <p className="text-sm text-text-secondary">
                        {variation.style} style • Posted to {variation.postedToPlatform}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-semibold text-text-primary">{ctr}% CTR</div>
                    <div className="text-sm text-text-secondary">
                      {variation.clicks} clicks / {variation.impressions} views
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="font-medium text-text-primary mb-1">No performance data yet</h4>
            <p className="text-sm text-text-secondary">
              Post some ad variations to start seeing analytics
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics