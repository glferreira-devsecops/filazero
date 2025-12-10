import { BarChart3, Clock, RefreshCw, Trash2, TrendingUp, Users } from 'lucide-react';
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

    const { addToast } = useToast();

    const handleGenerateDemo = async () => {
        if (!window.confirm("Gerar 5 tickets de teste?")) return;
        setLoading(true);
        try {
            // const { createTicket } = await import('../services/ticketService'); // Fixed: Using static import to avoid Vite warning
            for (let i = 0; i < 5; i++) {
                await createTicket(clinicId, `Paciente ${i + 1}`);
            }
            addToast("✅ 5 tickets gerados com sucesso!", "success");
        } catch (e) {
            console.error(e);
            addToast("Erro ao gerar tickets", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleClearData = () => {
        if (!window.confirm("Limpar todos os dados de demo?")) return;
        localStorage.removeItem('filaZeroMockDb');
        window.location.reload();
    };

    const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
        <div className="card interactive" style={{ background: bgColor, border: `1px solid ${color}` }}>
            <div className="flex-center gap-md">
                <div style={{
                    padding: '0.75rem',
                    background: `${color}20`,
                    borderRadius: 'var(--radius-full)',
                    color: color
                }}>
                    <Icon size={28} />
                </div>
                <div>
                    <p className="text-sm m-0" style={{ color }}>{label}</p>
                    <h2 className="m-0" style={{ color, fontSize: '2rem' }}>{value}</h2>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container animate-fadeIn" style={{ paddingBottom: '4rem' }}>
            {/* Header */}
            <header className="flex-between flex-wrap gap-md" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0 }}>📊 Dashboard Operacional</h1>
                    <p className="text-muted m-0">Clínica {clinicId} • Visão em tempo real</p>
                </div>
                <div className="flex-center gap-sm">
                    <button onClick={() => navigate('/reception')} className="btn btn-outline btn-sm">
                        🏥 Recepção
                    </button>
                    <button onClick={() => navigate('/panel')} className="btn btn-outline btn-sm">
                        📺 Painel TV
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-auto gap-xl mb-8">
                <StatCard
                    icon={Users}
                    label="Total Atendimentos"
                    value={totalToday}
                    color="#0ea5e9"
                    bgColor="rgba(14, 165, 233, 0.1)"
                />
                <StatCard
                    icon={Clock}
                    label="Tempo Médio Espera"
                    value={`${avgWait} min`}
                    color="#22c55e"
                    bgColor="rgba(34, 197, 94, 0.1)"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Aguardando"
                    value={waiting}
                    color="#f59e0b"
                    bgColor="rgba(245, 158, 11, 0.1)"
                />
                <StatCard
                    icon={BarChart3}
                    label="Satisfação (NPS)"
                    value="4.8"
                    color="#8b5cf6"
                    bgColor="rgba(139, 92, 246, 0.1)"
                />
            </div>

            {/* Chart */}
            <div className="card glass" style={{ marginBottom: '2rem' }}>
                <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Fluxo do Dia</h2>
                    <span className="badge badge-service">Atualizado agora</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', height: '220px', gap: '12px', padding: '20px 0' }}>
                    {hourlyData.map((item, i) => (
                        <div
                            key={i}
                            className="flex-col flex-center"
                            style={{ flex: 1 }}
                        >
                            <span className="text-sm font-semibold" style={{ marginBottom: '0.5rem' }}>
                                {item.value}
                            </span>
                            <div
                                style={{
                                    width: '100%',
                                    background: `linear-gradient(to top, var(--primary), var(--primary-hover))`,
                                    borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                                    height: `${(item.value / maxValue) * 160}px`,
                                    minHeight: '20px',
                                    transition: 'height 0.5s ease',
                                    boxShadow: 'var(--shadow-sm)'
                                }}
                            />
                            <span className="text-muted text-sm" style={{ marginTop: '0.5rem' }}>
                                {item.hour}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Current Queue Status */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h2 style={{ margin: '0 0 1rem 0' }}>Status da Fila Atual</h2>
                <div className="grid gap-md" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    <div className="text-center p-4" style={{ background: 'var(--accent-light)', borderRadius: 'var(--radius-md)' }}>
                        <h3 className="m-0" style={{ color: '#b45309' }}>{waiting}</h3>
                        <p className="text-sm m-0" style={{ color: '#92400e' }}>Aguardando</p>
                    </div>
                    <div className="text-center p-4" style={{ background: 'var(--success-light)', borderRadius: 'var(--radius-md)' }}>
                        <h3 className="m-0" style={{ color: '#15803d' }}>{inService}</h3>
                        <p className="text-sm m-0" style={{ color: '#166534' }}>Em Atendimento</p>
                    </div>
                    <div className="text-center p-4" style={{ background: 'var(--secondary-light)', borderRadius: 'var(--radius-md)' }}>
                        <h3 className="m-0" style={{ color: '#1d4ed8' }}>{completed}</h3>
                        <p className="text-sm m-0" style={{ color: '#1e40af' }}>Finalizados</p>
                    </div>
                </div>
            </div>

            {/* Demo Actions */}
            <div className="card text-center" style={{ background: 'var(--bg-glass)', border: '2px dashed var(--border)' }}>
                <h3 className="text-muted" style={{ margin: '0 0 1rem 0' }}>🧪 Ações de Demonstração</h3>
                <div className="flex-center gap-md flex-wrap">
                    <button
                        onClick={handleGenerateDemo}
                        disabled={loading}
                        className="btn btn-outline"
                    >
                        {loading ? <RefreshCw size={18} className="animate-rotate" /> : '🎫'}
                        {loading ? 'Gerando...' : 'Gerar 5 Tickets'}
                    </button>
                    <button
                        onClick={handleClearData}
                        className="btn btn-ghost"
                        style={{ color: 'var(--danger)' }}
                    >
                        <Trash2 size={18} />
                        Limpar Dados
                    </button>
                </div>
            </div>
        </div>
    );
}

