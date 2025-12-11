import { ArrowRight, Lock, Mail, QrCode, ShieldCheck } from 'lucide-react';
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
        } catch {
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
        <div className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden font-sans text-slate-50 bg-[#0f172a]">

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="w-full max-w-md z-10 animate-slideUp">

                {/* Brand Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-white/5 mb-4 shadow-xl shadow-emerald-500/10 backdrop-blur-sm">
                        <QrCode size={32} className="text-emerald-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">FilaZero Admin</h1>
                    <p className="text-slate-400 text-sm">Acesso restrito para gestão da clínica</p>
                </div>

                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl ring-1 ring-white/5">

                    <div className="flex items-center gap-3 mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                        <ShieldCheck size={20} />
                        <span>Ambiente Seguro & Criptografado</span>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Corporativo</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                                    <Mail size={18} />
                                </span>
                                <input
                                    type="email"
                                    className="w-full h-12 pl-11 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                                    placeholder="admin@clinica.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Senha de Acesso</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                                    <Lock size={18} />
                                </span>
                                <input
                                    type="password"
                                    className="w-full h-12 pl-11 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full h-12 mt-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                                <>
                                    Acessar Painel <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative my-8 text-center">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                        <div className="relative z-10 inline-block px-4 bg-[#0f172a] text-[10px] text-slate-500 uppercase font-bold tracking-widest">OU ACESSO DEMO</div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGuestLogin}
                        className="w-full h-12 border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm"
                        disabled={loading}
                    >
                        🕵️ Entrar como Visitante
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full mt-4 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        Voltar para a Página Inicial
                    </button>
                </div>
            </div>

            {/* Seamless Footer */}
            <div className="mt-12 text-center opacity-40 hover:opacity-100 transition-opacity z-10">
                <a
                    href="https://www.linkedin.com/in/devferreirag/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-400 transition-colors font-medium cursor-pointer"
                >
                    Gabriel L. Ferreira • Premium Software
                </a>
            </div>

        </div>
    );
}
