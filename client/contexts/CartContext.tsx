import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CartItem, CartSummary, Bundle, Promotion, Upsell, CrossSell, CartCalculator, SAMPLE_PROMOTIONS } from '../data/cartTypes';

interface CartState {
  items: CartItem[];
  summary: CartSummary;
  promotions: Promotion[];
  appliedPromotions: string[];
  upsells: Upsell[];
  crossSells: CrossSell[];
  isOpen: boolean;
  recentlyAdded: string[];
  loyaltyPoints: number;
  subscriptions: CartItem[];
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<CartItem> } }
  | { type: 'APPLY_PROMOTION'; payload: string }
  | { type: 'REMOVE_PROMOTION'; payload: string }
  | { type: 'SET_SHIPPING_METHOD'; payload: { id: string; method: CartItem['shippingMethod'] } }
  | { type: 'TOGGLE_SUBSCRIPTION'; payload: { id: string; frequency?: CartItem['subscriptionFrequency'] } }
  | { type: 'TOGGLE_AUTO_REFILL'; payload: string }
  | { type: 'SET_UPSELLS'; payload: Upsell[] }
  | { type: 'SET_CROSS_SELLS'; payload: CrossSell[] }
  | { type: 'TOGGLE_CART'; payload?: boolean }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartState }
  | { type: 'RECALCULATE' };

const initialState: CartState = {
  items: [],
  summary: {
    subtotal: 0,
    discounts: 0,
    shipping: 0,
    tax: 0,
    insurance: 0,
    copays: 0,
    totalSavings: 0,
    finalTotal: 0,
    estimatedDelivery: '3-5 days',
    loyaltyPointsEarned: 0
  },
  promotions: SAMPLE_PROMOTIONS,
  appliedPromotions: [],
  upsells: [],
  crossSells: [],
  isOpen: false,
  recentlyAdded: [],
  loyaltyPoints: 1250, // Starting loyalty points
  subscriptions: []
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(item => 
        item.productId === action.payload.productId && 
        item.dosage === action.payload.dosage
      );

      let newItems: CartItem[];
      if (existingItemIndex >= 0) {
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newItems = [...state.items, { ...action.payload, id: `cart_${Date.now()}` }];
      }

      const summary = CartCalculator.calculateCartSummary(newItems, state.promotions);
      
      return {
        ...state,
        items: newItems,
        summary,
        recentlyAdded: [action.payload.productId, ...state.recentlyAdded.slice(0, 4)]
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const summary = CartCalculator.calculateCartSummary(newItems, state.promotions);
      
      return {
        ...state,
        items: newItems,
        summary,
        recentlyAdded: state.recentlyAdded.filter(id => id !== action.payload)
      };
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0);

      const summary = CartCalculator.calculateCartSummary(newItems, state.promotions);
      
      return {
        ...state,
        items: newItems,
        summary
      };
    }

    case 'UPDATE_ITEM': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, ...action.payload.updates }
          : item
      );

      const summary = CartCalculator.calculateCartSummary(newItems, state.promotions);
      
      return {
        ...state,
        items: newItems,
        summary
      };
    }

    case 'APPLY_PROMOTION': {
      if (state.appliedPromotions.includes(action.payload)) {
        return state;
      }

      const newAppliedPromotions = [...state.appliedPromotions, action.payload];
      const summary = CartCalculator.calculateCartSummary(state.items, state.promotions);
      
      return {
        ...state,
        appliedPromotions: newAppliedPromotions,
        summary
      };
    }

    case 'REMOVE_PROMOTION': {
      const newAppliedPromotions = state.appliedPromotions.filter(id => id !== action.payload);
      const summary = CartCalculator.calculateCartSummary(state.items, state.promotions);
      
      return {
        ...state,
        appliedPromotions: newAppliedPromotions,
        summary
      };
    }

    case 'SET_SHIPPING_METHOD': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, shippingMethod: action.payload.method }
          : item
      );

      const summary = CartCalculator.calculateCartSummary(newItems, state.promotions);
      
      return {
        ...state,
        items: newItems,
        summary
      };
    }

    case 'TOGGLE_SUBSCRIPTION': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { 
              ...item, 
              isSubscription: !item.isSubscription,
              subscriptionFrequency: action.payload.frequency || 'monthly',
              autoRefill: !item.isSubscription
            }
          : item
      );

      const subscriptions = newItems.filter(item => item.isSubscription);
      const summary = CartCalculator.calculateCartSummary(newItems, state.promotions);
      
      return {
        ...state,
        items: newItems,
        subscriptions,
        summary
      };
    }

    case 'TOGGLE_AUTO_REFILL': {
      const newItems = state.items.map(item =>
        item.id === action.payload
          ? { ...item, autoRefill: !item.autoRefill }
          : item
      );
      
      return {
        ...state,
        items: newItems
      };
    }

    case 'SET_UPSELLS': {
      return {
        ...state,
        upsells: action.payload
      };
    }

    case 'SET_CROSS_SELLS': {
      return {
        ...state,
        crossSells: action.payload
      };
    }

    case 'TOGGLE_CART': {
      return {
        ...state,
        isOpen: action.payload !== undefined ? action.payload : !state.isOpen
      };
    }

    case 'CLEAR_CART': {
      return {
        ...state,
        items: [],
        summary: initialState.summary,
        appliedPromotions: [],
        recentlyAdded: []
      };
    }

    case 'RECALCULATE': {
      const summary = CartCalculator.calculateCartSummary(state.items, state.promotions);
      return {
        ...state,
        summary
      };
    }

    case 'LOAD_CART': {
      return action.payload;
    }

    default:
      return state;
  }
}

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItem: (id: string, updates: Partial<CartItem>) => void;
  applyPromotion: (code: string) => void;
  removePromotion: (code: string) => void;
  setShippingMethod: (id: string, method: CartItem['shippingMethod']) => void;
  toggleSubscription: (id: string, frequency?: CartItem['subscriptionFrequency']) => void;
  toggleAutoRefill: (id: string) => void;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
  getItemCount: () => number;
  getItemById: (id: string) => CartItem | undefined;
  canCheckout: () => boolean;
} | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('medical_cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartData });
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('medical_cart', JSON.stringify(state));
  }, [state]);

  const addItem = (item: Omit<CartItem, 'id'>) => {
    dispatch({ type: 'ADD_ITEM', payload: { ...item, id: `cart_${Date.now()}` } });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const updateItem = (id: string, updates: Partial<CartItem>) => {
    dispatch({ type: 'UPDATE_ITEM', payload: { id, updates } });
  };

  const applyPromotion = (code: string) => {
    dispatch({ type: 'APPLY_PROMOTION', payload: code });
  };

  const removePromotion = (code: string) => {
    dispatch({ type: 'REMOVE_PROMOTION', payload: code });
  };

  const setShippingMethod = (id: string, method: CartItem['shippingMethod']) => {
    dispatch({ type: 'SET_SHIPPING_METHOD', payload: { id, method } });
  };

  const toggleSubscription = (id: string, frequency?: CartItem['subscriptionFrequency']) => {
    dispatch({ type: 'TOGGLE_SUBSCRIPTION', payload: { id, frequency } });
  };

  const toggleAutoRefill = (id: string) => {
    dispatch({ type: 'TOGGLE_AUTO_REFILL', payload: id });
  };

  const openCart = () => {
    dispatch({ type: 'TOGGLE_CART', payload: true });
  };

  const closeCart = () => {
    dispatch({ type: 'TOGGLE_CART', payload: false });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getItemById = (id: string) => {
    return state.items.find(item => item.id === id);
  };

  const canCheckout = () => {
    return state.items.length > 0 && state.items.every(item => 
      !item.prescriptionRequired || (item.prescriberId && item.pharmacyId)
    );
  };

  const value = {
    state,
    dispatch,
    addItem,
    removeItem,
    updateQuantity,
    updateItem,
    applyPromotion,
    removePromotion,
    setShippingMethod,
    toggleSubscription,
    toggleAutoRefill,
    openCart,
    closeCart,
    clearCart,
    getItemCount,
    getItemById,
    canCheckout
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export { CartContext };
