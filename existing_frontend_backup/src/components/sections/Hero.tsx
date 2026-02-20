import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Shield, ArrowRight, Activity } from 'lucide-react';

export default function Hero() {
    const navigate = useNavigate();

    return (
        <section className="relative overflow-hidden pt-10 pb-20 md:pt-20 md:pb-32">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-accent-neon/10 blur-[100px]" />
                <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-accent-purple/10 blur-[100px]" />
                <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-cyan/10 blur-[120px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-accent-neon/30 bg-accent-neon/10 px-4 py-1.5 text-sm font-medium text-accent-neon shadow-[0_0_15px_rgba(0,255,136,0.2)]">
                        <Shield className="h-4 w-4" />
                        <span>Next-Gen Financial Security</span>
                    </div>

                    <h1 className="mb-6 bg-gradient-to-r from-text-primary via-text-primary to-text-secondary bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-7xl">
                        Detect Fraud with <br />
                        <span className="text-accent-neon drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]">
                            AI Precision
                        </span>
                    </h1>

                    <p className="mx-auto mb-8 max-w-2xl text-lg text-text-secondary md:text-xl">
                        Uncover hidden financial crime networks using advanced graph algorithms
                        and real-time transaction monitoring. Visualized for clarity.
                    </p>

                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                        <Button
                            size="lg"
                            className="w-full sm:w-auto text-base"
                            onClick={() => navigate('/')}
                        >
                            Start Analysis <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full sm:w-auto text-base"
                            onClick={() => navigate('/dashboard')}
                        >
                            View Live Demo <Activity className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </motion.div>

                {/* Floating UI Elements / Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mt-16 sm:mt-24"
                >
                    <div className="relative mx-auto max-w-5xl rounded-xl border border-white/10 bg-bg-card/50 p-2 shadow-2xl backdrop-blur-sm">
                        <div className="aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-lg bg-bg-primary/80 border border-white/5 shadow-inner flex relative">
                            {/* Abstract Graph Visualization for Hero */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-accent-neon/20 to-transparent top-1/3 animate-pulse"></div>
                                <div className="absolute w-[1px] h-full bg-gradient-to-b from-transparent via-accent-purple/20 to-transparent left-1/3 animate-pulse"></div>
                                <div className="grid grid-cols-3 gap-8 opacity-70">
                                    {[...Array(9)].map((_, i) => (
                                        <div key={i} className="h-3 w-3 rounded-full bg-accent-neon shadow-[0_0_10px_#00FF88] animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                                    ))}
                                </div>
                                <div className="absolute text-text-muted text-sm font-mono tracking-widest uppercase opacity-40">
                                    System Active // Monitoring...
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
