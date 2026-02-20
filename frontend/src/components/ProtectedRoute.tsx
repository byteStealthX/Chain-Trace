
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * Wraps a route so that unauthenticated users are redirected to /login.
 * Shows a minimal loading state while the session is being checked.
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const [sessionStatus, setSessionStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

    useEffect(() => {
        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSessionStatus(session ? 'authenticated' : 'unauthenticated');
        });

        // Listen for auth state changes (login / logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSessionStatus(session ? 'authenticated' : 'unauthenticated');
        });

        return () => subscription.unsubscribe();
    }, []);

    if (sessionStatus === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-dark">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center text-white shadow-lg shadow-primary/30 animate-pulse">
                        <span className="material-symbols-outlined text-2xl">hub</span>
                    </div>
                    <p className="text-slate-400 text-sm animate-pulse">Authenticating...</p>
                </div>
            </div>
        );
    }

    if (sessionStatus === 'unauthenticated') {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
