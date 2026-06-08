export type UserRole = 'creator' | 'client'

export type SlotTier = 'regular' | 'rush' | 'waitlist'

export type OrderStatus =
  | 'BRIEF_PENDING'
  | 'PENDING_APPROVAL'
  | 'COUNTER_OFFER'
  | 'IN_PROGRESS'
  | 'FINAL_REVIEW'
  | 'APPROVED'
  | 'DECLINED'
  | 'DISPUTED'
  | 'CANCELLED'

export interface CreatorProfile {
  id: string
  user_id: string
  display_name: string
  bio: string
  category: string
  avatar_url: string | null
  max_slots: number
  is_verified: boolean
  on_time_rate: number
  repeat_client_rate: number
  brief_accuracy_score: number
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
  created_at: string
}

export interface Order {
  id: string
  creator_id: string
  client_id: string
  slot_id: string | null
  status: OrderStatus
  tracker_stages: string[]
  current_stage_index: number
  revision_count: number
  max_revisions: number
  total_amount: number
  down_payment: number
  down_payment_released: boolean
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
  created_at: string
}

export interface Deliverable {
  id: string
  order_id: string
  file_url: string
  is_final: boolean
  is_watermarked: boolean
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

// ============================================
// Extended types untuk data yang di-join dari Supabase
// ============================================

/** Order dengan relasi brief (single) — dipakai di dashboard kreator */
export interface OrderWithBrief extends Order {
  briefs?: Brief
}

/** Order dengan relasi nama kreator — dipakai di dashboard klien */
export interface OrderWithCreator extends Order {
  creator_profiles?: { display_name: string }
}

/** Order lengkap dengan semua relasi — dipakai di order tracker */
export interface OrderFull extends Order {
  briefs?: Brief
  creator_profiles?: Pick<CreatorProfile, 'user_id' | 'display_name' | 'avatar_url'>
  deliverables?: Deliverable[]
}
