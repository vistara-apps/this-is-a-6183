import React, { createContext, useContext, useState, useEffect } from 'react'

const ProjectContext = createContext()

export const useProjects = () => {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider')
  }
  return context
}

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load projects from localStorage
    const storedProjects = localStorage.getItem('projects')
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects))
    }
  }, [])

  const saveProjects = (newProjects) => {
    setProjects(newProjects)
    localStorage.setItem('projects', JSON.stringify(newProjects))
  }

  const createProject = async (projectData) => {
    const newProject = {
      id: Math.random().toString(36).substr(2, 9),
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adVariations: []
    }
    
    const updatedProjects = [...projects, newProject]
    saveProjects(updatedProjects)
    return newProject
  }

  const updateProject = async (projectId, updates) => {
    const updatedProjects = projects.map(project =>
      project.id === projectId
        ? { ...project, ...updates, updatedAt: new Date().toISOString() }
        : project
    )
    saveProjects(updatedProjects)
    
    if (currentProject?.id === projectId) {
      setCurrentProject({ ...currentProject, ...updates })
    }
  }

  const deleteProject = async (projectId) => {
    const updatedProjects = projects.filter(project => project.id !== projectId)
    saveProjects(updatedProjects)
    
    if (currentProject?.id === projectId) {
      setCurrentProject(null)
    }
  }

  const getProject = (projectId) => {
    return projects.find(project => project.id === projectId)
  }

  const addAdVariation = async (projectId, adVariation) => {
    const newVariation = {
      id: Math.random().toString(36).substr(2, 9),
      projectId,
      ...adVariation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      impressions: 0,
      clicks: 0,
      postedToPlatform: null,
      postUrl: null
    }

    const updatedProjects = projects.map(project =>
      project.id === projectId
        ? {
            ...project,
            adVariations: [...(project.adVariations || []), newVariation],
            updatedAt: new Date().toISOString()
          }
        : project
    )
    
    saveProjects(updatedProjects)
    return newVariation
  }

  const value = {
    projects,
    currentProject,
    setCurrentProject,
    loading,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    addAdVariation
  }

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}