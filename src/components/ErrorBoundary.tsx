import {Component, ErrorInfo, ReactNode} from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {hasError: false, error: null};

  static getDerivedStateFromError(error: Error): State {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#141414] text-white px-5">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-[#ffd900] mb-4">Something went wrong</h1>
            <p className="text-[#a3a3a3] mb-6">
              We're sorry, but an unexpected error occurred. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#ffd900] text-[#141414] font-bold px-6 py-3 rounded-lg hover:bg-[#ffe54d] transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}