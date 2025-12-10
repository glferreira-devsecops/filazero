import { ArrowRight, Clock, QrCode, Sparkles, Users, Zap } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

import { Layout, ShieldCheck } from 'lucide-react';

export default function Landing() {
    const [clinicId, setClinicId] = useState('');
    const [loading, setLoading] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!clinicId.trim()) return;

        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 800)); // Dramatic loadings
            navigate(`/clinic/${clinicId.trim().toLowerCase()}`);
        } catch (error) {
            console.error(error);
            addToast("Erro", "error");
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: Clock, title: 'Zero Espera', desc: 'Rastreamento em tempo real da sua posição.' },
        { icon: Zap, title: 'Instantâneo', desc: 'Entre na fila em segundos via QR Code.' },
        { icon: ShieldCheck, title: 'Privacidade', desc: 'Seus dados não são expostos no telão.' },
    ];

    const demoUrl = `${window.location.origin}/clinic/demo`;

    return (
        <div className="flex-col min-h-screen">
            {/* Navbar */}
            <nav className="container flex-between py-6">
                <div className="flex-center gap-sm">
                    <div className="p-2 rounded-xl bg-primary text-white flex-center">
                        <QrCode size={24} />
                    </div>
                    <span className="font-bold text-lg tracking-tight">FilaZero</span>
                </div>
                <button onClick={() => navigate('/login')} className="btn btn-ghost text-sm font-semibold">
                    Acesso Admin
                </button>
            </nav>

            {/* Hero Section */}
            <main className="container grid grid-2 gap-xl py-16 items-center">

                {/* Left Content */}
                <div className="flex-col gap-md animate-slideUp">
                    <div className="badge badge-waiting self-start">
                        🚀 Versão 2.0 Disponível
                    </div>
                    <h1 className="text-display leading-tight">
                        A evolução da <br />
                        <span className="text-gradient">gestão de filas.</span>
                    </h1>
                    <p className="text-muted text-lg max-w-xl">
                        Transforme a experiência dos seus pacientes. Elimine salas de espera lotadas com nossa orquestração inteligente.
                    </p>

                    <div className="flex-center gap-md justify-start mt-4">
                        <button onClick={() => navigate('/clinic/demo')} className="btn btn-outline gap-sm">
                            <Sparkles size={18} />
                            Ver Demo
                        </button>
                        <div className="flex-center gap-xs text-sm text-muted">
                            <Users size={16} />
                            <span>+500 Clínicas</span>
                        </div>
                    </div>
                </div>

                {/* Right Card (Join Form) */}
                <div className="animate-scaleIn delay-200">
                    <div className="card glass flex-col gap-lg border-t-white-10">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">Entrar na Fila</h2>
                            <p className="text-muted text-sm">Digite o código da clínica ou escaneie</p>
                        </div>

                        <form onSubmit={handleJoin} className="flex-col gap-md">
                            <div className="input-group">
                                <Layout size={20} />
                                <input
                                    type="text"
                                    className="input pl-12 h-16 text-lg"
                                    placeholder="Código da Clínica (ex: demo)"
                                    value={clinicId}
                                    onChange={(e) => setClinicId(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg w-full h-16 text-lg"
                                disabled={loading || !clinicId.trim()}
                            >
                                {loading ? <span className="spinner" /> : <>Entrar Agora <ArrowRight /></>}
                            </button>
                        </form>

                        <div className="divider text-xs text-muted">OU</div>

                        <div className="text-center">
                            <button
                                onClick={() => setShowQR(!showQR)}
                                className="btn btn-ghost text-sm w-full"
                            >
                                {showQR ? 'Esconder QR' : 'Mostrar QR Code'}
                            </button>
                            {showQR && (
                                <div className="flex-center mt-4 animate-fadeIn">
                                    <div className="p-4 bg-white rounded-xl">
                                        <QRCodeSVG value={demoUrl} size={180} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Features Strip */}
            <section className="container mt-8 mb-16">
                <div className="grid grid-3 gap-lg">
                    {features.map((f, i) => (
                        <div key={i} className="card flex-col gap-sm hover:border-primary transition-colors group">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-primary flex-center group-hover:scale-110 transition-transform">
                                <f.icon size={24} />
                            </div>
                            <h3 className="text-xl font-bold m-0">{f.title}</h3>
                            <p className="text-muted text-sm m-0">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Minimalist Footer */}
            <footer className="mt-auto py-8 text-center opacity-40 hover:opacity-100 transition-all duration-500">
                <a
                    href="https://www.linkedin.com/in/devferreirag/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-muted hover:text-primary transition-all no-underline tracking-widest hover:tracking-super-wide uppercase font-medium"
                >
                    Gabriel L. Ferreira
                </a>
            </footer>
        </div>
    );
}
