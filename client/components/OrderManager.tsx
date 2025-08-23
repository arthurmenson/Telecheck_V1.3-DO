import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Calendar as CalendarIcon,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  User,
  Pill,
  Shield,
  RefreshCw,
  Eye,
  Download,
  Printer,
  MessageCircle,
  Star,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  TrendingUp,
  DollarSign,
  Activity,
  FileText,
  Edit,
  ArrowRight,
  Info,
  ExternalLink
} from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  brand?: string;
  dosage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  prescriptionRequired: boolean;
  image?: string;
}

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  instructions?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  items: OrderItem[];
  subtotal: number;
  discounts: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: ShippingAddress;
  shippingMethod: 'standard' | 'express' | 'overnight';
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  notes?: string;
  prescriberId?: string;
  prescriberName?: string;
  pharmacyId?: string;
  pharmacyName?: string;
  createdAt: string;
  updatedAt: string;
  timeline: OrderTimelineEvent[];
}

interface OrderTimelineEvent {
  id: string;
  timestamp: string;
  status: string;
  description: string;
  location?: string;
  automated: boolean;
}

interface OrderManagerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

// Sample order data
const SAMPLE_ORDERS: Order[] = [
  {
    id: 'order_1',
    orderNumber: 'ORD-240001',
    customerId: 'cust_123',
    customerName: 'John Smith',
    customerEmail: 'john.smith@email.com',
    status: 'shipped',
    items: [
      {
        id: 'item_1',
        productId: 'atorvastatin_20mg',
        name: 'Atorvastatin',
        brand: 'Lipitor',
        dosage: '20mg',
        quantity: 90,
        unitPrice: 29.99,
        totalPrice: 29.99,
        prescriptionRequired: true
      }
    ],
    subtotal: 29.99,
    discounts: 0,
    shipping: 0,
    tax: 2.40,
    total: 32.39,
    paymentMethod: 'Credit Card ****1234',
    paymentStatus: 'paid',
    shippingAddress: {
      name: 'John Smith',
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      phone: '(555) 123-4567'
    },
    shippingMethod: 'standard',
    trackingNumber: 'TRK123456789',
    carrier: 'FedEx',
    estimatedDelivery: '2024-02-20',
    prescriberId: 'dr_smith_123',
    prescriberName: 'Dr. Sarah Smith',
    pharmacyId: 'pharmacy_cvs_001',
    pharmacyName: 'CVS Pharmacy #001',
    createdAt: '2024-02-15T10:30:00Z',
    updatedAt: '2024-02-17T14:20:00Z',
    timeline: [
      {
        id: 'timeline_1',
        timestamp: '2024-02-15T10:30:00Z',
        status: 'confirmed',
        description: 'Order confirmed and payment processed',
        automated: true
      },
      {
        id: 'timeline_2',
        timestamp: '2024-02-16T09:15:00Z',
        status: 'processing',
        description: 'Prescription verified and approved',
        automated: true
      },
      {
        id: 'timeline_3',
        timestamp: '2024-02-17T14:20:00Z',
        status: 'shipped',
        description: 'Package shipped via FedEx',
        location: 'San Francisco, CA',
        automated: true
      }
    ]
  },
  {
    id: 'order_2',
    orderNumber: 'ORD-240002',
    customerId: 'cust_456',
    customerName: 'Emily Johnson',
    customerEmail: 'emily.johnson@email.com',
    status: 'processing',
    items: [
      {
        id: 'item_2',
        productId: 'metformin_500mg',
        name: 'Metformin',
        brand: 'Glucophage',
        dosage: '500mg',
        quantity: 180,
        unitPrice: 24.99,
        totalPrice: 24.99,
        prescriptionRequired: true
      },
      {
        id: 'item_3',
        productId: 'omega3_1000mg',
        name: 'Omega-3 Fish Oil',
        dosage: '1000mg',
        quantity: 120,
        unitPrice: 24.99,
        totalPrice: 24.99,
        prescriptionRequired: false
      }
    ],
    subtotal: 49.98,
    discounts: 5.00,
    shipping: 0,
    tax: 3.60,
    total: 48.58,
    paymentMethod: 'Credit Card ****5678',
    paymentStatus: 'paid',
    shippingAddress: {
      name: 'Emily Johnson',
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      phone: '(555) 987-6543'
    },
    shippingMethod: 'express',
    estimatedDelivery: '2024-02-19',
    prescriberId: 'dr_johnson_456',
    prescriberName: 'Dr. Michael Johnson',
    pharmacyId: 'pharmacy_walgreens_002',
    pharmacyName: 'Walgreens #002',
    createdAt: '2024-02-16T15:45:00Z',
    updatedAt: '2024-02-17T11:30:00Z',
    timeline: [
      {
        id: 'timeline_4',
        timestamp: '2024-02-16T15:45:00Z',
        status: 'confirmed',
        description: 'Order confirmed and payment processed',
        automated: true
      },
      {
        id: 'timeline_5',
        timestamp: '2024-02-17T11:30:00Z',
        status: 'processing',
        description: 'Prescription under review',
        automated: true
      }
    ]
  },
  {
    id: 'order_3',
    orderNumber: 'ORD-240003',
    customerId: 'cust_789',
    customerName: 'Michael Brown',
    customerEmail: 'michael.brown@email.com',
    status: 'delivered',
    items: [
      {
        id: 'item_4',
        productId: 'ibuprofen_200mg',
        name: 'Ibuprofen',
        brand: 'Advil',
        dosage: '200mg',
        quantity: 100,
        unitPrice: 12.99,
        totalPrice: 12.99,
        prescriptionRequired: false
      }
    ],
    subtotal: 12.99,
    discounts: 0,
    shipping: 7.99,
    tax: 1.67,
    total: 22.65,
    paymentMethod: 'Credit Card ****9012',
    paymentStatus: 'paid',
    shippingAddress: {
      name: 'Michael Brown',
      street: '789 Pine St',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      phone: '(555) 456-7890'
    },
    shippingMethod: 'standard',
    trackingNumber: 'TRK987654321',
    carrier: 'UPS',
    estimatedDelivery: '2024-02-12',
    actualDelivery: '2024-02-12',
    createdAt: '2024-02-08T12:00:00Z',
    updatedAt: '2024-02-12T16:45:00Z',
    timeline: [
      {
        id: 'timeline_6',
        timestamp: '2024-02-08T12:00:00Z',
        status: 'confirmed',
        description: 'Order confirmed and payment processed',
        automated: true
      },
      {
        id: 'timeline_7',
        timestamp: '2024-02-09T10:00:00Z',
        status: 'processing',
        description: 'Package prepared for shipment',
        automated: true
      },
      {
        id: 'timeline_8',
        timestamp: '2024-02-10T14:30:00Z',
        status: 'shipped',
        description: 'Package shipped via UPS',
        location: 'Seattle, WA',
        automated: true
      },
      {
        id: 'timeline_9',
        timestamp: '2024-02-12T16:45:00Z',
        status: 'delivered',
        description: 'Package delivered successfully',
        location: 'Seattle, WA',
        automated: true
      }
    ]
  }
];

export function OrderManager({ isOpen = true, onClose }: OrderManagerProps) {
  const [orders, setOrders] = useState<Order[]>(SAMPLE_ORDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Date range filter
    if (dateRange.from) {
      filtered = filtered.filter(order => 
        isAfter(new Date(order.createdAt), dateRange.from!)
      );
    }
    if (dateRange.to) {
      filtered = filtered.filter(order => 
        isBefore(new Date(order.createdAt), addDays(dateRange.to!, 1))
      );
    }

    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [orders, searchQuery, statusFilter, dateRange]);

  // Calculate order metrics
  const orderMetrics = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const shippedOrders = orders.filter(o => o.status === 'shipped').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalOrders,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      totalRevenue,
      avgOrderValue
    };
  }, [orders]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'confirmed': return 'text-blue-600';
      case 'processing': return 'text-orange-600';
      case 'shipped': return 'text-purple-600';
      case 'delivered': return 'text-green-600';
      case 'cancelled': return 'text-red-600';
      case 'refunded': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    const baseClasses = 'text-xs font-medium px-2 py-1 rounded-full';
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800">Confirmed</Badge>;
      case 'processing':
        return <Badge className="bg-orange-100 text-orange-800">Processing</Badge>;
      case 'shipped':
        return <Badge className="bg-purple-100 text-purple-800">Shipped</Badge>;
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-800">Refunded</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <RefreshCw className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <Package className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'refunded': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const MetricCard = ({ title, value, icon: Icon, trend, color = 'blue' }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {trend && (
              <div className={`flex items-center text-sm ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="w-4 h-4 mr-1" />
                {trend.value}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const OrderRow = ({ order }: { order: Order }) => (
    <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <div className="col-span-2">
        <p className="font-medium text-gray-900 dark:text-white">{order.orderNumber}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(order.createdAt)}
        </p>
      </div>
      <div className="col-span-2">
        <p className="font-medium text-gray-900 dark:text-white">{order.customerName}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{order.customerEmail}</p>
      </div>
      <div className="col-span-2">
        <div className="space-y-1">
          {order.items.slice(0, 2).map((item, index) => (
            <div key={index} className="text-sm">
              <span className="font-medium">{item.name}</span>
              {item.brand && <span className="text-gray-500"> ({item.brand})</span>}
              <span className="text-gray-500"> x{item.quantity}</span>
            </div>
          ))}
          {order.items.length > 2 && (
            <p className="text-xs text-gray-500">+{order.items.length - 2} more items</p>
          )}
        </div>
      </div>
      <div className="col-span-1 text-center">
        {getStatusBadge(order.status)}
      </div>
      <div className="col-span-1 text-center">
        <p className="font-medium text-gray-900 dark:text-white">
          {formatPrice(order.total)}
        </p>
      </div>
      <div className="col-span-2">
        {order.trackingNumber ? (
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {order.trackingNumber}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{order.carrier}</p>
          </div>
        ) : (
          <span className="text-sm text-gray-500">—</span>
        )}
      </div>
      <div className="col-span-2 flex justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSelectedOrder(order);
            setIsDetailsOpen(true);
          }}
        >
          <Eye className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Edit className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <MessageCircle className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Order Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage customer orders and shipments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Orders
          </Button>
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print Labels
          </Button>
          <Button>
            <Package className="w-4 h-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Orders"
          value={orderMetrics.totalOrders.toLocaleString()}
          icon={Package}
          color="blue"
        />
        <MetricCard
          title="Total Revenue"
          value={formatPrice(orderMetrics.totalRevenue)}
          icon={DollarSign}
          trend={{ positive: true, value: '+15.3%' }}
          color="green"
        />
        <MetricCard
          title="Avg Order Value"
          value={formatPrice(orderMetrics.avgOrderValue)}
          icon={BarChart3}
          color="purple"
        />
        <MetricCard
          title="Pending Orders"
          value={orderMetrics.pendingOrders}
          icon={Clock}
          color="yellow"
        />
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search orders, customers, or products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-48">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Date Range
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-2">
            <div className="col-span-2 font-medium text-gray-900 dark:text-white">Order</div>
            <div className="col-span-2 font-medium text-gray-900 dark:text-white">Customer</div>
            <div className="col-span-2 font-medium text-gray-900 dark:text-white">Items</div>
            <div className="col-span-1 text-center font-medium text-gray-900 dark:text-white">Status</div>
            <div className="col-span-1 text-center font-medium text-gray-900 dark:text-white">Total</div>
            <div className="col-span-2 font-medium text-gray-900 dark:text-white">Tracking</div>
            <div className="col-span-2 text-right font-medium text-gray-900 dark:text-white">Actions</div>
          </div>

          {/* Table Body */}
          <div className="space-y-0">
            {filteredOrders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No orders found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery || statusFilter !== 'all' || dateRange.from
                  ? 'Try adjusting your search or filter criteria'
                  : 'No orders have been placed yet'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order {selectedOrder.orderNumber}
              </DialogTitle>
              <DialogDescription>
                Order details and tracking information
              </DialogDescription>
            </DialogHeader>
            
            <div className="overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Order Status and Timeline */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Order Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Current Status:</span>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(selectedOrder.status)}
                          {getStatusBadge(selectedOrder.status)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Payment:</span>
                        <Badge className={selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {selectedOrder.paymentStatus}
                        </Badge>
                      </div>
                      {selectedOrder.trackingNumber && (
                        <div className="flex items-center justify-between">
                          <span>Tracking:</span>
                          <div className="text-right">
                            <p className="font-medium">{selectedOrder.trackingNumber}</p>
                            <p className="text-sm text-gray-600">{selectedOrder.carrier}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{selectedOrder.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{selectedOrder.customerEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{selectedOrder.shippingAddress.phone}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <p>{selectedOrder.shippingAddress.street}</p>
                          <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                              <Pill className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-gray-600">
                                {item.brand} • {item.dosage} • Qty: {item.quantity}
                              </p>
                              {item.prescriptionRequired && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs mt-1">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Prescription Required
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatPrice(item.totalPrice)}</p>
                            <p className="text-sm text-gray-600">{formatPrice(item.unitPrice)} each</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Order Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedOrder.timeline.map((event, index) => (
                        <div key={event.id} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{event.description}</p>
                              <span className="text-sm text-gray-600">
                                {formatDate(event.timestamp)}
                              </span>
                            </div>
                            {event.location && (
                              <p className="text-sm text-gray-600">{event.location}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.discounts > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discounts:</span>
                        <span>-{formatPrice(selectedOrder.discounts)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>{selectedOrder.shipping > 0 ? formatPrice(selectedOrder.shipping) : 'FREE'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatPrice(selectedOrder.tax)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>{formatPrice(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
              <Button variant="outline">
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button>
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Customer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
