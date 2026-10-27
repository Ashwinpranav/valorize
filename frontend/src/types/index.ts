export type UserRole = 'supplier' | 'buyer' | 'partner' | 'admin';

export interface Company {
  id: number;
  name: string;
  industry?: string;
  registration_no?: string;
  city: string;
  state: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  verified: boolean;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  company?: Company;
  created_at: string;
}

export interface MaterialCategory {
  id: number;
  name: string;
  code: string;
  description?: string;
  standard_unit: string;
  co2_factor_per_kg: number;
  energy_saved_percent?: number;
}

export interface ListingImage {
  id: number;
  image_url: string;
  is_primary: boolean;
}

export interface WasteListing {
  id: number;
  company_id: number;
  company_name?: string;
  category_id: number;
  category_name?: string;
  title: string;
  description?: string;
  quantity: number;
  unit: string;
  condition: string;
  location: string;
  latitude?: number;
  longitude?: number;
  seller_price?: number;
  ai_estimated_price_min?: number;
  ai_estimated_price_max?: number;
  currency: string;
  status: string; // 'Draft' | 'Available' | 'Pending Review' | 'Reserved' | 'Completed' | 'Archived'
  ai_prediction_status: string;
  images: ListingImage[];
  created_at: string;
  updated_at: string;
}

export interface BuyerRequirement {
  id: number;
  company_id: number;
  company_name?: string;
  category_id: number;
  category_name?: string;
  title: string;
  min_quantity: number;
  max_quantity: number;
  unit: string;
  accepted_condition: string;
  preferred_location?: string;
  max_distance_km: number;
  max_budget_per_unit?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MatchFactorScore {
  score: number;
  detail: string;
}

export interface BuyerMatch {
  id: number;
  requirement_id: number;
  listing_id: number;
  overall_score: number;
  material_score: number;
  quantity_score: number;
  proximity_score: number;
  condition_score: number;
  explanation: string;
  is_viewed: boolean;
  listing?: Partial<WasteListing>;
  requirement?: Partial<BuyerRequirement>;
  created_at: string;
}

export interface EnquiryMessage {
  id: number;
  enquiry_id: number;
  sender_user_id: number;
  sender_user_name?: string;
  sender_company_id: number;
  sender_company_name?: string;
  message_text: string;
  attachments?: string;
  created_at: string;
}

export interface Offer {
  id: number;
  enquiry_id: number;
  sender_company_id: number;
  sender_company_name?: string;
  offered_price_per_unit: number;
  offered_quantity: number;
  total_amount: number;
  currency: string;
  notes?: string;
  status: string; // 'Pending' | 'Accepted' | 'Rejected' | 'Countered'
  created_at: string;
}

export interface Enquiry {
  id: number;
  listing_id: number;
  listing_title?: string;
  buyer_company_id: number;
  buyer_company_name?: string;
  supplier_company_id: number;
  supplier_company_name?: string;
  initial_quantity: number;
  status: string; // 'Open' | 'In Negotiation' | 'Offer Made' | 'Accepted' | 'Declined'
  messages: EnquiryMessage[];
  offers: Offer[];
  created_at: string;
  updated_at: string;
}

export interface TransactionEvent {
  id: number;
  transaction_id: number;
  event_type: string;
  description: string;
  actor_user_id?: number;
  actor_name?: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  listing_id: number;
  listing_title?: string;
  offer_id?: number;
  buyer_company_id: number;
  buyer_company_name?: string;
  supplier_company_id: number;
  supplier_company_name?: string;
  agreed_quantity: number;
  agreed_price_per_unit: number;
  total_amount: number;
  currency: string;
  status: string; // 'Agreed' | 'In Transit' | 'Delivered' | 'Completed' | 'Cancelled'
  events: TransactionEvent[];
  created_at: string;
  updated_at: string;
}

export interface MaterialImpactBreakdown {
  category_name: string;
  total_quantity_kg: number;
  total_transactions: number;
  co2_saved_kg: number;
  landfill_diverted_kg: number;
  estimated_financial_value: number;
}

export interface PlatformImpactReport {
  total_completed_transactions: number;
  total_material_exchanged_kg: number;
  total_material_exchanged_mt: number;
  total_transaction_value: number;
  total_co2_avoided_kg: number;
  total_landfill_diverted_kg: number;
  currency: string;
  materials_breakdown: MaterialImpactBreakdown[];
  methodology_notice: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  notification_type: string;
  created_at: string;
}

export interface AuditLogItem {
  id: number;
  actor_user_id?: number;
  actor_name?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: string;
  created_at: string;
}
