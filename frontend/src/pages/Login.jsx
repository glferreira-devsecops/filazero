import { ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login, signInAsGuest } = useAuth();
    const navigate = useNavigate();

    const handleGuestLogin = async () => {
        setLoading(true);
        try {
            await signInAsGuest();
            navigate('/admin');
        } catch (e) {
            setError("Erro ao entrar como visitante");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) return;

        setLoading(true);
        setError('');

        try {
            await login(email, password);
            navigate('/admin'); // Redirect to dashboard
        } catch (err) {
            console.error(err);
            setError('Credenciais inválidas ou erro no servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-center flex-col" style={{ minHeight: '100vh', padding: '1.5rem', background: 'var(--bg-app)' }}>

            <div className="card glass flex-col gap-lg animate-slideUp" style={{ width: '100%', maxWidth: '400px' }}>

                {/* Header */}
                <div className="flex-col flex-center text-center gap-sm">
                    <div style={{
                        background: 'var(--primary-light)',
                        padding: '1rem',
                        borderRadius: 'var(--radius-full)',
                        color: 'var(--primary)'
                    }}>
                        <ShieldCheck size={32} />
                    </div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Acesso Restrito</h1>
                    <p className="text-muted" style={{ margin: 0 }}>
                        Entre com sua conta administrativa
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-col gap-md">
                    {error && (
                        <div className="p-3 text-sm text-center" style={{
                            background: '#fee2e2',
                            color: '#ef4444',
                            borderRadius: 'var(--radius-md)'
                        }}>
                            {error}
                        </div>
                    )}

                    <div className="flex-col gap-xs">
                        <label className="text-sm font-semibold">Email</label>
                        <div className="input-group">
                            <Mail size={18} className="text-muted" />
                            <input
                                type="email"
                                className="input"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex-col gap-xs">
                        <label className="text-sm font-semibold">Senha</label>
                        <div className="input-group">
                            <Lock size={18} className="text-muted" />
                            <input
                                type="password"
                                className="input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg mt-2"
                        disabled={loading}
                    >
                        {loading ? 'Entrando...' : (
                            <>
                                Acessar Painel <ArrowRight size={20} />
                            </>
                        )}
                    </button>

                    {/* Real implementation below uses the prop from useAuth */}
                </form>

                <div className="divider" style={{ margin: '1.5rem 0' }}>
                    <span className="text-muted text-sm px-2 bg-glass">OU</span>
                </div>

                <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="btn btn-outline"
                    disabled={loading}
                >
                    🕵️ Entrar como Visitante (Demo)
                </button>

                <div className="divider" />

                <button
                    onClick={() => navigate('/')}
                    className="btn btn-ghost"
                >
                    Voltar para Início
                </button>
            </div>

            {/* Fixed Minimalist Footer */}
            <a
                href="https://www.linkedin.com/in/devferreirag/"
                target="_blank"
                rel="noreferrer"
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    textDecoration: 'none',
                    opacity: 0.3,
                    transition: 'all 0.5s ease',
                    cursor: 'pointer'
                }}
                className="hover:opacity-100 hover:tracking-[0.5em] tracking-[0.3em] text-[10px] uppercase text-muted font-medium"
            >
                Gabriel L. Ferreira
            </a>

        </div>
    );
}
