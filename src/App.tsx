import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';

// ── Lazy-loaded heavy pages (code-split to reduce initial bundle) ─────
const Dashboard = lazy(() => import('./pages/Dashboard'));
const GraphView = lazy(() => import('./pages/GraphView'));
const Reports = lazy(() => import('./pages/Reports'));

function PageLoader() {
    return (
        <div className="flex items-center justify-center py-32">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route element={<Layout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/graph" element={<GraphView />} />
                        <Route path="/reports" element={<Reports />} />
                    </Route>
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
