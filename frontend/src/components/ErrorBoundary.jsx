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
                <div className="flex-center flex-col" style={{
                    minHeight: '100vh',
                    background: 'var(--bg-app)',
                    textAlign: 'center',
                    padding: '2rem'
                }}>
                    <div className="card glass animate-slideUp flex-col gap-md" style={{ maxWidth: '400px' }}>
                        <div className="flex-center" style={{
                            background: '#fee2e2',
                            color: '#ef4444',
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            margin: '0 auto'
                        }}>
                            <AlertTriangle size={32} />
                        </div>

                        <h2 style={{ margin: 0 }}>Ops! Algo deu errado.</h2>
                        <p className="text-muted">
                            Não se preocupe, é apenas um soluço no sistema. Tente recarregar a página.
                        </p>

                        {this.props.showDetails && this.state.error && (
                            <pre className="text-xs text-left p-2 bg-gray-100 rounded overflow-auto" style={{ maxHeight: '100px' }}>
                                {this.state.error.toString()}
                            </pre>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="btn btn-primary"
                        >
                            <RefreshCw size={18} />
                            Recarregar Aplicação
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
