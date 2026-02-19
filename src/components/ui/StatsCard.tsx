import React, { type ReactNode } from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: ReactNode;
    trend?: { value: number; positive: boolean };
    accent?: string;
}

function StatsCardComponent({
    title,
    value,
    subtitle,
    icon,
    trend,
    accent = 'violet',
}: StatsCardProps) {
    const accentMap: Record<string, string> = {
        violet: 'from-violet-500/20 to-violet-600/5 border-violet-500/20 shadow-violet-500/5',
        cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 shadow-cyan-500/5',
        amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20 shadow-amber-500/5',
        rose: 'from-rose-500/20 to-rose-600/5 border-rose-500/20 shadow-rose-500/5',
    };

    return (
        <div
            className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${accentMap[accent] ?? accentMap.violet}`}
        >
            {/* Background glow */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5 blur-2xl transition-transform duration-500 group-hover:scale-150" />

            <div className="relative flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-400">{title}</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
                    {subtitle && (
                        <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
                    )}
                    {trend && (
                        <p
                            className={`mt-2 text-xs font-medium ${trend.positive ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                        >
                            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
                        </p>
                    )}
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-xl text-gray-300">
                    {icon}
                </div>
            </div>
        </div>
    );
}

// React.memo to prevent unnecessary re-renders when data hasn't changed
const StatsCard = React.memo(StatsCardComponent);
export default StatsCard;
