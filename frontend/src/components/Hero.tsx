import { motion } from "framer-motion";
import ParticleBackground from "./ParticleBackground";
import heroVideo from "@/assets/hero-video.mp4";

const Hero = () => {
  return (
    <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      {/* Video background */}
      <div className="pointer-events-none absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-background/50" />
      </div>

      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" />

      {/* Particle constellation */}
      <ParticleBackground />

      <div className="relative z-10 mx-auto max-w-[1400px] text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-7xl"
        >
          Detect Money Muling
          <br />
          <span className="text-primary neon-glow">Networks Instantly</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
        >
          Leverage graph-based AI analysis to uncover hidden money mule chains, fan-in/fan-out patterns, and suspicious transaction clusters in real time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <button className="gradient-primary rounded-lg px-8 py-3.5 font-semibold text-primary-foreground transition-all duration-300 hover:scale-105 neon-box-glow">
            Launch Graph Engine
          </button>
          <button className="rounded-lg border border-primary/40 px-8 py-3.5 font-semibold text-primary transition-all duration-300 hover:border-primary hover:neon-box-glow">
            View Demo
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
