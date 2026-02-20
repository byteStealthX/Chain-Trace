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
    id: string;
    transaction_id: string;
    alert_type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    details: any;
    is_resolved: boolean;
    created_at: string;
    transaction?: Transaction;
}

export interface Report {
    id: string;
    report_type: string;
    generated_at: string;
    details: any; // JSONB containing stats like total_flagged, avg_risk_score
}
