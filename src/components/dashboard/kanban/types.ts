export type Campaign = {
  id: string;
  title: string;
  description: string | null;
  business_id: string;
  start_date: string;
  end_date: string;
  status: 'draft' | 'active' | 'completed';
  created_at: string | null;
  updated_at: string | null;
  collaborations?: Collaboration[];
};

export type Collaboration = {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  compensation: number;
  deadline: string;
  max_spots: number;
  filled_spots: number;
  status: string;
};

export interface KanbanColumnProps {
  status: string;
  campaigns: Campaign[];
  selectedCampaigns: Set<string>;
  onSelect: (campaignId: string) => void;
  onEdit: (campaignId: string) => void;
  selectionMode: boolean;
  windowWidth: number;
}