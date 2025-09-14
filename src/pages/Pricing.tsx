import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Zap } from "lucide-react";
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
        "Weekly milestones",
        "Simple checklist",
        "Community support",
        "Basic appointments"
      ],
      icon: <Zap className="w-6 h-6" />,
      color: "text-gray-600"
    },
    {
      name: "Gold",
      price: 4.99,
      period: "month",
      description: "Most popular choice",
      features: [
        "Everything in Free",
        "Advanced analytics",
        "Priority support",
        "Custom reminders",
        "Photo gallery",
        "Export data",
        "Ad-free experience"
      ],
      icon: <Star className="w-6 h-6" />,
      color: "text-yellow-600",
      popular: true
    },
    {
      name: "Deluxe",
      price: 8.99,
      period: "month",
      description: "For the ultimate experience",
      features: [
        "Everything in Gold",
        "Personal coach access",
        "Advanced insights",
        "Partner sharing",
        "Premium content",
        "24/7 support",
        "Early access to features"
      ],
      icon: <Crown className="w-6 h-6" />,
      color: "text-purple-600"
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
        "Weekly milestones",
        "Simple checklist",
        "Community support",
        "Basic appointments"
      ],
      icon: <Zap className="w-6 h-6" />,
      color: "text-gray-600"
    },
    {
      name: "Gold",
      price: 40,
      originalPrice: 59.88,
      period: "year",
      description: "Most popular choice",
      features: [
        "Everything in Free",
        "Advanced analytics",
        "Priority support",
        "Custom reminders",
        "Photo gallery",
        "Export data",
        "Ad-free experience"
      ],
      icon: <Star className="w-6 h-6" />,
      color: "text-yellow-600",
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
        "Personal coach access",
        "Advanced insights",
        "Partner sharing",
        "Premium content",
        "24/7 support",
        "Early access to features"
      ],
      icon: <Crown className="w-6 h-6" />,
      color: "text-purple-600"
    }
  ];

  const currentPricing = isAnnual ? annualPricing : monthlyPricing;

  const handleSelectPlan = (planName: string) => {
    // TODO: Implement payment processing
    console.log(`Selected plan: ${planName} (${isAnnual ? 'Annual' : 'Monthly'})`);
    // For now, just show an alert
    alert(`You selected ${planName} plan! Payment integration coming soon.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 mr-64 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center py-8 lg:py-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8">
            Select the perfect plan for your pregnancy journey
          </p>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-lg font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-lg font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Save up to 27%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:gap-12 grid-cols-1 md:grid-cols-3">
          {currentPricing.map((tier, index) => (
            <Card
              key={tier.name}
              className={`relative bg-white shadow-lg border-0 transition-all duration-300 hover:scale-105 ${
                tier.popular ? 'ring-2 ring-primary ring-opacity-50' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white px-4 py-1 text-sm font-medium">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto mb-4 ${tier.color}`}>
                  {tier.icon}
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {tier.name}
                </CardTitle>
                <p className="text-gray-600 mt-2">{tier.description}</p>
              </CardHeader>

              <CardContent className="text-center">
                <div className="mb-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      £{tier.price}
                    </span>
                    <span className="text-lg text-gray-500 ml-1">
                      /{tier.period}
                    </span>
                  </div>
                  {tier.originalPrice && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-500 line-through">
                        £{tier.originalPrice}
                      </span>
                      <span className="text-sm text-green-600 font-medium ml-2">
                        Save £{(tier.originalPrice - tier.price).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleSelectPlan(tier.name)}
                  className={`w-full mb-6 ${
                    tier.popular
                      ? 'bg-primary hover:bg-primary/90'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  size="lg"
                >
                  {tier.name === 'Free' ? 'Get Started' : 'Choose Plan'}
                </Button>

                <ul className="space-y-3 text-left">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
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
