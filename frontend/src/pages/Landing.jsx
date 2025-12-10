import { ArrowRight, Clock, Github, Layout, Linkedin, Mail, QrCode, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

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
        <div className="flex flex-col min-h-screen relative overflow-x-hidden font-sans text-slate-50">
            {/* Navbar */}
            <nav className="container max-w-7xl mx-auto px-6 py-6 z-10 relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/20">
                        <QrCode size={24} />
                    </div>
                    <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                        FilaZero
                    </span>
                </div>
                <button
                    onClick={() => navigate('/login')}
                    className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                    Acesso Admin
                </button>
            </nav>

            {/* Hero Section */}
            <main className="container max-w-7xl mx-auto px-6 py-12 md:py-24 grid lg:grid-cols-2 gap-16 items-center flex-grow z-10 relative">

                {/* Left Content */}
                <div className="flex flex-col gap-8 animate-slideUp">
                    <div className="inline-flex self-start px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider shadow-sm">
                        🚀 Versão 2.0 Disponível
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-sm">
                        A evolução da <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                            gestão de filas.
                        </span>
                    </h1>

                    <p className="text-slate-400 text-lg md:text-xl max-w-xl leading-relaxed">
                        Transforme a experiência dos seus pacientes. Elimine salas de espera lotadas com nossa orquestração inteligente e digital.
                    </p>

                    <div className="flex items-center gap-6 mt-2">
                        <button
                            onClick={() => navigate('/clinic/demo')}
                            className="group relative px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-white/5"
                        >
                            <Sparkles size={20} className="text-emerald-600 fill-emerald-600/20" />
                            <span>Ver Demo</span>
                        </button>

                        <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                            <div className="flex -space-x-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-xs text-white">500</div>
                                <div className="w-8 h-8 rounded-full bg-emerald-600 border-2 border-slate-950 flex items-center justify-center text-xs text-white">+</div>
                            </div>
                            <span>Clínicas Ativas</span>
                        </div>
                    </div>
                </div>

                {/* Right Card (Join Form) */}
                <div className="animate-scaleIn delay-200 w-full max-w-md mx-auto lg:ml-auto">
                    <div className="relative bg-[#0F172A]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl shadow-black/50 ring-1 ring-white/5">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Entrar na Fila</h2>
                            <p className="text-slate-400 text-sm">Digite o código da clínica ou escaneie o QR</p>
                        </div>

                        <form onSubmit={handleJoin} className="flex flex-col gap-4">
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                                    <Layout size={20} />
                                </span>
                                <input
                                    type="text"
                                    className="w-full h-14 pl-12 bg-black/20 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                                    placeholder="Código (ex: demo)"
                                    value={clinicId}
                                    onChange={(e) => setClinicId(e.target.value)}
                                    disabled={loading}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full h-14 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide text-sm"
                                disabled={loading || !clinicId.trim()}
                            >
                                {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Entrar Agora <ArrowRight size={20} /></>}
                            </button>
                        </form>

                        <div className="relative my-8 text-center">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                            <div className="relative z-10 inline-block px-4 bg-[#0F172A] text-[10px] text-slate-500 uppercase font-bold tracking-widest">OU</div>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={() => setShowQR(!showQR)}
                                className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
                            >
                                <QrCode size={16} />
                                {showQR ? 'Esconder QR Code' : 'Mostrar QR Code'}
                            </button>

                            {showQR && (
                                <div className="mt-6 p-4 bg-white rounded-2xl animate-fadeIn inline-block shadow-xl">
                                    <QRCodeSVG value={demoUrl} size={160} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Features Strip */}
            <section className="container max-w-7xl mx-auto px-6 mb-24 z-10 relative">
                <div className="grid md:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <div key={i} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-emerald-500/30 transition-all group cursor-default backdrop-blur-sm">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner shadow-emerald-500/10">
                                <f.icon size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Premium Professional Footer */}
            <footer className="w-full border-t border-white/5 bg-[#050912]/90 backdrop-blur-xl py-16 z-20 relative mt-auto">
                <div className="container max-w-5xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12">

                        {/* Brand & Dev Info */}
                        <div className="text-center md:text-left space-y-4">
                            <div className="flex items-center justify-center md:justify-start gap-2.5 opacity-80 mb-6">
                                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                                    <QrCode size={16} />
                                </div>
                                <span className="font-bold text-sm tracking-wide text-slate-300">FILAZERO SAÚDE</span>
                            </div>

                            <div>
                                <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">
                                    Gabriel Lima Ferreira
                                </h3>
                                <p className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-1">
                                    Full-Stack .NET Developer
                                </p>
                                <p className="text-slate-500 font-medium">
                                    React • Node.js • AWS • Clean Architecture
                                </p>
                            </div>
                        </div>

                        {/* Social Connections */}
                        <div className="flex gap-4">
                            <a
                                href="https://www.linkedin.com/in/devferreirag/"
                                target="_blank"
                                rel="noreferrer"
                                className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 hover:bg-[#0077b5] text-slate-400 hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-[#0077b5]/30 overflow-hidden"
                                aria-label="LinkedIn"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <Linkedin size={24} className="group-hover:scale-110 transition-transform relative z-10" />
                            </a>

                            <a
                                href="mailto:contato.ferreirag@outlook.com"
                                className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 hover:bg-[#EA4335] text-slate-400 hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-[#EA4335]/30 overflow-hidden"
                                aria-label="Email"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <Mail size={24} className="group-hover:scale-110 transition-transform relative z-10" />
                            </a>

                            <a
                                href="https://github.com/glferreira-devsecops"
                                target="_blank"
                                rel="noreferrer"
                                className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 hover:bg-[#171515] text-slate-400 hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-black/30 overflow-hidden"
                                aria-label="GitHub"
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <Github size={24} className="group-hover:scale-110 transition-transform relative z-10" />
                            </a>
                        </div>
                    </div>

                    <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] text-slate-600 font-medium uppercase tracking-widest">
                        <p>© {new Date().getFullYear()} FilaZero. All rights reserved.</p>
                        <p className="flex items-center gap-2 text-emerald-500/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_currentColor]"></span>
                            System Operational
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
