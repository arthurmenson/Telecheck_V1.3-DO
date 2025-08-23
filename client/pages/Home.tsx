import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Activity,
  ArrowRight,
  CheckCircle,
  TestTube,
  Pill,
  Brain,
  ShoppingCart,
  Dna,
  Heart,
  Shield,
  Zap,
  Clock,
  Star,
  PlayCircle,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export function Home() {
  const features = [
    {
      icon: TestTube,
      title: 'AI Lab Interpretation',
      description: 'Upload lab reports and get instant AI-powered analysis with color-coded ranges and personalized insights.',
      color: 'bg-blue-500'
    },
    {
      icon: Pill,
      title: 'Medication Safety',
      description: 'Real-time drug interaction checking with PGx-aware alerts for safer medication management.',
      color: 'bg-green-500'
    },
    {
      icon: Brain,
      title: 'AI Medical Insights',
      description: 'Get comprehensive health summaries with risk stratification and personalized recommendations.',
      color: 'bg-purple-500'
    },
    {
      icon: ShoppingCart,
      title: 'Integrated Pharmacy',
      description: 'Seamless prescription fulfillment with discreet packaging and auto-refill options.',
      color: 'bg-orange-500'
    },
    {
      icon: Dna,
      title: 'PGx Integration',
      description: 'Pharmacogenomic testing integration for personalized medication dosing and selection.',
      color: 'bg-pink-500'
    },
    {
      icon: Heart,
      title: 'Wearable Integration',
      description: 'Connect your devices for continuous health monitoring with DFPAS stasis scoring.',
      color: 'bg-red-500'
    }
  ];

  const testimonials = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Primary Care Physician',
      content: 'Telecheck has revolutionized how I interpret lab results. The AI insights save me hours and help me provide better patient care.',
      rating: 5
    },
    {
      name: 'Michael Rodriguez',
      role: 'Patient',
      content: 'Finally, a platform that makes my health data understandable. The medication interaction alerts are a game-changer.',
      rating: 5
    },
    {
      name: 'Dr. Emily Johnson',
      role: 'Cardiologist',
      content: 'The PGx integration and wearable data correlation provide insights I\'ve never had access to before.',
      rating: 5
    }
  ];

  const stats = [
    { value: '250K+', label: 'Lab Reports Analyzed' },
    { value: '98%', label: 'Accuracy Rate' },
    { value: '15min', label: 'Average Response Time' },
    { value: '24/7', label: 'AI Availability' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden aurora-bg py-24 sm:py-32 lg:py-40">
        <div className="absolute inset-0 bg-grid-slate-100/20 dark:bg-grid-slate-700/20 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,black,rgba(0,0,0,0.6))]" />
        <div className="absolute top-10 left-10 w-80 h-80 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-primary/10 to-primary/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-transparent rounded-full blur-3xl animate-pulse delay-500"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            <div className="lg:col-span-6">
              <div className="mb-8">
                <Badge className="mb-6 gradient-bg text-white border-0 shadow-lg shadow-primary/25 hover-lift">
                  <Zap className="w-3 h-3 mr-1" />
                  AI-Powered Healthcare
                </Badge>
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-[1.1]">
                  AI-Powered Healthcare.{' '}
                  <span className="bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent">
                    Made Simple.
                  </span>
                </h1>
                <p className="mt-8 text-xl leading-relaxed text-muted-foreground max-w-2xl">
                  Revolutionary telehealth platform combining advanced AI with personalized care.
                  Get instant lab analysis, medication safety checks, and expert medical insights—all in one secure platform.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button size="lg" className="gradient-bg hover:shadow-2xl hover:shadow-primary/30 text-white border-0 px-10 py-5 text-lg font-semibold hover-lift group" asChild>
                  <Link to="/register">
                    <Activity className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                    Start Free Consultation
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="glass-morphism hover:shadow-xl px-10 py-5 text-lg font-semibold hover-lift border-primary/30 group">
                  <Link to="/how-it-works" className="flex items-center">
                    <PlayCircle className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                    How It Works
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center space-x-3 glass-morphism p-5 rounded-2xl hover-lift group">
                  <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-foreground font-semibold">HIPAA Compliant</span>
                </div>
                <div className="flex items-center space-x-3 glass-morphism p-5 rounded-2xl hover-lift group">
                  <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-foreground font-semibold">Bank-level Security</span>
                </div>
                <div className="flex items-center space-x-3 glass-morphism p-5 rounded-2xl hover-lift group">
                  <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                    <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-foreground font-semibold">24/7 AI Support</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 mt-16 lg:mt-0">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl blur-2xl"></div>
                <div className="relative glass-morphism rounded-2xl shadow-2xl overflow-hidden border border-border/20 backdrop-blur-xl">
                  {/* Compact Header */}
                  <div className="px-6 py-3 border-b border-border/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                        <Brain className="w-3 h-3 text-white" />
                      </div>
                      <span className="font-bold text-foreground">AI Lab Analysis</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Live
                    </Badge>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Unique AI Insights Panel */}
                    <div className="relative overflow-hidden">
                      {/* Animated AI Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-cyan-400/20 to-blue-600/20 rounded-full blur-xl animate-bounce"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-violet-400/20 to-purple-600/20 rounded-full blur-lg animate-pulse delay-500"></div>

                      <div className="relative border border-violet-200/30 dark:border-violet-700/30 rounded-xl p-4 backdrop-blur-sm bg-gradient-to-br from-violet-50/80 via-indigo-50/60 to-cyan-50/80 dark:from-violet-950/40 dark:via-indigo-950/30 dark:to-cyan-950/40">
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Sparkles className="w-4 h-4 text-white animate-pulse" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full animate-ping"></div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-sm font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                AI Clinical Intelligence
                              </h4>
                              <div className="flex items-center gap-1">
                                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                                <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                                <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse delay-300"></div>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                              🎯 <span className="font-medium text-emerald-600">Excellent glucose control</span> detected
                              <br />
                              ⚠️ Cholesterol optimization recommended
                              <br />
                              💚 <span className="font-medium text-green-600">Low cardiovascular risk profile</span>
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700 border-violet-200 text-xs px-2 py-1">
                                99.7% Confidence
                              </Badge>
                              <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200 text-xs px-2 py-1">
                                Real-time Analysis
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Compact Lab Results */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg hover-lift">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-foreground">Glucose</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-green-600">95 mg/dL</span>
                          <div className="text-xs text-green-600/70">Normal</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg hover-lift">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span className="text-sm font-medium text-foreground">Cholesterol</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-amber-600">205 mg/dL</span>
                          <div className="text-xs text-amber-600/70">Borderline</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover-lift">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-medium text-foreground">HDL</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-emerald-600">58 mg/dL</span>
                          <div className="text-xs text-emerald-600/70">Good</div>
                        </div>
                      </div>
                    </div>

                    {/* Compact Risk Summary */}
                    <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-semibold">AI Risk Score</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800 text-xs">Low Risk</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mt-2 text-xs text-center">
                        <div>
                          <div className="font-bold text-green-600">8.2%</div>
                          <div className="text-muted-foreground">CVD</div>
                        </div>
                        <div>
                          <div className="font-bold text-blue-600">94%</div>
                          <div className="text-muted-foreground">Match</div>
                        </div>
                        <div>
                          <div className="font-bold text-purple-600">A+</div>
                          <div className="text-muted-foreground">Grade</div>
                        </div>
                      </div>
                    </div>

                    {/* Compact CTA */}
                    <Button className="w-full gradient-bg hover:shadow-lg text-white border-0 py-3 font-semibold hover-lift group">
                      <Brain className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                      View Complete Analysis
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Trusted by Healthcare Professionals Worldwide</h2>
            <p className="text-muted-foreground">Leading the future of AI-powered healthcare with proven results</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover-lift bg-background/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="mb-6 gradient-bg text-white border-0 shadow-lg px-4 py-2">
              <Brain className="w-4 h-4 mr-2" />
              Powered by Advanced AI
            </Badge>
            <h2 className="text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl mb-6">
              Everything you need for{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                smarter healthcare
              </span>
            </h2>
            <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Comprehensive AI-powered tools that work seamlessly together to provide you with
              the most accurate health insights and personalized care recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover-lift group bg-background/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-foreground sm:text-5xl mb-6">
              Trusted by healthcare professionals{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                worldwide
              </span>
            </h2>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
              See what doctors and patients are saying about their experience with Telecheck's AI-powered platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover-lift group bg-background/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current group-hover:scale-110 transition-transform duration-300" style={{transitionDelay: `${i * 50}ms`}} />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 text-lg leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">{testimonial.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-lg">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground font-medium">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-bg"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
        <div className="absolute top-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl mb-8">
            Ready to transform{' '}
            <span className="text-white/90">
              your healthcare?
            </span>
          </h2>
          <p className="mt-6 text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Join thousands of patients and healthcare professionals using AI-powered insights
            to make better health decisions every day.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl px-10 py-5 text-lg font-semibold hover-lift group" asChild>
              <Link to="/register">
                <Activity className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                Start Free Trial
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-10 py-5 text-lg font-semibold hover-lift group">
              <Link to="/labs" className="flex items-center">
                Schedule Consultation
                <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">Free</div>
              <div className="text-white/80 text-sm">Initial Consultation</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-white/80 text-sm">AI Support Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">100%</div>
              <div className="text-white/80 text-sm">HIPAA Compliant</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-morphism border-t border-border/20 backdrop-blur-xl bg-background/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-foreground mb-6 flex items-center">
                  <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-full mr-3"></div>
                  Platform
                </h3>
              </div>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/labs"
                    className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-primary/30 rounded-full mr-3 group-hover:bg-primary transition-colors"></span>
                    Lab Analysis
                  </Link>
                </li>
                <li>
                  <Link
                    to="/medications"
                    className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-primary/30 rounded-full mr-3 group-hover:bg-primary transition-colors"></span>
                    Medications
                  </Link>
                </li>
                <li>
                  <Link
                    to="/ai-insights"
                    className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-primary/30 rounded-full mr-3 group-hover:bg-primary transition-colors"></span>
                    AI Insights
                  </Link>
                </li>
                <li>
                  <Link
                    to="/wellness"
                    className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-primary/30 rounded-full mr-3 group-hover:bg-primary transition-colors"></span>
                    Wellness
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-foreground mb-6 flex items-center">
                  <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-full mr-3"></div>
                  Company
                </h3>
              </div>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-primary/30 rounded-full mr-3 group-hover:bg-primary transition-colors"></span>
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-primary/30 rounded-full mr-3 group-hover:bg-primary transition-colors"></span>
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-primary/30 rounded-full mr-3 group-hover:bg-primary transition-colors"></span>
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-foreground mb-6 flex items-center">
                  <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-full mr-3"></div>
                  Legal
                </h3>
              </div>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-primary/30 rounded-full mr-3 group-hover:bg-primary transition-colors"></span>
                    Privacy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-primary/30 rounded-full mr-3 group-hover:bg-primary transition-colors"></span>
                    Terms
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-primary/30 rounded-full mr-3 group-hover:bg-primary transition-colors"></span>
                    HIPAA
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-foreground mb-6 flex items-center">
                  <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-full mr-3"></div>
                  Support
                </h3>
              </div>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-primary/30 rounded-full mr-3 group-hover:bg-primary transition-colors"></span>
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-primary/30 rounded-full mr-3 group-hover:bg-primary transition-colors"></span>
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-primary/30 rounded-full mr-3 group-hover:bg-primary transition-colors"></span>
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 lg:mt-16 pt-8 lg:pt-12 border-t border-border/20">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center shadow-lg hover-lift">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    Telecheck
                  </span>
                  <span className="text-sm text-muted-foreground font-medium">
                    AI Healthcare Platform
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">HIPAA Compliant</span>
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-400">SOC 2 Certified</span>
                  </div>
                </div>

                <div className="text-center lg:text-right">
                  <p className="text-muted-foreground text-sm font-medium">
                    © 2024 Telecheck. All rights reserved.
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Empowering healthcare through AI innovation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
