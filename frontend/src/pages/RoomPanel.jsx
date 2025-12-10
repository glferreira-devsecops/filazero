import { Expand, Minimize, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { subscribeToQueue } from '../services/ticketService';

import { useAuth } from '../context/AuthContext';

export default function RoomPanel() {
    const { currentUser } = useAuth();
    const clinicId = currentUser?.id;

    const [calledTicket, setCalledTicket] = useState(null);
    const [history, setHistory] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);

    // Real-time clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Voice announcement using Web Speech API
    const announceTicket = (number) => {
        if (!voiceEnabled || !('speechSynthesis' in window)) return;

        const utterance = new SpeechSynthesisUtterance(`Senha número ${number}, dirija-se ao guichê`);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
    };

    // Audio alert
    const playRoomAlert = () => {
        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
            audio.volume = 0.7;
            audio.play().catch(e => console.error("Audio error:", e));
        } catch (e) {
            console.error("Failed to play audio:", e);
        }
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        if (!clinicId) return;
        const unsubscribe = subscribeToQueue(clinicId, (tickets) => {
            const called = tickets.filter(t => t.status === 'called');

            if (called.length > 0) {
                const mostRecent = called[called.length - 1];
                setCalledTicket(prev => {
                    if (prev?.id !== mostRecent.id) {
                        playRoomAlert();
                        setTimeout(() => announceTicket(mostRecent.number), 500);
                    }
                    return mostRecent;
                });
            } else {
                setCalledTicket(null);
            }

            const others = tickets.filter(t =>
                ['called', 'in_service'].includes(t.status) &&
                t.id !== (called[called.length - 1]?.id)
            );
            setHistory(others.slice(-5));
        });
        return () => unsubscribe();
    }, [clinicId, voiceEnabled]);

    const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const formatDate = (date) => date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <div style={{
            height: '100vh',
            padding: '2rem',
            boxSizing: 'border-box',
            background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            overflow: 'hidden',
            position: 'relative'
        }}>
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 50%)',
                animation: 'rotate 60s linear infinite',
                pointerEvents: 'none'
            }} />
            {/* Top Bar */}
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div style={{ color: 'white' }}>
                    <h2 style={{ margin: 0, opacity: 0.9 }}>🏥 FilaZero Saúde</h2>
                    <p style={{ margin: 0, opacity: 0.6, fontSize: '0.9rem' }}>{formatDate(currentTime)}</p>
                </div>
                <div className="flex-center gap-md">
                    <div className="clock" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '1.5rem' }}>
                        {formatTime(currentTime)}
                    </div>
                    {/* Voice Test Button (Hidden unless hovered/active to keep clean) */}
                    <button
                        onClick={() => announceTicket("Teste")}
                        className="btn btn-icon"
                        style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
                        title="Testar Voz Agora"
                    >
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>TEST</span>
                    </button>

                    <button
                        onClick={() => setVoiceEnabled(!voiceEnabled)}
                        className="btn btn-icon"
                        style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
                        title={voiceEnabled ? 'Desativar voz' : 'Ativar voz'}
                    >
                        {voiceEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                    </button>
                    <button
                        onClick={toggleFullscreen}
                        className="btn btn-icon"
                        style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
                        title="Tela cheia"
                    >
                        {isFullscreen ? <Minimize size={24} /> : <Expand size={24} />}
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', height: 'calc(100% - 100px)', gap: '2rem' }}>
                {/* Main Focus */}
                <div
                    className="card glass flex-center flex-col"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))',
                        border: '6px solid var(--primary)',
                        boxShadow: calledTicket ? 'var(--shadow-glow)' : 'var(--shadow-lg)'
                    }}
                >
                    <h2 style={{
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        color: 'var(--text-muted)',
                        margin: 0,
                        letterSpacing: '0.1em'
                    }}>
                        SENHA ATUAL
                    </h2>

                    {calledTicket ? (
                        <>
                            <h1
                                className="animate-scaleIn"
                                style={{
                                    fontSize: 'clamp(8rem, 20vw, 18rem)',
                                    margin: 0,
                                    lineHeight: 1,
                                    background: 'var(--bg-hero)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontWeight: 800,
                                    textShadow: '0 0 50px rgba(34, 197, 94, 0.5)',
                                    animation: 'pulseGlow 2s infinite'
                                }}
                            >
                                {calledTicket.number}
                            </h1>
                            <h3 style={{
                                fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                                color: 'var(--text-main)',
                                margin: '1rem 0'
                            }}>
                                GUICHÊ 01
                            </h3>
                            <div
                                className="animate-pulse"
                                style={{
                                    padding: '1rem 3rem',
                                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                    color: 'white',
                                    borderRadius: '50px',
                                    fontSize: 'clamp(1.25rem, 2.5vw, 2rem)',
                                    fontWeight: 'bold'
                                }}
                            >
                                CHAMANDO
                            </div>
                        </>
                    ) : (
                        <div className="flex-col flex-center gap-md animate-float">
                            <h1 style={{
                                fontSize: 'clamp(4rem, 10vw, 8rem)',
                                color: 'var(--text-muted)',
                                opacity: 0.3,
                                margin: 0
                            }}>
                                ---
                            </h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>
                                Aguardando próxima chamada...
                            </p>
                        </div>
                    )}
                </div>

                {/* Sidebar List */}
                <div className="flex-col gap-md">
                    <div
                        className="card"
                        style={{
                            height: '100%',
                            background: 'rgba(255,255,255,0.05)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: 'white',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <h3
                            className="text-center"
                            style={{
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                paddingBottom: '1rem',
                                margin: '0 0 1rem 0',
                                letterSpacing: '0.05em'
                            }}
                        >
                            ÚLTIMOS CHAMADOS
                        </h3>
                        <div className="flex-col gap-sm" style={{ flex: 1, overflowY: 'auto' }}>
                            {history.length === 0 && (
                                <p className="text-center" style={{ opacity: 0.5, marginTop: '2rem' }}>
                                    Nenhum chamado recente
                                </p>
                            )}
                            {history.map((t, i) => (
                                <div
                                    key={t.id}
                                    className="flex-between"
                                    style={{
                                        padding: '1rem 1.25rem',
                                        background: 'rgba(255,255,255,0.08)',
                                        borderRadius: 'var(--radius-md)',
                                        opacity: 1 - (i * 0.15)
                                    }}
                                >
                                    <span style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 'bold' }}>
                                        {t.number}
                                    </span>
                                    <span
                                        className={`badge ${t.status === 'in_service' ? 'badge-service' : 'badge-waiting'}`}
                                        style={{ fontSize: '0.7rem' }}
                                    >
                                        {t.status === 'in_service' ? 'ATENDENDO' : 'AGUARDANDO'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
