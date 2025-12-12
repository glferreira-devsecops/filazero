/**
 * Application Constants
 * Centralized magic values and configuration
 */

// Ticket statuses
export const TICKET_STATUS = {
    WAITING: 'waiting',
    CALLED: 'called',
    IN_SERVICE: 'in_service',
    COMPLETED: 'completed',
    NO_SHOW: 'no_show',
    PAUSED: 'paused'
};

// Status display labels (Portuguese)
export const STATUS_LABELS = {
    waiting: 'Aguardando',
    called: 'Chamado',
    in_service: 'Em Atendimento',
    completed: 'Concluído',
    no_show: 'Não Compareceu',
    paused: 'Pausado'
};

// Status colors for UI
export const STATUS_COLORS = {
    waiting: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
    called: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    in_service: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
    completed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    no_show: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
    paused: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' }
};

// Ticket priorities
export const PRIORITY = {
    NORMAL: 'normal',
    PRIORITY: 'priority',
    EMERGENCY: 'emergency'
};

// Priority display labels
export const PRIORITY_LABELS = {
    normal: 'Normal',
    priority: 'Prioritário',
    emergency: 'Emergência'
};

// Priority weights for sorting (higher = more urgent)
export const PRIORITY_WEIGHT = {
    emergency: 3,
    priority: 2,
    normal: 1
};

// Priority colors
export const PRIORITY_COLORS = {
    normal: { bg: 'bg-slate-500/20', text: 'text-slate-400' },
    priority: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
    emergency: { bg: 'bg-red-500/20', text: 'text-red-400' }
};

// LocalStorage keys
export const STORAGE_KEYS = {
    MOCK_DB: 'filaZeroMockDb',
    SEEDED: 'filaZeroSeeded',
    SETTINGS: 'filaZeroSettings',
    SOUND_ENABLED: 'filaZeroSoundEnabled',
    NOTIFICATIONS_ENABLED: 'filaZeroNotificationsEnabled'
};

// Toast configuration
export const TOAST_CONFIG = {
    DURATION: 3000,
    MAX_TOASTS: 5,
    POSITION: 'bottom-right'
};

// Rate limiting
export const RATE_LIMIT = {
    MAX_REQUESTS: 5,
    WINDOW_MS: 60000 // 1 minute
};

// Ticket configuration
export const TICKET_CONFIG = {
    MAX_NUMBER: 999,
    ESTIMATED_TIME_PER_PERSON: 5, // minutes
    MAX_PATIENT_NAME_LENGTH: 100,
    MAX_CLINIC_ID_LENGTH: 50
};

// API configuration
export const API_CONFIG = {
    POCKETBASE_URL: import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090',
    HEALTH_CHECK_TIMEOUT: 3000,
    SUBSCRIPTION_DEBOUNCE: 300
};

// Animation durations (ms)
export const ANIMATION = {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    PAGE_TRANSITION: 200
};

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536
};

// Demo mode configuration
export const DEMO_CONFIG = {
    INITIAL_TICKETS: 3,
    MAX_DEMO_TICKETS: 10,
    CLINIC_IDS: ['demo', 'guest']
};
