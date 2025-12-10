import { CheckCircle, Clock, LayoutDashboard, Megaphone, Monitor, Play, QrCode, RefreshCw, User, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { subscribeToQueue, updateTicketStatus } from '../services/ticketService';

export default function Reception() {
    const { addToast } = useToast();
    const { currentUser } = useAuth();
    const clinicId = currentUser?.id;

    const [tickets, setTickets] = useState([]);
    const [showQR, setShowQR] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const navigate = useNavigate();

    // Real-time clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!clinicId) return;
        const unsubscribe = subscribeToQueue(clinicId, (data) => {
            setTickets(data);
        });
        return () => unsubscribe();
    }, [clinicId]);

    const handleStatusChange = async (ticketId, newStatus) => {
        try {
            await updateTicketStatus(clinicId, ticketId, newStatus);
        } catch (e) {
            console.error(e);
            addToast("Erro ao atualizar ticket", "error");
        }
    };

    const waitingTickets = tickets.filter(t => t.status === 'waiting');
    const activeTickets = tickets.filter(t => ['called', 'in_service'].includes(t.status));
    const clinicUrl = `${window.location.origin}/clinic/${clinicId}`;

    // Calculate real average wait time
    const completedTickets = tickets.filter(t => t.status === 'done' && t.startedAt && t.createdAt);
    const avgWaitTime = completedTickets.length > 0
        ? Math.round(completedTickets.reduce((acc, t) => acc + (new Date(t.startedAt) - new Date(t.createdAt)), 0) / completedTickets.length / 60000)
        : 12; // Default estimate

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-50 font-sans p-6 pb-24">
            <div className="container max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-xl shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <User size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Recepção</h1>
                            <p className="text-slate-400 text-sm font-medium">Clínica {clinicId}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/20 border border-white/5 text-slate-300 font-mono text-sm font-bold shadow-inner">
                            <Clock size={16} className="text-emerald-400" />
                            {formatTime(currentTime)}
                        </div>

                        <button onClick={() => setShowQR(true)} className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white transition-all">
                            <QrCode size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="font-semibold text-sm">QR Code</span>
                        </button>

                        <button onClick={() => navigate('/panel')} className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white transition-all">
                            <Monitor size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="font-semibold text-sm">Painel TV</span>
                        </button>

                        <button onClick={() => navigate('/admin')} className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 hover:text-white transition-all">
                            <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="font-semibold text-sm">Admin</span>
                        </button>
                    </div>
                </header>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 text-amber-500/10 group-hover:text-amber-500/20 transition-colors">
                            <User size={100} />
                        </div>
                        <p className="text-amber-400 text-sm font-bold uppercase tracking-wider relative z-10">Na Fila</p>
                        <h2 className="text-4xl font-extrabold text-white mt-1 relative z-10">{waitingTickets.length}</h2>
                    </div>

                    <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
                            <Megaphone size={100} />
                        </div>
                        <p className="text-emerald-400 text-sm font-bold uppercase tracking-wider relative z-10">Em Atendimento</p>
                        <h2 className="text-4xl font-extrabold text-white mt-1 relative z-10">{activeTickets.length}</h2>
                    </div>

                    <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 text-blue-500/10 group-hover:text-blue-500/20 transition-colors">
                            <Clock size={100} />
                        </div>
                        <p className="text-blue-400 text-sm font-bold uppercase tracking-wider relative z-10">Tempo Médio</p>
                        <h2 className="text-4xl font-extrabold text-white mt-1 relative z-10">~{avgWaitTime}min</h2>
                    </div>
                </div>

                {/* Main Split Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slideUp">

                    {/* Waiting Column */}
                    <section className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="flex items-center gap-3 text-xl font-bold text-slate-200">
                                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500"><User size={20} /></div>
                                Aguardando Chamada
                            </h2>
                            <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/20">
                                {waitingTickets.length}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 min-h-[300px]">
                            {waitingTickets.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-3xl text-slate-500 bg-white/[0.02]">
                                    <RefreshCw size={48} className="mb-4 opacity-20" />
                                    <p className="font-medium">Nenhum paciente na fila</p>
                                </div>
                            )}
                            {waitingTickets.map(ticket => (
                                <div
                                    key={ticket.id}
                                    className="group flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 hover:border-amber-500/30 transition-all shadow-sm"
                                >
                                    <div>
                                        <h3 className="text-3xl font-bold text-white group-hover:text-amber-400 transition-colors m-0 leading-none">
                                            #{ticket.number}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 font-mono">
                                            <Clock size={12} />
                                            {formatTime(new Date(ticket.createdAt))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleStatusChange(ticket.id, 'called')}
                                        className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        <Megaphone size={18} />
                                        CHAMAR
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Active Column */}
                    <section className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="flex items-center gap-3 text-xl font-bold text-slate-200">
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><Megaphone size={20} /></div>
                                Em Andamento
                            </h2>
                            <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                                {activeTickets.length}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 min-h-[300px]">
                            {activeTickets.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-3xl text-slate-500 bg-white/[0.02]">
                                    <p className="font-medium">Nenhum atendimento ativo</p>
                                </div>
                            )}
                            {activeTickets.map(ticket => (
                                <div
                                    key={ticket.id}
                                    className="relative flex items-center justify-between p-5 rounded-2xl bg-[#1e293b]/50 border transition-all overflow-hidden"
                                    style={{
                                        borderColor: ticket.status === 'called' ? 'rgba(245, 158, 11, 0.5)' : 'rgba(16, 185, 129, 0.5)'
                                    }}
                                >
                                    {ticket.status === 'called' && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500 animate-pulse"></div>
                                    )}
                                    {ticket.status === 'in_service' && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
                                    )}

                                    <div className="pl-3">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-2xl font-bold text-white m-0">#{ticket.number}</h3>
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${ticket.status === 'called'
                                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/20'
                                                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                                                }`}>
                                                {ticket.status === 'called' ? 'CHAMANDO' : 'ATENDENDO'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {ticket.calledAt && `Iniciado às ${formatTime(new Date(ticket.calledAt))}`}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {ticket.status === 'called' && (
                                            <button
                                                onClick={() => handleStatusChange(ticket.id, 'in_service')}
                                                className="p-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                                                title="Iniciar Atendimento"
                                            >
                                                <Play size={20} fill="currentColor" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleStatusChange(ticket.id, 'done')}
                                            className="p-3 rounded-xl bg-slate-700 hover:bg-emerald-600 text-slate-300 hover:text-white border border-white/10 transition-all active:scale-95"
                                            title="Finalizar"
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            {/* QR Code Modal */}
            {showQR && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn"
                    onClick={() => setShowQR(false)}
                >
                    <div
                        className="w-full max-w-sm bg-[#0f172a] border border-white/10 rounded-3xl p-8 shadow-2xl animate-scaleIn relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowQR(false)}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-white">QR Code da Clínica</h3>
                                <p className="text-slate-400 text-sm mt-1">Pacientes escaneiam para entrar na fila</p>
                            </div>

                            <div className="p-4 bg-white rounded-2xl inline-block shadow-lg">
                                <QRCodeSVG
                                    value={clinicUrl}
                                    size={200}
                                    bgColor="#ffffff"
                                    fgColor="#0f172a"
                                    level="H"
                                />
                            </div>

                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full h-10 px-3 bg-black/20 border border-white/10 rounded-lg text-slate-300 text-xs text-center font-mono focus:outline-none focus:border-emerald-500/50"
                                    value={clinicUrl}
                                    readOnly
                                    onClick={e => e.target.select()}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
