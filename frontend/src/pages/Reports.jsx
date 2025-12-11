import { ArrowDownRight, ArrowUpRight, BarChart3, Clock, Download, TrendingDown, TrendingUp, Users, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { subscribeToQueue } from '../services/ticketService';

// Extracted StatCard component for performance
const StatCard = ({ icon: IconComponent, label, value, subvalue, trend, colorClass = 'emerald' }) => (
    <div className={`p-5 rounded-2xl bg-${colorClass}-500/10 border border-${colorClass}-500/20 relative overflow-hidden group hover:scale-[1.02] transition-transform`}>
        <div className={`absolute -top-4 -right-4 w-20 h-20 bg-${colorClass}-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
        <div className="flex items-center justify-between relative">
            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
                <p className={`text-3xl font-black text-${colorClass}-400`}>{value}</p>
                {subvalue && <p className="text-slate-500 text-xs mt-1">{subvalue}</p>}
            </div>
            <div className="flex flex-col items-end gap-2">
                <div className={`p-2.5 rounded-xl bg-${colorClass}-500/20 text-${colorClass}-400`}>
                    <IconComponent size={22} />
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
        </div>
    </div>
);

// Extracted HourlyChart component for performance
const HourlyChart = ({ data }) => {
    const max = Math.max(...data, 1);
    const workHours = data.slice(7, 19); // 7am to 7pm

    return (
        <div className="flex items-end gap-1 h-32">
            {workHours.map((count, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                        className="w-full bg-emerald-500/50 hover:bg-emerald-500 rounded-t-sm transition-all cursor-pointer"
                        style={{ height: `${(count / max) * 100}%`, minHeight: count > 0 ? '4px' : '0' }}
                        title={`${7 + i}h: ${count} tickets`}
                    ></div>
                    <span className="text-[10px] text-slate-500">{7 + i}</span>
                </div>
            ))}
        </div>
    );
};

/**
 * Reports Page
 * Analytics dashboard with charts and insights
 */
export default function Reports() {
    const { currentUser } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const clinicId = currentUser?.id;

    const [tickets, setTickets] = useState([]);
    const [dateRange, setDateRange] = useState('today');
    const [loading, setLoading] = useState(true);

    // Subscribe to queue data
    useEffect(() => {
        if (!clinicId) return;
        const unsubscribe = subscribeToQueue(clinicId, (data) => {
            setTickets(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [clinicId]);

    // Calculate metrics
    const calculateMetrics = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Filter by date range
        const filtered = tickets.filter(t => {
            const created = new Date(t.createdAt);
            if (dateRange === 'today') return created >= today;
            if (dateRange === 'week') {
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return created >= weekAgo;
            }
            if (dateRange === 'month') {
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return created >= monthAgo;
            }
            return true;
        });

        const done = filtered.filter(t => t.status === 'done');
        const noShow = filtered.filter(t => t.status === 'no_show');
        const waiting = filtered.filter(t => t.status === 'waiting');
        const inService = filtered.filter(t => t.status === 'in_service' || t.status === 'called');
        const emergency = filtered.filter(t => t.priority === 'emergency');
        const priority = filtered.filter(t => t.priority === 'priority');

        // Average wait time (in minutes)
        let avgWaitTime = 0;
        if (done.length > 0) {
            const totalWait = done.reduce((sum, t) => {
                const created = new Date(t.createdAt);
                const called = t.calledAt ? new Date(t.calledAt) : created;
                return sum + (called - created) / 60000;
            }, 0);
            avgWaitTime = Math.round(totalWait / done.length);
        }

        // Average service time (in minutes)
        let avgServiceTime = 0;
        if (done.length > 0) {
            const totalService = done.reduce((sum, t) => {
                const started = t.startedAt ? new Date(t.startedAt) : new Date(t.calledAt || t.createdAt);
                const finished = t.finishedAt ? new Date(t.finishedAt) : new Date();
                return sum + (finished - started) / 60000;
            }, 0);
            avgServiceTime = Math.round(totalService / done.length);
        }

        // Hourly distribution
        const hourlyDist = Array(24).fill(0);
        filtered.forEach(t => {
            const hour = new Date(t.createdAt).getHours();
            hourlyDist[hour]++;
        });

        // Peak hours (top 3)
        const peakHours = hourlyDist
            .map((count, hour) => ({ hour, count }))
            .filter(h => h.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        // Efficiency rate
        const efficiencyRate = filtered.length > 0
            ? Math.round((done.length / (done.length + noShow.length)) * 100) || 100
            : 100;

        // No-show rate
        const noShowRate = filtered.length > 0
            ? Math.round((noShow.length / filtered.length) * 100)
            : 0;

        return {
            total: filtered.length,
            done: done.length,
            noShow: noShow.length,
            waiting: waiting.length,
            inService: inService.length,
            emergency: emergency.length,
            priority: priority.length,
            avgWaitTime,
            avgServiceTime,
            efficiencyRate,
            noShowRate,
            hourlyDist,
            peakHours
        };
    };

    const metrics = calculateMetrics();

    // Export to CSV
    const exportCSV = () => {
        const headers = ['ID', 'Número', 'Paciente', 'Status', 'Prioridade', 'Criado', 'Chamado', 'Finalizado'];
        const rows = tickets.map(t => [
            t.id,
            t.number,
            t.patientName || 'Anônimo',
            t.status,
            t.priority || 'normal',
            new Date(t.createdAt).toLocaleString('pt-BR'),
            t.calledAt ? new Date(t.calledAt).toLocaleString('pt-BR') : '',
            t.finishedAt ? new Date(t.finishedAt).toLocaleString('pt-BR') : ''
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `filazero_report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        addToast('📊 Relatório exportado!', 'success');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-50 font-sans p-6 pb-24 relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-[20%] -right-[15%] w-[45%] h-[45%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute -bottom-[20%] -left-[15%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="container max-w-7xl mx-auto space-y-8 relative z-10">

                {/* Header */}
                <header className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-3xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Relatórios</h1>
                            <p className="text-slate-400 text-sm font-medium">Analytics da Clínica {clinicId}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Date Range Filter */}
                        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/20 border border-white/5">
                            {['today', 'week', 'month'].map(range => (
                                <button
                                    key={range}
                                    onClick={() => setDateRange(range)}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${dateRange === range
                                        ? 'bg-emerald-500 text-white'
                                        : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {range === 'today' ? 'Hoje' : range === 'week' ? 'Semana' : 'Mês'}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={exportCSV}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all"
                        >
                            <Download size={18} />
                            Exportar CSV
                        </button>

                        <button
                            onClick={() => navigate('/admin')}
                            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white transition-all font-medium text-sm"
                        >
                            Voltar
                        </button>
                    </div>
                </header>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        icon={Users}
                        label="Total de Senhas"
                        value={metrics.total}
                        subvalue={`${metrics.done} finalizados`}
                        colorClass="blue"
                    />
                    <StatCard
                        icon={Clock}
                        label="Tempo Médio Espera"
                        value={`${metrics.avgWaitTime}min`}
                        subvalue="da chegada até ser chamado"
                        colorClass="amber"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Taxa de Eficiência"
                        value={`${metrics.efficiencyRate}%`}
                        subvalue="atendidos vs no-show"
                        trend={5}
                        colorClass="emerald"
                    />
                    <StatCard
                        icon={TrendingDown}
                        label="Taxa de No-Show"
                        value={`${metrics.noShowRate}%`}
                        subvalue={`${metrics.noShow} não compareceram`}
                        trend={-2}
                        colorClass="red"
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Hourly Distribution */}
                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white">Distribuição por Hora</h3>
                            <div className="text-xs text-slate-500">7h - 18h</div>
                        </div>
                        <HourlyChart data={metrics.hourlyDist} />
                    </div>

                    {/* Peak Hours */}
                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5">
                        <h3 className="text-lg font-bold text-white mb-6">Horários de Pico</h3>
                        <div className="space-y-4">
                            {metrics.peakHours.length > 0 ? metrics.peakHours.map((peak, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${i === 0 ? 'bg-amber-500 text-white' :
                                        i === 1 ? 'bg-slate-500 text-white' :
                                            'bg-amber-800 text-white'
                                        }`}>
                                        {i + 1}º
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-white font-bold">{peak.hour}:00 - {peak.hour + 1}:00</p>
                                            <span className="text-emerald-400 font-bold">{peak.count} senhas</span>
                                        </div>
                                        <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${i === 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${(peak.count / metrics.peakHours[0].count) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-slate-500 text-center py-8">Sem dados suficientes</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                        <Zap className="mx-auto mb-2 text-red-400" size={24} />
                        <p className="text-2xl font-black text-white">{metrics.emergency}</p>
                        <p className="text-xs text-slate-400 mt-1">Urgências</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                        <Zap className="mx-auto mb-2 text-amber-400" size={24} />
                        <p className="text-2xl font-black text-white">{metrics.priority}</p>
                        <p className="text-xs text-slate-400 mt-1">Prioridades</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                        <Clock className="mx-auto mb-2 text-emerald-400" size={24} />
                        <p className="text-2xl font-black text-white">{metrics.avgServiceTime}min</p>
                        <p className="text-xs text-slate-400 mt-1">Tempo Médio Atendimento</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-center">
                        <Users className="mx-auto mb-2 text-blue-400" size={24} />
                        <p className="text-2xl font-black text-white">{metrics.waiting + metrics.inService}</p>
                        <p className="text-xs text-slate-400 mt-1">Em Atendimento Agora</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
