export type ReportMode = 'periodic' | 'continuous';
export type SegmentType = 'none' | 'primary' | 'secondary';
export type SuccessRateStatus = 'value' | 'no_data';

export interface Report {
id: string;
title: string;
mode: ReportMode;
periodStart: string;
periodEnd: string | null;
createdAt: string;
updatedAt: string;
}

export interface Country {
id: string;
name: string;
code?: string;
sortOrder: number;
}

export interface PaymentMethod {
id: string;
name: string;
sortOrder: number;
}

export interface Provider {
id: string;
name: string;
externalId?: string | null;
sortOrder: number;
}

export interface Subagent {
id: string;
name: string;
externalId: string | null;
sortOrder: number;
}

export interface ReportGroup {
id: string;
reportId: string;
countryId: string;
paymentMethodId: string;
sortOrder: number;
notes?: string;
}

export interface ReportProvider {
id: string;
groupId: string;
providerId: string;
subagentId: string;
segmentType: SegmentType;
sortOrder: number;
withdrawalEnabled: boolean;
}

export interface ProviderTemplate {
id: string;
countryId: string;
paymentMethodId: string;
providerId: string;
subagentId: string;
segmentType: SegmentType;
depositMin: number | null;
depositMax: number | null;
withdrawalMin: number | null;
withdrawalMax: number | null;
successRateDefault: number | null;
withdrawalEnabled: boolean;
notes: string;
updatedAt: string;
}

export interface DailyEntry {
id: string;
reportProviderId: string;
date: string;
successRate: number | null;
successRateStatus: SuccessRateStatus;
depositMin: number | null;
depositMax: number | null;
withdrawalMin: number | null;
withdrawalMax: number | null;
updatedAt: string;
}