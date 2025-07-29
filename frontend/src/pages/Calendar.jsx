import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import axios from 'axios'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns'
import { Link } from 'react-router-dom'

export default function Calendar() {
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(null)
  const [dayTransactions, setDayTransactions] = useState([])

  useEffect(() => {
    fetchCalendarData()
  }, [currentDate])

  const fetchCalendarData = async () => {
    try {
      const month = currentDate.getMonth() + 1
      const year = currentDate.getFullYear()
      
      const response = await axios.get(`/api/reports/calendar?month=${month}&year=${year}`)
      setCalendarData(response.data.calendarData)
    } catch (error) {
      console.error('Error fetching calendar data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDayTransactions = async (date) => {
    try {
      const dateString = format(date, 'yyyy-MM-dd')
      const response = await axios.get(`/api/transactions?startDate=${dateString}&endDate=${dateString}`)
      setDayTransactions(response.data.transactions)
      setSelectedDate(date)
    } catch (error) {
      console.error('Error fetching day transactions:', error)
    }
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Fill in days from previous month to start on Sunday
  const startDay = monthStart.getDay()
  const previousMonthDays = []
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(monthStart)
    date.setDate(date.getDate() - (i + 1))
    previousMonthDays.push(date)
  }

  // Fill in days from next month to end on Saturday
  const endDay = monthEnd.getDay()
  const nextMonthDays = []
  for (let i = 1; i <= (6 - endDay); i++) {
    const date = new Date(monthEnd)
    date.setDate(date.getDate() + i)
    nextMonthDays.push(date)
  }

  const allDays = [...previousMonthDays, ...daysInMonth, ...nextMonthDays]
  const currencySymbol = user?.currency === 'USD' ? '$' : user?.currency || '$'

  const getDayIntensity = (dayData) => {
    if (!dayData || dayData.expenses === 0) return 'bg-gray-50'
    
    const maxExpense = Math.max(...Object.values(calendarData).map(d => d.expenses || 0))
    const intensity = dayData.expenses / maxExpense
    
    if (intensity > 0.8) return 'bg-red-200'
    if (intensity > 0.6) return 'bg-red-100'
    if (intensity > 0.4) return 'bg-yellow-100'
    if (intensity > 0.2) return 'bg-blue-100'
    return 'bg-green-100'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar View</h1>
          <p className="text-gray-600 mt-1">Track your daily spending patterns</p>
        </div>
        <Link
          to="/transactions"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {allDays.map((day, index) => {
                const dateString = format(day, 'yyyy-MM-dd')
                const dayData = calendarData[dateString]
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isCurrentDay = isToday(day)
                
                return (
                  <div
                    key={index}
                    onClick={() => fetchDayTransactions(day)}
                    className={`
                      p-2 min-h-[80px] border rounded-lg cursor-pointer transition-all hover:shadow-sm
                      ${isCurrentMonth ? getDayIntensity(dayData) : 'bg-gray-50'}
                      ${isCurrentDay ? 'ring-2 ring-blue-500' : ''}
                      ${selectedDate && format(selectedDate, 'yyyy-MM-dd') === dateString ? 'ring-2 ring-blue-300' : ''}
                    `}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {format(day, 'd')}
                    </div>
                    
                    {dayData && isCurrentMonth && (
                      <div className="space-y-1">
                        {dayData.income > 0 && (
                          <div className="text-xs text-green-600 font-medium">
                            +{currencySymbol}{dayData.income.toLocaleString()}
                          </div>
                        )}
                        {dayData.expenses > 0 && (
                          <div className="text-xs text-red-600 font-medium">
                            -{currencySymbol}{dayData.expenses.toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Daily Detail Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a day'}
            </h3>
          </div>
          
          <div className="p-6">
            {selectedDate ? (
              dayTransactions.length > 0 ? (
                <div className="space-y-4">
                  {dayTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.description || transaction.category}
                        </p>
                        <p className="text-sm text-gray-500">{transaction.category}</p>
                      </div>
                      <p className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{currencySymbol}{parseFloat(transaction.amount).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-gray-200 mt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Income:</span>
                      <span className="text-green-600 font-medium">
                        +{currencySymbol}{dayTransactions
                          .filter(t => t.type === 'income')
                          .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-600">Total Expenses:</span>
                      <span className="text-red-600 font-medium">
                        -{currencySymbol}{dayTransactions
                          .filter(t => t.type === 'expense')
                          .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                          .toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No transactions on this day</p>
                  <Link
                    to="/transactions"
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Transaction
                  </Link>
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Click on a calendar day to view transactions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Intensity Legend</h3>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-50 rounded"></div>
            <span className="text-sm text-gray-600">No spending</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 rounded"></div>
            <span className="text-sm text-gray-600">Low</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 rounded"></div>
            <span className="text-sm text-gray-600">Medium</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-100 rounded"></div>
            <span className="text-sm text-gray-600">High</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 rounded"></div>
            <span className="text-sm text-gray-600">Very High</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-200 rounded"></div>
            <span className="text-sm text-gray-600">Highest</span>
          </div>
        </div>
      </div>
    </div>
  )
}