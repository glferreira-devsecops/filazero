import { Bell, BellOff, Clock, Ticket, Users, Volume2 } from 'lucide-react';
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
    const ProgressRing = ({ progress, size = 120 }) => {
        const strokeWidth = 8;
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (progress / 100) * circumference;

        return (
            <div className="progress-ring" style={{ width: size, height: size }}>
                <svg width={size} height={size}>
                    <circle className="bg" cx={size / 2} cy={size / 2} r={radius} />
                    <circle
                        className="progress"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
                    />
                </svg>
                <div style={{
                    position: 'absolute',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Users size={24} className="text-primary" />
                    <span className="font-bold text-2xl">{position}</span>
                    <span className="text-muted text-sm">na frente</span>
                </div>
            </div>
        );
    };

    // No ticket yet - show creation screen
    if (!ticket) {
        return (
            <div className="container flex-center flex-col" style={{ minHeight: '90vh' }}>
                <div className="card glass flex-col flex-center gap-lg text-center animate-slideUp" style={{ maxWidth: '400px' }}>
                    <div style={{
                        background: 'var(--bg-hero)',
                        padding: '1rem',
                        borderRadius: 'var(--radius-full)',
                        display: 'flex'
                    }}>
                        <Ticket size={48} color="white" />
                    </div>

                    <div>
                        <h1 className="m-0">Clínica {clinicId}</h1>
                        <p className="text-muted">Retire sua senha digital para atendimento</p>
                    </div>

                    <button
                        onClick={handleCreateTicket}
                        disabled={loading}
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%' }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" />
                                Gerando...
                            </>
                        ) : (
                            <>
                                <Ticket size={20} />
                                Retirar Senha
                            </>
                        )}
                    </button>

                    <p className="text-muted text-sm m-0">
                        Você receberá um alerta quando for chamado
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
                return { text: 'CHAMANDO AGORA!', class: 'badge-called', color: 'var(--success)' };
            case 'waiting':
                return { text: 'AGUARDANDO', class: 'badge-waiting', color: 'var(--accent)' };
            case 'in_service':
                return { text: 'EM ATENDIMENTO', class: 'badge-service', color: 'var(--secondary)' };
            case 'done':
                return { text: 'FINALIZADO', class: 'badge-done', color: 'var(--text-muted)' };
            default:
                return { text: ticket.status.toUpperCase(), class: '', color: 'var(--text-muted)' };
        }
    };

    const statusInfo = getStatusInfo();
    const estimatedTime = position !== null ? position * 12 : null;

    return (
        <div className="container flex-col gap-lg" style={{ maxWidth: '500px', paddingTop: '2rem', paddingBottom: '4rem' }}>

            {/* Ticket Card */}
            <div
                className={`card glass text-center animate-slideUp ${isCalled ? 'animate-pulse' : ''}`}
                style={{ borderTop: `6px solid ${statusInfo.color}` }}
            >
                <p className="text-muted text-sm m-0 uppercase">Sua Senha</p>

                <h1
                    className={`ticket-number ${isCalled ? 'called' : ''}`}
                    style={{ margin: '0.5rem 0' }}
                >
                    {ticket.number}
                </h1>

                <div className={`badge ${statusInfo.class}`} style={{ fontSize: '0.875rem' }}>
                    {statusInfo.text}
                </div>
            </div>

            {/* Position & Time Card */}
            {isWaiting && position !== null && (
                <div className="card flex-col gap-md animate-slideUp" style={{ animationDelay: '0.1s' }}>
                    <div className="flex-center">
                        <ProgressRing progress={Math.max(0, 100 - (position * 10))} />
                    </div>

                    <div className="divider" />

                    <div className="flex-between">
                        <div className="flex-center gap-sm">
                            <Clock size={20} className="text-primary" />
                            <span>Tempo estimado</span>
                        </div>
                        <strong className="text-xl">{estimatedTime} min</strong>
                    </div>
                </div>
            )}

            {/* Called Alert */}
            {isCalled && (
                <div className="card animate-pulse" style={{
                    background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                    border: '2px solid var(--success)'
                }}>
                    <div className="flex-center flex-col gap-sm text-center">
                        <Bell size={40} style={{ color: 'var(--success)' }} />
                        <h2 style={{ color: '#15803d', margin: 0 }}>É A SUA VEZ!</h2>
                        <p style={{ color: '#166534', margin: 0 }}>
                            Dirija-se ao local de atendimento agora.
                        </p>
                    </div>
                </div>
            )}

            {/* In Service Info */}
            {isInService && (
                <div className="card" style={{
                    background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                    border: '2px solid var(--secondary)'
                }}>
                    <div className="flex-center flex-col gap-sm text-center">
                        <Volume2 size={32} style={{ color: 'var(--secondary)' }} />
                        <h3 style={{ color: '#1e40af', margin: 0 }}>Atendimento em Andamento</h3>
                        <p style={{ color: '#1e3a8a', margin: 0 }}>
                            Aguarde o término do seu atendimento.
                        </p>
                    </div>
                </div>
            )}

            {/* Done Message */}
            {isDone && (
                <div className="card text-center" style={{ background: 'var(--bg-card)' }}>
                    <h3 className="text-muted">Atendimento Finalizado</h3>
                    <p className="text-muted">Obrigado por utilizar o FilaZero!</p>
                    <button
                        onClick={handleLeaveQueue}
                        className="btn btn-primary"
                    >
                        Nova Senha
                    </button>
                </div>
            )}

            {/* Controls */}
            {!isDone && (
                <div className="flex-center gap-md">
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="btn btn-outline btn-sm"
                        title={soundEnabled ? 'Desativar som' : 'Ativar som'}
                    >
                        {soundEnabled ? <Bell size={18} /> : <BellOff size={18} />}
                        {soundEnabled ? 'Som Ativo' : 'Som Mudo'}
                    </button>

                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={handleLeaveQueue}
                    >
                        Sair da fila
                    </button>
                </div>
            )}
        </div>
    );
}
