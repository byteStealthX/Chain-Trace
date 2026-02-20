import SectionWrapper from "./SectionWrapper";

const rows = [
  { id: "ACC-7291", txn: 142, risk: 92, cluster: "CL-09", status: "Flagged" },
  { id: "ACC-3844", txn: 87, risk: 78, cluster: "CL-09", status: "Under Review" },
  { id: "ACC-1056", txn: 203, risk: 65, cluster: "CL-12", status: "Under Review" },
  { id: "ACC-5510", txn: 34, risk: 41, cluster: "CL-03", status: "Monitoring" },
  { id: "ACC-9023", txn: 12, risk: 15, cluster: "CL-01", status: "Clear" },
];

const riskColor = (r: number) =>
  r >= 75 ? "text-destructive" : r >= 40 ? "text-warning" : "text-muted-foreground";

const riskGlow = (r: number) =>
  r >= 75 ? "drop-shadow(0 0 4px hsl(0 80% 65% / 0.6))" : "";

const DashboardPreview = () => (
  <SectionWrapper id="dashboard">
    <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
      Security <span className="text-primary">Console</span>
    </h2>
    <p className="mx-auto mb-10 max-w-xl text-center text-muted-foreground">
      Monitor flagged accounts and risk scores across detected clusters.
    </p>

    <div className="mx-auto max-w-5xl overflow-x-auto rounded-[16px] bg-card neon-border">
      <table className="w-full min-w-[600px] text-sm">
        <thead>
          <tr className="border-b border-primary/10 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-6 py-4">Account ID</th>
            <th className="px-6 py-4">Transactions</th>
            <th className="px-6 py-4">Risk Score</th>
            <th className="px-6 py-4">Cluster ID</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-primary/5 transition-colors duration-200 hover:bg-secondary/60">
              <td className="px-6 py-4 font-mono">{r.id}</td>
              <td className="px-6 py-4">{r.txn}</td>
              <td className={`px-6 py-4 font-bold ${riskColor(r.risk)}`} style={{ filter: riskGlow(r.risk) }}>
                {r.risk}
              </td>
              <td className="px-6 py-4 font-mono text-muted-foreground">{r.cluster}</td>
              <td className="px-6 py-4">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </SectionWrapper>
);

export default DashboardPreview;
