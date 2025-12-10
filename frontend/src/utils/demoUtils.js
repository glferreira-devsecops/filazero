/**
 * Demo utilities for FilaZero Saúde
 * Provides realistic mock data generation and demo management
 */

// Brazilian first names (common)
const FIRST_NAMES = [
    'Ana', 'Maria', 'João', 'Pedro', 'Lucas', 'Julia', 'Gabriel', 'Beatriz',
    'Matheus', 'Larissa', 'Gustavo', 'Fernanda', 'Rafael', 'Amanda', 'Bruno',
    'Camila', 'Diego', 'Isabela', 'Felipe', 'Letícia', 'Rodrigo', 'Mariana',
    'Thiago', 'Patricia', 'Carlos', 'Sandra', 'Eduardo', 'Vanessa', 'Ricardo',
    'Adriana', 'Marcelo', 'Juliana', 'André', 'Priscila', 'Fabio', 'Renata'
];

// Brazilian last names (common)
const LAST_NAMES = [
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves',
    'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho',
    'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa', 'Rocha',
    'Dias', 'Nascimento', 'Andrade', 'Moreira', 'Nunes', 'Marques', 'Machado'
];

/**
 * Generate a random Brazilian name
 */
export const generateBrazilianName = () => {
    const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    return `${firstName} ${lastName}`;
};

/**
 * Generate a random time within business hours (8:00 - 18:00)
 * with realistic distribution (more patients in morning)
 */
export const generateRealisticTime = (baseDate = new Date()) => {
    const date = new Date(baseDate);

    // Weighted hours: more patients 8-11 and 14-16
    const hourWeights = [
        { hour: 8, weight: 15 },
        { hour: 9, weight: 20 },
        { hour: 10, weight: 18 },
        { hour: 11, weight: 12 },
        { hour: 12, weight: 5 },
        { hour: 13, weight: 5 },
        { hour: 14, weight: 15 },
        { hour: 15, weight: 12 },
        { hour: 16, weight: 8 },
        { hour: 17, weight: 5 }
    ];

    const totalWeight = hourWeights.reduce((sum, h) => sum + h.weight, 0);
    let random = Math.random() * totalWeight;

    let selectedHour = 8;
    for (const { hour, weight } of hourWeights) {
        random -= weight;
        if (random <= 0) {
            selectedHour = hour;
            break;
        }
    }

    date.setHours(selectedHour, Math.floor(Math.random() * 60), 0, 0);
    return date;
};

/**
 * Generate a set of demo tickets with realistic data
 */
export const generateDemoTickets = (clinicId, count = 5) => {
    const tickets = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
        const createdAt = generateRealisticTime(now);
        // Adjust to make earlier tickets have earlier times
        createdAt.setMinutes(createdAt.getMinutes() - (count - i) * 15);

        tickets.push({
            id: `demo_${Date.now()}_${i}`,
            number: i + 1,
            status: 'waiting',
            clinicId,
            patientName: generateBrazilianName(),
            createdAt: createdAt,
            channel: Math.random() > 0.3 ? 'web' : 'qrcode'
        });
    }

    return tickets;
};

/**
 * Pre-seed demo data for first-time visitors
 */
export const preSeedDemoData = (clinicId = 'guest') => {
    const storageKey = 'filaZeroMockDb';
    const seededKey = 'filaZeroSeeded';

    // Only seed once per session
    if (sessionStorage.getItem(seededKey)) {
        return false;
    }

    const existingDb = localStorage.getItem(storageKey);
    const db = existingDb ? JSON.parse(existingDb) : { queues: {} };

    // Only seed if queue is empty
    if (!db.queues[clinicId] || db.queues[clinicId].length === 0) {
        db.queues[clinicId] = generateDemoTickets(clinicId, 3);
        localStorage.setItem(storageKey, JSON.stringify(db));
        sessionStorage.setItem(seededKey, 'true');
        return true;
    }

    return false;
};

/**
 * Reset and reload demo with fresh data
 */
export const reloadDemoData = (clinicId = 'guest', count = 5) => {
    const storageKey = 'filaZeroMockDb';
    const db = { queues: {} };

    db.queues[clinicId] = generateDemoTickets(clinicId, count);
    localStorage.setItem(storageKey, JSON.stringify(db));

    return db.queues[clinicId];
};

/**
 * Check if currently in demo mode
 */
export const isDemoMode = () => {
    if (typeof window === 'undefined') return false;
    return window.location.hostname.includes('vercel.app') ||
        window.location.hostname === 'localhost';
};

/**
 * Format relative time in Portuguese
 */
export const formatRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Agora';
    if (diffMins === 1) return '1 min atrás';
    if (diffMins < 60) return `${diffMins} min atrás`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hora atrás';
    return `${diffHours} horas atrás`;
};
