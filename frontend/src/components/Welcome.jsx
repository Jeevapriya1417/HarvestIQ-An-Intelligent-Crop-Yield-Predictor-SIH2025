import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Brain, 
  Database, 
  TrendingUp, 
  Leaf, 
  Users, 
  Award,
  BarChart3,
  Globe,
  ChevronDown
} from 'lucide-react';
import { useInView } from 'react-intersection-observer';

const Welcome = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [heroRef, heroInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [featuresRef, featuresInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [statsRef, statsInView] = useInView({ threshold: 0.1, triggerOnce: true });

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const scrollToFeatures = () => {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      icon: Brain,
      title: t('welcome.features.aiPowered'),
      description: t('welcome.features.aiDescription'),
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      icon: Database,
      title: t('welcome.features.dataIntegration'),
      description: t('welcome.features.dataDescription'),
      gradient: 'from-green-500 to-teal-600'
    },
    {
      icon: TrendingUp,
      title: t('welcome.features.realTime'),
      description: t('welcome.features.realTimeDescription'),
      gradient: 'from-orange-500 to-red-600'
    }
  ];

  const stats = [
    { icon: Users, value: '10,000+', label: 'Active Farmers' },
    { icon: Leaf, value: '500K+', label: 'Acres Analyzed' },
    { icon: Award, value: '95%', label: 'Accuracy Rate' },
    { icon: BarChart3, value: '25%', label: 'Yield Increase' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-green-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-gray-900 dark:text-white">HarvestIQ</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">Features</a>
              <a href="#about" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">About</a>
              <a href="#contact" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">Contact</a>
              <button
                onClick={handleGetStarted}
                className="bg-gradient-primary text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
              >
                {t('welcome.getStarted')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className={`transform transition-all duration-1000 ${heroInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900 rounded-full text-green-800 dark:text-green-200 text-sm font-medium mb-8">
                <Globe className="h-4 w-4 mr-2" />
                Smart India Hackathon 2025
              </div>
              
              <h1 className="text-5xl md:text-7xl font-display font-bold text-gray-900 dark:text-white mb-6">
                <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                  {t('welcome.title')}
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-4xl mx-auto leading-relaxed">
                {t('welcome.subtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleGetStarted}
                  className="group bg-gradient-primary text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold text-lg flex items-center"
                >
                  {t('welcome.getStarted')}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={scrollToFeatures}
                  className="px-8 py-4 rounded-xl border-2 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/50 transition-all duration-300 font-semibold text-lg flex items-center"
                >
                  {t('welcome.learnMore')}
                  <ChevronDown className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Hero Illustration */}
          <div className={`mt-20 transform transition-all duration-1000 delay-500 ${heroInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="relative max-w-4xl mx-auto">
              <div className="glass rounded-3xl p-8 bg-white/20 dark:bg-gray-800/30">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 rounded-xl bg-white/50 dark:bg-gray-700/50">
                    <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">AI Predictions</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Advanced ML algorithms</p>
                  </div>
                  <div className="text-center p-6 rounded-xl bg-white/50 dark:bg-gray-700/50">
                    <Database className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Gov Data</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Real-time integration</p>
                  </div>
                  <div className="text-center p-6 rounded-xl bg-white/50 dark:bg-gray-700/50">
                    <TrendingUp className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Analytics</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Actionable insights</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-6">
              Powerful Features for Modern Agriculture
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Leverage cutting-edge technology to optimize your farming practices and maximize yields
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`transform transition-all duration-700 delay-${index * 200} ${
                    featuresInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                >
                  <div className="group p-8 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 border border-gray-100 dark:border-gray-600 hover:shadow-xl transition-all duration-300 h-full">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-display font-semibold text-gray-900 dark:text-white mb-4">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-gradient-to-r from-green-600 to-green-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Trusted by Farmers Across India
            </h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Join thousands of farmers who have already improved their yields with HarvestIQ
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={`text-center transform transition-all duration-700 delay-${index * 100} ${
                    statsInView ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                >
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl font-display font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-green-100">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-6">
            Ready to Transform Your Farming?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10">
            Join the agricultural revolution and start making data-driven decisions today
          </p>
          
          <button
            onClick={handleGetStarted}
            className="group bg-gradient-primary text-white px-10 py-5 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold text-xl flex items-center mx-auto"
          >
            Get Started for Free
            <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold">HarvestIQ</span>
            </div>
            
            <p className="text-gray-400 dark:text-gray-500 mb-6">
              Empowering farmers with AI-driven insights for sustainable agriculture
            </p>
            
            <div className="text-sm text-gray-500 dark:text-gray-600">
              © 2025 HarvestIQ. Built for Smart India Hackathon 2025.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;