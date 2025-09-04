import React from 'react'
import { useProjects } from '../contexts/ProjectContext'
import { useAuth } from '../contexts/AuthContext'
import { Plus, TrendingUp, Eye, MousePointer, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import AnalyticsChart from '../components/AnalyticsChart'
import AdVariationCard from '../components/AdVariationCard'

const Dashboard = () => {
  const { projects } = useProjects()
  const { user } = useAuth()

  // Calculate stats
  const totalProjects = projects.length
  const totalVariations = projects.reduce((acc, project) => acc + (project.adVariations?.length || 0), 0)
  const totalImpressions = projects.reduce((acc, project) => 
    acc + (project.adVariations?.reduce((vacc, variation) => vacc + (variation.impressions || 0), 0) || 0), 0)
  const totalClicks = projects.reduce((acc, project) => 
    acc + (project.adVariations?.reduce((vacc, variation) => vacc + (variation.clicks || 0), 0) || 0), 0)

  // Get recent variations
  const recentVariations = projects
    .flatMap(project => project.adVariations?.map(variation => ({ ...variation, projectName: project.productName })) || [])
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6)

  const stats = [
    { title: 'Total Projects', value: totalProjects, icon: Zap, color: 'text-blue-600' },
    { title: 'Ad Variations', value: totalVariations, icon: TrendingUp, color: 'text-green-600' },
    { title: 'Total Impressions', value: totalImpressions.toLocaleString(), icon: Eye, color: 'text-purple-600' },
    { title: 'Total Clicks', value: totalClicks.toLocaleString(), icon: MousePointer, color: 'text-pink-600' },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Welcome back!</h1>
          <p className="text-text-secondary mt-1">
            Here's what's happening with your ad campaigns today.
          </p>
        </div>
        <Link
          to="/app/projects"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">{stat.title}</p>
                <p className="text-2xl font-bold text-text-primary mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Impressions Over Time"
          variant="line"
          color="#667eea"
          data={[
            { name: 'Mon', value: 1200 },
            { name: 'Tue', value: 900 },
            { name: 'Wed', value: 1600 },
            { name: 'Thu', value: 1800 },
            { name: 'Fri', value: 1400 },
            { name: 'Sat', value: 2100 },
            { name: 'Sun', value: 1700 }
          ]}
        />
        <AnalyticsChart
          title="Click Performance"
          variant="bar"
          color="#10B981"
          data={[
            { name: 'Instagram', value: 45 },
            { name: 'TikTok', value: 38 },
            { name: 'Stories', value: 22 },
            { name: 'Reels', value: 52 }
          ]}
        />
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-primary">Recent Ad Variations</h2>
          <Link to="/app/projects" className="text-primary hover:underline text-sm font-medium">
            View all projects
          </Link>
        </div>

        {recentVariations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentVariations.map((variation) => (
              <div key={variation.id} className="relative">
                <div className="text-xs text-text-secondary mb-2">
                  {variation.projectName}
                </div>
                <AdVariationCard variation={variation} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">No ad variations yet</h3>
            <p className="text-text-secondary mb-4">
              Create your first project to start generating ad variations
            </p>
            <Link to="/app/projects" className="btn-primary">
              Create Your First Project
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard