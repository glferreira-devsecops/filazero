import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * 404 Not Found Page
 * Premium design with helpful navigation options
 */
export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-50 font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[30%] -left-[20%] w-[60%] h-[60%] bg-red-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-[30%] -right-[20%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 text-center max-w-lg mx-auto">

                {/* 404 Visual */}
                <div className="relative mb-8">
                    <div className="text-[180px] md:text-[220px] font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-700 to-slate-900 leading-none select-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="p-5 rounded-full bg-red-500/10 border border-red-500/20 animate-pulse">
                            <AlertTriangle size={48} className="text-red-400" />
                        </div>
                    </div>
                </div>

                {/* Message */}
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Página não encontrada
                </h1>
                <p className="text-slate-400 mb-8 text-lg">
                    A página que você está procurando não existe ou foi movida.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all font-medium"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        Voltar
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all"
                    >
                        <Home size={20} />
                        Ir para Início
                    </button>
                </div>

                {/* Quick Links */}
                <div className="mt-12 pt-8 border-t border-white/5">
                    <p className="text-slate-500 text-sm mb-4">Links úteis:</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={() => navigate('/clinic/demo')}
                            className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                        >
                            Ver Demo
                        </button>
                        <span className="text-slate-700">•</span>
                        <button
                            onClick={() => navigate('/')}
                            className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                        >
                            Página Inicial
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 text-center">
                <p className="text-slate-600 text-xs">
                    FilaZero Saúde © {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}
