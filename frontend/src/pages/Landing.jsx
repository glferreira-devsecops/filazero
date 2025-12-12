import { ArrowRight, Check, ChevronRight, Clock, ExternalLink, Github, Linkedin, Mail, Monitor, Play, QrCode, Shield, ShieldCheck, Smartphone, Sparkles, Star, Ticket, TrendingUp, Users, Volume2, X, Zap } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { sanitizeClinicId } from '../utils/security';

/**
 * SURREAL PREMIUM LANDING PAGE
 * Exceptional design that exceeds expectations
 */

// ============================================
// CUSTOM HOOKS
// ============================================

const useCountUp = (end, duration = 2000, delay = 0, trigger = true) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!trigger) return;
        const timeout = setTimeout(() => {
            let start = 0;
            const step = end / (duration / 16);
            const timer = setInterval(() => {
                start += step;
                if (start >= end) {
                    setCount(end);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(start));
                }
            }, 16);
            return () => clearInterval(timer);
        }, delay);
        return () => clearTimeout(timeout);
    }, [end, duration, delay, trigger]);

    return count;
};

const useInView = (threshold = 0.1) => {
    const ref = useRef(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { threshold }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [threshold]);

    return [ref, isInView];
};

// ============================================
// ANIMATED COMPONENTS
// ============================================

const AnimatedGradientBorder = ({ children, className = '' }) => (
    <div className={`relative p-[1px] rounded-3xl overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 animate-gradient-x" />
        <div className="relative bg-slate-900 rounded-3xl">
            {children}
        </div>
    </div>
);

const GlowingOrb = ({ color, size, position, delay = 0 }) => (
    <div
        className={`absolute ${position} ${size} rounded-full blur-[100px] animate-pulse opacity-30`}
        style={{
            background: color,
            animationDelay: `${delay}s`,
            animationDuration: '4s'
        }}
    />
);

const FloatingElement = ({ children, delay = 0 }) => (
    <div
        className="animate-float"
        style={{ animationDelay: `${delay}s` }}
    >
        {children}
    </div>
);

// Animated number with glow
const GlowNumber = ({ value, label, color = 'emerald' }) => {
    const [ref, isInView] = useInView(0.5);
    const count = useCountUp(value, 2000, 0, isInView);

    return (
        <div ref={ref} className="text-center group">
            <div className={`text-5xl sm:text-6xl font-black text-${color}-400 drop-shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all group-hover:scale-110`}>
                {count.toLocaleString()}
                <span className="text-3xl">+</span>
            </div>
            <p className="text-slate-400 text-sm mt-2 uppercase tracking-widest font-medium">{label}</p>
        </div>
    );
};

// Feature card with hover effect
const FeatureCard = ({ icon: Icon, title, description, gradient, delay = 0 }) => {
    const [ref, isInView] = useInView(0.2);

    return (
        <div
            ref={ref}
            className={`group relative p-6 sm:p-8 rounded-3xl bg-white/[0.02] backdrop-blur-sm border border-white/5 transition-all duration-700 hover:bg-white/[0.05] hover:border-emerald-500/30 hover:scale-[1.02] cursor-default ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {/* Gradient glow on hover */}
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10`} />

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-white/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <Icon size={28} className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
        </div>
    );
};

// Testimonial with animation
const TestimonialCard = ({ quote, name, role, avatar, delay = 0 }) => {
    const [ref, isInView] = useInView(0.2);

    return (
        <div
            ref={ref}
            className={`p-6 rounded-3xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-sm border border-white/5 transition-all duration-700 hover:border-emerald-500/20 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} className="text-amber-400 fill-amber-400" />
                ))}
            </div>
            <p className="text-slate-200 text-base leading-relaxed mb-6">"{quote}"</p>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white font-bold">
                    {avatar}
                </div>
                <div>
                    <p className="text-white font-semibold">{name}</p>
                    <p className="text-slate-500 text-sm">{role}</p>
                </div>
            </div>
        </div>
    );
};

// Step card for how it works
const StepCard = ({ number, icon: Icon, title, description, isLast = false }) => (
    <div className="relative flex flex-col items-center text-center">
        {/* Connector line */}
        {!isLast && (
            <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-gradient-to-r from-emerald-500/50 to-transparent" />
        )}

        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/30 transform hover:scale-110 transition-transform">
            <Icon size={36} className="text-white" />
        </div>
        <span className="text-emerald-400 text-sm font-bold mb-2">PASSO {number}</span>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm max-w-xs">{description}</p>
    </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

export default function Landing() {
    const [clinicId, setClinicId] = useState('');
    const [loading, setLoading] = useState(false);
    const [showQR, setShowQR] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [tutorialStep, setTutorialStep] = useState(0);
    const navigate = useNavigate();
    const { addToast } = useToast();

    const tutorialSteps = [
        { icon: QrCode, title: 'Escaneie o QR Code', desc: 'Aponte a câmera do celular para o QR Code na recepção.', visual: 'qr' },
        { icon: Ticket, title: 'Retire Sua Senha', desc: 'Toque em "Retirar Senha" para entrar na fila digital.', visual: 'ticket' },
        { icon: Smartphone, title: 'Acompanhe em Tempo Real', desc: 'Veja sua posição e tempo estimado no celular.', visual: 'tracking' },
        { icon: Volume2, title: 'É Sua Vez!', desc: 'Seu celular vibra e toca quando for chamado.', visual: 'called' },
    ];

    const features = [
        { icon: QrCode, title: 'QR Code Instantâneo', description: 'Entre na fila em 2 segundos escaneando o código na recepção. Sem apps, sem cadastro.', gradient: 'from-emerald-500/20 to-emerald-500/0' },
        { icon: Clock, title: 'Tempo Real', description: 'Acompanhe sua posição na fila e tempo estimado de espera ao vivo, atualizado a cada segundo.', gradient: 'from-cyan-500/20 to-cyan-500/0' },
        { icon: Shield, title: 'Privacidade Total', description: 'Seu nome nunca aparece no telão público. Apenas sua senha numérica é exibida.', gradient: 'from-blue-500/20 to-blue-500/0' },
        { icon: Volume2, title: 'Notificações Inteligentes', description: 'Alertas sonoros e vibração quando for sua vez. Nunca perca seu atendimento.', gradient: 'from-purple-500/20 to-purple-500/0' },
        { icon: Monitor, title: 'Painel para TV', description: 'Display profissional para sala de espera com senhas atuais e próximas.', gradient: 'from-rose-500/20 to-rose-500/0' },
        { icon: TrendingUp, title: 'Métricas e Relatórios', description: 'Dashboard completo com tempo médio, picos de demanda e satisfação.', gradient: 'from-amber-500/20 to-amber-500/0' },
    ];

    const testimonials = [
        { quote: 'Reduziu o tempo de espera em 70% e acabou com as reclamações. Os pacientes adoram!', name: 'Dra. Marina Costa', role: 'Clínica Vida Plena', avatar: 'MC' },
        { quote: 'Interface super intuitiva. Minha equipe de recepção aprendeu a usar em 5 minutos.', name: 'Dr. Ricardo Silva', role: 'Centro Médico ABC', avatar: 'RS' },
        { quote: 'O melhor investimento que fizemos. ROI positivo no primeiro mês de uso.', name: 'Ana Beatriz Souza', role: 'Hospital São Lucas', avatar: 'AB' },
    ];

    const handleJoin = async (e) => {
        e.preventDefault();
        const sanitized = sanitizeClinicId(clinicId);
        if (!sanitized) {
            addToast('Digite o código da clínica', 'warning');
            return;
        }
        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 500));
            navigate(`/clinic/${sanitized}`);
        } catch {
            addToast('Erro ao acessar', 'error');
        } finally {
            setLoading(false);
        }
    };

    const demoUrl = `${window.location.origin}/clinic/demo`;

    return (
        <div className="min-h-screen bg-[#050810] text-white overflow-x-hidden">
            {/* Custom Animations */}
            <style>{`
                @keyframes gradient-x {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-gradient-x {
                    background-size: 200% 200%;
                    animation: gradient-x 3s ease infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(2deg); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                @keyframes glow-pulse {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.1); }
                }
                .animate-glow-pulse {
                    animation: glow-pulse 4s ease-in-out infinite;
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up {
                    animation: slide-up 0.8s ease-out forwards;
                }
                .delay-100 { animation-delay: 100ms; }
                .delay-200 { animation-delay: 200ms; }
                .delay-300 { animation-delay: 300ms; }
                .delay-400 { animation-delay: 400ms; }
            `}</style>

            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <GlowingOrb color="rgba(16,185,129,0.4)" size="w-[800px] h-[800px]" position="-top-[400px] -left-[200px]" delay={0} />
                <GlowingOrb color="rgba(6,182,212,0.3)" size="w-[600px] h-[600px]" position="top-1/3 -right-[200px]" delay={1} />
                <GlowingOrb color="rgba(59,130,246,0.2)" size="w-[500px] h-[500px]" position="-bottom-[200px] left-1/4" delay={2} />

                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
            </div>

            {/* Skip Link */}
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-white focus:rounded-lg">
                Pular para conteúdo principal
            </a>

            {/* ========== NAVBAR ========== */}
            <nav className="sticky top-0 z-50 bg-[#050810]/80 backdrop-blur-2xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <QrCode size={22} className="text-white" />
                        </div>
                        <div>
                            <span className="font-bold text-xl tracking-tight">FilaZero</span>
                            <span className="hidden sm:inline text-slate-500 text-sm ml-2">Gestão de Filas</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            onClick={() => setShowTutorial(true)}
                            className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        >
                            <Play size={16} className="text-emerald-400" />
                            Como Funciona
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-all"
                        >
                            Admin
                        </button>
                    </div>
                </div>
            </nav>

            {/* ========== HERO SECTION ========== */}
            <section id="main-content" className="relative z-10 py-16 sm:py-24 lg:py-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                        {/* Left: Content */}
                        <div className="text-center lg:text-left space-y-8 animate-slide-up">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 backdrop-blur-sm">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-sm font-semibold text-emerald-400">Sistema Premium de Filas</span>
                            </div>

                            {/* Headline */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.1] tracking-tight">
                                Elimine filas.{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 animate-gradient-x">
                                    Revolucione o atendimento.
                                </span>
                            </h1>

                            {/* Subheadline */}
                            <p className="text-lg sm:text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                Seus pacientes acompanham a fila pelo celular em tempo real.{' '}
                                <strong className="text-white">Sem aglomerações, sem estresse, sem papel.</strong>
                            </p>

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                <button
                                    onClick={() => navigate('/clinic/demo')}
                                    className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-2xl font-bold shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Sparkles size={20} />
                                    Testar Demo Grátis
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={() => setShowTutorial(true)}
                                    className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all"
                                >
                                    <Play size={20} className="text-emerald-400" />
                                    Ver Tutorial
                                </button>
                            </div>

                            {/* Trust badges inline */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                                <div className="flex items-center gap-2 text-slate-500 text-sm">
                                    <ShieldCheck size={16} className="text-emerald-400" />
                                    LGPD Compliant
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-sm">
                                    <Shield size={16} className="text-emerald-400" />
                                    SSL Seguro
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-sm">
                                    <Zap size={16} className="text-emerald-400" />
                                    99.9% Uptime
                                </div>
                            </div>
                        </div>

                        {/* Right: Phone Mockup Image */}
                        <div className="relative flex items-center justify-center animate-slide-up delay-200">
                            <FloatingElement>
                                <div className="relative">
                                    {/* Glow behind phone */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 blur-[80px] scale-150" />

                                    {/* Phone mockup image */}
                                    <img
                                        src="/phone-mockup.png"
                                        alt="FilaZero App - Gestão de Filas"
                                        className="relative w-full max-w-md mx-auto drop-shadow-2xl"
                                    />

                                    {/* Floating badges around phone */}
                                    <div className="absolute -left-4 top-1/4 p-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl animate-float" style={{ animationDelay: '0.5s' }}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                                <Clock size={16} className="text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-white text-xs font-bold">~15 min</p>
                                                <p className="text-slate-500 text-[10px]">tempo estimado</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute -right-4 top-1/2 p-3 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl animate-float" style={{ animationDelay: '1s' }}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                                <Users size={16} className="text-cyan-400" />
                                            </div>
                                            <div>
                                                <p className="text-white text-xs font-bold">3 na frente</p>
                                                <p className="text-slate-500 text-[10px]">posição na fila</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </FloatingElement>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== STATS SECTION ========== */}
            <section className="relative z-10 py-16 border-y border-white/5 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        <GlowNumber value={847} label="Clínicas Ativas" />
                        <GlowNumber value={284000} label="Pacientes Atendidos" color="cyan" />
                        <GlowNumber value={98} label="% Satisfação" color="emerald" />
                        <GlowNumber value={70} label="% Menos Espera" color="purple" />
                    </div>
                </div>
            </section>

            {/* ========== HOW IT WORKS ========== */}
            <section className="relative z-10 py-24 sm:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-emerald-400 text-sm font-bold uppercase tracking-widest">Como Funciona</span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
                            Simples como{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                1, 2, 3, 4
                            </span>
                        </h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            Em menos de 1 minuto seu paciente está na fila digital, sem precisar baixar nenhum app.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
                        <StepCard number={1} icon={QrCode} title="Escaneie" description="Aponte a câmera do celular para o QR Code na recepção" />
                        <StepCard number={2} icon={Ticket} title="Retire a Senha" description="Toque no botão e receba sua senha digital instantaneamente" />
                        <StepCard number={3} icon={Smartphone} title="Acompanhe" description="Veja sua posição e tempo estimado em tempo real" />
                        <StepCard number={4} icon={Volume2} title="Seja Chamado" description="Receba notificação sonora quando for sua vez" isLast />
                    </div>
                </div>
            </section>

            {/* ========== FEATURES BENTO GRID ========== */}
            <section className="relative z-10 py-24 sm:py-32 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-emerald-400 text-sm font-bold uppercase tracking-widest">Recursos</span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-4 mb-6">
                            Tudo que você precisa,{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                em um só lugar
                            </span>
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <FeatureCard key={i} {...f} delay={i * 100} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== JOIN FORM SECTION ========== */}
            <section className="relative z-10 py-24 sm:py-32">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <AnimatedGradientBorder className="p-8 sm:p-12">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Entrar na Fila Agora</h2>
                            <p className="text-slate-400">Digite o código da clínica ou escaneie o QR Code</p>
                        </div>

                        <form onSubmit={handleJoin} className="space-y-4 max-w-md mx-auto">
                            <input
                                type="text"
                                placeholder="Código da clínica (ex: demo)"
                                value={clinicId}
                                onChange={(e) => setClinicId(e.target.value)}
                                className="w-full h-14 px-5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all text-lg"
                            />
                            <button
                                type="submit"
                                disabled={loading || !clinicId.trim()}
                                className="w-full h-14 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                            >
                                {loading ? (
                                    <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Entrar Agora <ArrowRight size={22} /></>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-white/5">
                            <button
                                onClick={() => setShowQR(!showQR)}
                                className="w-full text-center text-sm text-slate-400 hover:text-white flex items-center justify-center gap-2 transition-colors"
                            >
                                <QrCode size={18} />
                                {showQR ? 'Esconder' : 'Ver'} QR Code da Demo
                            </button>
                            {showQR && (
                                <div className="mt-6 flex justify-center animate-slide-up">
                                    <div className="p-5 bg-white rounded-2xl shadow-2xl">
                                        <QRCodeSVG value={demoUrl} size={180} bgColor="#ffffff" fgColor="#0f172a" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </AnimatedGradientBorder>
                </div>
            </section>

            {/* ========== TESTIMONIALS ========== */}
            <section className="relative z-10 py-24 sm:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-emerald-400 text-sm font-bold uppercase tracking-widest">Depoimentos</span>
                        <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-6">
                            Amado por clínicas em todo Brasil
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <TestimonialCard key={i} {...t} delay={i * 150} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== FINAL CTA ========== */}
            <section className="relative z-10 py-24 sm:py-32">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="p-10 sm:p-16 rounded-[3rem] bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent border border-emerald-500/20">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                            Pronto para eliminar filas?
                        </h2>
                        <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto">
                            Junte-se a centenas de clínicas que já revolucionaram o atendimento com FilaZero.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/clinic/demo')}
                                className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-500/20 hover:scale-[1.02]"
                            >
                                <Sparkles size={22} />
                                Começar Agora
                                <ArrowRight size={22} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== FOOTER ========== */}
            <footer className="relative z-10 border-t border-white/5 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                                <QrCode size={18} className="text-white" />
                            </div>
                            <span className="font-bold text-lg">FilaZero</span>
                            <span className="text-slate-500">© 2025</span>
                        </div>

                        <p className="text-slate-400 text-sm text-center">
                            Desenvolvido por{' '}
                            <a href="https://linkedin.com/in/devferreirag" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline font-medium">
                                Gabriel Lima Ferreira
                            </a>
                        </p>

                        <div className="flex items-center gap-5">
                            <a href="https://github.com/glferreira-devsecops" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                                <Github size={22} />
                            </a>
                            <a href="https://linkedin.com/in/devferreirag" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                                <Linkedin size={22} />
                            </a>
                            <a href="mailto:glferreira.devops@gmail.com" className="text-slate-400 hover:text-white transition-colors">
                                <Mail size={22} />
                            </a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ========== TUTORIAL MODAL ========== */}
            {showTutorial && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                    <div className="relative w-full max-w-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                        {/* Close */}
                        <button onClick={() => setShowTutorial(false)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10">
                            <X size={20} />
                        </button>

                        {/* Progress */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300" style={{ width: `${((tutorialStep + 1) / tutorialSteps.length) * 100}%` }} />
                        </div>

                        {/* Header */}
                        <div className="p-6 pt-10 border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                    {(() => { const IconComp = tutorialSteps[tutorialStep].icon; return <IconComp size={28} className="text-white" />; })()}
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase tracking-wider font-medium">Passo {tutorialStep + 1} de {tutorialSteps.length}</p>
                                    <h3 className="text-2xl font-bold">{tutorialSteps[tutorialStep].title}</h3>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            {/* Visual */}
                            <div className="flex justify-center mb-8">
                                {tutorialStep === 0 && (
                                    <div className="p-6 bg-white rounded-2xl shadow-2xl">
                                        <QRCodeSVG value={demoUrl} size={180} bgColor="#ffffff" fgColor="#0f172a" />
                                    </div>
                                )}
                                {tutorialStep === 1 && (
                                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-8 text-center shadow-xl shadow-emerald-500/30">
                                        <p className="text-emerald-100 text-xs uppercase mb-2">Sua Senha</p>
                                        <div className="text-7xl font-black text-white animate-pulse">42</div>
                                        <span className="inline-block mt-3 px-4 py-1 bg-white/20 text-white text-sm font-bold rounded-full">AGUARDANDO</span>
                                    </div>
                                )}
                                {tutorialStep === 2 && (
                                    <div className="bg-slate-800 rounded-2xl p-8 flex gap-12">
                                        <div className="text-center">
                                            <div className="text-5xl font-black text-emerald-400">3</div>
                                            <p className="text-slate-400 mt-1">na frente</p>
                                        </div>
                                        <div className="w-px bg-white/10" />
                                        <div className="text-center">
                                            <div className="text-5xl font-black text-white">~15</div>
                                            <p className="text-slate-400 mt-1">minutos</p>
                                        </div>
                                    </div>
                                )}
                                {tutorialStep === 3 && (
                                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-center shadow-xl animate-bounce">
                                        <Volume2 size={48} className="text-white mx-auto mb-3" />
                                        <p className="text-white font-bold uppercase text-lg mb-2">É Sua Vez!</p>
                                        <div className="text-6xl font-black text-white">42</div>
                                    </div>
                                )}
                            </div>

                            <p className="text-slate-300 text-center text-lg mb-6">{tutorialSteps[tutorialStep].desc}</p>

                            <div className="flex justify-center">
                                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                                    <Check size={18} />
                                    Funciona com qualquer celular!
                                </span>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="p-6 bg-black/30 border-t border-white/5 flex items-center justify-between">
                            <button onClick={() => setTutorialStep(Math.max(0, tutorialStep - 1))} disabled={tutorialStep === 0} className="px-5 py-2.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium">
                                Anterior
                            </button>

                            <div className="flex gap-2">
                                {tutorialSteps.map((_, i) => (
                                    <button key={i} onClick={() => setTutorialStep(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === tutorialStep ? 'bg-emerald-400 w-8' : 'bg-white/20 hover:bg-white/40'}`} />
                                ))}
                            </div>

                            {tutorialStep < tutorialSteps.length - 1 ? (
                                <button onClick={() => setTutorialStep(tutorialStep + 1)} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 rounded-xl font-bold flex items-center gap-2 transition-colors">
                                    Próximo <ChevronRight size={18} />
                                </button>
                            ) : (
                                <button onClick={() => { setShowTutorial(false); navigate('/clinic/demo'); }} className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 rounded-xl font-bold flex items-center gap-2 transition-colors">
                                    Testar <ExternalLink size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
