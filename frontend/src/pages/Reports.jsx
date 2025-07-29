import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'
import { Bar, Pie, Line } from 'react-chartjs-2'
import axios from 'axios'
import { format } from 'date-fns'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

export default function Reports() {
  const { user } = useAuth()
  const [categoryData, setCategoryData] = useState(null)
  const [trendsData, setTrendsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchReportData()
  }, [selectedMonth, selectedYear])

  const fetchReportData = async () => {
    try {
      const [categoryResponse, trendsResponse] = await Promise.all([
        axios.get(`/api/reports/spending-by-category?month=${selectedMonth}&year=${selectedYear}`),
        axios.get('/api/reports/monthly-trends')
      ])
      
      setCategoryData(categoryResponse.data.categorySpending)
      setTrendsData(trendsResponse.data.trends)
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const currencySymbol = user?.currency === 'USD' ? '$' : user?.currency || '$'
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Prepare pie chart data
  const pieChartData = categoryData ? {
    labels: categoryData.map(item => item.category),
    datasets: [
      {
        data: categoryData.map(item => parseFloat(item.total)),
        backgroundColor: [
          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
          '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
        ],
        borderWidth: 0,
      },
    ],
  } : null

  // Prepare line chart data
  const lineChartData = trendsData ? {
    labels: trendsData.map(item => item.month),
    datasets: [
      {
        label: 'Income',
        data: trendsData.map(item => parseFloat(item.income)),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Expenses',
        data: trendsData.map(item => parseFloat(item.expenses)),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Net',
        data: trendsData.map(item => parseFloat(item.net)),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  } : null

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return currencySymbol + value.toLocaleString()
          }
        }
      }
    }
  }

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${context.label}: ${currencySymbol}${value.toLocaleString()} (${percentage}%)`
          }
        }
      }
    },
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Understand your spending patterns</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {months.map((month, index) => (
              <option key={month} value={index + 1}>{month}</option>
            ))}
          </select>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Spending by Category - {months[selectedMonth - 1]} {selectedYear}
          </h2>
          {pieChartData && categoryData?.length > 0 ? (
            <div className="h-64">
              <Pie data={pieChartData} options={pieOptions} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No spending data available for this month
            </div>
          )}
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            6-Month Trends
          </h2>
          {lineChartData ? (
            <div className="h-64">
              <Line data={lineChartData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No trend data available
            </div>
          )}
        </div>

        {/* Category Breakdown Table */}
        {categoryData && categoryData.length > 0 && (
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Category Breakdown - {months[selectedMonth - 1]} {selectedYear}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Amount</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryData.map((item, index) => {
                    const total = categoryData.reduce((sum, cat) => sum + parseFloat(cat.total), 0)
                    const percentage = ((parseFloat(item.total) / total) * 100).toFixed(1)
                    
                    return (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-gray-900">{item.category}</td>
                        <td className="py-3 px-4 text-right text-gray-900 font-medium">
                          {currencySymbol}{parseFloat(item.total).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">{percentage}%</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {trendsData && (
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              6-Month Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Average Monthly Income</p>
                <p className="text-2xl font-bold text-green-600">
                  {currencySymbol}{(trendsData.reduce((sum, item) => sum + parseFloat(item.income), 0) / trendsData.length).toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Average Monthly Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {currencySymbol}{(trendsData.reduce((sum, item) => sum + parseFloat(item.expenses), 0) / trendsData.length).toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Average Monthly Net</p>
                <p className={`text-2xl font-bold ${(trendsData.reduce((sum, item) => sum + parseFloat(item.net), 0) / trendsData.length) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {currencySymbol}{Math.abs(trendsData.reduce((sum, item) => sum + parseFloat(item.net), 0) / trendsData.length).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}