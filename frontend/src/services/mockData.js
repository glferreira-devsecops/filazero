// Mock data service for demo mode (when PocketBase is not available)
class MockDataService {
    constructor() {
        this.tickets = [];
        this.nextTicketNumber = 1;
        this.listeners = new Set();
        this.initializeMockData();
    }

    initializeMockData() {
        // Load from localStorage if available
        const stored = localStorage.getItem('filazero_mock_tickets');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.tickets = data.tickets || [];
                this.nextTicketNumber = data.nextTicketNumber || 1;
            } catch (e) {
                console.warn('Failed to load mock data from localStorage');
            }
        }
    }

    persist() {
        localStorage.setItem('filazero_mock_tickets', JSON.stringify({
            tickets: this.tickets,
            nextTicketNumber: this.nextTicketNumber
        }));
        this.notifyListeners();
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback(this.tickets));
    }

    subscribe(callback) {
        this.listeners.add(callback);
        // Immediately call with current data
        callback(this.tickets);

        return () => {
            this.listeners.delete(callback);
        };
    }

    async getFullList(collection, options = {}) {
        if (collection !== 'tickets') return [];

        let result = [...this.tickets];

        // Apply sorting
        if (options.sort) {
            const [field, direction] = options.sort.split(',');
            result.sort((a, b) => {
                const aVal = a[field];
                const bVal = b[field];
                const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                return direction === '-' ? -comparison : comparison;
            });
        }

        // Apply filter
        if (options.filter) {
            // Simple filter parsing for common cases
            const filterMatch = options.filter.match(/(\w+)\s*=\s*['"]([^'"]+)['"]/);
            if (filterMatch) {
                const [, field, value] = filterMatch;
                result = result.filter(ticket => ticket[field] === value);
            }
        }

        return result;
    }

    async create(collection, data) {
        if (collection !== 'tickets') return null;

        const ticket = {
            id: `mock_${Date.now()}_${Math.random()}`,
            number: data.number || this.nextTicketNumber++,
            status: data.status || 'waiting',
            clinicId: data.clinicId || 'demo',
            patientName: data.patientName || '',
            channel: data.channel || 'Geral',
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            ...data
        };

        this.tickets.push(ticket);
        this.persist();

        return ticket;
    }

    async update(collection, id, data) {
        if (collection !== 'tickets') return null;

        const index = this.tickets.findIndex(t => t.id === id);
        if (index === -1) return null;

        this.tickets[index] = {
            ...this.tickets[index],
            ...data,
            updated: new Date().toISOString()
        };

        this.persist();
        return this.tickets[index];
    }

    async delete(collection, id) {
        if (collection !== 'tickets') return false;

        const index = this.tickets.findIndex(t => t.id === id);
        if (index === -1) return false;

        this.tickets.splice(index, 1);
        this.persist();
        return true;
    }

    // Generate demo tickets
    generateDemoTickets(count = 5) {
        const channels = ['Geral', 'Prioritário', 'Consulta', 'Exame'];
        const statuses = ['waiting', 'waiting', 'waiting', 'called', 'in_service'];
        const names = ['Maria Silva', 'João Santos', 'Ana Costa', 'Pedro Oliveira', 'Carla Souza'];

        for (let i = 0; i < count; i++) {
            this.create('tickets', {
                number: this.nextTicketNumber,
                status: statuses[i % statuses.length],
                channel: channels[i % channels.length],
                patientName: names[i % names.length],
                clinicId: 'demo'
            });
        }
    }

    // Clear all data
    clearAll() {
        this.tickets = [];
        this.nextTicketNumber = 1;
        this.persist();
    }
}

export const mockDataService = new MockDataService();
