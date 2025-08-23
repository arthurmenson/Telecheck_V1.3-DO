import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  Gift,
  Package,
  Percent,
  Star,
  Clock,
  Users,
  TrendingUp,
  Heart,
  Shield,
  Zap,
  Award,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Tag,
  Calendar,
  Target,
  ThumbsUp
} from 'lucide-react';
import { SAMPLE_BUNDLES, Bundle } from '../data/cartTypes';
import { useCart } from '../contexts/CartContext';

interface LimitedTimeOffer {
  id: string;
  title: string;
  description: string;
  discountPercentage: number;
  originalPrice: number;
  salePrice: number;
  timeLeft: string;
  popularityScore: number;
  limitedQuantity: number;
  soldCount: number;
  urgencyLevel: 'low' | 'medium' | 'high';
  category: string;
  benefits: string[];
}

const LIMITED_TIME_OFFERS: LimitedTimeOffer[] = [
  {
    id: 'flash_heart_bundle',
    title: '48-Hour Flash Sale: Complete Heart Health Kit',
    description: 'Everything you need for optimal cardiovascular health',
    discountPercentage: 40,
    originalPrice: 299.99,
    salePrice: 179.99,
    timeLeft: '23h 45m',
    popularityScore: 94,
    limitedQuantity: 100,
    soldCount: 73,
    urgencyLevel: 'high',
    category: 'Cardiovascular',
    benefits: [
      'Prescription Atorvastatin 20mg (90-day supply)',
      'CoQ10 100mg supplement',
      'Digital Blood Pressure Monitor',
      'Omega-3 Fish Oil 1000mg',
      'Free nutrition consultation'
    ]
  },
  {
    id: 'diabetes_starter',
    title: 'New Patient Special: Diabetes Management Kit',
    description: 'Complete diabetes care bundle for new patients',
    discountPercentage: 35,
    originalPrice: 189.99,
    salePrice: 123.49,
    timeLeft: '5d 12h',
    popularityScore: 87,
    limitedQuantity: 150,
    soldCount: 89,
    urgencyLevel: 'medium',
    category: 'Endocrinology',
    benefits: [
      'Metformin 500mg (30-day supply)',
      'Glucose testing strips (100 count)',
      'Digital glucose meter',
      'Alpha Lipoic Acid supplement',
      'Diabetes education materials'
    ]
  },
  {
    id: 'wellness_bundle',
    title: 'Spring Wellness Bundle',
    description: 'Boost your immunity and energy for spring',
    discountPercentage: 25,
    originalPrice: 149.99,
    salePrice: 112.49,
    timeLeft: '12d 8h',
    popularityScore: 76,
    limitedQuantity: 200,
    soldCount: 45,
    urgencyLevel: 'low',
    category: 'Wellness',
    benefits: [
      'Vitamin D3 2000IU',
      'Multivitamin Complex',
      'Probiotics 50 Billion CFU',
      'Vitamin C 1000mg',
      'Free wellness tracking app'
    ]
  }
];

const SEASONAL_PROMOTIONS = [
  {
    id: 'spring_detox',
    title: 'Spring Detox Challenge',
    description: '30-day liver support program',
    discount: '30% OFF',
    category: 'Detox & Cleanse',
    endDate: '2024-04-30',
    image: '/promotions/spring-detox.jpg'
  },
  {
    id: 'summer_skin',
    title: 'Summer Skin Protection',
    description: 'Complete skincare regimen',
    discount: 'Buy 2 Get 1 FREE',
    category: 'Skincare',
    endDate: '2024-06-30',
    image: '/promotions/summer-skin.jpg'
  },
  {
    id: 'heart_month',
    title: 'Heart Health Month',
    description: 'Cardiovascular wellness focus',
    discount: '25% OFF',
    category: 'Heart Health',
    endDate: '2024-02-29',
    image: '/promotions/heart-month.jpg'
  }
];

export function BundlePromotions() {
  const { addItem } = useCart();
  const [selectedBundle, setSelectedBundle] = useState<Bundle | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAddBundle = (bundle: Bundle) => {
    // Add bundle as a cart item with special bundle properties
    addItem({
      productId: bundle.id,
      name: bundle.name,
      dosage: 'Bundle',
      quantity: 1,
      unitPrice: bundle.bundlePrice,
      totalPrice: bundle.bundlePrice,
      productType: 'bundle',
      prescriptionRequired: false,
      category: bundle.category,
      isSubscription: false,
      autoRefill: false,
      shippingMethod: 'standard',
      insuranceCovered: false,
      aiRecommended: bundle.clinicallyRecommended,
      bundleId: bundle.id,
      bundleDiscount: bundle.discountPercentage,
      bundleItems: bundle.productIds,
      savings: bundle.savings
    });
  };

  return (
    <div className="space-y-8">
      {/* Flash Sales & Limited Time Offers */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              ⚡ Flash Sales & Limited Offers
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Exclusive deals with limited quantities - act fast!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {LIMITED_TIME_OFFERS.map((offer) => {
            const stockPercentage = ((offer.limitedQuantity - offer.soldCount) / offer.limitedQuantity) * 100;
            
            return (
              <Card key={offer.id} className="border-2 border-red-200 dark:border-red-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-sm font-bold">
                  {offer.discountPercentage}% OFF
                </div>
                
                <CardHeader className="pb-3">
                  <div className="space-y-2">
                    <Badge className={getUrgencyColor(offer.urgencyLevel)}>
                      {offer.urgencyLevel === 'high' && <Zap className="w-3 h-3 mr-1" />}
                      {offer.urgencyLevel === 'medium' && <Clock className="w-3 h-3 mr-1" />}
                      {offer.urgencyLevel === 'low' && <Star className="w-3 h-3 mr-1" />}
                      {offer.urgencyLevel.toUpperCase()} DEMAND
                    </Badge>
                    
                    <CardTitle className="text-lg leading-tight">
                      {offer.title}
                    </CardTitle>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {offer.description}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Pricing */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-red-600">
                          {formatPrice(offer.salePrice)}
                        </span>
                        <span className="text-lg text-gray-500 line-through">
                          {formatPrice(offer.originalPrice)}
                        </span>
                      </div>
                      <div className="text-sm text-green-600">
                        Save {formatPrice(offer.originalPrice - offer.salePrice)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-400">Time Left</div>
                      <div className="text-lg font-bold text-red-600">{offer.timeLeft}</div>
                    </div>
                  </div>

                  {/* Stock Indicator */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Stock</span>
                      <span className="font-medium">
                        {offer.limitedQuantity - offer.soldCount} of {offer.limitedQuantity} left
                      </span>
                    </div>
                    <Progress 
                      value={stockPercentage} 
                      className={`h-2 ${stockPercentage < 30 ? 'bg-red-100' : 'bg-green-100'}`} 
                    />
                  </div>

                  {/* Popularity */}
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {offer.popularityScore}% of customers recommend this bundle
                    </span>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Includes:</h4>
                    {offer.benefits.slice(0, 3).map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">{benefit}</span>
                      </div>
                    ))}
                    {offer.benefits.length > 3 && (
                      <div className="text-xs text-blue-600">
                        +{offer.benefits.length - 3} more benefits
                      </div>
                    )}
                  </div>

                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    size="lg"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Claim This Deal
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Popular Bundles */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              🏆 Most Popular Bundles
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Clinically curated combinations for better health outcomes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {SAMPLE_BUNDLES.map((bundle) => (
            <Card key={bundle.id} className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    {bundle.popularityRank <= 3 && (
                      <Badge className="bg-gold-100 text-gold-800">
                        <Award className="w-3 h-3 mr-1" />
                        #{bundle.popularityRank} Best Seller
                      </Badge>
                    )}
                    {bundle.clinicallyRecommended && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Clinically Recommended
                      </Badge>
                    )}
                  </div>
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
                  </div>
                </div>

                <CardTitle className="text-xl leading-tight group-hover:text-blue-600 transition-colors">
                  {bundle.name}
                </CardTitle>
                
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {bundle.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Pricing */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-green-600">
                        {formatPrice(bundle.bundlePrice)}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        {formatPrice(bundle.originalPrice)}
                      </span>
                    </div>
                    <div className="text-sm text-green-600">
                      Save {formatPrice(bundle.savings)} ({bundle.discountPercentage}% off)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
                    <div className="font-medium">{bundle.duration}</div>
                  </div>
                </div>

                {/* Target Conditions */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Targets:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {bundle.targetCondition.map((condition, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Target className="w-3 h-3 mr-1" />
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Key Benefits:
                  </h4>
                  <div className="space-y-1">
                    {bundle.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full group-hover:bg-blue-600 transition-colors"
                  onClick={() => handleAddBundle(bundle)}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Add Bundle to Cart
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Seasonal Promotions */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              🌟 Seasonal Promotions
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Special offers based on health trends and seasons
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SEASONAL_PROMOTIONS.map((promo) => (
            <Card key={promo.id} className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-gray-400" />
                  </div>

                  <div>
                    <Badge className="mb-2 bg-green-100 text-green-800">
                      {promo.discount}
                    </Badge>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {promo.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {promo.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Ends {promo.endDate}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {promo.category}
                    </Badge>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Tag className="w-4 h-4 mr-2" />
                    View Promotion
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Loyalty Program Promotion */}
      <Card className="border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-2">
                  Join Our Loyalty Program
                </h3>
                <p className="text-purple-700 dark:text-purple-300 mb-4">
                  Earn points on every purchase, get exclusive access to new bundles, and enjoy member-only discounts.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-700 dark:text-purple-300">
                      Earn 1 point per $1 spent
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-700 dark:text-purple-300">
                      Free birthday bundle
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-700 dark:text-purple-300">
                      Early access to sales
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8">
              Join Now - It's Free!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
