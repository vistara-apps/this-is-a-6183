import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, CreditCard, Bell, Shield, Trash2, ExternalLink } from 'lucide-react'

const Settings = () => {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: true
  })
  const [connectedAccounts, setConnectedAccounts] = useState({
    instagram: false,
    tiktok: false
  })

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'billing', name: 'Billing', icon: CreditCard },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
  ]

  const handleConnectAccount = (platform) => {
    // Simulate OAuth connection
    setConnectedAccounts(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }))
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">Profile Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border rounded-md bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Subscription Plan
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {user?.subscriptionTier || 'Free'}
                    </span>
                    <button className="text-primary hover:underline text-sm">
                      Upgrade
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">Connected Accounts</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    <div>
                      <div className="font-medium text-text-primary">Instagram</div>
                      <div className="text-sm text-text-secondary">
                        {connectedAccounts.instagram ? 'Connected' : 'Not connected'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleConnectAccount('instagram')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      connectedAccounts.instagram
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-primary text-white hover:bg-blue-600'
                    }`}
                  >
                    {connectedAccounts.instagram ? 'Disconnect' : 'Connect'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-black rounded-full"></div>
                    <div>
                      <div className="font-medium text-text-primary">TikTok</div>
                      <div className="text-sm text-text-secondary">
                        {connectedAccounts.tiktok ? 'Connected' : 'Not connected'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleConnectAccount('tiktok')}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      connectedAccounts.tiktok
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-primary text-white hover:bg-blue-600'
                    }`}
                  >
                    {connectedAccounts.tiktok ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'billing':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">Current Plan</h3>
              <div className="border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-semibold text-text-primary">Free Plan</h4>
                    <p className="text-text-secondary">3 variations per month</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-text-primary">$0</div>
                    <div className="text-text-secondary">/month</div>
                  </div>
                </div>
                <button className="btn-primary">Upgrade Plan</button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">Available Plans</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-text-primary mb-2">Basic</h4>
                  <div className="text-2xl font-bold text-text-primary mb-1">$19</div>
                  <div className="text-text-secondary mb-4">/month</div>
                  <ul className="space-y-2 text-sm text-text-secondary mb-6">
                    <li>• 30 variations per month</li>
                    <li>• Basic analytics</li>
                    <li>• Email support</li>
                  </ul>
                  <button className="btn-primary w-full">Choose Basic</button>
                </div>

                <div className="border-2 border-primary rounded-lg p-6 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">Popular</span>
                  </div>
                  <h4 className="text-lg font-semibold text-text-primary mb-2">Pro</h4>
                  <div className="text-2xl font-bold text-text-primary mb-1">$49</div>
                  <div className="text-text-secondary mb-4">/month</div>
                  <ul className="space-y-2 text-sm text-text-secondary mb-6">
                    <li>• Unlimited variations</li>
                    <li>• Advanced analytics</li>
                    <li>• Auto-poster</li>
                    <li>• Priority support</li>
                  </ul>
                  <button className="btn-primary w-full">Choose Pro</button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium text-text-primary">Email Notifications</div>
                    <div className="text-sm text-text-secondary">
                      Receive updates about your campaigns via email
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium text-text-primary">Push Notifications</div>
                    <div className="text-sm text-text-secondary">
                      Get notified about important updates
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.push}
                      onChange={(e) => setNotifications(prev => ({ ...prev, push: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium text-text-primary">Marketing Updates</div>
                    <div className="text-sm text-text-secondary">
                      Receive news and feature updates
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.marketing}
                      onChange={(e) => setNotifications(prev => ({ ...prev, marketing: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">Account Security</h3>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-text-primary mb-2">Change Password</h4>
                  <p className="text-sm text-text-secondary mb-4">
                    Update your password to keep your account secure
                  </p>
                  <button className="btn-secondary">Change Password</button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-text-primary mb-2">Two-Factor Authentication</h4>
                  <p className="text-sm text-text-secondary mb-4">
                    Add an extra layer of security to your account
                  </p>
                  <button className="btn-secondary">Enable 2FA</button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-text-primary mb-2">API Keys</h4>
                  <p className="text-sm text-text-secondary mb-4">
                    Manage your API keys for third-party integrations
                  </p>
                  <button className="btn-secondary">Manage API Keys</button>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
                <p className="text-sm text-red-700 mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm font-medium">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings