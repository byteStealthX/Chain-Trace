export interface Transaction {
    id: string;
    sender_id: string;
    receiver_id: string;
    amount: number;
    currency: string;
    timestamp: string;
    risk_score?: number;
    is_flagged?: boolean;
    description?: string;
}

export interface FraudAlert {
    id: string;
    transaction_id: string;
    alert_type: 'high_risk' | 'suspicious_pattern' | 'rapid_movement' | 'circular_flow';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    created_at: string;
}

export interface GraphNode {
    id: string;
    label: string;
    risk_level: 'safe' | 'low' | 'medium' | 'high' | 'critical';
    transaction_count: number;
    total_volume: number;
}

export interface GraphLink {
    source: string;
    target: string;
    amount: number;
    transaction_id: string;
}

export interface DashboardStats {
    total_transactions: number;
    total_flagged: number;
    total_accounts: number;
    avg_risk_score: number;
}

export interface UploadResult {
    success: boolean;
    rows_parsed: number;
    rows_inserted: number;
    errors: string[];
}
