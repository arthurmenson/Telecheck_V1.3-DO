import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from './ui/command';
import {
  Brain,
  Search,
  Sparkles,
  TrendingUp,
  Clock,
  Star,
  Package,
  Pill,
  Heart,
  Zap,
  Target,
  Users,
  Filter,
  SortAsc,
  SortDesc,
  History,
  Bookmark,
  ShoppingCart,
  ArrowRight,
  Lightbulb,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Product, SAMPLE_PRODUCTS, ProductManager } from '../data/products';
import { useCart } from '../contexts/CartContext';

interface SearchSuggestion {
  id: string;
  type: 'product' | 'condition' | 'category' | 'symptom' | 'interaction';
  text: string;
  description?: string;
  confidence: number;
  relatedProducts?: string[];
  icon?: React.ReactNode;
}

interface AIRecommendation {
  id: string;
  productId: string;
  reason: string;
  confidence: number;
  category: 'similar' | 'frequently_bought' | 'condition_based' | 'ai_suggested' | 'trending';
  evidence: string[];
}

interface SearchHistory {
  id: string;
  query: string;
  timestamp: string;
  resultsCount: number;
  clickedProduct?: string;
}

const SAMPLE_SUGGESTIONS: SearchSuggestion[] = [
  {
    id: 'sugg_1',
    type: 'condition',
    text: 'High Cholesterol',
    description: 'Medications for managing cholesterol levels',
    confidence: 0.95,
    relatedProducts: ['atorvastatin_20mg'],
    icon: <Heart className="w-4 h-4" />
  },
  {
    id: 'sugg_2',
    type: 'condition',
    text: 'Type 2 Diabetes',
    description: 'Blood sugar management medications',
    confidence: 0.92,
    relatedProducts: ['metformin_500mg'],
    icon: <Target className="w-4 h-4" />
  },
  {
    id: 'sugg_3',
    type: 'symptom',
    text: 'Pain Relief',
    description: 'Over-the-counter pain medications',
    confidence: 0.88,
    relatedProducts: ['ibuprofen_200mg'],
    icon: <Zap className="w-4 h-4" />
  },
  {
    id: 'sugg_4',
    type: 'category',
    text: 'Heart Health Supplements',
    description: 'Nutritional support for cardiovascular health',
    confidence: 0.85,
    relatedProducts: ['omega3_1000mg'],
    icon: <Heart className="w-4 h-4" />
  }
];

const SAMPLE_RECOMMENDATIONS: AIRecommendation[] = [
  {
    id: 'rec_1',
    productId: 'omega3_1000mg',
    reason: 'Frequently bought with cholesterol medications',
    confidence: 0.89,
    category: 'frequently_bought',
    evidence: ['85% of customers also purchase', 'Supports heart health', 'Reduces inflammation']
  },
  {
    id: 'rec_2',
    productId: 'lisinopril_10mg',
    reason: 'Commonly prescribed with diabetes medications',
    confidence: 0.82,
    category: 'condition_based',
    evidence: ['Blood pressure management', 'Diabetes complication prevention', 'Kidney protection']
  },
  {
    id: 'rec_3',
    productId: 'prenatal_vitamins',
    reason: 'Trending in women\'s health category',
    confidence: 0.76,
    category: 'trending',
    evidence: ['30% increase in searches', 'High customer ratings', 'Essential nutrients']
  }
];

interface AIProductSearchProps {
  isOpen?: boolean;
  onClose?: () => void;
  onProductSelect?: (product: Product) => void;
}

export function AIProductSearch({ isOpen = false, onClose, onProductSelect }: AIProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCommandOpen, setIsCommandOpen] = useState(isOpen);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(SAMPLE_RECOMMENDATIONS);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches] = useState<string[]>([
    'Blood pressure medication',
    'Diabetes management',
    'Pain relief',
    'Heart health',
    'Weight loss',
    'Cholesterol lowering',
    'Anti-inflammatory',
    'Supplements'
  ]);
  const { addItem } = useCart();

  // Simulate AI-powered search suggestions
  useEffect(() => {
    if (searchQuery.length > 2) {
      const timer = setTimeout(() => {
        // Simulate AI processing delay
        const aiSuggestions = SAMPLE_SUGGESTIONS.filter(suggestion =>
          suggestion.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          suggestion.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSuggestions(aiSuggestions);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  // Get AI-enhanced search results
  const aiSearchResults = useMemo(() => {
    if (!searchQuery) return [];

    let results = ProductManager.searchProducts(searchQuery, SAMPLE_PRODUCTS);
    
    // AI-powered ranking based on multiple factors
    results = results.map(product => ({
      ...product,
      aiScore: calculateAIScore(product, searchQuery),
      relevanceReasons: getRelevanceReasons(product, searchQuery)
    })).sort((a, b) => b.aiScore - a.aiScore);

    return results;
  }, [searchQuery]);

  const calculateAIScore = (product: Product, query: string): number => {
    let score = 0;
    const queryLower = query.toLowerCase();
    
    // Name match (highest weight)
    if (product.name.toLowerCase().includes(queryLower)) score += 100;
    
    // Category match
    if (product.category.name.toLowerCase().includes(queryLower)) score += 50;
    
    // Description match
    if (product.description.toLowerCase().includes(queryLower)) score += 30;
    
    // Tags match
    product.tags.forEach(tag => {
      if (tag.toLowerCase().includes(queryLower)) score += 20;
    });
    
    // Indications match (medical conditions)
    product.indications.forEach(indication => {
      if (indication.toLowerCase().includes(queryLower)) score += 40;
    });
    
    // Popularity factors
    score += product.rating * 5;
    score += Math.log(product.reviewCount + 1) * 2;
    
    // Availability bonus
    if (product.stock > 0) score += 10;
    if (product.isActive) score += 5;
    
    return score;
  };

  const getRelevanceReasons = (product: Product, query: string): string[] => {
    const reasons: string[] = [];
    const queryLower = query.toLowerCase();
    
    if (product.name.toLowerCase().includes(queryLower)) {
      reasons.push('Name match');
    }
    if (product.category.name.toLowerCase().includes(queryLower)) {
      reasons.push('Category match');
    }
    if (product.indications.some(ind => ind.toLowerCase().includes(queryLower))) {
      reasons.push('Treats condition');
    }
    if (product.rating >= 4.0) {
      reasons.push('Highly rated');
    }
    if (product.reviewCount > 1000) {
      reasons.push('Popular choice');
    }
    
    return reasons;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    addToSearchHistory(query);
    if (!recentSearches.includes(query)) {
      setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
    }
  };

  const addToSearchHistory = (query: string) => {
    const historyItem: SearchHistory = {
      id: `hist_${Date.now()}`,
      query,
      timestamp: new Date().toISOString(),
      resultsCount: aiSearchResults.length
    };
    setSearchHistory(prev => [historyItem, ...prev.slice(0, 9)]);
  };

  const handleProductSelect = (product: Product) => {
    onProductSelect?.(product);
    setIsCommandOpen(false);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
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
      aiRecommended: true
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'cardiovascular': return <Heart className="w-4 h-4" />;
      case 'diabetes': return <Target className="w-4 h-4" />;
      case 'pain management': return <Zap className="w-4 h-4" />;
      case 'mental health': return <Brain className="w-4 h-4" />;
      default: return <Pill className="w-4 h-4" />;
    }
  };

  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="outline"
        className="relative w-full max-w-sm justify-start text-sm text-muted-foreground"
        onClick={() => setIsCommandOpen(true)}
      >
        <Search className="w-4 h-4 mr-2" />
        <span className="hidden lg:inline-flex">Search products with AI...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* AI Search Command Dialog */}
      <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <div className="flex items-center border-b px-3">
          <Brain className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <CommandInput 
            placeholder="Search products with AI assistance..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
        </div>
        <CommandList className="max-h-[400px]">
          <CommandEmpty>
            <div className="text-center py-6">
              <Search className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No products found</p>
              <p className="text-xs text-gray-500 mt-1">Try searching for conditions, symptoms, or product names</p>
            </div>
          </CommandEmpty>
          
          {/* Popular Searches */}
          {!searchQuery && (
            <CommandGroup heading="Popular Searches">
              {popularSearches.slice(0, 4).map((search) => (
                <CommandItem
                  key={search}
                  onSelect={() => handleSearch(search)}
                  className="cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {search}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Recent Searches */}
          {!searchQuery && recentSearches.length > 0 && (
            <CommandGroup heading="Recent Searches">
              {recentSearches.slice(0, 3).map((search) => (
                <CommandItem
                  key={search}
                  onSelect={() => handleSearch(search)}
                  className="cursor-pointer"
                >
                  <History className="w-4 h-4 mr-2" />
                  {search}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <CommandGroup heading="AI Suggestions">
              {suggestions.map((suggestion) => (
                <CommandItem
                  key={suggestion.id}
                  onSelect={() => handleSearch(suggestion.text)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    {suggestion.icon}
                    <div>
                      <div className="font-medium">{suggestion.text}</div>
                      {suggestion.description && (
                        <div className="text-xs text-gray-500">{suggestion.description}</div>
                      )}
                    </div>
                  </div>
                  <Badge className="ml-auto bg-purple-100 text-purple-800">
                    {Math.round(suggestion.confidence * 100)}%
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Search Results */}
          {aiSearchResults.length > 0 && (
            <CommandGroup heading={`Search Results (${aiSearchResults.length})`}>
              {aiSearchResults.slice(0, 6).map((product: any) => (
                <CommandItem
                  key={product.id}
                  onSelect={() => handleProductSelect(product)}
                  className="cursor-pointer p-3"
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {getCategoryIcon(product.category.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{product.name}</h4>
                          {product.brand && (
                            <p className="text-xs text-gray-600">{product.brand} • {product.strength}</p>
                          )}
                          <div className="flex items-center gap-1 mt-1">
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
                            <span className="text-xs text-gray-500">({product.reviewCount})</span>
                            <Badge className="bg-blue-100 text-blue-800 text-xs ml-auto">
                              AI Score: {Math.round(product.aiScore)}
                            </Badge>
                          </div>
                          {product.relevanceReasons && (
                            <div className="flex gap-1 mt-1">
                              {product.relevanceReasons.slice(0, 2).map((reason: string) => (
                                <Badge key={reason} variant="outline" className="text-xs">
                                  {reason}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <span className="font-medium text-sm">{formatPrice(product.price)}</span>
                          <Button
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={(e) => handleAddToCart(product, e)}
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* AI Recommendations */}
          {!searchQuery && recommendations.length > 0 && (
            <CommandGroup heading="AI Recommendations">
              {recommendations.slice(0, 3).map((rec) => {
                const product = SAMPLE_PRODUCTS.find(p => p.id === rec.productId);
                if (!product) return null;
                
                return (
                  <CommandItem
                    key={rec.id}
                    onSelect={() => handleProductSelect(product)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Lightbulb className="w-4 h-4 text-yellow-500" />
                      <div className="flex-1">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-gray-500">{rec.reason}</div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {Math.round(rec.confidence * 100)}%
                      </Badge>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
        
        <div className="border-t p-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Brain className="w-3 h-3" />
              Powered by AI
            </span>
            <div className="flex gap-2">
              <kbd className="px-1 py-0.5 bg-gray-100 rounded">↑↓</kbd>
              <span>navigate</span>
              <kbd className="px-1 py-0.5 bg-gray-100 rounded">↵</kbd>
              <span>select</span>
              <kbd className="px-1 py-0.5 bg-gray-100 rounded">esc</kbd>
              <span>close</span>
            </div>
          </div>
        </div>
      </CommandDialog>
    </>
  );
}
