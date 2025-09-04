import React, { useState } from 'react'
import { useProjects } from '../contexts/ProjectContext'
import { Plus, Search, Calendar, Eye } from 'lucide-react'
import ImageUploader from '../components/ImageUploader'
import { useNavigate } from 'react-router-dom'

const Projects = () => {
  const { projects, createProject } = useProjects()
  const navigate = useNavigate()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    productName: '',
    productImage: null,
    description: ''
  })

  const filteredProjects = projects.filter(project =>
    project.productName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateProject = async (e) => {
    e.preventDefault()
    if (!formData.productName || !formData.productImage) return

    try {
      const newProject = await createProject({
        productName: formData.productName,
        productImageUrl: formData.productImage.url,
        description: formData.description,
        userId: '1' // In real app, get from auth context
      })
      
      setFormData({ productName: '', productImage: null, description: '' })
      setShowCreateForm(false)
      navigate(`/app/projects/${newProject.id}`)
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  const handleImageUpload = (imageData) => {
    setFormData(prev => ({ ...prev, productImage: imageData }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Projects</h1>
          <p className="text-text-secondary">Manage your ad generation projects</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Create Project Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Create New Project</h2>
            
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Product Image
                </label>
                <ImageUploader onImageUpload={handleImageUpload} />
                {formData.productImage && (
                  <div className="mt-2 text-sm text-accent">
                    ✓ {formData.productImage.name} uploaded
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows="3"
                  placeholder="Describe your product..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.productName || !formData.productImage}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/app/projects/${project.id}`)}
              className="card p-0 cursor-pointer hover:shadow-lg transition-shadow"
            >
              {/* Project Image */}
              <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                {project.productImageUrl ? (
                  <img
                    src={project.productImageUrl}
                    alt={project.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Eye className="w-8 h-8" />
                  </div>
                )}
              </div>

              {/* Project Info */}
              <div className="p-4">
                <h3 className="font-semibold text-text-primary mb-2">
                  {project.productName}
                </h3>
                
                {project.description && (
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-text-secondary">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span>{project.adVariations?.length || 0} variations</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">
            {searchTerm ? 'No projects found' : 'No projects yet'}
          </h3>
          <p className="text-text-secondary mb-4">
            {searchTerm
              ? `No projects match "${searchTerm}"`
              : 'Create your first project to start generating ad variations'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              Create Your First Project
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Projects