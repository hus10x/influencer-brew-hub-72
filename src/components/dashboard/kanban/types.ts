export type CampaignStatus = "draft" | "active" | "completed";

export interface Campaign {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: CampaignStatus;
  created_at: string | null;
  updated_at: string | null;
}