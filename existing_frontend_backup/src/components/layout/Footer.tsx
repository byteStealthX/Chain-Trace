import { Share2 } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-bg-secondary py-8">
            <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-text-muted">
                    <Share2 className="h-5 w-5 opacity-50" />
                    <span className="text-sm font-medium">Chase-Trace &copy; {new Date().getFullYear()}</span>
                </div>
                <div className="flex gap-6 text-sm text-text-muted">
                    <a href="#" className="hover:text-accent-neon transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-accent-neon transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-accent-neon transition-colors">Contact Support</a>
                </div>
            </div>
        </footer>
    );
}
