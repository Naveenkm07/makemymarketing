// Database type definitions for Supabase
// Auto-generated types based on the database schema

export type UserRole = 'advertiser' | 'owner' | 'admin';
export type CampaignStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type BookingStatus = 'pending' | 'booked' | 'running' | 'finished' | 'cancelled';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed';

export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  role: UserRole;
  is_verified: boolean;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Screen {
  id: string;
  owner_id: string;
  name: string;
  location: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  type: string;
  price_per_day: number;
  availability: boolean;
  specs: Record<string, any> | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  budget: number;
  status: CampaignStatus;
  target_locations: string[] | null;
  created_at: string;
  updated_at: string;
  moderation_status: 'pending' | 'approved' | 'rejected';
}

export interface Booking {
  id: string;
  campaign_id: string;
  screen_id: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  status: PaymentStatus;
  payment_method: string | null;
  transaction_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlaybackLog {
  id: string;
  booking_id: string;
  screen_id: string;
  played_at: string;
  duration_played: number | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface Payout {
  id: string;
  owner_id: string;
  amount: number;
  commission: number;
  net_amount: number;
  status: PayoutStatus;
  period_start: string | null;
  period_end: string | null;
  provider_ref: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OwnerBankAccount {
  id: string;
  owner_id: string;
  bank_name: string;
  account_last4: string;
  ifsc: string;
  upi_id: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
}

export interface Setting {
  key: string;
  value: Record<string, any>;
  updated_at: string;
  updated_by: string | null;
}

export interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  is_internal: boolean;
  created_at: string;
}

// Insert types (for creating new records)
export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
export type ScreenInsert = Omit<Screen, 'id' | 'created_at' | 'updated_at'>;
export type CampaignInsert = Omit<Campaign, 'id' | 'created_at' | 'updated_at'>;
export type BookingInsert = Omit<Booking, 'id' | 'created_at' | 'updated_at'>;
export type PaymentInsert = Omit<Payment, 'id' | 'created_at' | 'updated_at'>;
export type PlaybackLogInsert = Omit<PlaybackLog, 'id' | 'created_at'>;
export type PayoutInsert = Omit<Payout, 'id' | 'created_at' | 'updated_at'>;
export type OwnerBankAccountInsert = Omit<OwnerBankAccount, 'id' | 'created_at' | 'updated_at'>;
export type AdminAuditLogInsert = Omit<AdminAuditLog, 'id' | 'created_at'>;
export type SettingInsert = Omit<Setting, 'updated_at'>;
export type TicketInsert = Omit<Ticket, 'id' | 'created_at' | 'updated_at'>;
export type TicketMessageInsert = Omit<TicketMessage, 'id' | 'created_at'>;

// Update types (for updating existing records)
// Update types (for updating existing records)
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>>;
export type ScreenUpdate = Partial<Omit<Screen, 'id' | 'created_at'>>;
export type CampaignUpdate = Partial<Omit<Campaign, 'id' | 'created_at'>>;
export type BookingUpdate = Partial<Omit<Booking, 'id' | 'created_at'>>;
export type PaymentUpdate = Partial<Omit<Payment, 'id' | 'created_at'>>;
export type PayoutUpdate = Partial<Omit<Payout, 'id' | 'created_at'>>;
export type OwnerBankAccountUpdate = Partial<Omit<OwnerBankAccount, 'id' | 'created_at'>>;
export type AdminAuditLogUpdate = never; // Audit logs are immutable
export type SettingUpdate = Partial<Omit<Setting, 'updated_at'>>;
export type TicketUpdate = Partial<Omit<Ticket, 'id' | 'created_at'>>;
export type TicketMessageUpdate = never; // Messages are immutable

// Database interface for type-safe queries
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      screens: {
        Row: Screen;
        Insert: ScreenInsert;
        Update: ScreenUpdate;
      };
      campaigns: {
        Row: Campaign;
        Insert: CampaignInsert;
        Update: CampaignUpdate;
      };
      bookings: {
        Row: Booking;
        Insert: BookingInsert;
        Update: BookingUpdate;
      };
      payments: {
        Row: Payment;
        Insert: PaymentInsert;
        Update: PaymentUpdate;
      };
      playback_logs: {
        Row: PlaybackLog;
        Insert: PlaybackLogInsert;
        Update: never; // Playback logs are immutable
      };
      payouts: {
        Row: Payout;
        Insert: PayoutInsert;
        Update: PayoutUpdate;
      };
      owner_bank_accounts: {
        Row: OwnerBankAccount;
        Insert: OwnerBankAccountInsert;
        Update: OwnerBankAccountUpdate;
      };
      admin_audit_logs: {
        Row: AdminAuditLog;
        Insert: AdminAuditLogInsert;
        Update: AdminAuditLogUpdate;
      };
      settings: {
        Row: Setting;
        Insert: SettingInsert;
        Update: SettingUpdate;
      };
      tickets: {
        Row: Ticket;
        Insert: TicketInsert;
        Update: TicketUpdate;
      };
      ticket_messages: {
        Row: TicketMessage;
        Insert: TicketMessageInsert;
        Update: TicketMessageUpdate;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      campaign_status: CampaignStatus;
      booking_status: BookingStatus;
      payment_status: PaymentStatus;
    };
  };
}
