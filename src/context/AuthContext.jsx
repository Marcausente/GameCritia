import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session with timeout
        const getSession = async () => {
            try {
                const sessionPromise = supabase.auth.getSession();
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Auth timeout')), 3000)
                );

                const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]);
                
                if (error) throw error;
                
                if (session?.user) {
                    setUser(session.user);
                    await fetchUserRole(session.user.id);
                } else {
                    setUser(null);
                    setRole(null);
                }
            } catch (error) {
                console.warn("Auth initialization finished with warning:", error.message);
                setUser(null); // Fallback to guest
            } finally {
                if (loading) setLoading(false);
            }
        };

        getSession();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                setUser(session.user);
                await fetchUserRole(session.user.id);
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserRole = async (userId) => {
        try {
            // Timeout after 2 seconds to avoid blocking the UI
            const queryPromise = supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();
            
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Profile fetch timeout')), 2000)
            );

            const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
            
            if (error) {
                console.warn('Error or timeout fetching role:', error.message);
            } else if (data) {
                setRole(data.role);
            }
        } catch (error) {
            console.error('Error in fetchUserRole:', error);
        }
    };

    const value = {
        user,
        role,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
