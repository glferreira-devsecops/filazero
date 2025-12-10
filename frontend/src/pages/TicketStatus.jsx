import { AlertCircle, Bell, BellOff, CheckCircle, Clock, Ticket, Users, Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { createTicket, getQueuePosition, subscribeToTicket } from '../services/ticketService';

export default function TicketStatus() {
    const { clinicId } = useParams();
    const [ticket, setTicket] = useState(null);
    const [position, setPosition] = useState(null);
    const [loading, setLoading] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const { addToast } = useToast();

    // Check if we already have a ticket in localStorage for this clinic
    useEffect(() => {
        const storedTicketId = localStorage.getItem(`filazero_ticket_${clinicId}`);
        if (storedTicketId) {
            const unsubscribe = subscribeToTicket(clinicId, storedTicketId, (data) => {
                // Audio alert if status changes to called
                if (data && data.status === 'called' && ticket && ticket.status !== 'called') {
                    playAlert();
                }
                setTicket(data);
                if (data && data.status === 'waiting') {
                    updatePosition(data.number);
                }
            });
            return () => unsubscribe();
        }
    }, [clinicId, ticket]);

    const playAlert = () => {
        if (!soundEnabled) return;
        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(() => { }); // Ignore auto-play errors

            if ('vibrate' in navigator) {
                navigator.vibrate([200, 100, 200, 100, 200]);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const updatePosition = async (number) => {
        const pos = await getQueuePosition(clinicId, number);
        setPosition(pos);
    };

    const handleCreateTicket = async () => {
        setLoading(true);
        try {
            const newTicket = await createTicket(clinicId);
            localStorage.setItem(`filazero_ticket_${clinicId}`, newTicket.id);
            setTicket(newTicket);
            updatePosition(newTicket.number);

            subscribeToTicket(clinicId, newTicket.id, (data) => {
                if (data && data.status === 'called' && ticket?.status !== 'called') {
                    playAlert();
                }
                setTicket(data);
                if (data && data.status === 'waiting') updatePosition(data.number);
            });

        } catch (err) {
            console.error(err);
            addToast("Erro ao gerar ticket. Tente novamente.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveQueue = () => {
        if (window.confirm('Deseja realmente sair da fila?')) {
            localStorage.removeItem(`filazero_ticket_${clinicId}`);
            setTicket(null);
            setPosition(null);
        }
    };

    // Progress Ring Component
    const ProgressRing = ({ progress, size = 140 }) => {
        const strokeWidth = 8;
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (progress / 100) * circumference;

        return (
            <div className="relative flex items-center justify-center">
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle
                        className="text-slate-800"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                    />
                    <circle
                        className="text-emerald-500 transition-all duration-1000 ease-out"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        fill="transparent"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Users size={24} className="text-emerald-400 mb-1" />
                    <span className="font-bold text-3xl text-white tracking-tighter">{position}</span>
                    <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">Na frente</span>
                </div>
            </div>
        );
    };

    // No ticket yet - show creation screen
    if (!ticket) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 text-center shadow-2xl animate-slideUp">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center shadow-lg shadow-emerald-900/50 mb-6">
                        <Ticket size={36} className="text-white" />
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2">Clínica {clinicId}</h1>
                    <p className="text-slate-400 text-sm mb-8">Retire sua senha digital para atendimento seguro e sem filas.</p>

                    <button
                        onClick={handleCreateTicket}
                        disabled={loading}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Gerando Senha...
                            </>
                        ) : (
                            <>
                                <Ticket size={24} />
                                Retirar Senha
                            </>
                        )}
                    </button>

                    <p className="text-slate-500 text-xs mt-6 flex items-center justify-center gap-2">
                        <Bell size={12} />
                        Você será notificado quando for sua vez
                    </p>
                </div>
            </div>
        );
    }

    const isCalled = ticket.status === 'called';
    const isWaiting = ticket.status === 'waiting';
    const isInService = ticket.status === 'in_service';
    const isDone = ticket.status === 'done';

    const getStatusInfo = () => {
        switch (ticket.status) {
            case 'called':
                return { text: 'É A SUA VEZ!', color: 'bg-amber-500', textCol: 'text-amber-500', border: 'border-amber-500/50' };
            case 'waiting':
                return { text: 'AGUARDANDO', color: 'bg-blue-500', textCol: 'text-blue-500', border: 'border-blue-500/50' };
            case 'in_service':
                return { text: 'EM ATENDIMENTO', color: 'bg-emerald-500', textCol: 'text-emerald-500', border: 'border-emerald-500/50' };
            case 'done':
                return { text: 'FINALIZADO', color: 'bg-slate-500', textCol: 'text-slate-500', border: 'border-slate-500/50' };
            default:
                return { text: ticket.status.toUpperCase(), color: 'bg-slate-500', textCol: 'text-slate-500', border: 'border-slate-500/50' };
        }
    };

    const status = getStatusInfo();
    const estimatedTime = position !== null ? position * 12 : null;

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-50 font-sans p-6 pb-24 flex flex-col items-center">

            <div className="w-full max-w-md space-y-6">

                {/* Status Badge */}
                <div className={`flex items-center justify-center gap-2 py-2 px-4 rounded-full border ${status.border} bg-opacity-10 ${status.color.replace('bg-', 'bg-')} bg-opacity-10 mx-auto w-fit`}>
                    <span className={`w-2 h-2 rounded-full ${status.color} animate-pulse`}></span>
                    <span className={`text-xs font-bold tracking-widest ${status.textCol}`}>{status.text}</span>
                </div>

                {/* Ticket Card */}
                <div className={`relative overflow-hidden rounded-[2rem] bg-white/[0.03] border ${isCalled ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'border-white/10'} backdrop-blur-xl p-8 text-center transition-all duration-500`}>
                    {isCalled && <div className="absolute inset-0 bg-amber-500/10 animate-pulse"></div>}

                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Sua Senha Digital</p>
                    <h1 className="text-7xl font-black text-white tracking-tighter mb-4 relative z-10 drop-shadow-lg">
                        {ticket.number}
                    </h1>
                    <div className="h-1 w-full border-t-2 border-dashed border-white/10 relative z-10"></div>
                </div>

                {/* Position & Time Card */}
                {isWaiting && position !== null && (
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-between animate-slideUp">
                        <ProgressRing progress={Math.max(0, 100 - (position * 10))} size={100} />

                        <div className="flex-1 pl-6 border-l border-white/5">
                            <div className="flex items-center gap-2 text-emerald-400 mb-1">
                                <Clock size={18} />
                                <span className="text-xs font-bold uppercase tracking-wider">Estimativa</span>
                            </div>
                            <strong className="text-3xl font-bold text-white block">{estimatedTime} <span className="text-sm font-medium text-slate-500">min</span></strong>
                            <p className="text-slate-500 text-xs mt-1">Baseado na média da clínica</p>
                        </div>
                    </div>
                )}

                {/* Called Alert */}
                {isCalled && (
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 text-center animate-bounce-subtle">
                        <AlertCircle size={48} className="text-amber-400 mx-auto mb-3" />
                        <h2 className="text-xl font-bold text-white mb-1">É A SUA VEZ!</h2>
                        <p className="text-amber-200 text-sm">Dirija-se ao guichê de atendimento.</p>
                    </div>
                )}

                {/* In Service Info */}
                {isInService && (
                    <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                        <Volume2 size={40} className="text-emerald-400 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-white mb-1">Atendimento em Andamento</h3>
                        <p className="text-emerald-200/70 text-sm">Aguarde o término do seu atendimento.</p>
                    </div>
                )}

                {/* Done Message */}
                {isDone && (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Atendimento Finalizado</h3>
                        <p className="text-slate-400 text-sm mb-6">Obrigado por utilizar o FilaZero!</p>
                        <button
                            onClick={handleLeaveQueue}
                            className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all"
                        >
                            Retirar Nova Senha
                        </button>
                    </div>
                )}

                {/* Controls */}
                {!isDone && (
                    <div className="flex items-center justify-center gap-4 pt-4">
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-all text-xs font-bold uppercase tracking-wider"
                        >
                            {soundEnabled ? <Bell size={14} /> : <BellOff size={14} />}
                            {soundEnabled ? 'Som Ativo' : 'Mudo'}
                        </button>

                        <button
                            className="text-red-400 text-xs font-bold uppercase tracking-wider hover:text-red-300 transition-colors"
                            onClick={handleLeaveQueue}
                        >
                            Sair da fila
                        </button>
                    </div>
                )}
            </div>

            {/* Minimal Footer */}
            <div className="mt-auto pt-8 text-center opacity-30 text-[10px] uppercase tracking-widest text-slate-500">
                FilaZero Saúde • Patient App
            </div>
        </div>
    );
}
