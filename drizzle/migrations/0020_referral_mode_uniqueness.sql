ALTER TABLE public.referral_commissions DROP CONSTRAINT referral_commissions_invoice_id_key;
ALTER TABLE public.referral_commissions ADD CONSTRAINT referral_invoice_mode UNIQUE(invoice_id,livemode);
ALTER TABLE public.referral_partners ADD CONSTRAINT referral_partner_id_mode UNIQUE(id,livemode);
ALTER TABLE public.referral_commissions ADD CONSTRAINT referral_partner_mode FOREIGN KEY(partner_id,livemode) REFERENCES public.referral_partners(id,livemode);