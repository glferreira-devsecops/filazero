import PocketBase from 'pocketbase';
import { mockDataService } from './mockData';

// Determine PocketBase URL based on environment
const PB_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';

// Create PocketBase instance
const pbInstance = new PocketBase(PB_URL);
pbInstance.autoCancellation(false);

// Track if we're in mock mode
let useMockMode = false;
let mockModeChecked = false;

// Check if PocketBase is available
async function checkPocketBaseAvailability() {
    if (mockModeChecked) return !useMockMode;

    try {
        const response = await fetch(`${PB_URL}/api/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(2000) // 2 second timeout
        });
        useMockMode = !response.ok;
        mockModeChecked = true;

        if (useMockMode) {
            console.warn('⚠️ PocketBase not available, using mock mode');
        } else {
            console.log('✅ PocketBase connected');
        }

        return !useMockMode;
    } catch (error) {
        useMockMode = true;
        mockModeChecked = true;
        console.warn('⚠️ PocketBase not available, using mock mode');
        return false;
    }
}

// Smart wrapper that delegates to mock service when needed
const pb = {
    // Expose original PocketBase instance
    _pb: pbInstance,

    // Auth store passthrough
    authStore: pbInstance.authStore,

    // Collection wrapper
    collection(name) {
        return {
            async getFullList(options) {
                await checkPocketBaseAvailability();
                if (useMockMode) {
                    return mockDataService.getFullList(name, options);
                }
                return pbInstance.collection(name).getFullList(options);
            },

            async create(data) {
                await checkPocketBaseAvailability();
                if (useMockMode) {
                    return mockDataService.create(name, data);
                }
                return pbInstance.collection(name).create(data);
            },

            async update(id, data) {
                await checkPocketBaseAvailability();
                if (useMockMode) {
                    return mockDataService.update(name, id, data);
                }
                return pbInstance.collection(name).update(id, data);
            },

            async delete(id) {
                await checkPocketBaseAvailability();
                if (useMockMode) {
                    return mockDataService.delete(name, id);
                }
                return pbInstance.collection(name).delete(id);
            },

            // Subscribe to real-time updates
            subscribe(topic, callback, options) {
                if (useMockMode) {
                    // Use mock service subscription
                    return mockDataService.subscribe(callback);
                }
                return pbInstance.collection(name).subscribe(topic, callback, options);
            },

            // Unsubscribe
            unsubscribe(topic) {
                if (useMockMode) {
                    return Promise.resolve();
                }
                return pbInstance.collection(name).unsubscribe(topic);
            },

            // Auth methods (passthrough to real PocketBase)
            authWithPassword(email, password) {
                return pbInstance.collection(name).authWithPassword(email, password);
            }
        };
    },

    // Utility methods
    autoCancellation(value) {
        return pbInstance.autoCancellation(value);
    },

    // Mock-specific methods
    async generateDemoTickets(count = 5) {
        await checkPocketBaseAvailability();
        if (useMockMode) {
            mockDataService.generateDemoTickets(count);
            return true;
        }
        // If real backend, could implement demo generation there too
        console.warn('Demo ticket generation only works in mock mode');
        return false;
    },

    clearMockData() {
        if (useMockMode) {
            mockDataService.clearAll();
        }
    },

    isMockMode() {
        return useMockMode;
    }
};

// Initialize check on load
checkPocketBaseAvailability();

export default pb;
