import { X } from 'lucide-react';
import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext();

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 3000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="toast-container" style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                zIndex: 9999
            }}>
                {toasts.map(toast => (
                    <div key={toast.id} className={`card animate-slideUp toast-${toast.type}`} style={{
                        padding: '1rem',
                        minWidth: '250px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'var(--bg-card)',
                        borderLeft: `4px solid ${toast.type === 'error' ? 'var(--danger)' : 'var(--success)'}`,
                        boxShadow: 'var(--shadow-lg)'
                    }}>
                        <span>{toast.message}</span>
                        <button onClick={() => removeToast(toast.id)} className="btn btn-ghost btn-sm btn-icon">
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
