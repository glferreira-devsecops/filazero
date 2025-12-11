import { ArrowRight, ChevronDown, ChevronRight, Clock, ExternalLink, Github, Linkedin, Mail, Monitor, MousePointerClick, Play, QrCode, Shield, ShieldCheck, Smartphone, Sparkles, Star, Ticket, TrendingUp, Users, Volume2, X, Zap } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { sanitizeClinicId } from '../utils/security';

/**
 * ULTRA-PREMIUM LANDING PAGE 2025
 *
 * Técnicas implementadas:
 * - Glassmorphism 2.0 (vidro fosco com profundidade)
 * - Bento Grid (layout modular inspirado em caixas japonesas)
 * - Parallax Scrolling (movimento em camadas)
 * - Scroll-Based Storytelling (revelação progressiva)
 * - Interactive Product Demo (tutorial interativo)
 * - Animated 3D Phone Mockup (preview realista)
 * - Micro-interactions (feedback tátil em cada elemento)
 * - Gradient Mesh Background (fundo orgânico animado)
 * - Floating Particles (partículas ambiente)
 * - Magnetic Buttons (botões que seguem o cursor)
 * - Animated Counters (contadores com easing)
 * - Staggered Reveal (revelação escalonada)
 * - Social Proof (depoimentos com avatares)
 * - Trust Badges (selos de confiança)
 */

// ============================================
// CUSTOM HOOKS
// ============================================

// Hook para parallax suave
const useParallax = (speed = 0.5) => {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setOffset(window.pageYOffset * speed);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [speed]);

    return offset;
};

// Hook para contadores animados
const useCountUp = (end, duration = 2000, delay = 0) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
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
    }, [end, duration, delay]);

    return count;
};

// Hook para detectar visibilidade (scroll reveal)
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

// Hook para mouse position (magnetic effect)
const useMousePosition = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return position;
};

// ============================================
// SUB-COMPONENTS
// ============================================

// Gradient Mesh Background
const GradientMesh = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Primary gradient orbs */}
        <div className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-emerald-500/20 to-transparent blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 -right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-cyan-500/15 to-transparent blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-1/4 left-1/3 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-blue-500/10 to-transparent blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
    </div>
);

// Floating Particles
const FloatingParticles = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
            <div
                key={i}
                className="absolute w-1 h-1 bg-white/20 rounded-full"
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `float ${10 + Math.random() * 20}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 5}s`
                }}
            />
        ))}
        <style>{`
            @keyframes float {
                0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
                50% { transform: translateY(-100px) translateX(50px); opacity: 0.6; }
            }
        `}</style>
    </div>
);

// 3D Phone Mockup with Live Preview
const PhoneMockup = ({ ticketNumber = 42, position = 3, waitTime = 15 }) => {
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 3000);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative perspective-1000">
            {/* Phone frame */}
            <div className="relative w-[280px] h-[560px] bg-gradient-to-b from-slate-800 to-slate-900 rounded-[3rem] p-2 shadow-2xl shadow-black/50 transform rotate-y-[-5deg] rotate-x-[5deg] transition-transform duration-500 hover:rotate-y-0 hover:rotate-x-0">
                {/* Screen bezel */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-900 rounded-b-2xl z-10 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-700" />
                    <div className="w-12 h-1 rounded-full bg-slate-700" />
                </div>

                {/* Screen */}
                <div className="relative w-full h-full bg-[#0a0f1a] rounded-[2.5rem] overflow-hidden">
                    {/* Status bar */}
                    <div className="flex items-center justify-between px-6 py-2 text-[10px] text-white/60">
                        <span>9:41</span>
                        <div className="flex items-center gap-1">
                            <div className="w-4 h-2 border border-white/40 rounded-sm">
                                <div className="w-3/4 h-full bg-emerald-400 rounded-sm" />
                            </div>
                        </div>
                    </div>

                    {/* App content */}
                    <div className="px-4 pt-4">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center">
                                    <QrCode size={16} className="text-white" />
                                </div>
                                <span className="font-bold text-white text-sm">FilaZero</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                <Users size={14} className="text-white/60" />
                            </div>
                        </div>

                        {/* Ticket Card */}
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-6 mb-4 shadow-xl shadow-emerald-500/30">
                            <p className="text-emerald-100 text-xs uppercase tracking-widest mb-1">Sua Senha</p>
                            <div className="text-6xl font-black text-white mb-2">{ticketNumber}</div>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full">
                                    AGUARDANDO
                                </span>
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            </div>
                        </div>

                        {/* Position info */}
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                            <div className="flex items-center justify-between">
                                <div className="text-center">
                                    <div className="text-3xl font-black text-emerald-400">{position}</div>
                                    <p className="text-slate-500 text-xs">na frente</p>
                                </div>
                                <div className="w-px h-12 bg-white/10" />
                                <div className="text-center">
                                    <div className="text-3xl font-black text-white">~{waitTime}</div>
                                    <p className="text-slate-500 text-xs">minutos</p>
                                </div>
                                <div className="w-px h-12 bg-white/10" />
                                <div className="text-center">
                                    <Clock size={24} className="text-cyan-400 mx-auto" />
                                    <p className="text-slate-500 text-xs">tempo</p>
                                </div>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="mt-4">
                            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                                <span>Progresso</span>
                                <span>75%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full w-3/4 bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Notification popup */}
                    {showNotification && (
                        <div className="absolute top-16 left-4 right-4 bg-emerald-500 rounded-2xl p-3 shadow-xl animate-slideDown">
                            <div className="flex items-center gap-3">
                                <Volume2 size={20} className="text-white" />
                                <div>
                                    <p className="text-white font-bold text-sm">Falta pouco!</p>
                                    <p className="text-emerald-100 text-xs">Apenas 3 pessoas na sua frente</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Reflection */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[200px] h-[50px] bg-gradient-to-t from-emerald-500/10 to-transparent blur-2xl" />

            <style>{`
                @keyframes slideDown {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slideDown { animation: slideDown 0.3s ease-out; }
                .perspective-1000 { perspective: 1000px; }
                .rotate-y-\\[-5deg\\] { transform: rotateY(-5deg) rotateX(5deg); }
            `}</style>
        </div>
    );
};

// Magnetic Button Component
const MagneticButton = ({ children, onClick, className = '', primary = false }) => {
    const buttonRef = useRef(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        const rect = buttonRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
        setOffset({ x, y });
    };

    const handleMouseLeave = () => setOffset({ x: 0, y: 0 });

    const baseClass = primary
        ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-xl shadow-emerald-500/20"
        : "bg-white/5 hover:bg-white/10 border border-white/10 text-white";

    return (
        <button
            ref={buttonRef}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`relative px-8 py-4 rounded-2xl font-bold transition-all duration-200 flex items-center justify-center gap-3 ${baseClass} ${className}`}
            style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
        >
            {children}
        </button>
    );
};

// Animated Stat Card
const AnimatedStatCard = ({ value, label, suffix = '', icon: Icon, delay = 0 }) => {
    const [ref, isInView] = useInView();
    const count = useCountUp(isInView ? value : 0, 2000, delay);

    return (
        <div ref={ref} className="text-center group">
            <div className="flex items-center justify-center gap-2 mb-1">
                {Icon && <Icon size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" />}
                <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
                    {count.toLocaleString()}{suffix}
                </span>
            </div>
            <p className="text-slate-500 text-xs uppercase tracking-wider font-medium">{label}</p>
        </div>
    );
};

// Testimonial Card
const TestimonialCard = ({ quote, name, role, avatar, delay = 0 }) => {
    const [ref, isInView] = useInView();

    return (
        <div
            ref={ref}
            className={`p-6 rounded-3xl bg-white/[0.03] backdrop-blur-sm border border-white/5 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                ))}
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">"{quote}"</p>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                    {avatar}
                </div>
                <div>
                    <p className="text-white font-semibold text-sm">{name}</p>
                    <p className="text-slate-500 text-xs">{role}</p>
                </div>
            </div>
        </div>
    );
};

// Bento Card
const BentoCard = ({ icon: Icon, title, description, gradient, size = 'normal', delay = 0 }) => {
    const [ref, isInView] = useInView();
    const sizeClasses = {
        normal: 'col-span-1',
        wide: 'col-span-1 sm:col-span-2',
        tall: 'col-span-1 row-span-2'
    };

    return (
        <div
            ref={ref}
            className={`${sizeClasses[size]} p-6 sm:p-8 rounded-3xl bg-gradient-to-br ${gradient} border border-white/5 transition-all duration-700 hover:scale-[1.02] hover:shadow-xl group ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icon size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-white/70 text-sm leading-relaxed">{description}</p>
        </div>
    );
};

// Trust Badge
const TrustBadge = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
        <Icon size={16} className="text-emerald-400" />
        <span className="text-slate-300 text-xs font-medium">{text}</span>
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

    const parallaxOffset = useParallax(0.3);

    // Tutorial steps with visuals
    const tutorialSteps = [
        {
            icon: QrCode,
            title: 'Escaneie o QR Code',
            desc: 'Ao chegar na clínica, aponte a câmera do seu celular para o QR Code na recepção.',
            tip: '💡 Funciona com qualquer smartphone!',
            visual: 'qr'
        },
        {
            icon: Ticket,
            title: 'Retire Sua Senha',
            desc: 'Toque em "Retirar Senha" para entrar na fila digital. Em 2 segundos você recebe sua senha.',
            tip: '⚡ Sem filas, sem papel!',
            visual: 'ticket'
        },
        {
            icon: Smartphone,
            title: 'Acompanhe em Tempo Real',
            desc: 'Veja sua posição na fila e o tempo estimado. Notificações quando estiver chegando sua vez.',
            tip: '🔔 Você será notificado!',
            visual: 'tracking'
        },
        {
            icon: Volume2,
            title: 'É Sua Vez!',
            desc: 'Quando for chamado, seu celular vai vibrar e tocar. Dirija-se ao atendimento.',
            tip: '✅ Simples assim!',
            visual: 'called'
        }
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

    // Bento features
    const bentoFeatures = [
        { icon: QrCode, title: 'QR Code Instantâneo', description: 'Entre na fila em segundos escaneando o código na recepção.', gradient: 'from-emerald-500/20 to-emerald-500/5', size: 'wide' },
        { icon: Clock, title: 'Tempo Real', description: 'Acompanhe sua posição e tempo estimado ao vivo.', gradient: 'from-cyan-500/20 to-cyan-500/5' },
        { icon: Shield, title: 'Privacidade', description: 'Seu nome não aparece no telão público.', gradient: 'from-blue-500/20 to-blue-500/5' },
        { icon: Volume2, title: 'Notificações', description: 'Alertas sonoros quando for sua vez.', gradient: 'from-purple-500/20 to-purple-500/5' },
        { icon: Monitor, title: 'Painel TV', description: 'Display profissional para sala de espera.', gradient: 'from-rose-500/20 to-rose-500/5' },
        { icon: TrendingUp, title: 'Métricas', description: 'Relatórios detalhados de atendimento.', gradient: 'from-amber-500/20 to-amber-500/5' },
    ];

    // Testimonials
    const testimonials = [
        { quote: 'Reduziu o tempo de espera em 70%. Os pacientes adoram!', name: 'Dra. Marina Costa', role: 'Clínica Vida Plena', avatar: 'MC' },
        { quote: 'Interface intuitiva, minha equipe aprendeu em minutos.', name: 'Dr. Ricardo Silva', role: 'Centro Médico ABC', avatar: 'RS' },
        { quote: 'O melhor investimento que fizemos este ano.', name: 'Ana Beatriz', role: 'Hospital São Lucas', avatar: 'AB' },
    ];

    // Tutorial Visual Component
    const TutorialVisual = ({ type }) => {
        if (type === 'qr') {
            return (
                <div className="relative bg-white rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-transform">
                    <QRCodeSVG value={demoUrl} size={200} bgColor="#ffffff" fgColor="#0f172a" />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg">
                        ESCANEIE AQUI
                    </div>
                </div>
            );
        }
        if (type === 'ticket') {
            return (
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-8 shadow-2xl">
                    <div className="text-center">
                        <p className="text-emerald-100 text-xs uppercase tracking-widest mb-2">Sua Senha</p>
                        <div className="text-7xl font-black text-white mb-2 animate-pulse">42</div>
                        <span className="px-4 py-1 bg-white/20 text-white text-xs font-bold rounded-full">
                            AGUARDANDO
                        </span>
                    </div>
                </div>
            );
        }
        if (type === 'tracking') {
            return (
                <div className="bg-slate-800/90 backdrop-blur rounded-3xl p-8 border border-white/10">
                    <div className="flex items-center justify-center gap-8">
                        <div className="text-center">
                            <div className="text-5xl font-black text-emerald-400">3</div>
                            <p className="text-slate-400 text-sm mt-1">na frente</p>
                        </div>
                        <div className="w-px h-16 bg-white/20" />
                        <div className="text-center">
                            <div className="text-5xl font-black text-white">~15</div>
                            <p className="text-slate-400 text-sm mt-1">minutos</p>
                        </div>
                    </div>
                </div>
            );
        }
        if (type === 'called') {
            return (
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-2xl animate-bounce">
                    <div className="text-center text-white">
                        <Volume2 size={48} className="mx-auto mb-4" />
                        <p className="text-lg font-bold uppercase tracking-widest mb-2">É SUA VEZ!</p>
                        <div className="text-6xl font-black">42</div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-[#0a0f1a] text-white overflow-x-hidden">
            <GradientMesh />
            <FloatingParticles />

            {/* Skip Link */}
            <a href="#main-content" className="skip-link">Pular para conteúdo principal</a>

            {/* ========== NAVBAR ========== */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/5">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <QrCode size={20} className="text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">FilaZero</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowTutorial(true)}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        >
                            <Play size={16} className="text-emerald-400" />
                            Como Funciona
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                        >
                            Acesso Admin
                        </button>
                    </div>
                </div>
            </nav>

            {/* ========== HERO SECTION ========== */}
            <section className="relative min-h-screen flex items-center pt-20">
                <div
                    className="container max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
                    style={{ transform: `translateY(${parallaxOffset}px)` }}
                >
                    {/* Left: Content */}
                    <div id="main-content" className="space-y-8 text-center lg:text-left">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
                            <Sparkles size={16} className="text-emerald-400" />
                            <span className="text-sm font-medium text-emerald-400">Sistema Premium de Filas</span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight">
                            Elimine filas.{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400">
                                Revolucione o atendimento.
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg sm:text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            Seus pacientes acompanham a fila pelo celular em tempo real.
                            <strong className="text-white"> Sem aglomerações, sem estresse.</strong>
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <MagneticButton primary onClick={() => setShowTutorial(true)}>
                                <MousePointerClick size={20} />
                                Ver Tutorial
                                <ChevronRight size={18} />
                            </MagneticButton>

                            <MagneticButton onClick={() => navigate('/clinic/demo')}>
                                <Sparkles size={20} className="text-emerald-400" />
                                Testar Demo
                            </MagneticButton>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 border-t border-white/5">
                            <AnimatedStatCard value={847} label="Clínicas" suffix="+" icon={TrendingUp} />
                            <div className="w-px h-12 bg-white/10" />
                            <AnimatedStatCard value={284} label="Mil Pacientes" suffix="k" delay={200} />
                            <div className="w-px h-12 bg-white/10" />
                            <AnimatedStatCard value={98} label="Satisfação" suffix="%" icon={Star} delay={400} />
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-4">
                            <TrustBadge icon={ShieldCheck} text="LGPD Compliant" />
                            <TrustBadge icon={Shield} text="SSL Seguro" />
                            <TrustBadge icon={Zap} text="99.9% Uptime" />
                        </div>
                    </div>

                    {/* Right: Phone Mockup + Join Form */}
                    <div className="relative flex items-center justify-center lg:justify-end">
                        {/* Join Card (floating) */}
                        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-[320px] bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl z-10 hidden xl:block">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Ticket size={20} className="text-emerald-400" />
                                Entrar na Fila
                            </h3>
                            <form onSubmit={handleJoin} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Código da clínica (ex: demo)"
                                    value={clinicId}
                                    onChange={(e) => setClinicId(e.target.value)}
                                    className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !clinicId.trim()}
                                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {loading ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>Entrar <ArrowRight size={18} /></>
                                    )}
                                </button>
                            </form>
                            <button
                                onClick={() => setShowQR(!showQR)}
                                className="w-full mt-4 text-sm text-slate-400 hover:text-white flex items-center justify-center gap-2 transition-colors"
                            >
                                <QrCode size={14} />
                                {showQR ? 'Esconder' : 'Ver'} QR Demo
                            </button>
                            {showQR && (
                                <div className="mt-4 flex justify-center">
                                    <div className="p-3 bg-white rounded-xl">
                                        <QRCodeSVG value={demoUrl} size={120} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Phone Mockup */}
                        <PhoneMockup />
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <ChevronDown size={32} className="text-white/30" />
                </div>
            </section>

            {/* ========== BENTO FEATURES ========== */}
            <section className="relative py-24 sm:py-32">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                            Tudo que você precisa,{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                em um só lugar
                            </span>
                        </h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            Sistema completo de gestão de filas projetado para a experiência perfeita
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bentoFeatures.map((feature, i) => (
                            <BentoCard key={i} {...feature} delay={i * 100} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== TESTIMONIALS ========== */}
            <section className="relative py-24 sm:py-32 bg-gradient-to-b from-transparent to-slate-900/50">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Amado por clínicas em todo Brasil
                        </h2>
                        <p className="text-slate-400">O que nossos clientes dizem</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <TestimonialCard key={i} {...t} delay={i * 150} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== FINAL CTA ========== */}
            <section className="relative py-24 sm:py-32">
                <div className="container max-w-4xl mx-auto px-4 sm:px-6 text-center">
                    <div className="p-12 rounded-[3rem] bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/20 backdrop-blur-sm">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                            Pronto para eliminar filas?
                        </h2>
                        <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
                            Junte-se a centenas de clínicas que já revolucionaram o atendimento
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <MagneticButton primary onClick={() => navigate('/clinic/demo')}>
                                Começar Agora
                                <ArrowRight size={20} />
                            </MagneticButton>
                            <MagneticButton onClick={() => setShowTutorial(true)}>
                                <Play size={20} className="text-emerald-400" />
                                Ver Demo
                            </MagneticButton>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== FOOTER ========== */}
            <footer className="border-t border-white/5 py-12">
                <div className="container max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                                <QrCode size={16} className="text-white" />
                            </div>
                            <span className="font-bold">FilaZero</span>
                            <span className="text-slate-500 text-sm">© 2025</span>
                        </div>

                        <div className="text-center md:text-left">
                            <p className="text-slate-400 text-sm">
                                Desenvolvido por{' '}
                                <a href="https://linkedin.com/in/devferreirag" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                                    Gabriel Lima Ferreira
                                </a>
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <a href="https://github.com/glferreira-devsecops" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                                <Github size={20} />
                            </a>
                            <a href="https://linkedin.com/in/devferreirag" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
                                <Linkedin size={20} />
                            </a>
                            <a href="mailto:glferreira.devops@gmail.com" className="text-slate-400 hover:text-white transition-colors">
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ========== TUTORIAL MODAL ========== */}
            {showTutorial && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-scaleIn">
                        {/* Close button */}
                        <button
                            onClick={() => setShowTutorial(false)}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
                        >
                            <X size={20} />
                        </button>

                        {/* Progress bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
                                style={{ width: `${((tutorialStep + 1) / tutorialSteps.length) * 100}%` }}
                            />
                        </div>

                        {/* Header */}
                        <div className="p-6 border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                    {(() => {
                                        const StepIcon = tutorialSteps[tutorialStep].icon;
                                        return <StepIcon size={24} className="text-emerald-400" />;
                                    })()}
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase tracking-wider">
                                        Passo {tutorialStep + 1} de {tutorialSteps.length}
                                    </p>
                                    <h3 className="text-xl font-bold">{tutorialSteps[tutorialStep].title}</h3>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 flex flex-col items-center gap-8">
                            <TutorialVisual type={tutorialSteps[tutorialStep].visual} />

                            <div className="text-center max-w-md">
                                <p className="text-slate-300 text-lg mb-4">
                                    {tutorialSteps[tutorialStep].desc}
                                </p>
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                                    {tutorialSteps[tutorialStep].tip}
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="p-6 bg-black/20 border-t border-white/5 flex items-center justify-between">
                            <button
                                onClick={() => setTutorialStep(Math.max(0, tutorialStep - 1))}
                                disabled={tutorialStep === 0}
                                className="px-6 py-3 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                Anterior
                            </button>

                            <div className="flex gap-2">
                                {tutorialSteps.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setTutorialStep(i)}
                                        className={`w-2 h-2 rounded-full transition-all ${i === tutorialStep ? 'bg-emerald-400 w-6' : 'bg-white/20 hover:bg-white/40'}`}
                                    />
                                ))}
                            </div>

                            {tutorialStep < tutorialSteps.length - 1 ? (
                                <button
                                    onClick={() => setTutorialStep(tutorialStep + 1)}
                                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 rounded-xl font-bold flex items-center gap-2 transition-colors"
                                >
                                    Próximo <ChevronRight size={18} />
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setShowTutorial(false);
                                        navigate('/clinic/demo');
                                    }}
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 rounded-xl font-bold flex items-center gap-2 transition-colors"
                                >
                                    Testar Agora <ExternalLink size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Join Form (shown only on small screens) */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 xl:hidden z-40">
                <form onSubmit={handleJoin} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Código da clínica"
                        value={clinicId}
                        onChange={(e) => setClinicId(e.target.value)}
                        className="flex-1 h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
                    />
                    <button
                        type="submit"
                        disabled={loading || !clinicId.trim()}
                        className="h-12 px-6 bg-emerald-500 hover:bg-emerald-400 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        <ArrowRight size={20} />
                    </button>
                </form>
            </div>

            {/* Custom animations */}
            <style>{`
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scaleIn { animation: scaleIn 0.3s ease-out; }

                .skip-link {
                    position: absolute;
                    top: -100%;
                    left: 50%;
                    transform: translateX(-50%);
                    padding: 1rem 2rem;
                    background: #10b981;
                    color: white;
                    z-index: 9999;
                    transition: top 0.3s;
                }
                .skip-link:focus {
                    top: 1rem;
                }
            `}</style>
        </div>
    );
}
