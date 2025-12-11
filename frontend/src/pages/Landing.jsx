import { ArrowRight, Award, Check, ChevronDown, Clock, Crown, Heart, MessageSquare, Monitor, Play, QrCode, Shield, Smartphone, Sparkles, Star, Timer, TrendingUp, Volume2, Zap } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { sanitizeClinicId } from '../utils/security';

/**
 * FilaZero - Ultra Premium Landing Page 2025
 *
 * Techniques Applied:
 * - Multi-layer Parallax with 3D perspective
 * - Gradient Mesh Background with animation
 * - Glassmorphism 2.0 (multiple layers)
 * - Staggered reveal animations
 * - Magnetic hover effects
 * - Morphing shapes
 * - Animated counters with easing
 * - Scroll-triggered animations
 * - Micro-interactions on every element
 * - Premium typography with custom sizing
 * - Floating particle effects
 * - Social proof with live updates
 * - Bento Grid 2.0 with depth
 * - Accessibility (WCAG 2.1 AA)
 */

// ============================================================================
// ANIMATION UTILITIES
// ============================================================================

const useParallax = (speed = 0.5) => {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setOffset(window.scrollY * speed);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [speed]);

    return offset;
};

const useCountUp = (end, duration = 2500, delay = 0) => {
    const [value, setValue] = useState(0);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const startTime = performance.now();
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Cubic ease out for smooth deceleration
                const eased = 1 - Math.pow(1 - progress, 4);
                setValue(Math.floor(end * eased));
                if (progress < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
        }, delay);
        return () => clearTimeout(timeout);
    }, [end, duration, delay]);

    return value;
};

const useInView = (threshold = 0.2) => {
    const ref = useRef(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIsInView(entry.isIntersecting),
            { threshold }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [threshold]);

    return [ref, isInView];
};

// ============================================================================
// PREMIUM COMPONENTS
// ============================================================================

const GradientMesh = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Primary gradient orbs with animation */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-gradient-to-r from-emerald-600/20 via-teal-500/15 to-cyan-400/10 rounded-full blur-[150px] animate-morph" />
        <div className="absolute bottom-[-30%] right-[-15%] w-[60%] h-[60%] bg-gradient-to-l from-blue-600/15 via-indigo-500/12 to-purple-500/8 rounded-full blur-[150px] animate-morph-delay" />
        <div className="absolute top-[40%] left-[30%] w-[50%] h-[50%] bg-gradient-to-br from-violet-500/8 to-fuchsia-500/5 rounded-full blur-[180px] animate-float-slow" />

        {/* Subtle grid overlay */}
        <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
                backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                `,
                backgroundSize: '80px 80px'
            }}
        />

        {/* Noise texture for depth */}
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
        />
    </div>
);

const FloatingParticles = () => {
    const particles = useMemo(() =>
        Array.from({ length: 20 }, (_, i) => ({
            id: i,
            size: Math.random() * 4 + 2,
            x: Math.random() * 100,
            y: Math.random() * 100,
            duration: Math.random() * 15 + 20,
            delay: Math.random() * 10
        })), []
    );

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="absolute rounded-full bg-white/10"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        animation: `particle-float ${p.duration}s ease-in-out ${p.delay}s infinite`
                    }}
                />
            ))}
        </div>
    );
};

const MagneticButton = ({ children, className, onClick, primary = false }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const ref = useRef(null);

    const handleMouseMove = useCallback((e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
        setPosition({ x, y });
    }, []);

    const handleMouseLeave = useCallback(() => {
        setPosition({ x: 0, y: 0 });
    }, []);

    return (
        <button
            ref={ref}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`relative group overflow-hidden ${className}`}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                transition: 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)'
            }}
        >
            {/* Shimmer effect */}
            {primary && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
            )}
            {children}
        </button>
    );
};

const AnimatedStatCard = ({ value, unit, label, icon: Icon, delay = 0 }) => {
    const count = useCountUp(value, 2500, delay);
    const [ref, inView] = useInView();

    return (
        <div
            ref={ref}
            className={`text-center p-6 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm transition-all duration-700 hover:bg-white/[0.06] hover:border-emerald-500/20 hover:scale-105 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {Icon && <Icon size={24} className="mx-auto mb-3 text-emerald-400" />}
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300">
                {inView ? count : 0}{unit}
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-widest mt-2 font-medium">{label}</div>
        </div>
    );
};

const TestimonialCard = ({ name, role, text, rating, avatar, delay }) => {
    const [ref, inView] = useInView();

    return (
        <div
            ref={ref}
            className={`group relative p-8 rounded-3xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all duration-500 hover:scale-[1.02] ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10">
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                    {[...Array(rating)].map((_, i) => (
                        <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
                    ))}
                </div>

                {/* Quote */}
                <p className="text-slate-300 text-lg leading-relaxed mb-8">"{text}"</p>

                {/* Author */}
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-xl font-bold shadow-lg shadow-emerald-500/20">
                        {avatar || name.charAt(0)}
                    </div>
                    <div>
                        <div className="font-bold text-white text-lg">{name}</div>
                        <div className="text-sm text-slate-500">{role}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BentoCard = ({ icon: Icon, title, description, gradient, size, delay, children, onClick }) => {
    const [ref, inView] = useInView();

    const sizeClasses = {
        'large': 'col-span-2 row-span-2',
        'medium': 'col-span-2 row-span-1',
        'small': 'col-span-1 row-span-1'
    };

    return (
        <div
            ref={ref}
            onClick={onClick}
            className={`
                ${sizeClasses[size] || 'col-span-1 row-span-1'}
                group relative rounded-3xl p-6 md:p-8 overflow-hidden cursor-pointer
                bg-gradient-to-br ${gradient}
                hover:scale-[1.02] transition-all duration-500
                ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col">
                <Icon size={size === 'large' ? 48 : 32} className="mb-4" />
                <h3 className={`font-black mb-2 ${size === 'large' ? 'text-2xl md:text-3xl' : 'text-xl'}`}>{title}</h3>
                <p className="text-white/80 flex-1">{description}</p>
                {children}
            </div>
        </div>
    );
};

const PhoneMockup = ({ parallaxOffset }) => {
    const tickets = [
        { number: 42, status: 'calling', room: 'Consultório 3' },
        { number: 43, status: 'waiting', room: 'Aguardando' },
        { number: 44, status: 'waiting', room: 'Aguardando' },
    ];

    return (
        <div
            className="relative"
            style={{ transform: `translateY(${parallaxOffset * 0.2}px)` }}
        >
            {/* Phone frame with premium finish */}
            <div className="relative bg-gradient-to-b from-slate-800 via-slate-900 to-black rounded-[3rem] p-2 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.8)] border border-white/10">
                {/* Side buttons */}
                <div className="absolute -left-1 top-24 w-1 h-8 bg-slate-700 rounded-l" />
                <div className="absolute -left-1 top-36 w-1 h-12 bg-slate-700 rounded-l" />
                <div className="absolute -left-1 top-52 w-1 h-12 bg-slate-700 rounded-l" />
                <div className="absolute -right-1 top-32 w-1 h-16 bg-slate-700 rounded-r" />

                {/* Inner frame */}
                <div className="bg-gradient-to-b from-slate-900 to-black rounded-[2.5rem] p-1">
                    {/* Screen */}
                    <div className="bg-[#0a0f1a] rounded-[2.3rem] min-h-[580px] overflow-hidden relative">
                        {/* Dynamic Island */}
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-8 bg-black rounded-full flex items-center justify-center gap-2 z-20">
                            <div className="w-2 h-2 bg-slate-700 rounded-full" />
                            <div className="w-3 h-3 bg-slate-800 rounded-full" />
                        </div>

                        {/* Status bar */}
                        <div className="flex items-center justify-between px-8 pt-4 text-xs text-slate-500">
                            <span className="w-12" />
                            <span className="font-semibold">9:41</span>
                            <div className="flex items-center gap-1 w-12 justify-end">
                                <div className="flex gap-0.5">
                                    <div className="w-1 h-2 bg-slate-600 rounded-sm" />
                                    <div className="w-1 h-3 bg-slate-600 rounded-sm" />
                                    <div className="w-1 h-4 bg-slate-600 rounded-sm" />
                                    <div className="w-1 h-3 bg-slate-700 rounded-sm" />
                                </div>
                            </div>
                        </div>

                        {/* App content */}
                        <div className="p-6 space-y-6 mt-4">
                            {/* Header */}
                            <div className="text-center">
                                <div className="inline-flex p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4">
                                    <QrCode size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-white">Clínica Bem-Estar</h3>
                                <p className="text-slate-500 text-sm">Atualizado agora</p>
                            </div>

                            {/* Current ticket */}
                            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-6 text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.15),transparent_50%)]" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-center gap-2 text-emerald-200 mb-2">
                                        <Volume2 size={18} className="animate-pulse" />
                                        <span className="text-sm font-semibold uppercase tracking-wider">Chamando</span>
                                    </div>
                                    <div className="text-7xl font-black text-white mb-2 animate-pulse">42</div>
                                    <div className="text-emerald-200 font-medium">Consultório 3</div>
                                </div>
                            </div>

                            {/* Queue list */}
                            <div className="space-y-3">
                                {tickets.slice(1).map((ticket, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="text-2xl font-bold text-white">{ticket.number}</div>
                                            <div className="text-sm text-slate-400">{ticket.room}</div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Clock size={14} />
                                            <span>~{(i + 1) * 5}min</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-8 p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl animate-float">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <Check size={24} className="text-white" />
                    </div>
                    <div>
                        <div className="font-bold text-white">Sem filas</div>
                        <div className="text-xs text-slate-400">100% digital</div>
                    </div>
                </div>
            </div>

            <div className="absolute -bottom-6 -left-12 p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl animate-float" style={{ animationDelay: '1.5s' }}>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Timer size={24} className="text-white" />
                    </div>
                    <div>
                        <div className="font-bold text-white">~8 min</div>
                        <div className="text-xs text-slate-400">Tempo médio</div>
                    </div>
                </div>
            </div>

            <div className="absolute top-1/3 -right-16 p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl animate-float" style={{ animationDelay: '2.5s' }}>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <Star size={24} className="text-white fill-white" />
                    </div>
                    <div>
                        <div className="font-bold text-white">4.9</div>
                        <div className="text-xs text-slate-400">Avaliação</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Landing() {
    const [clinicId, setClinicId] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();
    const parallaxOffset = useParallax(0.3);

    const handleJoin = async (e) => {
        e.preventDefault();
        const sanitized = sanitizeClinicId(clinicId);
        if (!sanitized) {
            addToast("Digite o código da clínica", "warning");
            return;
        }
        setLoading(true);
        await new Promise(r => setTimeout(r, 500));
        navigate(`/clinic/${sanitized}`);
    };

    const demoUrl = `${window.location.origin}/clinic/demo`;

    // Data
    const benefits = [
        { icon: Timer, title: 'Economia de Tempo', desc: 'Pacientes economizam em média 45 minutos por visita', stat: '45min', color: 'emerald' },
        { icon: TrendingUp, title: 'Mais Eficiência', desc: 'Aumento de 32% na produtividade da recepção', stat: '+32%', color: 'blue' },
        { icon: Heart, title: 'Satisfação', desc: 'NPS médio de 78 pontos nas clínicas parceiras', stat: 'NPS 78', color: 'rose' },
        { icon: Shield, title: 'Privacidade', desc: 'LGPD compliant. Sem exposição de dados pessoais', stat: '100%', color: 'violet' }
    ];

    const testimonials = [
        { name: 'Dra. Maria Santos', role: 'Diretora Clínica • Clínica Vida', text: 'Reduziu o tempo de espera em 60%. Nossos pacientes amam a experiência digital e a recepção ficou muito mais eficiente.', rating: 5 },
        { name: 'Carlos Oliveira', role: 'Gestor de TI • Hospital Central', text: 'Implementação em 1 dia. ROI em 2 semanas. A melhor decisão de tecnologia que fizemos este ano.', rating: 5 },
        { name: 'Ana Costa', role: 'Coord. Atendimento • Centro Médico Prime', text: 'Interface intuitiva. Zero treinamento necessário. Até nossos colaboradores mais resistentes adoraram.', rating: 5 }
    ];

    const features = [
        { icon: Smartphone, title: 'Zero App', desc: 'Funciona direto no navegador', gradient: 'from-blue-600 to-indigo-700' },
        { icon: Zap, title: '< 2 segundos', desc: 'Para retirar uma senha', gradient: 'from-amber-500 to-orange-600' },
        { icon: Monitor, title: 'Painel TV', desc: 'Display profissional', gradient: 'from-purple-600 to-pink-600' },
        { icon: Volume2, title: 'Chamada por Voz', desc: 'Anúncio automático', gradient: 'from-rose-500 to-red-600' }
    ];

    return (
        <div className="min-h-screen bg-[#050810] text-white font-sans overflow-x-hidden">
            {/* Background Effects */}
            <GradientMesh />
            <FloatingParticles />

            {/* ================================================================ */}
            {/* NAVBAR */}
            {/* ================================================================ */}
            <nav className="relative z-50 container max-w-7xl mx-auto px-6 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 group hover:scale-110 transition-transform">
                            <QrCode size={26} />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                        </div>
                        <div>
                            <span className="text-2xl font-black tracking-tight">FilaZero</span>
                            <span className="ml-2 px-2.5 py-1 text-[10px] font-bold bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 rounded-full uppercase tracking-widest border border-emerald-500/20">
                                Saúde
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/clinic/demo')}
                            className="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors group"
                        >
                            <Play size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                            Ver Demo
                        </button>
                        <MagneticButton
                            onClick={() => navigate('/login')}
                            className="px-6 py-3 text-sm font-bold bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                        >
                            Acesso Admin
                        </MagneticButton>
                    </div>
                </div>
            </nav>

            {/* ================================================================ */}
            {/* HERO SECTION */}
            {/* ================================================================ */}
            <section className="relative z-10 container max-w-7xl mx-auto px-6 pt-12 pb-32 md:pt-20 md:pb-40">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    {/* Left Content */}
                    <div className="space-y-10">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20 backdrop-blur-sm">
                            <div className="flex items-center gap-1">
                                <Crown size={14} className="text-amber-400" />
                                <Sparkles size={14} className="text-emerald-400" />
                            </div>
                            <span className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">
                                #1 em Fila Digital para Saúde
                            </span>
                        </div>

                        {/* Headline */}
                        <div className="space-y-6">
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight">
                                <span className="text-white">Elimine filas.</span>
                                <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 animate-gradient">
                                    Eleve a experiência.
                                </span>
                            </h1>
                            <p className="text-xl text-slate-400 max-w-xl leading-relaxed">
                                Sistema de fila digital que <strong className="text-white">transforma a experiência</strong> de pacientes e aumenta a eficiência da sua clínica em até <strong className="text-emerald-400">32%</strong>.
                            </p>
                        </div>

                        {/* CTA Group */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <MagneticButton
                                primary
                                onClick={() => navigate('/clinic/demo')}
                                className="group relative px-10 py-5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:via-emerald-400 hover:to-teal-400 rounded-2xl font-bold text-lg shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-3 overflow-hidden"
                            >
                                <span className="relative z-10">Testar Grátis</span>
                                <ArrowRight size={22} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                            </MagneticButton>
                            <MagneticButton
                                onClick={() => navigate('/login')}
                                className="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-semibold transition-all flex items-center justify-center gap-3"
                            >
                                <MessageSquare size={22} className="text-slate-400" />
                                Falar com Vendas
                            </MagneticButton>
                        </div>

                        {/* Social Proof Stats */}
                        <div className="flex items-center gap-10 pt-8 border-t border-white/5">
                            <AnimatedStatCard value={847} unit="+" label="Clínicas" delay={0} />
                            <AnimatedStatCard value={284} unit="k" label="Pacientes/mês" delay={200} />
                            <AnimatedStatCard value={4.9} unit="" label="Avaliação" icon={Star} delay={400} />
                        </div>
                    </div>

                    {/* Right: Phone Mockup */}
                    <div className="hidden lg:flex justify-center">
                        <PhoneMockup parallaxOffset={parallaxOffset} />
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500 animate-bounce">
                    <span className="text-xs uppercase tracking-widest">Descubra mais</span>
                    <ChevronDown size={20} />
                </div>
            </section>

            {/* ================================================================ */}
            {/* BENTO GRID FEATURES */}
            {/* ================================================================ */}
            <section className="relative z-10 container max-w-7xl mx-auto px-6 py-32">
                <div className="text-center mb-20">
                    <div className="inline-flex px-4 py-2 rounded-full bg-white/5 border border-white/5 text-sm text-slate-400 mb-6">
                        ✨ Tudo que você precisa em um só lugar
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black mb-6">
                        Funcionalidades <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Premium</span>
                    </h2>
                    <p className="text-slate-400 text-xl max-w-2xl mx-auto">
                        Uma plataforma completa para revolucionar o atendimento da sua clínica
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
                    {/* Main Feature - Large */}
                    <BentoCard
                        icon={QrCode}
                        title="Fila Digital Completa"
                        description="Escaneie o QR Code, retire sua senha e acompanhe em tempo real. Tudo no navegador."
                        gradient="from-emerald-600 via-emerald-500 to-teal-500"
                        size="large"
                        delay={0}
                        onClick={() => navigate('/clinic/demo')}
                    >
                        <div className="absolute bottom-6 right-6 p-4 bg-white rounded-2xl shadow-2xl opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all">
                            <QRCodeSVG value={demoUrl} size={100} bgColor="#ffffff" fgColor="#0f172a" />
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold mt-4 group-hover:gap-3 transition-all">
                            Ver Demo <ArrowRight size={16} />
                        </div>
                    </BentoCard>

                    {/* Small Features */}
                    {features.map((f, i) => (
                        <BentoCard
                            key={i}
                            icon={f.icon}
                            title={f.title}
                            description={f.desc}
                            gradient={f.gradient}
                            size="small"
                            delay={(i + 1) * 100}
                        />
                    ))}
                </div>
            </section>

            {/* ================================================================ */}
            {/* BENEFITS SECTION */}
            {/* ================================================================ */}
            <section className="relative z-10 container max-w-7xl mx-auto px-6 py-32">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <div className="inline-flex px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 mb-8">
                            💡 Resultados comprovados
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black mb-8">
                            Por que escolher <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">FilaZero</span>?
                        </h2>
                        <p className="text-slate-400 text-xl mb-12 leading-relaxed">
                            Mais de 847 clínicas já transformaram seu atendimento. Resultados reais, métricas comprovadas.
                        </p>

                        <div className="space-y-4">
                            {benefits.map((benefit, i) => (
                                <div
                                    key={i}
                                    className="group flex items-start gap-5 p-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-emerald-500/20 transition-all cursor-pointer"
                                >
                                    <div className={`p-4 rounded-xl bg-${benefit.color}-500/10 text-${benefit.color}-400 group-hover:bg-${benefit.color}-500 group-hover:text-white transition-all shadow-lg group-hover:shadow-${benefit.color}-500/30`}>
                                        <benefit.icon size={26} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xl font-bold text-white">{benefit.title}</h3>
                                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-sm">{benefit.stat}</span>
                                        </div>
                                        <p className="text-slate-400">{benefit.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 blur-3xl opacity-30" />
                        <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10 shadow-2xl">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
                                    <Award size={36} className="text-white" />
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-white">Líder de Mercado</div>
                                    <div className="text-slate-400">em soluções de fila digital para saúde</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <AnimatedStatCard value={847} unit="+" label="Clínicas ativas" delay={0} />
                                <AnimatedStatCard value={284} unit="k" label="Pacientes/mês" delay={150} />
                                <AnimatedStatCard value={67} unit="k" label="Horas economizadas" delay={300} />
                                <AnimatedStatCard value={4.9} unit="★" label="Google Reviews" delay={450} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================================ */}
            {/* TESTIMONIALS */}
            {/* ================================================================ */}
            <section className="relative z-10 container max-w-7xl mx-auto px-6 py-32">
                <div className="text-center mb-20">
                    <div className="inline-flex px-4 py-2 rounded-full bg-white/5 border border-white/5 text-sm text-slate-400 mb-6">
                        ⭐ Depoimentos reais
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black mb-6">
                        O que nossos <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">clientes</span> dizem
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <TestimonialCard key={i} {...t} delay={i * 150} />
                    ))}
                </div>
            </section>

            {/* ================================================================ */}
            {/* FINAL CTA */}
            {/* ================================================================ */}
            <section className="relative z-10 container max-w-5xl mx-auto px-6 py-32">
                <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 rounded-[3rem] p-16 md:p-20 text-center overflow-hidden">
                    {/* Background effects */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_40%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(0,0,0,0.2),transparent_40%)]" />

                    <div className="relative z-10">
                        <div className="inline-flex px-4 py-2 rounded-full bg-white/20 text-sm font-semibold mb-8">
                            🚀 Implementação em 24h
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black mb-8">
                            Pronto para eliminar filas?
                        </h2>
                        <p className="text-white/90 text-xl mb-12 max-w-2xl mx-auto">
                            Comece hoje mesmo. Teste grátis por 14 dias, sem compromisso. Implementação completa em menos de 24 horas.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                            <MagneticButton
                                onClick={() => navigate('/clinic/demo')}
                                className="px-12 py-5 bg-white text-emerald-700 rounded-2xl font-bold text-lg hover:bg-white/95 transition-all shadow-2xl shadow-black/30 flex items-center gap-3"
                            >
                                Testar Grátis Agora
                                <ArrowRight size={22} />
                            </MagneticButton>
                            <MagneticButton
                                onClick={() => navigate('/login')}
                                className="px-12 py-5 bg-white/10 hover:bg-white/20 rounded-2xl font-semibold transition-all border border-white/20"
                            >
                                Já tenho conta
                            </MagneticButton>
                        </div>
                    </div>
                </div>
            </section>

            {/* ================================================================ */}
            {/* FOOTER */}
            {/* ================================================================ */}
            <footer className="relative z-10 border-t border-white/5">
                <div className="container max-w-7xl mx-auto px-6 py-16">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 text-emerald-400 border border-emerald-500/20">
                                <QrCode size={24} />
                            </div>
                            <div>
                                <span className="font-bold text-lg">FilaZero Saúde</span>
                                <p className="text-sm text-slate-500">A revolução na experiência de atendimento</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-8 text-sm text-slate-500">
                            <a href="#" className="hover:text-white transition-colors">Termos</a>
                            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
                            <a href="#" className="hover:text-white transition-colors">LGPD</a>
                            <a href="#" className="hover:text-white transition-colors">Contato</a>
                        </div>

                        <div className="text-sm text-slate-500">
                            © {new Date().getFullYear()} FilaZero Technology. Todos os direitos reservados.
                        </div>
                    </div>
                </div>
            </footer>

            {/* ================================================================ */}
            {/* GLOBAL ANIMATIONS */}
            {/* ================================================================ */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0) scale(1); }
                    50% { transform: translateY(-30px) scale(1.05); }
                }
                @keyframes morph {
                    0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: rotate(0deg); }
                    50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; transform: rotate(180deg); }
                }
                @keyframes morph-delay {
                    0%, 100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: rotate(0deg); }
                    50% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: rotate(-180deg); }
                }
                @keyframes particle-float {
                    0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
                    10% { opacity: 0.8; }
                    50% { transform: translateY(-100px) translateX(20px); opacity: 0.4; }
                    90% { opacity: 0.8; }
                }
                @keyframes gradient {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                .animate-float {
                    animation: float 5s ease-in-out infinite;
                }
                .animate-float-slow {
                    animation: float-slow 15s ease-in-out infinite;
                }
                .animate-morph {
                    animation: morph 20s ease-in-out infinite;
                }
                .animate-morph-delay {
                    animation: morph-delay 25s ease-in-out infinite;
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 4s ease infinite;
                }
            `}</style>
        </div>
    );
}
