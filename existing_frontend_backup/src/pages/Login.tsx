import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { HiOutlineMail } from 'react-icons/hi';

export default function Login() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { signIn } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await signIn(email);
        if (error) {
            setMessage('Error: ' + error.message);
        } else {
            setMessage('Check your email for the magic link!');
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold gradient-text">Chain-Trace</h2>
                    <p className="mt-2 text-sm text-gray-400">Sign in to access the dashboard</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email address</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <HiOutlineMail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-violet-500 sm:text-sm"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {message && (
                        <div className={`text-sm text-center ${message.startsWith('Error') ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {message}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Sending link...' : 'Sign in with Magic Link'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
