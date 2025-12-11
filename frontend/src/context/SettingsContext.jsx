import { createContext, useContext, useEffect, useState } from 'react';
import { secureStorage } from '../utils/security';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();

export function useSettings() {
    return useContext(SettingsContext);
}

export function SettingsProvider({ children }) {
    const { currentUser } = useAuth();
    const clinicId = currentUser?.id;

    // Default settings
    const defaultSettings = {
        clinicName: 'Clínica Demo',
        clinicAddress: '',
        clinicPhone: '',
        openTime: '08:00',
        closeTime: '18:00',
        soundEnabled: true,
        voiceEnabled: true,
        maxWaitTime: 60,
        noShowTimeout: 5,
        autoCallNextDelay: 30,
        requirePatientName: false,
        enableAnonymousTickets: true
    };

    const [settings, setSettings] = useState(defaultSettings);

    // Load settings when clinicId changes
    useEffect(() => {
        if (!clinicId) return;

        const loadSettings = () => {
            const saved = secureStorage.get(`filazero_settings_${clinicId}`);
            if (saved) {
                setSettings(prev => ({ ...prev, ...saved }));
            }
        };

        loadSettings();

        // Listen for storage events (in case settings change in another tab)
        const handleStorageChange = (e) => {
            if (e.key === `filazero_settings_${clinicId}`) {
                loadSettings();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Robust cleanup
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [clinicId]);

    // Helper to update settings
    const updateSettings = (newSettings) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        if (clinicId) {
            secureStorage.set(`filazero_settings_${clinicId}`, updated);
        }
    };

    const value = {
        settings,
        updateSettings
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}
