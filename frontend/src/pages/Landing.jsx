import { ArrowRight, Check, ChevronRight, Clock, Github, Linkedin, Mail, Monitor, Play, QrCode, Shield, ShieldCheck, Smartphone, Sparkles, Star, Ticket, TrendingUp, Users, Volume2, X, Zap } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { sanitizeClinicId } from '../utils/security';

/**
 * PREMIUM LANDING PAGE - Clean & Responsive
 * Properly organized with no overlapping elements
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

    // Animated stats
    const [statsRef, statsInView] = useInView(0.3);
    const clinicsCount = useCountUp(847, 2000, 0, statsInView);
    const patientsCount = useCountUp(284, 2000, 200, statsInView);
    const satisfactionCount = useCountUp(98, 2000, 400, statsInView);

    const tutorialSteps = [
        { icon: QrCode, title: 'Escaneie o QR Code', desc: 'Aponte a câmera do celular para o QR Code na recepção da clínica.', tip: 'Funciona com qualquer smartphone!' },
        { icon: Ticket, title: 'Retire Sua Senha', desc: 'Toque em "Retirar Senha" para entrar na fila digital instantaneamente.', tip: 'Sem filas, sem papel!' },
        { icon: Smartphone, title: 'Acompanhe em Tempo Real', desc: 'Veja sua posição e tempo estimado. Receba notificações.', tip: 'Você será notificado!' },
        { icon: Volume2, title: 'É Sua Vez!', desc: 'Quando chamado, seu celular vibra e toca. Dirija-se ao atendimento.', tip: 'Simples assim!' },
    ];

    const features = [
        { icon: QrCode, title: 'QR Code Instantâneo', desc: 'Entre na fila em segundos', color: 'emerald' },
        { icon: Clock, title: 'Tempo Real', desc: 'Acompanhe sua posição ao vivo', color: 'cyan' },
        { icon: Shield, title: 'Privacidade Total', desc: 'Seu nome não aparece no telão', color: 'blue' },
        { icon: Volume2, title: 'Notificações', desc: 'Alertas quando for sua vez', color: 'purple' },
        { icon: Monitor, title: 'Painel TV', desc: 'Display para sala de espera', color: 'rose' },
        { icon: TrendingUp, title: 'Relatórios', desc: 'Métricas de atendimento', color: 'amber' },
    ];

    const testimonials = [
        { quote: 'Reduziu o tempo de espera em 70%. Os pacientes adoram!', name: 'Dra. Marina Costa', role: 'Clínica Vida Plena' },
        { quote: 'Interface intuitiva, minha equipe aprendeu em minutos.', name: 'Dr. Ricardo Silva', role: 'Centro Médico ABC' },
        { quote: 'O melhor investimento que fizemos este ano.', name: 'Ana Beatriz', role: 'Hospital São Lucas' },
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
        <div className="min-h-screen bg-[#0a0f1a] text-white">
            {/* Background Effects - Fixed, behind everything */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[120px]" />
                <div className="absolute top-1/2 -right-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[100px]" />
                <div className="absolute -bottom-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px]" />
            </div>

            {/* Skip Link for Accessibility */}
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-500 focus:text-white focus:rounded-lg">
                Pular para conteúdo principal
            </a>

            {/* ========== NAVBAR ========== */}
            <nav className="sticky top-0 z-50 bg-[#0a0f1a]/90 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <QrCode size={20} className="text-white" />
                        </div>
                        <span className="font-bold text-xl">FilaZero</span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
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
                            Admin
                        </button>
                    </div>
                </div>
            </nav>

            {/* ========== HERO SECTION ========== */}
            <section id="main-content" className="relative z-10 py-12 sm:py-20 lg:py-28">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                        {/* Left: Content */}
                        <div className="text-center lg:text-left space-y-6">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                <Sparkles size={16} className="text-emerald-400" />
                                <span className="text-sm font-medium text-emerald-400">Sistema Premium de Filas</span>
                            </div>

                            {/* Headline */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
                                Elimine filas.{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                    Revolucione o atendimento.
                                </span>
                            </h1>

                            {/* Subheadline */}
                            <p className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0">
                                Seus pacientes acompanham a fila pelo celular em tempo real.{' '}
                                <strong className="text-white">Sem aglomerações, sem estresse.</strong>
                            </p>

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                                <button
                                    onClick={() => setShowTutorial(true)}
                                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Play size={20} />
                                    Ver Tutorial
                                </button>
                                <button
                                    onClick={() => navigate('/clinic/demo')}
                                    className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                                >
                                    <Sparkles size={20} className="text-emerald-400" />
                                    Testar Demo
                                </button>
                            </div>

                            {/* Stats */}
                            <div ref={statsRef} className="flex items-center justify-center lg:justify-start gap-6 sm:gap-10 pt-6 border-t border-white/5">
                                <div className="text-center">
                                    <div className="text-2xl sm:text-3xl font-black text-white">{clinicsCount}+</div>
                                    <p className="text-slate-500 text-xs uppercase tracking-wider">Clínicas</p>
                                </div>
                                <div className="w-px h-10 bg-white/10" />
                                <div className="text-center">
                                    <div className="text-2xl sm:text-3xl font-black text-emerald-400">{patientsCount}k</div>
                                    <p className="text-slate-500 text-xs uppercase tracking-wider">Pacientes</p>
                                </div>
                                <div className="w-px h-10 bg-white/10" />
                                <div className="text-center">
                                    <div className="text-2xl sm:text-3xl font-black text-cyan-400">{satisfactionCount}%</div>
                                    <p className="text-slate-500 text-xs uppercase tracking-wider">Satisfação</p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Join Card + Phone Preview */}
                        <div className="space-y-6">
                            {/* Join Card */}
                            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
                                <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                                    <Ticket size={24} className="text-emerald-400" />
                                    Entrar na Fila
                                </h2>
                                <p className="text-slate-400 text-sm mb-6">Digite o código da clínica ou escaneie o QR</p>

                                <form onSubmit={handleJoin} className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Código da clínica (ex: demo)"
                                        value={clinicId}
                                        onChange={(e) => setClinicId(e.target.value)}
                                        className="w-full h-14 px-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading || !clinicId.trim()}
                                        className="w-full h-14 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>Entrar Agora <ArrowRight size={20} /></>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-6 pt-6 border-t border-white/5">
                                    <button
                                        onClick={() => setShowQR(!showQR)}
                                        className="w-full text-sm text-slate-400 hover:text-white flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <QrCode size={16} />
                                        {showQR ? 'Esconder' : 'Ver'} QR Code da Demo
                                    </button>
                                    {showQR && (
                                        <div className="mt-4 flex justify-center">
                                            <div className="p-4 bg-white rounded-2xl shadow-xl">
                                                <QRCodeSVG value={demoUrl} size={150} bgColor="#ffffff" fgColor="#0f172a" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Preview Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 text-center">
                                    <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Sua Senha</p>
                                    <div className="text-4xl font-black text-white">42</div>
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full">
                                        AGUARDANDO
                                    </span>
                                </div>
                                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-center">
                                    <div className="text-3xl font-black text-emerald-400">3</div>
                                    <p className="text-slate-500 text-xs">na frente</p>
                                    <div className="w-8 h-px bg-white/10 mx-auto my-2" />
                                    <div className="text-xl font-bold text-white">~15 min</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== FEATURES SECTION ========== */}
            <section className="relative z-10 py-16 sm:py-24 bg-gradient-to-b from-transparent to-slate-900/30">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Tudo que você precisa,{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                                em um só lugar
                            </span>
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto">
                            Sistema completo de gestão de filas para a experiência perfeita
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {features.map((f, i) => (
                            <div
                                key={i}
                                className={`p-6 rounded-2xl bg-${f.color}-500/10 border border-${f.color}-500/20 hover:scale-[1.02] transition-transform`}
                            >
                                <div className={`w-12 h-12 rounded-xl bg-${f.color}-500/20 flex items-center justify-center mb-4`}>
                                    <f.icon size={24} className={`text-${f.color}-400`} />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">{f.title}</h3>
                                <p className="text-slate-400 text-sm">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== TESTIMONIALS ========== */}
            <section className="relative z-10 py-16 sm:py-24">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            O que nossos clientes dizem
                        </h2>
                        <p className="text-slate-400">Centenas de clínicas já transformaram o atendimento</p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 transition-colors">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, j) => (
                                        <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-slate-300 text-sm mb-4 italic">"{t.quote}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                                        {t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">{t.name}</p>
                                        <p className="text-slate-500 text-xs">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== TRUST BADGES ========== */}
            <section className="relative z-10 py-12 border-t border-b border-white/5">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                            <ShieldCheck size={18} className="text-emerald-400" />
                            <span className="text-sm text-slate-300">LGPD Compliant</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                            <Shield size={18} className="text-emerald-400" />
                            <span className="text-sm text-slate-300">SSL Seguro</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                            <Zap size={18} className="text-emerald-400" />
                            <span className="text-sm text-slate-300">99.9% Uptime</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                            <Users size={18} className="text-emerald-400" />
                            <span className="text-sm text-slate-300">Suporte 24/7</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== FINAL CTA ========== */}
            <section className="relative z-10 py-16 sm:py-24">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
                    <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 border border-emerald-500/20">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Pronto para eliminar filas?
                        </h2>
                        <p className="text-slate-300 mb-8 max-w-lg mx-auto">
                            Junte-se a centenas de clínicas que já revolucionaram o atendimento
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/clinic/demo')}
                                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                            >
                                Começar Agora <ArrowRight size={20} />
                            </button>
                            <button
                                onClick={() => setShowTutorial(true)}
                                className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                            >
                                <Play size={20} className="text-emerald-400" />
                                Ver Demo
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ========== FOOTER ========== */}
            <footer className="relative z-10 border-t border-white/5 py-8 sm:py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                                <QrCode size={16} className="text-white" />
                            </div>
                            <span className="font-bold">FilaZero</span>
                            <span className="text-slate-500 text-sm">© 2025</span>
                        </div>

                        <p className="text-slate-400 text-sm text-center sm:text-left">
                            Desenvolvido por{' '}
                            <a href="https://linkedin.com/in/devferreirag" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                                Gabriel Lima Ferreira
                            </a>
                        </p>

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
                    <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
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
                        <div className="p-6 pt-8 border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
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
                        <div className="p-6">
                            {/* Visual */}
                            <div className="flex justify-center mb-6">
                                {tutorialStep === 0 && (
                                    <div className="p-6 bg-white rounded-2xl shadow-xl">
                                        <QRCodeSVG value={demoUrl} size={150} bgColor="#ffffff" fgColor="#0f172a" />
                                    </div>
                                )}
                                {tutorialStep === 1 && (
                                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-center">
                                        <p className="text-emerald-100 text-xs uppercase mb-1">Sua Senha</p>
                                        <div className="text-6xl font-black text-white animate-pulse">42</div>
                                        <span className="inline-block mt-2 px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full">AGUARDANDO</span>
                                    </div>
                                )}
                                {tutorialStep === 2 && (
                                    <div className="bg-slate-800 rounded-2xl p-6 flex gap-8">
                                        <div className="text-center">
                                            <div className="text-4xl font-black text-emerald-400">3</div>
                                            <p className="text-slate-400 text-sm">na frente</p>
                                        </div>
                                        <div className="w-px bg-white/10" />
                                        <div className="text-center">
                                            <div className="text-4xl font-black text-white">~15</div>
                                            <p className="text-slate-400 text-sm">minutos</p>
                                        </div>
                                    </div>
                                )}
                                {tutorialStep === 3 && (
                                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-center animate-bounce">
                                        <Volume2 size={40} className="text-white mx-auto mb-2" />
                                        <p className="text-white font-bold uppercase mb-1">É SUA VEZ!</p>
                                        <div className="text-5xl font-black text-white">42</div>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <p className="text-slate-300 text-center mb-4">
                                {tutorialSteps[tutorialStep].desc}
                            </p>
                            <div className="flex justify-center">
                                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                                    <Check size={16} />
                                    {tutorialSteps[tutorialStep].tip}
                                </span>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="p-6 bg-black/20 border-t border-white/5 flex items-center justify-between">
                            <button
                                onClick={() => setTutorialStep(Math.max(0, tutorialStep - 1))}
                                disabled={tutorialStep === 0}
                                className="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium"
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
                                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 rounded-lg font-bold flex items-center gap-1 transition-colors"
                                >
                                    Próximo <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setShowTutorial(false);
                                        navigate('/clinic/demo');
                                    }}
                                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 rounded-lg font-bold flex items-center gap-1 transition-colors"
                                >
                                    Testar <ArrowRight size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
