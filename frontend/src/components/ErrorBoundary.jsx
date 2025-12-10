import { AlertTriangle, RefreshCw } from 'lucide-react';
import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col p-4">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center animate-slideUp">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                            <AlertTriangle size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Ops! Algo deu errado.</h2>
                        <p className="text-slate-500 text-sm mb-6">
                            Não se preocupe, os dados estão seguros. Tente recarregar a página.
                        </p>

                        {this.state.error && (
                            <div className="mb-6 bg-slate-100 p-4 rounded-lg overflow-auto max-h-32 text-left">
                                <pre className="text-xs text-slate-600 font-mono whitespace-pre-wrap">
                                    {this.state.error.toString()}
                                </pre>
                            </div>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={18} />
                            Recarregar Página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
