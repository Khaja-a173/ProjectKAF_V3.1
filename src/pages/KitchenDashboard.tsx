import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { useSessionManagement } from '../hooks/useSessionManagement'
import DashboardHeader from '../components/DashboardHeader'
import { OrderItem } from '../types/session'
import { 
  ChefHat, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  Pause, 
  RotateCcw, 
  Bell, 
  Settings, 
  Filter, 
  Search, 
  Users, 
  Timer, 
  Flame, 
  Leaf, 
  Star, 
  TrendingUp, 
  BarChart3, 
  Target, 
  Award, 
  Zap, 
  Volume2, 
  VolumeX, 
  Grid3X3, 
  List, 
  Monitor, 
  RefreshCw, 
  Eye, 
  ArrowRight, 
  Plus, 
  Minus, 
  X, 
  Edit, 
  Send, 
  Phone, 
  MapPin, 
  DollarSign, 
  Activity, 
  Coffee, 
  Utensils,
  Package,
  Truck
} from 'lucide-react'

interface Station {
  id: string
  name: string
  color: string
  icon: string
  activeOrders: number
  avgPrepTime: number
}

interface KitchenInsights {
  ordersCompleted: number
  avgPrepTime: string
  onTimePercentage: number
  bottleneckStation: string
  shoutOuts: string[]
  suggestions: string[]
  qualityAlerts: string[]
}

export default function KitchenDashboard() {
  const { 
    orders, 
    startOrderItem, 
    markItemReady, 
    markOrderServed,
    markOrderForDelivery,
    confirmOrder,
    loading 
  } = useSessionManagement({
    tenantId: 'tenant_123',
    locationId: 'location_456'
  })
  
  const [selectedStation, setSelectedStation] = useState<string>('all')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [autoAdvance, setAutoAdvance] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  const stations: Station[] = [
    { id: 'all', name: 'All Stations', color: '#6B7280', icon: 'Grid3X3', activeOrders: 0, avgPrepTime: 0 },
    { id: 'grill', name: 'Grill', color: '#EF4444', icon: 'Flame', activeOrders: 2, avgPrepTime: 18 },
    { id: 'fry', name: 'Fry', color: '#F59E0B', icon: 'Zap', activeOrders: 1, avgPrepTime: 12 },
    { id: 'cold', name: 'Cold', color: '#06B6D4', icon: 'Leaf', activeOrders: 3, avgPrepTime: 8 },
    { id: 'hot', name: 'Hot', color: '#DC2626', icon: 'Flame', activeOrders: 2, avgPrepTime: 15 },
    { id: 'bar', name: 'Bar', color: '#8B5CF6', icon: 'Coffee', activeOrders: 1, avgPrepTime: 5 },
    { id: 'dessert', name: 'Dessert', color: '#EC4899', icon: 'Star', activeOrders: 0, avgPrepTime: 10 }
  ]

  const [insights] = useState<KitchenInsights>({
    ordersCompleted: 47,
    avgPrepTime: '14m 30s',
    onTimePercentage: 94,
    bottleneckStation: 'Grill',
    shoutOuts: [
      'Chef Ana cleared 5 mains in 12m 👏',
      'Cold station perfect timing today! 🎯',
      'Zero recalls in last 2 hours 🌟'
    ],
    suggestions: [
      'Move 2 mains from Grill to Fry—queue imbalance',
      'Batch 3 similar salads to cut 1.5m prep time',
      'Consider prep assistant for Grill during dinner rush'
    ],
    qualityAlerts: [
      'Caesar Salad recalled 2x today - check dressing consistency'
    ]
  })

  const filteredOrders = orders.filter(order => {
    const orderStations = [...new Set(order.items.map(item => item.station))]
    const matchesStation = selectedStation === 'all' || orderStations.includes(selectedStation)
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.tableId?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStation && matchesSearch
  })

  const ordersByStatus = {
    confirmed: filteredOrders.filter(o => o.status === 'confirmed'),
    preparing: filteredOrders.filter(o => o.status === 'preparing'),
    ready: filteredOrders.filter(o => o.status === 'ready'),
    delivering: filteredOrders.filter(o => o.status === 'delivering')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-500'
      case 'preparing': return 'bg-orange-500'
      case 'ready': return 'bg-green-500'
      case 'served': return 'bg-gray-500'
      default: return 'bg-gray-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'normal': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const getDietaryIcons = (item: any) => {
    const icons = []
    if (item.isVegan) icons.push(<Leaf key="vegan" className="w-3 h-3 text-green-600" aria-label="Vegan" />)
    else if (item.isVegetarian) icons.push(<Leaf key="vegetarian" className="w-3 h-3 text-green-500" aria-label="Vegetarian" />)
    
    if (item.spicyLevel > 0) {
      icons.push(
        <div key="spicy" className="flex" aria-label={`Spicy Level: ${item.spicyLevel}`}>
          {[...Array(item.spicyLevel)].map((_, i) => (
            <Flame key={i} className="w-3 h-3 text-red-500" />
          ))}
        </div>
      )
    }
    
    return icons
  }

  const handleOrderAction = async (orderId: string, action: string) => {
    try {
      switch (action) {
        case 'confirm':
          await confirmOrder(orderId, 'chef_123')
          break
        case 'start':
          // Start all items in the order
          const order = orders.find(o => o.id === orderId)
          if (order) {
            for (const item of order.items) {
              if (item.status === 'queued') {
                await startOrderItem(item.id, 'chef_123')
              }
            }
          }
          break
        case 'ready':
          // Mark all items ready
          const readyOrder = orders.find(o => o.id === orderId)
          if (readyOrder) {
            for (const item of readyOrder.items) {
              if (item.status === 'in_progress') {
                await markItemReady(item.id, 'chef_123')
              }
            }
          }
          break
        case 'deliver':
          await markOrderForDelivery(orderId, 'staff_123')
          break
      }
    } catch (err) {
      console.error('❌ Kitchen action failed:', err)
      alert('Action failed. Please try again.')
    }
  }

  const handleItemAction = async (_orderId: string, itemId: string, action: string) => {
    try {
      switch (action) {
        case 'start':
          await startOrderItem(itemId, 'chef_123')
          break
        case 'ready':
          await markItemReady(itemId, 'chef_123')
          break
        case 'hold':
          // TODO: Implement hold functionality
          break
        case 'recall':
          // TODO: Implement recall functionality
          break
      }
    } catch (err) {
      console.error('❌ Item action failed:', err)
      alert('Action failed. Please try again.')
    }
  }

  const renderTicketCard = (order: any) => (
    <div 
      key={order.id} 
      className={`bg-white rounded-xl shadow-lg border-l-4 p-4 hover:shadow-xl transition-all cursor-pointer ${
        order.priority === 'urgent' ? 'border-red-500 bg-red-50' :
        order.priority === 'high' ? 'border-orange-500 bg-orange-50' :
        'border-gray-300'
      }`}
      onClick={() => setSelectedOrder(order)}
    >
      {/* Order Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-gray-900">{order.orderNumber}</span>
          <span className="text-sm text-gray-600">{order.tableId}</span>
          {order.priority !== 'normal' && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getPriorityColor(order.priority)}`}>
              {order.priority.toUpperCase()}
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">
            {Math.floor((Date.now() - order.placedAt.getTime()) / (1000 * 60))}m
          </div>
          <div className="text-xs text-gray-500">dine-in</div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-3">
        <div className="text-xs text-gray-500">
          Placed: {format(order.placedAt, 'HH:mm')} • ${order.totalAmount}
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-2 mb-4">
        {order.items.map((item: OrderItem) => (
          <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {item.quantity}x {item.name}
              </span>
              <div className="flex items-center space-x-1">
                {getDietaryIcons(item)}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium text-white`}
                style={{ backgroundColor: stations.find(s => s.id === item.station)?.color || '#6B7280' }}>
                {stations.find(s => s.id === item.station)?.name}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {item.status === 'queued' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleItemAction(order.id, item.id, 'start')
                  }}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Start cooking"
                >
                  <Play className="w-3 h-3" />
                </button>
              )}
              {item.status === 'in_progress' && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleItemAction(order.id, item.id, 'ready')
                    }}
                    className="text-green-600 hover:text-green-800 p-1"
                    title="Mark ready"
                  >
                    <CheckCircle className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleItemAction(order.id, item.id, 'hold')
                    }}
                    className="text-orange-600 hover:text-orange-800 p-1"
                    title="Hold"
                  >
                    <Pause className="w-3 h-3" />
                  </button>
                </>
              )}
              {item.status === 'ready_item' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleItemAction(order.id, item.id, 'recall')
                  }}
                  className="text-orange-600 hover:text-orange-800 p-1"
                  title="Recall to kitchen"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
              <div className={`w-2 h-2 rounded-full ${
                item.status === 'queued' ? 'bg-gray-400' :
                item.status === 'in_progress' ? 'bg-orange-500' :
                item.status === 'ready_item' ? 'bg-green-500' :
                'bg-gray-400'
              }`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Special Instructions */}
      {order.specialInstructions && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-xs font-medium text-yellow-800">Special Instructions:</div>
          <div className="text-xs text-yellow-700">{order.specialInstructions}</div>
        </div>
      )}

      {/* Order Actions */}
      <div className="flex space-x-2">
        {order.status === 'confirmed' && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleOrderAction(order.id, 'start')
            }}
            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Start All
          </button>
        )}
        {order.status === 'preparing' && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleOrderAction(order.id, 'ready')
            }}
            className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Mark Ready
          </button>
        )}
        {order.status === 'ready' && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleOrderAction(order.id, 'deliver')
              }}
              className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Send Out
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleOrderAction(order.id, 'recall')
              }}
              className="px-3 py-2 text-orange-600 border border-orange-300 rounded-lg text-sm hover:bg-orange-50 transition-colors"
            >
              Recall
            </button>
          </>
        )}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader title="Kitchen Dashboard" subtitle="Real-time Kitchen Operations" showUserSwitcher={true} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading kitchen dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Kitchen Dashboard" subtitle="Real-time Kitchen Operations" showUserSwitcher={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex space-x-8">
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 pb-2">
              Dashboard
            </Link>
            <Link to="/admin/menu" className="text-gray-500 hover:text-gray-700 pb-2">
              Menu Management
            </Link>
            <Link to="/orders" className="text-gray-500 hover:text-gray-700 pb-2">
              Orders
            </Link>
            <Link to="/table-management" className="text-gray-500 hover:text-gray-700 pb-2">
              Table Management
            </Link>
            <Link to="/staff-management" className="text-gray-500 hover:text-gray-700 pb-2">
              Staff Management
            </Link>
            <Link to="/kitchen-dashboard" className="text-red-600 border-b-2 border-red-600 pb-2 font-medium">
              Kitchen Dashboard
            </Link>
            <Link to="/analytics" className="text-gray-500 hover:text-gray-700 pb-2">
              Analytics
            </Link>
            <Link to="/settings" className="text-gray-500 hover:text-gray-700 pb-2">
              Settings
            </Link>
          </div>
        </nav>

        {/* Controls Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search orders, tables, customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {stations.map(station => (
                  <option key={station.id} value={station.id}>{station.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoAdvance}
                  onChange={(e) => setAutoAdvance(e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span>Auto-advance</span>
              </label>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Station Status Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {stations.filter(s => s.id !== 'all').map(station => (
            <div key={station.id} className="bg-white rounded-xl shadow-sm p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: station.color }}
                ></div>
                <span className="font-medium text-gray-900">{station.name}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{station.activeOrders}</div>
              <div className="text-xs text-gray-500">Active • {station.avgPrepTime}m avg</div>
            </div>
          ))}
        </div>

        {/* VERTICAL Kitchen Queues */}
        <div className="space-y-8 mb-8">
          {/* Order Placed */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order Placed</h3>
                    <p className="text-sm text-gray-600">New orders from customers</p>
                  </div>
                </div>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  {ordersByStatus.confirmed.length}
                </span>
              </div>
            </div>
            <div className="p-4">
              {ordersByStatus.confirmed.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No new orders</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ordersByStatus.confirmed.map(renderTicketCard)}
                </div>
              )}
            </div>
          </div>

          {/* Preparing */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <ChefHat className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Preparing</h3>
                    <p className="text-sm text-gray-600">Currently cooking</p>
                  </div>
                </div>
                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                  {ordersByStatus.preparing.length}
                </span>
              </div>
            </div>
            <div className="p-4">
              {ordersByStatus.preparing.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ChefHat className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No orders being prepared</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ordersByStatus.preparing.map(renderTicketCard)}
                </div>
              )}
            </div>
          </div>

          {/* Ready */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Ready</h3>
                    <p className="text-sm text-gray-600">Ready for pickup</p>
                  </div>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {ordersByStatus.ready.length}
                </span>
              </div>
            </div>
            <div className="p-4">
              {ordersByStatus.ready.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No orders ready</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ordersByStatus.ready.map(renderTicketCard)}
                </div>
              )}
            </div>
          </div>

          {/* Out for Delivery */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Out for Delivery</h3>
                    <p className="text-sm text-gray-600">Staff delivering</p>
                  </div>
                </div>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  {ordersByStatus.delivering.length}
                </span>
              </div>
            </div>
            <div className="p-4">
              {ordersByStatus.delivering.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Truck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No orders out for delivery</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ordersByStatus.delivering.map(renderTicketCard)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Insights Band */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Live Kitchen Insights</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">AI Active</span>
              </div>
              <button className="text-gray-400 hover:text-white">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">{insights.ordersCompleted}</div>
              <div className="text-sm text-gray-300">Orders Completed</div>
              <div className="text-xs text-green-400">Today</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">{insights.avgPrepTime}</div>
              <div className="text-sm text-gray-300">Avg Prep Time</div>
              <div className="text-xs text-blue-400">All stations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-1">{insights.onTimePercentage}%</div>
              <div className="text-sm text-gray-300">On-Time Rate</div>
              <div className="text-xs text-purple-400">SLA compliance</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-1">{insights.bottleneckStation}</div>
              <div className="text-sm text-gray-300">Bottleneck Station</div>
              <div className="text-xs text-orange-400">Needs attention</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Shout-outs */}
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Award className="w-4 h-4 text-yellow-400" />
                <h3 className="font-semibold text-yellow-400">Shout-outs</h3>
              </div>
              <div className="space-y-2">
                {insights.shoutOuts.map((shoutOut, index) => (
                  <div key={index} className="text-sm text-gray-300">{shoutOut}</div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Target className="w-4 h-4 text-blue-400" />
                <h3 className="font-semibold text-blue-400">AI Suggestions</h3>
              </div>
              <div className="space-y-2">
                {insights.suggestions.map((suggestion, index) => (
                  <div key={index} className="text-sm text-gray-300">{suggestion}</div>
                ))}
              </div>
            </div>

            {/* Quality Alerts */}
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <h3 className="font-semibold text-red-400">Quality Alerts</h3>
              </div>
              <div className="space-y-2">
                {insights.qualityAlerts.length > 0 ? (
                  insights.qualityAlerts.map((alert, index) => (
                    <div key={index} className="text-sm text-red-300">{alert}</div>
                  ))
                ) : (
                  <div className="text-sm text-gray-400">No quality issues today! 🌟</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Order Details - {selectedOrder.orderNumber}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-600">Table</div>
                  <div className="font-medium text-gray-900">{selectedOrder.tableId}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Order Type</div>
                  <div className="font-medium text-gray-900 capitalize">dine-in</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total</div>
                  <div className="font-medium text-gray-900">${selectedOrder.totalAmount}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div className="font-medium text-gray-900 capitalize">{selectedOrder.status}</div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item: any) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {item.quantity}x {item.name}
                          </span>
                          <div className="flex items-center space-x-1">
                            {getDietaryIcons(item)}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                          item.status === 'queued' ? 'bg-gray-500' :
                          item.status === 'in_progress' ? 'bg-orange-500' :
                          item.status === 'ready_item' ? 'bg-green-500' :
                          'bg-gray-500'
                        }`}>
                          {item.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      {item.specialInstructions && (
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Note:</strong> {item.specialInstructions}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Station: {stations.find(s => s.id === item.station)?.name} • 
                          Est: {item.preparationTime}m
                          {item.assignedChef && ` • ${item.assignedChef}`}
                        </div>
                        <div className="flex space-x-2">
                          {item.status === 'queued' && (
                            <button
                              onClick={() => handleItemAction(selectedOrder.id, item.id, 'start')}
                              className="text-blue-600 hover:text-blue-800 p-1"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          {item.status === 'in_progress' && (
                            <>
                              <button
                                onClick={() => handleItemAction(selectedOrder.id, item.id, 'ready')}
                                className="text-green-600 hover:text-green-800 p-1"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleItemAction(selectedOrder.id, item.id, 'hold')}
                                className="text-orange-600 hover:text-orange-800 p-1"
                              >
                                <Pause className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {item.status === 'ready_item' && (
                            <button
                              onClick={() => handleItemAction(selectedOrder.id, item.id, 'recall')}
                              className="text-orange-600 hover:text-orange-800 p-1"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.specialInstructions && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="font-medium text-yellow-800 mb-1">Special Instructions:</div>
                  <div className="text-yellow-700">{selectedOrder.specialInstructions}</div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedOrder.status === 'confirmed' && (
                  <button
                    onClick={() => {
                      handleOrderAction(selectedOrder.id, 'start')
                      setSelectedOrder(null)
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Start All Items
                  </button>
                )}
                {selectedOrder.status === 'ready' && (
                  <button
                    onClick={() => {
                      handleOrderAction(selectedOrder.id, 'deliver')
                      setSelectedOrder(null)
                    }}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Mark for Delivery
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}