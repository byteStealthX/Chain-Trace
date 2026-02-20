import { useEffect, useRef } from "react";
import SectionWrapper from "./SectionWrapper";
import { supabase } from "@/lib/supabase";

interface Node { x: number; y: number; vx: number; vy: number; r: number; id: string; isFlagged: boolean; }
interface Edge { a: number; b: number; }

const GraphDemo = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;

    // Data containers
    let nodes: Node[] = [];
    let edges: Edge[] = [];

    const fetchGraphData = async () => {
      const { data: accounts } = await supabase.from('accounts').select('account_id, risk_level').limit(50);
      const { data: txs } = await supabase.from('transactions').select('sender_id, receiver_id').limit(100);

      if (!accounts || !txs) return;

      // Map accounts to nodes
      nodes = accounts.map(acc => ({
        x: Math.random() * canvas.width / 2, // Initial random pos
        y: Math.random() * canvas.height / 2,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: acc.risk_level === 'high' ? 8 : 4,
        id: acc.account_id,
        isFlagged: acc.risk_level === 'high'
      }));

      // Map transactions to edges
      edges = [];
      txs.forEach(tx => {
        const aIndex = nodes.findIndex(n => n.id === tx.sender_id);
        const bIndex = nodes.findIndex(n => n.id === tx.receiver_id);
        if (aIndex !== -1 && bIndex !== -1) {
          edges.push({ a: aIndex, b: bIndex });
        }
      });
    };

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();
    window.addEventListener("resize", resize);

    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;

    // Load data
    fetchGraphData();

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w(), h());

      // Update positions
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 20 || n.x > w() - 20) n.vx *= -1;
        if (n.y < 20 || n.y > h() - 20) n.vy *= -1;
      });

      // Edges
      edges.forEach(({ a, b }) => {
        const na = nodes[a], nb = nodes[b];
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.strokeStyle = "rgba(0,255,136,0.15)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Nodes
      nodes.forEach((n) => {
        const pulse = 0.6 + 0.4 * Math.sin(t * 0.002 + n.x); // simplistic phase
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.isFlagged ? `rgba(239, 68, 68, ${pulse})` : `rgba(6, 220, 249, ${pulse})`;
        ctx.fill();

        // glow
        if (n.isFlagged) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = "rgba(239, 68, 68, 0.5)";
        } else {
          ctx.shadowBlur = 0;
        }
      });
      ctx.shadowBlur = 0; // reset

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <SectionWrapper id="graph">
      <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
        Live <span className="text-primary">Fraud Detection</span> Engine
      </h2>
      <p className="mx-auto mb-10 max-w-xl text-center text-muted-foreground">
        Visualizing real-time transaction flows from Supabase.
      </p>

      <div className="mx-auto max-w-4xl rounded-[20px] bg-secondary p-4 md:p-10 neon-border neon-box-glow">
        <canvas ref={canvasRef} className="w-full rounded-lg" style={{ height: 400 }} />
      </div>
    </SectionWrapper>
  );
};

export default GraphDemo;
const canvas = canvasRef.current;
if (!canvas) return;
const ctx = canvas.getContext("2d")!;
let animId: number;

const resize = () => {
  canvas.width = canvas.offsetWidth * 2;
  canvas.height = canvas.offsetHeight * 2;
  ctx.scale(2, 2);
};
resize();
window.addEventListener("resize", resize);

const w = () => canvas.offsetWidth;
const h = () => canvas.offsetHeight;

const nodes: Node[] = Array.from({ length: 18 }, () => ({
  x: Math.random() * 600,
  y: Math.random() * 350,
  vx: (Math.random() - 0.5) * 0.4,
  vy: (Math.random() - 0.5) * 0.4,
  r: 4 + Math.random() * 4,
  phase: Math.random() * Math.PI * 2,
}));

const edges: Edge[] = [];
for (let i = 0; i < nodes.length; i++) {
  const count = 1 + Math.floor(Math.random() * 2);
  for (let c = 0; c < count; c++) {
    const j = (i + 1 + Math.floor(Math.random() * (nodes.length - 1))) % nodes.length;
    edges.push({ a: i, b: j });
  }
}

const draw = (t: number) => {
  ctx.clearRect(0, 0, w(), h());

  // Update positions
  nodes.forEach((n) => {
    n.x += n.vx;
    n.y += n.vy;
    if (n.x < 20 || n.x > w() - 20) n.vx *= -1;
    if (n.y < 20 || n.y > h() - 20) n.vy *= -1;
  });

  // Edges
  edges.forEach(({ a, b }) => {
    const na = nodes[a], nb = nodes[b];
    ctx.beginPath();
    ctx.moveTo(na.x, na.y);
    ctx.lineTo(nb.x, nb.y);
    ctx.strokeStyle = "rgba(0,255,136,0.12)";
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Nodes
  nodes.forEach((n) => {
    const pulse = 0.6 + 0.4 * Math.sin(t * 0.002 + n.phase);
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,255,136,${pulse * 0.9})`;
    ctx.fill();

    // glow
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r + 6, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(n.x, n.y, n.r, n.x, n.y, n.r + 6);
    g.addColorStop(0, `rgba(0,255,136,${pulse * 0.25})`);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fill();
  });

  animId = requestAnimationFrame(draw);
};

animId = requestAnimationFrame(draw);
return () => {
  cancelAnimationFrame(animId);
  window.removeEventListener("resize", resize);
};
  }, []);

return (
  <SectionWrapper id="graph">
    <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
      Live <span className="text-primary">Fraud Detection</span> Engine
    </h2>
    <p className="mx-auto mb-10 max-w-xl text-center text-muted-foreground">
      Watch suspicious transaction networks emerge in real time.
    </p>

    <div className="mx-auto max-w-4xl rounded-[20px] bg-secondary p-4 md:p-10 neon-border neon-box-glow">
      <canvas ref={canvasRef} className="w-full rounded-lg" style={{ height: 400 }} />
    </div>
  </SectionWrapper>
);
};

export default GraphDemo;
