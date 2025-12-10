import pb from './pocketbase';

// Flag to use mock storage when PocketBase is not available
let USE_MOCK = false;

// Auto-enable mock mode on Vercel deployments (no PocketBase backend)
if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    console.log('🎭 Demo mode: Vercel deployment detected, using mock storage');
    USE_MOCK = true;
}

// Check PocketBase availability safely (only if not already in mock mode)
if (!USE_MOCK) {
    (async () => {
        try {
            const url = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            const response = await fetch(`${url}/api/health`, {
                method: 'GET',
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('PocketBase not healthy');
            console.log('✅ PocketBase connected at', url);
        } catch (e) {
            console.warn('⚠️ PocketBase not available, using mock mode');
            USE_MOCK = true;
        }
    })();
}


const getMockDb = () => JSON.parse(localStorage.getItem('filaZeroMockDb') || '{"queues": {}}');
const saveMockDb = (data) => localStorage.setItem('filaZeroMockDb', JSON.stringify(data));

// Store active subscriptions for cleanup
const activeSubscriptions = new Map();

/**
 * Normalizes a ticket object to ensure consistent Date handling
 */
const normalizeTicket = (ticket) => {
    if (!ticket) return null;
    const t = { ...ticket };

    // PocketBase returns ISO strings, convert to Date
    ['created', 'updated', 'calledAt', 'startedAt', 'finishedAt'].forEach(field => {
        if (t[field] && typeof t[field] === 'string') {
            t[field] = new Date(t[field]);
        }
    });

    if (t.created && !t.createdAt) {
        t.createdAt = t.created;
    }

    return t;
};

/**
 * Creates a new ticket for a specific clinic.
 */
export const createTicket = async (clinicId, patientName = '') => {
    if (!clinicId) throw new Error("Clinic ID is required");

    // Force mock for demo/guest (Hackathon mode)
    if (clinicId === 'guest' || clinicId === 'demo') {
        USE_MOCK = true;
    }

    if (USE_MOCK) {
        const dbStr = getMockDb();
        if (!dbStr.queues[clinicId]) dbStr.queues[clinicId] = [];

        const now = new Date();
        const ticket = {
            id: 'mock_' + Date.now(),
            number: dbStr.queues[clinicId].length + 1, // Mock calculates number
            status: 'waiting',
            clinicId,
            patientName,
            createdAt: now,
            channel: 'web'
        };

        dbStr.queues[clinicId].push(ticket);
        saveMockDb(dbStr);
        await new Promise(r => setTimeout(r, 300));
        return ticket;
    }

    try {
        // Create ticket without number (backend hook handles it)
        const ticket = await pb.collection('tickets').create({
            status: 'waiting',
            clinicId,
            patientName,
            channel: 'web'
        });

        return normalizeTicket(ticket);
    } catch (e) {
        console.error('PocketBase error, falling back to mock:', e);
        USE_MOCK = true;
        return createTicket(clinicId, patientName);
    }
};

/**
 * Subscribes to a single ticket updates.
 */
export const subscribeToTicket = (clinicId, ticketId, callback) => {
    if (clinicId === 'guest' || clinicId === 'demo') {
        USE_MOCK = true;
    }

    if (USE_MOCK) {
        const interval = setInterval(() => {
            const dbStr = getMockDb();
            const ticket = dbStr.queues[clinicId]?.find(t => t.id === ticketId);
            if (ticket) {
                callback(normalizeTicket(ticket));
            }
        }, 1000);
        return () => clearInterval(interval);
    }

    // Subscribe to real-time updates
    pb.collection('tickets').subscribe(ticketId, (e) => {
        if (e.action === 'update' || e.action === 'create') {
            callback(normalizeTicket(e.record));
        } else if (e.action === 'delete') {
            callback(null);
        }
    }).catch(e => {
        console.error('Subscription error:', e);
        USE_MOCK = true;
    });

    // Initial fetch
    pb.collection('tickets').getOne(ticketId)
        .then(ticket => callback(normalizeTicket(ticket)))
        .catch(() => callback(null));

    return () => {
        pb.collection('tickets').unsubscribe(ticketId);
    };
};

/**
 * Calculates how many people are ahead in the queue.
 */
export const getQueuePosition = async (clinicId, ticketNumber) => {
    if (clinicId === 'guest' || clinicId === 'demo') {
        USE_MOCK = true;
    }

    if (USE_MOCK) {
        const dbStr = getMockDb();
        const tickets = dbStr.queues[clinicId] || [];
        return tickets.filter(t => t.status === 'waiting' && t.number < ticketNumber).length;
    }

    try {
        const result = await pb.collection('tickets').getList(1, 1000, {
            filter: `clinicId = "${clinicId}" && status = "waiting" && number < ${ticketNumber}`
        });
        return result.totalItems;
    } catch (e) {
        console.error('Queue position error:', e);
        return 0;
    }
};

/**
 * Subscribes to the entire queue for a clinic (for Reception/TV).
 */
export const subscribeToQueue = (clinicId, callback) => {
    const subscriptionKey = `queue_${clinicId}`;

    if (clinicId === 'guest' || clinicId === 'demo') {
        USE_MOCK = true;
    }

    if (USE_MOCK) {
        const interval = setInterval(() => {
            const dbStr = getMockDb();
            const tickets = dbStr.queues[clinicId] || [];
            callback(tickets.map(normalizeTicket));
        }, 1000);
        activeSubscriptions.set(subscriptionKey, interval);

        // Initial data
        const dbStr = getMockDb();
        callback((dbStr.queues[clinicId] || []).map(normalizeTicket));

        return () => {
            clearInterval(interval);
            activeSubscriptions.delete(subscriptionKey);
        };
    }

    // Subscribe to all ticket changes
    pb.collection('tickets').subscribe('*', (e) => {
        if (e.record.clinicId === clinicId) {
            // Refetch entire queue on any change
            fetchQueue();
        }
    }).catch(e => {
        console.error('Queue subscription error:', e);
        USE_MOCK = true;
    });

    const fetchQueue = async () => {
        try {
            const result = await pb.collection('tickets').getList(1, 100, {
                filter: `clinicId = "${clinicId}" && (status = "waiting" || status = "called" || status = "in_service")`,
                sort: 'created'
            });
            callback(result.items.map(normalizeTicket));
        } catch (e) {
            console.error('Queue fetch error:', e);
            // Fallback to mock if fetch fails (e.g. auth error) and clinic is demo-like
            if (!USE_MOCK) {
                console.warn("Switching to mock mode due to fetch error");
                USE_MOCK = true;
                // We can't easily "retry" this subscription closure, but subsequent calls will use mock.
                // For now, let's try to return mock data immediately if we have it?
                const dbStr = getMockDb();
                callback((dbStr.queues[clinicId] || []).map(normalizeTicket));
            } else {
                callback([]);
            }
        }
    };

    // Initial fetch
    fetchQueue();

    return () => {
        pb.collection('tickets').unsubscribe('*');
    };
};

/**
 * Updates a ticket's status.
 */
export const updateTicketStatus = async (clinicId, ticketId, status) => {
    if (clinicId === 'guest' || clinicId === 'demo') {
        USE_MOCK = true;
    }

    if (USE_MOCK) {
        const dbStr = getMockDb();
        if (!dbStr.queues[clinicId]) return;

        const ticketIdx = dbStr.queues[clinicId].findIndex(t => t.id === ticketId);
        if (ticketIdx > -1) {
            dbStr.queues[clinicId][ticketIdx].status = status;
            const now = new Date().toISOString();

            if (status === 'called') dbStr.queues[clinicId][ticketIdx].calledAt = now;
            if (status === 'in_service') dbStr.queues[clinicId][ticketIdx].startedAt = now;
            if (status === 'done') dbStr.queues[clinicId][ticketIdx].finishedAt = now;

            saveMockDb(dbStr);
        }
        return;
    }

    try {
        const updateData = { status };

        if (status === 'called') updateData.calledAt = new Date().toISOString();
        if (status === 'in_service') updateData.startedAt = new Date().toISOString();
        if (status === 'done') updateData.finishedAt = new Date().toISOString();

        await pb.collection('tickets').update(ticketId, updateData);
    } catch (e) {
        console.error('Update status error:', e);
        USE_MOCK = true;
        return updateTicketStatus(clinicId, ticketId, status);
    }
};

/**
 * Clear all mock data (for testing)
 */
export const clearMockData = () => {
    localStorage.removeItem('filaZeroMockDb');
};
