import { Activity, BarChart3, CheckCircle, Clock, ExternalLink, History, RefreshCw, Settings, Trash2, TrendingUp, UserX, Users, Zap } from 'lucide-react';
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
    const noShows = tickets.filter(t => t.status === 'no_show').length;
    const emergencies = tickets.filter(t => t.priority === 'emergency').length;

    // Calculate real average wait time
    const completedTickets = tickets.filter(t => t.status === 'done' && t.startedAt && t.createdAt);
    const avgWait = completedTickets.length > 0
        ? Math.round(completedTickets.reduce((acc, t) => acc + (new Date(t.startedAt) - new Date(t.createdAt)), 0) / completedTickets.length / 60000)
        : 0;

    // Activity Log (done + no_show tickets, sorted by finish time)
    const activityLog = tickets
        .filter(t => ['done', 'no_show'].includes(t.status))
        .sort((a, b) => {
            const timeA = a.finishedAt || a.noShowAt || a.createdAt;
            const timeB = b.finishedAt || b.noShowAt || b.createdAt;
            return new Date(timeB) - new Date(timeA);
        })
        .slice(0, 10); // Last 10 activities

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

    const StatCard = ({ icon: IconComponent, label, value, colorClass, borderClass, bgClass }) => (
        <div className={`p-6 rounded-2xl border ${borderClass} ${bgClass} transition-all hover:scale-[1.02] hover:shadow-lg`}>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl border opacity-80 ${borderClass} bg-white/5`}>
                    <IconComponent size={28} className={colorClass} />
                </div>
                <div>
                    <p className={`text-sm font-medium opacity-80 ${colorClass}`}>{label}</p>
                    <h2 className={`text-3xl font-bold mt-1 text-white`}>{value}</h2>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-50 font-sans p-6 pb-24 relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute -bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>

            <div className="container max-w-7xl mx-auto space-y-8 animate-fadeIn relative z-10">

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
                            <span className="font-semibold text-sm">Recepção</span>
                        </button>
                        <button onClick={() => navigate('/panel')} className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white transition-all">
                            <ExternalLink size={16} />
                            <span className="font-semibold text-sm">Painel TV</span>
                        </button>
                        <button onClick={() => navigate('/reports')} className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-300 hover:text-white transition-all">
                            <BarChart3 size={16} />
                            <span className="font-semibold text-sm">Relatórios</span>
                        </button>
                        <button onClick={() => navigate('/settings')} className="group p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white transition-all">
                            <Settings size={18} />
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
                        value="4.8 ★"
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

                    {/* Activity Log Section */}
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                        <h3 className="text-slate-300 text-lg font-bold mb-4 flex items-center gap-2">
                            <History size={20} className="text-slate-400" />
                            Histórico do Dia
                            {noShows > 0 && (
                                <span className="ml-auto px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs font-bold">
                                    {noShows} no-show{noShows > 1 ? 's' : ''}
                                </span>
                            )}
                            {emergencies > 0 && (
                                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center gap-1">
                                    <Zap size={10} /> {emergencies} urgência{emergencies > 1 ? 's' : ''}
                                </span>
                            )}
                        </h3>

                        {activityLog.length === 0 ? (
                            <p className="text-slate-500 text-sm py-8 text-center">Nenhuma atividade registrada hoje</p>
                        ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {activityLog.map(ticket => {
                                    const isNoShow = ticket.status === 'no_show';
                                    const time = ticket.finishedAt || ticket.noShowAt;
                                    const timeStr = time ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

                                    return (
                                        <div
                                            key={ticket.id}
                                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isNoShow
                                                ? 'bg-red-500/5 border-red-500/20'
                                                : 'bg-white/[0.02] border-white/5'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${isNoShow ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                                                    }`}>
                                                    {isNoShow ? <UserX size={16} /> : <CheckCircle size={16} />}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-white">#{ticket.number}</span>
                                                    <span className="text-slate-400 text-sm ml-2">{ticket.patientName || 'Paciente'}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-bold uppercase ${isNoShow ? 'text-red-400' : 'text-emerald-400'
                                                    }`}>
                                                    {isNoShow ? 'Não Compareceu' : 'Finalizado'}
                                                </span>
                                                <span className="text-slate-500 text-xs font-mono">{timeStr}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
