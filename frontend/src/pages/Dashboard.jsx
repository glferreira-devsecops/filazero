import { Activity, BarChart3, Clock, ExternalLink, RefreshCw, Trash2, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createTicket, subscribeToQueue } from '../services/ticketService';

export default function Dashboard() {
    const { currentUser } = useAuth();
    const clinicId = currentUser?.id;

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();

    useEffect(() => {
        if (!clinicId) return;
        const unsubscribe = subscribeToQueue(clinicId, (data) => {
            setTickets(data);
        });
        return () => unsubscribe();
    }, [clinicId]);

    // Calculate real metrics
    const totalToday = tickets.length;
    const completed = tickets.filter(t => t.status === 'done').length;
    const waiting = tickets.filter(t => t.status === 'waiting').length;
    const inService = tickets.filter(t => ['called', 'in_service'].includes(t.status)).length;

    // Calculate real average wait time
    const completedTickets = tickets.filter(t => t.status === 'done' && t.startedAt && t.createdAt);
    const avgWait = completedTickets.length > 0
        ? Math.round(completedTickets.reduce((acc, t) => acc + (new Date(t.startedAt) - new Date(t.createdAt)), 0) / completedTickets.length / 60000)
        : 0;

    // Real Hourly distribution
    const hours = {};
    const startHour = 8;
    const endHour = 18;

    // Initialize hours
    for (let i = startHour; i <= endHour; i++) {
        hours[i] = 0;
    }

    // Fill with data
    tickets.forEach(t => {
        if (t.createdAt) {
            const hour = new Date(t.createdAt).getHours();
            if (hours[hour] !== undefined) {
                hours[hour]++;
            }
        }
    });

    const hourlyData = Object.keys(hours).map(h => ({
        hour: `${h}:00`,
        value: hours[h]
    }));

    const maxValue = Math.max(...hourlyData.map(d => d.value), 10); // Min scale of 10

    const handleGenerateDemo = async () => {
        if (!window.confirm("Gerar 5 tickets com nomes brasileiros realistas?")) return;
        setLoading(true);
        try {
            for (let i = 0; i < 5; i++) {
                await createTicket(clinicId); // Will auto-generate Brazilian names
            }
            addToast("✅ 5 tickets gerados com sucesso!", "success");
        } catch (e) {
            console.error(e);
            addToast("Erro ao gerar tickets", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleReloadDemo = () => {
        if (!window.confirm("Recarregar demo com dados frescos?")) return;
        localStorage.removeItem('filaZeroMockDb');
        sessionStorage.removeItem('filaZeroSeeded');
        addToast("🔄 Demo recarregado!", "success");
        setTimeout(() => window.location.reload(), 500);
    };

    const handleClearData = () => {
        if (!window.confirm("Limpar todos os dados de demo?")) return;
        localStorage.removeItem('filaZeroMockDb');
        window.location.reload();
    };

    const StatCard = ({ icon: Icon, label, value, colorClass, borderClass, bgClass }) => (
        <div className={`p-6 rounded-2xl border ${borderClass} ${bgClass} transition-all hover:scale-[1.02] hover:shadow-lg`}>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl border opacity-80 ${borderClass} bg-white/5`}>
                    <Icon size={28} className={colorClass} />
                </div>
                <div>
                    <p className={`text-sm font-medium opacity-80 ${colorClass}`}>{label}</p>
                    <h2 className={`text-3xl font-bold mt-1 text-white`}>{value}</h2>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-50 font-sans p-6 pb-24">
            <div className="container max-w-7xl mx-auto space-y-8 animate-fadeIn">

                {/* Header */}
                <header className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-xl shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Operacional</h1>
                            <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Em tempo real • Clínica {clinicId}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/reception')} className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white transition-all">
                            <ExternalLink size={16} />
                            <span className="font-semibold text-sm">Abrir Recepção</span>
                        </button>
                        <button onClick={() => navigate('/panel')} className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white transition-all">
                            <ExternalLink size={16} />
                            <span className="font-semibold text-sm">Painel TV</span>
                        </button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={Users}
                        label="Total Atendimentos"
                        value={totalToday}
                        colorClass="text-blue-400"
                        bgClass="bg-blue-500/5 hover:bg-blue-500/10"
                        borderClass="border-blue-500/20"
                    />
                    <StatCard
                        icon={Clock}
                        label="Tempo Médio Espera"
                        value={`${avgWait} min`}
                        colorClass="text-emerald-400"
                        bgClass="bg-emerald-500/5 hover:bg-emerald-500/10"
                        borderClass="border-emerald-500/20"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Aguardando"
                        value={waiting}
                        colorClass="text-amber-400"
                        bgClass="bg-amber-500/5 hover:bg-amber-500/10"
                        borderClass="border-amber-500/20"
                    />
                    <StatCard
                        icon={BarChart3}
                        label="Satisfação (NPS)"
                        value="4.8"
                        colorClass="text-purple-400"
                        bgClass="bg-purple-500/5 hover:bg-purple-500/10"
                        borderClass="border-purple-500/20"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Chart */}
                    <div className="lg:col-span-2 p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                <TrendingUp size={20} className="text-emerald-400" />
                                Fluxo do Dia
                            </h2>
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                                Hoje
                            </span>
                        </div>

                        <div className="flex items-end h-[240px] gap-2 sm:gap-4 pb-2">
                            {hourlyData.map((item, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center group">
                                    <div className="relative w-full flex justify-center">
                                        <div
                                            className="w-full max-w-[40px] bg-gradient-to-t from-emerald-600/50 to-emerald-400/50 rounded-t-lg transition-all duration-500 group-hover:from-emerald-500 group-hover:to-emerald-300 relative"
                                            style={{
                                                height: `${Math.max((item.value / maxValue) * 200, 4)}px`,
                                            }}
                                        >
                                            {item.value > 0 && (
                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {item.value}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-slate-500 mt-3 font-mono transform -rotate-45 sm:rotate-0 origin-top-left sm:origin-center">
                                        {item.hour.split(':')[0]}h
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Status & Actions Column */}
                    <div className="flex flex-col gap-6">
                        {/* Current Queue Status Breakdown */}
                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                            <h2 className="text-lg font-bold text-white mb-4">Status Atual</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                                    <span className="text-amber-400 font-medium text-sm">Aguardando</span>
                                    <span className="text-xl font-bold text-amber-300">{waiting}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                    <span className="text-emerald-400 font-medium text-sm">Em Atendimento</span>
                                    <span className="text-xl font-bold text-emerald-300">{inService}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                    <span className="text-blue-400 font-medium text-sm">Finalizados</span>
                                    <span className="text-xl font-bold text-blue-300">{completed}</span>
                                </div>
                            </div>
                        </div>

                        {/* Demo Actions */}
                        <div className="flex-1 p-6 rounded-3xl bg-white/[0.02] border border-white/5 border-dashed flex flex-col justify-center">
                            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                                Área de Testes
                            </h3>
                            <div className="space-y-3">
                                <button
                                    onClick={handleGenerateDemo}
                                    disabled={loading}
                                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all flex items-center justify-center gap-2 group"
                                >
                                    {loading ? <RefreshCw size={18} className="animate-spin" /> : <TrendingUp size={18} className="text-emerald-400" />}
                                    {loading ? 'Gerando...' : 'Gerar 5 Tickets Demo'}
                                </button>
                                <button
                                    onClick={handleReloadDemo}
                                    className="w-full py-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-300 font-medium transition-all flex items-center justify-center gap-2"
                                >
                                    <RefreshCw size={18} />
                                    Recarregar Demo
                                </button>
                                <button
                                    onClick={handleClearData}
                                    className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 font-medium transition-all flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={18} />
                                    Limpar Dados
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
