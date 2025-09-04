import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  FolderOpen, 
  BarChart3, 
  Settings,
  Sparkles
} from 'lucide-react'

const Sidebar = () => {
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
    { name: 'Projects', href: '/app/projects', icon: FolderOpen },
    { name: 'Analytics', href: '/app/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/app/settings', icon: Settings },
  ]

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-surface shadow-lg">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center px-6 py-6 border-b">
          <Sparkles className="w-8 h-8 text-primary mr-3" />
          <span className="text-xl font-bold text-text-primary">AdSpark</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/app' && location.pathname.startsWith(item.href))
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            )
          })}
        </nav>

        {/* Subscription Info */}
        <div className="px-4 py-4 border-t">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-4 text-white text-sm">
            <div className="font-medium">Free Plan</div>
            <div className="text-purple-100">3 variations remaining</div>
            <button className="mt-2 text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-colors">
              Upgrade
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar