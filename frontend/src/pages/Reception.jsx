import { AlertTriangle, CheckCircle, Clock, LayoutDashboard, Megaphone, Monitor, Pause, Play, QrCode, RefreshCw, Repeat2, Search, User, UserX, X, Zap } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
import { pauseTicket, resumeTicket, searchTicketByName, sortByPriority, subscribeToQueue, updateTicketPriority, updateTicketStatus } from '../services/ticketService';

export default function Reception() {
    const { addToast } = useToast();
    const { currentUser } = useAuth();
    const { settings } = useSettings();
    const clinicId = currentUser?.id;

    const [tickets, setTickets] = useState([]);
    const [showQR, setShowQR] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
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

    // Sort waiting tickets by priority (emergency > priority > normal)
    const waitingTickets = sortByPriority(tickets.filter(t => t.status === 'waiting'));
    const activeTickets = tickets.filter(t => ['called', 'in_service', 'paused'].includes(t.status));
    const clinicUrl = `${window.location.origin}/clinic/${clinicId}`;

    // Priority labels and colors
    const PRIORITY_CONFIG = {
        emergency: { label: 'URGENTE', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
        priority: { label: 'PRIORIDADE', bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
        normal: { label: '', bg: '', text: '', border: '' }
    };

    // Handle priority change
    const handlePriorityChange = async (ticketId, priority) => {
        try {
            await updateTicketPriority(clinicId, ticketId, priority);
            const priorityLabel = PRIORITY_CONFIG[priority]?.label || priority;
            addToast(`⚡ Prioridade atualizada: ${priorityLabel || 'Normal'}`, 'info');
        } catch (e) {
            console.error(e);
            addToast('Erro ao atualizar prioridade', 'error');
        }
    };

    // Calculate real average wait time
    const completedTickets = tickets.filter(t => t.status === 'done' && t.startedAt && t.createdAt);
    const avgWaitTime = completedTickets.length > 0
        ? Math.round(completedTickets.reduce((acc, t) => acc + (new Date(t.startedAt) - new Date(t.createdAt)), 0) / completedTickets.length / 60000)
        : 12; // Default estimate

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Calculate how long since ticket was called
    const getCalledDuration = (calledAt) => {
        if (!calledAt) return 0;
        const diff = currentTime - new Date(calledAt);
        return Math.floor(diff / 60000); // minutes
    };

    // Handle no-show
    const handleNoShow = async (ticketId) => {
        try {
            await updateTicketStatus(clinicId, ticketId, 'no_show');
            addToast('❌ Paciente marcado como não compareceu', 'warning');
        } catch (e) {
            console.error(e);
            addToast('Erro ao marcar no-show', 'error');
        }
    };

    // Handle search
    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.length >= 2) {
            const results = searchTicketByName(clinicId, query);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    // Handle pause
    const handlePause = async (ticketId) => {
        try {
            await pauseTicket(clinicId, ticketId);
            addToast('⏸️ Ticket pausado', 'info');
        } catch (e) {
            console.error(e);
            addToast('Erro ao pausar', 'error');
        }
    };

    // Handle resume
    const handleResume = async (ticketId) => {
        try {
            await resumeTicket(clinicId, ticketId);
            addToast('▶️ Ticket retomado', 'success');
        } catch (e) {
            console.error(e);
            addToast('Erro ao retomar', 'error');
        }
    };

    // Handle recall - call the patient again
    const handleRecall = async (ticketId) => {
        try {
            await updateTicketStatus(clinicId, ticketId, 'called');
            addToast('📢 Paciente chamado novamente!', 'info');
        } catch (e) {
            console.error(e);
            addToast('Erro ao rechamar', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-50 font-sans p-6 pb-24 relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute -bottom-[20%] -left-[10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="container max-w-7xl mx-auto space-y-8 relative z-10">

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

                {/* Search Bar */}
                <div className="relative">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                        <Search size={20} className="text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Buscar paciente por nome..."
                            className="flex-1 bg-transparent border-none text-white placeholder-slate-500 focus:outline-none text-sm"
                        />
                        {searchQuery && (
                            <button onClick={() => handleSearch('')} className="p-1 text-slate-500 hover:text-white">
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl bg-slate-800 border border-white/10 shadow-xl z-20 max-h-[200px] overflow-y-auto">
                            {searchResults.map(ticket => (
                                <div
                                    key={ticket.id}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    <div>
                                        <span className="font-bold text-white">#{ticket.number}</span>
                                        <span className="text-slate-300 ml-2">{ticket.patientName}</span>
                                        <span className={`ml-2 text-xs px-2 py-0.5 rounded ${ticket.status === 'waiting' ? 'bg-amber-500/20 text-amber-400' :
                                            ticket.status === 'paused' ? 'bg-slate-500/20 text-slate-400' :
                                                'bg-emerald-500/20 text-emerald-400'
                                            }`}>
                                            {ticket.status === 'paused' ? 'PAUSADO' : ticket.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleStatusChange(ticket.id, 'called')}
                                        className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold"
                                    >
                                        CHAMAR
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

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
                            {waitingTickets.map(ticket => {
                                const priorityConf = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.normal;
                                const isUrgent = ticket.priority === 'emergency';
                                const isPriority = ticket.priority === 'priority';

                                return (
                                    <div
                                        key={ticket.id}
                                        className={`group flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border transition-all shadow-sm ${isUrgent ? 'border-red-500/30 bg-red-500/5' :
                                            isPriority ? 'border-amber-500/30 bg-amber-500/5' :
                                                'border-white/5 hover:border-amber-500/30'
                                            }`}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className={`text-3xl font-bold transition-colors m-0 leading-none ${isUrgent ? 'text-red-400' :
                                                    isPriority ? 'text-amber-400' :
                                                        'text-white group-hover:text-amber-400'
                                                    }`}>
                                                    #{ticket.number}
                                                </h3>
                                                {priorityConf.label && (
                                                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${priorityConf.bg} ${priorityConf.text} border ${priorityConf.border}`}>
                                                        {isUrgent && <Zap size={10} />}
                                                        {priorityConf.label}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400 font-mono">
                                                <Clock size={12} />
                                                {formatTime(new Date(ticket.createdAt))}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Priority Toggle */}
                                            <button
                                                onClick={() => {
                                                    const next = ticket.priority === 'normal' ? 'priority' :
                                                        ticket.priority === 'priority' ? 'emergency' : 'normal';
                                                    handlePriorityChange(ticket.id, next);
                                                }}
                                                className={`p-2 rounded-lg transition-all active:scale-95 ${isUrgent ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' :
                                                    isPriority ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' :
                                                        'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-amber-400'
                                                    }`}
                                                title="Alterar Prioridade (Normal → Prioridade → Urgente)"
                                            >
                                                <Zap size={16} />
                                            </button>

                                            {/* Call Button */}
                                            <button
                                                onClick={() => handleStatusChange(ticket.id, 'called')}
                                                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2"
                                            >
                                                <Megaphone size={18} />
                                                CHAMAR
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
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
                            {activeTickets.map(ticket => {
                                const calledMins = getCalledDuration(ticket.calledAt);
                                const isOverdue = ticket.status === 'called' && calledMins >= (settings?.noShowTimeout || 5);

                                return (
                                    <div
                                        key={ticket.id}
                                        className={`relative flex items-center justify-between p-5 rounded-2xl bg-[#1e293b]/50 border transition-all overflow-hidden ${isOverdue ? 'border-red-500/50 bg-red-500/5' : ''}`}
                                        style={{
                                            borderColor: isOverdue ? undefined : (ticket.status === 'called' ? 'rgba(245, 158, 11, 0.5)' : 'rgba(16, 185, 129, 0.5)')
                                        }}
                                    >
                                        {ticket.status === 'called' && !isOverdue && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500 animate-pulse"></div>
                                        )}
                                        {ticket.status === 'called' && isOverdue && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500 animate-pulse"></div>
                                        )}
                                        {ticket.status === 'in_service' && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
                                        )}
                                        {ticket.status === 'paused' && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-500"></div>
                                        )}

                                        <div className="pl-3">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-2xl font-bold text-white m-0">#{ticket.number}</h3>
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${isOverdue
                                                    ? 'bg-red-500/20 text-red-400 border-red-500/20'
                                                    : ticket.status === 'called'
                                                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/20'
                                                        : ticket.status === 'paused'
                                                            ? 'bg-slate-500/20 text-slate-400 border-slate-500/20'
                                                            : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                                                    }`}>
                                                    {isOverdue ? 'AGUARDANDO' : ticket.status === 'called' ? 'CHAMANDO' : ticket.status === 'paused' ? 'PAUSADO' : 'ATENDENDO'}
                                                </span>
                                                {isOverdue && (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/20 animate-pulse">
                                                        <AlertTriangle size={12} />
                                                        {calledMins}min
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {ticket.calledAt && `Chamado às ${formatTime(new Date(ticket.calledAt))}`}
                                                {ticket.status === 'called' && calledMins > 0 && !isOverdue && ` (há ${calledMins}min)`}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {ticket.status === 'called' && (
                                                <>
                                                    <button
                                                        onClick={() => handleNoShow(ticket.id)}
                                                        className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 transition-all active:scale-95"
                                                        title="Não Compareceu"
                                                    >
                                                        <UserX size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => handlePause(ticket.id)}
                                                        className="p-3 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 hover:text-slate-300 border border-slate-500/20 transition-all active:scale-95"
                                                        title="Pausar (paciente saiu)"
                                                    >
                                                        <Pause size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleRecall(ticket.id)}
                                                        className="p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/20 transition-all active:scale-95"
                                                        title="Chamar Novamente"
                                                    >
                                                        <Repeat2 size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(ticket.id, 'in_service')}
                                                        className="p-3 rounded-xl bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                                                        title="Iniciar Atendimento"
                                                    >
                                                        <Play size={20} fill="currentColor" />
                                                    </button>
                                                </>
                                            )}
                                            {ticket.status === 'paused' && (
                                                <button
                                                    onClick={() => handleResume(ticket.id)}
                                                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2"
                                                    title="Retomar"
                                                >
                                                    <Play size={18} />
                                                    RETOMAR
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
                                );
                            })}
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
