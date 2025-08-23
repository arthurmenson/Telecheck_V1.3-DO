import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Construction,
  ArrowLeft,
  MessageCircle,
  Zap,
  Brain,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features?: string[];
}

export function PlaceholderPage({ title, description, icon, features = [] }: PlaceholderPageProps) {
  return (
    <div className="min-h-screen aurora-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="text-center">
          {/* Animated background elements */}
          <div className="absolute top-20 left-4 w-32 h-32 sm:w-48 sm:h-48 bg-primary/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-4 w-24 h-24 sm:w-36 sm:h-36 bg-primary/10 rounded-full blur-2xl animate-pulse delay-1000"></div>

          <Card className="relative glass-morphism border border-border/20 shadow-2xl backdrop-blur-xl overflow-hidden">
            <CardHeader className="text-center pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg hover-lift">
                <div className="scale-75 sm:scale-100">
                  {icon}
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
                {title}
              </CardTitle>
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2 sm:px-4">
                {description}
              </p>
              <Badge className="mt-4 sm:mt-6 gradient-bg text-white border-0 shadow-lg shadow-primary/25 px-4 py-2">
                <Construction className="w-3 h-3 mr-2" />
                Coming Soon
              </Badge>
            </CardHeader>

            <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
              {features.length > 0 && (
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-6">Planned Features:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 sm:p-4 glass-morphism rounded-xl hover-lift border border-border/10">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-muted-foreground text-sm sm:text-base leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="glass-morphism p-4 sm:p-6 lg:p-8 rounded-2xl border border-primary/20 bg-primary/5">
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4 sm:mb-6">
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  <span className="font-semibold text-foreground text-base sm:text-lg text-center sm:text-left">AI-Powered Development</span>
                </div>
                <p className="text-muted-foreground text-center mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed px-2 sm:px-4">
                  This feature is currently being built with advanced AI capabilities.
                  Continue the conversation to help us prioritize and develop this page.
                </p>
                <div className="flex justify-center">
                  <Button className="gradient-bg hover:shadow-lg hover:shadow-primary/25 text-white border-0 hover-lift px-4 sm:px-6 py-2 sm:py-3">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm sm:text-base">Continue Building This Page</span>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 sm:pt-6">
                <Button variant="outline" asChild className="glass-morphism hover:shadow-md hover-lift border-border/20 w-full sm:w-auto">
                  <Link to="/" className="flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    <span className="text-sm sm:text-base">Back to Home</span>
                  </Link>
                </Button>
                <Button asChild className="gradient-bg hover:shadow-lg hover:shadow-primary/25 text-white border-0 hover-lift w-full sm:w-auto">
                  <Link to="/labs" className="flex items-center justify-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    <span className="text-sm sm:text-base">Try Labs Dashboard</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
