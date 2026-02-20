import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const links = ["Home", "Features", "Graph Engine", "Dashboard", "Contact"];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const scrollTo = (id: string) => {
    setOpen(false);
    const map: Record<string, string> = {
      Home: "hero",
      Features: "features",
      "Graph Engine": "graph",
      Dashboard: "dashboard",
      Contact: "contact"
    };
    document.getElementById(map[id] || "")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav neon-border border-t-0 border-x-0">
      <div className="mx-auto flex h-16 md:h-20 max-w-[1400px] items-center justify-between px-6">
        <span className="text-xl font-bold tracking-[0.3em] uppercase text-primary neon-glow cursor-pointer" onClick={() => scrollTo("Home")}>
          Chain-Trace
        </span>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) =>
          <button
            key={l}
            onClick={() => scrollTo(l)}
            className="text-sm text-muted-foreground transition-colors duration-300 hover:text-primary">

              {l}
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 top-16 bg-background/95 backdrop-blur-lg flex flex-col items-center justify-center gap-8 md:hidden">

            {links.map((l, i) =>
          <motion.button
            key={l}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => scrollTo(l)}
            className="text-2xl font-medium text-foreground hover:text-primary transition-colors">

                {l}
              </motion.button>
          )}
          </motion.div>
        }
      </AnimatePresence>
    </nav>);

};

export default Navbar;