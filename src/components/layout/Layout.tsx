import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
    return (
        <div className="min-h-screen bg-[#060612] text-white">
            <Navbar />
            <main className="mx-auto max-w-7xl px-6 pt-24 pb-16">
                <Outlet />
            </main>
        </div>
    );
}
