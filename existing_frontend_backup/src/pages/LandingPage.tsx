import { useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import Hero from '../components/sections/Hero';
import Features from '../components/sections/Features';

export default function LandingPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    return (
        <div ref={containerRef} className="relative min-h-screen">
            {/* Global Grid Background */}
            <motion.div
                style={{ y: backgroundY }}
                className="fixed inset-0 z-0 pointer-events-none"
            >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute inset-0 bg-bg-primary [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,transparent_70%,#0B1117_100%)]"></div>
            </motion.div>

            <main className="relative z-10">
                <Hero />
                <Features />
                {/* Additional sections can be added here */}
            </main>
        </div>
    );
}
