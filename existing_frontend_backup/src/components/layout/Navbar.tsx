import { NavLink, useNavigate } from 'react-router-dom';
import {
    HiOutlineHome,
    HiOutlineChartBar,
    HiOutlineShare,
    HiOutlineDocumentReport,
    HiOutlineLogout,
} from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';

const links = [
    { to: '/', label: 'Upload', icon: HiOutlineHome },
    { to: '/dashboard', label: 'Dashboard', icon: HiOutlineChartBar },
    { to: '/graph', label: 'Graph', icon: HiOutlineShare },
    { to: '/reports', label: 'Reports', icon: HiOutlineDocumentReport },
];

export default function Navbar() {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0a0a1a]/80 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                {/* Brand */}
                <NavLink to="/" className="flex items-center gap-2 group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 text-white font-bold text-sm shadow-lg shadow-violet-500/25 transition-shadow group-hover:shadow-violet-500/50">
                        CT
                    </div>
                    <span className="text-lg font-semibold text-white tracking-tight">
                        Chain<span className="text-violet-400">Trace</span>
                    </span>
                </NavLink>

                {/* Nav links */}
                <div className="flex items-center gap-6">
                    <ul className="flex items-center gap-1">
                        {links.map(({ to, label, icon: Icon }) => (
                            <li key={to}>
                                <NavLink
                                    to={to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${isActive
                                            ? 'bg-violet-500/15 text-violet-300 shadow-inner'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`
                                    }
                                >
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                    <div className="h-6 w-px bg-white/10" />
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                        <HiOutlineLogout className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </nav>
    );
}
