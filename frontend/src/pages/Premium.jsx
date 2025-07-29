import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Crown, Camera, Brain, TrendingUp, Check, X } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import axios from 'axios'
import toast from 'react-hot-toast'

const stripePromise = loadStripe('pk_test_your_stripe_publishable_key')

export default function Premium() {
  const { user, updateUser } = useAuth()
  const [subscriptionStatus, setSubscriptionStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    fetchSubscriptionStatus()
  }, [])

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await axios.get('/api/subscriptions/status')
      setSubscriptionStatus(response.data)
      
      // Update user context if premium status changed
      if (user.isPremium !== response.data.isPremium) {
        updateUser({ ...user, isPremium: response.data.isPremium })
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async () => {
    setUpgrading(true)
    
    try {
      const stripe = await stripePromise
      const response = await axios.post('/api/subscriptions/create')
      
      const { error } = await stripe.confirmCardPayment(response.data.clientSecret, {
        payment_method: {
          card: {
            // This would be a real card element in production
            number: '4242424242424242',
            exp_month: 12,
            exp_year: 2025,
            cvc: '123'
          }
        }
      })

      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Successfully upgraded to Premium!')
        fetchSubscriptionStatus()
      }
    } catch (error) {
      console.error('Error upgrading:', error)
      toast.error('Failed to upgrade to Premium')
    } finally {
      setUpgrading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your Premium subscription?')) return
    
    try {
      await axios.post('/api/subscriptions/cancel')
      toast.success('Subscription will be cancelled at the end of the current period')
      fetchSubscriptionStatus()
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      toast.error('Failed to cancel subscription')
    }
  }

  const features = [
    {
      name: 'AI Receipt Scanner',
      description: 'Scan receipts with your camera to automatically extract transaction details',
      icon: Camera,
      free: false,
      premium: true
    },
    {
      name: 'Auto-Categorization',
      description: 'AI automatically categorizes your transactions for better organization',
      icon: Brain,
      free: false,
      premium: true
    },
    {
      name: 'Predictive Budgeting',
      description: 'ML-powered insights to forecast your future spending patterns',
      icon: TrendingUp,
      free: false,
      premium: true
    },
    {
      name: 'Basic Transaction Tracking',
      description: 'Manual transaction entry and basic categorization',
      icon: Check,
      free: true,
      premium: true
    },
    {
      name: 'Budget Management',
      description: 'Set monthly budgets and track spending limits',
      icon: Check,
      free: true,
      premium: true
    },
    {
      name: 'Reports & Charts',
      description: 'Visual spending analysis and monthly reports',
      icon: Check,
      free: true,
      premium: true
    },
    {
      name: 'Calendar View',
      description: 'Daily spending visualization in calendar format',
      icon: Check,
      free: true,
      premium: true
    }
  ]

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
                <div className="space-y-3">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4">
          <Crown className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {user?.isPremium ? 'Premium Features' : 'Upgrade to Premium'}
        </h1>
        <p className="text-xl text-gray-600">
          {user?.isPremium 
            ? 'You have access to all Premium features!' 
            : 'Unlock AI-powered features to supercharge your financial tracking'
          }
        </p>
      </div>

      {/* Current Status */}
      {user?.isPremium && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Crown className="h-6 w-6 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-800">Premium Active</p>
                <p className="text-sm text-yellow-600">
                  {subscriptionStatus?.currentPeriodEnd && 
                    `Next billing: ${new Date(subscriptionStatus.currentPeriodEnd).toLocaleDateString()}`
                  }
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-yellow-700 hover:bg-yellow-100 rounded-lg transition-colors text-sm font-medium"
            >
              Cancel Subscription
            </button>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Free</h2>
            <div className="text-4xl font-bold text-gray-900 mb-2">$0</div>
            <p className="text-gray-600">Forever free</p>
          </div>
          
          <div className="space-y-4 mb-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`mt-1 ${feature.free ? 'text-green-500' : 'text-gray-300'}`}>
                    {feature.free ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                  </div>
                  <div className={feature.free ? 'text-gray-900' : 'text-gray-400'}>
                    <p className="font-medium">{feature.name}</p>
                    <p className="text-sm">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
          
          <button
            disabled
            className="w-full py-3 px-6 border border-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
          >
            Current Plan
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-gradient-to-b from-blue-50 to-indigo-50 rounded-2xl shadow-lg border-2 border-blue-200 p-8 relative">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
              Most Popular
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium</h2>
            <div className="text-4xl font-bold text-gray-900 mb-2">$9.99</div>
            <p className="text-gray-600">per month</p>
          </div>
          
          <div className="space-y-4 mb-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className="text-green-500 mt-1">
                    <Check className="h-5 w-5" />
                  </div>
                  <div className="text-gray-900">
                    <p className="font-medium">{feature.name}</p>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
          
          {user?.isPremium ? (
            <div className="w-full py-3 px-6 bg-green-100 text-green-800 rounded-lg font-medium text-center">
              ✓ Active Subscription
            </div>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {upgrading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Upgrading...</span>
                </div>
              ) : (
                'Upgrade to Premium'
              )}
            </button>
          )}
        </div>
      </div>

      {/* AI Features Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <Camera className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">AI Receipt Scanner</h3>
          <p className="text-sm text-gray-600">
            Simply take a photo of your receipt and our AI will extract all the details automatically.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <Brain className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Smart Categorization</h3>
          <p className="text-sm text-gray-600">
            AI analyzes your transactions and automatically assigns the most appropriate categories.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="mx-auto w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Predictive Insights</h3>
          <p className="text-sm text-gray-600">
            Get AI-powered predictions about your future spending patterns and budget recommendations.
          </p>
        </div>
      </div>

      {/* Demo Notice */}
      {!user?.isPremium && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
          <p className="text-yellow-800">
            <strong>Demo Note:</strong> This is a demonstration. Payment processing is simulated and no actual charges will be made.
          </p>
        </div>
      )}
    </div>
  )
}