import { AlertCircle, Bell, BellOff, CheckCircle, Clock, Ticket, Users, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { createTicket, getQueuePosition, removeTicket, subscribeToTicket } from '../services/ticketService';
import { sanitizeClinicId } from '../utils/security';

export default function TicketStatus() {
    const { clinicId: rawClinicId } = useParams();
    const clinicId = sanitizeClinicId(rawClinicId); // Sanitize URL param

    const [ticket, setTicket] = useState(null);
    const [position, setPosition] = useState(null);
    const [loading, setLoading] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const { addToast } = useToast();

    // Use ref to track previous status without causing re-renders
    const prevStatusRef = useRef(null);

    // Check if we already have a ticket in localStorage for this clinic
    useEffect(() => {
        const storedTicketId = localStorage.getItem(`filazero_ticket_${clinicId}`);
        if (storedTicketId) {
            const unsubscribe = subscribeToTicket(clinicId, storedTicketId, (data) => {
                // Audio alert if status changes to called
                if (data && data.status === 'called' && prevStatusRef.current !== 'called') {
                    playAlert();
                }
                prevStatusRef.current = data?.status;
                setTicket(data);
                if (data && data.status === 'waiting') {
                    updatePosition(data.number);
                }
            });
            return () => unsubscribe();
        }
    }, [clinicId]); // Removed ticket from dependencies

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

    const handleLeaveQueue = async () => {
        if (window.confirm('Deseja realmente sair da fila?')) {
            try {
                // Remove from mock database
                if (ticket?.id) {
                    await removeTicket(clinicId, ticket.id);
                }
                // Clear localStorage reference
                localStorage.removeItem(`filazero_ticket_${clinicId}`);
                setTicket(null);
                setPosition(null);
                addToast('👋 Você saiu da fila com sucesso!', 'success');
            } catch (e) {
                console.error('Error leaving queue:', e);
                addToast('Erro ao sair da fila', 'error');
            }
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
        <div className="min-h-screen bg-[#0f172a] text-slate-50 font-sans p-4 sm:p-6 overflow-y-auto overflow-x-hidden">

            <div className="w-full max-w-md mx-auto space-y-6 pb-20">

                {/* Header / Status Badge */}
                <div className="flex flex-col items-center gap-4">
                    <h1 className="text-xl font-bold text-slate-300">FilaZero Acompanhamento</h1>
                    <div className={`flex items-center justify-center gap-2 py-2 px-6 rounded-full border ${status.border} bg-opacity-10 ${status.color.replace('bg-', 'bg-')} bg-opacity-10 w-fit shadow-lg shadow-black/20`}>
                        <span className={`w-3 h-3 rounded-full ${status.color} animate-pulse`}></span>
                        <span className={`text-sm font-bold tracking-widest ${status.textCol}`}>{status.text}</span>
                    </div>
                </div>

                {/* Ticket Card */}
                <div className={`relative overflow-hidden rounded-[2rem] bg-white/[0.03] border ${isCalled ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'border-white/10'} backdrop-blur-xl p-8 text-center transition-all duration-500`}>
                    {isCalled && <div className="absolute inset-0 bg-amber-500/10 animate-pulse"></div>}

                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 relative z-10">Sua Senha Digital</p>
                    <div className="relative z-10 py-2">
                        <span className="text-6xl sm:text-7xl font-black text-white tracking-tighter drop-shadow-2xl whitespace-nowrap leading-none block">
                            {ticket.number}
                        </span>
                    </div>
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mt-6 relative z-10"></div>
                </div>

                {/* Position & Time Card */}
                {isWaiting && position !== null && (
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 animate-slideUp">
                        <div className="shrink-0">
                            <ProgressRing progress={Math.max(0, 100 - (position * 10))} size={110} />
                        </div>

                        <div className="flex-1 w-full text-center sm:text-left sm:pl-6 sm:border-l border-white/5 border-t sm:border-t-0 pt-6 sm:pt-0">
                            <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-400 mb-2">
                                <Clock size={16} />
                                <span className="text-xs font-bold uppercase tracking-wider">Estimativa</span>
                            </div>
                            <strong className="text-4xl font-bold text-white block tracking-tight">{estimatedTime} <span className="text-sm font-medium text-slate-500 align-baseline ml-1">min</span></strong>
                            <p className="text-slate-500 text-xs mt-2">Tempo médio de espera</p>
                        </div>
                    </div>
                )}

                {/* Called Alert */}
                {isCalled && (
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 text-center animate-bounce-subtle shadow-lg">
                        <AlertCircle size={48} className="text-amber-400 mx-auto mb-3" />
                        <h2 className="text-2xl font-bold text-white mb-2">É A SUA VEZ!</h2>
                        <p className="text-amber-200 text-sm font-medium">Dirija-se ao guichê de atendimento.</p>
                    </div>
                )}

                {/* In Service Info */}
                {isInService && (
                    <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-center shadow-lg">
                        <Volume2 size={40} className="text-emerald-400 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-white mb-1">Atendimento em Andamento</h3>
                        <p className="text-emerald-200/70 text-sm">Aguarde o término do seu atendimento.</p>
                    </div>
                )}

                {/* Done Message */}
                {isDone && (
                    <div className="text-center py-8 bg-white/[0.02] rounded-3xl border border-white/5">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 shadow-inner">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Atendimento Finalizado</h3>
                        <p className="text-slate-400 text-sm mb-6">Obrigado por utilizar o FilaZero!</p>
                        <button
                            onClick={handleLeaveQueue}
                            className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10"
                        >
                            Retirar Nova Senha
                        </button>
                    </div>
                )}

                {/* Controls */}
                {!isDone && (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-all group"
                        >
                            {soundEnabled ? <Bell size={20} className="group-hover:text-emerald-400 transition-colors" /> : <BellOff size={20} />}
                            <span className="text-[10px] font-bold uppercase tracking-wider">{soundEnabled ? 'Som Ativo' : 'Mudo'}</span>
                        </button>

                        <button
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 text-slate-400 hover:text-red-400 transition-all group"
                            onClick={handleLeaveQueue}
                        >
                            <Ticket size={20} className="rotate-45 group-hover:text-red-400 transition-colors" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Sair da Fila</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 w-full p-4 text-center bg-gradient-to-t from-[#0f172a] to-transparent pointer-events-none">
                <span className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">FilaZero Saúde • Patient App</span>
            </div>
        </div>
    );
}
