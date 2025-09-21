import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Pill,
  ShoppingCart,
  Star,
  Filter,
  Search,
  Heart,
  Info,
  Zap,
  Shield,
  Clock,
  Truck,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Eye,
} from "lucide-react";

interface Medication {
  id: string;
  name: string;
  brand: string;
  genericName: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  strength: string;
  form: string;
  prescription: boolean;
  requiresConsultation: boolean;
  rating: number;
  reviews: number;
  inStock: boolean;
  fastDelivery: boolean;
  discount?: number;
  tags: string[];
  sideEffects: string[];
  uses: string[];
  image?: string;
}

interface MedicationCatalogProps {
  onSelectMedication: (medication: Medication) => void;
}

export function MedicationCatalog({
  onSelectMedication,
}: MedicationCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showPrescriptionOnly, setShowPrescriptionOnly] = useState(false);

  const medications: Medication[] = [
    {
      id: "med1",
      name: "Lisinopril",
      brand: "Prinivil",
      genericName: "Lisinopril",
      description: "ACE inhibitor for high blood pressure and heart failure",
      price: 15.99,
      originalPrice: 25.99,
      category: "Cardiovascular",
      strength: "10mg",
      form: "Tablet",
      prescription: true,
      requiresConsultation: true,
      rating: 4.5,
      reviews: 1234,
      inStock: true,
      fastDelivery: true,
      discount: 38,
      tags: ["Blood Pressure", "Heart Health", "ACE Inhibitor"],
      sideEffects: ["Dry cough", "Dizziness", "Fatigue"],
      uses: ["High blood pressure", "Heart failure", "Post-heart attack"],
    },
    {
      id: "med2",
      name: "Metformin",
      brand: "Glucophage",
      genericName: "Metformin HCl",
      description: "First-line treatment for type 2 diabetes",
      price: 12.5,
      originalPrice: 18.5,
      category: "Diabetes",
      strength: "500mg",
      form: "Extended-Release Tablet",
      prescription: true,
      requiresConsultation: true,
      rating: 4.3,
      reviews: 987,
      inStock: true,
      fastDelivery: true,
      discount: 32,
      tags: ["Diabetes", "Blood Sugar", "Metformin"],
      sideEffects: ["Nausea", "Diarrhea", "Stomach upset"],
      uses: ["Type 2 diabetes", "Prediabetes", "PCOS"],
    },
    {
      id: "med3",
      name: "Atorvastatin",
      brand: "Lipitor",
      genericName: "Atorvastatin Calcium",
      description: "Statin medication to lower cholesterol",
      price: 22.75,
      originalPrice: 35.0,
      category: "Cardiovascular",
      strength: "20mg",
      form: "Tablet",
      prescription: true,
      requiresConsultation: true,
      rating: 4.6,
      reviews: 2156,
      inStock: true,
      fastDelivery: false,
      discount: 35,
      tags: ["Cholesterol", "Heart Health", "Statin"],
      sideEffects: ["Muscle pain", "Digestive issues", "Headache"],
      uses: [
        "High cholesterol",
        "Heart disease prevention",
        "Stroke prevention",
      ],
    },
    {
      id: "med4",
      name: "Ibuprofen",
      brand: "Advil",
      genericName: "Ibuprofen",
      description: "Non-prescription pain reliever and anti-inflammatory",
      price: 8.99,
      category: "Pain Relief",
      strength: "200mg",
      form: "Tablet",
      prescription: false,
      requiresConsultation: false,
      rating: 4.4,
      reviews: 3421,
      inStock: true,
      fastDelivery: true,
      tags: ["Pain Relief", "Anti-inflammatory", "OTC"],
      sideEffects: ["Stomach irritation", "Heartburn", "Dizziness"],
      uses: ["Pain relief", "Fever reduction", "Inflammation"],
    },
    {
      id: "med5",
      name: "Levothyroxine",
      brand: "Synthroid",
      genericName: "Levothyroxine Sodium",
      description: "Thyroid hormone replacement therapy",
      price: 18.25,
      originalPrice: 28.0,
      category: "Endocrine",
      strength: "75mcg",
      form: "Tablet",
      prescription: true,
      requiresConsultation: true,
      rating: 4.2,
      reviews: 756,
      inStock: true,
      fastDelivery: true,
      discount: 35,
      tags: ["Thyroid", "Hormone", "Hypothyroid"],
      sideEffects: ["Heart palpitations", "Insomnia", "Sweating"],
      uses: ["Hypothyroidism", "Thyroid cancer", "Goiter"],
    },
    {
      id: "med6",
      name: "Omeprazole",
      brand: "Prilosec",
      genericName: "Omeprazole",
      description: "Proton pump inhibitor for acid reflux",
      price: 14.5,
      category: "Gastrointestinal",
      strength: "20mg",
      form: "Delayed-Release Capsule",
      prescription: false,
      requiresConsultation: false,
      rating: 4.3,
      reviews: 1876,
      inStock: true,
      fastDelivery: true,
      tags: ["Acid Reflux", "GERD", "PPI", "OTC"],
      sideEffects: ["Headache", "Nausea", "Abdominal pain"],
      uses: ["GERD", "Peptic ulcers", "Heartburn"],
    },
  ];

  const categories = [
    "all",
    "Cardiovascular",
    "Diabetes",
    "Pain Relief",
    "Endocrine",
    "Gastrointestinal",
  ];

  const filteredMedications = medications
    .filter((med) => {
      const matchesSearch =
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase()),
        );

      const matchesCategory =
        selectedCategory === "all" || med.category === selectedCategory;
      const matchesPrescription = !showPrescriptionOnly || med.prescription;

      return matchesSearch && matchesCategory && matchesPrescription;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="glass-morphism border border-border/20">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search medications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>

              <Button
                variant={showPrescriptionOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowPrescriptionOnly(!showPrescriptionOnly)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Rx Only
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medication Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedications.map((medication) => (
          <Card
            key={medication.id}
            className="glass-morphism border border-border/20 hover-lift cursor-pointer group"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <CardTitle className="text-lg font-bold text-foreground">
                      {medication.name}
                    </CardTitle>
                    {medication.prescription && (
                      <Badge variant="outline" className="text-xs">
                        Rx
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {medication.brand} • {medication.strength} •{" "}
                    {medication.form}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {medication.genericName}
                  </p>
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">
                      {medication.rating}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({medication.reviews})
                    </span>
                  </div>
                  {!medication.inStock && (
                    <Badge variant="destructive" className="text-xs">
                      Out of Stock
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {medication.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {medication.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Features */}
              <div className="flex items-center space-x-3 mb-4 text-xs">
                {medication.fastDelivery && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Truck className="w-3 h-3" />
                    <span>Fast Delivery</span>
                  </div>
                )}
                {medication.discount && (
                  <div className="flex items-center space-x-1 text-orange-600">
                    <Sparkles className="w-3 h-3" />
                    <span>{medication.discount}% Off</span>
                  </div>
                )}
                {medication.requiresConsultation && (
                  <div className="flex items-center space-x-1 text-blue-600">
                    <Shield className="w-3 h-3" />
                    <span>AI Consult</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-foreground">
                      ${medication.price}
                    </span>
                    {medication.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${medication.originalPrice}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    per month supply
                  </p>
                </div>

                {medication.discount && (
                  <Badge className="bg-orange-100 text-orange-800">
                    Save $
                    {(medication.originalPrice! - medication.price).toFixed(2)}
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={() => onSelectMedication(medication)}
                  disabled={!medication.inStock}
                  className="w-full gradient-bg text-white border-0 hover-lift"
                  size="sm"
                >
                  {medication.requiresConsultation ? (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Start Order + AI Consult
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Info className="w-4 h-4 mr-1" />
                    Info
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-1" />
                    Reviews
                  </Button>
                  <Button variant="outline" size="sm">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Quick Info */}
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <div className="text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Common Uses:</span>
                  </div>
                  <p className="text-foreground">
                    {medication.uses.slice(0, 2).join(", ")}
                    {medication.uses.length > 2 && "..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMedications.length === 0 && (
        <Card className="glass-morphism border border-border/20">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No medications found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
