export interface Account {
    id: string;
    account_id: string;
    account_name: string | null;
    account_type: 'individual' | 'business' | 'shell' | null;
    risk_level: 'safe' | 'low' | 'medium' | 'high' | 'critical' | null;
    total_sent: number;
    total_received: number;
    transaction_count: number;
    first_seen: string | null;
    last_seen: string | null;
    created_at: string;
}

export interface Transaction {
    id: string;
    transaction_ref: string | null;
    sender_id: string;
    receiver_id: string;
    receiver_name?: string; // Optional for frontend convenience
    sender_name?: string;   // Optional for frontend convenience
    amount: number;
    currency: string;
    timestamp: string;
    description: string | null;
    risk_score: number;
    is_flagged: boolean;
    flag_reason: string | null;
    created_at: string;
    sender?: Account;
    receiver?: Account;
}

export interface FraudAlert {
    id: string;
    transaction_id?: string;
    alert_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    details?: any;
    is_resolved: boolean;
    resolved_at?: string;
    resolved_by?: string;
    created_at: string;
}

export interface Report {
    id: string;
    created_at: string; // Changed from generated_at to match typical Supabase
    title: string;
    report_type: 'summary' | 'detailed' | 'network_analysis' | 'risk_assessment';
    date_range_start: string | null;
    date_range_end: string | null;
    total_transactions: number;
    total_flagged: number;
    total_accounts: number;
    avg_risk_score: number;
    findings?: any;
}

export interface FraudRing {
    id: string;
    ring_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    accounts: string[];
    transactions: string[];
    total_amount: number;
    cycle_length?: number;
    hop_count?: number;
    window_hours?: number;
    description: string;
    details?: any;
    detected_at: string;  // Explicit column
    created_at: string;   // Generated alias
    is_resolved?: boolean;
    resolved_at?: string;
}

export interface SuspiciousAccount {
    id: string;
    account_id: string;
    suspicion_score: number;
    raw_score: number;
    cycle_score: number;
    fanin_fanout_score: number;
    shell_score: number;
    velocity_score: number;
    risk_label: 'clean' | 'low' | 'moderate' | 'high' | 'critical';
    contributing_rings: string[];
    transaction_count: number;
    total_volume: number;
    scored_at: string;    // Explicit column
    created_at: string;   // Generated alias
    analysis_id?: string;
}
