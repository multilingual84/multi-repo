export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      affiliates: {
        Row: {
          accumulated_split_balance: number | null
          associated_user_id: string | null
          id: string
          influencer_code: string
          payout_hold_escrow_until: string | null
        }
        Insert: {
          accumulated_split_balance?: number | null
          associated_user_id?: string | null
          id?: string
          influencer_code: string
          payout_hold_escrow_until?: string | null
        }
        Update: {
          accumulated_split_balance?: number | null
          associated_user_id?: string | null
          id?: string
          influencer_code?: string
          payout_hold_escrow_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliates_associated_user_id_fkey"
            columns: ["associated_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_sandbox_accounts: {
        Row: {
          expires_at: string
          tier: string
          user_id: string
        }
        Insert: {
          expires_at?: string
          tier: string
          user_id: string
        }
        Update: {
          expires_at?: string
          tier?: string
          user_id?: string
        }
        Relationships: []
      }
      complaints: {
        Row: {
          contact: string
          created_at: string
          credential_handle: string | null
          free_until: string | null
          id: string
          issue_classification: string | null
          message: string
          reference_code: string
          refund_amount_cents: number | null
          refund_currency: string | null
          repair_attempt: string | null
          resolution_note: string | null
          resolved_at: string | null
          reviewed_at: string | null
          status: string
          waiver_claimed_at: string | null
          waiver_started_at: string | null
        }
        Insert: {
          contact: string
          created_at?: string
          credential_handle?: string | null
          free_until?: string | null
          id?: string
          issue_classification?: string | null
          message: string
          reference_code: string
          refund_amount_cents?: number | null
          refund_currency?: string | null
          repair_attempt?: string | null
          resolution_note?: string | null
          resolved_at?: string | null
          reviewed_at?: string | null
          status?: string
          waiver_claimed_at?: string | null
          waiver_started_at?: string | null
        }
        Update: {
          contact?: string
          created_at?: string
          credential_handle?: string | null
          free_until?: string | null
          id?: string
          issue_classification?: string | null
          message?: string
          reference_code?: string
          refund_amount_cents?: number | null
          refund_currency?: string | null
          repair_attempt?: string | null
          resolution_note?: string | null
          resolved_at?: string | null
          reviewed_at?: string | null
          status?: string
          waiver_claimed_at?: string | null
          waiver_started_at?: string | null
        }
        Relationships: []
      }
      device_qr_credentials: {
        Row: {
          created_at: string
          device_hash: string
          generation: number
          mailbox_user: string
          recovery_hash: string
          wallet: string
        }
        Insert: {
          created_at?: string
          device_hash: string
          generation?: number
          mailbox_user?: string
          recovery_hash: string
          wallet: string
        }
        Update: {
          created_at?: string
          device_hash?: string
          generation?: number
          mailbox_user?: string
          recovery_hash?: string
          wallet?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_qr_credentials_wallet_fkey"
            columns: ["wallet"]
            isOneToOne: true
            referencedRelation: "device_wallet_access"
            referencedColumns: ["credential_handle"]
          },
        ]
      }
      device_wallet_access: {
        Row: {
          created_at: string
          credential_handle: string
          failed_attempts: number
          locked_until: string | null
          pin_verifier: string
        }
        Insert: {
          created_at?: string
          credential_handle: string
          failed_attempts?: number
          locked_until?: string | null
          pin_verifier: string
        }
        Update: {
          created_at?: string
          credential_handle?: string
          failed_attempts?: number
          locked_until?: string | null
          pin_verifier?: string
        }
        Relationships: []
      }
      device_wallet_usage: {
        Row: {
          credential_handle: string
          last_tick: string | null
          share_bonus_expires_at: string | null
          used_seconds: number
          window_started: string
        }
        Insert: {
          credential_handle: string
          last_tick?: string | null
          share_bonus_expires_at?: string | null
          used_seconds?: number
          window_started?: string
        }
        Update: {
          credential_handle?: string
          last_tick?: string | null
          share_bonus_expires_at?: string | null
          used_seconds?: number
          window_started?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_wallet_usage_credential_handle_fkey"
            columns: ["credential_handle"]
            isOneToOne: true
            referencedRelation: "device_wallet_access"
            referencedColumns: ["credential_handle"]
          },
        ]
      }
      fleet_accounts: {
        Row: {
          created_at: string
          id: string
          owner_wallet: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_wallet: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_wallet?: string
        }
        Relationships: [
          {
            foreignKeyName: "fleet_accounts_owner_wallet_fkey"
            columns: ["owner_wallet"]
            isOneToOne: true
            referencedRelation: "device_wallet_access"
            referencedColumns: ["credential_handle"]
          },
        ]
      }
      fleet_group_messages: {
        Row: {
          body: string
          created_at: string
          expires_at: string
          fleet_id: string
          id: string
          sender_name: string
          sender_wallet: string
        }
        Insert: {
          body: string
          created_at?: string
          expires_at?: string
          fleet_id: string
          id?: string
          sender_name: string
          sender_wallet: string
        }
        Update: {
          body?: string
          created_at?: string
          expires_at?: string
          fleet_id?: string
          id?: string
          sender_name?: string
          sender_wallet?: string
        }
        Relationships: [
          {
            foreignKeyName: "fleet_group_messages_fleet_id_fkey"
            columns: ["fleet_id"]
            isOneToOne: false
            referencedRelation: "fleet_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      fleet_members: {
        Row: {
          approved: boolean
          daily_minutes: number
          fleet_id: string
          last_tick: string | null
          nickname: string
          used_seconds: number
          wallet: string
          window_started: string
        }
        Insert: {
          approved?: boolean
          daily_minutes?: number
          fleet_id: string
          last_tick?: string | null
          nickname: string
          used_seconds?: number
          wallet: string
          window_started?: string
        }
        Update: {
          approved?: boolean
          daily_minutes?: number
          fleet_id?: string
          last_tick?: string | null
          nickname?: string
          used_seconds?: number
          wallet?: string
          window_started?: string
        }
        Relationships: [
          {
            foreignKeyName: "fleet_members_fleet_id_fkey"
            columns: ["fleet_id"]
            isOneToOne: false
            referencedRelation: "fleet_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fleet_members_wallet_fkey"
            columns: ["wallet"]
            isOneToOne: true
            referencedRelation: "device_wallet_access"
            referencedColumns: ["credential_handle"]
          },
        ]
      }
      pass_reminders: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          pass_id: string
          reminded_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          pass_id: string
          reminded_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          pass_id?: string
          reminded_at?: string | null
        }
        Relationships: []
      }
      premium_voice_accounts: {
        Row: {
          available_characters: number
          blocked_reason: string | null
          created_at: string
          minute_billing_started_at: string
          purchased_characters: number
          used_characters: number
          wallet: string
        }
        Insert: {
          available_characters?: number
          blocked_reason?: string | null
          created_at?: string
          minute_billing_started_at?: string
          purchased_characters?: number
          used_characters?: number
          wallet: string
        }
        Update: {
          available_characters?: number
          blocked_reason?: string | null
          created_at?: string
          minute_billing_started_at?: string
          purchased_characters?: number
          used_characters?: number
          wallet?: string
        }
        Relationships: []
      }
      premium_voice_credits: {
        Row: {
          cents: number
          characters: number
          checkout_id: string
          created_at: string
          wallet: string
        }
        Insert: {
          cents: number
          characters: number
          checkout_id: string
          created_at?: string
          wallet: string
        }
        Update: {
          cents?: number
          characters?: number
          checkout_id?: string
          created_at?: string
          wallet?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_voice_credits_wallet_fkey"
            columns: ["wallet"]
            isOneToOne: false
            referencedRelation: "premium_voice_accounts"
            referencedColumns: ["wallet"]
          },
        ]
      }
      premium_voice_funding: {
        Row: {
          amount_cents: number
          consent_at: string | null
          customer_id: string
          enabled: boolean
          livemode: boolean
          monthly_limit_cents: number
          setup_id: string | null
          wallet: string
        }
        Insert: {
          amount_cents?: number
          consent_at?: string | null
          customer_id: string
          enabled?: boolean
          livemode: boolean
          monthly_limit_cents?: number
          setup_id?: string | null
          wallet: string
        }
        Update: {
          amount_cents?: number
          consent_at?: string | null
          customer_id?: string
          enabled?: boolean
          livemode?: boolean
          monthly_limit_cents?: number
          setup_id?: string | null
          wallet?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_voice_funding_wallet_fkey"
            columns: ["wallet"]
            isOneToOne: false
            referencedRelation: "device_wallet_access"
            referencedColumns: ["credential_handle"]
          },
        ]
      }
      premium_voice_funding_attempts: {
        Row: {
          cents: number
          created_at: string
          id: string
          livemode: boolean
          payment_intent: string | null
          state: string
          wallet: string
        }
        Insert: {
          cents: number
          created_at?: string
          id?: string
          livemode: boolean
          payment_intent?: string | null
          state?: string
          wallet: string
        }
        Update: {
          cents?: number
          created_at?: string
          id?: string
          livemode?: boolean
          payment_intent?: string | null
          state?: string
          wallet?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_voice_funding_attempts_wallet_livemode_fkey"
            columns: ["wallet", "livemode"]
            isOneToOne: false
            referencedRelation: "premium_voice_funding"
            referencedColumns: ["wallet", "livemode"]
          },
        ]
      }
      premium_voice_minute_usage: {
        Row: {
          created_at: string
          id: string
          milliseconds: number
          session_id: string
          units: number
          wallet: string
        }
        Insert: {
          created_at?: string
          id?: string
          milliseconds: number
          session_id: string
          units: number
          wallet: string
        }
        Update: {
          created_at?: string
          id?: string
          milliseconds?: number
          session_id?: string
          units?: number
          wallet?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_voice_minute_usage_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "premium_voice_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "premium_voice_minute_usage_wallet_fkey"
            columns: ["wallet"]
            isOneToOne: false
            referencedRelation: "premium_voice_accounts"
            referencedColumns: ["wallet"]
          },
        ]
      }
      premium_voice_requests: {
        Row: {
          billing_basis: string
          characters: number
          created_at: string
          id: string
          session_id: string
          settled_at: string | null
          state: string
          wallet: string
        }
        Insert: {
          billing_basis?: string
          characters: number
          created_at?: string
          id: string
          session_id: string
          settled_at?: string | null
          state?: string
          wallet: string
        }
        Update: {
          billing_basis?: string
          characters?: number
          created_at?: string
          id?: string
          session_id?: string
          settled_at?: string | null
          state?: string
          wallet?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_voice_requests_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "premium_voice_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "premium_voice_requests_wallet_fkey"
            columns: ["wallet"]
            isOneToOne: false
            referencedRelation: "premium_voice_accounts"
            referencedColumns: ["wallet"]
          },
        ]
      }
      premium_voice_sandbox_credits: {
        Row: {
          cents: number
          characters: number
          checkout_id: string
          created_at: string
          wallet: string
        }
        Insert: {
          cents: number
          characters: number
          checkout_id: string
          created_at?: string
          wallet: string
        }
        Update: {
          cents?: number
          characters?: number
          checkout_id?: string
          created_at?: string
          wallet?: string
        }
        Relationships: []
      }
      premium_voice_sessions: {
        Row: {
          ended_at: string | null
          id: string
          last_activity_at: string
          metered_at: string
          minute_billing: boolean
          started_at: string
          wallet: string
        }
        Insert: {
          ended_at?: string | null
          id?: string
          last_activity_at?: string
          metered_at?: string
          minute_billing?: boolean
          started_at?: string
          wallet: string
        }
        Update: {
          ended_at?: string | null
          id?: string
          last_activity_at?: string
          metered_at?: string
          minute_billing?: boolean
          started_at?: string
          wallet?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_voice_sessions_wallet_fkey"
            columns: ["wallet"]
            isOneToOne: false
            referencedRelation: "premium_voice_accounts"
            referencedColumns: ["wallet"]
          },
        ]
      }
      private_mailboxes: {
        Row: {
          created_at: string
          mailbox_id: string
          nickname: string
          public_key: string
          trial_started_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          mailbox_id?: string
          nickname?: string
          public_key: string
          trial_started_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          mailbox_id?: string
          nickname?: string
          public_key?: string
          trial_started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      private_message_blocks: {
        Row: {
          blocked_id: string
          user_id: string
        }
        Insert: {
          blocked_id: string
          user_id: string
        }
        Update: {
          blocked_id?: string
          user_id?: string
        }
        Relationships: []
      }
      private_message_delivery_status: {
        Row: {
          delivered_at: string
          expires_at: string
          message_id: string
          received_at: string | null
          recipient_id: string
          replied_at: string | null
          sender_id: string
        }
        Insert: {
          delivered_at?: string
          expires_at?: string
          message_id: string
          received_at?: string | null
          recipient_id: string
          replied_at?: string | null
          sender_id: string
        }
        Update: {
          delivered_at?: string
          expires_at?: string
          message_id?: string
          received_at?: string | null
          recipient_id?: string
          replied_at?: string | null
          sender_id?: string
        }
        Relationships: []
      }
      private_message_envelopes: {
        Row: {
          ciphertext: string
          created_at: string
          expires_at: string
          id: string
          kind: string
          nonce: string
          recipient_id: string
          sender_id: string
          sender_key: string
        }
        Insert: {
          ciphertext: string
          created_at?: string
          expires_at?: string
          id?: string
          kind?: string
          nonce: string
          recipient_id: string
          sender_id: string
          sender_key: string
        }
        Update: {
          ciphertext?: string
          created_at?: string
          expires_at?: string
          id?: string
          kind?: string
          nonce?: string
          recipient_id?: string
          sender_id?: string
          sender_key?: string
        }
        Relationships: []
      }
      private_message_plans: {
        Row: {
          paid_until: string | null
          seat_limit: number
          stripe_subscription_id: string | null
          user_id: string
        }
        Insert: {
          paid_until?: string | null
          seat_limit?: number
          stripe_subscription_id?: string | null
          user_id: string
        }
        Update: {
          paid_until?: string | null
          seat_limit?: number
          stripe_subscription_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      private_message_reply_access: {
        Row: {
          paid_sender_id: string
          recipient_id: string
        }
        Insert: {
          paid_sender_id: string
          recipient_id: string
        }
        Update: {
          paid_sender_id?: string
          recipient_id?: string
        }
        Relationships: []
      }
      private_message_send_limits: {
        Row: {
          send_count: number
          user_id: string
          window_started: string
        }
        Insert: {
          send_count?: number
          user_id: string
          window_started?: string
        }
        Update: {
          send_count?: number
          user_id?: string
          window_started?: string
        }
        Relationships: []
      }
      public_audio_broadcasts: {
        Row: {
          connected_ids: string[]
          created_at: string
          ended_at: string | null
          expires_at: string
          id: string
          last_phrase_at: string | null
          last_seen: string
          phrase_count: number
          wallet: string
        }
        Insert: {
          connected_ids?: string[]
          created_at?: string
          ended_at?: string | null
          expires_at: string
          id?: string
          last_phrase_at?: string | null
          last_seen?: string
          phrase_count?: number
          wallet: string
        }
        Update: {
          connected_ids?: string[]
          created_at?: string
          ended_at?: string | null
          expires_at?: string
          id?: string
          last_phrase_at?: string | null
          last_seen?: string
          phrase_count?: number
          wallet?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_audio_broadcasts_wallet_fkey"
            columns: ["wallet"]
            isOneToOne: false
            referencedRelation: "device_wallet_access"
            referencedColumns: ["credential_handle"]
          },
        ]
      }
      public_audio_listeners: {
        Row: {
          broadcast_id: string
          id: string
          joined_at: string
          language: string
          last_seen: string
          token_hash: string
        }
        Insert: {
          broadcast_id: string
          id?: string
          joined_at?: string
          language?: string
          last_seen?: string
          token_hash: string
        }
        Update: {
          broadcast_id?: string
          id?: string
          joined_at?: string
          language?: string
          last_seen?: string
          token_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_audio_listeners_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "public_audio_broadcasts"
            referencedColumns: ["id"]
          },
        ]
      }
      public_audio_signals: {
        Row: {
          broadcast_id: string
          created_at: string
          id: number
          listener_id: string
          payload: Json
          to_host: boolean
        }
        Insert: {
          broadcast_id: string
          created_at?: string
          id?: never
          listener_id: string
          payload: Json
          to_host: boolean
        }
        Update: {
          broadcast_id?: string
          created_at?: string
          id?: never
          listener_id?: string
          payload?: Json
          to_host?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "public_audio_signals_broadcast_id_fkey"
            columns: ["broadcast_id"]
            isOneToOne: false
            referencedRelation: "public_audio_broadcasts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_audio_signals_listener_id_fkey"
            columns: ["listener_id"]
            isOneToOne: false
            referencedRelation: "public_audio_listeners"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_commissions: {
        Row: {
          charge_id: string
          created_at: string
          currency: string
          eligible_at: string
          fee_minor: number
          id: string
          invoice_id: string
          lease_until: string | null
          livemode: boolean
          next_attempt: string
          partner_id: string
          reversed_minor: number
          share_minor: number
          status: string
          tier_minor: number
          transfer_id: string | null
          transferred_minor: number
          updated_at: string
        }
        Insert: {
          charge_id: string
          created_at?: string
          currency: string
          eligible_at?: string
          fee_minor?: number
          id?: string
          invoice_id: string
          lease_until?: string | null
          livemode: boolean
          next_attempt?: string
          partner_id: string
          reversed_minor?: number
          share_minor: number
          status?: string
          tier_minor: number
          transfer_id?: string | null
          transferred_minor?: number
          updated_at?: string
        }
        Update: {
          charge_id?: string
          created_at?: string
          currency?: string
          eligible_at?: string
          fee_minor?: number
          id?: string
          invoice_id?: string
          lease_until?: string | null
          livemode?: boolean
          next_attempt?: string
          partner_id?: string
          reversed_minor?: number
          share_minor?: number
          status?: string
          tier_minor?: number
          transfer_id?: string | null
          transferred_minor?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_commissions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "referral_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_partner_mode"
            columns: ["partner_id", "livemode"]
            isOneToOne: false
            referencedRelation: "referral_partners"
            referencedColumns: ["id", "livemode"]
          },
        ]
      }
      referral_partners: {
        Row: {
          code: string
          contact_email: string
          country: string
          created_at: string
          id: string
          livemode: boolean
          stripe_account: string | null
          wallet: string
        }
        Insert: {
          code: string
          contact_email: string
          country: string
          created_at?: string
          id?: string
          livemode: boolean
          stripe_account?: string | null
          wallet: string
        }
        Update: {
          code?: string
          contact_email?: string
          country?: string
          created_at?: string
          id?: string
          livemode?: boolean
          stripe_account?: string | null
          wallet?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_partners_wallet_fkey"
            columns: ["wallet"]
            isOneToOne: false
            referencedRelation: "device_wallet_access"
            referencedColumns: ["credential_handle"]
          },
        ]
      }
      sessions: {
        Row: {
          active_channel_type: string
          created_at: string | null
          id: string
          room_token: string
          user_id: string | null
        }
        Insert: {
          active_channel_type: string
          created_at?: string | null
          id?: string
          room_token: string
          user_id?: string | null
        }
        Update: {
          active_channel_type?: string
          created_at?: string | null
          id?: string
          room_token?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      site_suggestions: {
        Row: {
          created_at: string
          device: string | null
          digested_at: string | null
          id: string
          locale: string | null
          message: string
          page: string | null
        }
        Insert: {
          created_at?: string
          device?: string | null
          digested_at?: string | null
          id?: string
          locale?: string | null
          message: string
          page?: string | null
        }
        Update: {
          created_at?: string
          device?: string | null
          digested_at?: string | null
          id?: string
          locale?: string | null
          message?: string
          page?: string | null
        }
        Relationships: []
      }
      stager_accounts: {
        Row: {
          created_at: string
          credits: number
          free_downloads_left: number
          free_trial_used: boolean
          referral_code: string
          referred_by_code: string | null
          stripe_customer_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          credits?: number
          free_downloads_left?: number
          free_trial_used?: boolean
          referral_code: string
          referred_by_code?: string | null
          stripe_customer_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          credits?: number
          free_downloads_left?: number
          free_trial_used?: boolean
          referral_code?: string
          referred_by_code?: string | null
          stripe_customer_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      stager_commissions: {
        Row: {
          base_cents: number
          commission_cents: number
          created_at: string
          id: string
          livemode: boolean
          paid_at: string | null
          payable_after: string
          purchase_ref: string
          referrer_user_id: string
          status: string
        }
        Insert: {
          base_cents: number
          commission_cents: number
          created_at?: string
          id?: string
          livemode?: boolean
          paid_at?: string | null
          payable_after?: string
          purchase_ref: string
          referrer_user_id: string
          status?: string
        }
        Update: {
          base_cents?: number
          commission_cents?: number
          created_at?: string
          id?: string
          livemode?: boolean
          paid_at?: string | null
          payable_after?: string
          purchase_ref?: string
          referrer_user_id?: string
          status?: string
        }
        Relationships: []
      }
      stager_purchases: {
        Row: {
          amount_cents: number
          auto_pay: boolean
          created_at: string
          id: string
          livemode: boolean
          package_id: string
          pics: number
          purchase_ref: string
          referral_code: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          auto_pay?: boolean
          created_at?: string
          id?: string
          livemode?: boolean
          package_id: string
          pics: number
          purchase_ref: string
          referral_code?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          auto_pay?: boolean
          created_at?: string
          id?: string
          livemode?: boolean
          package_id?: string
          pics?: number
          purchase_ref?: string
          referral_code?: string | null
          user_id?: string
        }
        Relationships: []
      }
      stripe_events: {
        Row: {
          id: string
          processed_at: string
          type: string
        }
        Insert: {
          id: string
          processed_at?: string
          type: string
        }
        Update: {
          id?: string
          processed_at?: string
          type?: string
        }
        Relationships: []
      }
      stripe_purchase_credits: {
        Row: {
          created_at: string
          credit_usd: number
          event_id: string
          invoice_id: string
          referral_code: string
        }
        Insert: {
          created_at?: string
          credit_usd: number
          event_id: string
          invoice_id: string
          referral_code: string
        }
        Update: {
          created_at?: string
          credit_usd?: number
          event_id?: string
          invoice_id?: string
          referral_code?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          credential_handle: string
          free_lifetime_activated: boolean | null
          id: string
          is_subscription_active: boolean | null
          stripe_customer_id: string | null
          stripe_state_created: number
          stripe_subscription_id: string | null
          subscription_renews_at: string | null
          subscription_tier: string | null
          trial_expires_at: string | null
          vocal_token_expires_at: string | null
        }
        Insert: {
          created_at?: string | null
          credential_handle: string
          free_lifetime_activated?: boolean | null
          id?: string
          is_subscription_active?: boolean | null
          stripe_customer_id?: string | null
          stripe_state_created?: number
          stripe_subscription_id?: string | null
          subscription_renews_at?: string | null
          subscription_tier?: string | null
          trial_expires_at?: string | null
          vocal_token_expires_at?: string | null
        }
        Update: {
          created_at?: string | null
          credential_handle?: string
          free_lifetime_activated?: boolean | null
          id?: string
          is_subscription_active?: boolean | null
          stripe_customer_id?: string | null
          stripe_state_created?: number
          stripe_subscription_id?: string | null
          subscription_renews_at?: string | null
          subscription_tier?: string | null
          trial_expires_at?: string | null
          vocal_token_expires_at?: string | null
        }
        Relationships: []
      }
      wallet_push_invites: {
        Row: {
          created_at: string
          id: string
          recipient: string
          sender: string
          window_key: number
        }
        Insert: {
          created_at?: string
          id?: string
          recipient: string
          sender: string
          window_key: number
        }
        Update: {
          created_at?: string
          id?: string
          recipient?: string
          sender?: string
          window_key?: number
        }
        Relationships: []
      }
      wallet_push_subscriptions: {
        Row: {
          created_at: string
          endpoint: string
          locale: string
          origin: string
          subscription: Json
          wallet: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          locale?: string
          origin: string
          subscription: Json
          wallet: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          locale?: string
          origin?: string
          subscription?: Json
          wallet?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      acknowledge_private_inbox: { Args: never; Returns: undefined }
      activate_qr_trial: { Args: { p_wallet: string }; Returns: string }
      apply_stripe_snapshot: {
        Args: {
          p_action: string
          p_active: boolean
          p_created: number
          p_credit: number
          p_customer: string
          p_event_id: string
          p_event_type: string
          p_expires: string
          p_handle: string
          p_invoice: string
          p_referral: string
          p_subscription: string
          p_tier: string
        }
        Returns: boolean
      }
      claim_qr_daily_bonus: { Args: { p_handle: string }; Returns: string }
      claim_referral_commissions: {
        Args: { p_live: boolean }
        Returns: {
          charge_id: string
          created_at: string
          currency: string
          eligible_at: string
          fee_minor: number
          id: string
          invoice_id: string
          lease_until: string | null
          livemode: boolean
          next_attempt: string
          partner_id: string
          reversed_minor: number
          share_minor: number
          status: string
          tier_minor: number
          transfer_id: string | null
          transferred_minor: number
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "referral_commissions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      claim_voice_funding: {
        Args: { p_live: boolean; p_wallet: string }
        Returns: {
          cents: number
          created_at: string
          id: string
          livemode: boolean
          payment_intent: string | null
          state: string
          wallet: string
        }[]
        SetofOptions: {
          from: "*"
          to: "premium_voice_funding_attempts"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      configure_fleet_member: {
        Args: {
          p_approved: boolean
          p_member: string
          p_minutes: number
          p_owner: string
          p_seats: number
        }
        Returns: undefined
      }
      consume_private_message: {
        Args: { message_id: string }
        Returns: {
          ciphertext: string
          kind: string
          nonce: string
          sender_key: string
        }[]
      }
      consume_qr_message: {
        Args: { p_message: string; p_user: string }
        Returns: {
          ciphertext: string
          kind: string
          nonce: string
          sender_key: string
        }[]
      }
      credit_premium_voice: {
        Args: { p_cents: number; p_checkout: string; p_wallet: string }
        Returns: number
      }
      credit_sandbox_voice: {
        Args: { p_cents: number; p_checkout: string; p_wallet: string }
        Returns: undefined
      }
      credit_voice_funding: {
        Args: {
          p_attempt: string
          p_cents: number
          p_customer: string
          p_payment: string
          p_wallet: string
        }
        Returns: undefined
      }
      enroll_qr_device: {
        Args: {
          p_device: string
          p_legacy_owned?: boolean
          p_recovery: string
          p_wallet: string
        }
        Returns: {
          generation: number
          mailbox_user: string
        }[]
      }
      join_public_audio: {
        Args: { p_broadcast: string; p_hash: string; p_language: string }
        Returns: string
      }
      list_private_reply_contacts: {
        Args: never
        Returns: {
          mailbox_id: string
          nickname: string
        }[]
      }
      lookup_private_mailbox: {
        Args: { address: string }
        Returns: {
          mailbox_id: string
          nickname: string
          public_key: string
        }[]
      }
      move_qr_device: {
        Args: { p_device: string; p_recovery: string; p_wallet: string }
        Returns: number
      }
      private_message_paid_until: {
        Args: { account_id: string }
        Returns: string
      }
      reserve_premium_voice: {
        Args: {
          p_characters: number
          p_request: string
          p_session: string
          p_wallet: string
        }
        Returns: undefined
      }
      reserve_premium_voice_minutes: {
        Args: {
          p_characters: number
          p_request: string
          p_session: string
          p_wallet: string
        }
        Returns: undefined
      }
      reserve_public_audio_phrase: {
        Args: { p_broadcast: string; p_wallet: string }
        Returns: boolean
      }
      sandbox_communication_tier: {
        Args: { account_id: string }
        Returns: string
      }
      send_private_message: {
        Args: {
          encrypted_text: string
          ephemeral_key: string
          message_kind?: string
          message_nonce: string
          recipient_mailbox: string
        }
        Returns: string
      }
      send_qr_message: {
        Args: {
          encrypted_text: string
          ephemeral_key: string
          message_kind?: string
          message_nonce: string
          p_user: string
          recipient_mailbox: string
        }
        Returns: string
      }
      settle_premium_voice: {
        Args: { p_request: string; p_state: string; p_wallet: string }
        Returns: undefined
      }
      settle_premium_voice_minutes: {
        Args: { p_request: string; p_state: string; p_wallet: string }
        Returns: undefined
      }
      stager_grant_purchase: {
        Args: {
          p_amount: number
          p_auto_pay: boolean
          p_livemode: boolean
          p_package: string
          p_pics: number
          p_ref: string
          p_referral: string
          p_user: string
        }
        Returns: boolean
      }
      stager_refund: {
        Args: { p_kind: string; p_user: string }
        Returns: undefined
      }
      stager_spend: { Args: { p_user: string }; Returns: string }
      start_premium_voice: { Args: { p_wallet: string }; Returns: string }
      start_premium_voice_minutes: {
        Args: { p_wallet: string }
        Returns: string
      }
      tick_device_wallet_usage: {
        Args: { p_handle: string }
        Returns: {
          resets_at: string
          used_seconds: number
        }[]
      }
      tick_fleet_usage: {
        Args: { p_wallet: string }
        Returns: {
          remaining_seconds: number
          resets_at: string
          used_seconds: number
        }[]
      }
      tick_premium_voice_minutes: {
        Args: { p_session: string; p_wallet: string }
        Returns: boolean
      }
      verify_device_wallet_pin: {
        Args: { p_handle: string; p_verifier: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
