import PocketBase from 'pocketbase';

// PocketBase instance - uses env var or defaults to local
const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
const pb = new PocketBase(POCKETBASE_URL);

// Disable auto-cancellation for real-time subscriptions
pb.autoCancellation(false);

export default pb;
