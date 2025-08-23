import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
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
import { Product, SAMPLE_PRODUCTS, ProductManager, SAMPLE_SUPPLIERS, PurchaseOrder, PRODUCT_CATEGORIES } from '../data/products';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign,
  ShoppingCart,
  Truck,
  Calendar,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  Archive,
  Settings,
  FileText,
  Users,
  Activity
} from 'lucide-react';

interface InventoryDashboardProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function InventoryDashboard({ isOpen = true, onClose }: InventoryDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreatePOOpen, setIsCreatePOOpen] = useState(false);
  const [isStockAdjustmentOpen, setIsStockAdjustmentOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);

  // Form state for new product
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    genericName: '',
    brand: '',
    category: PRODUCT_CATEGORIES[0],
    type: 'prescription',
    description: '',
    shortDescription: '',
    price: 0,
    costPrice: 0,
    sku: '',
    stock: 0,
    lowStockThreshold: 10,
    reorderPoint: 20,
    reorderQuantity: 100,
    dosageForm: 'tablet',
    strength: '',
    dosages: [],
    activeIngredients: [],
    indications: [],
    contraindications: [],
    sideEffects: [],
    interactions: [],
    prescriptionRequired: true,
    controlledSubstance: false,
    maxRefills: 5,
    daysSupply: [30],
    manufacturer: '',
    ndc: '',
    upc: '',
    images: [],
    rating: 0,
    reviewCount: 0,
    isActive: true,
    isDiscontinued: false,
    isOnBackorder: false,
    tags: [],
    features: [],
    benefits: [],
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 },
    requiresRefrigeration: false,
    hazmat: false
  });

  // Calculate inventory metrics
  const inventoryMetrics = useMemo(() => {
    const totalProducts = products.length;
    const lowStockProducts = ProductManager.getLowStockProducts(products);
    const reorderProducts = ProductManager.getReorderProducts(products);
    const outOfStockProducts = products.filter(p => p.stock === 0);
    const totalValue = ProductManager.calculateInventoryValue(products);
    
    return {
      totalProducts,
      lowStockCount: lowStockProducts.length,
      reorderCount: reorderProducts.length,
      outOfStockCount: outOfStockProducts.length,
      totalValue,
      lowStockProducts,
      reorderProducts,
      outOfStockProducts
    };
  }, [products]);

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    let filteredProducts = products;

    if (searchQuery) {
      filteredProducts = ProductManager.searchProducts(searchQuery, filteredProducts);
    }

    if (selectedCategory !== 'all') {
      filteredProducts = ProductManager.filterByCategory(selectedCategory, filteredProducts);
    }

    if (stockFilter !== 'all') {
      switch (stockFilter) {
        case 'low':
          filteredProducts = filteredProducts.filter(p => p.stock <= p.lowStockThreshold && p.stock > 0);
          break;
        case 'out':
          filteredProducts = filteredProducts.filter(p => p.stock === 0);
          break;
        case 'reorder':
          filteredProducts = filteredProducts.filter(p => p.stock <= p.reorderPoint);
          break;
        case 'good':
          filteredProducts = filteredProducts.filter(p => p.stock > p.lowStockThreshold);
          break;
      }
    }

    return filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  }, [products, searchQuery, selectedCategory, stockFilter]);

  const getStockStatusColor = (product: Product) => {
    if (product.stock === 0) return 'text-red-600';
    if (product.stock <= product.lowStockThreshold) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStockStatusBadge = (product: Product) => {
    if (product.stock === 0) {
      return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>;
    }
    if (product.stock <= product.lowStockThreshold) {
      return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
    }
    if (product.stock <= product.reorderPoint) {
      return <Badge className="bg-orange-100 text-orange-800">Reorder</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
                {trend.positive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
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

  const ProductRow = ({ product }: { product: Product }) => (
    <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <div className="col-span-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{product.sku}</p>
          </div>
        </div>
      </div>
      <div className="col-span-2">
        <p className="text-sm text-gray-900 dark:text-white">{product.category.name}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">{product.type}</p>
      </div>
      <div className="col-span-1 text-center">
        <p className={`font-medium ${getStockStatusColor(product)}`}>{product.stock}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">units</p>
      </div>
      <div className="col-span-1 text-center">
        <p className="text-sm text-gray-900 dark:text-white">{product.lowStockThreshold}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">min</p>
      </div>
      <div className="col-span-1">
        {getStockStatusBadge(product)}
      </div>
      <div className="col-span-2 text-right">
        <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(product.price)}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Cost: {formatCurrency(product.costPrice)}
        </p>
      </div>
      <div className="col-span-2 text-right">
        <p className="font-medium text-gray-900 dark:text-white">
          {formatCurrency(product.costPrice * product.stock)}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">total value</p>
      </div>
      <div className="col-span-1 flex justify-end gap-1">
        <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(product)}>
          <Eye className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Edit className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <RefreshCw className="w-4 h-4" />
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
            Inventory Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor stock levels, manage inventory, and track product performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsStockAdjustmentOpen(true)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Stock Adjustment
          </Button>
          <Button variant="outline" onClick={() => setIsCreatePOOpen(true)}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Create PO
          </Button>
          <Button onClick={() => setIsAddProductOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Products"
          value={inventoryMetrics.totalProducts.toLocaleString()}
          icon={Package}
          color="blue"
        />
        <MetricCard
          title="Total Inventory Value"
          value={formatCurrency(inventoryMetrics.totalValue)}
          icon={DollarSign}
          trend={{ positive: true, value: '+12.5%' }}
          color="green"
        />
        <MetricCard
          title="Low Stock Items"
          value={inventoryMetrics.lowStockCount}
          icon={AlertTriangle}
          color="yellow"
        />
        <MetricCard
          title="Out of Stock"
          value={inventoryMetrics.outOfStockCount}
          icon={XCircle}
          color="red"
        />
      </div>

      {/* Quick Actions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Items Need Reordering
                </h3>
                <p className="text-2xl font-bold text-orange-600">
                  {inventoryMetrics.reorderCount}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Requires immediate attention
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Truck className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Pending Orders
                </h3>
                <p className="text-2xl font-bold text-blue-600">5</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Orders in transit
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Expiring Soon
                </h3>
                <p className="text-2xl font-bold text-red-600">12</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Items expire in 30 days
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <Calendar className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Inventory Overview</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-1" />
                Import
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="cardiovascular">Cardiovascular</SelectItem>
                <SelectItem value="diabetes">Diabetes</SelectItem>
                <SelectItem value="pain_management">Pain Management</SelectItem>
                <SelectItem value="mental_health">Mental Health</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="good">In Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="out">Out of Stock</SelectItem>
                <SelectItem value="reorder">Needs Reorder</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-2">
            <div className="col-span-3 font-medium text-gray-900 dark:text-white">Product</div>
            <div className="col-span-2 font-medium text-gray-900 dark:text-white">Category</div>
            <div className="col-span-1 text-center font-medium text-gray-900 dark:text-white">Stock</div>
            <div className="col-span-1 text-center font-medium text-gray-900 dark:text-white">Min</div>
            <div className="col-span-1 font-medium text-gray-900 dark:text-white">Status</div>
            <div className="col-span-2 text-right font-medium text-gray-900 dark:text-white">Price</div>
            <div className="col-span-2 text-right font-medium text-gray-900 dark:text-white">Value</div>
            <div className="col-span-1 text-right font-medium text-gray-900 dark:text-white">Actions</div>
          </div>

          {/* Table Body */}
          <div className="space-y-0">
            {filteredProducts.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No products found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supplier Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Suppliers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {SAMPLE_SUPPLIERS.map((supplier) => (
                <div key={supplier.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{supplier.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Lead time: {supplier.leadTimeDays} days
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < supplier.rating ? 'bg-yellow-400' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{supplier.rating}/5</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Stock updated for Atorvastatin 20mg
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Purchase order #PO-2024-001 received
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Low stock alert: Metformin 500mg
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Details Dialog */}
      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedProduct.name}</DialogTitle>
              <DialogDescription>
                Product details and inventory information
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>SKU</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedProduct.sku}</p>
              </div>
              <div>
                <Label>Category</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedProduct.category.name}</p>
              </div>
              <div>
                <Label>Current Stock</Label>
                <p className={`text-sm font-medium ${getStockStatusColor(selectedProduct)}`}>
                  {selectedProduct.stock} units
                </p>
              </div>
              <div>
                <Label>Low Stock Threshold</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedProduct.lowStockThreshold} units</p>
              </div>
              <div>
                <Label>Unit Price</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">{formatCurrency(selectedProduct.price)}</p>
              </div>
              <div>
                <Label>Cost Price</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">{formatCurrency(selectedProduct.costPrice)}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                Close
              </Button>
              <Button>
                Edit Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Product Dialog */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Add New Product
            </DialogTitle>
            <DialogDescription>
              Create a new product entry in your inventory system
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing">Pricing & Stock</TabsTrigger>
              <TabsTrigger value="medical">Medical Info</TabsTrigger>
              <TabsTrigger value="logistics">Logistics</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter product name"
                  />
                </div>
                <div>
                  <Label htmlFor="genericName">Generic Name</Label>
                  <Input
                    id="genericName"
                    value={newProduct.genericName}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, genericName: e.target.value }))}
                    placeholder="Enter generic name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Brand Name</Label>
                  <Input
                    id="brand"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="Enter brand name"
                  />
                </div>
                <div>
                  <Label htmlFor="manufacturer">Manufacturer *</Label>
                  <Input
                    id="manufacturer"
                    value={newProduct.manufacturer}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, manufacturer: e.target.value }))}
                    placeholder="Enter manufacturer name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={newProduct.category?.id} onValueChange={(value) => {
                    const category = PRODUCT_CATEGORIES.find(cat => cat.id === value);
                    setNewProduct(prev => ({ ...prev, category }));
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Product Type *</Label>
                  <Select value={newProduct.type} onValueChange={(value) =>
                    setNewProduct(prev => ({ ...prev, type: value as any }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="otc">Over-the-Counter</SelectItem>
                      <SelectItem value="supplement">Supplement</SelectItem>
                      <SelectItem value="device">Medical Device</SelectItem>
                      <SelectItem value="bundle">Product Bundle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dosageForm">Dosage Form</Label>
                  <Select value={newProduct.dosageForm} onValueChange={(value) =>
                    setNewProduct(prev => ({ ...prev, dosageForm: value as any }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="capsule">Capsule</SelectItem>
                      <SelectItem value="liquid">Liquid</SelectItem>
                      <SelectItem value="injection">Injection</SelectItem>
                      <SelectItem value="topical">Topical</SelectItem>
                      <SelectItem value="inhaler">Inhaler</SelectItem>
                      <SelectItem value="device">Device</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter detailed product description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  value={newProduct.shortDescription}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, shortDescription: e.target.value }))}
                  placeholder="Brief product summary"
                />
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="Product SKU"
                  />
                </div>
                <div>
                  <Label htmlFor="ndc">NDC Number</Label>
                  <Input
                    id="ndc"
                    value={newProduct.ndc}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, ndc: e.target.value }))}
                    placeholder="NDC number"
                  />
                </div>
                <div>
                  <Label htmlFor="upc">UPC Code</Label>
                  <Input
                    id="upc"
                    value={newProduct.upc}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, upc: e.target.value }))}
                    placeholder="UPC barcode"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Selling Price * ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="costPrice">Cost Price * ($)</Label>
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    value={newProduct.costPrice}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, costPrice: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="compareAtPrice">Compare Price ($)</Label>
                  <Input
                    id="compareAtPrice"
                    type="number"
                    step="0.01"
                    value={newProduct.compareAtPrice || ''}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, compareAtPrice: parseFloat(e.target.value) || undefined }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="stock">Initial Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    value={newProduct.lowStockThreshold}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, lowStockThreshold: parseInt(e.target.value) || 0 }))}
                    placeholder="10"
                  />
                </div>
                <div>
                  <Label htmlFor="reorderPoint">Reorder Point</Label>
                  <Input
                    id="reorderPoint"
                    type="number"
                    value={newProduct.reorderPoint}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, reorderPoint: parseInt(e.target.value) || 0 }))}
                    placeholder="20"
                  />
                </div>
                <div>
                  <Label htmlFor="reorderQuantity">Reorder Quantity</Label>
                  <Input
                    id="reorderQuantity"
                    type="number"
                    value={newProduct.reorderQuantity}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, reorderQuantity: parseInt(e.target.value) || 0 }))}
                    placeholder="100"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="medical" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="strength">Strength/Concentration</Label>
                  <Input
                    id="strength"
                    value={newProduct.strength}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, strength: e.target.value }))}
                    placeholder="e.g., 20mg, 500ml"
                  />
                </div>
                <div>
                  <Label htmlFor="maxRefills">Max Refills</Label>
                  <Input
                    id="maxRefills"
                    type="number"
                    value={newProduct.maxRefills}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, maxRefills: parseInt(e.target.value) || 0 }))}
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="prescriptionRequired">Prescription Required</Label>
                  <Switch
                    id="prescriptionRequired"
                    checked={newProduct.prescriptionRequired}
                    onCheckedChange={(checked) => setNewProduct(prev => ({ ...prev, prescriptionRequired: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="controlledSubstance">Controlled Substance</Label>
                  <Switch
                    id="controlledSubstance"
                    checked={newProduct.controlledSubstance}
                    onCheckedChange={(checked) => setNewProduct(prev => ({ ...prev, controlledSubstance: checked }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="activeIngredients">Active Ingredients</Label>
                <Textarea
                  id="activeIngredients"
                  value={newProduct.activeIngredients?.join(', ')}
                  onChange={(e) => setNewProduct(prev => ({
                    ...prev,
                    activeIngredients: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  }))}
                  placeholder="Enter active ingredients separated by commas"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="indications">Indications</Label>
                <Textarea
                  id="indications"
                  value={newProduct.indications?.join(', ')}
                  onChange={(e) => setNewProduct(prev => ({
                    ...prev,
                    indications: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  }))}
                  placeholder="Enter medical indications separated by commas"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="contraindications">Contraindications</Label>
                <Textarea
                  id="contraindications"
                  value={newProduct.contraindications?.join(', ')}
                  onChange={(e) => setNewProduct(prev => ({
                    ...prev,
                    contraindications: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  }))}
                  placeholder="Enter contraindications separated by commas"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="sideEffects">Side Effects</Label>
                <Textarea
                  id="sideEffects"
                  value={newProduct.sideEffects?.join(', ')}
                  onChange={(e) => setNewProduct(prev => ({
                    ...prev,
                    sideEffects: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  }))}
                  placeholder="Enter potential side effects separated by commas"
                  rows={2}
                />
              </div>
            </TabsContent>

            <TabsContent value="logistics" className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="weight">Weight (grams)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={newProduct.weight}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="length">Length (mm)</Label>
                  <Input
                    id="length"
                    type="number"
                    value={newProduct.dimensions?.length}
                    onChange={(e) => setNewProduct(prev => ({
                      ...prev,
                      dimensions: {
                        ...prev.dimensions!,
                        length: parseFloat(e.target.value) || 0
                      }
                    }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="width">Width (mm)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={newProduct.dimensions?.width}
                    onChange={(e) => setNewProduct(prev => ({
                      ...prev,
                      dimensions: {
                        ...prev.dimensions!,
                        width: parseFloat(e.target.value) || 0
                      }
                    }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="height">Height (mm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={newProduct.dimensions?.height}
                    onChange={(e) => setNewProduct(prev => ({
                      ...prev,
                      dimensions: {
                        ...prev.dimensions!,
                        height: parseFloat(e.target.value) || 0
                      }
                    }))}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="requiresRefrigeration">Requires Refrigeration</Label>
                  <Switch
                    id="requiresRefrigeration"
                    checked={newProduct.requiresRefrigeration}
                    onCheckedChange={(checked) => setNewProduct(prev => ({ ...prev, requiresRefrigeration: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="hazmat">Hazardous Material</Label>
                  <Switch
                    id="hazmat"
                    checked={newProduct.hazmat}
                    onCheckedChange={(checked) => setNewProduct(prev => ({ ...prev, hazmat: checked }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <Textarea
                  id="tags"
                  value={newProduct.tags?.join(', ')}
                  onChange={(e) => setNewProduct(prev => ({
                    ...prev,
                    tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  }))}
                  placeholder="Enter tags separated by commas (e.g., diabetes, heart health, pain relief)"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="features">Key Features</Label>
                <Textarea
                  id="features"
                  value={newProduct.features?.join(', ')}
                  onChange={(e) => setNewProduct(prev => ({
                    ...prev,
                    features: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  }))}
                  placeholder="Enter key features separated by commas"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="benefits">Benefits</Label>
                <Textarea
                  id="benefits"
                  value={newProduct.benefits?.join(', ')}
                  onChange={(e) => setNewProduct(prev => ({
                    ...prev,
                    benefits: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  }))}
                  placeholder="Enter product benefits separated by commas"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Product Active</Label>
                  <Switch
                    id="isActive"
                    checked={newProduct.isActive}
                    onCheckedChange={(checked) => setNewProduct(prev => ({ ...prev, isActive: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="isDiscontinued">Discontinued</Label>
                  <Switch
                    id="isDiscontinued"
                    checked={newProduct.isDiscontinued}
                    onCheckedChange={(checked) => setNewProduct(prev => ({ ...prev, isDiscontinued: checked }))}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => {
              setIsAddProductOpen(false);
              setNewProduct({
                name: '',
                genericName: '',
                brand: '',
                category: PRODUCT_CATEGORIES[0],
                type: 'prescription',
                description: '',
                shortDescription: '',
                price: 0,
                costPrice: 0,
                sku: '',
                stock: 0,
                lowStockThreshold: 10,
                reorderPoint: 20,
                reorderQuantity: 100,
                dosageForm: 'tablet',
                strength: '',
                dosages: [],
                activeIngredients: [],
                indications: [],
                contraindications: [],
                sideEffects: [],
                interactions: [],
                prescriptionRequired: true,
                controlledSubstance: false,
                maxRefills: 5,
                daysSupply: [30],
                manufacturer: '',
                ndc: '',
                upc: '',
                images: [],
                rating: 0,
                reviewCount: 0,
                isActive: true,
                isDiscontinued: false,
                isOnBackorder: false,
                tags: [],
                features: [],
                benefits: [],
                weight: 0,
                dimensions: { length: 0, width: 0, height: 0 },
                requiresRefrigeration: false,
                hazmat: false
              });
            }}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Validate required fields
                if (!newProduct.name || !newProduct.description || !newProduct.sku ||
                    !newProduct.manufacturer || !newProduct.category) {
                  alert('Please fill in all required fields');
                  return;
                }

                // Create new product with unique ID and timestamps
                const productToAdd: Product = {
                  ...newProduct,
                  id: `product_${Date.now()}`,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  dosages: newProduct.strength ? [newProduct.strength] : [],
                  images: ['/placeholder.svg']
                } as Product;

                // Add to products list
                setProducts(prev => [...prev, productToAdd]);

                // Close modal and reset form
                setIsAddProductOpen(false);
                setNewProduct({
                  name: '',
                  genericName: '',
                  brand: '',
                  category: PRODUCT_CATEGORIES[0],
                  type: 'prescription',
                  description: '',
                  shortDescription: '',
                  price: 0,
                  costPrice: 0,
                  sku: '',
                  stock: 0,
                  lowStockThreshold: 10,
                  reorderPoint: 20,
                  reorderQuantity: 100,
                  dosageForm: 'tablet',
                  strength: '',
                  dosages: [],
                  activeIngredients: [],
                  indications: [],
                  contraindications: [],
                  sideEffects: [],
                  interactions: [],
                  prescriptionRequired: true,
                  controlledSubstance: false,
                  maxRefills: 5,
                  daysSupply: [30],
                  manufacturer: '',
                  ndc: '',
                  upc: '',
                  images: [],
                  rating: 0,
                  reviewCount: 0,
                  isActive: true,
                  isDiscontinued: false,
                  isOnBackorder: false,
                  tags: [],
                  features: [],
                  benefits: [],
                  weight: 0,
                  dimensions: { length: 0, width: 0, height: 0 },
                  requiresRefrigeration: false,
                  hazmat: false
                });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
