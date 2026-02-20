import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Home, BarChart2, Share2, FileText, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

const navLinks = [
    { to: '/', label: 'Upload', icon: Home },
    { to: '/dashboard', label: 'Dashboard', icon: BarChart2 },
    { to: '/graph', label: 'Graph', icon: Share2 },
    { to: '/reports', label: 'Reports', icon: FileText },
];

export default function Header() {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-bg-primary/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                {/* Brand */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-accent-neon/10 text-accent-neon shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-all group-hover:shadow-[0_0_25px_rgba(0,255,136,0.5)]">
                        <Share2 className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-text-primary">
                        Chase<span className="text-accent-neon">Trace</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {navLinks.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) => cn(
                                "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-accent-neon/10 text-accent-neon shadow-[inset_0_0_10px_rgba(0,255,136,0.1)]"
                                    : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <div className="h-6 w-px bg-white/10" />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSignOut}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-text-secondary hover:text-text-primary"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-b border-white/5 bg-bg-secondary p-4">
                    <nav className="flex flex-col gap-2">
                        {navLinks.map(({ to, label, icon: Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                onClick={() => setIsMenuOpen(false)}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 rounded-md px-4 py-3 text-base font-medium transition-colors",
                                    isActive
                                        ? "bg-accent-neon/10 text-accent-neon"
                                        : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                {label}
                            </NavLink>
                        ))}
                        <div className="my-2 h-px bg-white/10" />
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => {
                                handleSignOut();
                                setIsMenuOpen(false);
                            }}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </nav>
                </div>
            )}
        </header>
    );
}
