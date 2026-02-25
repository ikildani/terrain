'use client';

import { Component, type ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="card noise p-8 max-w-lg mx-auto mt-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-signal-red/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-signal-red" />
            </div>
            <h2 className="font-display text-lg text-white mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-400 mb-1 leading-relaxed">
              An unexpected error occurred while rendering this page.
            </p>
            {this.state.error && (
              <p className="text-xs font-mono text-slate-600 mb-6 max-w-sm break-all">{this.state.error.message}</p>
            )}
            <button onClick={this.handleRetry} className="btn btn-primary text-sm">
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
