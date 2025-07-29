import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Plus, Target, AlertTriangle, CheckCircle, X } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Budgets() {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  })

  useEffect(() => {
    fetchBudgets()
    fetchCategories()
  }, [selectedMonth, selectedYear])

  const fetchBudgets = async () => {
    try {
      const response = await axios.get(`/api/budgets?month=${selectedMonth}&year=${selectedYear}`)
      setBudgets(response.data.budgets)
    } catch (error) {
      console.error('Error fetching budgets:', error)
      toast.error('Failed to fetch budgets')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/transactions/categories')
      setCategories(response.data.categories.filter(cat => cat !== 'Salary' && cat !== 'Freelance' && cat !== 'Investments'))
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const budgetData = {
        ...formData,
        amount: parseFloat(formData.amount)
      }

      await axios.post('/api/budgets', budgetData)
      toast.success('Budget created successfully')
      
      setShowModal(false)
      setFormData({
        category: '',
        amount: '',
        month: selectedMonth,
        year: selectedYear
      })
      fetchBudgets()
    } catch (error) {
      console.error('Error creating budget:', error)
      const message = error.response?.data?.error || 'Failed to create budget'
      toast.error(message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this budget?')) return
    
    try {
      await axios.delete(`/api/budgets/${id}`)
      toast.success('Budget deleted successfully')
      fetchBudgets()
    } catch (error) {
      console.error('Error deleting budget:', error)
      toast.error('Failed to delete budget')
    }
  }

  const getBudgetStatus = (budget) => {
    const percentUsed = budget.percentUsed
    if (percentUsed >= 100) return { status: 'over', color: 'red', icon: AlertTriangle }
    if (percentUsed >= 80) return { status: 'warning', color: 'yellow', icon: AlertTriangle }
    return { status: 'good', color: 'green', icon: CheckCircle }
  }

  const currencySymbol = user?.currency === 'USD' ? '$' : user?.currency || '$'
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-600 mt-1">Set and track your spending limits</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Budget
        </button>
      </div>

      {/* Month/Year Selector */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {months.map((month, index) => (
                <option key={month} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))
        ) : budgets.length > 0 ? (
          budgets.map((budget) => {
            const { status, color, icon: Icon } = getBudgetStatus(budget)
            const progressWidth = Math.min(budget.percentUsed, 100)
            
            return (
              <div key={budget.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full bg-${color}-100`}>
                      <Icon className={`h-5 w-5 text-${color}-600`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{budget.category}</h3>
                      <p className="text-sm text-gray-500">
                        {months[budget.month - 1]} {budget.year}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spent</span>
                    <span className="font-medium">
                      {currencySymbol}{parseFloat(budget.spent).toLocaleString()} of {currencySymbol}{parseFloat(budget.amount).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        status === 'over' ? 'bg-red-500' :
                        status === 'warning' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${progressWidth}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-medium ${
                      status === 'over' ? 'text-red-600' :
                      status === 'warning' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {budget.percentUsed}% used
                    </span>
                    <span className="text-sm text-gray-600">
                      {currencySymbol}{parseFloat(budget.remaining).toLocaleString()} left
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-full bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Target className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">No budgets set for {months[selectedMonth - 1]} {selectedYear}</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create your first budget
            </button>
          </div>
        )}
      </div>

      {/* Budget Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Add Budget</h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  setFormData({
                    category: '',
                    amount: '',
                    month: selectedMonth,
                    year: selectedYear
                  })
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Amount ({currencySymbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month
                  </label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {months.map((month, index) => (
                      <option key={month} value={index + 1}>{month}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Create Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}