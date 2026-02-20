import { motion } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import { Network, GitFork, CircleDot, Activity } from "lucide-react";

const items = [
  { icon: Network, title: "Multi-hop Network Detection", desc: "Trace money flows across multiple intermediary accounts to reveal deeply nested mule chains." },
  { icon: GitFork, title: "Fan-in / Fan-out Analysis", desc: "Identify convergent and divergent transaction patterns that signal coordinated laundering." },
  { icon: CircleDot, title: "Suspicious Cluster Identification", desc: "Automatically group high-risk accounts using community detection algorithms." },
  { icon: Activity, title: "Real-time Graph Visualization", desc: "Watch fraud networks materialize live with interactive graph rendering." },
];

const Features = () => (
  <SectionWrapper id="features">
    <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
      Powerful <span className="text-primary">Detection</span> Capabilities
    </h2>
    <p className="mx-auto mb-14 max-w-xl text-center text-muted-foreground">
      Purpose-built tools to dismantle money muling networks at every layer.
    </p>

    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((f, i) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="group rounded-[16px] bg-card p-8 neon-border transition-all duration-300 hover:neon-border-hover hover:neon-box-glow hover:-translate-y-1"
        >
          <f.icon className="mb-5 h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
          <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
        </motion.div>
      ))}
    </div>
  </SectionWrapper>
);

export default Features;
