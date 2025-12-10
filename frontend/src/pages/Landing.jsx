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

            {/* Premium Professional Footer */}
            <footer className="mt-auto py-12 border-t border-white/5 bg-black/20 backdrop-blur-sm">
                <div className="container flex flex-col items-center gap-6 text-center">

                    {/* Developer Info */}
                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-bold tracking-widest text-primary/80 uppercase mb-2">
                            Desenvolvido por
                        </p>
                        <h3 className="text-xl font-bold bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent">
                            Gabriel Lima Ferreira
                        </h3>
                        <p className="text-sm text-muted">
                            Full-Stack .Net Developer • React, Node.js & AWS
                        </p>
                        <p className="text-xs text-muted/60">
                            Clean Code & Open-Source • Back End • LATAM • Remote
                        </p>
                    </div>

                    {/* Social Links */}
                    <div className="flex items-center justify-center gap-4 mt-4">
                        <a
                            href="https://www.linkedin.com/in/devferreirag/"
                            target="_blank"
                            rel="noreferrer"
                            className="p-3 rounded-full bg-white/5 hover:bg-[#0077b5] hover:text-white text-muted transition-all duration-300 group shadow-lg hover:shadow-[#0077b5]/20"
                            title="LinkedIn"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                        </a>

                        <a
                            href="mailto:contato.ferreirag@outlook.com"
                            className="p-3 rounded-full bg-white/5 hover:bg-[#EA4335] hover:text-white text-muted transition-all duration-300 group shadow-lg hover:shadow-[#EA4335]/20"
                            title="Email"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                        </a>

                        <a
                            href="https://github.com/glferreira-devsecops"
                            target="_blank"
                            rel="noreferrer"
                            className="p-3 rounded-full bg-white/5 hover:bg-[#333] hover:text-white text-muted transition-all duration-300 group shadow-lg hover:shadow-white/10"
                            title="GitHub"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C3.68.65 2.48 1 2.48 1A5.07 5.07 0 0 0 2.48 4.77 5.44 5.44 0 0 0 2.48 11.75c0 5.51 3.3 6.7 6.44 7a3.37 3.37 0 0 0 .94 2.61v2.25" /></svg>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
