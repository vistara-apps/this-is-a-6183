import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Sparkles, Zap, Target, BarChart3, ArrowRight } from 'lucide-react'

const Landing = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp, user } = useAuth()
  const navigate = useNavigate()

  React.useEffect(() => {
    if (user) {
      navigate('/app')
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
      navigate('/app')
    } catch (error) {
      console.error('Auth error:', error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Generation',
      description: 'Generate 3-5 unique ad variations from a single product image using advanced AI'
    },
    {
      icon: Target,
      title: 'Auto Social Posting',
      description: 'Automatically post your ad variations to TikTok and Instagram test accounts'
    },
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description: 'Track performance metrics and optimize your ad campaigns with data-driven insights'
    }
  ]

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-8 h-8 text-white" />
            <span className="text-2xl font-bold text-white">AdSpark</span>
          </div>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-white hover:text-purple-200 font-medium"
          >
            {isLogin ? 'Need an account?' : 'Already have an account?'}
          </button>
        </div>
      </header>

      <div className="relative z-10 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-white">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                Instantly spin ad variations and auto-post them
              </h1>
              <p className="text-xl text-purple-100 mb-8 leading-relaxed">
                AI-powered ad generation platform for solo creators to test creatives on TikTok and Instagram
              </p>
              
              {/* Features */}
              <div className="space-y-6 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                      <p className="text-purple-100 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Auth Form */}
            <div className="bg-white rounded-2xl shadow-modal p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  {isLogin ? 'Welcome back' : 'Get started free'}
                </h2>
                <p className="text-text-secondary">
                  {isLogin ? 'Sign in to your account' : 'Create your account and start generating ads'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline text-sm"
                >
                  {isLogin ? 'Create a new account' : 'Sign in to existing account'}
                </button>
              </div>

              {/* Pricing Tiers */}
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-sm font-medium text-text-primary mb-3">Pricing Plans</h3>
                <div className="space-y-2 text-sm text-text-secondary">
                  <div>• Free: 3 variations/month</div>
                  <div>• Basic: $19/mo - 30 variations + analytics</div>
                  <div>• Pro: $49/mo - unlimited + auto-poster</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
}

export default Landing