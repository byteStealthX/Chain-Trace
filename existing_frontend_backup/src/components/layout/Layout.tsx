import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
    return (
        <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col font-sans selection:bg-accent-neon selection:text-bg-primary">
            <Header />
            <main className="flex-1 w-full mx-auto max-w-7xl px-6 pt-24 pb-16">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
