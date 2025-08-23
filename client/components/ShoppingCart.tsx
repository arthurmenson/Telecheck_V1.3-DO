import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useCart } from '../contexts/CartContext';
import {
  ShoppingCart as ShoppingCartIcon,
  Plus,
  Minus,
  Trash2,
  Package,
  Truck,
  Clock,
  CreditCard,
  Gift,
  Tag,
  Zap,
  RefreshCw,
  Heart,
  Shield,
  AlertCircle,
  CheckCircle,
  Star,
  TrendingUp,
  Calendar,
  Sparkles,
  Percent,
  ArrowRight,
  X,
  Info,
  ThumbsUp,
  Award
} from 'lucide-react';

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShoppingCart({ isOpen, onClose }: ShoppingCartProps) {
  const { state, removeItem, updateQuantity, setShippingMethod, toggleSubscription, toggleAutoRefill, applyPromotion, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [showUpsells, setShowUpsells] = useState(true);
  const [activeTab, setActiveTab] = useState('cart');

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      applyPromotion(promoCode.trim());
      setPromoCode('');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getShippingIcon = (method: string) => {
    switch (method) {
      case 'overnight': return <Zap className="w-4 h-4" />;
      case 'express': return <Truck className="w-4 h-4" />;
      case 'pickup': return <Package className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const renderCartItems = () => (
    <div className="space-y-4">
      {state.items.map((item) => (
        <Card key={item.id} className="border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {/* Product Image */}
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-400" />
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {item.name}
                    </h3>
                    {item.brand && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.brand} • {item.dosage}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {item.prescriptionRequired && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Rx Required
                        </Badge>
                      )}
                      {item.isSubscription && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Subscription
                        </Badge>
                      )}
                      {item.aiRecommended && (
                        <Badge className="bg-purple-100 text-purple-800 text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />
                          AI Recommended
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Quantity and Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formatPrice(item.totalPrice)}
                    </div>
                    {item.savings && item.savings > 0 && (
                      <div className="text-sm text-green-600">
                        Save {formatPrice(item.savings)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Method */}
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    {getShippingIcon(item.shippingMethod)}
                    <span>
                      {item.shippingMethod === 'overnight' && 'Overnight Delivery (+$25.99)'}
                      {item.shippingMethod === 'express' && 'Express Delivery (+$15.99)'}
                      {item.shippingMethod === 'standard' && 'Standard Delivery (FREE over $50)'}
                      {item.shippingMethod === 'pickup' && 'Pharmacy Pickup (FREE)'}
                    </span>
                  </div>
                  
                  <div className="flex gap-1">
                    {(['standard', 'express', 'overnight', 'pickup'] as const).map((method) => (
                      <Button
                        key={method}
                        variant={item.shippingMethod === method ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setShippingMethod(item.id, method)}
                        className="text-xs px-2 py-1"
                      >
                        {method.charAt(0).toUpperCase() + method.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Subscription Options */}
                {!item.prescriptionRequired && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">
                          Subscribe & Save 15%
                        </span>
                      </div>
                      <Switch
                        checked={item.isSubscription}
                        onCheckedChange={() => toggleSubscription(item.id)}
                      />
                    </div>
                    {item.isSubscription && (
                      <div className="space-y-2">
                        <div className="text-xs text-green-700 dark:text-green-300">
                          Delivery every {item.subscriptionFrequency} • Cancel anytime
                        </div>
                        <div className="flex gap-1">
                          {(['monthly', 'quarterly'] as const).map((freq) => (
                            <Button
                              key={freq}
                              variant={item.subscriptionFrequency === freq ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => toggleSubscription(item.id, freq)}
                              className="text-xs px-2 py-1"
                            >
                              {freq.charAt(0).toUpperCase() + freq.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Auto-Refill for Prescriptions */}
                {item.prescriptionRequired && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Auto-Refill
                        </span>
                        <Info className="w-3 h-3 text-blue-600" />
                      </div>
                      <Switch
                        checked={item.autoRefill}
                        onCheckedChange={() => toggleAutoRefill(item.id)}
                      />
                    </div>
                    {item.autoRefill && (
                      <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        We'll automatically refill when you have 7 days left
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderUpsells = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recommended for You
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowUpsells(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {state.upsells.map((upsell) => (
        <Card key={upsell.id} className="border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <Gift className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {upsell.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {upsell.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(upsell.upsellPrice)}
                  </span>
                  {upsell.savings > 0 && (
                    <>
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(upsell.originalPrice)}
                      </span>
                      <Badge className="bg-green-100 text-green-800">
                        Save {formatPrice(upsell.savings)}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderBundles = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Frequently Bought Together
      </h3>
      
      {state.crossSells.map((crossSell) => (
        <Card key={crossSell.id} className="border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {crossSell.title}
                </h4>
                <Badge className="bg-blue-100 text-blue-800">
                  {crossSell.popularity}% buy together
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {crossSell.description}
              </p>
              
              <div className="space-y-2">
                {crossSell.products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{product.name}</span>
                    <span className="font-medium">{formatPrice(product.price)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(crossSell.totalPrice)}
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {formatPrice(crossSell.bundlePrice)}
                      </span>
                    </div>
                    <div className="text-sm text-green-600">
                      Save {formatPrice(crossSell.savings)}
                    </div>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Add Bundle
                  </Button>
                </div>
              </div>
              
              <div className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                <Info className="w-3 h-3 inline mr-1" />
                {crossSell.clinicalReason}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-4">
      {/* Promo Code */}
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleApplyPromo} variant="outline">
              <Tag className="w-4 h-4 mr-1" />
              Apply
            </Button>
          </div>
          
          {state.appliedPromotions.length > 0 && (
            <div className="mt-3 space-y-1">
              {state.appliedPromotions.map((promoId) => {
                const promo = state.promotions.find(p => p.id === promoId);
                return promo ? (
                  <div key={promoId} className="flex items-center justify-between text-sm">
                    <span className="text-green-600">✓ {promo.title}</span>
                    <span className="text-green-600">-{formatPrice(promo.value)}</span>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Subtotal ({state.items.length} items)</span>
            <span>{formatPrice(state.summary.subtotal)}</span>
          </div>
          
          {state.summary.discounts > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discounts</span>
              <span>-{formatPrice(state.summary.discounts)}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>
              {state.summary.shipping > 0 ? formatPrice(state.summary.shipping) : 'FREE'}
            </span>
          </div>
          
          {state.summary.insurance > 0 && (
            <div className="flex justify-between text-blue-600">
              <span>Insurance Coverage</span>
              <span>-{formatPrice(state.summary.insurance)}</span>
            </div>
          )}
          
          {state.summary.copays > 0 && (
            <div className="flex justify-between">
              <span>Copays</span>
              <span>{formatPrice(state.summary.copays)}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span>Tax</span>
            <span>{formatPrice(state.summary.tax)}</span>
          </div>
          
          <div className="border-t pt-3">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatPrice(state.summary.finalTotal)}</span>
            </div>
            
            {state.summary.totalSavings > 0 && (
              <div className="text-sm text-green-600 text-right">
                You saved {formatPrice(state.summary.totalSavings)}!
              </div>
            )}
            
            <div className="text-sm text-gray-600 text-right mt-1">
              Estimated delivery: {state.summary.estimatedDelivery}
            </div>
          </div>

          {/* Loyalty Points */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Earn {state.summary.loyaltyPointsEarned} loyalty points
              </span>
            </div>
            <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              Current balance: {state.loyaltyPoints} points
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checkout Button */}
      <Button 
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
        size="lg"
        disabled={state.items.length === 0}
      >
        <CreditCard className="w-5 h-5 mr-2" />
        Proceed to Checkout
      </Button>
    </div>
  );

  if (state.items.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCartIcon className="w-5 h-5" />
              Your Cart
            </DialogTitle>
          </DialogHeader>
          
          <div className="text-center py-8">
            <ShoppingCartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Add medications and health products to get started
            </p>
            <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
              Continue Shopping
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCartIcon className="w-5 h-5" />
              Your Cart ({state.items.reduce((total, item) => total + item.quantity, 0)} items)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearCart}
                className="text-red-600 hover:text-red-700"
              >
                Clear Cart
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cart">Cart Items</TabsTrigger>
            <TabsTrigger value="upsells">Recommendations</TabsTrigger>
            <TabsTrigger value="bundles">Bundles</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[60vh] mt-4">
            <TabsContent value="cart" className="space-y-4">
              {renderCartItems()}
            </TabsContent>

            <TabsContent value="upsells" className="space-y-4">
              {showUpsells && renderUpsells()}
            </TabsContent>

            <TabsContent value="bundles" className="space-y-4">
              {renderBundles()}
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              {renderSummary()}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
