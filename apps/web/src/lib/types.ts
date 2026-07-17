export type ControlStatus = 'OPEN' | 'IN_PROGRESS' | 'IMPLEMENTED' | 'NOT_APPLICABLE';
export type RiskStatus = 'OPEN' | 'MITIGATING' | 'MITIGATED' | 'ACCEPTED';

export interface Control {
  id: string;
  code: string;
  title: string;
  description: string;
  guidance: string;
  weight: number;
  status: ControlStatus;
  note: string;
  updatedAt: string;
}

export interface MeasureArea {
  id: string;
  key: string;
  name: string;
  description: string;
  sortOrder: number;
  controls: Control[];
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  likelihood: number;
  impact: number;
  status: RiskStatus;
  owner: string;
  control?: { code: string; title: string } | null;
  updatedAt: string;
}

export interface AreaScore {
  key: string;
  name: string;
  score: number;
  implemented: number;
  inProgress: number;
  open: number;
  notApplicable: number;
  total: number;
}

export interface Gap {
  code: string;
  title: string;
  area: string;
  weight: number;
  status: ControlStatus;
  guidance: string;
}

export interface DashboardSummary {
  generatedAt: string;
  complianceScore: number;
  areas: AreaScore[];
  topGaps: Gap[];
  totalGaps: number;
  openRisks: Array<{
    id: string;
    title: string;
    score: number;
    likelihood: number;
    impact: number;
    status: RiskStatus;
    owner: string;
  }>;
  totalOpenRisks: number;
}

export interface AuditEntry {
  id: string;
  ts: string;
  actorId: string;
  actorName: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: unknown;
  newValue: unknown;
  prevHash: string;
  hash: string;
}

export const CONTROL_STATUS_LABEL: Record<ControlStatus, string> = {
  OPEN: 'Offen',
  IN_PROGRESS: 'In Umsetzung',
  IMPLEMENTED: 'Umgesetzt',
  NOT_APPLICABLE: 'Nicht anwendbar',
};

export const RISK_STATUS_LABEL: Record<RiskStatus, string> = {
  OPEN: 'Offen',
  MITIGATING: 'In Behandlung',
  MITIGATED: 'Behoben',
  ACCEPTED: 'Akzeptiert',
};
