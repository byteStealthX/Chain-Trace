import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Share2, Lock, Zap, Search, Database, Layout } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
    {
        title: "Graph Visualization",
        description: "Interactive node-link diagrams to visualize money flow and detect muling clusters instantly.",
        icon: Share2,
        color: "text-accent-neon",
    },
    {
        title: "Real-Time Detection",
        description: "Analyze transactions as they happen with low-latency processing and immediate alerts.",
        icon: Zap,
        color: "text-accent-amber", // Using amber for warning/alert feel, or mapped to neon
    },
    {
        title: "Pattern Recognition",
        description: "AI-driven algorithms identify suspicious patterns like structuring and layering.",
        icon: Search,
        color: "text-accent-cyan",
    },
    {
        title: "Secure Data Handling",
        description: "Enterprise-grade encryption and privacy-first architecture for sensitive financial data.",
        icon: Lock,
        color: "text-accent-purple",
    },
    {
        title: "Historical Analysis",
        description: "Deep dive into historical transaction data to trace funds across long timeframes.",
        icon: Database,
        color: "text-accent-rose",
    },
    {
        title: "Detailed Reports",
        description: "Generate comprehensive audit trails and evidence reports for compliance teams.",
        icon: Layout,
        color: "text-text-primary",
    },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function Features() {

    return (
        <section className="py-20 md:py-32 relative">
            <div className="absolute inset-0 z-0 bg-transparent bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent-neon/5 via-transparent to-transparent opacity-50 blur-3xl pointer-events-none" />

            <div className="mx-auto max-w-7xl px-6 relative z-10">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
                        Combat Financial Crime <span className="text-accent-neon">Head-On</span>
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-text-secondary">
                        Equip your compliance team with cutting-edge tools designed to trace and stop illicit funds.
                    </p>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {features.map((feature) => (
                        <motion.div key={feature.title} variants={item}>
                            <Card className="h-full border-white/5 bg-bg-secondary/50 hover:bg-bg-secondary/80 hover:border-accent-neon/30 hover:shadow-[0_0_20px_rgba(0,255,136,0.1)] transition-all duration-300 group">
                                <CardHeader>
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-bg-card border border-white/10 group-hover:border-accent-neon/50 group-hover:shadow-[0_0_10px_rgba(0,255,136,0.2)] transition-all">
                                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                    </div>
                                    <CardTitle className="text-xl group-hover:text-accent-neon transition-colors">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="leading-relaxed text-text-secondary">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
