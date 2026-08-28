import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: React.ReactNode;
  componentName?: string;
  onClose?: () => void;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error?.message || "Erreur inconnue" };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary - ${this.props.componentName || "Composant"}]`, error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          <div className="bg-dark-800 rounded-3xl w-full max-w-md p-8 flex flex-col items-center gap-6 shadow-2xl border border-red-500/20">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle size={32} className="text-red-400" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-2">
                Erreur dans {this.props.componentName || "ce composant"}
              </h2>
              <p className="text-gray-400 text-sm break-words">
                {this.state.errorMessage}
              </p>
            </div>
            <div className="flex gap-3 w-full">
              {this.props.onClose && (
                <button
                  onClick={this.props.onClose}
                  className="flex-1 px-4 py-3 bg-dark-700 text-white rounded-xl font-bold hover:bg-dark-600 transition-colors"
                >
                  Fermer
                </button>
              )}
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Reessayer
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
