import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Bell, User, LogOut } from 'lucide-react'

const Header = () => {
  const { user, signOut } = useAuth()

  return (
    <header className="bg-surface border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary">Welcome back, {user?.email}</p>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-text-secondary hover:text-text-primary rounded-md hover:bg-gray-50">
            <Bell className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-text-primary">
              {user?.email}
            </span>
          </div>

          <button
            onClick={signOut}
            className="p-2 text-text-secondary hover:text-red-600 rounded-md hover:bg-red-50"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header