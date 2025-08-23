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
import { useCart } from '../contexts/CartContext';
import { Product, SAMPLE_PRODUCTS, PRODUCT_CATEGORIES, ProductManager } from '../data/products';
import { AIProductSearch } from './AIProductSearch';
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  ShoppingCart,
  Heart,
  Eye,
  Package,
  Truck,
  Shield,
  Zap,
  Clock,
  DollarSign,
  TrendingUp,
  Award,
  AlertTriangle,
  CheckCircle,
  Pill,
  Stethoscope,
  Activity,
  Plus,
  Minus,
  SortAsc,
  SortDesc
} from 'lucide-react';

interface ProductCatalogProps {
  isOpen?: boolean;
  onClose?: () => void;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'price' | 'rating' | 'popularity';
type SortDirection = 'asc' | 'desc';

export function ProductCatalog({ isOpen = true, onClose }: ProductCatalogProps) {
  const { addItem } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let products = SAMPLE_PRODUCTS;

    // Search filter
    if (searchQuery) {
      products = ProductManager.searchProducts(searchQuery, products);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      products = ProductManager.filterByCategory(selectedCategory, products);
    }

    // Type filter
    if (selectedType !== 'all') {
      products = ProductManager.filterByType(selectedType as Product['type'], products);
    }

    // Price range filter
    products = products.filter(
      product => product.price >= priceRange.min && product.price <= priceRange.max
    );

    // Only show active products
    products = products.filter(product => product.isActive);

    // Sort products
    products.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'popularity':
          comparison = a.reviewCount - b.reviewCount;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return products;
  }, [searchQuery, selectedCategory, selectedType, priceRange, sortBy, sortDirection]);

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      genericName: product.genericName,
      brand: product.brand,
      dosage: product.strength || product.dosages[0] || '',
      quantity: 1,
      unitPrice: product.price,
      totalPrice: product.price,
      productType: product.type,
      prescriptionRequired: product.prescriptionRequired,
      category: product.category.name,
      image: product.images[0],
      isSubscription: false,
      autoRefill: false,
      shippingMethod: 'standard',
      insuranceCovered: false,
      aiRecommended: false
    });
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStockStatusColor = (stock: number, lowThreshold: number) => {
    if (stock === 0) return 'text-red-600';
    if (stock <= lowThreshold) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStockStatusText = (stock: number, lowThreshold: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= lowThreshold) return 'Low Stock';
    return 'In Stock';
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700">
      <div className="relative">
        {/* Product Image */}
        <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-t-lg flex items-center justify-center overflow-hidden">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <Package className="w-16 h-16 text-gray-400" />
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product.id)}
          className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <Heart 
            className={`w-4 h-4 ${
              wishlist.includes(product.id) 
                ? 'fill-red-500 text-red-500' 
                : 'text-gray-400 hover:text-red-500'
            }`} 
          />
        </button>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.prescriptionRequired && (
            <Badge className="bg-blue-500 text-white text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Rx
            </Badge>
          )}
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <Badge className="bg-red-500 text-white text-xs">
              Sale
            </Badge>
          )}
          {product.isOnBackorder && (
            <Badge className="bg-yellow-500 text-white text-xs">
              Backorder
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        {/* Product Info */}
        <div className="space-y-2">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
              {product.name}
            </h3>
            {product.brand && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {product.brand} • {product.strength}
              </p>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-sm text-gray-500 line-through ml-2">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
            <div className={`text-xs ${getStockStatusColor(product.stock, product.lowStockThreshold)}`}>
              {getStockStatusText(product.stock, product.lowStockThreshold)}
            </div>
          </div>

          {/* Category */}
          <Badge variant="outline" className="text-xs">
            {product.category.name}
          </Badge>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => handleAddToCart(product)}
              disabled={product.stock === 0}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Add to Cart
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedProduct(product)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProductListItem = ({ product }: { product: Product }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Product Image */}
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
            {product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Package className="w-8 h-8 text-gray-400" />
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {product.name}
                </h3>
                {product.brand && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {product.brand} • {product.strength}
                  </p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                  {product.shortDescription}
                </p>
                
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(product.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">
                      ({product.reviewCount})
                    </span>
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    {product.category.name}
                  </Badge>
                  
                  {product.prescriptionRequired && (
                    <Badge className="bg-blue-500 text-white text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      Rx Required
                    </Badge>
                  )}
                </div>
              </div>

              {/* Price and Actions */}
              <div className="text-right flex-shrink-0 ml-4">
                <div className="mb-2">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatPrice(product.price)}
                  </div>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <div className="text-sm text-gray-500 line-through">
                      {formatPrice(product.compareAtPrice)}
                    </div>
                  )}
                  <div className={`text-xs ${getStockStatusColor(product.stock, product.lowStockThreshold)}`}>
                    {getStockStatusText(product.stock, product.lowStockThreshold)}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleWishlist(product.id)}
                  >
                    <Heart 
                      className={`w-4 h-4 ${
                        wishlist.includes(product.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-gray-400'
                      }`} 
                    />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Product Catalog
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse our comprehensive medical products and medications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AIProductSearch onProductSelect={(product) => {
            handleAddToCart(product);
          }} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filters
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search medications, brands, conditions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {PRODUCT_CATEGORIES.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="prescription">Prescription</SelectItem>
                  <SelectItem value="otc">Over-the-Counter</SelectItem>
                  <SelectItem value="supplement">Supplements</SelectItem>
                  <SelectItem value="device">Medical Devices</SelectItem>
                  <SelectItem value="bundle">Bundles</SelectItem>
                </SelectContent>
              </Select>

              <Select value={`${sortBy}-${sortDirection}`} onValueChange={(value) => {
                const [sort, direction] = value.split('-');
                setSortBy(sort as SortOption);
                setSortDirection(direction as SortDirection);
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                  <SelectItem value="price-asc">Price Low-High</SelectItem>
                  <SelectItem value="price-desc">Price High-Low</SelectItem>
                  <SelectItem value="rating-desc">Highest Rated</SelectItem>
                  <SelectItem value="popularity-desc">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Price Range</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <Label>Availability</Label>
                <div className="flex gap-2 mt-1">
                  <Button variant="outline" size="sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    In Stock
                  </Button>
                  <Button variant="outline" size="sm">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Low Stock
                  </Button>
                </div>
              </div>

              <div>
                <Label>Special Offers</Label>
                <div className="flex gap-2 mt-1">
                  <Button variant="outline" size="sm">
                    <DollarSign className="w-4 h-4 mr-1" />
                    On Sale
                  </Button>
                  <Button variant="outline" size="sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Best Sellers
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {filteredProducts.length} of {SAMPLE_PRODUCTS.length} products
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          Updated 2 hours ago
        </div>
      </div>

      {/* Products Grid/List */}
      {filteredProducts.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredProducts.map((product) => (
            viewMode === 'grid' ? (
              <ProductCard key={product.id} product={product} />
            ) : (
              <ProductListItem key={product.id} product={product} />
            )
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search terms or filters
            </p>
            <Button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedType('all');
                setPriceRange({ min: 0, max: 1000 });
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Load More Button (if needed) */}
      {filteredProducts.length > 0 && (
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load More Products
          </Button>
        </div>
      )}
    </div>
  );
}
