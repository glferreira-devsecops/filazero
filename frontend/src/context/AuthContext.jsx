import { createContext, useContext, useEffect, useState } from 'react';
import pb from '../services/pocketbase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(pb.authStore.model);

    useEffect(() => {
        // Listen for auth state changes
        const unsubscribe = pb.authStore.onChange((token, model) => {
            setCurrentUser(model);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    // Guest login (for development/patients)
    async function signInAsGuest() {
        setCurrentUser({ id: 'guest', name: 'Guest User' });
        return { id: 'guest' };
    }

    // Real Login
    async function login(email, password) {
        return await pb.collection('users').authWithPassword(email, password);
    }

    function logout() {
        pb.authStore.clear();
        // State update happens via onChange listener automatically,
        // but explicit set ensures UI updates immediately if listener is async or lagged
        setCurrentUser(null);
    }

    const value = {
        currentUser,
        signInAsGuest,
        login,
        logout,
        pb
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
