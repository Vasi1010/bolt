import { Component } from "react";
import { Link } from "react-router-dom";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-8 text-center hero-fade">
          <div className="flex items-center gap-6 mb-8">
            <div className="h-px w-16 bg-beige dark:bg-dk-border" />
            <span className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase">Error</span>
            <div className="h-px w-16 bg-beige dark:bg-dk-border" />
          </div>
          <h2 className="font-display text-4xl font-light text-charcoal dark:text-dk-text italic mb-3">
            Something went wrong
          </h2>
          <p className="text-muted dark:text-dk-muted text-sm tracking-wide mb-10 max-w-sm">
            {this.props.fallbackMessage ||
              "We encountered an unexpected error. Please try again or return to the home page."}
          </p>
          <div className="flex items-center gap-6">
            <button onClick={this.handleReset} className="btn-dark">
              Try Again
            </button>
            <Link
              to="/"
              onClick={this.handleReset}
              className="text-[10px] tracking-luxury text-muted dark:text-dk-muted uppercase hover:text-charcoal dark:hover:text-dk-text transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
