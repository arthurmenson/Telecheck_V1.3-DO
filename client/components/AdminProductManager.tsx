import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Product,
  SAMPLE_PRODUCTS,
  PRODUCT_CATEGORIES,
  ProductManager,
} from "../data/products";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Upload,
  Download,
  Copy,
  Eye,
  EyeOff,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Star,
  Shield,
  Pill,
  Activity,
  Users,
  Calendar,
  Settings,
  FileText,
  Image,
  Tag,
  Zap,
  Globe,
  RefreshCw,
} from "lucide-react";

interface AdminProductManagerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminProductManager({
  isOpen = true,
  onClose,
}: AdminProductManagerProps) {
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("basic");

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = ProductManager.searchProducts(searchQuery, filtered);
    }

    if (categoryFilter !== "all") {
      filtered = ProductManager.filterByCategory(categoryFilter, filtered);
    }

    if (typeFilter !== "all") {
      filtered = ProductManager.filterByType(
        typeFilter as Product["type"],
        filtered,
      );
    }

    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        filtered = filtered.filter((p) => p.isActive && !p.isDiscontinued);
      } else if (statusFilter === "inactive") {
        filtered = filtered.filter((p) => !p.isActive);
      } else if (statusFilter === "discontinued") {
        filtered = filtered.filter((p) => p.isDiscontinued);
      } else if (statusFilter === "low_stock") {
        filtered = ProductManager.getLowStockProducts(filtered);
      } else if (statusFilter === "out_of_stock") {
        filtered = filtered.filter((p) => p.stock === 0);
      }
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [products, searchQuery, categoryFilter, typeFilter, statusFilter]);

  // Calculate product metrics
  const productMetrics = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.isActive).length;
    const lowStockProducts =
      ProductManager.getLowStockProducts(products).length;
    const outOfStockProducts = products.filter((p) => p.stock === 0).length;
    const totalValue = ProductManager.calculateInventoryValue(products);
    const avgPrice =
      products.reduce((sum, p) => sum + p.price, 0) / products.length;

    return {
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      totalValue,
      avgPrice,
    };
  }, [products]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (product: Product) => {
    if (!product.isActive) return "text-gray-600";
    if (product.isDiscontinued) return "text-red-600";
    if (product.stock === 0) return "text-red-600";
    if (product.stock <= product.lowStockThreshold) return "text-yellow-600";
    return "text-green-600";
  };

  const getStatusBadge = (product: Product) => {
    if (!product.isActive) {
      return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
    }
    if (product.isDiscontinued) {
      return <Badge className="bg-red-100 text-red-800">Discontinued</Badge>;
    }
    if (product.stock === 0) {
      return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>;
    }
    if (product.stock <= product.lowStockThreshold) {
      return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  };

  const handleCreateProduct = () => {
    setEditingProduct({
      name: "",
      genericName: "",
      brand: "",
      category: PRODUCT_CATEGORIES[0],
      type: "otc",
      description: "",
      shortDescription: "",
      price: 0,
      costPrice: 0,
      sku: "",
      stock: 0,
      lowStockThreshold: 10,
      reorderPoint: 20,
      reorderQuantity: 100,
      dosageForm: "tablet",
      strength: "",
      dosages: [""],
      activeIngredients: [""],
      indications: [""],
      contraindications: [""],
      sideEffects: [""],
      interactions: [""],
      prescriptionRequired: false,
      manufacturer: "",
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
      hazmat: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setActiveTab("basic");
    setIsCreateDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
    setActiveTab("basic");
    setIsEditDialogOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const saveProduct = () => {
    if (!editingProduct) return;

    if (isCreateDialogOpen) {
      // Create new product
      const newProduct: Product = {
        ...(editingProduct as Product),
        id: `product_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProducts((prev) => [...prev, newProduct]);
      setIsCreateDialogOpen(false);
    } else {
      // Update existing product
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...(editingProduct as Product),
                updatedAt: new Date().toISOString(),
              }
            : p,
        ),
      );
      setIsEditDialogOpen(false);
    }
    setEditingProduct(null);
  };

  const confirmDelete = () => {
    if (selectedProduct) {
      setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    }
  };

  const duplicateProduct = (product: Product) => {
    const duplicated: Product = {
      ...product,
      id: `product_${Date.now()}`,
      name: `${product.name} (Copy)`,
      sku: `${product.sku}-COPY`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [...prev, duplicated]);
  };

  const MetricCard = ({
    title,
    value,
    icon: Icon,
    trend,
    color = "blue",
  }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            {trend && (
              <div
                className={`flex items-center text-sm ${trend.positive ? "text-green-600" : "text-red-600"}`}
              >
                {trend.positive ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {trend.value}
              </div>
            )}
          </div>
          <div
            className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}
          >
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
            {product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Package className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {product.name}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {product.sku}
            </p>
            {product.brand && (
              <p className="text-xs text-gray-500">{product.brand}</p>
            )}
          </div>
        </div>
      </div>
      <div className="col-span-2">
        <p className="text-sm text-gray-900 dark:text-white">
          {product.category.name}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
          {product.type}
        </p>
      </div>
      <div className="col-span-1 text-center">
        <p className={`font-medium ${getStatusColor(product)}`}>
          {product.stock}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">units</p>
      </div>
      <div className="col-span-1">{getStatusBadge(product)}</div>
      <div className="col-span-2 text-right">
        <p className="font-medium text-gray-900 dark:text-white">
          {formatPrice(product.price)}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Cost: {formatPrice(product.costPrice)}
        </p>
      </div>
      <div className="col-span-1 text-center">
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs">{product.rating}</span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          ({product.reviewCount})
        </p>
      </div>
      <div className="col-span-2 flex justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEditProduct(product)}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => duplicateProduct(product)}
        >
          <Copy className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteProduct(product)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const ProductForm = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        <TabsTrigger value="pricing">Pricing</TabsTrigger>
        <TabsTrigger value="inventory">Inventory</TabsTrigger>
        <TabsTrigger value="medical">Medical Info</TabsTrigger>
        <TabsTrigger value="seo">SEO & Media</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={editingProduct?.name || ""}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev ? { ...prev, name: e.target.value } : null,
                )
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="genericName">Generic Name</Label>
            <Input
              id="genericName"
              value={editingProduct?.genericName || ""}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev ? { ...prev, genericName: e.target.value } : null,
                )
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={editingProduct?.brand || ""}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev ? { ...prev, brand: e.target.value } : null,
                )
              }
            />
          </div>
          <div>
            <Label htmlFor="manufacturer">Manufacturer</Label>
            <Input
              id="manufacturer"
              value={editingProduct?.manufacturer || ""}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev ? { ...prev, manufacturer: e.target.value } : null,
                )
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={editingProduct?.category?.id || ""}
              onValueChange={(value) => {
                const category = PRODUCT_CATEGORIES.find((c) => c.id === value);
                setEditingProduct((prev) =>
                  prev ? { ...prev, category } : null,
                );
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="type">Product Type *</Label>
            <Select
              value={editingProduct?.type || ""}
              onValueChange={(value) =>
                setEditingProduct((prev) =>
                  prev ? { ...prev, type: value as Product["type"] } : null,
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prescription">Prescription</SelectItem>
                <SelectItem value="otc">Over-the-Counter</SelectItem>
                <SelectItem value="supplement">Supplement</SelectItem>
                <SelectItem value="device">Medical Device</SelectItem>
                <SelectItem value="bundle">Bundle</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dosageForm">Dosage Form</Label>
            <Select
              value={editingProduct?.dosageForm || ""}
              onValueChange={(value) =>
                setEditingProduct((prev) =>
                  prev
                    ? { ...prev, dosageForm: value as Product["dosageForm"] }
                    : null,
                )
              }
            >
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
          <Label htmlFor="shortDescription">Short Description</Label>
          <Input
            id="shortDescription"
            value={editingProduct?.shortDescription || ""}
            onChange={(e) =>
              setEditingProduct((prev) =>
                prev ? { ...prev, shortDescription: e.target.value } : null,
              )
            }
            placeholder="Brief product description for listings"
          />
        </div>

        <div>
          <Label htmlFor="description">Full Description</Label>
          <Textarea
            id="description"
            value={editingProduct?.description || ""}
            onChange={(e) =>
              setEditingProduct((prev) =>
                prev ? { ...prev, description: e.target.value } : null,
              )
            }
            rows={4}
            placeholder="Detailed product description"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            checked={editingProduct?.prescriptionRequired || false}
            onCheckedChange={(checked) =>
              setEditingProduct((prev) =>
                prev ? { ...prev, prescriptionRequired: checked } : null,
              )
            }
          />
          <Label>Prescription Required</Label>
        </div>
      </TabsContent>

      <TabsContent value="pricing" className="space-y-4 mt-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="price">Selling Price *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={editingProduct?.price || 0}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev ? { ...prev, price: parseFloat(e.target.value) } : null,
                )
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="costPrice">Cost Price *</Label>
            <Input
              id="costPrice"
              type="number"
              step="0.01"
              value={editingProduct?.costPrice || 0}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev
                    ? { ...prev, costPrice: parseFloat(e.target.value) }
                    : null,
                )
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="compareAtPrice">Compare At Price</Label>
            <Input
              id="compareAtPrice"
              type="number"
              step="0.01"
              value={editingProduct?.compareAtPrice || ""}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev
                    ? {
                        ...prev,
                        compareAtPrice: parseFloat(e.target.value) || undefined,
                      }
                    : null,
                )
              }
            />
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium mb-2">Pricing Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Profit Margin:</span>
              <span className="ml-2 font-medium">
                {editingProduct?.price && editingProduct?.costPrice
                  ? `${(((editingProduct.price - editingProduct.costPrice) / editingProduct.price) * 100).toFixed(1)}%`
                  : "—"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Profit per Unit:</span>
              <span className="ml-2 font-medium">
                {editingProduct?.price && editingProduct?.costPrice
                  ? formatPrice(editingProduct.price - editingProduct.costPrice)
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="inventory" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sku">SKU *</Label>
            <Input
              id="sku"
              value={editingProduct?.sku || ""}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev ? { ...prev, sku: e.target.value } : null,
                )
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="stock">Current Stock</Label>
            <Input
              id="stock"
              type="number"
              value={editingProduct?.stock || 0}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev ? { ...prev, stock: parseInt(e.target.value) } : null,
                )
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
            <Input
              id="lowStockThreshold"
              type="number"
              value={editingProduct?.lowStockThreshold || 10}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev
                    ? { ...prev, lowStockThreshold: parseInt(e.target.value) }
                    : null,
                )
              }
            />
          </div>
          <div>
            <Label htmlFor="reorderPoint">Reorder Point</Label>
            <Input
              id="reorderPoint"
              type="number"
              value={editingProduct?.reorderPoint || 20}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev
                    ? { ...prev, reorderPoint: parseInt(e.target.value) }
                    : null,
                )
              }
            />
          </div>
          <div>
            <Label htmlFor="reorderQuantity">Reorder Quantity</Label>
            <Input
              id="reorderQuantity"
              type="number"
              value={editingProduct?.reorderQuantity || 100}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev
                    ? { ...prev, reorderQuantity: parseInt(e.target.value) }
                    : null,
                )
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={editingProduct?.isActive || false}
              onCheckedChange={(checked) =>
                setEditingProduct((prev) =>
                  prev ? { ...prev, isActive: checked } : null,
                )
              }
            />
            <Label>Product Active</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={editingProduct?.isDiscontinued || false}
              onCheckedChange={(checked) =>
                setEditingProduct((prev) =>
                  prev ? { ...prev, isDiscontinued: checked } : null,
                )
              }
            />
            <Label>Discontinued</Label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={editingProduct?.requiresRefrigeration || false}
              onCheckedChange={(checked) =>
                setEditingProduct((prev) =>
                  prev ? { ...prev, requiresRefrigeration: checked } : null,
                )
              }
            />
            <Label>Requires Refrigeration</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={editingProduct?.hazmat || false}
              onCheckedChange={(checked) =>
                setEditingProduct((prev) =>
                  prev ? { ...prev, hazmat: checked } : null,
                )
              }
            />
            <Label>Hazardous Material</Label>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="medical" className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="strength">Strength</Label>
            <Input
              id="strength"
              value={editingProduct?.strength || ""}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev ? { ...prev, strength: e.target.value } : null,
                )
              }
              placeholder="e.g., 20mg, 500mg"
            />
          </div>
          <div>
            <Label htmlFor="ndc">NDC Number</Label>
            <Input
              id="ndc"
              value={editingProduct?.ndc || ""}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev ? { ...prev, ndc: e.target.value } : null,
                )
              }
              placeholder="National Drug Code"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="activeIngredients">
            Active Ingredients (comma-separated)
          </Label>
          <Textarea
            id="activeIngredients"
            value={editingProduct?.activeIngredients?.join(", ") || ""}
            onChange={(e) =>
              setEditingProduct((prev) =>
                prev
                  ? {
                      ...prev,
                      activeIngredients: e.target.value
                        .split(",")
                        .map((s) => s.trim()),
                    }
                  : null,
              )
            }
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="indications">Indications (comma-separated)</Label>
          <Textarea
            id="indications"
            value={editingProduct?.indications?.join(", ") || ""}
            onChange={(e) =>
              setEditingProduct((prev) =>
                prev
                  ? {
                      ...prev,
                      indications: e.target.value
                        .split(",")
                        .map((s) => s.trim()),
                    }
                  : null,
              )
            }
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="contraindications">
            Contraindications (comma-separated)
          </Label>
          <Textarea
            id="contraindications"
            value={editingProduct?.contraindications?.join(", ") || ""}
            onChange={(e) =>
              setEditingProduct((prev) =>
                prev
                  ? {
                      ...prev,
                      contraindications: e.target.value
                        .split(",")
                        .map((s) => s.trim()),
                    }
                  : null,
              )
            }
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="sideEffects">Side Effects (comma-separated)</Label>
          <Textarea
            id="sideEffects"
            value={editingProduct?.sideEffects?.join(", ") || ""}
            onChange={(e) =>
              setEditingProduct((prev) =>
                prev
                  ? {
                      ...prev,
                      sideEffects: e.target.value
                        .split(",")
                        .map((s) => s.trim()),
                    }
                  : null,
              )
            }
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="interactions">
            Drug Interactions (comma-separated)
          </Label>
          <Textarea
            id="interactions"
            value={editingProduct?.interactions?.join(", ") || ""}
            onChange={(e) =>
              setEditingProduct((prev) =>
                prev
                  ? {
                      ...prev,
                      interactions: e.target.value
                        .split(",")
                        .map((s) => s.trim()),
                    }
                  : null,
              )
            }
            rows={2}
          />
        </div>
      </TabsContent>

      <TabsContent value="seo" className="space-y-4 mt-4">
        <div>
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Input
            id="metaTitle"
            value={editingProduct?.metaTitle || ""}
            onChange={(e) =>
              setEditingProduct((prev) =>
                prev ? { ...prev, metaTitle: e.target.value } : null,
              )
            }
            placeholder="SEO page title"
          />
        </div>

        <div>
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Textarea
            id="metaDescription"
            value={editingProduct?.metaDescription || ""}
            onChange={(e) =>
              setEditingProduct((prev) =>
                prev ? { ...prev, metaDescription: e.target.value } : null,
              )
            }
            rows={3}
            placeholder="SEO description for search engines"
          />
        </div>

        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={editingProduct?.tags?.join(", ") || ""}
            onChange={(e) =>
              setEditingProduct((prev) =>
                prev
                  ? {
                      ...prev,
                      tags: e.target.value.split(",").map((s) => s.trim()),
                    }
                  : null,
              )
            }
            placeholder="Product tags for search and filtering"
          />
        </div>

        <div>
          <Label htmlFor="features">Features (comma-separated)</Label>
          <Textarea
            id="features"
            value={editingProduct?.features?.join(", ") || ""}
            onChange={(e) =>
              setEditingProduct((prev) =>
                prev
                  ? {
                      ...prev,
                      features: e.target.value.split(",").map((s) => s.trim()),
                    }
                  : null,
              )
            }
            rows={2}
            placeholder="Product features"
          />
        </div>

        <div>
          <Label htmlFor="benefits">Benefits (comma-separated)</Label>
          <Textarea
            id="benefits"
            value={editingProduct?.benefits?.join(", ") || ""}
            onChange={(e) =>
              setEditingProduct((prev) =>
                prev
                  ? {
                      ...prev,
                      benefits: e.target.value.split(",").map((s) => s.trim()),
                    }
                  : null,
              )
            }
            rows={2}
            placeholder="Product benefits"
          />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label htmlFor="weight">Weight (grams)</Label>
            <Input
              id="weight"
              type="number"
              value={editingProduct?.weight || 0}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev ? { ...prev, weight: parseFloat(e.target.value) } : null,
                )
              }
            />
          </div>
          <div>
            <Label htmlFor="length">Length (mm)</Label>
            <Input
              id="length"
              type="number"
              value={editingProduct?.dimensions?.length || 0}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev
                    ? {
                        ...prev,
                        dimensions: {
                          ...prev.dimensions,
                          length: parseFloat(e.target.value),
                        },
                      }
                    : null,
                )
              }
            />
          </div>
          <div>
            <Label htmlFor="width">Width (mm)</Label>
            <Input
              id="width"
              type="number"
              value={editingProduct?.dimensions?.width || 0}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev
                    ? {
                        ...prev,
                        dimensions: {
                          ...prev.dimensions,
                          width: parseFloat(e.target.value),
                        },
                      }
                    : null,
                )
              }
            />
          </div>
          <div>
            <Label htmlFor="height">Height (mm)</Label>
            <Input
              id="height"
              type="number"
              value={editingProduct?.dimensions?.height || 0}
              onChange={(e) =>
                setEditingProduct((prev) =>
                  prev
                    ? {
                        ...prev,
                        dimensions: {
                          ...prev.dimensions,
                          height: parseFloat(e.target.value),
                        },
                      }
                    : null,
                )
              }
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Product Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your product catalog, inventory, and pricing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleCreateProduct}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Products"
          value={productMetrics.totalProducts.toLocaleString()}
          icon={Package}
          color="blue"
        />
        <MetricCard
          title="Active Products"
          value={productMetrics.activeProducts.toLocaleString()}
          icon={CheckCircle}
          color="green"
        />
        <MetricCard
          title="Total Inventory Value"
          value={formatPrice(productMetrics.totalValue)}
          icon={DollarSign}
          trend={{ positive: true, value: "+12.5%" }}
          color="green"
        />
        <MetricCard
          title="Average Price"
          value={formatPrice(productMetrics.avgPrice)}
          icon={BarChart3}
          color="purple"
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
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {PRODUCT_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="prescription">Prescription</SelectItem>
                <SelectItem value="otc">OTC</SelectItem>
                <SelectItem value="supplement">Supplements</SelectItem>
                <SelectItem value="device">Devices</SelectItem>
                <SelectItem value="bundle">Bundles</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-2">
            <div className="col-span-3 font-medium text-gray-900 dark:text-white">
              Product
            </div>
            <div className="col-span-2 font-medium text-gray-900 dark:text-white">
              Category
            </div>
            <div className="col-span-1 text-center font-medium text-gray-900 dark:text-white">
              Stock
            </div>
            <div className="col-span-1 font-medium text-gray-900 dark:text-white">
              Status
            </div>
            <div className="col-span-2 text-right font-medium text-gray-900 dark:text-white">
              Price
            </div>
            <div className="col-span-1 text-center font-medium text-gray-900 dark:text-white">
              Rating
            </div>
            <div className="col-span-2 text-right font-medium text-gray-900 dark:text-white">
              Actions
            </div>
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

      {/* Create Product Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create New Product</DialogTitle>
            <DialogDescription>
              Add a new product to your catalog
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1">
            <ProductForm />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveProduct}>
              <Save className="w-4 h-4 mr-2" />
              Create Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information and settings
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1">
            <ProductForm />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveProduct}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Delete Product
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedProduct?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
