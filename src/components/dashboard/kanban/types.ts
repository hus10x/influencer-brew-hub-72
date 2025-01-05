export interface Campaign {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  status: CampaignStatus;
  business_id: string;
}

export type CampaignStatus = "draft" | "active" | "completed";