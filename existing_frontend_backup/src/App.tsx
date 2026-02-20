import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import GraphView from './pages/GraphView';
import Reports from './pages/Reports';
import Login from './pages/Login';
import { AuthProvider } from './contexts/AuthProvider';
import AuthGuard from './components/auth/AuthGuard';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<Layout />}>
                        <Route path="/" element={<LandingPage />} />
                        <Route
                            path="/upload"
                            element={
                                <AuthGuard>
                                    <div>Upload Page (Placeholder)</div>
                                </AuthGuard>
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <AuthGuard>
                                    <Dashboard />
                                </AuthGuard>
                            }
                        />
                        <Route
                            path="/graph"
                            element={
                                <AuthGuard>
                                    <GraphView />
                                </AuthGuard>
                            }
                        />
                        <Route
                            path="/reports"
                            element={
                                <AuthGuard>
                                    <Reports />
                                </AuthGuard>
                            }
                        />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
