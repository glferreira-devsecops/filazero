import { ArrowRight, Award, Check, Heart, MessageSquare, Monitor, Play, QrCode, Shield, Smartphone, Sparkles, Star, Timer, TrendingUp, Volume2, Zap } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { sanitizeClinicId } from '../utils/security';

/**
 * Landing Page - Award-Winning Design
 * Techniques: Bento Grid, Glassmorphism, Micro-animations, Social Proof
 */
export default function Landing() {
    const [clinicId, setClinicId] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeFeature, setActiveFeature] = useState(0);
    const [animatedStats, setAnimatedStats] = useState({ clinics: 0, patients: 0, saved: 0, rating: 0 });
    const [isVisible, setIsVisible] = useState({});
    const navigate = useNavigate();
    const { addToast } = useToast();
    const heroRef = useRef(null);

    // Animate stats on mount
    useEffect(() => {
        const duration = 2500;
        const steps = 80;
        const interval = duration / steps;

        let step = 0;
        const timer = setInterval(() => {
            step++;
            const progress = Math.min(step / steps, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
            setAnimatedStats({
                clinics: Math.floor(847 * eased),
                patients: Math.floor(284000 * eased),
                saved: Math.floor(67000 * eased),
                rating: (4.9 * eased).toFixed(1)
            });
            if (step >= steps) clearInterval(timer);
        }, interval);

        return () => clearInterval(timer);
    }, []);

    // Rotate features
    useEffect(() => {
        const timer = setInterval(() => {
            setActiveFeature(prev => (prev + 1) % 4);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    // Intersection observer for animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
                    }
                });
            },
            { threshold: 0.1 }
        );

        document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const handleJoin = async (e) => {
        e.preventDefault();
        const sanitized = sanitizeClinicId(clinicId);
        if (!sanitized) {
            addToast("Digite o código da clínica", "warning");
            return;
        }

        setLoading(true);
        try {
            await new Promise(r => setTimeout(r, 500));
            navigate(`/clinic/${sanitized}`);
        } catch (error) {
            addToast("Erro ao acessar", "error");
        } finally {
            setLoading(false);
        }
    };

    const demoUrl = `${window.location.origin}/clinic/demo`;

    // Bento Grid Features
    const bentoFeatures = [
        {
            title: 'Fila Digital',
            desc: 'QR Code → Senha → Tempo Real',
            icon: QrCode,
            gradient: 'from-emerald-500 to-teal-600',
            size: 'col-span-2 row-span-2'
        },
        {
            title: 'Zero App',
            desc: 'Funciona no navegador',
            icon: Smartphone,
            gradient: 'from-blue-500 to-indigo-600',
            size: 'col-span-1 row-span-1'
        },
        {
            title: '< 2 segundos',
            desc: 'Para retirar senha',
            icon: Zap,
            gradient: 'from-amber-500 to-orange-600',
            size: 'col-span-1 row-span-1'
        },
        {
            title: 'Painel TV',
            desc: 'Display profissional',
            icon: Monitor,
            gradient: 'from-purple-500 to-pink-600',
            size: 'col-span-1 row-span-1'
        },
        {
            title: 'Chamada por Voz',
            desc: 'Anúncio automático',
            icon: Volume2,
            gradient: 'from-rose-500 to-red-600',
            size: 'col-span-1 row-span-1'
        }
    ];

    // Why FilaZero
    const benefits = [
        { icon: Timer, title: 'Economia de Tempo', desc: 'Pacientes economizam em média 45 minutos por visita', stat: '45min' },
        { icon: TrendingUp, title: 'Mais Eficiência', desc: 'Aumento de 32% na produtividade da recepção', stat: '+32%' },
        { icon: Heart, title: 'Satisfação', desc: 'NPS médio de 78 pontos nas clínicas parceiras', stat: 'NPS 78' },
        { icon: Shield, title: 'Privacidade', desc: 'LGPD compliant. Sem exposição de dados pessoais', stat: '100%' }
    ];

    // Testimonials
    const testimonials = [
        { name: 'Dra. Maria Santos', role: 'Clínica Vida', text: 'Reduziu o tempo de espera em 60%. Pacientes amam!', rating: 5 },
        { name: 'Carlos Oliveira', role: 'Hospital Central', text: 'Implementação em 1 dia. ROI em 2 semanas.', rating: 5 },
        { name: 'Ana Costa', role: 'Centro Médico', text: 'Interface intuitiva. Zero treinamento necessário.', rating: 5 }
    ];

    return (
        <div className="min-h-screen bg-[#0a0f1a] text-white font-sans overflow-x-hidden">

            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[200px]"></div>
            </div>

            {/* Grid Pattern Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02]"
                style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
            </div>

            {/* Navbar */}
            <nav className="relative z-50 container max-w-7xl mx-auto px-6 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/30">
                            <QrCode size={24} />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
                        </div>
                        <span className="text-xl font-bold tracking-tight">FilaZero</span>
                        <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full uppercase tracking-wider">
                            Saúde
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigate('/clinic/demo')}
                            className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                        >
                            <Play size={16} className="text-emerald-400" />
                            Ver Demo
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-5 py-2.5 text-sm font-semibold bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                        >
                            Acesso Admin
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section ref={heroRef} className="relative z-10 container max-w-7xl mx-auto px-6 pt-12 pb-24 md:pt-20 md:pb-32">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left: Content */}
                    <div className="space-y-8">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20">
                            <Sparkles size={14} className="text-emerald-400" />
                            <span className="text-xs font-semibold text-emerald-300">Tecnologia que transforma a saúde</span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight">
                            <span className="text-white">Elimine filas.</span>
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                                Eleve a experiência.
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg md:text-xl text-slate-400 max-w-lg leading-relaxed">
                            Sistema de fila digital que <strong className="text-white">transforma a experiência</strong> de pacientes e aumenta a eficiência da sua clínica.
                        </p>

                        {/* CTA Group */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                onClick={() => navigate('/clinic/demo')}
                                className="group relative px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-2xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-3"
                            >
                                <span>Testar Grátis</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-semibold transition-all flex items-center justify-center gap-3"
                            >
                                <MessageSquare size={20} className="text-slate-400" />
                                Falar com Vendas
                            </button>
                        </div>

                        {/* Social Proof Stats */}
                        <div className="flex items-center gap-8 pt-6 border-t border-white/5">
                            <div>
                                <div className="text-3xl font-black text-emerald-400">{animatedStats.clinics}+</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">Clínicas</div>
                            </div>
                            <div className="w-px h-12 bg-white/10"></div>
                            <div>
                                <div className="text-3xl font-black text-white">{(animatedStats.patients / 1000).toFixed(0)}k</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">Pacientes/mês</div>
                            </div>
                            <div className="w-px h-12 bg-white/10"></div>
                            <div>
                                <div className="flex items-center gap-1">
                                    <Star size={20} className="text-amber-400 fill-amber-400" />
                                    <span className="text-3xl font-black text-white">{animatedStats.rating}</span>
                                </div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">Avaliação</div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Interactive Demo */}
                    <div className="relative hidden lg:block">
                        {/* Floating Phone Mockup */}
                        <div className="relative z-10">
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[3rem] p-3 shadow-2xl shadow-black/50 border border-white/10 max-w-[320px] mx-auto transform hover:scale-[1.02] transition-transform duration-500">
                                {/* Phone Notch */}
                                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20"></div>

                                {/* Screen Content */}
                                <div className="bg-[#0f172a] rounded-[2.5rem] p-6 min-h-[500px] relative overflow-hidden">
                                    {/* Status Bar */}
                                    <div className="flex items-center justify-between text-xs text-slate-500 mb-8">
                                        <span>9:41</span>
                                        <div className="flex items-center gap-1">
                                            <div className="w-4 h-2 bg-slate-600 rounded-sm"></div>
                                        </div>
                                    </div>

                                    {/* App Content */}
                                    <div className="text-center space-y-6">
                                        <div className="inline-flex p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                            <QrCode size={48} />
                                        </div>

                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-2">Sua Vez!</h3>
                                            <p className="text-slate-400 text-sm">Dirija-se ao guichê</p>
                                        </div>

                                        <div className="py-8">
                                            <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 animate-pulse">
                                                42
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold">
                                            <Volume2 size={20} className="animate-bounce" />
                                            <span>Chamando...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute -top-6 -right-12 p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl animate-float">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                                        <Check size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold">Sem filas</div>
                                        <div className="text-xs text-slate-400">100% digital</div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -bottom-4 -left-16 p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl animate-float" style={{ animationDelay: '1s' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                                        <Timer size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold">~8 min</div>
                                        <div className="text-xs text-slate-400">Tempo médio</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bento Grid Features */}
            <section id="features" data-animate className="relative z-10 container max-w-7xl mx-auto px-6 py-24">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black mb-4">
                        Tudo que você precisa
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Uma plataforma completa para revolucionar o atendimento da sua clínica
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[180px]">
                    {/* Main Feature - Large */}
                    <div className="col-span-2 row-span-2 group relative bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10"></div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <QrCode size={48} className="mb-4" />
                                <h3 className="text-2xl font-bold mb-2">Fila Digital Completa</h3>
                                <p className="text-white/80">Escaneie o QR Code, retire sua senha e acompanhe em tempo real.</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                Ver Demo <ArrowRight size={16} />
                            </div>
                        </div>
                        {/* QR Preview */}
                        <div className="absolute bottom-4 right-4 p-3 bg-white rounded-2xl shadow-xl opacity-90 group-hover:opacity-100 transition-opacity">
                            <QRCodeSVG value={demoUrl} size={80} bgColor="#ffffff" fgColor="#0f172a" />
                        </div>
                    </div>

                    {/* Small Features */}
                    {[
                        { icon: Smartphone, title: 'Zero App', desc: 'Wifi + Navegador', gradient: 'from-blue-600 to-indigo-700' },
                        { icon: Zap, title: '< 2 seg', desc: 'Para retirar senha', gradient: 'from-amber-500 to-orange-600' },
                        { icon: Monitor, title: 'Painel TV', desc: 'Display profissional', gradient: 'from-purple-600 to-pink-600' },
                        { icon: Volume2, title: 'Voz', desc: 'Chamada automática', gradient: 'from-rose-500 to-red-600' }
                    ].map((feature, i) => (
                        <div
                            key={i}
                            className={`group relative bg-gradient-to-br ${feature.gradient} rounded-3xl p-6 overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform`}
                        >
                            <feature.icon size={28} className="mb-3" />
                            <h3 className="text-lg font-bold">{feature.title}</h3>
                            <p className="text-white/70 text-sm">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Benefits Section */}
            <section className="relative z-10 container max-w-7xl mx-auto px-6 py-24">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-black mb-6">
                            Por que escolher <span className="text-emerald-400">FilaZero</span>?
                        </h2>
                        <p className="text-slate-400 text-lg mb-12">
                            Resultados comprovados em centenas de clínicas pelo Brasil.
                        </p>

                        <div className="space-y-6">
                            {benefits.map((benefit, i) => (
                                <div key={i} className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer">
                                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                        <benefit.icon size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold">{benefit.title}</h3>
                                            <span className="text-emerald-400 font-bold">{benefit.stat}</span>
                                        </div>
                                        <p className="text-slate-400 text-sm mt-1">{benefit.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="relative">
                        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                            <div className="flex items-center gap-3 mb-8">
                                <Award size={32} className="text-amber-400" />
                                <div>
                                    <div className="text-2xl font-bold">Líder de Mercado</div>
                                    <div className="text-slate-400 text-sm">em soluções de fila digital para saúde</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { value: '847+', label: 'Clínicas ativas' },
                                    { value: '284k', label: 'Pacientes/mês' },
                                    { value: '67k', label: 'Horas economizadas' },
                                    { value: '4.9', label: 'Estrelas (Google)' }
                                ].map((stat, i) => (
                                    <div key={i} className="text-center p-4 rounded-xl bg-white/5">
                                        <div className="text-3xl font-black text-emerald-400">{stat.value}</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="relative z-10 container max-w-7xl mx-auto px-6 py-24">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black mb-4">O que nossos clientes dizem</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map((t, i) => (
                        <div key={i} className="group p-6 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 transition-all">
                            <div className="flex gap-1 mb-4">
                                {[...Array(t.rating)].map((_, j) => (
                                    <Star key={j} size={16} className="text-amber-400 fill-amber-400" />
                                ))}
                            </div>
                            <p className="text-slate-300 mb-6 leading-relaxed">"{t.text}"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold">
                                    {t.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-semibold">{t.name}</div>
                                    <div className="text-xs text-slate-500">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 container max-w-5xl mx-auto px-6 py-24">
                <div className="relative bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[3rem] p-12 md:p-16 text-center overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-5xl font-black mb-6">
                            Pronto para eliminar filas?
                        </h2>
                        <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                            Comece hoje mesmo. Implementação em menos de 24 horas.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => navigate('/clinic/demo')}
                                className="px-8 py-4 bg-white text-emerald-700 rounded-2xl font-bold text-lg hover:bg-white/90 transition-all shadow-xl flex items-center gap-3"
                            >
                                Testar Grátis Agora
                                <ArrowRight size={20} />
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-semibold transition-all"
                            >
                                Já tenho conta
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5">
                <div className="container max-w-7xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                                <QrCode size={20} />
                            </div>
                            <span className="font-bold">FilaZero Saúde</span>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-slate-500">
                            <a href="#" className="hover:text-white transition-colors">Termos</a>
                            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
                            <a href="#" className="hover:text-white transition-colors">Contato</a>
                        </div>

                        <div className="text-sm text-slate-500">
                            © {new Date().getFullYear()} FilaZero Technology
                        </div>
                    </div>
                </div>
            </footer>

            {/* CSS for animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
