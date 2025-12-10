import { CheckCircle, Clock, Megaphone, Play, QrCode, RefreshCw, User, X } from 'lucide-react';
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

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="container" style={{ paddingBottom: '2rem' }}>
            {/* Header */}
            <header className="flex-between flex-wrap gap-md" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0 }}>🏥 Recepção</h1>
                    <p className="text-muted" style={{ margin: 0 }}>Clínica {clinicId}</p>
                </div>

                <div className="flex-center gap-md">
                    <div className="clock">
                        <Clock size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                        {formatTime(currentTime)}
                    </div>

                    <button onClick={() => setShowQR(true)} className="btn btn-outline btn-sm">
                        <QrCode size={18} />
                        QR Code
                    </button>
                    <button onClick={() => navigate('/panel')} className="btn btn-outline btn-sm">
                        📺 TV
                    </button>
                    <button onClick={() => navigate('/admin')} className="btn btn-outline btn-sm">
                        📊 Stats
                    </button>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid gap-md" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', marginBottom: '2rem' }}>
                <div className="card text-center" style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)' }}>
                    <p className="text-sm m-0" style={{ color: 'var(--accent)' }}>Aguardando</p>
                    <h2 className="m-0" style={{ color: '#b45309' }}>{waitingTickets.length}</h2>
                </div>
                <div className="card text-center" style={{ background: 'var(--success-light)', border: '1px solid var(--success)' }}>
                    <p className="text-sm m-0" style={{ color: 'var(--success)' }}>Em Atendimento</p>
                    <h2 className="m-0" style={{ color: '#15803d' }}>{activeTickets.length}</h2>
                </div>
                <div className="card text-center" style={{ background: 'var(--secondary-light)', border: '1px solid var(--secondary)' }}>
                    <p className="text-sm m-0" style={{ color: 'var(--secondary)' }}>Tempo Médio</p>
                    <h2 className="m-0" style={{ color: '#1d4ed8' }}>~12min</h2>
                </div>
            </div>

            {/* Main Grid */}
            <div className="animate-slideUp" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

                {/* Waiting Column */}
                <section className="flex-col gap-md">
                    <div className="card glass">
                        <h2 className="flex-center gap-sm" style={{ marginTop: 0, fontSize: '1.25rem' }}>
                            <User size={24} className="text-muted" />
                            Aguardando
                            <span className="badge badge-waiting">{waitingTickets.length}</span>
                        </h2>
                        <div className="flex-col gap-sm">
                            {waitingTickets.length === 0 && (
                                <div className="text-center py-4">
                                    <RefreshCw size={32} className="text-muted animate-float" />
                                    <p className="text-muted">Nenhum paciente na fila</p>
                                </div>
                            )}
                            {waitingTickets.map(ticket => (
                                <div
                                    key={ticket.id}
                                    className="card interactive flex-between"
                                    style={{ padding: '1rem', border: '1px solid var(--border)', cursor: 'default' }}
                                >
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--primary-dark)' }}>
                                            #{ticket.number}
                                        </h3>
                                        <small className="text-muted">
                                            {ticket.createdAt instanceof Date
                                                ? `Chegou ${formatTime(ticket.createdAt)}`
                                                : '--:--'}
                                        </small>
                                    </div>
                                    <button
                                        onClick={() => handleStatusChange(ticket.id, 'called')}
                                        className="btn btn-primary"
                                    >
                                        <Megaphone size={18} /> Chamar
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Active Column */}
                <section className="flex-col gap-md">
                    <div className="card glass">
                        <h2 className="flex-center gap-sm" style={{ marginTop: 0, color: 'var(--primary)', fontSize: '1.25rem' }}>
                            <Megaphone size={24} />
                            Em Atendimento
                        </h2>
                        <div className="flex-col gap-sm">
                            {activeTickets.length === 0 && (
                                <p className="text-muted text-center py-4">Nenhum atendimento ativo</p>
                            )}
                            {activeTickets.map(ticket => (
                                <div
                                    key={ticket.id}
                                    className="card flex-between"
                                    style={{
                                        padding: '1rem',
                                        borderLeft: `4px solid ${ticket.status === 'called' ? 'var(--accent)' : 'var(--success)'}`
                                    }}
                                >
                                    <div>
                                        <div className="flex-center gap-xs" style={{ justifyContent: 'flex-start' }}>
                                            <h3 style={{ margin: 0 }}>#{ticket.number}</h3>
                                            <span className={`badge ${ticket.status === 'called' ? 'badge-called' : 'badge-service'}`}>
                                                {ticket.status === 'called' ? 'CHAMANDO' : 'ATENDENDO'}
                                            </span>
                                        </div>
                                        <small className="text-muted">
                                            {ticket.calledAt instanceof Date
                                                ? `Chamado ${formatTime(ticket.calledAt)}`
                                                : ''}
                                        </small>
                                    </div>
                                    <div className="flex-center gap-xs">
                                        {ticket.status === 'called' && (
                                            <button
                                                onClick={() => handleStatusChange(ticket.id, 'in_service')}
                                                className="btn btn-accent btn-sm"
                                                title="Iniciar Atendimento"
                                            >
                                                <Play size={16} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleStatusChange(ticket.id, 'done')}
                                            className="btn btn-success btn-sm"
                                            title="Finalizar"
                                        >
                                            <CheckCircle size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            {/* QR Code Modal */}
            {showQR && (
                <div
                    className="flex-center"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 1000
                    }}
                    onClick={() => setShowQR(false)}
                >
                    <div
                        className="card flex-col flex-center gap-lg animate-scaleIn"
                        style={{ maxWidth: '350px' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex-between" style={{ width: '100%' }}>
                            <h3 style={{ margin: 0 }}>QR Code da Clínica</h3>
                            <button onClick={() => setShowQR(false)} className="btn btn-ghost btn-icon">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="qr-container">
                            <QRCodeSVG
                                value={clinicUrl}
                                size={200}
                                bgColor="#ffffff"
                                fgColor="#10b981"
                                level="H"
                            />
                        </div>

                        <p className="text-center text-muted text-sm m-0">
                            Pacientes podem escanear para entrar na fila
                        </p>

                        <input
                            type="text"
                            className="input text-center"
                            value={clinicUrl}
                            readOnly
                            onClick={e => e.target.select()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
