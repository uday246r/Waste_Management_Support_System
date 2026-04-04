import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to the console with proper reason
    console.error("ErrorBoundary caught a React rendering error:", error);
    console.error("Component Stack Trace:", errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
          <div className="max-w-3xl bg-gray-800 border border-gray-700 shadow-2xl rounded-lg p-8 w-full">
            <div className="flex items-center space-x-3 text-red-500 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h1 className="text-3xl font-bold">App Crashed</h1>
            </div>
            
            <p className="text-gray-300 mb-6 text-lg">
              The application encountered an unexpected error and could not load this page. The detailed error has been logged to the console.
            </p>

            <div className="bg-gray-950 p-4 rounded-md overflow-x-auto text-sm font-mono text-red-400 mb-6 border border-red-900/50">
              <div className="font-semibold text-red-500 mb-2">Error Message:</div>
              {this.state.error && this.state.error.toString()}
            </div>

            <details className="mb-6 group">
              <summary className="cursor-pointer text-teal-400 font-medium select-none flex items-center">
                <span className="mr-2">▶</span> View Component Stack Trace
              </summary>
              <div className="mt-4 bg-gray-950 p-4 rounded-md overflow-x-auto text-xs font-mono text-gray-400 whitespace-pre border border-gray-800">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </div>
            </details>

            <button 
              onClick={() => window.location.reload()} 
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-3 rounded-lg transition duration-200 w-full md:w-auto text-center"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
