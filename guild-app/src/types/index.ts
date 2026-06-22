export type UserRole = 'creator' | 'client'

export type SlotTier = 'regular' | 'rush' | 'waitlist'

export type OrderStatus =
  | 'BRIEF_PENDING'
  | 'PENDING_APPROVAL'
  | 'COUNTER_OFFER'
  | 'PAYMENT_PENDING'
  | 'IN_PROGRESS'
  | 'REVISION_REQUESTED'
  | 'FINAL_REVIEW'
  | 'APPROVED'
  | 'COMPLETED'
  | 'DECLINED'
  | 'CANCELLED'
  | 'DISPUTE'

export type PaymentType = 'full' | 'milestone'
export type PaymentStatus = 'pending' | 'paid' | 'released' | 'refunded' | 'failed'
export type DisputeStatus = 'open' | 'under_review' | 'resolved_creator' | 'resolved_client' | 'cancelled'
export type DeliverableType = 'draft' | 'revision' | 'final'

export interface Profile {
  id: string
  email?: string
  full_name: string
  username?: string
  role: UserRole
  avatar_url?: string
  onboarding_completed?: boolean
  tos_accepted_at?: string
  created_at: string
}

export interface CreatorProfile {
  id: string
  user_id: string
  display_name: string
  bio: string
  category: string
  avatar_url: string | null
  portfolio_url?: string
  max_slots: number
  is_verified: boolean
  probation_completed: boolean
  probation_orders_done?: number
  tracker_stages?: string[]
  max_revisions?: number
  min_brief_score?: number
  on_time_rate: number
  repeat_client_rate: number
  brief_accuracy_score: number
  total_completed?: number
  created_at: string
  updated_at: string
}

export interface CreatorPortfolio {
  id: number
  creator_id: string
  title: string
  description: string | null
  image_url: string
  project_url: string | null
  status: 'draft' | 'published'
  display_order: number
  created_at: string
  updated_at: string
}

export interface Slot {
  id: string
  creator_id: string
  tier: SlotTier
  price: number
  is_available: boolean
  month: string
  period_label?: string
  period_start?: string
  period_end?: string
  max_slots?: number
  label?: string
  created_at: string
}

export interface Order {
  id: string
  creator_id: string
  client_id: string
  slot_id: string | null
  slot_config_id?: string | null
  status: OrderStatus
  tracker_stages: string[]
  current_stage_index: number
  revision_count: number
  max_revisions: number
  total_amount: number
  down_payment: number
  down_payment_released: boolean
  agreed_price?: number
  deadline?: string
  auto_release_at?: string
  payment_type?: PaymentType
  creator_notes?: string
  client_notes?: string
  created_at: string
  updated_at: string
}

export interface Brief {
  id: string
  order_id: string
  project_title: string
  description: string
  category: string
  completeness_score: number
  fields: Record<string, string>
  answers?: Record<string, string>
  submitted_at?: string
  created_at: string
}

export interface Deliverable {
  id: string
  order_id: string
  file_url: string
  type?: DeliverableType
  is_final: boolean
  is_watermarked: boolean
  original_url?: string
  public_id?: string
  created_at: string
}

export interface OrderHistory {
  id: string
  order_id: string
  from_status: OrderStatus | null
  to_status: OrderStatus
  notes: string
  created_by: string
  created_at: string
}

export interface CounterOffer {
  id: string
  order_id: string
  proposed_price: number
  proposed_deadline: string
  scope_notes: string
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  expires_at: string
  created_at: string
}

export interface Revision {
  id: string
  order_id: string
  revision_number: number
  feedback: string
  reference_urls: string[]
  requested_at: string
  completed_at?: string
}

export interface Payment {
  id: string
  order_id: string
  type: 'downpayment' | 'settlement' | 'refund'
  amount: number
  net_amount?: number
  commission_amount?: number
  status: PaymentStatus
  midtrans_order_id?: string
  midtrans_transaction_id?: string
  paid_at?: string
  released_at?: string
  created_at: string
}

export interface Dispute {
  id: string
  order_id: string
  filed_by: string
  reason: string
  status: DisputeStatus
  mediator_id?: string
  mediator_notes?: string
  resolved_at?: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  order_id?: string
  type: string
  title: string
  body?: string
  is_read: boolean
  created_at: string
}

export interface CommentWindow {
  id: string
  order_id: string
  opens_at: string
  closes_at: string
  is_active: boolean
}

export interface Comment {
  id: string
  order_id: string
  window_id: string
  author_id: string
  content: string
  created_at: string
}

export interface ReputationBadge {
  id: string
  creator_id: string
  badge_type: string
  earned_at: string
  is_active: boolean
}

export interface ProSubscription {
  id: string
  creator_id: string
  status: 'active' | 'expired' | 'cancelled' | 'pending'
  midtrans_order_id?: string
  started_at: string
  expires_at: string
}

export interface Studio {
  id: string
  owner_id: string
  name: string
  slug: string
  bio?: string
  created_at: string
}

export interface StudioMember {
  id: string
  studio_id: string
  creator_id: string
  role: 'owner' | 'manager' | 'member'
  joined_at: string
}

export interface WaitlistEntry {
  id: string
  slot_config_id: string
  client_id: string
  position: number
  status: 'waiting' | 'notified' | 'confirmed' | 'expired' | 'cancelled'
  notified_at?: string
  expires_at?: string
  created_at: string
}

export interface OrderWithBrief extends Order {
  briefs?: Brief
}

export interface OrderWithCreator extends Order {
  creator_profiles?: { display_name: string }
}

export interface OrderFull extends Order {
  briefs?: Brief
  creator_profiles?: Pick<CreatorProfile, 'user_id' | 'display_name' | 'avatar_url'>
  deliverables?: Deliverable[]
}

export interface CustomForm {
  id: string
  creator_id: string
  category: string
  title: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
  fields?: FormField[]
}

export interface FormField {
  id: string
  form_id: string
  field_key: string
  label: string
  field_type: 'text' | 'textarea' | 'select' | 'multiselect' | 'url' | 'number' | 'file' | 'toggle' | 'date'
  placeholder: string
  hint: string
  options: string[] | null
  is_required: boolean
  weight: number
  display_order: number
  created_at: string
  updated_at: string
}

export interface CustomService {
  id: string
  creator_id: string
  name: string
  description: string
  price_jpy: number
  currency: string
  delivery_days: number
  revision_limit: number
  category: string | null
  is_active: boolean
  is_featured: boolean
  min_experience_required: number
  created_at: string
  updated_at: string
}

export interface CustomPolicy {
  id: string
  creator_id: string
  policy_type: 'communication' | 'ai' | 'revision' | 'refund' | 'nsfw' | 'commercial' | 'other'
  title: string
  content: string
  is_enabled: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface CreatorSettings {
  id: string
  creator_id: string
  allow_discord_contact: boolean
  discord_username: string | null
  allow_twitter_contact: boolean
  twitter_handle: string | null
  allow_email_contact: boolean
  preferred_contact_method: 'inapp' | 'discord' | 'twitter' | 'email'
  ai_policy_enforced: boolean
  ai_training_opt_out: boolean
  tracker_stages: string[]
  show_commission_stats: boolean
  show_waitlist: boolean
  locale: string
  created_at: string
  updated_at: string
}

export interface Translation {
  id: string
  source_text: string
  translated_text: string
  source_lang: string
  target_lang: string
  context: string | null
  created_at: string
}
