import { ArrowRight, Check, ChevronDown, ChevronRight, Clock, Github, Layout, Linkedin, Mail, Monitor, Play, QrCode, ShieldCheck, Smartphone, Sparkles, Ticket, Users, Volume2, Zap } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { sanitizeClinicId } from '../utils/security';

export default function Landing() {
    const [clinicId, setClinicId] = useState('');
    const [loading, setLoading] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(0);
    const [showTutorial, setShowTutorial] = useState(false);
    const [animatedStats, setAnimatedStats] = useState({ clinics: 0, patients: 0, saved: 0 });
    const navigate = useNavigate();
    const { addToast } = useToast();

    // Animate stats on mount
    useEffect(() => {
        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;

        let step = 0;
        const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            setAnimatedStats({
                clinics: Math.floor(500 * progress),
                patients: Math.floor(150000 * progress),
                saved: Math.floor(45000 * progress)
            });
            if (step >= steps) clearInterval(timer);
        }, interval);

        return () => clearInterval(timer);
    }, []);

    // Tutorial steps
    const tutorialSteps = [
        {
            icon: QrCode,
            title: 'Passo 1: Escaneie o QR Code',
            desc: 'Ao chegar na clínica, aponte a câmera do celular para o QR Code exposto na recepção. O link abrirá automaticamente.',
            visual: 'qr',
            tip: '💡 Funciona com qualquer smartphone!'
        },
        {
            icon: Ticket,
            title: 'Passo 2: Retire Sua Senha',
            desc: 'Toque no botão "Retirar Senha" para entrar na fila digital. Sua senha será gerada instantaneamente.',
            visual: 'ticket',
            tip: '⚡ Menos de 2 segundos!'
        },
        {
            icon: Smartphone,
            title: 'Passo 3: Acompanhe em Tempo Real',
            desc: 'Veja quantas pessoas estão na sua frente e o tempo estimado de espera. Notificações quando for sua vez.',
            visual: 'tracking',
            tip: '🔔 Você será notificado!'
        },
        {
            icon: Volume2,
            title: 'Passo 4: É Sua Vez!',
            desc: 'Quando sua senha for chamada, seu celular vai vibrar e tocar. Dirija-se ao balcão de atendimento.',
            visual: 'called',
            tip: '✅ Simples assim!'
        }
    ];

    const handleJoin = async (e) => {
        e.preventDefault();
        const sanitized = sanitizeClinicId(clinicId);
        if (!sanitized) return;

        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 800));
            navigate(`/clinic/${sanitized}`);
        } catch (error) {
            console.error(error);
            addToast("Erro", "error");
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: Clock, title: 'Zero Espera', desc: 'Rastreamento em tempo real da sua posição na fila.', color: 'emerald' },
        { icon: Zap, title: 'Instantâneo', desc: 'Entre na fila em segundos via QR Code, sem apps.', color: 'amber' },
        { icon: ShieldCheck, title: 'Privacidade Total', desc: 'Seu nome não aparece no telão. Só você sabe sua senha.', color: 'blue' },
        { icon: Users, title: 'Para Todos', desc: 'Funciona em qualquer celular, tablet ou computador.', color: 'purple' },
        { icon: Monitor, title: 'Painel TV', desc: 'Display profissional para sala de espera com chamada por voz.', color: 'rose' },
        { icon: Sparkles, title: 'IA Inteligente', desc: 'Previsão de tempo baseada em dados históricos reais.', color: 'cyan' }
    ];

    const demoUrl = `${window.location.origin}/clinic/demo`;
    const currentStep = tutorialSteps[tutorialStep];

    // Visual mockups for tutorial
    const TutorialVisual = ({ type }) => {
        if (type === 'qr') {
            return (
                <div className="relative bg-white rounded-3xl p-6 shadow-2xl transform hover:scale-105 transition-transform">
                    <QRCodeSVG value={demoUrl} size={180} bgColor="#ffffff" fgColor="#0f172a" />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg">
                        ESCANEIE
                    </div>
                </div>
            );
        }
        if (type === 'ticket') {
            return (
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 shadow-2xl border border-white/10 w-full max-w-[200px]">
                    <div className="text-center">
                        <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Sua Senha</p>
                        <div className="text-6xl font-black text-white mb-2 animate-pulse">42</div>
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full">
                            AGUARDANDO
                        </span>
                    </div>
                </div>
            );
        }
        if (type === 'tracking') {
            return (
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 shadow-2xl border border-white/10 w-full max-w-[200px]">
                    <div className="flex items-center justify-center gap-6">
                        <div className="text-center">
                            <div className="text-4xl font-black text-emerald-400">3</div>
                            <p className="text-slate-500 text-xs">na frente</p>
                        </div>
                        <div className="w-px h-12 bg-white/10"></div>
                        <div className="text-center">
                            <div className="text-4xl font-black text-white">~15</div>
                            <p className="text-slate-500 text-xs">minutos</p>
                        </div>
                    </div>
                </div>
            );
        }
        if (type === 'called') {
            return (
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-6 shadow-2xl w-full max-w-[200px] animate-bounce-subtle">
                    <div className="text-center text-white">
                        <Volume2 size={32} className="mx-auto mb-2" />
                        <p className="text-sm font-bold uppercase tracking-widest mb-1">É SUA VEZ!</p>
                        <div className="text-5xl font-black">42</div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col min-h-screen relative overflow-x-hidden font-sans text-slate-50">

            {/* Skip Link for Accessibility */}
            <a href="#main-content" className="skip-link">
                Pular para conteúdo principal
            </a>

            {/* Animated Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[50%] -left-[25%] w-[100%] h-[100%] bg-[radial-gradient(circle,rgba(16,185,129,0.08)_0%,transparent_50%)] animate-pulse"></div>
                <div className="absolute -bottom-[50%] -right-[25%] w-[100%] h-[100%] bg-[radial-gradient(circle,rgba(59,130,246,0.08)_0%,transparent_50%)] animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Navbar */}
            <nav className="container max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 z-10 relative flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/20">
                        <QrCode size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    <span className="font-bold text-lg sm:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                        FilaZero
                    </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={() => setShowTutorial(true)}
                        className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-all"
                    >
                        <Play size={16} />
                        Como Funciona
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    >
                        Acesso Admin
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main id="main-content" className="container max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-20 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center flex-grow z-10 relative">

                {/* Left Content */}
                <div className="flex flex-col gap-6 sm:gap-8 animate-slideUp text-center lg:text-left">
                    <div className="inline-flex self-center lg:self-start px-3 sm:px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-sm">
                        🚀 Versão 2.0 • Novo Tutorial Interativo
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-sm">
                        Nunca mais espere <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                            em filas.
                        </span>
                    </h1>

                    <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-xl leading-relaxed mx-auto lg:mx-0">
                        Escaneie o QR Code, retire sua senha digital e acompanhe sua posição em tempo real. <strong className="text-white">Tudo pelo celular.</strong>
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-2">
                        <button
                            onClick={() => setShowTutorial(true)}
                            className="w-full sm:w-auto group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20"
                        >
                            <MousePointerClick size={20} className="group-hover:animate-bounce" />
                            <span>Ver Tutorial</span>
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                            onClick={() => navigate('/clinic/demo')}
                            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3"
                        >
                            <Sparkles size={20} className="text-emerald-400" />
                            <span>Testar Demo</span>
                        </button>
                    </div>

                    {/* Animated Stats */}
                    <div className="flex items-center justify-center lg:justify-start gap-6 sm:gap-8 mt-4 pt-4 border-t border-white/5">
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-black text-emerald-400">{animatedStats.clinics}+</div>
                            <p className="text-slate-500 text-xs uppercase tracking-wider">Clínicas</p>
                        </div>
                        <div className="w-px h-10 bg-white/10"></div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-black text-white">{(animatedStats.patients / 1000).toFixed(0)}k</div>
                            <p className="text-slate-500 text-xs uppercase tracking-wider">Pacientes</p>
                        </div>
                        <div className="w-px h-10 bg-white/10"></div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-black text-cyan-400">{(animatedStats.saved / 1000).toFixed(0)}k</div>
                            <p className="text-slate-500 text-xs uppercase tracking-wider">Horas Salvas</p>
                        </div>
                    </div>
                </div>

                {/* Right Card (Join Form) */}
                <div className="animate-scaleIn w-full max-w-md mx-auto lg:ml-auto">
                    <div className="relative bg-[#0F172A]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-2xl shadow-black/50 ring-1 ring-white/5">
                        <div className="text-center mb-6 sm:mb-8">
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Entrar na Fila</h2>
                            <p className="text-slate-400 text-sm">Digite o código ou escaneie o QR</p>
                        </div>

                        <form onSubmit={handleJoin} className="flex flex-col gap-4">
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                                    <Layout size={20} />
                                </span>
                                <input
                                    type="text"
                                    className="w-full h-12 sm:h-14 pl-12 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-sm sm:text-base"
                                    placeholder="Código da clínica (ex: demo)"
                                    value={clinicId}
                                    onChange={(e) => setClinicId(e.target.value)}
                                    disabled={loading}
                                    autoComplete="off"
                                    aria-label="Código da clínica"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full h-12 sm:h-14 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide text-sm"
                                disabled={loading || !clinicId.trim()}
                            >
                                {loading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Entrar Agora <ArrowRight size={20} /></>
                                )}
                            </button>
                        </form>

                        <div className="relative my-6 sm:my-8 text-center">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                            <div className="relative z-10 inline-block px-4 bg-[#0F172A] text-[10px] text-slate-500 uppercase font-bold tracking-widest">OU ESCANEIE</div>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={() => setShowQR(!showQR)}
                                className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto group"
                            >
                                <QrCode size={16} className="group-hover:scale-110 transition-transform" />
                                {showQR ? 'Esconder QR Code' : 'Ver QR Code da Demo'}
                                <ChevronDown size={16} className={`transition-transform ${showQR ? 'rotate-180' : ''}`} />
                            </button>

                            {showQR && (
                                <div className="mt-6 inline-block animate-scaleIn">
                                    <div className="p-4 bg-white rounded-2xl shadow-xl">
                                        <QRCodeSVG value={demoUrl} size={160} bgColor="#ffffff" fgColor="#0f172a" />
                                    </div>
                                    <p className="text-slate-500 text-xs mt-3">Aponte a câmera do celular</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Features Grid */}
            <section className="container max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 z-10 relative">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Por que FilaZero?</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">Tecnologia de ponta para uma experiência de saúde sem fricção</p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className="group p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-emerald-500/30 transition-all cursor-default backdrop-blur-sm"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
                            <div className={`w-12 h-12 rounded-2xl bg-${f.color}-500/10 text-${f.color}-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <f.icon size={24} />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{f.title}</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works Section - Visible on mobile */}
            <section className="sm:hidden container max-w-7xl mx-auto px-4 py-12 z-10 relative">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Como Funciona?</h2>
                    <p className="text-slate-400 text-sm">4 passos simples</p>
                </div>

                <div className="space-y-4">
                    {tutorialSteps.map((step, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                <step.icon size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-sm">{step.title}</h4>
                                <p className="text-slate-400 text-xs mt-1">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => navigate('/clinic/demo')}
                    className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                >
                    Experimentar Agora <ArrowRight size={18} />
                </button>
            </section>

            {/* Footer */}
            <footer className="w-full border-t border-white/5 bg-[#050912]/90 backdrop-blur-xl py-12 sm:py-16 z-20 relative mt-auto">
                <div className="container max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-12">
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2.5 mb-4">
                                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                                    <QrCode size={16} />
                                </div>
                                <span className="font-bold text-sm tracking-wide text-slate-300">FILAZERO SAÚDE</span>
                            </div>

                            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Gabriel Lima Ferreira</h3>
                            <p className="text-emerald-400 font-bold text-xs sm:text-sm uppercase tracking-widest mb-1">
                                Full-Stack .NET Developer
                            </p>
                            <p className="text-slate-500 font-medium text-sm">
                                React • Node.js • AWS • Clean Architecture
                            </p>
                        </div>

                        <div className="flex gap-3 sm:gap-4">
                            <a
                                href="https://www.linkedin.com/in/devferreirag/"
                                target="_blank"
                                rel="noreferrer"
                                className="group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/5 hover:bg-[#0077b5] text-slate-400 hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg"
                                aria-label="LinkedIn"
                            >
                                <Linkedin size={22} />
                            </a>
                            <a
                                href="mailto:contato.ferreirag@outlook.com"
                                className="group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/5 hover:bg-[#EA4335] text-slate-400 hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg"
                                aria-label="Email"
                            >
                                <Mail size={22} />
                            </a>
                            <a
                                href="https://github.com/glferreira-devsecops"
                                target="_blank"
                                rel="noreferrer"
                                className="group flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/5 hover:bg-[#171515] text-slate-400 hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg"
                                aria-label="GitHub"
                            >
                                <Github size={22} />
                            </a>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-600 font-medium uppercase tracking-widest">
                        <p>© {new Date().getFullYear()} FilaZero. Todos os direitos reservados.</p>
                        <p className="flex items-center gap-2 text-emerald-500/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_currentColor]"></span>
                            Sistema Operacional
                        </p>
                    </div>
                </div>
            </footer>

            {/* Interactive Tutorial Modal */}
            {showTutorial && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-fadeIn"
                    onClick={(e) => e.target === e.currentTarget && setShowTutorial(false)}
                >
                    <div className="w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-scaleIn">

                        {/* Progress Bar */}
                        <div className="h-1 bg-slate-800">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
                                style={{ width: `${((tutorialStep + 1) / tutorialSteps.length) * 100}%` }}
                            />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                    <currentStep.icon size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Passo {tutorialStep + 1} de {tutorialSteps.length}</p>
                                    <h3 className="font-bold text-white text-sm sm:text-base">{currentStep.title}</h3>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowTutorial(false)}
                                className="text-slate-500 hover:text-white transition-colors text-sm"
                            >
                                Pular
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 sm:p-8">
                            <div className="flex flex-col items-center gap-6 sm:gap-8">
                                {/* Visual */}
                                <div className="animate-scaleIn">
                                    <TutorialVisual type={currentStep.visual} />
                                </div>

                                {/* Description */}
                                <div className="text-center max-w-md">
                                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
                                        {currentStep.desc}
                                    </p>
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                                        {currentStep.tip}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between p-4 sm:p-6 bg-black/20 border-t border-white/5">
                            <button
                                onClick={() => setTutorialStep(Math.max(0, tutorialStep - 1))}
                                disabled={tutorialStep === 0}
                                className="px-4 sm:px-6 py-2 sm:py-3 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                            >
                                Anterior
                            </button>

                            {/* Step Indicators */}
                            <div className="flex gap-2">
                                {tutorialSteps.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setTutorialStep(i)}
                                        className={`w-2 h-2 rounded-full transition-all ${i === tutorialStep ? 'w-6 bg-emerald-500' : 'bg-white/20 hover:bg-white/40'}`}
                                    />
                                ))}
                            </div>

                            {tutorialStep < tutorialSteps.length - 1 ? (
                                <button
                                    onClick={() => setTutorialStep(tutorialStep + 1)}
                                    className="px-4 sm:px-6 py-2 sm:py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all flex items-center gap-2 text-sm"
                                >
                                    Próximo <ChevronRight size={18} />
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setShowTutorial(false);
                                        navigate('/clinic/demo');
                                    }}
                                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl font-bold transition-all flex items-center gap-2 text-sm"
                                >
                                    <Check size={18} /> Experimentar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
