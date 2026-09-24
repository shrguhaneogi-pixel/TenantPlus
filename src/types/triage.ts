/**
 * Project TenantPlus — Strict TypeScript Interfaces
 */

export interface BoundingBox {
  box_id: string;
  ymin: number; // 0 - 1000
  xmin: number; // 0 - 1000
  ymax: number; // 0 - 1000
  xmax: number; // 0 - 1000
  label: string;
  clause_text: string;
  is_defect?: boolean;
  severity?: 'FATAL' | 'HIGH' | 'MEDIUM' | 'INFORMATIONAL';
  plain_english_explanation: string;
}

export interface ScaledBoundingBox extends BoundingBox {
  pixelTop: number;
  pixelLeft: number;
  pixelWidth: number;
  pixelHeight: number;
}

export interface StatutoryDefect {
  id: string;
  severity: 'FATAL' | 'HIGH' | 'MEDIUM' | 'INFORMATIONAL';
  title: string;
  statutory_citation: string;
  plain_english_explanation: string;
  defense_strategy_text: string;
  related_box_id?: string;
}

export interface ExtractedNotice {
  notice_type: string;
  jurisdiction_detected: string;
  service_date: string;
  demanded_rent: number;
  late_fee_included?: boolean;
  late_fee_amount?: number;
  landlord_name?: string;
  tenant_name?: string;
  property_address?: string;
  payment_hours_provided?: boolean;
  bounding_boxes: BoundingBox[];
}

export interface TriageResult {
  session_id: string;
  jurisdiction_id: string;
  jurisdiction_name: string;
  court_name: string;
  notice_type: string;
  service_date: string;
  statutory_cure_days: number;
  day_counting_rule: string;
  deadline_date_iso: string;
  deadline_date_formatted: string;
  is_expired: boolean;
  hours_remaining: number;
  days_remaining: number;
  holidays_excluded: string[];
  weekends_excluded_count: number;
  demanded_amount: number;
  base_rent_amount: number;
  improper_fees_amount: number;
  has_fatal_defects: boolean;
  defects: StatutoryDefect[];
  bounding_boxes: BoundingBox[];
  legal_aid_hotline: string;
  legal_aid_org_name: string;
  legal_aid_url: string;
  generated_at: string;
}

export interface ExtractionResponse {
  success: boolean;
  extracted: ExtractedNotice;
  triage: TriageResult;
  image_url?: string;
  image_data_uri?: string;
  error?: string;
}
