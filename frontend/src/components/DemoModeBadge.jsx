import { Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Demo Mode Badge - Floating indicator showing the app is in demo mode
 * Only visible when user is logged in as guest (demo mode)
 */
export default function DemoModeBadge() {
    const { currentUser } = useAuth();

    // Only show when user is logged in as guest
    const isGuestMode = currentUser?.id === 'guest' || currentUser?.id === 'demo';

    if (!isGuestMode) return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 animate-slideUp">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold shadow-lg shadow-purple-500/30 border border-white/20 backdrop-blur-sm">
                <Sparkles size={16} className="animate-pulse" />
                <span>MODO DEMO</span>
            </div>
        </div>
    );
}
