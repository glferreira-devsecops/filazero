import { Activity, Clock, Expand, Minimize, QrCode, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeToQueue } from '../services/ticketService';

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
        <div className="h-screen w-screen overflow-hidden bg-[#0a0f1c] text-slate-50 relative flex flex-col p-8 font-sans">

            {/* Ambient Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(16,185,129,0.03)_0%,transparent_50%)] animate-[spin_60s_linear_infinite]"></div>
            </div>

            {/* Top Bar */}
            <header className="relative z-10 flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <Activity size={32} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight uppercase">FilaZero Saúde</h1>
                        <p className="text-slate-400 text-sm font-medium capitalize">{formatDate(currentTime)}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
                        <Clock size={24} className="text-emerald-400" />
                        <span className="text-3xl font-mono font-bold text-white tracking-widest">{formatTime(currentTime)}</span>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => announceTicket("Teste")}
                            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                            title="Testar Voz"
                        >
                            <span className="text-xs font-bold uppercase">Test</span>
                        </button>
                        <button
                            onClick={() => setVoiceEnabled(!voiceEnabled)}
                            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                            title={voiceEnabled ? 'Desativar voz' : 'Ativar voz'}
                        >
                            {voiceEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                        </button>
                        <button
                            onClick={toggleFullscreen}
                            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                            title="Tela cheia"
                        >
                            {isFullscreen ? <Minimize size={24} /> : <Expand size={24} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Info */}
            <main className="relative z-10 flex-1 grid grid-cols-[1.8fr_1fr] gap-8 h-full">

                {/* Main Focus Card (Current Ticket) */}
                <div className={`relative rounded-[2.5rem] flex flex-col items-center justify-center border-4 shadow-2xl overflow-hidden transition-all duration-500 ${calledTicket ? 'border-emerald-500 bg-white shadow-emerald-500/20' : 'border-white/5 bg-white/[0.02]'}`}>

                    {calledTicket ? (
                        <>
                            <div className="absolute inset-x-0 top-0 h-2 bg-emerald-500"></div>
                            <h2 className="text-2xl md:text-4xl font-black tracking-[0.2em] text-slate-400 uppercase mb-4">Senha Atual</h2>

                            <h1 className="text-[12rem] md:text-[16rem] leading-none font-black text-slate-900 tracking-tighter animate-scaleIn drop-shadow-2xl">
                                {calledTicket.number}
                            </h1>

                            <div className="mt-8 flex flex-col items-center gap-4">
                                <h3 className="text-4xl font-bold text-slate-600 uppercase tracking-widest">Guichê 01</h3>
                                <div className="px-12 py-4 rounded-full bg-emerald-500 text-white text-3xl font-black uppercase tracking-wider animate-pulse shadow-xl shadow-emerald-500/30">
                                    Chamando
                                </div>
                            </div>

                            {/* Decorative Background Elements */}
                            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="absolute -left-20 -top-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center opacity-30 animate-pulse">
                            <span className="text-[8rem] font-black text-slate-600">---</span>
                            <p className="text-2xl font-medium text-slate-500 uppercase tracking-widest mt-4">Aguardando Próxima Chamada...</p>
                        </div>
                    )}
                </div>

                {/* Sidebar (History) */}
                <div className="flex flex-col gap-6">
                    <div className="flex-1 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-xl p-6 flex flex-col overflow-hidden">
                        <h3 className="text-xl font-bold text-slate-200 uppercase tracking-widest border-b border-white/5 pb-4 mb-4 flex items-center gap-3">
                            <Clock size={24} className="text-emerald-500" />
                            Últimos Chamados
                        </h3>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {history.length === 0 && (
                                <div className="h-full flex items-center justify-center opacity-30">
                                    <p className="text-center font-medium">Nenhum histórico recente</p>
                                </div>
                            )}

                            {history.map((t, i) => (
                                <div
                                    key={t.id}
                                    className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.05] border border-white/5 animate-slideUp"
                                    style={{
                                        opacity: Math.max(0.4, 1 - (i * 0.15)),
                                        animationDelay: `${i * 0.1}s`
                                    }}
                                >
                                    <span className="text-4xl font-black text-white tracking-tight">
                                        {t.number}
                                    </span>
                                    <span
                                        className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${t.status === 'in_service'
                                                ? 'bg-blue-500/20 text-blue-400'
                                                : 'bg-amber-500/20 text-amber-400'
                                            }`}
                                    >
                                        {t.status === 'in_service' ? 'Atendendo' : 'Aguardando'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Clinic QR */}
                    <div className="p-6 rounded-3xl bg-emerald-900/10 border border-emerald-500/10 flex items-center justify-between">
                        <div>
                            <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">Escaneie para entrar</p>
                            <h4 className="text-xl font-bold text-white">Fila Digital</h4>
                        </div>
                        <div className="p-2 bg-white rounded-xl">
                            <QrCode size={48} className="text-slate-900" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
