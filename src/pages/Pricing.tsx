import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Zap, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PricingTier {
  name: string;
  price: number;
  originalPrice?: number;
  period: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  color: string;
  popular?: boolean;
}

export const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const navigate = useNavigate();

  const monthlyPricing: PricingTier[] = [
    {
      name: "Free",
      price: 0,
      period: "month",
      description: "Perfect for getting started",
      features: [
        "Basic pregnancy tracking",
        "Weekly development updates",
        "Simple checklist",
        "Community support"
      ],
      icon: <Star className="w-6 h-6" />,
      color: "bg-gray-100 text-gray-600"
    },
    {
      name: "Gold",
      price: 4.99,
      period: "month",
      description: "Most popular choice",
      features: [
        "Everything in Free",
        "Advanced health tracking",
        "Personalized recommendations",
        "Priority support",
        "Ad-free experience"
      ],
      icon: <Crown className="w-6 h-6" />,
      color: "bg-yellow-100 text-yellow-600",
      popular: true
    },
    {
      name: "Deluxe",
      price: 8.99,
      period: "month",
      description: "For the ultimate experience",
      features: [
        "Everything in Gold",
        "1-on-1 expert consultations",
        "Custom meal plans",
        "Advanced analytics",
        "Premium content library",
        "24/7 support"
      ],
      icon: <Zap className="w-6 h-6" />,
      color: "bg-purple-100 text-purple-600"
    }
  ];

  const annualPricing: PricingTier[] = [
    {
      name: "Free",
      price: 0,
      period: "year",
      description: "Perfect for getting started",
      features: [
        "Basic pregnancy tracking",
        "Weekly development updates",
        "Simple checklist",
        "Community support"
      ],
      icon: <Star className="w-6 h-6" />,
      color: "bg-gray-100 text-gray-600"
    },
    {
      name: "Gold",
      price: 40,
      originalPrice: 59.88,
      period: "year",
      description: "Most popular choice",
      features: [
        "Everything in Free",
        "Advanced health tracking",
        "Personalized recommendations",
        "Priority support",
        "Ad-free experience"
      ],
      icon: <Crown className="w-6 h-6" />,
      color: "bg-yellow-100 text-yellow-600",
      popular: true
    },
    {
      name: "Deluxe",
      price: 80,
      originalPrice: 107.88,
      period: "year",
      description: "For the ultimate experience",
      features: [
        "Everything in Gold",
        "1-on-1 expert consultations",
        "Custom meal plans",
        "Advanced analytics",
        "Premium content library",
        "24/7 support"
      ],
      icon: <Zap className="w-6 h-6" />,
      color: "bg-purple-100 text-purple-600"
    }
  ];

  const currentPricing = isAnnual ? annualPricing : monthlyPricing;

  const calculateSavings = (tier: PricingTier) => {
    if (!tier.originalPrice) return null;
    const savings = tier.originalPrice - tier.price;
    return savings.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50 md:mr-64 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Title */}
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-6 md:p-8 shadow-sm">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <CreditCard className="w-8 h-8 text-pink-600" />
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                Choose Your Plan
              </h1>
            </div>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Select the perfect plan for your pregnancy journey
            </p>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center">
          <div className="bg-white p-1 rounded-lg border shadow-sm">
            <div className="flex">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  !isAnnual
                    ? "bg-pink-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  isAnnual
                    ? "bg-pink-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Annual
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {currentPricing.map((tier) => (
            <Card
              key={tier.name}
              className={`relative ${
                tier.popular
                  ? "ring-2 ring-pink-500 shadow-lg scale-105"
                  : "shadow-md"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-pink-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-full ${tier.color} flex items-center justify-center`}>
                  {tier.icon}
                </div>
                <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                <p className="text-gray-600">{tier.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">£{tier.price}</span>
                  <span className="text-gray-600">/{tier.period}</span>
                  {tier.originalPrice && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-500 line-through">
                        £{tier.originalPrice}
                      </span>
                      <span className="ml-2 text-sm text-green-600 font-medium">
                        Save £{calculateSavings(tier)}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className={`w-full ${
                    tier.popular
                      ? "bg-pink-600 hover:bg-pink-700"
                      : "bg-gray-600 hover:bg-gray-700"
                  }`}
                  disabled={tier.name === "Free"}
                >
                  {tier.name === "Free" ? "Current Plan" : `Choose ${tier.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            All plans include a 30-day money-back guarantee
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;