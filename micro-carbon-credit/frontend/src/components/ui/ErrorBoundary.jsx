import React from 'react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center text-white p-8">
          <div className="text-center max-w-md">
            <div className="text-7xl mb-6">⚡</div>
            <h1 className="text-3xl font-black mb-3">Something went wrong</h1>
            <p className="text-gray-400 mb-8">An unexpected error occurred. Our team has been notified.</p>
            <Link to="/" onClick={() => this.setState({ hasError: false })}
              className="px-8 py-3 bg-[#00FF88] text-black font-bold rounded-xl hover:opacity-90 transition-all inline-block">
              Go Home
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
