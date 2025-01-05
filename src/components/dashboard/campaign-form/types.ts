export interface Business {
  id: string;
  business_name: string;
}

export interface CampaignFormData {
  title: string;
  description?: string;
  business_id: string;
  start_date: string;
  end_date: string;
  status?: 'draft' | 'active';
}