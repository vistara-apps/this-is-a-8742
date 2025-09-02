import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { getUserFriendlyErrorMessage } from '../utils/errorHandling';

/**
 * Error Boundary component to catch and display errors in the UI
 * Prevents the entire application from crashing when an error occurs
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // You could also log to an error reporting service like Sentry here
    // if (window.Sentry) {
    //   window.Sentry.captureException(error);
    // }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="gradient-card rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/20 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
            </div>
            
            <p className="text-gray-300 mb-6">
              {getUserFriendlyErrorMessage(this.state.error) || 
                'An unexpected error occurred. Please try refreshing the page.'}
            </p>
            
            {this.props.resetOnError && (
              <button
                onClick={this.handleReset}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            )}
            
            {!this.props.resetOnError && (
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Page
              </button>
            )}
            
            {this.props.showDetails && this.state.errorInfo && (
              <div className="mt-6 p-3 bg-black/30 rounded-lg overflow-auto max-h-40">
                <details>
                  <summary className="text-gray-400 cursor-pointer">Error Details</summary>
                  <pre className="text-xs text-gray-400 mt-2 whitespace-pre-wrap">
                    {this.state.error && this.state.error.toString()}
                    <br />
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;

