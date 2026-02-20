const Footer = () =>
<footer className="border-t border-primary/10 bg-secondary px-6 py-12">
    <div className="mx-auto grid max-w-[1400px] gap-10 md:grid-cols-3">
      <div>
        <span className="text-xl font-bold tracking-[0.2em] uppercase text-primary neon-glow">CHAIN-TRACE</span>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Graph-based AI fraud detection for modern financial institutions.
        </p>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quick Links</h4>
        <ul className="space-y-2 text-sm">
          {["Features", "Graph Engine", "Dashboard", "Contact"].map((l) =>
        <li key={l}>
              <a href={`#${l.toLowerCase().replace(" ", "-")}`} className="text-muted-foreground transition-colors hover:text-primary">
                {l}
              </a>
            </li>
        )}
        </ul>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Connect</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>Twitter / X</li>
          <li>LinkedIn</li>
          <li>GitHub</li>
        </ul>
      </div>
    </div>

    <div className="mx-auto mt-10 max-w-[1400px] border-t border-primary/5 pt-6 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} Chase-Trace. All rights reserved.
    </div>
  </footer>;


export default Footer;