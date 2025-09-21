import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
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
import { useCart } from "../contexts/CartContext";
import {
  CreditCard,
  Building,
  Shield,
  CheckCircle,
  AlertTriangle,
  Lock,
  Truck,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Percent,
  Gift,
  Clock,
  Package,
  Star,
  Heart,
  Award,
  FileText,
  Printer,
  Download,
  ArrowLeft,
  ArrowRight,
  Info,
  Eye,
  EyeOff,
} from "lucide-react";

interface CheckoutSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PaymentMethod {
  id: string;
  type:
    | "card"
    | "insurance"
    | "fsa"
    | "hsa"
    | "paypal"
    | "apple_pay"
    | "google_pay";
  name: string;
  icon: React.ReactNode;
  description: string;
  enabled: boolean;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  instructions?: string;
}

interface BillingAddress extends ShippingAddress {
  sameAsShipping: boolean;
}

interface InsuranceInfo {
  provider: string;
  memberId: string;
  groupNumber: string;
  planType: string;
  copay: number;
  deductible: number;
  coveragePercent: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status:
    | "pending"
    | "processing"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "cancelled";
  items: any[];
  subtotal: number;
  discounts: number;
  shipping: number;
  tax: number;
  insurance: number;
  total: number;
  paymentMethod: string;
  shippingAddress: ShippingAddress;
  billingAddress: BillingAddress;
  estimatedDelivery: string;
  trackingNumber?: string;
  createdAt: string;
}

export function CheckoutSystem({ isOpen, onClose }: CheckoutSystemProps) {
  const { state, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    phone: "",
  });
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    ...shippingAddress,
    sameAsShipping: true,
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [insuranceInfo, setInsuranceInfo] = useState<InsuranceInfo>({
    provider: "",
    memberId: "",
    groupNumber: "",
    planType: "",
    copay: 0,
    deductible: 0,
    coveragePercent: 80,
  });
  const [cardInfo, setCardInfo] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [showCvv, setShowCvv] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);

  const paymentMethods: PaymentMethod[] = [
    {
      id: "card",
      type: "card",
      name: "Credit/Debit Card",
      icon: <CreditCard className="w-5 h-5" />,
      description: "Visa, MasterCard, American Express",
      enabled: true,
    },
    {
      id: "insurance",
      type: "insurance",
      name: "Insurance",
      icon: <Shield className="w-5 h-5" />,
      description: "Use your health insurance coverage",
      enabled: true,
    },
    {
      id: "fsa",
      type: "fsa",
      name: "FSA/HSA",
      icon: <Building className="w-5 h-5" />,
      description: "Flexible Spending Account",
      enabled: true,
    },
    {
      id: "paypal",
      type: "paypal",
      name: "PayPal",
      icon: <DollarSign className="w-5 h-5" />,
      description: "Pay with your PayPal account",
      enabled: true,
    },
  ];

  const steps = [
    { id: 1, name: "Shipping", description: "Enter delivery information" },
    { id: 2, name: "Payment", description: "Choose payment method" },
    { id: 3, name: "Review", description: "Confirm your order" },
    { id: 4, name: "Complete", description: "Order confirmation" },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const handleAddressChange = (
    field: string,
    value: string,
    addressType: "shipping" | "billing",
  ) => {
    if (addressType === "shipping") {
      setShippingAddress((prev) => ({ ...prev, [field]: value }));
      if (billingAddress.sameAsShipping) {
        setBillingAddress((prev) => ({ ...prev, [field]: value }));
      }
    } else {
      setBillingAddress((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSameAsShippingChange = (checked: boolean) => {
    setBillingAddress((prev) => ({
      ...prev,
      sameAsShipping: checked,
      ...(checked ? shippingAddress : {}),
    }));
  };

  const handlePromoCodeApply = () => {
    // Simulate promo code validation
    if (promoCode.toUpperCase() === "SAVE10") {
      setAppliedPromo("SAVE10 - 10% off your order");
    } else if (promoCode.toUpperCase() === "FREESHIP") {
      setAppliedPromo("FREESHIP - Free shipping");
    } else {
      alert("Invalid promo code");
    }
  };

  const processOrder = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const order: Order = {
      id: `order_${Date.now()}`,
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      status: "confirmed",
      items: state.items,
      subtotal: state.summary.subtotal,
      discounts: state.summary.discounts,
      shipping: state.summary.shipping,
      tax: state.summary.tax,
      insurance: state.summary.insurance,
      total: state.summary.finalTotal,
      paymentMethod: selectedPaymentMethod,
      shippingAddress,
      billingAddress,
      estimatedDelivery: state.summary.estimatedDelivery,
      trackingNumber: `TRK${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
    };

    setCompletedOrder(order);
    setIsProcessing(false);
    setOrderComplete(true);
    setCurrentStep(4);
    clearCart();
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return (
          shippingAddress.firstName &&
          shippingAddress.lastName &&
          shippingAddress.street &&
          shippingAddress.city &&
          shippingAddress.state &&
          shippingAddress.zipCode
        );
      case 2:
        if (selectedPaymentMethod === "card") {
          return (
            cardInfo.number && cardInfo.expiry && cardInfo.cvv && cardInfo.name
          );
        }
        if (selectedPaymentMethod === "insurance") {
          return insuranceInfo.provider && insuranceInfo.memberId;
        }
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              currentStep >= step.id
                ? "bg-green-600 border-green-600 text-white"
                : "border-gray-300 text-gray-300"
            }`}
          >
            {currentStep > step.id ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <span className="text-sm font-medium">{step.id}</span>
            )}
          </div>
          <div className="ml-3">
            <p
              className={`text-sm font-medium ${
                currentStep >= step.id
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-400"
              }`}
            >
              {step.name}
            </p>
            <p className="text-xs text-gray-500">{step.description}</p>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`hidden md:block w-16 h-0.5 mx-4 ${
                currentStep > step.id ? "bg-green-600" : "bg-gray-300"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const ShippingStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={shippingAddress.firstName}
                onChange={(e) =>
                  handleAddressChange("firstName", e.target.value, "shipping")
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={shippingAddress.lastName}
                onChange={(e) =>
                  handleAddressChange("lastName", e.target.value, "shipping")
                }
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="company">Company (Optional)</Label>
            <Input
              id="company"
              value={shippingAddress.company}
              onChange={(e) =>
                handleAddressChange("company", e.target.value, "shipping")
              }
            />
          </div>

          <div>
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              value={shippingAddress.street}
              onChange={(e) =>
                handleAddressChange("street", e.target.value, "shipping")
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="apartment">Apartment/Suite (Optional)</Label>
            <Input
              id="apartment"
              value={shippingAddress.apartment}
              onChange={(e) =>
                handleAddressChange("apartment", e.target.value, "shipping")
              }
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={shippingAddress.city}
                onChange={(e) =>
                  handleAddressChange("city", e.target.value, "shipping")
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Select
                value={shippingAddress.state}
                onValueChange={(value) =>
                  handleAddressChange("state", value, "shipping")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CA">California</SelectItem>
                  <SelectItem value="NY">New York</SelectItem>
                  <SelectItem value="TX">Texas</SelectItem>
                  <SelectItem value="FL">Florida</SelectItem>
                  <SelectItem value="IL">Illinois</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                value={shippingAddress.zipCode}
                onChange={(e) =>
                  handleAddressChange("zipCode", e.target.value, "shipping")
                }
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={shippingAddress.phone}
              onChange={(e) =>
                handleAddressChange("phone", e.target.value, "shipping")
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="instructions">
              Delivery Instructions (Optional)
            </Label>
            <Textarea
              id="instructions"
              value={shippingAddress.instructions}
              onChange={(e) =>
                handleAddressChange("instructions", e.target.value, "shipping")
              }
              rows={3}
              placeholder="Leave package at front door, ring doorbell, etc."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Options</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup defaultValue="standard" className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="standard" id="standard" />
                <div>
                  <Label htmlFor="standard" className="font-medium">
                    Standard Delivery
                  </Label>
                  <p className="text-sm text-gray-600">3-5 business days</p>
                </div>
              </div>
              <span className="font-medium">FREE</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="express" id="express" />
                <div>
                  <Label htmlFor="express" className="font-medium">
                    Express Delivery
                  </Label>
                  <p className="text-sm text-gray-600">1-2 business days</p>
                </div>
              </div>
              <span className="font-medium">$15.99</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="overnight" id="overnight" />
                <div>
                  <Label htmlFor="overnight" className="font-medium">
                    Overnight Delivery
                  </Label>
                  <p className="text-sm text-gray-600">Next business day</p>
                </div>
              </div>
              <span className="font-medium">$25.99</span>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );

  const PaymentStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedPaymentMethod === method.id
                    ? "border-green-600 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedPaymentMethod(method.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 ${
                        selectedPaymentMethod === method.id
                          ? "border-green-600 bg-green-600"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedPaymentMethod === method.id && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                      )}
                    </div>
                    {method.icon}
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-gray-600">
                        {method.description}
                      </p>
                    </div>
                  </div>
                  {method.enabled && (
                    <Badge className="bg-green-100 text-green-800">
                      Available
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Details based on selected method */}
      {selectedPaymentMethod === "card" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Credit Card Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cardName">Cardholder Name *</Label>
              <Input
                id="cardName"
                value={cardInfo.name}
                onChange={(e) =>
                  setCardInfo((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <Label htmlFor="cardNumber">Card Number *</Label>
              <Input
                id="cardNumber"
                value={cardInfo.number}
                onChange={(e) =>
                  setCardInfo((prev) => ({ ...prev, number: e.target.value }))
                }
                placeholder="1234 5678 9012 3456"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Expiry Date *</Label>
                <Input
                  id="expiry"
                  value={cardInfo.expiry}
                  onChange={(e) =>
                    setCardInfo((prev) => ({ ...prev, expiry: e.target.value }))
                  }
                  placeholder="MM/YY"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV *</Label>
                <div className="relative">
                  <Input
                    id="cvv"
                    type={showCvv ? "text" : "password"}
                    value={cardInfo.cvv}
                    onChange={(e) =>
                      setCardInfo((prev) => ({ ...prev, cvv: e.target.value }))
                    }
                    placeholder="123"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCvv(!showCvv)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showCvv ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedPaymentMethod === "insurance" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Insurance Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="provider">Insurance Provider *</Label>
              <Select
                value={insuranceInfo.provider}
                onValueChange={(value) =>
                  setInsuranceInfo((prev) => ({ ...prev, provider: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your insurance provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aetna">Aetna</SelectItem>
                  <SelectItem value="bcbs">Blue Cross Blue Shield</SelectItem>
                  <SelectItem value="cigna">Cigna</SelectItem>
                  <SelectItem value="humana">Humana</SelectItem>
                  <SelectItem value="unitedhealth">UnitedHealth</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="memberId">Member ID *</Label>
              <Input
                id="memberId"
                value={insuranceInfo.memberId}
                onChange={(e) =>
                  setInsuranceInfo((prev) => ({
                    ...prev,
                    memberId: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="groupNumber">Group Number</Label>
              <Input
                id="groupNumber"
                value={insuranceInfo.groupNumber}
                onChange={(e) =>
                  setInsuranceInfo((prev) => ({
                    ...prev,
                    groupNumber: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="planType">Plan Type</Label>
              <Select
                value={insuranceInfo.planType}
                onValueChange={(value) =>
                  setInsuranceInfo((prev) => ({ ...prev, planType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select plan type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hmo">HMO</SelectItem>
                  <SelectItem value="ppo">PPO</SelectItem>
                  <SelectItem value="epo">EPO</SelectItem>
                  <SelectItem value="pos">POS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Address */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sameAsShipping"
              checked={billingAddress.sameAsShipping}
              onCheckedChange={handleSameAsShippingChange}
            />
            <Label htmlFor="sameAsShipping">Same as shipping address</Label>
          </div>

          {!billingAddress.sameAsShipping && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="billFirstName">First Name *</Label>
                  <Input
                    id="billFirstName"
                    value={billingAddress.firstName}
                    onChange={(e) =>
                      handleAddressChange(
                        "firstName",
                        e.target.value,
                        "billing",
                      )
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="billLastName">Last Name *</Label>
                  <Input
                    id="billLastName"
                    value={billingAddress.lastName}
                    onChange={(e) =>
                      handleAddressChange("lastName", e.target.value, "billing")
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="billStreet">Street Address *</Label>
                <Input
                  id="billStreet"
                  value={billingAddress.street}
                  onChange={(e) =>
                    handleAddressChange("street", e.target.value, "billing")
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="billApartment">
                  Apartment/Suite (Optional)
                </Label>
                <Input
                  id="billApartment"
                  value={billingAddress.apartment}
                  onChange={(e) =>
                    handleAddressChange("apartment", e.target.value, "billing")
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="billCity">City *</Label>
                  <Input
                    id="billCity"
                    value={billingAddress.city}
                    onChange={(e) =>
                      handleAddressChange("city", e.target.value, "billing")
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="billState">State *</Label>
                  <Select
                    value={billingAddress.state}
                    onValueChange={(value) =>
                      handleAddressChange("state", value, "billing")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CA">California</SelectItem>
                      <SelectItem value="NY">New York</SelectItem>
                      <SelectItem value="TX">Texas</SelectItem>
                      <SelectItem value="FL">Florida</SelectItem>
                      <SelectItem value="IL">Illinois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="billZipCode">ZIP Code *</Label>
                  <Input
                    id="billZipCode"
                    value={billingAddress.zipCode}
                    onChange={(e) =>
                      handleAddressChange("zipCode", e.target.value, "billing")
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="billPhone">Phone Number *</Label>
                <Input
                  id="billPhone"
                  type="tel"
                  value={billingAddress.phone}
                  onChange={(e) =>
                    handleAddressChange("phone", e.target.value, "billing")
                  }
                  required
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const ReviewStep = () => (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {state.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-400" />
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
                  {item.savings && item.savings > 0 && (
                    <p className="text-sm text-green-600">
                      Save {formatPrice(item.savings)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Information */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-medium">
              {shippingAddress.firstName} {shippingAddress.lastName}
            </p>
            <p>{shippingAddress.street}</p>
            {shippingAddress.apartment && <p>{shippingAddress.apartment}</p>}
            <p>
              {shippingAddress.city}, {shippingAddress.state}{" "}
              {shippingAddress.zipCode}
            </p>
            <p>{shippingAddress.phone}</p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            {paymentMethods.find((m) => m.id === selectedPaymentMethod)?.icon}
            <div>
              <p className="font-medium">
                {
                  paymentMethods.find((m) => m.id === selectedPaymentMethod)
                    ?.name
                }
              </p>
              {selectedPaymentMethod === "card" && cardInfo.number && (
                <p className="text-sm text-gray-600">
                  •••• •••• •••• {cardInfo.number.slice(-4)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Price Breakdown</CardTitle>
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
              {state.summary.shipping > 0
                ? formatPrice(state.summary.shipping)
                : "FREE"}
            </span>
          </div>
          {state.summary.insurance > 0 && (
            <div className="flex justify-between text-blue-600">
              <span>Insurance Coverage</span>
              <span>-{formatPrice(state.summary.insurance)}</span>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const CompleteStep = () => (
    <div className="text-center space-y-6">
      {isProcessing ? (
        <div className="space-y-4">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h3 className="text-xl font-semibold">Processing your order...</h3>
          <p className="text-gray-600">Please don't close this window</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Order Confirmed!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Thank you for your purchase. Your order has been successfully
              placed.
            </p>
          </div>

          {completedOrder && (
            <Card className="text-left max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Order Number:</span>
                  <span className="font-medium">
                    {completedOrder.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-medium">
                    {formatPrice(completedOrder.total)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Delivery:</span>
                  <span className="font-medium">
                    {completedOrder.estimatedDelivery}
                  </span>
                </div>
                {completedOrder.trackingNumber && (
                  <div className="flex justify-between">
                    <span>Tracking Number:</span>
                    <span className="font-medium">
                      {completedOrder.trackingNumber}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4 justify-center">
            <Button variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={onClose}>Continue Shopping</Button>
          </div>
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Secure Checkout
          </DialogTitle>
          <DialogDescription>
            Complete your order securely with our encrypted checkout system
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1">
          <div className="p-6">
            <StepIndicator />

            {currentStep === 1 && <ShippingStep />}
            {currentStep === 2 && <PaymentStep />}
            {currentStep === 3 && <ReviewStep />}
            {currentStep === 4 && <CompleteStep />}
          </div>
        </div>

        {currentStep < 4 && !isProcessing && (
          <DialogFooter className="border-t pt-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep((prev) => prev - 1)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                )}
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  Total: {formatPrice(state.summary.finalTotal)}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                {currentStep < 3 ? (
                  <Button
                    onClick={() => setCurrentStep((prev) => prev + 1)}
                    disabled={!validateStep(currentStep)}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={processOrder}
                    disabled={!validateStep(currentStep)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Place Order
                    <Lock className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
