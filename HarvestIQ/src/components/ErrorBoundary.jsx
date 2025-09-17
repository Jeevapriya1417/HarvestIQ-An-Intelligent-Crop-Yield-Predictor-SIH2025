import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: Math.random().toString(36).substr(2, 9)
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Report to error tracking service (if available)
    if (window.reportError) {
      window.reportError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: Math.random().toString(36).substr(2, 9)
    });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      // Custom error UI
      return (
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-red-100">
              {/* Error Icon */}
              <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              
              {/* Error Message */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Oops! Something went wrong
              </h1>
              
              <p className="text-gray-600 mb-6">
                We encountered an unexpected error. Don't worry, your data is safe. 
                Please try refreshing the page or return to the dashboard.
              </p>
              
              {/* Error ID for support */}
              <div className="bg-gray-50 rounded-lg p-3 mb-6">
                <p className="text-xs text-gray-500 mb-1">Error ID (for support):</p>
                <p className="text-sm font-mono text-gray-700">{this.state.errorId}</p>
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={this.handleRetry}
                  variant="primary"
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Home className="h-4 w-4" />
                  <span>Go to Dashboard</span>
                </Button>
              </div>
              
              {/* Development Error Details */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-6 p-4 bg-red-50 rounded-lg text-left">
                  <details className="text-sm">
                    <summary className="font-medium text-red-800 cursor-pointer mb-2">
                      Error Details (Development Only)
                    </summary>
                    <div className="space-y-2">
                      <div>
                        <p className="font-medium text-red-700">Error:</p>
                        <p className="text-red-600 font-mono text-xs break-all">
                          {this.state.error.toString()}
                        </p>
                      </div>
                      {this.state.errorInfo.componentStack && (
                        <div>
                          <p className="font-medium text-red-700">Component Stack:</p>
                          <pre className="text-red-600 font-mono text-xs whitespace-pre-wrap break-all">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;