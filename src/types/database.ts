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
    id: string; // UUID
    transaction_id?: string; // UUID
    alert_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    details?: any; // JSONB
    is_resolved: boolean;
    resolved_at?: string; // ISO timestamp
    resolved_by?: string;
    created_at: string; // ISO timestamp
}

export interface Report {
    id: string; // UUID
    generated_at: string; // ISO timestamp
    title: string;
    summary: string;
    total_flagged: number;
    avg_risk_score: number;
    details?: any; // JSONB
}

export interface FraudRing {
    id: string;
    ring_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    accounts: string[];
    transactions: string[];
    total_amount: number;
    description: string;
    created_at: string;
    details?: any;
}

export interface SuspiciousAccount {
    id: string;
    account_id: string;
    suspicion_score: number;
    risk_label: 'clean' | 'low' | 'moderate' | 'high' | 'critical';
    transaction_count: number;
    total_volume: number;
    created_at: string;
    analysis_id?: string;
}
